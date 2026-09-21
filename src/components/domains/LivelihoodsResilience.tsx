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
  states?: GeoRecord[];
  national?: GeoRecord;
  path?: DrilldownPath;
  onPathChange?: (path: any) => void;
  stateFilter?: string | null;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  data,
  record: recordProp,
  path = {},
  onPathChange,
  stateFilter,
}) => {
  const theme = useChartTheme();

  const rec: GeoRecord | undefined = recordProp
    ? recordProp
    : data && "extended" in data
      ? (data as GeoRecord)
      : undefined;

  if (!rec) return null;

  const liv = rec.extended.livelihoods_resilience_v2 ?? {
    livelihoods: rec.extended.livelihoods.code_dist,
    large_households: {
      count: 0,
      pct: rec.nsr.avg_household_size >= 8 ? 100 : 0,
    },
    multi_vulnerable_households: { count: 0, pct: 0 },
    hh_with_disability: { count: 0, pct: 0 },
    shock_exposure: {
      shock_hh_count: rec.extended.shocks.exposure_pct.n,
      shock_hh_pct: rec.extended.shocks.exposure_pct.pct,
      types: rec.extended.shocks.types.map((t) => ({
        type: t.type,
        count: t.count,
        pct: t.pct,
      })),
      coping_mechanisms: rec.extended.coping.mechanisms,
    },
  };

  const youth = rec.extended.youth ?? {
    total: 0,
    employed: 0,
    unemployed: 0,
    student: 0,
    unemployment_rate: 0,
    labour_breakdown: [],
  };

  const shockTypesData = liv.shock_exposure.types.map((s) => ({
    type: s.type,
    Count: s.count,
    "Share %": s.pct,
  }));

  const copingData = liv.shock_exposure.coping_mechanisms.map((c) => ({
    mechanism: c.label,
    Count: c.count,
    "Share %": c.pct,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Livelihoods & Shock Exposure
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            Economic activities, youth employment, environmental shocks, and
            household coping
          </p>
        </div>
        <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted bg-surface-page dark:bg-surface-darker px-3 py-1.5 rounded-lg border border-line-light dark:border-line-dark">
          Data as of:{" "}
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            September 2026
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Shock Exposure Rate"
          value={`${liv.shock_exposure.shock_hh_pct}%`}
          sub={`${liv.shock_exposure.shock_hh_count.toLocaleString()} households exposed`}
          icon={<AlertTriangle size={18} />}
          accent="#DC2626"
        />
        <KpiCard
          label="Youth Unemployment (18–24)"
          value={`${youth.unemployment_rate}%`}
          sub={`${youth.unemployed.toLocaleString()} unemployed youth`}
          icon={<Briefcase size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="Multi-Vulnerable Households"
          value={`${liv.multi_vulnerable_households.pct}%`}
          sub="HHs with >= 2 vulnerability factors"
          icon={<Shield size={18} />}
          accent="#075E54"
        />
        <KpiCard
          label="Large Households (Size >= 8)"
          value={`${liv.large_households.pct}%`}
          sub={`Avg HH Size: ${rec.nsr.avg_household_size}`}
          icon={<Users size={18} />}
          accent="#128C7E"
        />
      </div>

      {/* Dedicated Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-line-light dark:border-line-dark">
          <span className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
            Shock Exposure Geographic Map
          </span>
        </div>
        <DrilldownMap
          data={
            data && "states" in data
              ? (data as DashboardData)
              : ({ states: [rec], lgas: [], national: rec } as any)
          }
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter ?? undefined}
          metric="shocks"
          height={400}
        />
      </div>

      {/* Charts Row 1: Shocks x Coping */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Shock Exposure by Type"
          takeaway="Reported shock events experienced by households over the past 3 years"
          height={320}
          accent={liv.shock_exposure.shock_hh_pct > 20 ? "bad" : "neutral"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shockTypesData}
              layout="vertical"
              margin={{ top: 16, right: 24, left: 16, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
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
                formatter={(val: number, _n, item) => [
                  `${Number(val).toLocaleString()} HHs (${item.payload["Share %"]}%)`,
                  "",
                ]}
              />
              <Bar
                dataKey="Count"
                fill="#DC2626"
                radius={[0, 4, 4, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Household Coping Mechanisms"
          takeaway="Strategies adopted by shock-affected households to mitigate impact"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={copingData}
              layout="vertical"
              margin={{ top: 16, right: 24, left: 16, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
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
                formatter={(val: number, _n, item) => [
                  `${Number(val).toLocaleString()} HHs (${item.payload["Share %"]}%)`,
                  "",
                ]}
              />
              <Bar
                dataKey="Count"
                fill="#E67E22"
                radius={[0, 4, 4, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Livelihoods & Youth Employment */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Primary Household Livelihood Sectors"
          takeaway="Main source of livelihood across registered households"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={liv.livelihoods}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
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
                barSize={26}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Youth Labour Activity Breakdown (18–24 Years)"
          takeaway="Economic status of young adults in registered households"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={youth.labour_breakdown}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
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
                barSize={26}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
