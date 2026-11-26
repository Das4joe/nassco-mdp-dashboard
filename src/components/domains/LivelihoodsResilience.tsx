import type React from "react";
import { useState } from "react";
import {
  Briefcase,
  TrendingDown,
  AlertTriangle,
  UserCheck,
  Shield,
  Layers,
  Table as TableIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { KpiCard } from "../KpiCard";
import { DrilldownMap } from "../DrilldownMap";
import type { GeoRecord, GeoLevel, DrilldownState } from "../../types";

export interface LivelihoodsResilienceProps {
  record?: GeoRecord;
  activeRecord?: GeoRecord;
  drilldown?: DrilldownState;
  isDark?: boolean;
}

const LIVELIHOOD_ACTIVITIES = [
  { activity: "Subsistence Farming", count: 26069, pct: 62.8 },
  { activity: "Petty Trade / Commerce", count: 8883, pct: 21.4 },
  { activity: "Casual Wage Labor", count: 4898, pct: 11.8 },
  { activity: "Formal / Salary", count: 1662, pct: 4.0 },
];

const SHOCK_EXPOSURE = [
  { shock: "Food Inflation", exposedPct: 68.4 },
  { shock: "Floods / Weather", exposedPct: 34.2 },
  { shock: "Crop Pest / Disease", exposedPct: 28.6 },
  { shock: "Conflict / Insecurity", exposedPct: 18.2 },
];

const LIVELIHOOD_TABLE = [
  {
    state: "Abia",
    femaleHhPct: "19.2%",
    mainLivelihood: "Petty Trade & Farming",
    youthActivePct: "48.2%",
    negCopingPct: "34.1%",
    childCopingPct: "11.2%",
  },
  {
    state: "Benue",
    femaleHhPct: "17.8%",
    mainLivelihood: "Crop Agriculture",
    youthActivePct: "42.1%",
    negCopingPct: "41.6%",
    childCopingPct: "16.8%",
  },
  {
    state: "Oyo",
    femaleHhPct: "20.1%",
    mainLivelihood: "Trade & Smallholder Ag",
    youthActivePct: "46.5%",
    negCopingPct: "32.8%",
    childCopingPct: "12.4%",
  },
  {
    state: "Sokoto",
    femaleHhPct: "16.5%",
    mainLivelihood: "Subsistence Farming",
    youthActivePct: "41.8%",
    negCopingPct: "44.2%",
    childCopingPct: "18.8%",
  },
];

export const LivelihoodsResilience: React.FC<LivelihoodsResilienceProps> = ({
  record,
  activeRecord,
  isDark = true,
}) => {
  const [geoLevel, setGeoLevel] = useState<GeoLevel>("national");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  const active = record || activeRecord;

  return (
    <div className="space-y-4">
      {/* LAYER 1: 5 Standardized Top KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Female-Headed HH"
          value="18.4%"
          subtitle="7,638 households"
          tag="GENDER VULNERABILITY"
          tone="neutral"
          isDark={isDark}
          icon={Briefcase}
        />
        <KpiCard
          title="Main Livelihood Source"
          value="Agriculture (62.8%)"
          subtitle="26,069 subsistence HHs"
          tag="AGRO DEPENDENCY"
          tone="warning"
          isDark={isDark}
          icon={Shield}
        />
        <KpiCard
          title="Youth Economic Activity"
          value="44.6%"
          subtitle="Ages 18-24 employed/farming"
          tag="YOUTH EMPLOYMENT"
          tone="positive"
          isDark={isDark}
          icon={UserCheck}
        />
        <KpiCard
          title="Negative Coping Strategies"
          value="38.2%"
          subtitle="Asset sales & skipping meals"
          tag="HIGH VULNERABILITY"
          tone="critical"
          isDark={isDark}
          icon={TrendingDown}
        />
        <KpiCard
          title="Child-Related Coping"
          value="14.8%"
          subtitle="Child labor / School withdrawal"
          tag="CHILD PROTECTION"
          tone="critical"
          isDark={isDark}
          icon={AlertTriangle}
        />
      </div>

      {/* 2-COLUMN LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LAYER 2 (Left, 55%): Leaflet Vector GIS Map */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">
                Livelihood & Climate Shock Spatial Matrix
              </h3>
            </div>
            <span className="rounded bg-teal-500/20 px-2 py-0.5 text-[10px] font-bold text-teal-300 border border-teal-500/30 uppercase">
              {geoLevel} Level
            </span>
          </div>

          <div className="h-[490px] w-full rounded-lg overflow-hidden border border-[#134e4a]/30">
            <DrilldownMap
              level={geoLevel}
              selectedState={selectedState}
              selectedLga={selectedLga}
              selectedWard={selectedWard}
              onSelectState={(st: string) => {
                setSelectedState(st);
                setGeoLevel("state");
              }}
              onSelectLga={(lg: string) => {
                setSelectedLga(lg);
                setGeoLevel("lga");
              }}
              onSelectWard={(wd: string) => {
                setSelectedWard(wd);
                setGeoLevel("ward");
              }}
              onReset={() => {
                setSelectedState(null);
                setSelectedLga(null);
                setSelectedWard(null);
                setGeoLevel("national");
              }}
              isDark={isDark}
              activeDomain="livelihoods-resilience"
              record={active}
            />
          </div>
        </div>

        {/* LAYER 3 (Right, 45%): Charts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              Primary Household Livelihood Source (%)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={LIVELIHOOD_ACTIVITIES}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 70, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#134e4a"
                    opacity={0.3}
                  />
                  <XAxis
                    type="number"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis
                    type="category"
                    dataKey="activity"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#071c1a",
                      borderColor: "#134e4a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="pct" fill="#2DD4BF" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur flex-1">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              Household Shock Exposure Rates (%)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={SHOCK_EXPOSURE}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#134e4a"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="shock"
                    stroke="#94a3b8"
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#071c1a",
                      borderColor: "#134e4a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                  <Bar
                    dataKey="exposedPct"
                    fill="#F59E0B"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 4: Bottom Table */}
      <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-4 shadow-md backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              State Resilience, Youth Activity & Coping Strategy Distribution
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            NASSCO Shock & Resilience Baseline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#134e4a]/60 bg-[#071c1a]/80 text-teal-300">
                <th className="py-2.5 px-3 font-semibold">Pilot State</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Female-Headed HH %
                </th>
                <th className="py-2.5 px-3 font-semibold">Main Livelihood</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Youth Active %
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Negative Coping %
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Child Coping %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#134e4a]/30 text-slate-200">
              {LIVELIHOOD_TABLE.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#134e4a]/20 transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-white">
                    {row.state}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400">
                    {row.femaleHhPct}
                  </td>
                  <td className="py-2.5 px-3">{row.mainLivelihood}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-teal-300">
                    {row.youthActivePct}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-400 font-semibold">
                    {row.negCopingPct}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                    {row.childCopingPct}
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
