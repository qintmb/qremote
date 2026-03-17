export function ProgressBar({ value, color, height = 4 }) {
  return (
    <div
      style={{
        background: "#1a1f2e",
        borderRadius: 99,
        height,
        overflow: "hidden",
        marginTop: 4,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${value}%`,
          borderRadius: 99,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          boxShadow: `0 0 8px ${color}88`,
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}
