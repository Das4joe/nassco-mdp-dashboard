import React from "react";
import type { GeoRecord, GeoLevel } from "../../lib/types";
import { KpiCard } from "../KpiCard";
import {
  ShieldAlert,
  Coins,
  TrendingDown,
  Building,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

export interface LivelihoodsResilienceProps {
  record: GeoRecord;
  onSelectLocation?: (name: string, level: GeoLevel) => void;
  isDark?: boolean;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  record,
  isDark = true,
}) => {
  const lr = record.livelihoods_resilience;

  // Safe fallback values
  const femaleHeadedPct = lr?.female_headed_pct ?? 0;
  const subsistenceFarmingPct = lr?.subsistence_farming_pct ?? 0;
  const zeroAssetHhPct = lr?.zero_asset_hh_pct ?? 0;
  const severeCopingHhPct = lr?.severe_coping_hh_pct ?? 0;
  const accessToCreditPct = lr?.access_to_credit_pct ?? 0;

  // Primary income source breakdown for charts
  const incomeChartData = [
    {
      name: "Subsistence Farming",
      value: subsistenceFarmingPct,
      color: "#10B981",
    },
    {
      name: "Informal Wage / Petty Trade",
      value: lr?.informal_wage_labor_pct ?? 0,
      color: "#F59E0B",
    },
    {
      name: "Formal / Salaried",
      value: lr?.formal_employment_pct ?? 0,
      color: "#3B82F6",
    },
    {
      name: "Unemployed / Dependent",
      value: lr?.unemployed_dependent_pct ?? 0,
      color: "#EF4444",
    },
  ];

  // Coping strategies breakdown
  const copingData = [
    {
      name: "Reduced Meal Frequency",
      pct: lr?.coping_reduced_meals_pct ?? 0,
      color: "#EF4444",
    },
    {
      name: "Sold Productive Assets",
      pct: lr?.coping_sold_assets_pct ?? 0,
      color: "#F97316",
    },
    {
      name: "Child Labor / School Withdrawal",
      pct: lr?.coping_child_labor_pct ?? 0,
      color: "#DC2626",
    },
    {
      name: "Borrowed from Moneylenders",
      pct: lr?.coping_borrowed_money_pct ?? 0,
      color: "#A855F7",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top 5 Key Livelihood Indicators using your exact KpiCard props */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KpiCard
          title="FEMALE-HEADED HH"
          value={`${femaleHeadedPct.toFixed(1)}%`}
          tag="VULNERABILITY"
          accentColor="#EC4899"
          isDark={isDark}
          icon={<Users className="w-4 h-4 text-pink-400" />}
        />
        <KpiCard
          title="SUBSISTENCE FARMING"
          value={`${subsistenceFarmingPct.toFixed(1)}%`}
          tag="PRIMARY SOURCE"
          accentColor="#10B981"
          isDark={isDark}
          icon={<Building className="w-4 h-4 text-emerald-400" />}
        />
        <KpiCard
          title="ZERO PRODUCTIVE ASSETS"
          value={`${zeroAssetHhPct.toFixed(1)}%`}
          tag="ASSET DEPLETION"
          accentColor="#EF4444"
          isDark={isDark}
          icon={<TrendingDown className="w-4 h-4 text-red-400" />}
        />
        <KpiCard
          title="EMERGENCY COPING"
          value={`${severeCopingHhPct.toFixed(1)}%`}
          tag="DISTRESS COPING"
          accentColor="#F59E0B"
          isDark={isDark}
          icon={<AlertTriangle className="w-4 h-4 text-amber-400" />}
        />
        <KpiCard
          title="ACCESS TO FORMAL CREDIT"
          value={`${accessToCreditPct.toFixed(1)}%`}
          tag="ECONOMIC INCLUSION"
          accentColor="#3B82F6"
          isDark={isDark}
          icon={<Coins className="w-4 h-4 text-blue-400" />}
        />
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income Distribution */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/60 border-slate-800 backdrop-blur-xl shadow-lg"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`font-bold text-base ${isDark ? "text-slate-100" : "text-slate-800"}`}
              >
                Livelihood & Income Composition
              </h3>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Primary revenue generator per household in {record.name}
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              Economy
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={incomeChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {incomeChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [
                    `${val.toFixed(1)}%`,
                    "Households",
                  ]}
                  contentStyle={{
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                    borderRadius: "12px",
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => (
                    <span
                      className={`text-xs ${isDark ? "text-slate-300" : "text-slate-600"}`}
                    >
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Negative Coping Strategies */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/60 border-slate-800 backdrop-blur-xl shadow-lg"
              : "bg-white border-slate-200 shadow-sm"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3
                className={`font-bold text-base ${isDark ? "text-slate-100" : "text-slate-800"}`}
              >
                Negative Coping & Shock Response
              </h3>
              <p
                className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Share of households adopting distress strategies
              </p>
            </div>
            <span className="px-2.5 py-1 text-xs rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-medium flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> High Risk
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={copingData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fill: isDark ? "#94A3B8" : "#64748B", fontSize: 11 }}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: isDark ? "#CBD5E1" : "#334155", fontSize: 11 }}
                  width={140}
                />
                <Tooltip
                  formatter={(val: number) => [
                    `${val.toFixed(1)}%`,
                    "Adoption Rate",
                  ]}
                  contentStyle={{
                    backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                    borderColor: isDark ? "#334155" : "#E2E8F0",
                    borderRadius: "12px",
                    color: isDark ? "#F8FAFC" : "#0F172A",
                  }}
                />
                <Bar dataKey="pct" radius={[0, 8, 8, 0]} barSize={20}>
                  {copingData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
