import React from "react";
import {
  FileQuestion,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
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
  type StateSummaryItem,
} from "../../services/dataService";

export interface CivilRegistrationProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectLga: (lga: string | null) => void;
  onSelectWard?: (ward: string | null) => void;
  isDark?: boolean;
}

export const CivilRegistration: React.FC<CivilRegistrationProps> = ({
  selectedState = null,
  selectedLga = null,
  selectedWard = null,
  onSelectState,
  onSelectLga,
  onSelectWard,
  isDark = true,
}) => {
  const cards = [
    {
      title: "CHILDREN W/O BIRTH CERT",
      value: "33,113",
      subValue: "57.4% of all children",
      badge: "Critical Gap",
      badgeType: "danger" as const,
      icon: FileQuestion,
    },
    {
      title: "CHILDREN W/O NIN",
      value: "40,497",
      subValue: "70.2% of all children",
      badge: "Severe Gap",
      badgeType: "danger" as const,
      icon: AlertCircle,
    },
    {
      title: "CHILDREN W/O BOTH (CERT & NIN)",
      value: "28,382",
      subValue: "49.2% legal invisibility",
      badge: "High Vulnerability",
      badgeType: "warning" as const,
      icon: ShieldAlert,
    },
    {
      title: "INDIVIDUALS WITH BOTH ID",
      value: "38,413",
      subValue: "27.7% fully registered",
      badge: "Compliant",
      badgeType: "success" as const,
      icon: CheckCircle2,
    },
  ];

  const pieData = [
    { name: "0-4 yrs (72.4% missing)", value: 8190, color: "#ef4444" },
    { name: "5-9 yrs (59.1% missing)", value: 11397, color: "#f97316" },
    { name: "10-14 yrs (52.3% missing)", value: 8866, color: "#eab308" },
    { name: "15-17 yrs (46.8% missing)", value: 4660, color: "#3b82f6" },
  ];

  const barData = STATES_BASELINE.map((s: StateSummaryItem) => ({
    state: s.state,
    "No Birth Cert": s.birthCertMissing,
    "No NIN": s.ninMissing,
    "Missing Both": s.bothMissing,
  }));

  return (
    <div className="space-y-6">
      <SummaryCards cards={cards} />

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
          <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
              CHILDREN WITHOUT BIRTH CERTIFICATE BY AGE COHORT
            </h3>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#071715" : "#ffffff",
                      borderColor: isDark ? "#065f46" : "#cbd5e1",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-sm">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-2">
              LEGAL IDENTITY GAP OVERLAP BY STATE
            </h3>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#0f2924" : "#e2e8f0"}
                  />
                  <XAxis
                    dataKey="state"
                    tick={{
                      fill: isDark ? "#cbd5e1" : "#1e293b",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  />
                  <YAxis
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
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 6 }} />
                  <Bar
                    dataKey="No Birth Cert"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="No NIN" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="Missing Both"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-sm overflow-x-auto">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3">
          LEGAL IDENTITY & CIVIL REGISTRATION BY PILOT STATE
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-900/30 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Pilot State</th>
              <th className="py-2.5 px-3">Children (0-17)</th>
              <th className="py-2.5 px-3">Missing Birth Cert</th>
              <th className="py-2.5 px-3">Missing NIN</th>
              <th className="py-2.5 px-3">Missing Both</th>
              <th className="py-2.5 px-3">Both Present</th>
              <th className="py-2.5 px-3">Legal Identity %</th>
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
                <td className="py-2.5 px-3">{st.children.toLocaleString()}</td>
                <td className="py-2.5 px-3 font-semibold text-rose-600 dark:text-rose-400">
                  {st.birthCertMissing.toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  {st.ninMissing.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-bold text-purple-600 dark:text-purple-400">
                  {st.bothMissing.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-semibold text-emerald-600 dark:text-emerald-400">
                  {st.bothPresent.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-bold">
                  {((st.bothPresent / st.individuals) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default CivilRegistration;
