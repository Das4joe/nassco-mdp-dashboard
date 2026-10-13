import { type FC } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface HealthProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const Health: FC<HealthProps> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const labelVal = {
    position: "top" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };

  const h2 = record.extended.health_v2 ?? {
    pregnant_total: 0,
    lactating_total: 0,
    plwd_total: 0,
    children_plwd: 0,
    children_0_5_insurance: 0,
    children_0_7_insurance: 0,
    children_0_5_no_insurance: 0,
    children_0_7_no_insurance: 0,
  };

  const insuranceData07 = [
    {
      name: "Covered by Health Insurance",
      count: h2.children_0_7_insurance ?? 0,
      color: "#059669",
    },
    {
      name: "No Health Insurance Cover",
      count: h2.children_0_7_no_insurance ?? 0,
      color: "#DC2626",
    },
  ];

  const insuranceData05 = [
    {
      name: "Covered by Health Insurance",
      count: h2.children_0_5_insurance ?? 0,
      color: "#059669",
    },
    {
      name: "No Health Insurance Cover",
      count: h2.children_0_5_no_insurance ?? 0,
      color: "#DC2626",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Health
          </h2>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Indicator
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              l: "Currently Pregnant",
              v: h2.pregnant_total || 0,
              c: "#9333EA",
            },
            {
              l: "Lactating Mothers",
              v: h2.lactating_total || 0,
              c: "#0284C7",
            },
            {
              l: "Persons w/ Disabilities",
              v: h2.plwd_total || 0,
              c: "#128C7E",
            },
            {
              l: "Children w/ Disabilities",
              v: h2.children_plwd || 0,
              c: "#D97706",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-lg p-3 shadow-sm flex flex-col justify-between"
            >
              <div className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-onDarkMuted mb-2 leading-tight">
                {item.l}
              </div>
              <div className="text-xl font-black" style={{ color: item.c }}>
                {item.v.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Vulnerability Map
        </div>
        <DrilldownMap
          data={data}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter}
          metric="vulnerability"
          height={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Children (0-7) living in household health insurance status"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={insuranceData07}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={theme.tooltip} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} label={labelVal}>
                {insuranceData07.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Children (0-5) living in household health insurance status"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={insuranceData05}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="name"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={theme.tooltip} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} label={labelVal}>
                {insuranceData05.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};
export default Health;
