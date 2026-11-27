import React from "react";
import { Users, Home, Baby, UserCheck, Building2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SummaryCards } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  STATES_BASELINE,
  COHORTS_BASELINE,
  type CohortItem,
  type StateSummaryItem,
} from "../../services/dataService";

export interface GlobalOverviewProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectLga: (lga: string | null) => void;
  onSelectWard?: (ward: string | null) => void;
  isDark?: boolean;
}

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
  selectedState = null,
  selectedLga = null,
  selectedWard = null,
  onSelectState,
  onSelectLga,
  onSelectWard,
  isDark = true,
}) => {
  const getCards = () => {
    if (selectedWard) {
      return [
        {
          title: "TOTAL HOUSEHOLDS",
          value: "520",
          badge: "Ward Sample",
          badgeType: "info" as const,
          icon: Home,
        },
        {
          title: "TOTAL INDIVIDUALS",
          value: "1,840",
          subValue: "48.9% M | 51.1% F",
          badge: "Active NSR",
          badgeType: "success" as const,
          icon: Users,
        },
        {
          title: "CHILDREN (0-17)",
          value: "740",
          subValue: "40.2% of ward",
          badge: "High Vulnerability",
          badgeType: "warning" as const,
          icon: Baby,
        },
        {
          title: "YOUTH (18-24)",
          value: "254",
          subValue: "13.8% of ward",
          badge: "Target Cohort",
          badgeType: "neutral" as const,
          icon: UserCheck,
        },
        {
          title: "COMMUNITIES",
          value: "8",
          badge: "Enumerated",
          badgeType: "neutral" as const,
          icon: Building2,
        },
      ];
    }
    if (selectedLga) {
      return [
        {
          title: "TOTAL HOUSEHOLDS",
          value: "1,280",
          badge: "LGA Level",
          badgeType: "info" as const,
          icon: Home,
        },
        {
          title: "TOTAL INDIVIDUALS",
          value: "4,420",
          subValue: "50.2% M | 49.8% F",
          badge: "Active NSR",
          badgeType: "success" as const,
          icon: Users,
        },
        {
          title: "CHILDREN (0-17)",
          value: "1,830",
          subValue: "41.4% of LGA",
          badge: "High Vulnerability",
          badgeType: "warning" as const,
          icon: Baby,
        },
        {
          title: "YOUTH (18-24)",
          value: "612",
          subValue: "13.8% of LGA",
          badge: "Target Cohort",
          badgeType: "neutral" as const,
          icon: UserCheck,
        },
        {
          title: "COMMUNITIES",
          value: "28",
          badge: "Enumerated",
          badgeType: "neutral" as const,
          icon: Building2,
        },
      ];
    }
    if (selectedState) {
      const match = STATES_BASELINE.find(
        (s) => s.state.toLowerCase() === selectedState.toLowerCase(),
      );
      if (match) {
        return [
          {
            title: "TOTAL HOUSEHOLDS",
            value: match.households.toLocaleString(),
            badge: `${match.lgas} LGAs`,
            badgeType: "info" as const,
            icon: Home,
          },
          {
            title: "TOTAL INDIVIDUALS",
            value: match.individuals.toLocaleString(),
            subValue: "50.7% M | 49.3% F",
            badge: "Active NSR",
            badgeType: "success" as const,
            icon: Users,
          },
          {
            title: "CHILDREN (0-17)",
            value: match.children.toLocaleString(),
            subValue: `${((match.children / match.individuals) * 100).toFixed(1)}% of total`,
            badge: "Target Cohort",
            badgeType: "warning" as const,
            icon: Baby,
          },
          {
            title: "YOUTH (18-24)",
            value: match.youth.toLocaleString(),
            subValue: `${((match.youth / match.individuals) * 100).toFixed(1)}% of total`,
            badge: "Target Cohort",
            badgeType: "neutral" as const,
            icon: UserCheck,
          },
          {
            title: "COMMUNITIES",
            value: match.communities.toLocaleString(),
            badge: "Enumerated",
            badgeType: "neutral" as const,
            icon: Building2,
          },
        ];
      }
    }
    return [
      {
        title: "TOTAL HOUSEHOLDS",
        value: "41,512",
        badge: "4 Pilot States",
        badgeType: "info" as const,
        icon: Home,
      },
      {
        title: "TOTAL INDIVIDUALS",
        value: "138,676",
        subValue: "50.7% M | 49.3% F",
        badge: "Active NSR",
        badgeType: "success" as const,
        icon: Users,
      },
      {
        title: "CHILDREN (0-17)",
        value: "57,688",
        subValue: "41.6% of population",
        badge: "High Vulnerability",
        badgeType: "warning" as const,
        icon: Baby,
      },
      {
        title: "YOUTH (18-24)",
        value: "19,012",
        subValue: "13.7% of population",
        badge: "Target Cohort",
        badgeType: "neutral" as const,
        icon: UserCheck,
      },
      {
        title: "COMMUNITIES",
        value: "864",
        badge: "31 Pilot LGAs",
        badgeType: "neutral" as const,
        icon: Building2,
      },
    ];
  };

  const getPyramidData = () => {
    return COHORTS_BASELINE.map((c: CohortItem) => ({
      ageGroup: c.ageGroup,
      male: -c.male,
      female: c.female,
      maleDisplay: c.male,
      femaleDisplay: c.female,
    }));
  };

  const getAgeRatioData = () => {
    return COHORTS_BASELINE.map((c: CohortItem) => ({
      ageGroup: c.ageGroup,
      "Male Ratio": Number(((c.male / c.total) * 100).toFixed(1)),
      "Female Ratio": Number(((c.female / c.total) * 100).toFixed(1)),
    }));
  };

  const cards = getCards();
  const pyramidData = getPyramidData();
  const ageRatioData = getAgeRatioData();

  return (
    <div className="space-y-6">
      {/* Layer 1: Key Indicators */}
      <SummaryCards cards={cards} />

      {/* Layer 2 & 3: Map (55%) + Charts (45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <NasspGisMap
            selectedState={selectedState}
            selectedLga={selectedLga}
            selectedWard={selectedWard}
            onSelectState={onSelectState}
            onSelectLga={onSelectLga}
            onSelectWard={onSelectWard}
            isDark={isDark}
          />
        </div>

        <div className="lg:col-span-5 space-y-6">
          {/* Symmetrical Bilateral Population Pyramid */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
              POPULATION PYRAMID (CHILDREN & YOUTH 0–24)
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Bilateral distribution of enumerated boys vs. girls across pilot
              cohorts
            </p>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={pyramidData}
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#0f2924" : "#e2e8f0"}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => `${Math.abs(v).toLocaleString()}`}
                    tick={{
                      fill: isDark ? "#94a3b8" : "#475569",
                      fontSize: 10,
                    }}
                  />
                  <YAxis
                    dataKey="ageGroup"
                    type="category"
                    tick={{
                      fill: isDark ? "#cbd5e1" : "#1e293b",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  <Tooltip
                    formatter={(_val: any, name: any, item: any) => {
                      const displayVal =
                        name === "Boys"
                          ? item.payload.maleDisplay
                          : item.payload.femaleDisplay;
                      return [
                        `${displayVal.toLocaleString()} individuals`,
                        name,
                      ];
                    }}
                    contentStyle={{
                      backgroundColor: isDark ? "#071715" : "#ffffff",
                      borderColor: isDark ? "#065f46" : "#cbd5e1",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                    formatter={(val) => (
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        {val}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="male"
                    name="Boys"
                    fill="#0284c7"
                    radius={[4, 0, 0, 4]}
                  />
                  <Bar
                    dataKey="female"
                    name="Girls"
                    fill="#ec4899"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Ratio Breakdown */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
              COHORT GENDER PROPORTIONS (%)
            </h3>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageRatioData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#0f2924" : "#e2e8f0"}
                  />
                  <XAxis
                    dataKey="ageGroup"
                    tick={{
                      fill: isDark ? "#cbd5e1" : "#1e293b",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  <YAxis
                    unit="%"
                    tick={{
                      fill: isDark ? "#94a3b8" : "#475569",
                      fontSize: 10,
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#071715" : "#ffffff",
                      borderColor: isDark ? "#065f46" : "#cbd5e1",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: 11, paddingTop: 6 }}
                    formatter={(val) => (
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">
                        {val}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="Male Ratio"
                    name="Boys %"
                    fill="#0284c7"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Female Ratio"
                    name="Girls %"
                    fill="#ec4899"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: State Breakdown Table */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-sm overflow-x-auto">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3">
          PILOT EXPANSION STATE DEMOGRAPHICS & COVERAGE
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-900/30 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Pilot State</th>
              <th className="py-2.5 px-3">Target LGAs</th>
              <th className="py-2.5 px-3">Communities</th>
              <th className="py-2.5 px-3">Households</th>
              <th className="py-2.5 px-3">Individuals</th>
              <th className="py-2.5 px-3">Children (0-17)</th>
              <th className="py-2.5 px-3">Youth (18-24)</th>
              <th className="py-2.5 px-3">Female-Headed HH %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-emerald-950/40">
            {STATES_BASELINE.map((st: StateSummaryItem) => (
              <tr
                key={st.code}
                onClick={() => onSelectState(st.state)}
                className="hover:bg-slate-50 dark:hover:bg-emerald-950/30 cursor-pointer font-medium text-slate-800 dark:text-slate-200"
              >
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                  {st.state}
                </td>
                <td className="py-2.5 px-3">{st.lgas}</td>
                <td className="py-2.5 px-3">{st.communities}</td>
                <td className="py-2.5 px-3">
                  {st.households.toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  {st.individuals.toLocaleString()}
                </td>
                <td className="py-2.5 px-3">{st.children.toLocaleString()}</td>
                <td className="py-2.5 px-3">{st.youth.toLocaleString()}</td>
                <td className="py-2.5 px-3 font-semibold">
                  {st.femaleHeadedHhPct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default GlobalOverview;
