import React from "react";
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
import { BookOpen, AlertCircle, Award, Calendar } from "lucide-react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";

interface EducationProps {
  data?: GeoRecord | DashboardData;
  record?: GeoRecord;
  states?: GeoRecord[];
  national?: GeoRecord;
  path?: DrilldownPath;
  onPathChange?: (path: any) => void;
  stateFilter?: string | null;
}

export const Education: React.FC<EducationProps> = ({
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

  const edu = rec.extended.education_v2 ?? {
    oos_6_17: {
      total: 0,
      oos: 0,
      enrolled: 0,
      oos_pct: rec.unicef.out_of_school_rate_pct,
      male: { total: 0, oos: 0, oos_pct: 0 },
      female: { total: 0, oos: 0, oos_pct: 0 },
    },
    oos_6_9: {
      total: 0,
      oos: 0,
      enrolled: 0,
      oos_pct: 0,
      male: { total: 0, oos: 0, oos_pct: 0 },
      female: { total: 0, oos: 0, oos_pct: 0 },
    },
    oos_10_14: {
      total: 0,
      oos: 0,
      enrolled: 0,
      oos_pct: 0,
      male: { total: 0, oos: 0, oos_pct: 0 },
      female: { total: 0, oos: 0, oos_pct: 0 },
    },
    oos_15_17: {
      total: 0,
      oos: 0,
      enrolled: 0,
      oos_pct: 0,
      male: { total: 0, oos: 0, oos_pct: 0 },
      female: { total: 0, oos: 0, oos_pct: 0 },
    },
    disabled_children: { total: 0, oos: 0, enrolled: 0, oos_pct: 0 },
    grade_distribution: [],
    oos_grade_distribution: [],
    dropout_period: [],
  };

  const oosBandsData = [
    {
      band: "6–9 yrs (Primary)",
      Male: edu.oos_6_9.male.oos_pct,
      Female: edu.oos_6_9.female.oos_pct,
      Overall: edu.oos_6_9.oos_pct,
    },
    {
      band: "10–14 yrs (JSS)",
      Male: edu.oos_10_14.male.oos_pct,
      Female: edu.oos_10_14.female.oos_pct,
      Overall: edu.oos_10_14.oos_pct,
    },
    {
      band: "15–17 yrs (SSS)",
      Male: edu.oos_15_17.male.oos_pct,
      Female: edu.oos_15_17.female.oos_pct,
      Overall: edu.oos_15_17.oos_pct,
    },
  ];

  const disabledEducationData = [
    { status: "In School", count: edu.disabled_children.enrolled },
    { status: "Out of School", count: edu.disabled_children.oos },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Education / Out-of-School Children
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            School attendance, grade completion, and out-of-school rates across
            age bands
          </p>
        </div>
        <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted bg-surface-page dark:bg-surface-darker px-3 py-1.5 rounded-lg border border-line-light dark:border-line-dark">
          Data as of:{" "}
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            September 2026
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Out-of-School Rate (6–17)"
          value={`${edu.oos_6_17.oos_pct}%`}
          sub={`${edu.oos_6_17.oos.toLocaleString()} out of school children`}
          icon={<AlertCircle size={18} />}
          accent="#DC2626"
        />
        <KpiCard
          label="OOS Rate (6–9 Primary)"
          value={`${edu.oos_6_9.oos_pct}%`}
          sub={`${edu.oos_6_9.oos.toLocaleString()} children 6–9 yrs`}
          icon={<BookOpen size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="OOS Rate (15–17 Upper Sec)"
          value={`${edu.oos_15_17.oos_pct}%`}
          sub={`${edu.oos_15_17.oos.toLocaleString()} youth 15–17 yrs`}
          icon={<Calendar size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Disabled Children Out of School"
          value={`${edu.disabled_children.oos_pct}%`}
          sub={`${edu.disabled_children.oos.toLocaleString()} children with disability`}
          icon={<Award size={18} />}
          accent="#075E54"
        />
      </div>

      {/* Dedicated Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-line-light dark:border-line-dark">
          <span className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
            Out-of-School Rate Geographic Map
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
          metric="out_of_school"
          height={400}
        />
      </div>

      {/* Charts Row 1: OOS by Age Band x Gender */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Out-of-School Rate by Age Band & Gender"
          takeaway="Comparison of out-of-school prevalence across primary and secondary bands"
          height={320}
          accent={edu.oos_6_17.oos_pct > 25 ? "bad" : "neutral"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={oosBandsData}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="band"
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
                formatter={(val: number) => [`${val}%`, ""]}
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
                dataKey="Male"
                fill="#075E54"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Bar
                dataKey="Female"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="School Attendance Among Children with Disabilities"
          takeaway="In-school vs Out-of-school counts for children with functional difficulties"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={disabledEducationData}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="status"
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
                  `${val.toLocaleString()} children`,
                  "Count",
                ]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={36}>
                <Cell fill="#059669" />
                <Cell fill="#DC2626" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Grade Completed & Dropout Period */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="In-School Children Grade Distribution"
          takeaway="Current grade level for attending school children"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={edu.grade_distribution}
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
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Drop-Out Period (Year Stopped School)"
          takeaway="Reported year children stopped attending school"
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={edu.dropout_period}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="label"
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
                dataKey="count"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Education;
