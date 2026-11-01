import { useState } from "react";
import Tabs from "./components/Tabs";
import ThemeToggle from "./components/ThemeToggle";
import Dashboard from "./components/Dashboard";
import Processes from "./components/Processes";
import History from "./components/History";
import { useMetrics } from "./hooks/useMetrics";

const TABS = [
  { id: "dashboard", label: "Дашборд" },
  { id: "processes", label: "Процессы" },
  { id: "history", label: "История" },
];

function Toast({ toasts }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id}
          className={`pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur
            ${t.kind === "error"
              ? "border-rose-400/30 bg-rose-400/10 text-rose-500"
              : "border-emerald-400/30 bg-emerald-400/10 text-emerald-500"}`}>
          {t.text}
        </div>
      ))}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [toasts, setToasts] = useState([]);
  const { metrics, connected, error, history } = useMetrics();

  const notify = (text, kind = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, text, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-6">
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold tracking-tight">GoPulse</h1>
          <span className="text-xs text-slate-500 dark:text-slate-400">System Monitor</span>
        </div>
        <ThemeToggle />
      </header>

      <Tabs value={tab} onChange={setTab} items={TABS} />

      {tab === "dashboard" && (
        <Dashboard metrics={metrics} connected={connected} error={error} history={history} />
      )}
      {tab === "processes" && <Processes notify={notify} />}
      {tab === "history" && <History notify={notify} />}

      <Toast toasts={toasts} />
    </div>
  );
}