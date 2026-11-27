import React, { useMemo } from "react";
import { SummaryCards, type MetricCardItem } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  getStateSummary,
  STATES_BASELINE,
  type StateSummaryItem,
} from "../../services/dataService";
import { FileX, ShieldAlert, Award, FileCheck2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export interface CivilRegistrationProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  onStateSelect: (stateName: string) => void;
  onLgaSelect: (lgaName: string) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export const CivilRegistration: React.FC<CivilRegistrationProps> = ({
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
        id: "kpi-nobirth",
        title: "Children w/o Birth Cert",
        value: summary.birthCertMissing,
        subtitle: `${((summary.birthCertMissing / summary.children) * 100).toFixed(1)}% of all children`,
        badge: "57.4% GAP",
        icon: FileX,
        accentColor: "rose",
      },
      {
        id: "kpi-nonin",
        title: "Children w/o NIN",
        value: summary.ninMissing,
        subtitle: `${((summary.ninMissing / summary.children) * 100).toFixed(1)}% of all children`,
        badge: "70.2% GAP",
        icon: ShieldAlert,
        accentColor: "amber",
      },
      {
        id: "kpi-noboth",
        title: "Children w/o Both",
        value: summary.bothMissing,
        subtitle: `${((summary.bothMissing / summary.children) * 100).toFixed(1)}% unregistered`,
        badge: "49.2% EXCLUDED",
        icon: Award,
        accentColor: "rose",
      },
      {
        id: "kpi-both",
        title: "Individuals with Both",
        value: summary.bothPresent,
        subtitle: `${((summary.bothPresent / summary.individuals) * 100).toFixed(1)}% fully documented`,
        badge: "27.7% DOCUMENTED",
        icon: FileCheck2,
        accentColor: "emerald",
      },
    ],
    [summary],
  );

  const birthCertAgeData = [
    { name: "0 - 4 yrs", value: 7420, color: "#f43f5e" },
    { name: "5 - 9 yrs", value: 11240, color: "#fb923c" },
    { name: "10 - 14 yrs", value: 8940, color: "#fbbf24" },
    { name: "15 - 17 yrs", value: 5513, color: "#a855f7" },
  ];

  const stateComparisonData = useMemo(() => {
    return STATES_BASELINE.map((s: StateSummaryItem) => ({
      state: s.state,
      "No Birth Cert": s.birthCertMissing,
      "No NIN": s.ninMissing,
      "Missing Both": s.bothMissing,
    }));
  }, []);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Layer 1: Top 4 KPI Cards */}
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
          <div className="p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-1">
              Lack of Birth Certificate by Age Cohort
            </h3>
            <div className="w-full flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={birthCertAgeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    innerRadius={28}
                    paddingAngle={4}
                  >
                    {birthCertAgeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#0c221e" : "#ffffff",
                      borderColor: isDarkMode ? "#1a3d36" : "#cbd5e1",
                      color: isDarkMode ? "#ffffff" : "#0f172a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-1">
              Documentation Gaps by Pilot State
            </h3>
            <div className="w-full flex-1 min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateComparisonData}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#1a3d36" : "#e2e8f0"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="state"
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
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar
                    dataKey="No Birth Cert"
                    fill="#f43f5e"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar dataKey="No NIN" fill="#fb923c" radius={[2, 2, 0, 0]} />
                  <Bar
                    dataKey="Missing Both"
                    fill="#a855f7"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: State-Level Matrix */}
      <div className="rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-[#1a3d36] border-slate-200 dark:bg-[#132c26] bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-100 text-slate-800">
            Legal Identity Coverage & Gap Matrix by State
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#0f2823] bg-slate-100 dark:text-slate-300 text-slate-700 font-bold border-b dark:border-[#1a3d36] border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Pilot State</th>
                <th className="px-4 py-2.5 text-right">Total Children</th>
                <th className="px-4 py-2.5 text-right">w/o Birth Cert</th>
                <th className="px-4 py-2.5 text-right">w/o NIN</th>
                <th className="px-4 py-2.5 text-right">Missing Both</th>
                <th className="px-4 py-2.5 text-right">Both Present</th>
                <th className="px-4 py-2.5 text-right">Documentation Rate</th>
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
                  <td className="px-4 py-2.5 text-right">
                    {st.children.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-rose-600 dark:text-rose-400 font-semibold">
                    {st.birthCertMissing.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400 font-semibold">
                    {st.ninMissing.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-purple-600 dark:text-purple-400 font-semibold">
                    {st.bothMissing.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                    {st.bothPresent.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-teal-600 dark:text-teal-400">
                    {((st.bothPresent / st.individuals) * 100).toFixed(1)}%
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

export default CivilRegistration;
