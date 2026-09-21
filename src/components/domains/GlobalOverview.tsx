import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Users, Home, UserCheck, ShieldAlert } from "lucide-react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";

interface GlobalOverviewProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const labelProps = {
    position: "top" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };
  const hLabelProps = { ...labelProps, position: "right" as const };

  const ageBands = record.extended.age_bands_v2 || {
    "0-3": { total: 0, male: 0, female: 0 },
    "0-5": { total: 0, male: 0, female: 0 },
    "0-7": { total: 0, male: 0, female: 0 },
    "0-17": { total: 0, male: 0, female: 0 },
    "6-9": { total: 0, male: 0, female: 0 },
    "10-14": { total: 0, male: 0, female: 0 },
    "15-17": { total: 0, male: 0, female: 0 },
    "18-24": { total: 0, male: 0, female: 0 },
  };

  const ageGroupData = [
    {
      band: "0–3 yrs",
      Male: ageBands["0-3"].male,
      Female: ageBands["0-3"].female,
    },
    {
      band: "0–5 yrs",
      Male: ageBands["0-5"].male,
      Female: ageBands["0-5"].female,
    },
    {
      band: "6–9 yrs",
      Male: ageBands["6-9"].male,
      Female: ageBands["6-9"].female,
    },
    {
      band: "10–14 yrs",
      Male: ageBands["10-14"].male,
      Female: ageBands["10-14"].female,
    },
    {
      band: "15–17 yrs",
      Male: ageBands["15-17"].male,
      Female: ageBands["15-17"].female,
    },
    {
      band: "18–24",
      Male: ageBands["18-24"].male,
      Female: ageBands["18-24"].female,
    },
  ];

  const pyramid024Data = record.extended.age_sex_pyramid
    .filter((p) => ["0-4", "5-11", "12-17", "18-24"].includes(p.band))
    .map((p) => ({
      band: p.band,
      Male: -p.male,
      Female: p.female,
      rawMale: p.male,
    }));

  const stateComparisonData = data.states.map((s) => ({
    state: s.state,
    Households: s.nsr.total_households,
    "PVHH Count": s.vulnerability.poorest_households,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Global / Overview
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            Core population demographics and household registrations
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Households"
          value={record.nsr.total_households.toLocaleString()}
          icon={<Home size={18} />}
          accent="#075E54"
        />
        <KpiCard
          label="Total Individuals"
          value={record.nsr.total_individuals.toLocaleString()}
          icon={<Users size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Female Head %"
          value={`${record.extended.female_primary_respondent.pct}%`}
          icon={<UserCheck size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="Children in PVHH"
          value={`${record.extended.children_in_pvhh.pct}%`}
          icon={<ShieldAlert size={18} />}
          accent="#DC2626"
        />
      </div>
      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Multi-Dimensional Poverty Map
        </div>
        <DrilldownMap
          data={data}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter}
          metric="vulnerability"
          height={400}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Demographic Age Bands by Gender" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ageGroupData}
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
                label={labelProps}
              />
              <Bar
                dataKey="Female"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                label={labelProps}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Youth & Child Population Pyramid" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pyramid024Data}
              layout="vertical"
              margin={{ top: 16, right: 30, left: 10, bottom: 4 }}
            >
              <XAxis
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => Math.abs(Number(v)).toString()}
              />
              <YAxis
                dataKey="band"
                type="category"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number, name: string) => [
                  Math.abs(Number(val)).toLocaleString(),
                  name,
                ]}
              />
              <Legend verticalAlign="top" align="right" />
              <Bar
                dataKey="Male"
                fill="#075E54"
                radius={[4, 0, 0, 4]}
                label={{
                  ...labelProps,
                  position: "left",
                  formatter: (v: number) =>
                    v < 0 ? Math.abs(v).toLocaleString() : "",
                }}
              />
              <Bar
                dataKey="Female"
                fill="#E67E22"
                radius={[0, 4, 4, 0]}
                label={hLabelProps}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <ChartCard title="State Household Registration & Poverty" height={280}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stateComparisonData}
            margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
          >
            <XAxis
              dataKey="state"
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
              dataKey="Households"
              fill="#075E54"
              radius={[4, 4, 0, 0]}
              label={labelProps}
            />
            <Bar
              dataKey="PVHH Count"
              fill="#DC2626"
              radius={[4, 4, 0, 0]}
              label={labelProps}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};
export default GlobalOverview;
