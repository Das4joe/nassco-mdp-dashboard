import React from "react";
import { HeartPulse, Baby, ShieldAlert, ShieldCheck } from "lucide-react";
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

export interface HealthNutritionProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectLga: (lga: string | null) => void;
  onSelectWard?: (ward: string | null) => void;
  isDark?: boolean;
}

export const HealthNutrition: React.FC<HealthNutritionProps> = ({
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
      title: "PREGNANT WOMEN",
      value: "2,483",
      subValue: "Target maternal care",
      badge: "High Priority",
      badgeType: "danger" as const,
      icon: HeartPulse,
    },
    {
      title: "LACTATING MOTHERS",
      value: "7,180",
      subValue: "Infant feeding support",
      badge: "Active Cohort",
      badgeType: "warning" as const,
      icon: Baby,
    },
    {
      title: "MUAC SAM CASES",
      value: "1,190",
      subValue: "3.1% acute malnutrition",
      badge: "Emergency Care",
      badgeType: "danger" as const,
      icon: ShieldAlert,
    },
    {
      title: "HEALTH INSURANCE ACCESS",
      value: "4.2%",
      subValue: "95.8% out-of-pocket gap",
      badge: "Critical Need",
      badgeType: "danger" as const,
      icon: ShieldAlert,
    },
    {
      title: "NUTRITION SERVICES ACCESS",
      value: "26.8%",
      subValue: "73.2% unserved",
      badge: "Coverage Target",
      badgeType: "info" as const,
      icon: ShieldCheck,
    },
  ];

  const muacPie = [
    { name: "Normal (≥ 12.5 cm)", value: 32800, color: "#10b981" },
    { name: "MAM (11.5 - 12.4 cm)", value: 4620, color: "#f59e0b" },
    { name: "SAM (< 11.5 cm)", value: 1190, color: "#ef4444" },
  ];

  const stateBar = STATES_BASELINE.map((s: StateSummaryItem) => ({
    state: s.state,
    "SAM Cases": s.muacSam,
    "MAM Cases": s.muacMam,
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
              MUAC NUTRITION STATUS (CHILDREN 6–59 MONTHS)
            </h3>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={muacPie}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={78}
                    paddingAngle={2}
                  >
                    {muacPie.map((entry, index) => (
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
              ACUTE MALNUTRITION CASES (SAM & MAM) BY STATE
            </h3>
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateBar}
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
                    dataKey="SAM Cases"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="MAM Cases"
                    fill="#f59e0b"
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
          MATERNAL & CHILD HEALTH PRIORITY TARGETING TABLE
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-900/30 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Pilot State</th>
              <th className="py-2.5 px-3">Pregnant Women</th>
              <th className="py-2.5 px-3">Lactating Mothers</th>
              <th className="py-2.5 px-3">SAM Cases</th>
              <th className="py-2.5 px-3">MAM Cases</th>
              <th className="py-2.5 px-3">Health Insurance %</th>
              <th className="py-2.5 px-3">Nutrition Access %</th>
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
                <td className="py-2.5 px-3 font-semibold text-rose-600 dark:text-rose-400">
                  {st.pregnantWomen.toLocaleString()}
                </td>
                <td className="py-2.5 px-3">
                  {st.lactatingMothers.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-bold text-red-600 dark:text-red-400">
                  {st.muacSam.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 font-semibold text-amber-600 dark:text-amber-400">
                  {st.muacMam.toLocaleString()}
                </td>
                <td className="py-2.5 px-3">{st.healthInsurancePct}%</td>
                <td className="py-2.5 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                  {st.nutritionAccessPct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default HealthNutrition;
