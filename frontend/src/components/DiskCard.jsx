function formatBytes(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2);
}

export function DiskCard({ disk }) {
  const getStatus = (percent) => {
    if (percent > 85) return { class: "status-critical", label: "Kritis" };
    if (percent > 70) return { class: "status-high", label: "Tinggi" };
    return { class: "status-normal", label: "Normal" };
  };

  const status = disk
    ? getStatus(disk.percent)
    : { class: "status-normal", label: "-" };

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <div className="icon-box disk">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <circle
                cx="12"
                cy="12"
                r="9"
                stroke="white"
                strokeWidth="2"
                fill="none"
              />
              <circle cx="12" cy="12" r="3" fill="white" />
              <circle cx="12" cy="12" r="1.5" fill="#f59e0b" />
            </svg>
          </div>
          <div>
            <div className="card-label">DISK</div>
            <div className="card-sublabel">{disk?.mount || "/"}</div>
          </div>
        </div>
        <span className={`status-badge ${status.class}`}>{status.label}</span>
      </div>

      <div className="card-value">
        {disk?.percent !== undefined ? disk.percent.toFixed(1) : "--"}%
      </div>

      <div className="progress-track">
        <div
          className="progress-fill disk"
          style={{ width: `${disk?.percent || 0}%` }}
        />
      </div>

      <div className="card-footer">
        {disk ? formatBytes(disk.used) : "--"} /{" "}
        {disk ? formatBytes(disk.total) : "--"} GB ({disk?.mount || "/"})
      </div>
    </div>
  );
}
