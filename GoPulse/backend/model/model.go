package model

import "time"

type Sample struct {
	Timestamp     time.Time `json:"timestamp"`
	CPUPercent    float64   `json:"cpu_percent"`
	CPUFreqMHz    float64   `json:"cpu_freq_mhz"`
	RAMPercent    float64   `json:"ram_percent"`
	RAMUsedBytes  uint64    `json:"ram_used_bytes"`
	RAMTotalBytes uint64    `json:"ram_total_bytes"`
	DiskReadBps   uint64    `json:"disk_read_bps"`
	DiskWriteBps  uint64    `json:"disk_write_bps"`
	NetRecvBps    uint64    `json:"net_recv_bps"`
	NetSentBps    uint64    `json:"net_sent_bps"`
}

type HistoryRow struct {
	CreatedAt        time.Time
	CPUUsageAvg      float64
	RAMUsageAvg      float64
	NetDownloadBytes uint64
	NetUploadBytes   uint64
}
