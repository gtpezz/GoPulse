export default function StatusBadge({ connected }) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs
        ${connected
                    ? "border-emerald-400/30 text-emerald-400"
                    : "border-amber-400/30 text-amber-400"}`}
        >
            <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
            </span>
            {connected ? "live" : "waiting…"}
        </span>
    );
}