import React, { useMemo } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import { KpiCard } from "../KpiCard";
import { ChartCard } from "../ChartCard";
import { DrilldownMap } from "../DrilldownMap";
import { CommunityRankingPanel } from "../CommunityRankingPanel";
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

export interface GlobalOverviewProps {
  record: GeoRecord;
  communities: GeoRecord[];
  drilldown?: DrilldownPath;
  path?: DrilldownPath;
  onSelectLocation?: (name: string, level: any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
}

const GENDER_COLORS = ["#002F6C", "#EC4899"];
const COHORT_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"];

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
  record,
  communities = [],
  drilldown,
  path,
  onSelectLocation,
  onDrilldownChange,
  isDark = false,
}) => {
  const activeDrilldown: DrilldownPath = drilldown ||
    path || { level: record.level || "national" };
  const demographics = record.demographics;

  const totalHouseholds =
    demographics?.total_hh ?? record.households ?? record.total_hh ?? 0;
  const totalIndividuals =
    demographics?.total_individuals ??
    record.individuals ??
    record.total_ind ??
    0;
  const totalChildren =
    demographics?.children_0_17 ??
    demographics?.children_0_17_total ??
    demographics?.total_children ??
    0;
  const totalYouth =
    demographics?.youth_18_24 ?? demographics?.youth_18_24_total ?? 0;
  const communitiesCovered =
    communities.length ||
    record.communities_covered ||
    record.coverage?.communities_count ||
    1;

  const pyramidData = useMemo(() => {
    if (demographics?.pyramid && demographics.pyramid.length > 0) {
      return demographics.pyramid;
    }
    const under5 =
      demographics?.children_0_5 || Math.round(totalIndividuals * 0.18);
    const age6to11 =
      demographics?.children_6_11 || Math.round(totalIndividuals * 0.19);
    const age12to17 =
      demographics?.children_12_17 || Math.round(totalIndividuals * 0.15);
    const youth =
      demographics?.youth_18_24 || Math.round(totalIndividuals * 0.14);
    const adults =
      demographics?.adults_18_59 || Math.round(totalIndividuals * 0.28);
    const elderly =
      demographics?.elderly_60_plus || Math.round(totalIndividuals * 0.06);

    return [
      {
        cohort: "0–5 Yrs",
        male: Math.round(under5 * 0.51),
        female: Math.round(under5 * 0.49),
      },
      {
        cohort: "6–11 Yrs",
        male: Math.round(age6to11 * 0.51),
        female: Math.round(age6to11 * 0.49),
      },
      {
        cohort: "12–17 Yrs",
        male: Math.round(age12to17 * 0.5),
        female: Math.round(age12to17 * 0.5),
      },
      {
        cohort: "18–24 Yrs",
        male: Math.round(youth * 0.48),
        female: Math.round(youth * 0.52),
      },
      {
        cohort: "25–59 Yrs",
        male: Math.round(adults * 0.47),
        female: Math.round(adults * 0.53),
      },
      {
        cohort: "60+ Yrs",
        male: Math.round(elderly * 0.45),
        female: Math.round(elderly * 0.55),
      },
    ];
  }, [demographics, totalIndividuals]);

  const genderData = useMemo(() => {
    const males = demographics?.males ?? Math.round(totalIndividuals * 0.49);
    const females =
      demographics?.females ?? Math.round(totalIndividuals * 0.51);
    return [
      { name: "Male", value: males },
      { name: "Female", value: females },
    ];
  }, [demographics, totalIndividuals]);

  const cohortShareData = useMemo(() => {
    const children = totalChildren;
    const youth = totalYouth;
    const adults =
      demographics?.adults_18_59 ?? Math.round(totalIndividuals * 0.28);
    const elderly =
      demographics?.elderly_60_plus ?? Math.round(totalIndividuals * 0.06);

    return [
      { name: "Children (0–17)", value: children },
      { name: "Youth (18–24)", value: youth },
      { name: "Adults (25–59)", value: adults },
      { name: "Elderly (60+)", value: elderly },
    ];
  }, [demographics, totalChildren, totalYouth, totalIndividuals]);

  const broadAgeData = useMemo(() => {
    return [
      {
        group: "0–5 (Early Child)",
        count:
          demographics?.children_0_5 || Math.round(totalIndividuals * 0.18),
      },
      {
        group: "6–11 (Primary)",
        count:
          demographics?.children_6_11 || Math.round(totalIndividuals * 0.19),
      },
      {
        group: "12–17 (Secondary)",
        count:
          demographics?.children_12_17 || Math.round(totalIndividuals * 0.15),
      },
      { group: "18–24 (Youth)", count: totalYouth },
      {
        group: "25–59 (Adults)",
        count:
          demographics?.adults_18_59 || Math.round(totalIndividuals * 0.28),
      },
      {
        group: "60+ (Elderly)",
        count:
          demographics?.elderly_60_plus || Math.round(totalIndividuals * 0.06),
      },
    ];
  }, [demographics, totalIndividuals, totalYouth]);

  return (
    <div className="space-y-6">
      {/* Layer 1: KPI Top Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          title="TOTAL HOUSEHOLDS"
          value={totalHouseholds.toLocaleString()}
          tag="REGISTRY BASE"
          accentColor="#002F6C"
          isDark={isDark}
        />
        <KpiCard
          title="TOTAL INDIVIDUALS"
          value={totalIndividuals.toLocaleString()}
          tag="POPULATION"
          accentColor="#2563EB"
          isDark={isDark}
        />
        <KpiCard
          title="TOTAL CHILDREN (0–17)"
          value={totalChildren.toLocaleString()}
          tag={`${totalIndividuals > 0 ? ((totalChildren / totalIndividuals) * 100).toFixed(1) : 0}% OF POP`}
          accentColor="#10B981"
          isDark={isDark}
        />
        <KpiCard
          title="TOTAL YOUTH (18–24)"
          value={totalYouth.toLocaleString()}
          tag={`${totalIndividuals > 0 ? ((totalYouth / totalIndividuals) * 100).toFixed(1) : 0}% OF POP`}
          accentColor="#F59E0B"
          isDark={isDark}
        />
        <KpiCard
          title="COMMUNITIES COVERED"
          value={communitiesCovered.toLocaleString()}
          tag="EXPANSION GEOS"
          accentColor="#8B5CF6"
          isDark={isDark}
        />
      </div>

      {/* Layer 2: Main Map & Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 h-[560px] lg:h-auto min-h-[500px]">
          <DrilldownMap
            record={record}
            drilldown={activeDrilldown}
            onSelectLocation={onSelectLocation}
            onDrilldownChange={onDrilldownChange}
            isDark={isDark}
          />
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ChartCard
            title="POPULATION PYRAMID"
            subtitle="Gender breakdown by key age cohort"
            isDark={isDark}
            accentColor="#002F6C"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={pyramidData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  opacity={isDark ? 0.15 : 0.6}
                />
                <XAxis
                  dataKey="cohort"
                  tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: isDark ? "#94A3B8" : "#475569" }}
                />
                <Tooltip />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                />
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
            title="GENDER RATIO"
            subtitle="Overall male vs female distribution"
            isDark={isDark}
            accentColor="#EC4899"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {genderData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={GENDER_COLORS[index % GENDER_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="DEMOGRAPHIC COHORT SHARE"
            subtitle="Distribution of broad life stages"
            isDark={isDark}
            accentColor="#10B981"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={cohortShareData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {cohortShareData.map((_, index) => (
                    <Cell
                      key={`cohort-${index}`}
                      fill={COHORT_COLORS[index % COHORT_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="BROAD AGE DISTRIBUTION"
            subtitle="Total population across functional groups"
            isDark={isDark}
            accentColor="#F59E0B"
          >
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={broadAgeData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 20, bottom: 0 }}
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
                  dataKey="group"
                  type="category"
                  tick={{ fontSize: 9, fill: isDark ? "#94A3B8" : "#475569" }}
                  width={80}
                />
                <Tooltip />
                <Bar
                  dataKey="count"
                  name="Individuals"
                  fill="#F59E0B"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Layer 3: Bottom Table */}
      <div className="w-full">
        <CommunityRankingPanel
          communities={communities}
          isDark={isDark}
          onSelectCommunity={(comm) => {
            if (onSelectLocation)
              onSelectLocation(comm.name || comm.community || "", "community");
          }}
        />
      </div>
    </div>
  );
};

export default GlobalOverview;
