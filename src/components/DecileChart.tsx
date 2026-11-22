import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { computeDecileDistribution, type DecileBar } from "../lib/insights";

export interface DecileChartProps {
  items: { score?: number }[];
  isDark?: boolean;
}

const DECILE_COLORS = [
  "#10B981",
  "#34D399",
  "#6EE7B7",
  "#A7F3D0",
  "#FDE68A",
  "#FCD34D",
  "#FBBF24",
  "#F87171",
  "#EF4444",
  "#B91C1C",
];

export const DecileChart: React.FC<DecileChartProps> = ({
  items,
  isDark = false,
}) => {
  const data: DecileBar[] = computeDecileDistribution(items);

  return (
    <div className="w-full h-full flex flex-col justify-between">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="decile"
            tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
            tickFormatter={(val) => `D${val}`}
          />
          <YAxis
            tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const d = payload[0].payload as DecileBar;
                return (
                  <div
                    className={`p-2.5 rounded-lg border text-xs shadow-lg ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100"
                        : "bg-white border-slate-200 text-slate-900"
                    }`}
                  >
                    <p className="font-bold">Decile {d.decile}</p>
                    <p>Communities: {d.count.toLocaleString()}</p>
                    <p>
                      Score Range: {d.minScore} – {d.maxScore}
                    </p>
                    <p>Avg Score: {d.avgScore}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="count" name="Communities" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell
                key={`decile-${index}`}
                fill={DECILE_COLORS[index % DECILE_COLORS.length]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-[10px] text-slate-400 mt-2 px-2 font-mono">
        <span>← Least Vulnerable (D1)</span>
        <span>Most Vulnerable (D10) →</span>
      </div>
    </div>
  );
};

export default DecileChart;
