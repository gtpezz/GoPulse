export default function Tabs({ value, onChange, items }) {
    return (
        <nav className="mb-6 flex gap-1 rounded-xl border border-slate-500/15 bg-white/50 p-1 dark:bg-white/[0.03]">
            {items.map((it) => (
                <button
                    key={it.id}
                    onClick={() => onChange(it.id)}
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition
            ${value === it.id
                            ? "bg-white shadow-sm dark:bg-white/10"
                            : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100"}`}
                >
                    {it.label}
                </button>
            ))}
        </nav>
    );
}