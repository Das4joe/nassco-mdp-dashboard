import React, { useMemo } from "react";
import { SummaryCards, type MetricCardItem } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  getStateSummary,
  STATES_BASELINE,
  COHORTS_BASELINE,
  type StateSummaryItem,
} from "../../services/dataService";
import { Home, Users, Baby, UserCheck, MapPin } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

export interface GlobalOverviewProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  onStateSelect: (stateName: string) => void;
  onLgaSelect: (lgaName: string) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
  selectedState,
  selectedLga,
  onStateSelect,
  onLgaSelect,
  onReset,
  isDarkMode = true,
}) => {
  const summary = useMemo(
    () => getStateSummary(selectedState || undefined),
    [selectedState],
  );

  const kpiCards: MetricCardItem[] = useMemo(
    () => [
      {
        id: "kpi-hh",
        title: "Total Households",
        value: summary.households,
        subtitle: "Enumerated in Pilot",
        badge: "NSR COVERAGE",
        icon: Home,
        accentColor: "emerald",
      },
      {
        id: "kpi-ind",
        title: "Total Individuals",
        value: summary.individuals,
        subtitle: `Male: ${summary.male.toLocaleString()} | Female: ${summary.female.toLocaleString()}`,
        badge: "REGISTRY",
        icon: Users,
        accentColor: "teal",
      },
      {
        id: "kpi-children",
        title: "Children (0 - 17)",
        value: summary.children,
        subtitle: `${((summary.children / summary.individuals) * 100).toFixed(1)}% of registry`,
        badge: "41.6% POP",
        icon: Baby,
        accentColor: "amber",
      },
      {
        id: "kpi-youth",
        title: "Youth (18 - 24)",
        value: summary.youth,
        subtitle: `${((summary.youth / summary.individuals) * 100).toFixed(1)}% of registry`,
        badge: "13.7% POP",
        icon: UserCheck,
        accentColor: "cyan",
      },
      {
        id: "kpi-comm",
        title: "Communities Covered",
        value: summary.communities,
        subtitle: `Across ${summary.lgas} LGAs`,
        badge: "864 SETTLEMENTS",
        icon: MapPin,
        accentColor: "emerald",
      },
    ],
    [summary],
  );

  const pyramidData = useMemo(() => {
    return COHORTS_BASELINE.map((c) => ({
      age: c.ageGroup,
      boys: -c.male,
      girls: c.female,
      rawBoys: c.male,
      rawGirls: c.female,
    }));
  }, []);

  const ageCohortColumnData = useMemo(() => {
    return COHORTS_BASELINE.map((c) => ({
      age: c.ageGroup,
      Boys: c.male,
      Girls: c.female,
    }));
  }, []);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Layer 1: Top 5 KPI Cards */}
      <SummaryCards cards={kpiCards} />

      {/* Layers 2 & 3: Map (55%) & Charts (45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 w-full h-[480px]">
          <NasspGisMap
            selectedState={selectedState || undefined}
            selectedLga={selectedLga || undefined}
            onStateSelect={onStateSelect}
            onLgaSelect={onLgaSelect}
            onReset={onReset}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* Symmetrical Bilateral Population Pyramid */}
          <div className="p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800">
                Population Pyramid (0 - 24 Years)
              </h3>
              <span className="text-[10px] font-semibold dark:text-slate-400 text-slate-500">
                Boys: 39,002 | Girls: 37,698
              </span>
            </div>
            <div className="w-full flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={pyramidData}
                  stackOffset="sign"
                  margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#1a3d36" : "#e2e8f0"}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) => Math.abs(v).toLocaleString()}
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                  />
                  <YAxis
                    type="category"
                    dataKey="age"
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                    width={50}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#0c221e" : "#ffffff",
                      borderColor: isDarkMode ? "#1a3d36" : "#cbd5e1",
                      color: isDarkMode ? "#ffffff" : "#0f172a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                    formatter={(_val: any, name: string, item: any) => [
                      name.includes("Boys")
                        ? item.payload.rawBoys.toLocaleString()
                        : item.payload.rawGirls.toLocaleString(),
                      name,
                    ]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                  />
                  <Bar dataKey="boys" name="Boys (50.8%)" fill="#0284c7" />
                  <Bar dataKey="girls" name="Girls (49.2%)" fill="#db2777" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Cohort Distribution Column Chart */}
          <div className="p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-2">
              Age Cohort Distribution (0 - 24 Years)
            </h3>
            <div className="w-full flex-1 min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ageCohortColumnData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#1a3d36" : "#e2e8f0"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="age"
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#0c221e" : "#ffffff",
                      borderColor: isDarkMode ? "#1a3d36" : "#cbd5e1",
                      color: isDarkMode ? "#ffffff" : "#0f172a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "4px" }}
                  />
                  <Bar dataKey="Boys" fill="#0284c7" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Girls" fill="#db2777" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: State-Level Pilot Enumeration Summary Table */}
      <div className="rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b dark:border-[#1a3d36] border-slate-200 dark:bg-[#132c26] bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-100 text-slate-800">
            State-Level Pilot Enumeration Summary
          </h3>
          <span className="text-[11px] font-medium dark:text-slate-400 text-slate-500">
            Source: National Social Safety Nets Project (NASSP-SU) Microdata
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#0f2823] bg-slate-100 dark:text-slate-300 text-slate-700 font-bold border-b dark:border-[#1a3d36] border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Pilot State</th>
                <th className="px-4 py-2.5 text-center">Targeted LGAs</th>
                <th className="px-4 py-2.5 text-center">Communities</th>
                <th className="px-4 py-2.5 text-right">Households</th>
                <th className="px-4 py-2.5 text-right">Individuals</th>
                <th className="px-4 py-2.5 text-right">Children (0-17)</th>
                <th className="px-4 py-2.5 text-right">Youth (18-24)</th>
                <th className="px-4 py-2.5 text-right">Female-Headed HH %</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#1a3d36] divide-slate-100 dark:text-slate-200 text-slate-800 font-medium">
              {STATES_BASELINE.map((st: StateSummaryItem) => (
                <tr
                  key={st.code}
                  onClick={() => onStateSelect(st.state)}
                  className="hover:dark:bg-[#13332c] hover:bg-emerald-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                    {st.state}
                  </td>
                  <td className="px-4 py-2.5 text-center">{st.lgas}</td>
                  <td className="px-4 py-2.5 text-center">{st.communities}</td>
                  <td className="px-4 py-2.5 text-right">
                    {st.households.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {st.individuals.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {st.children.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {st.youth.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-teal-700 dark:text-teal-400">
                    {st.femaleHeadedHhPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;
