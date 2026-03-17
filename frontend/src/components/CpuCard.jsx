import { useEffect, useState } from "react";

export function CpuCard({ cpu }) {
  const [history, setHistory] = useState(Array(20).fill(0));

  useEffect(() => {
    if (cpu?.usage !== undefined) {
      setHistory((h) => [...h.slice(1), cpu.usage]);
    }
  }, [cpu?.usage]);

  const getStatus = (usage) => {
    if (usage > 80) return { class: "status-critical", label: "Kritis" };
    if (usage > 60) return { class: "status-high", label: "Tinggi" };
    return { class: "status-normal", label: "Normal" };
  };

  const status = cpu
    ? getStatus(cpu.usage)
    : { class: "status-normal", label: "-" };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <div className="icon-box cpu">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <rect x="4" y="4" width="16" height="16" rx="2" />
              <rect x="9" y="9" width="6" height="6" rx="1" fill="#667eea" />
            </svg>
          </div>
          <div>
            <div className="card-label">CPU</div>
            <div className="card-sublabel">{cpu?.cores || 0} Core</div>
          </div>
        </div>
        <span className={`status-badge ${status.class}`}>{status.label}</span>
      </div>

      <div className="card-value">
        {cpu?.usage !== undefined ? cpu.usage.toFixed(1) : "--"}%
      </div>

      <div className="progress-track">
        <div
          className="progress-fill cpu"
          style={{ width: `${cpu?.usage || 0}%` }}
        />
      </div>

      <div className="card-footer">{cpu?.brand || "Loading..."}</div>
    </div>
  );
}
