const TONES = {
    neutral: "bg-blue-400",
    ok: "bg-emerald-400",
    warn: "bg-amber-400",
    danger: "bg-rose-400",
};

export default function ProgressBar({ value, tone = "neutral" }) {
    const pct = Math.max(0, Math.min(100, value ?? 0));
    return (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-500/20">
            <div
                className={`h-full rounded-full transition-all duration-500 ${TONES[tone]}`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}