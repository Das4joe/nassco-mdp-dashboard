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

interface NutritionProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const Nutrition: FC<NutritionProps> = ({
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

  const nut = record.extended.nutrition_v2 ?? {
    eligible_under5: 0,
    sam_count: 0,
    mam_count: 0,
    normal_count: 0,
    wasted_count: 0,
    sam_pct: 0,
    mam_pct: 0,
    normal_pct: 0,
    wasting_pct: 0,
  };
  const plw = record.extended.health_v2 ?? {
    pregnant_total: 0,
    lactating_total: 0,
  };

  const muacOverview = [
    { name: "SAM", count: nut.sam_count, color: "#DC2626" },
    { name: "MAM", count: nut.mam_count, color: "#D97706" },
    { name: "Normal", count: nut.normal_count, color: "#059669" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Nutrition
          </h2>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Indicator
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { l: "Currently Pregnant", v: plw.pregnant_total, c: "#9333EA" },
            { l: "Lactating Mothers", v: plw.lactating_total, c: "#0284C7" },
            {
              l: "Children with Severe Acute Malnutrition - SAM",
              v: nut.sam_count,
              c: "#DC2626",
            },
            {
              l: "Children Moderate Acute Malnutrition - MAM",
              v: nut.mam_count,
              c: "#D97706",
            },
            {
              l: "Children Moderate Acute Malnutrition - Normal",
              v: nut.normal_count,
              c: "#059669",
            },
            {
              l: "Pregnant women enrolled into food and nutrition programme",
              v: 0,
              c: "#64748b",
              ph: true,
            },
            {
              l: "Children with Malnutrition enrolled into food and nutrition programme",
              v: 0,
              c: "#64748b",
              ph: true,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-lg p-3 shadow-sm flex flex-col justify-between"
            >
              <div className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-onDarkMuted mb-2 leading-tight">
                {item.l}
              </div>
              {item.ph ? (
                <div className="text-[10px] italic text-ink-faint">
                  Data missing from source
                </div>
              ) : (
                <div className="text-xl font-black" style={{ color: item.c }}>
                  {item.v.toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Nutrition Wasting Map
        </div>
        <DrilldownMap
          data={data}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter}
          metric="wasting"
          height={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ChartCard title="Children with acute malnutrition" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={muacOverview}
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
                {muacOverview.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Children with Malnutrition enrolled into food and nutrition programme"
          height={300}
        >
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Programme enrollment cross-tabulation data not captured in current
            survey wave.
          </div>
        </ChartCard>

        <ChartCard
          title="Children with Malnutrition not enrolled into food and nutrition programme"
          height={300}
        >
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Programme enrollment cross-tabulation data not captured in current
            survey wave.
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
export default Nutrition;
