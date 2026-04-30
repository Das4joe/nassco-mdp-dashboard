// src/maps/Legend.tsx
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — Map Choropleth Legend
// ═══════════════════════════════════════════════════════════════

const LEGEND_ITEMS = [
  { label: "0 – 50 HHs",    color: "#c6dbef" },
  { label: "51 – 100",      color: "#9ecae1" },
  { label: "101 – 200",     color: "#6baed6" },
  { label: "201 – 500",     color: "#4292c6" },
  { label: "501 – 1,000",   color: "#2171b5" },
  { label: "1,001 – 2,000", color: "#08519c" },
  { label: "2,000+",        color: "#08306b" },
];

export default function Legend() {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        background: "#F9FAFB",
        borderRadius: 8,
        border: "1px solid #E5E7EB",
      }}
    >
      <span
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#374151",
          marginRight: 4,
          whiteSpace: "nowrap",
        }}
      >
        Enumerated HHs:
      </span>

      {LEGEND_ITEMS.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: item.color,
              display: "inline-block",
              flexShrink: 0,
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          />
          <span
            style={{
              fontSize: 11,
              color: "#6B7280",
              whiteSpace: "nowrap",
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}