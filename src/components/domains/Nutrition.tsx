import { type FC } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";
import { Activity, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
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
  const nut = record.extended.nutrition_v2 ?? {
    eligible_under5: record.extended.muac_distribution?.measured_n ?? 0,
    sam_count: record.extended.muac_distribution?.categories?.Red ?? 0,
    mam_count: record.extended.muac_distribution?.categories?.Yellow ?? 0,
    normal_count: record.extended.muac_distribution?.categories?.Green ?? 0,
    wasted_count:
      (record.extended.muac_distribution?.categories?.Red ?? 0) +
      (record.extended.muac_distribution?.categories?.Yellow ?? 0),
    sam_pct: 0,
    mam_pct: 0,
    normal_pct: 0,
    wasting_pct: record.unicef.under5_wasting_pct ?? 0,
    by_gender: {
      male: { total: 0, sam: 0, mam: 0, wasting_pct: 0 },
      female: { total: 0, sam: 0, mam: 0, wasting_pct: 0 },
    },
    placeholders: {
      pregnant_enrolled_fn: {
        status: "not_collected",
        label: "Pregnant women enrolled in F&N programme",
      },
      malnourished_children_enrolled_fn: {
        status: "not_collected",
        label: "Children with malnutrition enrolled in F&N programme",
      },
    },
  };

  const muacOverview = [
    {
      name: "Normal (Green)",
      count: nut.normal_count,
      pct: nut.normal_pct,
      color: "#059669",
    },
    {
      name: "MAM (Yellow)",
      count: nut.mam_count,
      pct: nut.mam_pct,
      color: "#D97706",
    },
    {
      name: "SAM (Red)",
      count: nut.sam_count,
      pct: nut.sam_pct,
      color: "#DC2626",
    },
  ];

  const genderWasting = [
    { gender: "Male", "Wasting %": nut.by_gender.male.wasting_pct },
    { gender: "Female", "Wasting %": nut.by_gender.female.wasting_pct },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Nutrition & Acute Malnutrition
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            MUAC screening results for children aged 6–59 months
          </p>
        </div>
        <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted bg-surface-page dark:bg-surface-darker px-3 py-1.5 rounded-lg border border-line-light dark:border-line-dark">
          Data as of:{" "}
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            September 2026
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Under-5 Wasting Rate"
          value={`${nut.wasting_pct}%`}
          sub={`${nut.wasted_count.toLocaleString()} children acute malnourished`}
          icon={<AlertTriangle size={18} />}
          accent="#DC2626"
        />
        <KpiCard
          label="Severe Acute (SAM)"
          value={`${nut.sam_pct}%`}
          sub={`${nut.sam_count.toLocaleString()} SAM children (MUAC < 11.5cm)`}
          icon={<Activity size={18} />}
          accent="#B91C1C"
        />
        <KpiCard
          label="Moderate Acute (MAM)"
          value={`${nut.mam_pct}%`}
          sub={`${nut.mam_count.toLocaleString()} MAM children (11.5–12.5cm)`}
          icon={<AlertTriangle size={18} />}
          accent="#D97706"
        />
        <KpiCard
          label="Normal Nutrition Status"
          value={`${nut.normal_pct}%`}
          sub={`${nut.normal_count.toLocaleString()} well-nourished children`}
          icon={<ShieldCheck size={18} />}
          accent="#059669"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-line-light dark:border-line-dark">
          <span className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
            Nutrition Wasting Map (6–59 Months)
          </span>
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
          title="Child Acute Malnutrition Status (6–59 Months)"
          takeaway="Breakdown across Normal, Moderate (MAM), and Severe (SAM) malnutrition"
          height={300}
          accent={nut.wasting_pct > 20 ? "bad" : "neutral"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={muacOverview}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
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
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number, _n, item) => [
                  `${Number(val).toLocaleString()} children (${item.payload.pct}%)`,
                  "",
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={32}>
                {muacOverview.map((entry, idx) => (
                  <Cell key={idx} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Under-5 Wasting by Gender"
          takeaway="Acute malnutrition prevalence comparison between boys and girls"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genderWasting}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="gender"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                unit="%"
                domain={[0, 100]}
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number) => [`${val}%`, "Wasting Rate"]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                formatter={(v) => (
                  <span className="text-xs text-ink-primary dark:text-ink-onDark">
                    {v}
                  </span>
                )}
              />
              <Bar
                dataKey="Wasting %"
                fill="#075E54"
                radius={[4, 4, 0, 0]}
                barSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Decision 2 Honest Placeholder Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-line-light dark:border-line-dark p-6 shadow-card flex items-start gap-4">
          <div className="p-3 bg-surface-page dark:bg-surface-darker rounded-xl border border-line-light dark:border-line-dark text-ink-muted dark:text-ink-onDarkMuted shrink-0">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-primary dark:text-ink-onDark">
              Pregnant women enrolled into food and nutrition programme
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
              Data Not Collected in This Wave.
            </p>
            <p className="text-[11px] text-ink-faint dark:text-ink-onDarkMuted mt-2 italic">
              This variable was not included in the 235-column survey
              instrument.
            </p>
          </div>
        </div>

        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-line-light dark:border-line-dark p-6 shadow-card flex items-start gap-4">
          <div className="p-3 bg-surface-page dark:bg-surface-darker rounded-xl border border-line-light dark:border-line-dark text-ink-muted dark:text-ink-onDarkMuted shrink-0">
            <HelpCircle size={24} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink-primary dark:text-ink-onDark">
              Children with malnutrition enrolled into food and nutrition
              programme
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
              Data Not Collected in This Wave.
            </p>
            <p className="text-[11px] text-ink-faint dark:text-ink-onDarkMuted mt-2 italic">
              This variable was not included in the 235-column survey
              instrument.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
