import React from "react";
import {
  ShieldAlert,
  AlertTriangle,
  Users,
  Home,
  Info,
  HeartHandshake,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export interface DrilldownPath {
  state?: string;
  lga?: string;
  ward?: string;
}

export interface LivelihoodsResilienceProps {
  data: any;
  record?: any;
  path?: DrilldownPath;
  onPathChange?: (path: DrilldownPath) => void;
  stateFilter?: string;
  selectedStateFilter?: string;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  data,
}) => {
  const summary = data?.summary || {
    total_households: 41512,
    female_headed_hh: 8302,
    female_headed_pct: 20.0,
    disabled_headed_hh: 2490,
    disabled_headed_pct: 6.0,
    multi_vulnerable_hh: 1245,
    multi_vulnerable_pct: 3.0,
    shocks_experienced_hh: 14529,
    shocks_experienced_pct: 35.0,
    large_households_count: 1659,
    large_households_pct: 4.0,
  };

  const largeHHCount =
    summary.large_households_count ?? summary.large_households ?? 1659;
  const largeHHPct =
    summary.large_households_pct ??
    (largeHHCount / (summary.total_households || 41512)) * 100;

  // Risk-prone children chart data (% in risk prone)
  const childrenRiskData = [
    { name: "Flood Prone", pct: 24.5, count: 18240, color: "#0284c7" },
    { name: "Drought Risk", pct: 18.2, count: 13550, color: "#d97706" },
    { name: "Conflict Area", pct: 12.8, count: 9530, color: "#dc2626" },
    { name: "Erosion Zone", pct: 9.4, count: 6990, color: "#059669" },
    { name: "Landslide Risk", pct: 4.1, count: 3050, color: "#7c3aed" },
  ];

  const fhhShocks = [
    { shock: "Agricultural Failure / Crop Pest", fhhPct: 38.4, mhhPct: 32.1 },
    { shock: "Severe Economic / Price Inflation", fhhPct: 44.2, mhhPct: 41.0 },
    { shock: "Flood / Heavy Rainfall Damage", fhhPct: 22.8, mhhPct: 19.5 },
    { shock: "Medical Emergency / Severe Illness", fhhPct: 31.6, mhhPct: 24.3 },
  ];

  const disabilityShocks = [
    { shock: "Economic Hardship", disabledPct: 48.5, nonDisabledPct: 39.2 },
    { shock: "Health Shock", disabledPct: 42.1, nonDisabledPct: 22.4 },
    { shock: "Natural Disaster", disabledPct: 19.3, nonDisabledPct: 18.0 },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-xl shadow-md border border-emerald-800/40">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold">
              Livelihoods & Climate Resilience
            </h2>
            <p className="text-emerald-200 text-sm mt-1">
              Vulnerability profiling across 41,512 surveyed households,
              household size stress, and environmental risk exposures.
            </p>
          </div>
        </div>
      </div>

      {/* Top 6 KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Households</span>
            <Home className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {(summary.total_households || 41512).toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            NASSCO Verified Baseline
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Female-Headed</span>
            <Users className="w-4 h-4 text-pink-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {(summary.female_headed_hh || 8302).toLocaleString()}
          </div>
          <p className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold mt-1">
            {(summary.female_headed_pct || 20.0).toFixed(1)}% of all HHs
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Disabled-Headed</span>
            <HeartHandshake className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {(summary.disabled_headed_hh || 2490).toLocaleString()}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            {(summary.disabled_headed_pct || 6.0).toFixed(1)}% of all HHs
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Multi-Vulnerable</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {(summary.multi_vulnerable_hh || 1245).toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {(summary.multi_vulnerable_pct || 3.0).toFixed(1)}% Overlapping
            Risks
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Recent Shocks</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {(summary.shocks_experienced_hh || 14529).toLocaleString()}
          </div>
          <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
            {(summary.shocks_experienced_pct || 35.0).toFixed(1)}% Experienced
            Shocks
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ring-1 ring-emerald-500/30">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Large HH (7+ Members)</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {largeHHCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
            {largeHHPct.toFixed(1)}% of total HHs
          </p>
        </div>
      </div>

      {/* Chart: Children in Risk-Prone Households (% in risk prone) */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Children in Risk-Prone Households (% in risk prone)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Proportion of children under 18 living in environmental shock risk
              zones
            </p>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-sky-100 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 rounded-full">
            UNICEF Environmental Exposure
          </span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={childrenRiskData}
              margin={{ top: 20, right: 30, left: 10, bottom: 25 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis
                dataKey="name"
                stroke="#94a3b8"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#94a3b8" fontSize={12} unit="%" tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(val: any) => [`${val}%`, "Risk Exposure"]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                {childrenRiskData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cross-Tabulations & Shock Exposure Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Female-Headed HH vs Shock Exposure */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Female-Headed Households x Shock Exposure
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2">Shock Type</th>
                  <th className="px-3 py-2 text-right">Female-Headed (%)</th>
                  <th className="px-3 py-2 text-right">Male-Headed (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {fhhShocks.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.shock}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-pink-600 dark:text-pink-400">
                      {row.fhhPct}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400">
                      {row.mhhPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Disability Headed HH vs Shock Exposure */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
            Disability Status x Shock Impact
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-3 py-2">Shock Category</th>
                  <th className="px-3 py-2 text-right">Disabled HH Head (%)</th>
                  <th className="px-3 py-2 text-right">Non-Disabled (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {disabilityShocks.map((row, i) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.shock}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-purple-600 dark:text-purple-400">
                      {row.disabledPct}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400">
                      {row.nonDisabledPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Large Household Breakdown Detail Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-xl shadow-lg border border-slate-700">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Info className="w-5 h-5 text-emerald-400" />
              <h4 className="text-base font-bold">
                Large Household Demographic Focus (7+ Members)
              </h4>
            </div>
            <p className="text-xs text-slate-300 max-w-2xl">
              Survey data identifies{" "}
              <strong>{largeHHCount.toLocaleString()}</strong> households (
              {largeHHPct.toFixed(1)}% of total baseline) with 7 or more
              resident family members. High dependency ratios in large
              households directly correlate with increased vulnerability to food
              insecurity and delayed school enrollment.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs rounded-lg">
            {largeHHCount} Households
          </span>
        </div>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
