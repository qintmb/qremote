function formatBytes(bytes) {
  const gb = bytes / (1024 * 1024 * 1024);
  return gb.toFixed(2);
}

export function DiskPartitions({ partitions }) {
  const displayData =
    partitions?.length > 0
      ? partitions
      : [{ mount: "/", type: "ext4", used: 0, total: 1, percent: 0 }];

  return (
    <div className="section">
      <div className="partitions-header">
        <div className="partitions-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <div className="partitions-title">Partisi Disk</div>
          <div className="partitions-subtitle">Storage overview</div>
        </div>
      </div>

      {displayData.map((partition, index) => {
        const pct = partition.percent || 0;
        const free = formatBytes(partition.free || 0);

        return (
          <div key={partition.mount} className="partition-item">
            <div className="partition-name">
              <svg
                className="partition-folder"
                viewBox="0 0 24 24"
                fill="#f59e0b"
              >
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              <span className="partition-label">{partition.mount}</span>
              <span className="partition-type">({partition.type})</span>
              <span
                className="partition-percent"
                style={{
                  color:
                    pct > 85 ? "#dc2626" : pct > 70 ? "#d97706" : "#f59e0b",
                }}
              >
                {pct.toFixed(1)}%
              </span>
            </div>

            <div className="partition-bar">
              <div
                className="partition-fill"
                style={{
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${pct > 85 ? "#dc2626" : pct > 70 ? "#f59e0b" : "#3b82f6"}, ${pct > 85 ? "#ef4444" : pct > 70 ? "#fbbf24" : "#60a5fa"})`,
                }}
              />
            </div>

            <div className="partition-info">
              <span>
                {formatBytes(partition.used)} / {formatBytes(partition.total)}{" "}
                GB
              </span>
              <span>Free: {free} GB</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
