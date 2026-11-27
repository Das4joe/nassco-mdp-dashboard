import React from "react";
import { Accessibility, Eye, HeartHandshake, UserCheck } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SummaryCards } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  STATES_BASELINE,
  type StateSummaryItem,
} from "../../services/dataService";

export interface DisabilitiesProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectLga: (lga: string | null) => void;
  onSelectWard?: (ward: string | null) => void;
  isDark?: boolean;
}

export const Disabilities: React.FC<DisabilitiesProps> = ({
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
      title: "TOTAL PERSONS WITH DISABILITIES (PLWD)",
      value: "1,376",
      subValue: "1.0% of total population",
      badge: "High Vulnerability",
      badgeType: "danger" as const,
      icon: Accessibility,
    },
    {
      title: "CHILDREN WITH DISABILITIES",
      value: "221",
      subValue: "16.1% of all PLWD",
      badge: "Pediatric Care",
      badgeType: "warning" as const,
      icon: Eye,
    },
    {
      title: "ADULT PLWD (18+)",
      value: "1,155",
      subValue: "83.9% of all PLWD",
      badge: "Social Inclusion",
      badgeType: "info" as const,
      icon: UserCheck,
    },
    {
      title: "CHILDREN PLWD BY GENDER",
      value: "118 B / 103 G",
      subValue: "53.4% Boys | 46.6% Girls",
      badge: "Gender Cohort",
      badgeType: "neutral" as const,
      icon: HeartHandshake,
    },
  ];

  const functionalData = [
    { domain: "Physical / Mobility", count: 512 },
    { domain: "Visual Impairment", count: 384 },
    { domain: "Hearing Impairment", count: 192 },
    { domain: "Intellectual / Cognitive", count: 128 },
    { domain: "Epilepsy / Neurological", count: 78 },
    { domain: "Multiple / Other", count: 82 },
  ];

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
              WASHINGTON GROUP FUNCTIONAL DOMAIN BREAKDOWN
            </h3>
            <div className="h-[430px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={functionalData}
                  margin={{ top: 10, right: 20, left: 50, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#0f2924" : "#e2e8f0"}
                  />
                  <XAxis
                    type="number"
                    tick={{
                      fill: isDark ? "#94a3b8" : "#475569",
                      fontSize: 10,
                    }}
                  />
                  <YAxis
                    dataKey="domain"
                    type="category"
                    tick={{
                      fill: isDark ? "#cbd5e1" : "#1e293b",
                      fontSize: 10,
                      fontWeight: 700,
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
                  <Bar
                    dataKey="count"
                    name="Persons"
                    fill="#14b8a6"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-sm overflow-x-auto">
        <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider mb-3">
          DISABILITY TARGETING & ASSISTIVE DEVICE DISTRIBUTION
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-900/30 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Pilot State</th>
              <th className="py-2.5 px-3">Total Individuals</th>
              <th className="py-2.5 px-3">Total PLWD</th>
              <th className="py-2.5 px-3">Children PLWD (0-17)</th>
              <th className="py-2.5 px-3">Adult PLWD (18+)</th>
              <th className="py-2.5 px-3">PLWD Prevalence %</th>
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
                  {st.individuals.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-bold text-teal-600 dark:text-teal-400">
                  {st.plwdTotal}
                </td>
                <td className="py-2.5 px-3 font-semibold text-rose-600 dark:text-rose-400">
                  {st.plwdChildren}
                </td>
                <td className="py-2.5 px-3">{st.plwdAdults}</td>
                <td className="py-2.5 px-3 font-bold">
                  {((st.plwdTotal / st.individuals) * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default Disabilities;
