const base = {
  width: 20, height: 20, viewBox: "0 0 24 24", fill: "none",
  stroke: "currentColor", strokeWidth: 1.8,
  strokeLinecap: "round", strokeLinejoin: "round",
};

export const CpuIcon = () => (
  <svg {...base}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2" />
  </svg>
);

export const RamIcon = () => (
  <svg {...base}>
    <rect x="3" y="7" width="18" height="10" rx="1.5" />
    <path d="M7 17v3M11 17v3M15 17v3M19 17v3" />
    <path d="M7 10h2M11 10h2M15 10h2" />
  </svg>
);

export const DiskIcon = () => (
  <svg {...base}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 14h18" />
    <circle cx="7" cy="17.5" r="0.8" fill="currentColor" />
  </svg>
);

export const NetIcon = () => (
  <svg {...base}>
    <path d="M12 20V4M5 11l7-7 7 7" />
    <path d="M5 20h14" />
  </svg>
);

export const ArrowDown = () => (
  <svg {...base} width={14} height={14}><path d="M12 5v14M5 12l7 7 7-7" /></svg>
);

export const ArrowUp = () => (
  <svg {...base} width={14} height={14}><path d="M12 19V5M5 12l7-7 7 7" /></svg>
);