import React from "react";
import { GraduationCap, UserX, AlertTriangle, BookOpen } from "lucide-react";
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
  type StateSummaryItem,
} from "../../services/dataService";

export interface EducationProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectLga: (lga: string | null) => void;
  onSelectWard?: (ward: string | null) => void;
  isDark?: boolean;
}

export const Education: React.FC<EducationProps> = ({
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
      title: "TOTAL CHILDREN OOSC",
      value: "17,240",
      subValue: "29.9% of all children",
      badge: "35.2% OOSC",
      badgeType: "danger" as const,
      icon: GraduationCap,
    },
    {
      title: "GIRLS OUT OF SCHOOL",
      value: "8,830",
      subValue: "51.2% of OOSC cohort",
      badge: "51.2% FEMALE",
      badgeType: "danger" as const,
      icon: UserX,
    },
    {
      title: "BOYS OUT OF SCHOOL",
      value: "8,410",
      subValue: "48.8% of OOSC cohort",
      badge: "48.8% MALE",
      badgeType: "warning" as const,
      icon: UserX,
    },
    {
      title: "NEVER ENROLLED",
      value: "10,758",
      subValue: "62.4% of total OOSC",
      badge: "CHRONIC EXCLUSION",
      badgeType: "warning" as const,
      icon: AlertTriangle,
    },
    {
      title: "SCHOOL DROPOUTS",
      value: "6,482",
      subValue: "37.6% left school early",
      badge: "RETENTION RISK",
      badgeType: "info" as const,
      icon: BookOpen,
    },
  ];

  const barData = STATES_BASELINE.map((s: StateSummaryItem) => ({
    state: s.state,
    "Girls OOSC": s.ooscGirls,
    "Boys OOSC": s.ooscBoys,
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
              OUT OF SCHOOL CHILDREN BY GENDER & STATE
            </h3>
            <div className="h-[430px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
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
                    dataKey="Girls OOSC"
                    fill="#ec4899"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="Boys OOSC"
                    fill="#0284c7"
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
          EDUCATION VULNERABILITY & CCT TARGETING TABLE
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-900/30 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Pilot State</th>
              <th className="py-2.5 px-3">Children (6-17)</th>
              <th className="py-2.5 px-3">Total OOSC</th>
              <th className="py-2.5 px-3">Girls OOSC</th>
              <th className="py-2.5 px-3">Boys OOSC</th>
              <th className="py-2.5 px-3">Never Enrolled (62%)</th>
              <th className="py-2.5 px-3">Dropouts (38%)</th>
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
                <td className="py-2.5 px-3">
                  {Math.round(st.children * 0.82).toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                  {st.ooscTotal.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-semibold text-pink-600 dark:text-pink-400">
                  {st.ooscGirls.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-semibold text-sky-600 dark:text-sky-400">
                  {st.ooscBoys.toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  {Math.round(st.ooscTotal * 0.624).toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  {Math.round(st.ooscTotal * 0.376).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Education;
