package monitor

import (
	"changeme/backend/model"
	"context"
	"fmt"

	"github.com/shirou/gopsutil/v4/cpu"
	"github.com/shirou/gopsutil/v4/disk"
	"github.com/shirou/gopsutil/v4/mem"
	"github.com/shirou/gopsutil/v4/net"
)

type Collector struct {
	prevDiskRead  uint64
	prevDiskWrite uint64
	prevNetRecv   uint64
	prevNetSent   uint64
	first         bool
}

func New() *Collector {
	return &Collector{
		first: true,
	}
}

func (c *Collector) Collect(ctx context.Context) (model.Sample, error) {
	var s model.Sample

	pcts, err := cpu.PercentWithContext(ctx, 0, false)
	if err != nil {
		return s, fmt.Errorf("cpu percent: %w", err)
	}
	if len(pcts) > 0 {
		s.CPUPercent = pcts[0]
	}

	if freqs, err := cpu.InfoWithContext(ctx); err == nil && len(freqs) > 0 {
		s.CPUFreqMHz = freqs[0].Mhz
	}

	vm, err := mem.VirtualMemoryWithContext(ctx)
	if err != nil {
		return s, fmt.Errorf("mem: %w", err)
	}
	s.RAMPercent = vm.UsedPercent
	s.RAMUsedBytes = vm.Used
	s.RAMTotalBytes = vm.Total

	if io, err := disk.IOCountersWithContext(ctx); err == nil {
		var read, write uint64

		for _, d := range io {
			read += d.ReadBytes
			write += d.WriteBytes
		}
		if !c.first {
			if read >= c.prevDiskRead {
				s.DiskReadBps = read - c.prevDiskRead
			}
			if write >= c.prevDiskWrite {
				s.DiskWriteBps = write - c.prevDiskWrite
			}
		}

		c.prevDiskRead, c.prevDiskWrite = read, write
	}

	if ios, err := net.IOCountersWithContext(ctx, false); err == nil {
		var recv, sent uint64
		for _, io := range ios {
			recv += io.BytesRecv
			sent += io.BytesSent
		}
		if !c.first {
			if recv >= c.prevNetRecv {
				s.NetRecvBps = recv - c.prevNetRecv
			}
			if sent >= c.prevNetSent {
				s.NetSentBps = sent - c.prevNetSent
			}
		}
		c.prevNetRecv, c.prevNetSent = recv, sent
	}

	c.first = false
	return s, nil
}

type DiskUsage struct {
	Mountpoint string  `json:"mountpoint"`
	TotalGB    float64 `json:"total_gb"`
	FreeGB     float64 `json:"free_gb"`
	UsedPct    float64 `json:"used_pct"`
}

func DiskUsages(ctx context.Context) ([]DiskUsage, error) {
	parts, err := disk.PartitionsWithContext(ctx, false)
	if err != nil {
		return nil, err
	}
	out := make([]DiskUsage, 0, len(parts))
	for _, p := range parts {
		u, err := disk.UsageWithContext(ctx, p.Mountpoint)
		if err != nil {
			continue
		}
		out = append(out, DiskUsage{
			Mountpoint: p.Mountpoint,
			TotalGB:    float64(u.Total) / (1 << 30),
			FreeGB:     float64(u.Free) / (1 << 30),
			UsedPct:    u.UsedPercent,
		})
	}
	return out, nil
}
