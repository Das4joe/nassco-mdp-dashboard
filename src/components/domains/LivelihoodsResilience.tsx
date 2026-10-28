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
import type { DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import DrilldownMap from "../maps/DrilldownMap";

export interface LivelihoodsResilienceProps {
  data: DashboardData;
  record?: any;
  path?: DrilldownPath;
  onPathChange?: (path: DrilldownPath) => void;
  stateFilter?: string;
  selectedStateFilter?: string;
}

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  data,
  record,
  path = {},
  onPathChange,
  stateFilter,
  selectedStateFilter,
}) => {
  const rec = (record || {}) as any;
  const ext = rec.extended || {};
  const lv =
    ext.livelihoods_resilience_v2 || rec.livelihoods_resilience_v2 || {};
  const nsr = rec.nsr || {};

  const totalHH = Number(
    nsr.total_households ??
      rec.total_households ??
      data?.national?.nsr?.total_households ??
      41512,
  );
  const femaleHeaded = Number(
    lv.female_headed_hhs ?? rec.female_headed_hhs ?? 0,
  );
  const disabledHeaded = Number(
    lv.disabled_headed_hhs ?? rec.disabled_headed_hhs ?? 0,
  );
  const multiVulnerable = Number(
    lv.multi_vulnerable_hhs ?? rec.multi_vulnerable_hhs ?? 0,
  );
  const shocksHH = Number(lv.shock_prone_hhs ?? rec.shock_prone_hhs ?? 0);
  const largeHHCount = Number(
    lv.large_households ??
      rec.large_households ??
      rec.large_households_count ??
      1659,
  );

  const femaleHeadedPct = totalHH > 0 ? (femaleHeaded / totalHH) * 100 : 0;
  const disabledHeadedPct = totalHH > 0 ? (disabledHeaded / totalHH) * 100 : 0;
  const multiVulnerablePct =
    totalHH > 0 ? (multiVulnerable / totalHH) * 100 : 0;
  const shocksPct = totalHH > 0 ? (shocksHH / totalHH) * 100 : 0;
  const largeHHPct = totalHH > 0 ? (largeHHCount / totalHH) * 100 : 0;

  // Prefer live extended children-in-risk if present; otherwise show empty honest state
  const childrenRiskRaw =
    ext.children_in_risk_zones || rec.children_in_risk_zones;
  const childrenRiskData = childrenRiskRaw
    ? Object.entries(childrenRiskRaw).map(([name, v]: [string, any]) => ({
        name,
        pct: Number(v?.pct ?? v ?? 0),
        count: Number(v?.count ?? 0),
        color: "#0284c7",
      }))
    : [];

  const fhhShocks = ext.fhh_shock_exposure || [
    { shock: "Agricultural Failure / Crop Pest", fhhPct: 0, mhhPct: 0 },
    { shock: "Severe Economic / Price Inflation", fhhPct: 0, mhhPct: 0 },
    { shock: "Flood / Heavy Rainfall Damage", fhhPct: 0, mhhPct: 0 },
    { shock: "Medical Emergency / Severe Illness", fhhPct: 0, mhhPct: 0 },
  ];

  const disabilityShocks = ext.disability_shock_exposure || [
    { shock: "Economic Hardship", disabledPct: 0, nonDisabledPct: 0 },
    { shock: "Health Shock", disabledPct: 0, nonDisabledPct: 0 },
    { shock: "Natural Disaster", disabledPct: 0, nonDisabledPct: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white p-6 rounded-xl shadow-md border border-emerald-800/40">
        <div className="flex items-center space-x-3">
          <ShieldAlert className="w-8 h-8 text-emerald-400" />
          <div>
            <h2 className="text-2xl font-bold">
              Livelihoods & Climate Resilience
            </h2>
            <p className="text-emerald-200 text-sm mt-1">
              Vulnerability profiling across surveyed households, household size
              stress, and environmental risk exposures.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Total Households</span>
            <Home className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {totalHH.toLocaleString()}
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
            {femaleHeaded.toLocaleString()}
          </div>
          <p className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold mt-1">
            {femaleHeadedPct.toFixed(1)}% of all HHs
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Disabled-Headed</span>
            <HeartHandshake className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {disabledHeaded.toLocaleString()}
          </div>
          <p className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-1">
            {disabledHeadedPct.toFixed(1)}% of all HHs
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Multi-Vulnerable</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {multiVulnerable.toLocaleString()}
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            {multiVulnerablePct.toFixed(1)}% Overlapping Risks
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Recent Shocks</span>
            <ShieldAlert className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-2">
            {shocksHH.toLocaleString()}
          </div>
          <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
            {shocksPct.toFixed(1)}% Experienced Shocks
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

      {/* Map */}
      {onPathChange && (
        <div
          className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
          style={{ height: 420 }}
        >
          <DrilldownMap
            data={data}
            path={path}
            onPathChange={onPathChange}
            selectedStateFilter={selectedStateFilter || stateFilter}
            domain="livelihoods"
            height={420}
          />
        </div>
      )}

      {childrenRiskData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Children in Risk-Prone Households (% in risk prone)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Proportion of children under 18 living in environmental shock
                risk zones
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
                <YAxis
                  stroke="#94a3b8"
                  fontSize={12}
                  unit="%"
                  tickLine={false}
                />
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
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                {fhhShocks.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.shock}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-pink-600 dark:text-pink-400">
                      {Number(row.fhhPct || 0)}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400">
                      {Number(row.mhhPct || 0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
                {disabilityShocks.map((row: any, i: number) => (
                  <tr
                    key={i}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-3 py-2.5 font-medium">{row.shock}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-purple-600 dark:text-purple-400">
                      {Number(row.disabledPct || 0)}%
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-500 dark:text-slate-400">
                      {Number(row.nonDisabledPct || 0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

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
            {largeHHCount.toLocaleString()} Households
          </span>
        </div>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
