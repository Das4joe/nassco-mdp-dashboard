import React, { useMemo } from "react";
import { SummaryCards, type MetricCardItem } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  getStateSummary,
  STATES_BASELINE,
  type StateSummaryItem,
} from "../../services/dataService";
import {
  GraduationCap,
  Users2,
  UserX,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
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

export interface EducationProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  onStateSelect: (stateName: string) => void;
  onLgaSelect: (lgaName: string) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export const Education: React.FC<EducationProps> = ({
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
        id: "kpi-oosc-total",
        title: "Total Children OOSC",
        value: summary.ooscTotal,
        subtitle: `${((summary.ooscTotal / summary.children) * 100).toFixed(1)}% of all children`,
        badge: "35.2% OOSC",
        icon: GraduationCap,
        accentColor: "rose",
      },
      {
        id: "kpi-oosc-girls",
        title: "Girls Out of School",
        value: summary.ooscGirls,
        subtitle: `${((summary.ooscGirls / summary.ooscTotal) * 100).toFixed(1)}% of OOSC cohort`,
        badge: "51.2% FEMALE",
        icon: Users2,
        accentColor: "rose",
      },
      {
        id: "kpi-oosc-boys",
        title: "Boys Out of School",
        value: summary.ooscBoys,
        subtitle: `${((summary.ooscBoys / summary.ooscTotal) * 100).toFixed(1)}% of OOSC cohort`,
        badge: "48.8% MALE",
        icon: UserX,
        accentColor: "amber",
      },
      {
        id: "kpi-never-enrolled",
        title: "Never Enrolled",
        value: Math.round(summary.ooscTotal * 0.624),
        subtitle: "62.4% of total OOSC",
        badge: "CHRONIC EXCLUSION",
        icon: AlertTriangle,
        accentColor: "amber",
      },
      {
        id: "kpi-dropouts",
        title: "School Dropouts",
        value: Math.round(summary.ooscTotal * 0.376),
        subtitle: "37.6% left school early",
        badge: "RETENTION RISK",
        icon: Sparkles,
        accentColor: "cyan",
      },
    ],
    [summary],
  );

  const genderByStateData = useMemo(() => {
    return STATES_BASELINE.map((s: StateSummaryItem) => ({
      state: s.state,
      "Girls OOSC": s.ooscGirls,
      "Boys OOSC": s.ooscBoys,
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
          <div className="p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-1">
              Out of School Children by Gender & State
            </h3>
            <div className="w-full flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={genderByStateData}
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
                    dataKey="Girls OOSC"
                    fill="#db2777"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="Boys OOSC"
                    fill="#0284c7"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Education Targeting Table */}
      <div className="rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-[#1a3d36] border-slate-200 dark:bg-[#132c26] bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-100 text-slate-800">
            Education Vulnerability & CCT Targeting Table
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#0f2823] bg-slate-100 dark:text-slate-300 text-slate-700 font-bold border-b dark:border-[#1a3d36] border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Pilot State</th>
                <th className="px-4 py-2.5 text-right">Children (6-17)</th>
                <th className="px-4 py-2.5 text-right">Total OOSC</th>
                <th className="px-4 py-2.5 text-right">Girls OOSC</th>
                <th className="px-4 py-2.5 text-right">Boys OOSC</th>
                <th className="px-4 py-2.5 text-right">Never Enrolled (62%)</th>
                <th className="px-4 py-2.5 text-right">Dropouts (38%)</th>
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
                    {Math.round(st.children * 0.82).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                    {st.ooscTotal.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-pink-600 dark:text-pink-400 font-semibold">
                    {st.ooscGirls.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-sky-600 dark:text-sky-400 font-semibold">
                    {st.ooscBoys.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-amber-600 dark:text-amber-400 font-semibold">
                    {Math.round(st.ooscTotal * 0.624).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right text-cyan-600 dark:text-cyan-400 font-semibold">
                    {Math.round(st.ooscTotal * 0.376).toLocaleString()}
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

export default Education;
