import { type FC } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";
import {
  Activity,
  AlertTriangle,
  ShieldCheck,
  Heart,
  UserCheck,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  const labelPct = {
    position: "top" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: (v: number) => (v > 0 ? `${v.toFixed(1)}%` : ""),
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
    by_gender: {
      male: { total: 0, sam: 0, mam: 0, wasting_pct: 0 },
      female: { total: 0, sam: 0, mam: 0, wasting_pct: 0 },
    },
  };

  const plw = record.extended.health_v2 ?? {
    pregnant_total: 0,
    lactating_total: 0,
  };

  const muacOverview = [
    { name: "Normal (Green)", count: nut.normal_count, color: "#059669" },
    { name: "MAM (Yellow)", count: nut.mam_count, color: "#D97706" },
    { name: "SAM (Red)", count: nut.sam_count, color: "#DC2626" },
  ];
  const genderWasting = [
    { gender: "Male", "Wasting %": nut.by_gender.male.wasting_pct },
    { gender: "Female", "Wasting %": nut.by_gender.female.wasting_pct },
  ];

  const nutritionPlaceholders = [
    { title: "Pregnant women enrolled into food/nutrition programme" },
    {
      title:
        "Children with Malnutrition enrolled into food/nutrition programme",
    },
    {
      title:
        "Children with Malnutrition not enrolled into food/nutrition programme",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Nutrition & Malnutrition Counts
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <KpiCard
          label="Currently Pregnant"
          value={plw.pregnant_total.toLocaleString()}
          icon={<Heart size={16} />}
          accent="#9333EA"
        />
        <KpiCard
          label="Lactating Mothers"
          value={plw.lactating_total.toLocaleString()}
          icon={<UserCheck size={16} />}
          accent="#0284C7"
        />
        <KpiCard
          label="SAM (MUAC Red)"
          value={nut.sam_count.toLocaleString()}
          icon={<Activity size={16} />}
          accent="#DC2626"
        />
        <KpiCard
          label="MAM (MUAC Yellow)"
          value={nut.mam_count.toLocaleString()}
          icon={<AlertTriangle size={16} />}
          accent="#D97706"
        />
        <KpiCard
          label="Normal (MUAC Green)"
          value={nut.normal_count.toLocaleString()}
          icon={<ShieldCheck size={16} />}
          accent="#059669"
        />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Children with acute malnutrition (Count)"
          height={300}
        >
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
        <ChartCard title="Under-5 Wasting by Gender" height={300}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genderWasting}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="gender"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                unit="%"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={theme.tooltip} />
              <Legend verticalAlign="top" align="right" />
              <Bar
                dataKey="Wasting %"
                fill="#075E54"
                radius={[4, 4, 0, 0]}
                label={labelPct}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        {nutritionPlaceholders.map((p, i) => (
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
                Enrollment cross-tabs not captured in this survey wave.
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Nutrition;
