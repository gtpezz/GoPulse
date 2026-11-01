import { useEffect, useMemo, useState } from "react";
import { GetProcesses, KillProcess } from "../../bindings/changeme/backend/service/processservice";
import { formatMB, formatPercent } from "../utils/format";

export default function Processes({ notify }) {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [sort, setSort] = useState({ key: "cpu", dir: "desc" });

    const load = async () => {
        try {
            const list = await GetProcesses();
            setRows(list ?? []);
        } catch (e) {
            notify?.(`Не удалось получить процессы: ${e}`, "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
        const t = setInterval(load, 3000);
        return () => clearInterval(t);
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let out = q ? rows.filter((r) => r.name.toLowerCase().includes(q)) : rows;
        const { key, dir } = sort;
        out = [...out].sort((a, b) => {
            const av = a[key] ?? 0, bv = b[key] ?? 0;
            if (typeof av === "string") return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
            return dir === "asc" ? av - bv : bv - av;
        });
        return out;
    }, [rows, query, sort]);

    const toggleSort = (key) =>
        setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }));

    const kill = async (pid, name) => {
        if (!confirm(`Завершить ${name} (PID ${pid})?`)) return;
        try {
            await KillProcess(pid);
            notify?.(`Процесс ${name} завершён`, "success");
            setRows((r) => r.filter((p) => p.pid !== pid));
        } catch (e) {
            notify?.(`Не удалось завершить ${name}: ${e}`, "error");
        }
    };

    const Th = ({ k, children }) => (
        <th onClick={() => toggleSort(k)}
            className="cursor-pointer select-none px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100">
            {children} {sort.key === k && (sort.dir === "asc" ? "▲" : "▼")}
        </th>
    );

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-xl font-bold">Диспетчер процессов</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{filtered.length} из {rows.length}</p>
                </div>
                <input value={query} onChange={(e) => setQuery(e.target.value)}
                    placeholder="Поиск по имени…"
                    className="w-64 rounded-lg border border-slate-500/20 bg-white/70 px-3 py-2 text-sm outline-none focus:border-blue-400 dark:bg-white/[0.04]" />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-500/15 bg-white/60 dark:bg-white/[0.03]">
                <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-white/90 backdrop-blur dark:bg-[#0b0d17]/90">
                            <tr>
                                <Th k="pid">PID</Th>
                                <Th k="name">Имя</Th>
                                <Th k="cpu">CPU %</Th>
                                <Th k="memory_mb">Память</Th>
                                <th className="px-3 py-2" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Загрузка…</td></tr>}
                            {!loading && filtered.length === 0 && <tr><td colSpan={5} className="py-6 text-center text-slate-500">Нет процессов</td></tr>}
                            {filtered.map((p) => (
                                <tr key={p.pid} className="border-t border-slate-500/10 hover:bg-slate-500/5">
                                    <td className="px-3 py-2 tabular">{p.pid}</td>
                                    <td className="px-3 py-2">{p.name}</td>
                                    <td className="px-3 py-2 tabular">{formatPercent(p.cpu)}</td>
                                    <td className="px-3 py-2 tabular">{formatMB(p.memory_mb * 1024 * 1024)} MB</td>
                                    <td className="px-3 py-2 text-right">
                                        <button onClick={() => kill(p.pid, p.name)}
                                            className="rounded-md border border-rose-400/30 px-2.5 py-1 text-xs text-rose-500 hover:bg-rose-400/10">
                                            Завершить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}