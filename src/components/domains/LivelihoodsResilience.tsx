import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Briefcase, AlertTriangle, Shield, Users } from "lucide-react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";

interface LivelihoodsResilienceProps {
  data?: GeoRecord | DashboardData;
  record?: GeoRecord;
  path?: DrilldownPath;
  onPathChange?: (path: any) => void;
  stateFilter?: string | null;
  states?: GeoRecord[];
  national?: GeoRecord;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  data,
  record: recordProp,
  path = {},
  onPathChange,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const rec = recordProp
    ? recordProp
    : data && "extended" in data
      ? (data as GeoRecord)
      : undefined;
  if (!rec) return null;

  const labelVal = {
    position: "top" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };
  const labelValH = {
    position: "right" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };

  const liv = rec.extended.livelihoods_resilience_v2 ?? {
    livelihoods: [],
    large_households: { count: 0, pct: 0 },
    multi_vulnerable_households: { count: 0, pct: 0 },
    shock_exposure: {
      shock_hh_count: 0,
      shock_hh_pct: 0,
      types: [],
      coping_mechanisms: [],
    },
  };
  const youth = rec.extended.youth ?? {
    total: 0,
    employed: 0,
    unemployed: 0,
    unemployment_rate: 0,
    labour_breakdown: [],
  };

  const shockTypesData = liv.shock_exposure.types.map((s) => ({
    type: s.type,
    Count: s.count,
  }));
  const copingData = liv.shock_exposure.coping_mechanisms.map((c) => ({
    mechanism: c.label,
    Count: c.count,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Livelihoods & Shock Exposure
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Shock Exposure Rate"
          value={`${liv.shock_exposure.shock_hh_pct}%`}
          icon={<AlertTriangle size={18} />}
          accent="#DC2626"
        />
        <KpiCard
          label="Youth Unemployment"
          value={`${youth.unemployment_rate}%`}
          icon={<Briefcase size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="Multi-Vulnerable HHs"
          value={`${liv.multi_vulnerable_households.pct}%`}
          icon={<Shield size={18} />}
          accent="#075E54"
        />
        <KpiCard
          label="Large Households"
          value={`${liv.large_households.pct}%`}
          icon={<Users size={18} />}
          accent="#128C7E"
        />
      </div>
      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Shock Exposure Map
        </div>
        <DrilldownMap
          data={data as DashboardData}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter ?? undefined}
          metric="shocks"
          height={400}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Shock Exposure by Type" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shockTypesData}
              layout="vertical"
              margin={{ top: 8, right: 35, left: 16, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="type"
                type="category"
                width={140}
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Bar
                dataKey="Count"
                fill="#DC2626"
                radius={[0, 4, 4, 0]}
                label={labelValH}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Household Coping Mechanisms" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={copingData}
              layout="vertical"
              margin={{ top: 8, right: 35, left: 16, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="mechanism"
                type="category"
                width={140}
                tick={{ fill: theme.axisTick, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Bar
                dataKey="Count"
                fill="#E67E22"
                radius={[0, 4, 4, 0]}
                label={labelValH}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Livelihood Sectors" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={liv.livelihoods}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fill: theme.axisTick, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Bar
                dataKey="count"
                fill="#075E54"
                radius={[4, 4, 0, 0]}
                label={labelVal}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Youth Labour Activity (18–24)" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={youth.labour_breakdown}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="label"
                tick={{ fill: theme.axisTick, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Bar
                dataKey="count"
                fill="#128C7E"
                radius={[4, 4, 0, 0]}
                label={labelVal}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
