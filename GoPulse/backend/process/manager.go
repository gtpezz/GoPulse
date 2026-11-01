package process

import (
	"changeme/backend/model"
	"context"
	"fmt"
	"log/slog"
	"sync"
	"time"
)

const (
	tickInterval     = 1 * time.Second
	historyWindow    = 1 * time.Minute
	historyBufferCap = int(historyWindow / tickInterval)
)

type Collector interface {
	Collect(ctx context.Context) (model.Sample, error)
}

type Storage interface {
	InsertHistory(ctx context.Context, row model.HistoryRow) error
}

type Emitter interface {
	Emit(name string, data ...any)
}

type Manager struct {
	collector Collector
	storage   Storage
	emitter   Emitter
	log       *slog.Logger

	mu  sync.Mutex
	buf []model.Sample
}

func New(c Collector, s Storage, e Emitter, log *slog.Logger) *Manager {
	return &Manager{
		collector: c,
		storage:   s,
		emitter:   e,
		log:       log,
		buf:       make([]model.Sample, 0, historyBufferCap),
	}
}

func (m *Manager) Run(ctx context.Context) error {
	ticker := time.NewTicker(tickInterval)
	defer ticker.Stop()

	m.log.Info("manager started", "interval", tickInterval)

	for {
		select {
		case <-ctx.Done():
			m.log.Info("manager stopping")
			m.flush(ctx)
			return ctx.Err()
		case <-ticker.C:
			if err := m.tick(ctx); err != nil {
				m.log.Warn("tick failed", "err", err)
			}
		}
	}
}

func (m *Manager) tick(ctx context.Context) error {
	collectCtx, cancel := context.WithTimeout(ctx, tickInterval)
	defer cancel()

	sample, err := m.collector.Collect(collectCtx)
	if err != nil {
		return fmt.Errorf("collect: %w", err)
	}
	sample.Timestamp = time.Now()

	m.emitter.Emit("metrics_update", sample)

	m.mu.Lock()
	m.buf = append(m.buf, sample)
	full := len(m.buf) >= historyBufferCap
	var row model.HistoryRow
	if full {
		row = average(m.buf)
		m.buf = m.buf[:0]
	}
	m.mu.Unlock()

	if full {
		writeCtx, cancelWrite := context.WithTimeout(ctx, 5*time.Second)
		defer cancelWrite()
		if err := m.storage.InsertHistory(writeCtx, row); err != nil {
			return fmt.Errorf("insert history: %w", err)
		}
		m.log.Debug("history row written",
			"cpu_avg", row.CPUUsageAvg,
			"ram_avg", row.RAMUsageAvg,
			"net_down", row.NetDownloadBytes,
			"net_up", row.NetUploadBytes)
	}
	return nil
}

func (m *Manager) flush(ctx context.Context) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if len(m.buf) == 0 {
		return
	}
	row := average(m.buf)
	m.buf = m.buf[:0]

	writeCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()
	if err := m.storage.InsertHistory(writeCtx, row); err != nil {
		m.log.Warn("flush failed", "err", err)
	}
}

func average(samples []model.Sample) model.HistoryRow {
	var (
		cpuSum, ramSum float64
		netDown, netUp uint64
	)
	for _, s := range samples {
		cpuSum += s.CPUPercent
		ramSum += s.RAMPercent
		netDown += s.NetRecvBps
		netUp += s.NetSentBps
	}
	n := float64(len(samples))
	return model.HistoryRow{
		CreatedAt:        time.Now(),
		CPUUsageAvg:      cpuSum / n,
		RAMUsageAvg:      ramSum / n,
		NetDownloadBytes: netDown,
		NetUploadBytes:   netUp,
	}
}
