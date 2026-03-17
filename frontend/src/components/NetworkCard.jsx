function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0.00";
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2);
}

export function NetworkCard({ network }) {
  // Use speed data (bytes per second) and convert to Mbps
  const speedRx = network?.speed_rx_bytes || 0;
  const speedTx = network?.speed_tx_bytes || 0;

  const uploadMbps = (speedTx * 8) / (1024 * 1024);
  const downloadMbps = (speedRx * 8) / (1024 * 1024);

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-icon">
          <div className="icon-box network">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
          </div>
          <div>
            <div className="card-label">Jaringan</div>
            <div className="card-sublabel">Real-time</div>
          </div>
        </div>
        <span className="status-badge status-normal">Live</span>
      </div>

      <div className="network-value">
        <span className="network-arrow">↑</span>
        <span style={{ fontSize: "22px", fontWeight: 700, color: "#1a1a2e" }}>
          {uploadMbps.toFixed(3)}
        </span>
        <span style={{ fontSize: "11px", color: "#888" }}>Mbps</span>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <span style={{ fontSize: "9px", color: "#888" }}>
          <span style={{ color: "#10b981", fontWeight: 700 }}>↓</span> Download
        </span>
        <span style={{ fontSize: "11px", fontWeight: 600, color: "#1a1a2e" }}>
          {downloadMbps.toFixed(3)} Mbps
        </span>
      </div>

      <div className="network-stats">
        <span>{network?.primary_interface || "-"}</span>
        <span>
          Rx {formatBytes(network?.rx_bytes)} MB / Tx{" "}
          {formatBytes(network?.tx_bytes)} MB
        </span>
      </div>
    </div>
  );
}
