package service

import (
	"github.com/shirou/gopsutil/v4/process"
)

type ProcessInfo struct {
	PID      int32   `json:"pid"`
	Name     string  `json:"name"`
	CPU      float64 `json:"cpu"`
	MemoryMB float64 `json:"memory_mb"`
}

type ProcessService struct{}

func (s *ProcessService) GetProcesses() ([]ProcessInfo, error) {
	procs, err := process.Processes()
	if err != nil {
		return nil, err
	}
	out := make([]ProcessInfo, 0, len(procs))
	for _, p := range procs {
		name, _ := p.Name()
		cpu, _ := p.CPUPercent()
		mem, _ := p.MemoryInfo()
		var memMB float64
		if mem != nil {
			memMB = float64(mem.RSS) / (1 << 20)
		}
		out = append(out, ProcessInfo{
			PID: p.Pid, Name: name, CPU: cpu, MemoryMB: memMB,
		})
	}
	return out, nil
}

func (s *ProcessService) KillProcess(pid int32) error {
	p, err := process.NewProcess(pid)
	if err != nil {
		return err
	}
	return p.Kill()
}
