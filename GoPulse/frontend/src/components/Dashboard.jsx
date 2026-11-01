import MetricCard from "./MetricCard";
import LiveChart from "./LiveChart";
import StatusBadge from "./StatusBadge";
import {
    formatGB, formatBps, formatPercent, formatMHz, formatTime, toneForPercent,
} from "../utils/format";

export default function Dashboard({ metrics, connected, error, history }) {
    return (
        <div>
            <div className="mb-5 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold">Мониторинг в реальном времени</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">обновление раз в секунду</p>
                </div>
                <div className="flex items-center gap-3">
                    {metrics && (
                        <span className="text-xs tabular text-slate-500 dark:text-slate-400">
                            обновлено {formatTime(metrics.timestamp)}
                        </span>
                    )}
                    <StatusBadge connected={connected} />
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-500">
                    Ошибка подписки: {error}
                </div>
            )}

            {!metrics && !error && (
                <div className="py-16 text-center text-slate-500 dark:text-slate-400">
                    Ждём первое событие <code className="rounded bg-slate-500/10 px-1.5 py-0.5">metrics_update</code>…
                </div>
            )}

            {metrics && (
                <>
                    <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <MetricCard 
                        // icon={<CpuIcon />}
                         title="CPU"
                            primary={formatPercent(metrics.cpu_percent)}
                            progress={metrics.cpu_percent}
                            tone={toneForPercent(metrics.cpu_percent)}
                            secondary={formatMHz(metrics.cpu_freq_mhz)} />
                        <MetricCard 
                        // icon={<RamIcon />}
                         title="RAM"
                            primary={formatPercent(metrics.ram_percent)}
                            progress={metrics.ram_percent}
                            tone={toneForPercent(metrics.ram_percent)}
                            secondary={`${formatGB(metrics.ram_used_bytes)} / ${formatGB(metrics.ram_total_bytes)} GB`} />
                        <MetricCard 
                        // icon={<DiskIcon />}
                         title="Disk I/O"
                            primary={<span className="inline-flex items-center gap-1"> {formatBps(metrics.disk_read_bps)}</span>}
                            secondary={<span className="inline-flex items-center gap-1"> {formatBps(metrics.disk_write_bps)}</span>} />
                        <MetricCard 
                        // icon={<NetIcon />}
                         title="Network"
                            primary={<span className="inline-flex items-center gap-1"> {formatBps(metrics.net_recv_bps)}</span>}
                            secondary={<span className="inline-flex items-center gap-1"> {formatBps(metrics.net_sent_bps)}</span>} />
                    </div>
                    <LiveChart labels={history.labels} cpu={history.cpu} ram={history.ram} />
                </>
            )}
        </div>
    );
}