import { type FC } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";
import {
  Heart,
  Activity,
  UserCheck,
  HelpCircle,
  AlertCircle,
} from "lucide-react";
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
  states?: GeoRecord[];
  national?: GeoRecord;
  path?: DrilldownPath;
  onPathChange?: (path: any) => void;
  stateFilter?: string | null;
}

export const Health: FC<HealthProps> = ({
  data,
  record: recordProp,
  path = {},
  onPathChange,
  stateFilter,
}) => {
  const theme = useChartTheme();

  // Flexible record resolution for legacy & new App calls
  const rec: GeoRecord | undefined = recordProp
    ? recordProp
    : data && "extended" in data
      ? (data as GeoRecord)
      : undefined;

  if (!rec) {
    return null;
  }

  const h2 = rec.extended.health_v2 ?? {
    pregnant_total: rec.extended.plw.pregnant.n,
    pregnant_caveat: "High survey non-response (63.1% missing in instrument)",
    pregnant_by_age: { under_18: 0, "18_24": 0, "25_34": 0, "35_plus": 0 },
    lactating_total: rec.extended.plw.lactating.n,
    lactating_caveat: "High survey non-response (89.7% missing in instrument)",
    plwd_total: rec.extended.disability.rate.n,
    plwd_male: 0,
    plwd_female: 0,
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
    {
      title: "Households with Health Insurance",
      id: "hhs_with_health_insurance",
    },
    { title: "Health Insurance Type", id: "health_insurance_type" },
    {
      title: "Households with No Health Insurance",
      id: "hhs_with_no_health_insurance",
    },
    {
      title: "Children (0–7) in HH Covered by Insurance",
      id: "children_0_7_covered",
    },
    {
      title: "Children (0–5) in HH Covered by Insurance",
      id: "children_0_5_covered",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Health & Special Vulnerabilities
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            Maternal health, persons with disabilities (PLWD), and healthcare
            indicators
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
          label="Currently Pregnant Women"
          value={h2.pregnant_total.toLocaleString()}
          sub="Reported pregnant primary respondents"
          icon={<Heart size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="Lactating Mothers"
          value={h2.lactating_total.toLocaleString()}
          sub="Reported lactating mothers"
          icon={<UserCheck size={18} />}
          accent="#075E54"
        />
        <KpiCard
          label="Persons with Disabilities (PLWD)"
          value={`${h2.plwd_pct}%`}
          sub={`${h2.plwd_total.toLocaleString()} total individuals`}
          icon={<Activity size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Children with Disabilities"
          value={h2.children_plwd.toLocaleString()}
          sub={`${h2.children_plwd_pct}% of children (0–17)`}
          icon={<Activity size={18} />}
          accent="#D97706"
        />
      </div>

      {/* Survey Limitations Alert */}
      <div className="flex items-start gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 p-4 rounded-xl">
        <AlertCircle
          className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
          size={18}
        />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-semibold">Survey Administration Note:</span>{" "}
          Maternal status fields (pregnant: 63.1% missing, lactating: 89.7%
          missing) carry high non-response rates in this survey wave. Totals
          represent reported cases only.
        </div>
      </div>

      {/* Dedicated Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-line-light dark:border-line-dark">
          <span className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
            Health & Vulnerability Geographic Map
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
          metric="vulnerability"
          height={400}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Pregnant Women by Age Band"
          takeaway="Distribution of reported pregnancies across age groups"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pregnantAgeData}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
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
                formatter={(val: number) => [
                  `${val.toLocaleString()} women`,
                  "Count",
                ]}
              />
              <Bar
                dataKey="Count"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Disability Types Distribution"
          takeaway="Breakdown of functional difficulties across individuals"
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={disabilityTypesData}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 16, bottom: 4 }}
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
                tick={{ fill: theme.axisTick, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number, _n, item) => [
                  `${Number(val).toLocaleString()} persons (${item.payload["Share %"]}%)`,
                  "",
                ]}
              />
              <Bar
                dataKey="Count"
                fill="#075E54"
                radius={[0, 4, 4, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Decision 1 Option B Honest Placeholder Cards */}
      <div className="pt-2">
        <div className="mb-4">
          <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark">
            Health Insurance Indicators (UNICEF Review Sheet #4)
          </h3>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            Indicators requested in review not covered by the pilot survey
            instrument
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insurancePlaceholders.map((p) => (
            <div
              key={p.id}
              className="bg-surface-light dark:bg-surface-dark rounded-xl border border-line-light dark:border-line-dark p-5 shadow-card flex items-start gap-3"
            >
              <div className="p-2.5 bg-surface-page dark:bg-surface-darker rounded-lg border border-line-light dark:border-line-dark text-ink-muted dark:text-ink-onDarkMuted shrink-0">
                <HelpCircle size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-ink-primary dark:text-ink-onDark leading-tight">
                  {p.title}
                </h4>
                <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
                  Data Not Collected in This Wave.
                </p>
                <p className="text-[11px] text-ink-faint dark:text-ink-onDarkMuted mt-1.5 italic">
                  Variable absent from 235-column instrument.
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HealthNutrition = Health;
export default Health;
