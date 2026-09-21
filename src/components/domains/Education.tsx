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
  path?: DrilldownPath;
  onPathChange?: (path: any) => void;
  stateFilter?: string | null;
  states?: GeoRecord[];
  national?: GeoRecord;
}

export const Education: React.FC<EducationProps> = ({
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

  const labelPct = {
    position: "top" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: (v: number) => (v > 0 ? `${v.toFixed(1)}%` : ""),
  };
  const labelVal = {
    position: "top" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };

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
      band: "6–9 (Prim)",
      Male: edu.oos_6_9.male.oos_pct,
      Female: edu.oos_6_9.female.oos_pct,
    },
    {
      band: "10–14 (JSS)",
      Male: edu.oos_10_14.male.oos_pct,
      Female: edu.oos_10_14.female.oos_pct,
    },
    {
      band: "15–17 (SSS)",
      Male: edu.oos_15_17.male.oos_pct,
      Female: edu.oos_15_17.female.oos_pct,
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
            Education / Out-of-School
          </h2>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="OOS Rate (6–17)"
          value={`${edu.oos_6_17.oos_pct}%`}
          icon={<AlertCircle size={18} />}
          accent="#DC2626"
        />
        <KpiCard
          label="OOS Rate (6–9)"
          value={`${edu.oos_6_9.oos_pct}%`}
          icon={<BookOpen size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="OOS Rate (15–17)"
          value={`${edu.oos_15_17.oos_pct}%`}
          icon={<Calendar size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Disabled OOS"
          value={`${edu.disabled_children.oos_pct}%`}
          icon={<Award size={18} />}
          accent="#075E54"
        />
      </div>
      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Out-of-School Rate Map
        </div>
        <DrilldownMap
          data={data as DashboardData}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter ?? undefined}
          metric="out_of_school"
          height={400}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="OOS Rate by Age Band & Gender" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={oosBandsData}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="band"
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
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Legend verticalAlign="top" align="right" />
              <Bar
                dataKey="Male"
                fill="#075E54"
                radius={[4, 4, 0, 0]}
                label={labelPct}
              />
              <Bar
                dataKey="Female"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                label={labelPct}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard
          title="Attendance Among Children with Disabilities"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={disabledEducationData}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
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
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} label={labelVal}>
                {disabledEducationData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#059669" : "#DC2626"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="In-School Children Grade Distribution" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={edu.grade_distribution}
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
        <ChartCard title="Drop-Out Period (Year Stopped School)" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={edu.dropout_period}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
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
                label={labelVal}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default Education;
