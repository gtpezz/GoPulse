export const formatGB = (b) => (!b ? "0.00" : (b / (1 << 30)).toFixed(2));
export const formatMB = (b) => (!b ? "0.0" : (b / (1 << 20)).toFixed(1));

export const formatBps = (v) => {
    if (!v) return "0 B/s";
    if (v < 1024) return `${v} B/s`;
    if (v < 1024 ** 2) return `${(v / 1024).toFixed(1)} KB/s`;
    return `${(v / 1024 ** 2).toFixed(1)} MB/s`;
};

export const formatPercent = (v) =>
    v == null || Number.isNaN(v) ? "0.0 %" : `${v.toFixed(1)} %`;

export const formatMHz = (v) => (!v ? "— MHz" : `${v.toFixed(0)} MHz`);

export const formatTime = (ts) => {
    if (!ts) return "—";
    try { return new Date(ts).toLocaleTimeString(); } catch { return "—"; }
};

export const formatDateTime = (ts) => {
    try { return new Date(ts).toLocaleString(); } catch { return "—"; }
};

export const toneForPercent = (pct) => {
    if (pct == null) return "neutral";
    if (pct >= 85) return "danger";
    if (pct >= 60) return "warn";
    return "ok";
};