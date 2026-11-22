import React, { useMemo } from "react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import { KpiCard } from "../KpiCard";
import { ChartCard } from "../ChartCard";
import { DrilldownMap } from "../DrilldownMap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export interface CivilRegistrationProps {
  record: GeoRecord;
  states?: GeoRecord[];
  allCommunities?: GeoRecord[];
  drilldown?: DrilldownPath;
  path?: DrilldownPath;
  onSelectLocation?: (name: string, level: any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
}

const DONUT_COLORS_A = ["#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6"];
const DONUT_COLORS_B = ["#002F6C", "#EC4899"];

export const CivilRegistration: React.FC<CivilRegistrationProps> = ({
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
  const civil = record.civil_registration;

  const noBcChildren =
    civil?.children_without_birth_certificate ?? civil?.children_no_bc ?? 0;
  const noNinChildren =
    civil?.children_without_nin ?? civil?.children_no_nin ?? 0;
  const noBothChildren =
    civil?.children_without_bc_and_nin ?? civil?.children_no_bc_and_nin ?? 0;
  const withBothChildren =
    civil?.children_with_bc_and_nin ?? civil?.children_with_both ?? 0;

  const lackBcByAge = useMemo(() => {
    if (civil?.age_breakdown && Array.isArray(civil.age_breakdown)) {
      return civil.age_breakdown.map((b: any) => ({
        name: b.cohort || b.name,
        value: b.no_bc || b.value || 0,
      }));
    }
    return [
      {
        name: "< 1 Yr",
        value: civil?.no_bc_under_1 || Math.round(noBcChildren * 0.15),
      },
      {
        name: "1–4 Yrs",
        value: civil?.no_bc_1_to_4 || Math.round(noBcChildren * 0.35),
      },
      {
        name: "5–9 Yrs",
        value: civil?.no_bc_5_to_9 || Math.round(noBcChildren * 0.3),
      },
      {
        name: "10–17 Yrs",
        value: civil?.no_bc_10_to_17 || Math.round(noBcChildren * 0.2),
      },
    ];
  }, [civil, noBcChildren]);

  const lackNinByAge = useMemo(() => {
    if (civil?.age_breakdown && Array.isArray(civil.age_breakdown)) {
      return civil.age_breakdown.map((b: any) => ({
        name: b.cohort || b.name,
        value: b.no_nin || b.value || 0,
      }));
    }
    return [
      {
        name: "< 1 Yr",
        value: civil?.no_nin_under_1 || Math.round(noNinChildren * 0.12),
      },
      {
        name: "1–4 Yrs",
        value: civil?.no_nin_1_to_4 || Math.round(noNinChildren * 0.33),
      },
      {
        name: "5–9 Yrs",
        value: civil?.no_nin_5_to_9 || Math.round(noNinChildren * 0.32),
      },
      {
        name: "10–17 Yrs",
        value: civil?.no_nin_10_to_17 || Math.round(noNinChildren * 0.23),
      },
    ];
  }, [civil, noNinChildren]);

  const lackBcByGender = useMemo(() => {
    return [
      {
        name: "Male Children",
        value: civil?.no_bc_male_children || Math.round(noBcChildren * 0.51),
      },
      {
        name: "Female Children",
        value: civil?.no_bc_female_children || Math.round(noBcChildren * 0.49),
      },
    ];
  }, [civil, noBcChildren]);

  const lackNinByGender = useMemo(() => {
    return [
      {
        name: "Male Children",
        value: civil?.no_nin_male_children || Math.round(noNinChildren * 0.5),
      },
      {
        name: "Female Children",
        value: civil?.no_nin_female_children || Math.round(noNinChildren * 0.5),
      },
    ];
  }, [civil, noNinChildren]);

  return (
    <div className="space-y-6">
      {/* Layer 1: Top KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard
          title="CHILDREN W/O BIRTH CERT"
          value={noBcChildren.toLocaleString()}
          tag="REGISTRATION GAP"
          accentColor="#EF4444"
          isDark={isDark}
        />
        <KpiCard
          title="CHILDREN W/O NIN"
          value={noNinChildren.toLocaleString()}
          tag="IDENTITY GAP"
          accentColor="#F59E0B"
          isDark={isDark}
        />
        <KpiCard
          title="CHILDREN W/O BC & NIN"
          value={noBothChildren.toLocaleString()}
          tag="TOTAL EXCLUSION"
          accentColor="#8B5CF6"
          isDark={isDark}
        />
        <KpiCard
          title="TOTAL WITH BC & NIN"
          value={withBothChildren.toLocaleString()}
          tag="FULLY IDENTIFIED"
          accentColor="#10B981"
          isDark={isDark}
        />
      </div>

      {/* Layer 2: Main Map & 2x2 Donut Visualizations */}
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
            title="LACK OF BIRTH CERT BY AGE"
            subtitle="Under-18 age group breakdown"
            isDark={isDark}
            accentColor="#EF4444"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={lackBcByAge}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {lackBcByAge.map((_, index) => (
                    <Cell
                      key={`bc-age-${index}`}
                      fill={DONUT_COLORS_A[index % DONUT_COLORS_A.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="LACK OF NIN BY AGE"
            subtitle="Under-18 age group breakdown"
            isDark={isDark}
            accentColor="#F59E0B"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={lackNinByAge}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {lackNinByAge.map((_, index) => (
                    <Cell
                      key={`nin-age-${index}`}
                      fill={DONUT_COLORS_A[index % DONUT_COLORS_A.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="LACK OF BIRTH CERT BY GENDER"
            subtitle="Male vs female child distribution"
            isDark={isDark}
            accentColor="#002F6C"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={lackBcByGender}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {lackBcByGender.map((_, index) => (
                    <Cell
                      key={`bc-gender-${index}`}
                      fill={DONUT_COLORS_B[index % DONUT_COLORS_B.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="LACK OF NIN BY GENDER"
            subtitle="Male vs female child distribution"
            isDark={isDark}
            accentColor="#EC4899"
          >
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={lackNinByGender}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {lackNinByGender.map((_, index) => (
                    <Cell
                      key={`nin-gender-${index}`}
                      fill={DONUT_COLORS_B[index % DONUT_COLORS_B.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default CivilRegistration;
