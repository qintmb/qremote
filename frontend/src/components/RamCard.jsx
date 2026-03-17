import { useEffect, useState } from "react";

function formatBytes(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2);
}

function formatProcessMemory(bytes) {
  if (!bytes || bytes <= 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) return `${mb.toFixed(0)} MB`;
  return `${(mb / 1024).toFixed(2)} GB`;
}

export function RamCard({ ram, backendUrl }) {
  const getStatus = (percent) => {
    if (percent > 85) return { class: "status-critical", label: "Kritis" };
    if (percent > 70) return { class: "status-high", label: "Tinggi" };
    return { class: "status-normal", label: "Normal" };
  };

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [processes, setProcesses] = useState([]);

  const percent = ram?.percent ?? 0;
  const status = ram
    ? getStatus(percent)
    : { class: "status-normal", label: "-" };

  useEffect(() => {
    if (!open) {
      return;
    }

    let cancelled = false;

    const loadProcesses = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`${backendUrl}/api/processes/memory?limit=12`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to load processes");
        }

        if (!cancelled) {
          setProcesses(data.processes || []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Failed to load processes");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadProcesses();

    return () => {
      cancelled = true;
    };
  }, [backendUrl, open]);

  return (
    <>
      <button
        type="button"
        className="card ram-card-button"
        onClick={() => setOpen(true)}
      >
        <div className="card-header">
          <div className="card-icon">
            <div className="icon-box ram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <rect x="3" y="2" width="18" height="20" rx="2" />
                <line
                  x1="7"
                  y1="6"
                  x2="17"
                  y2="6"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="7"
                  y1="10"
                  x2="17"
                  y2="10"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="7"
                  y1="14"
                  x2="17"
                  y2="14"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <line
                  x1="7"
                  y1="18"
                  x2="13"
                  y2="18"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <div className="card-label">RAM</div>
              <div className="card-sublabel">Memory · Tap for details</div>
            </div>
          </div>
          <span className={`status-badge ${status.class}`}>{status.label}</span>
        </div>

        <div className="card-value">{ram ? percent.toFixed(1) : "--"}%</div>

        <div className="progress-track">
          <div
            className="progress-fill ram"
            style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
          />
        </div>

        <div
          className="card-footer"
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <span>Used: {ram ? formatBytes(ram.used) : "--"} GB</span>
          <span>Free: {ram ? formatBytes(ram.free) : "--"} GB</span>
        </div>
      </button>

      {open ? (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div
            className="modal-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <div className="modal-title">Top RAM Processes</div>
                <div className="modal-subtitle">
                  Proses dengan penggunaan memory tertinggi
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              {loading ? <div className="modal-state">Loading...</div> : null}
              {error ? <div className="modal-state error">{error}</div> : null}
              {!loading && !error ? (
                <div className="process-list">
                  {processes.map((process) => (
                    <div key={`${process.pid}-${process.name}`} className="process-row">
                      <div className="process-main">
                        <div className="process-name">{process.name}</div>
                        <div className="process-meta">
                          PID {process.pid}
                          {process.user ? ` · ${process.user}` : ""}
                        </div>
                      </div>
                      <div className="process-metrics">
                        <div>{formatProcessMemory(process.mem_bytes)}</div>
                        <div>{process.mem_percent.toFixed(1)}%</div>
                      </div>
                    </div>
                  ))}
                  {processes.length === 0 ? (
                    <div className="modal-state">No process data available.</div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
