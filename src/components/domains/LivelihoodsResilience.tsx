import React, { useMemo } from "react";
import { SummaryCards, type MetricCardItem } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  getStateSummary,
  STATES_BASELINE,
  type StateSummaryItem,
} from "../../services/dataService";
import {
  UserCheck,
  Briefcase,
  Zap,
  ShieldAlert,
  AlertTriangle,
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

export interface LivelihoodsResilienceProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  onStateSelect: (stateName: string) => void;
  onLgaSelect: (lgaName: string) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
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
        id: "kpi-female-hh",
        title: "Female-Headed HH",
        value: `${summary.femaleHeadedHhPct}%`,
        subtitle: `${Math.round(summary.households * (summary.femaleHeadedHhPct / 100)).toLocaleString()} households`,
        badge: "18.4% REGISTRY AVG",
        icon: UserCheck,
        accentColor: "rose",
      },
      {
        id: "kpi-main-livelihood",
        title: "Main Livelihood Source",
        value: "Agriculture",
        subtitle: summary.mainLivelihood,
        badge: "62.8% DOMINANCE",
        icon: Briefcase,
        accentColor: "emerald",
      },
      {
        id: "kpi-youth-econ",
        title: "Youth Economic Activity",
        value: `${summary.youthEconActivityPct}%`,
        subtitle: "Employed, Farming or Trade",
        badge: "44.6% REGISTRY AVG",
        icon: Zap,
        accentColor: "cyan",
      },
      {
        id: "kpi-neg-coping",
        title: "Negative Coping Strategy",
        value: `${summary.negativeCopingPct}%`,
        subtitle: "Asset Sale & Meal Reduction",
        badge: "38.2% SHOCK RATE",
        icon: ShieldAlert,
        accentColor: "amber",
      },
      {
        id: "kpi-child-coping",
        title: "Child-Related Coping",
        value: `${summary.childCopingPct}%`,
        subtitle: "Child Labor / School Withdrawal",
        badge: "14.8% ACUTE RISK",
        icon: AlertTriangle,
        accentColor: "rose",
      },
    ],
    [summary],
  );

  const livelihoodDistributionData = [
    { source: "Crop Farming", share: 51.4 },
    { source: "Petty Trade & Retail", share: 21.4 },
    { source: "Livestock / Pastoralism", share: 11.4 },
    { source: "Daily Wage Labor", share: 9.2 },
    { source: "Artisanal & Services", share: 6.6 },
  ];

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
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-2">
              Livelihood Activity Breakdown (%)
            </h3>
            <div className="w-full flex-1 min-h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={livelihoodDistributionData}
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
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="source"
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
                    formatter={(val: any) => [`${val}%`, "Share of Households"]}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar
                    dataKey="share"
                    name="Share of Households"
                    fill="#10b981"
                    radius={[0, 3, 3, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Livelihood Table */}
      <div className="rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-[#1a3d36] border-slate-200 dark:bg-[#132c26] bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-100 text-slate-800">
            Household Economic Profile & Coping Strategies by State
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#0f2823] bg-slate-100 dark:text-slate-300 text-slate-700 font-bold border-b dark:border-[#1a3d36] border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Pilot State</th>
                <th className="px-4 py-2.5 text-right">Female-Headed HH %</th>
                <th className="px-4 py-2.5 text-left">Primary Livelihood</th>
                <th className="px-4 py-2.5 text-right">Youth Econ %</th>
                <th className="px-4 py-2.5 text-right">Negative Coping %</th>
                <th className="px-4 py-2.5 text-right">Child Coping %</th>
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
                  <td className="px-4 py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                    {st.femaleHeadedHhPct}%
                  </td>
                  <td className="px-4 py-2.5 text-left font-medium">
                    {st.mainLivelihood}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-cyan-600 dark:text-cyan-400">
                    {st.youthEconActivityPct}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {st.negativeCopingPct}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-rose-600 dark:text-rose-400">
                    {st.childCopingPct}%
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

export default LivelihoodsResilience;
