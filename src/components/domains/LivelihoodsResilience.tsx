import React from "react";
import { TrendingUp, ShieldAlert, Users, Zap, Briefcase } from "lucide-react";
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

export interface LivelihoodsResilienceProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onSelectState: (state: string | null) => void;
  onSelectLga: (lga: string | null) => void;
  onSelectWard?: (ward: string | null) => void;
  isDark?: boolean;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
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
      title: "FEMALE-HEADED HH (%)",
      value: "18.4%",
      subValue: "7,638 vulnerable households",
      badge: "Gender Priority",
      badgeType: "warning" as const,
      icon: Users,
    },
    {
      title: "MAIN LIVELIHOOD (AGRICULTURE)",
      value: "62.8%",
      subValue: "26,069 agrarian HHs",
      badge: "Primary Sector",
      badgeType: "info" as const,
      icon: Briefcase,
    },
    {
      title: "YOUTH ECONOMIC ACTIVITY",
      value: "44.6%",
      subValue: "55.4% youth NEET gap",
      badge: "Labor Inclusion",
      badgeType: "info" as const,
      icon: TrendingUp,
    },
    {
      title: "NEGATIVE COPING MECHANISMS",
      value: "38.2%",
      subValue: "Asset sale & food reduction",
      badge: "Severe Vulnerability",
      badgeType: "danger" as const,
      icon: ShieldAlert,
    },
    {
      title: "CHILD-RELATED COPING",
      value: "14.8%",
      subValue: "Child labor & school removal",
      badge: "Critical Protection",
      badgeType: "danger" as const,
      icon: Zap,
    },
  ];

  const livelihoodsData = [
    { activity: "Crop Farming", percentage: 51.4 },
    { activity: "Petty Trading", percentage: 21.4 },
    { activity: "Livestock / Pastoral", percentage: 11.4 },
    { activity: "Artisanal / Wage Labor", percentage: 9.8 },
    { activity: "Other / Remittances", percentage: 6.0 },
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
              PRIMARY HOUSEHOLD LIVELIHOOD ACTIVITIES (%)
            </h3>
            <div className="h-[430px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={livelihoodsData}
                  margin={{ top: 10, right: 20, left: 40, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#0f2924" : "#e2e8f0"}
                  />
                  <XAxis
                    type="number"
                    unit="%"
                    tick={{
                      fill: isDark ? "#94a3b8" : "#475569",
                      fontSize: 10,
                    }}
                  />
                  <YAxis
                    dataKey="activity"
                    type="category"
                    tick={{
                      fill: isDark ? "#cbd5e1" : "#1e293b",
                      fontSize: 10,
                      fontWeight: 700,
                    }}
                  />
                  <Tooltip
                    formatter={(val) => [`${val}%`, "Households"]}
                    contentStyle={{
                      backgroundColor: isDark ? "#071715" : "#ffffff",
                      borderColor: isDark ? "#065f46" : "#cbd5e1",
                      borderRadius: 8,
                      fontSize: 11,
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#059669"
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
          LIVELIHOOD DIVERSITY & SHOCK RESILIENCE TABLE
        </h3>
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-emerald-900/30 text-slate-500 dark:text-slate-400 font-bold uppercase text-[10px]">
              <th className="py-2.5 px-3">Pilot State</th>
              <th className="py-2.5 px-3">Female-Headed HH %</th>
              <th className="py-2.5 px-3">Main Livelihood</th>
              <th className="py-2.5 px-3">Youth Econ Activity %</th>
              <th className="py-2.5 px-3">Negative Coping %</th>
              <th className="py-2.5 px-3">Child Coping %</th>
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
                <td className="py-2.5 px-3 font-semibold text-amber-600 dark:text-amber-400">
                  {st.femaleHeadedHhPct}%
                </td>
                <td className="py-2.5 px-3">{st.mainLivelihood}</td>
                <td className="py-2.5 px-3 font-semibold">
                  {st.youthEconActivityPct}%
                </td>
                <td className="py-2.5 px-3 font-bold text-rose-600 dark:text-rose-400">
                  {st.negativeCopingPct}%
                </td>
                <td className="py-2.5 px-3 font-bold text-red-600 dark:text-red-400">
                  {st.childCopingPct}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default LivelihoodsResilience;
