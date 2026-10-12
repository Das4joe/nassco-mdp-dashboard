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
import {
  BookOpen,
  AlertCircle,
  Award,
  Calendar,
  HelpCircle,
} from "lucide-react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";

interface EducationProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const Education: React.FC<EducationProps> = ({
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
    fontSize: 10,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };
  const labelValH = {
    position: "right" as const,
    fill: theme.axisTick,
    fontSize: 10,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };

  const edu = record.extended.education_v2 ?? {
    oos_6_17: {
      total: 0,
      oos: 0,
      enrolled: 0,
      oos_pct: 0,
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
      Male: edu.oos_6_9.male.oos,
      Female: edu.oos_6_9.female.oos,
    },
    {
      band: "10–14 (JSS)",
      Male: edu.oos_10_14.male.oos,
      Female: edu.oos_10_14.female.oos,
    },
    {
      band: "15–17 (SSS)",
      Male: edu.oos_15_17.male.oos,
      Female: edu.oos_15_17.female.oos,
    },
  ];

  const genderNotAttendingData = [
    { gender: "Boys (0-17)", count: edu.oos_6_17.male.oos },
    { gender: "Girls (0-17)", count: edu.oos_6_17.female.oos },
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
          label="OOS (6–17 yrs)"
          value={edu.oos_6_17.oos.toLocaleString()}
          icon={<AlertCircle size={18} />}
          accent="#DC2626"
        />
        <KpiCard
          label="OOS (6–9 yrs)"
          value={edu.oos_6_9.oos.toLocaleString()}
          icon={<BookOpen size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="OOS (15–17 yrs)"
          value={edu.oos_15_17.oos.toLocaleString()}
          icon={<Calendar size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Disabled OOS"
          value={edu.disabled_children.oos.toLocaleString()}
          icon={<Award size={18} />}
          accent="#075E54"
        />
      </div>
      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Out-of-School Rate Map
        </div>
        <DrilldownMap
          data={data}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter}
          metric="out_of_school"
          height={400}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Out-of-School Children (Count by Band & Gender)"
          height={320}
        >
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
                label={labelVal}
              />
              <Bar
                dataKey="Female"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                label={labelVal}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Children Not Attending by Gender (0-17)" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genderNotAttendingData}
              layout="vertical"
              margin={{ top: 25, right: 30, left: 10, bottom: 4 }}
            >
              <XAxis type="number" hide />
              <YAxis
                dataKey="gender"
                type="category"
                width={100}
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip contentStyle={theme.tooltip} />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} label={labelValH}>
                {genderNotAttendingData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#0284C7" : "#E67E22"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Last Grade Completed (In-School)" height={280}>
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
              <Tooltip contentStyle={theme.tooltip} />
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
              <Tooltip contentStyle={theme.tooltip} />
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
      <div className="grid grid-cols-1 gap-4 pt-2">
        <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-line-light dark:border-line-dark p-5 flex items-start gap-3">
          <HelpCircle size={20} className="text-ink-muted" />
          <div>
            <h4 className="text-xs font-bold text-ink-primary dark:text-ink-onDark">
              Children with disabilities never enrolled (Male/Female)
            </h4>
            <p className="text-[11px] text-ink-faint mt-1.5 italic">
              Specific gender-disability cross-tabulation for non-enrollment was
              not captured in this survey wave.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Education;
