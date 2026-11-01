import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import { QueryHistory } from "../../bindings/changeme/backend/service/historyservice";
import { formatDateTime } from "../utils/format";
import { useTheme } from "../theme";

const PERIODS = [
    { id: "1h", label: "1 час", hours: 1 },
    { id: "24h", label: "24 часа", hours: 24 },
    { id: "7d", label: "Неделя", hours: 24 * 7 },
];

export default function History({ notify }) {
    const [period, setPeriod] = useState("1h");
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            try {
                const hours = PERIODS.find((p) => p.id === period).hours;
                const to = new Date();
                const from = new Date(to.getTime() - hours * 3600 * 1000);
                const data = await QueryHistory(from.toISOString(), to.toISOString());
                if (!cancelled) setRows(data ?? []);
            } catch (e) {
                if (!cancelled) notify?.(`Не удалось загрузить историю: ${e}`, "error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [period]);

    const grid = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const tick = theme === "dark" ? "#94a3b8" : "#64748b";

    const labels = rows.map((r) => formatDateTime(r.CreatedAt ?? r.created_at));
    const cpu = rows.map((r) => r.CPUUsageAvg ?? r.cpu_usage_avg);
    const ram = rows.map((r) => r.RAMUsageAvg ?? r.ram_usage_avg);
    const netDown = rows.map((r) => r.NetDownloadBytes ?? r.net_download_bytes);
    const netUp = rows.map((r) => r.NetUploadBytes ?? r.net_upload_bytes);

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">История</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">агрегация по минутам из локальной БД</p>
                </div>
                <div className="flex gap-1 rounded-lg border border-slate-500/15 bg-white/50 p-1 dark:bg-white/[0.03]">
                    {PERIODS.map((p) => (
                        <button key={p.id} onClick={() => setPeriod(p.id)}
                            className={`rounded-md px-3 py-1.5 text-xs font-medium transition
                ${period === p.id ? "bg-white shadow-sm dark:bg-white/10" : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"}`}>
                            {p.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading && <div className="py-10 text-center text-slate-500">Загрузка…</div>}
            {!loading && rows.length === 0 && (
                <div className="py-10 text-center text-slate-500">
                    За выбранный период данных нет. Подождите, пока бэкенд накопит минуту.
                </div>
            )}

            {!loading && rows.length > 0 && (
                <div className="space-y-4">
                    <div className="rounded-2xl border border-slate-500/15 bg-white/60 p-4 dark:bg-white/[0.04]">
                        <h3 className="mb-3 text-sm font-semibold">CPU / RAM, %</h3>
                        <div className="h-72">
                            <Line data={{
                                labels,
                                datasets: [
                                    { label: "CPU", data: cpu, borderColor: "#60a5fa", backgroundColor: "rgba(96,165,250,0.12)", fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                                    { label: "RAM", data: ram, borderColor: "#e879f9", backgroundColor: "rgba(232,121,249,0.10)", fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                                ],
                            }} options={{
                                responsive: true, maintainAspectRatio: false,
                                scales: {
                                    x: { grid: { color: grid }, ticks: { color: tick, maxTicksLimit: 8 } },
                                    y: { min: 0, max: 100, grid: { color: grid }, ticks: { color: tick, callback: (v) => `${v}%` } },
                                },
                                plugins: { legend: { labels: { color: tick } } },
                            }} />
                        </div>
                    </div>

                    <div className="rounded-2xl border border-slate-500/15 bg-white/60 p-4 dark:bg-white/[0.04]">
                        <h3 className="mb-3 text-sm font-semibold">Сетевой трафик за минуту, МБ</h3>
                        <div className="h-64">
                            <Line data={{
                                labels,
                                datasets: [
                                    { label: "Download", data: netDown.map((b) => (b / (1 << 20)).toFixed(2)), borderColor: "#34d399", backgroundColor: "rgba(52,211,153,0.10)", fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                                    { label: "Upload", data: netUp.map((b) => (b / (1 << 20)).toFixed(2)), borderColor: "#f59e0b", backgroundColor: "rgba(245,158,11,0.10)", fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
                                ],
                            }} options={{
                                responsive: true, maintainAspectRatio: false,
                                scales: {
                                    x: { grid: { color: grid }, ticks: { color: tick, maxTicksLimit: 8 } },
                                    y: { grid: { color: grid }, ticks: { color: tick } },
                                },
                                plugins: { legend: { labels: { color: tick } } },
                            }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}