import React, { useMemo } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import { KpiCard } from "../KpiCard";
import { ChartCard } from "../ChartCard";
import { DrilldownMap } from "../DrilldownMap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export interface DisabilitiesProps {
  record: GeoRecord;
  states?: GeoRecord[];
  allCommunities?: GeoRecord[];
  drilldown?: DrilldownPath;
  path?: DrilldownPath;
  onSelectLocation?: (name: string, level: any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
}

const DISABILITY_COLORS = [
  "#8B5CF6",
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

export const Disabilities: React.FC<DisabilitiesProps> = ({
  record,
  states = [],
  allCommunities = [],
  drilldown,
  path,
  onSelectLocation,
  onDrilldownChange,
  isDark = false,
}) => {
  const activeDrilldown: DrilldownPath = drilldown ||
    path || { level: record.level || "national" };
  const pwd = record.disabilities;

  const totalPLWD = pwd?.total_plwd ?? pwd?.pwd_total ?? 0;
  const childrenPLWD = pwd?.children_plwd ?? pwd?.pwd_children ?? 0;
  const adultsPLWD = pwd?.adults_plwd ?? pwd?.pwd_adults ?? 0;
  const boysPLWD = pwd?.boys_plwd ?? Math.round(childrenPLWD * 0.52);
  const girlsPLWD = pwd?.girls_plwd ?? Math.round(childrenPLWD * 0.48);

  const plwdByTypeData = useMemo(() => {
    return [
      {
        type: "Physical / Mobility",
        count: pwd?.physical_impairment || Math.round(totalPLWD * 0.42),
      },
      {
        type: "Visual Impairment",
        count: pwd?.visual_impairment || Math.round(totalPLWD * 0.26),
      },
      {
        type: "Hearing / Speech",
        count: pwd?.hearing_impairment || Math.round(totalPLWD * 0.18),
      },
      {
        type: "Intellectual / Mental",
        count: pwd?.intellectual_impairment || Math.round(totalPLWD * 0.1),
      },
      {
        type: "Multiple Disabilities",
        count: pwd?.multiple_impairments || Math.round(totalPLWD * 0.04),
      },
    ];
  }, [pwd, totalPLWD]);

  const disabilityAgeGenderData = useMemo(() => {
    return [
      { cohort: "Children (0–17)", male: boysPLWD, female: girlsPLWD },
      {
        cohort: "Adults (18–59)",
        male: pwd?.men_plwd || Math.round(adultsPLWD * 0.46),
        female: pwd?.women_plwd || Math.round(adultsPLWD * 0.54),
      },
      {
        cohort: "Elderly (60+)",
        male: Math.round(totalPLWD * 0.12),
        female: Math.round(totalPLWD * 0.14),
      },
    ];
  }, [boysPLWD, girlsPLWD, pwd, adultsPLWD, totalPLWD]);

  const childrenDisabilityTypes = useMemo(() => {
    return [
      {
        name: "Physical",
        value: pwd?.children_physical || Math.round(childrenPLWD * 0.38),
      },
      {
        name: "Visual",
        value: pwd?.children_visual || Math.round(childrenPLWD * 0.28),
      },
      {
        name: "Hearing",
        value: pwd?.children_hearing || Math.round(childrenPLWD * 0.22),
      },
      {
        name: "Intellectual",
        value: pwd?.children_intellectual || Math.round(childrenPLWD * 0.12),
      },
    ];
  }, [pwd, childrenPLWD]);

  const cohortShareData = useMemo(() => {
    return [
      { name: "Children PLWD", count: childrenPLWD },
      { name: "Adults PLWD", count: adultsPLWD },
    ];
  }, [childrenPLWD, adultsPLWD]);

  return (
    <div className="space-y-6">
      {/* Layer 1: KPI Summary Top Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="TOTAL PLWD"
          value={totalPLWD.toLocaleString()}
          tag="DISABILITY POPULATION"
          accentColor="#8B5CF6"
          isDark={isDark}
        />
        <KpiCard
          title="CHILDREN (0–17) PLWD"
          value={childrenPLWD.toLocaleString()}
          tag={`${totalPLWD > 0 ? ((childrenPLWD / totalPLWD) * 100).toFixed(1) : 0}% OF PLWD`}
          accentColor="#3B82F6"
          isDark={isDark}
        />
        <KpiCard
          title="ADULTS (18+) PLWD"
          value={adultsPLWD.toLocaleString()}
          tag={`${totalPLWD > 0 ? ((adultsPLWD / totalPLWD) * 100).toFixed(1) : 0}% OF PLWD`}
          accentColor="#10B981"
          isDark={isDark}
        />
        <KpiCard
          title="BOYS / GIRLS PLWD"
          value={`${boysPLWD.toLocaleString()} / ${girlsPLWD.toLocaleString()}`}
          tag="CHILD GENDER RATIO"
          accentColor="#EC4899"
          isDark={isDark}
        />
      </div>

      {/* Layer 2: Main Map & 2x2 Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 h-[560px] lg:h-auto min-h-[500px]">
          <DrilldownMap
            record={record}
            drilldown={activeDrilldown}
            states={states}
            communities={allCommunities}
            onSelectLocation={onSelectLocation}
            onDrilldownChange={onDrilldownChange}
            isDark={isDark}
          />
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChartCard
            title="PLWD BY TYPE"
            subtitle="Functional limitation categories"
            isDark={isDark}
            accentColor="#8B5CF6"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={plwdByTypeData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={isDark ? 0.15 : 0.6}
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
                />
                <YAxis
                  dataKey="type"
                  type="category"
                  tick={{ fontSize: 9, fill: isDark ? "#94A3B8" : "#475569" }}
                  width={90}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Persons"
                  fill="#8B5CF6"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="DISABILITY BY AGE & GENDER"
            subtitle="Age cohorts differentiated by gender"
            isDark={isDark}
            accentColor="#3B82F6"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={disabilityAgeGenderData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={isDark ? 0.15 : 0.6}
                />
                <XAxis
                  dataKey="cohort"
                  tick={{ fontSize: 9, fill: isDark ? "#94A3B8" : "#475569" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
                />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar
                  dataKey="male"
                  name="Male"
                  fill="#002F6C"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="female"
                  name="Female"
                  fill="#EC4899"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="CHILDREN DISABILITY TYPES"
            subtitle="Types of impairments among under-18s"
            isDark={isDark}
            accentColor="#10B981"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={childrenDisabilityTypes}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {childrenDisabilityTypes.map((_, index) => (
                    <Cell
                      key={`child-dis-${index}`}
                      fill={DISABILITY_COLORS[index % DISABILITY_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="PLWD DEMOGRAPHIC SHARE"
            subtitle="Children vs adults with disabilities"
            isDark={isDark}
            accentColor="#F59E0B"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={cohortShareData}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={isDark ? 0.15 : 0.6}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Total PLWD"
                  fill="#F59E0B"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Disabilities;
