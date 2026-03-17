export function ArcGauge({ value, max = 100, color, size = 80 }) {
  const r = 32;
  const circ = 2 * Math.PI * r;
  const pct = Math.min(value / max, 1);
  const dash = pct * circ * 0.75;
  const gap = circ - dash;
  const rotation = 135;

  return (
    <svg width={size} height={size} viewBox="0 0 80 80">
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="#1a1f2e"
        strokeWidth="7"
        strokeDasharray={`${circ * 0.75} ${circ * 0.25}`}
        strokeDashoffset={0}
        strokeLinecap="round"
        transform={`rotate(${rotation} 40 40)`}
      />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeDasharray={`${dash} ${gap + circ * 0.25}`}
        strokeLinecap="round"
        transform={`rotate(${rotation} 40 40)`}
        style={{
          transition: "stroke-dasharray 0.5s ease",
          filter: `drop-shadow(0 0 4px ${color})`,
        }}
      />
    </svg>
  );
}
