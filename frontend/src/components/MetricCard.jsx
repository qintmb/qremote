export function MetricCard({
  title,
  icon,
  value,
  unit,
  sub,
  color,
  gauge,
  children,
  status,
  statusColor,
  delay = 0,
}) {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0d1117 0%, #161b27 100%)",
        border: `1px solid ${color}22`,
        borderRadius: 16,
        padding: "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 4px 24px ${color}10, inset 0 1px 0 ${color}15`,
        animation: `fadeUp 0.5s ease ${delay}s both`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          background: `radial-gradient(circle at top right, ${color}18, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, opacity: 0.5 }}>{icon}</span>
          <span
            style={{
              fontSize: 10,
              letterSpacing: 2,
              color: "#667",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {title}
          </span>
        </div>
        {status && (
          <span
            style={{
              fontSize: 9,
              letterSpacing: 1.5,
              padding: "3px 8px",
              borderRadius: 20,
              border: `1px solid ${statusColor}44`,
              color: statusColor,
              fontFamily: "monospace",
              background: `${statusColor}11`,
            }}
          >
            {status}
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 8,
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span
              style={{
                fontSize: 36,
                fontWeight: 700,
                color: "#eef",
                fontFamily: "'JetBrains Mono', monospace",
                lineHeight: 1,
              }}
            >
              {value}
            </span>
            <span
              style={{ fontSize: 13, color: color, fontFamily: "monospace" }}
            >
              {unit}
            </span>
          </div>
          {sub && (
            <div
              style={{
                fontSize: 11,
                color: "#445",
                marginTop: 4,
                fontFamily: "monospace",
              }}
            >
              {sub}
            </div>
          )}
        </div>
        {gauge}
      </div>
      {children}
    </div>
  );
}
