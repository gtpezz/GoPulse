package db

import (
	"changeme/backend/model"
	"context"
	"database/sql"
	"fmt"
	"time"

	_ "modernc.org/sqlite"
)

type Database struct {
	db *sql.DB
}

func Open(path string) (*Database, error) {
	dsn := path + "?_pragma=foreign_keys(1)&_pragma=busy_timeout(5000)"
	sqlDB, err := sql.Open("sqlite", dsn)
	if err != nil {
		return nil, fmt.Errorf("sql.Open: %w", err)
	}

	d := NewDatabase(sqlDB)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := d.InitDB(ctx); err != nil {
		sqlDB.Close()
		return nil, err
	}
	if err := d.CreateTable(ctx); err != nil {
		sqlDB.Close()
		return nil, err
	}
	return d, nil
}

func NewDatabase(db *sql.DB) *Database {
	return &Database{db: db}
}

func (d *Database) Close() error {
	return d.db.Close()
}

func (d *Database) InitDB(ctx context.Context) error {
	if err := d.db.PingContext(ctx); err != nil {
		return fmt.Errorf("ping db: %w", err)
	}

	d.db.SetMaxOpenConns(1)
	d.db.SetMaxIdleConns(1)
	d.db.SetConnMaxLifetime(0)
	d.db.SetConnMaxIdleTime(5 * time.Minute)

	return nil
}

func (d *Database) CreateTable(ctx context.Context) error {
	stmts := []string{
		`CREATE TABLE IF NOT EXISTS system_history (
			id                  INTEGER PRIMARY KEY AUTOINCREMENT,
			created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
			cpu_usage_avg       REAL,
			ram_usage_avg       REAL,
			net_download_bytes  INTEGER,
			net_upload_bytes    INTEGER
		);`,
		`CREATE INDEX IF NOT EXISTS idx_system_history_created_at
			ON system_history(created_at);`,
	}

	for _, stmt := range stmts {
		if _, err := d.db.ExecContext(ctx, stmt); err != nil {
			return fmt.Errorf("create table: %w", err)
		}
	}
	return nil
}

func (d *Database) InsertHistory(ctx context.Context, row model.HistoryRow) error {
	_, err := d.db.ExecContext(ctx,
		`INSERT INTO system_history
			(created_at, cpu_usage_avg, ram_usage_avg, net_download_bytes, net_upload_bytes)
		 VALUES (?, ?, ?, ?, ?)`,
		row.CreatedAt.UTC(), row.CPUUsageAvg, row.RAMUsageAvg,
		row.NetDownloadBytes, row.NetUploadBytes,
	)
	if err != nil {
		return fmt.Errorf("insert history: %w", err)
	}
	return nil
}

func (d *Database) QueryHistory(ctx context.Context, from, to time.Time) ([]model.HistoryRow, error) {
	rows, err := d.db.QueryContext(ctx,
		`SELECT created_at, cpu_usage_avg, ram_usage_avg, net_download_bytes, net_upload_bytes
		   FROM system_history
		  WHERE created_at >= ? AND created_at < ?
		  ORDER BY created_at ASC`,
		from.UTC(), to.UTC(),
	)
	if err != nil {
		return nil, fmt.Errorf("query history: %w", err)
	}
	defer rows.Close()

	var out []model.HistoryRow
	for rows.Next() {
		var r model.HistoryRow
		if err := rows.Scan(
			&r.CreatedAt,
			&r.CPUUsageAvg,
			&r.RAMUsageAvg,
			&r.NetDownloadBytes,
			&r.NetUploadBytes,
		); err != nil {
			return nil, fmt.Errorf("scan history: %w", err)
		}
		r.CreatedAt = r.CreatedAt.UTC()
		out = append(out, r)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows: %w", err)
	}
	return out, nil
}
