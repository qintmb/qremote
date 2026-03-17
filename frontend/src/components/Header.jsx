import { PulsingDot } from "./PulsingDot";

export function Header({ uptime }) {
  const timeStr = uptime
    ? `${String(uptime.h).padStart(2, "0")}:${String(uptime.m).padStart(2, "0")}:${String(uptime.s).padStart(2, "0")}`
    : "00:00:00";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
        animation: "fadeUp 0.3s ease both",
        borderBottom: "1px solid #1a2535",
        paddingBottom: 16,
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 3,
              height: 28,
              background: "linear-gradient(180deg, #00d4ff, #0066ff)",
              borderRadius: 2,
            }}
          />
          <h1
            style={{
              fontSize: 20,
              fontFamily: "'Syne', sans-serif",
              fontWeight: 800,
              color: "#e8eef8",
              letterSpacing: -0.5,
            }}
          >
            ARMBIAN <span style={{ color: "#00d4ff" }}>MONITOR</span>
          </h1>
        </div>
        <div
          style={{
            fontSize: 10,
            color: "#445",
            marginLeft: 13,
            marginTop: 4,
            letterSpacing: 1,
          }}
        >
          ↑ UPTIME {uptime?.d || 0}d {timeStr}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <PulsingDot color="#00ff88" />
          <span style={{ fontSize: 10, color: "#00ff88", letterSpacing: 2 }}>
            LIVE
          </span>
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#334",
            background: "#0d1117",
            padding: "6px 12px",
            borderRadius: 8,
            border: "1px solid #1a2535",
          }}
        >
          {new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          })}
        </div>
      </div>
    </div>
  );
}
