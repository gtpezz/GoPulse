package service

import (
	"changeme/backend/db"
	"changeme/backend/model"
	"context"
	"time"
)

type HistoryService struct {
	DB *db.Database
}

func (s *HistoryService) QueryHistory(from, to time.Time) ([]model.HistoryRow, error) {
	return s.DB.QueryHistory(context.Background(), from, to)
}
