// src/components/LgaCharts.tsx
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — LGA Bar Chart using Recharts
// ═══════════════════════════════════════════════════════════════

import type { LgaAgg } from "../lib/aggregations";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";
import { CHART_COLORS } from "../theme";

interface Props {
  data: LgaAgg[];
}

// ── Custom tooltip ─────────────────────────────────────────────
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: 8,
        padding: "10px 14px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontSize: 12,
      }}
    >
      <p style={{ margin: 0, fontWeight: 700, color: "#111827" }}>{label}</p>
      <p style={{ margin: "4px 0 0", color: "#4CAF50" }}>
        🏠 {payload[0].value.toLocaleString()} Enumerated HHs
      </p>
    </div>
  );
}

export default function LgaCharts({ data }: Props) {
  // ── Empty state ─────────────────────────────────────────────
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          height: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#9CA3AF",
          fontSize: 13,
          border: "1px dashed #E5E7EB",
          borderRadius: 8,
        }}
      >
        No data to display. Select a state or LGA above.
      </div>
    );
  }

  // ── Truncate long LGA names for X axis ──────────────────────
  const chartData = data.map((d) => ({
    ...d,
    shortLga:
      d.lga.length > 12 ? d.lga.slice(0, 11) + "…" : d.lga,
  }));

  return (
    <div style={{ width: "100%", overflowX: "auto" }}>
      <div style={{ minWidth: Math.max(400, chartData.length * 60) }}>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            data={chartData}
            margin={{ top: 24, right: 20, left: 10, bottom: 60 }}
            barCategoryGap="30%"
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#F3F4F6"
              vertical={false}
            />
            <XAxis
              dataKey="shortLga"
              tick={{
                fontSize: 11,
                fill: "#6B7280",
                fontFamily: "'DM Sans', sans-serif",
              }}
              angle={-40}
              textAnchor="end"
              interval={0}
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis
              tick={{
                fontSize: 11,
                fill: "#9CA3AF",
                fontFamily: "'DM Sans', sans-serif",
              }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
              }
            />
            <Tooltip
              content={
                <CustomTooltip />
              }
              cursor={{ fill: "rgba(76,175,80,0.06)" }}
            />
            <Bar
              dataKey="hh"
              name="Enumerated HHs"
              radius={[5, 5, 0, 0]}
              maxBarSize={52}
            >
              {chartData.map((_, i) => (
                <Cell
                  key={i}
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
              <LabelList
                dataKey="hh"
                position="top"
                style={{
                  fontSize: 10,
                  fill: "#6B7280",
                  fontFamily: "'DM Sans', sans-serif",
                }}
                formatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                }
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Data table below chart ── */}
      <div
        style={{
          marginTop: 16,
          overflowX: "auto",
          borderRadius: 8,
          border: "1px solid #F3F4F6",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 12,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <thead>
            <tr style={{ background: "#F9FAFB" }}>
              <th
                style={{
                  padding: "8px 14px",
                  textAlign: "left",
                  color: "#6B7280",
                  fontWeight: 600,
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                #
              </th>
              <th
                style={{
                  padding: "8px 14px",
                  textAlign: "left",
                  color: "#6B7280",
                  fontWeight: 600,
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                LGA
              </th>
              <th
                style={{
                  padding: "8px 14px",
                  textAlign: "right",
                  color: "#6B7280",
                  fontWeight: 600,
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                Enumerated HHs
              </th>
              <th
                style={{
                  padding: "8px 14px",
                  textAlign: "right",
                  color: "#6B7280",
                  fontWeight: 600,
                  borderBottom: "1px solid #E5E7EB",
                }}
              >
                Share
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const total = data.reduce((s, d) => s + d.hh, 0);
              const pct   = total > 0 ? ((row.hh / total) * 100).toFixed(1) : "0.0";
              return (
                <tr
                  key={row.normalizedLga}
                  style={{
                    background: i % 2 === 0 ? "#fff" : "#FAFAFA",
                    transition: "background 0.15s",
                  }}
                >
                  <td
                    style={{
                      padding: "7px 14px",
                      color: "#9CA3AF",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: "7px 14px",
                      fontWeight: 600,
                      color: "#111827",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: CHART_COLORS[i % CHART_COLORS.length],
                        marginRight: 8,
                      }}
                    />
                    {row.lga}
                  </td>
                  <td
                    style={{
                      padding: "7px 14px",
                      textAlign: "right",
                      color: "#111827",
                      fontWeight: 700,
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    {row.hh.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "7px 14px",
                      textAlign: "right",
                      borderBottom: "1px solid #F3F4F6",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          width: 50,
                          height: 6,
                          background: "#F3F4F6",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background:
                              CHART_COLORS[i % CHART_COLORS.length],
                            borderRadius: 3,
                          }}
                        />
                      </div>
                      <span style={{ fontSize: 11, color: "#6B7280" }}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ background: "#F9FAFB" }}>
              <td
                colSpan={2}
                style={{
                  padding: "8px 14px",
                  fontWeight: 700,
                  color: "#374151",
                  fontSize: 12,
                }}
              >
                Total
              </td>
              <td
                style={{
                  padding: "8px 14px",
                  textAlign: "right",
                  fontWeight: 800,
                  color: "#4CAF50",
                  fontSize: 13,
                }}
              >
                {data.reduce((s, d) => s + d.hh, 0).toLocaleString()}
              </td>
              <td
                style={{
                  padding: "8px 14px",
                  textAlign: "right",
                  fontWeight: 700,
                  color: "#374151",
                }}
              >
                100%
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}