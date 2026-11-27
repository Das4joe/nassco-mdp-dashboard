import React, { useMemo } from "react";
import { SummaryCards, type MetricCardItem } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  getStateSummary,
  STATES_BASELINE,
  type StateSummaryItem,
} from "../../services/dataService";
import { Accessibility, Baby, Users, HeartHandshake } from "lucide-react";
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

export interface DisabilitiesProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  onStateSelect: (stateName: string) => void;
  onLgaSelect: (lgaName: string) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export const Disabilities: React.FC<DisabilitiesProps> = ({
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
        id: "kpi-plwd-total",
        title: "Total PLWD",
        value: summary.plwdTotal,
        subtitle: `${((summary.plwdTotal / summary.individuals) * 100).toFixed(2)}% of registry`,
        badge: "WASHINGTON GROUP",
        icon: Accessibility,
        accentColor: "indigo",
      },
      {
        id: "kpi-plwd-children",
        title: "Children PLWD",
        value: summary.plwdChildren,
        subtitle: "118 Boys | 103 Girls",
        badge: "16.1% OF PLWD",
        icon: Baby,
        accentColor: "amber",
      },
      {
        id: "kpi-plwd-adults",
        title: "Adults PLWD",
        value: summary.plwdAdults,
        subtitle: `${((summary.plwdAdults / summary.plwdTotal) * 100).toFixed(1)}% of all PLWD`,
        badge: "83.9% OF PLWD",
        icon: Users,
        accentColor: "teal",
      },
      {
        id: "kpi-plwd-gender",
        title: "Children by Gender",
        value: "118 B / 103 G",
        subtitle: "53.4% Boys | 46.6% Girls",
        badge: "GENDER BREAKDOWN",
        icon: HeartHandshake,
        accentColor: "rose",
      },
    ],
    [summary],
  );

  const disabilityTypeData = [
    { domain: "Physical / Mobility", cases: 512 },
    { domain: "Visual / Seeing", cases: 384 },
    { domain: "Hearing / Speech", cases: 192 },
    { domain: "Intellectual / Cognitive", cases: 128 },
    { domain: "Epilepsy / Convulsion", cases: 78 },
    { domain: "Multiple / Other", cases: 82 },
  ];

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
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-2">
              Functional Disability Breakdown (Washington Group)
            </h3>
            <div className="w-full flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={disabilityTypeData}
                  margin={{ top: 5, right: 10, left: 20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#1a3d36" : "#e2e8f0"}
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                  />
                  <YAxis
                    type="category"
                    dataKey="domain"
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                    width={90}
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
                    dataKey="cases"
                    name="Documented PLWD"
                    fill="#6366f1"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Disability Table */}
      <div className="rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-[#1a3d36] border-slate-200 dark:bg-[#132c26] bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-100 text-slate-800">
            Disability Inclusion & Assistive Device Targeting by State
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#0f2823] bg-slate-100 dark:text-slate-300 text-slate-700 font-bold border-b dark:border-[#1a3d36] border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Pilot State</th>
                <th className="px-4 py-2.5 text-right">Total Individuals</th>
                <th className="px-4 py-2.5 text-right">Total PLWD</th>
                <th className="px-4 py-2.5 text-right">Children PLWD</th>
                <th className="px-4 py-2.5 text-right">Adults PLWD</th>
                <th className="px-4 py-2.5 text-right">Prevalence Rate</th>
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
                    {st.individuals.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {st.plwdTotal}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {st.plwdChildren}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-teal-600 dark:text-teal-400">
                    {st.plwdAdults}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">
                    {((st.plwdTotal / st.individuals) * 100).toFixed(2)}%
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

export default Disabilities;
