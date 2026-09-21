import { type FC } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";
import { Heart, Activity, UserCheck, HelpCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HealthProps {
  data?: GeoRecord | DashboardData;
  record?: GeoRecord;
  path?: DrilldownPath;
  onPathChange?: (path: any) => void;
  stateFilter?: string | null;
  states?: GeoRecord[];
  national?: GeoRecord;
}

export const Health: FC<HealthProps> = ({
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

  const h2 = rec.extended.health_v2 ?? {
    pregnant_total: rec.extended.plw.pregnant.n,
    pregnant_by_age: { under_18: 0, "18_24": 0, "25_34": 0, "35_plus": 0 },
    lactating_total: rec.extended.plw.lactating.n,
    plwd_total: rec.extended.disability.rate.n,
    plwd_pct: rec.extended.disability.rate.pct,
    children_plwd: 0,
    children_plwd_pct: 0,
    placeholders: {},
  };

  const pregnantAgeData = [
    { band: "< 18 yrs", Count: h2.pregnant_by_age.under_18 },
    { band: "18–24 yrs", Count: h2.pregnant_by_age["18_24"] },
    { band: "25–34 yrs", Count: h2.pregnant_by_age["25_34"] },
    { band: "35+ yrs", Count: h2.pregnant_by_age["35_plus"] },
  ];

  const disabilityTypesData = rec.extended.disability.types.map((t) => ({
    type: t.label,
    Count: t.count,
    "Share %": t.pct,
  }));
  const insurancePlaceholders = [
    { title: "HHs with Health Insurance" },
    { title: "Health Insurance Type" },
    { title: "HHs with No Health Insurance" },
    { title: "Children (0–7) in HH Covered" },
    { title: "Children (0–5) in HH Covered" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Health & Vulnerabilities
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Currently Pregnant"
          value={h2.pregnant_total.toLocaleString()}
          icon={<Heart size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="Lactating Mothers"
          value={h2.lactating_total.toLocaleString()}
          icon={<UserCheck size={18} />}
          accent="#075E54"
        />
        <KpiCard
          label="Persons w/ Disabilities"
          value={`${h2.plwd_pct}%`}
          icon={<Activity size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Children w/ Disabilities"
          value={h2.children_plwd.toLocaleString()}
          icon={<Activity size={18} />}
          accent="#D97706"
        />
      </div>
      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Vulnerability Map
        </div>
        <DrilldownMap
          data={data as DashboardData}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter ?? undefined}
          metric="vulnerability"
          height={400}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Pregnant Women by Age Band" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pregnantAgeData}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="band"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
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
                dataKey="Count"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                label={labelVal}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Disability Types Distribution" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={disabilityTypesData}
              layout="vertical"
              margin={{ top: 8, right: 35, left: 16, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="type"
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
                fill="#075E54"
                radius={[0, 4, 4, 0]}
                label={labelValH}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {insurancePlaceholders.map((p, i) => (
          <div
            key={i}
            className="bg-surface-light dark:bg-surface-dark rounded-xl border border-line-light dark:border-line-dark p-5 flex items-start gap-3"
          >
            <HelpCircle size={20} className="text-ink-muted" />
            <div>
              <h4 className="text-xs font-bold text-ink-primary dark:text-ink-onDark">
                {p.title}
              </h4>
              <p className="text-[11px] text-ink-faint mt-1.5 italic">
                Data Not Collected in This Wave.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const HealthNutrition = Health;
export default Health;
