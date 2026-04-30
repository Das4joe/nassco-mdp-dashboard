// src/components/HeroCards.tsx — CSV Records card removed
import { motion } from "framer-motion";
import type { StateAgg } from "../lib/aggregations";
import { STATE_COLORS } from "../theme";

interface Props {
  statesAgg: StateAgg[];
}

export default function HeroCards({ statesAgg }: Props) {
  const totalHH   = statesAgg.reduce((s, d) => s + d.hh, 0);
  const totalLGAs = statesAgg.reduce((s, d) => s + d.lgaCount, 0);

  const topCards = [
    {
      label: "Intervention States",
      value: statesAgg.length,
      icon: "🗺️",
      color: "#4CAF50",
      sub: "Oyo · Benue · Sokoto · Abia",
    },
    {
      label: "LGAs Covered",
      value: totalLGAs,
      icon: "📍",
      color: "#42A5F5",
      sub: "Across all states",
    },
    {
      label: "Total Enumerated HHs",
      value: totalHH.toLocaleString(),
      icon: "🏠",
      color: "#FFA726",
      sub: "Verified households",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Top 3 summary cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 12,
      }}>
        {topCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
            whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
            style={{
              background: "#fff",
              borderRadius: 14,
              padding: "20px 22px",
              borderLeft: `4px solid ${card.color}`,
              boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
              cursor: "default",
            }}
          >
            <div style={{ fontSize: 26, marginBottom: 6 }}>{card.icon}</div>
            <div style={{ fontSize: 11, color: "#6B7280", fontWeight: 600, marginBottom: 4 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 800, color: card.color, lineHeight: 1 }}>
              {card.value}
            </div>
            <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Per-state cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 10,
      }}>
        {statesAgg.map((s, i) => {
          const color = STATE_COLORS[s.state] ?? "#4CAF50";
          return (
            <motion.div
              key={s.normalizedState}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08, type: "spring" }}
              whileHover={{ y: -2, boxShadow: `0 6px 20px ${color}30` }}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "14px 18px",
                borderTop: `3px solid ${color}`,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              <div style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#374151",
                marginBottom: 6,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}>
                <span style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: color, display: "inline-block",
                }} />
                {s.state}
              </div>
              <div style={{ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }}>
                {s.hh.toLocaleString()}
              </div>
              <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 4 }}>
                {s.lgaCount} LGA{s.lgaCount !== 1 ? "s" : ""}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}