import { Line } from "react-chartjs-2";
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Filler, Tooltip, Legend,
} from "chart.js";
import { useTheme } from "../theme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function LiveChart({ labels, cpu, ram }) {
    const { theme } = useTheme();
    const grid = theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const tick = theme === "dark" ? "#94a3b8" : "#64748b";

    return (
        <div className="rounded-2xl border border-slate-500/15 bg-white/60 p-4 dark:bg-white/[0.04]">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold">Нагрузка CPU / RAM — 60 сек</h3>
                <div className="flex gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-blue-400" />CPU</span>
                    <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-fuchsia-400" />RAM</span>
                </div>
            </div>
            <div className="h-64">
                <Line
                    data={{
                        labels,
                        datasets: [
                            { label: "CPU %", data: cpu, borderColor: "#60a5fa", backgroundColor: "rgba(96,165,250,0.15)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
                            { label: "RAM %", data: ram, borderColor: "#e879f9", backgroundColor: "rgba(232,121,249,0.12)", fill: true, tension: 0.35, pointRadius: 0, borderWidth: 2 },
                        ],
                    }}
                    options={{
                        responsive: true, maintainAspectRatio: false, animation: false,
                        scales: {
                            x: { grid: { color: grid }, ticks: { color: tick, maxTicksLimit: 6 } },
                            y: { min: 0, max: 100, grid: { color: grid }, ticks: { color: tick, callback: (v) => `${v}%` } },
                        },
                        plugins: { legend: { display: false } },
                    }}
                />
            </div>
        </div>
    );
}