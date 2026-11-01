import ProgressBar from "./ProgressBar";

export default function MetricCard({ icon, title, primary, secondary, progress, tone = "neutral" }) {
    return (
        <div className="rounded-2xl border border-slate-500/15 bg-white/60 p-4 transition hover:-translate-y-0.5 hover:border-slate-500/25 dark:bg-white/[0.04]">
            <div className="mb-2.5 flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <span className="text-blue-500 dark:text-blue-400">{icon}</span>
                <span className="text-[11px] font-semibold uppercase tracking-wider">{title}</span>
            </div>
            <div className="mb-2 text-2xl font-bold tabular">{primary}</div>
            {progress != null && <ProgressBar value={progress} tone={tone} />}
            {secondary && (
                <div className="mt-2 text-sm tabular text-slate-500 dark:text-slate-400">{secondary}</div>
            )}
        </div>
    );
}