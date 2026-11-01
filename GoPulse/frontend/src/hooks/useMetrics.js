import { useEffect, useRef, useState } from "react";
import { Events } from "@wailsio/runtime";

const WINDOW = 60;

export function useMetrics() {
    const [metrics, setMetrics] = useState(null);
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);
    const historyRef = useRef({ cpu: [], ram: [], labels: [] });
    const [history, setHistory] = useState(historyRef.current);

    useEffect(() => {
        let off;
        try {
            off = Events.On("metrics_update", (event) => {
                const data = event.data;
                setConnected(true);
                setError(null);
                setMetrics(data);

                const h = historyRef.current;
                h.cpu.push(data.cpu_percent);
                h.ram.push(data.ram_percent);
                h.labels.push(new Date(data.timestamp).toLocaleTimeString());
                if (h.cpu.length > WINDOW) {
                    h.cpu.shift(); h.ram.shift(); h.labels.shift();
                }
                setHistory({ ...h });
            });
        } catch (e) {
            setError(String(e));
        }
        return () => { if (typeof off === "function") off(); };
    }, []);

    return { metrics, connected, error, history };
}