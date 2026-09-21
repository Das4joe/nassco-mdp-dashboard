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

  const ageBands = record.extended.age_bands_v2 || {
    "0-3": { total: 0, male: 0, female: 0 },
    "0-5": {
      total: record.extended.birth_cert?.under_5?.d || 0,
      male: 0,
      female: 0,
    },
    "0-7": { total: 0, male: 0, female: 0 },
    "0-17": { total: record.nsr.children_under18 || 0, male: 0, female: 0 },
    "6-9": { total: 0, male: 0, female: 0 },
    "10-14": { total: 0, male: 0, female: 0 },
    "15-17": { total: 0, male: 0, female: 0 },
    "18-24": { total: 0, male: 0, female: 0 },
  };

  // 1. Age band distribution x Gender
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
      band: "18–24 (Youth)",
      Male: ageBands["18-24"].male,
      Female: ageBands["18-24"].female,
    },
  ];

  // 2. Focused 0–24 Population Pyramid
  const pyramid024Data = record.extended.age_sex_pyramid
    .filter((p) => ["0-4", "5-11", "12-17", "18-24"].includes(p.band))
    .map((p) => ({
      band: p.band,
      Male: -p.male,
      Female: p.female,
      rawMale: p.male,
      rawFemale: p.female,
    }));

  // 3. State-level comparison for Total HHs & Female Headed %
  const stateComparisonData = data.states.map((s) => ({
    state: s.state,
    Households: s.nsr.total_households,
    "Female Head %": s.extended.female_primary_respondent.pct,
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
            Core population demographics, household registrations, and poverty
            vulnerability
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
          label="Total Households Registered"
          value={record.nsr.total_households.toLocaleString()}
          sub={`Across ${record.level === "national" ? "4 Pilot States" : record.state}`}
          icon={<Home size={18} />}
          accent="#075E54"
        />
        <KpiCard
          label="Total Individuals"
          value={record.nsr.total_individuals.toLocaleString()}
          sub={`Avg HH Size: ${record.nsr.avg_household_size}`}
          icon={<Users size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Female Primary Respondent %"
          value={`${record.extended.female_primary_respondent.pct}%`}
          sub={`${record.extended.female_primary_respondent.n.toLocaleString()} female respondents`}
          icon={<UserCheck size={18} />}
          accent="#E67E22"
        />
        <KpiCard
          label="Children in PVHH (Deciles 1-3)"
          value={`${record.extended.children_in_pvhh.pct}%`}
          sub={`${record.extended.children_in_pvhh.n.toLocaleString()} children under 18`}
          icon={<ShieldAlert size={18} />}
          accent="#DC2626"
        />
      </div>

      {/* Overview Map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-line-light dark:border-line-dark">
          <span className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
            Multi-Dimensional Poverty & Registration Map
          </span>
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

      {/* Charts Row 1: Age Bands x Gender & Population Pyramid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Demographic Age Bands by Gender"
          takeaway="Child (0-3, 0-5, 6-9, 10-14, 15-17) and Youth (18-24) breakdowns"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ageGroupData}
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
                  `${val.toLocaleString()} persons`,
                  "",
                ]}
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
                barSize={22}
              />
              <Bar
                dataKey="Female"
                fill="#E67E22"
                radius={[4, 4, 0, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Youth & Child Population Pyramid (0–24 Years)"
          takeaway="Male (left) vs Female (right) age distribution for young demographics"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pyramid024Data}
              layout="vertical"
              margin={{ top: 16, right: 20, left: 10, bottom: 4 }}
            >
              <XAxis
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string | number) =>
                  Math.abs(Number(v)).toString()
                }
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
                radius={[4, 0, 0, 4]}
                barSize={20}
              />
              <Bar
                dataKey="Female"
                fill="#E67E22"
                radius={[0, 4, 4, 0]}
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* State-Level Comparisons */}
      <ChartCard
        title="State Household Registration & Poverty Vulnerability"
        takeaway="Total registered households and poverty counts across the pilot states"
        height={280}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={stateComparisonData}
            margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
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
              formatter={(val: number, name: string) => [
                val.toLocaleString(),
                name,
              ]}
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
              dataKey="Households"
              fill="#075E54"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
            <Bar
              dataKey="PVHH Count"
              fill="#DC2626"
              radius={[4, 4, 0, 0]}
              barSize={28}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
};

export default GlobalOverview;
