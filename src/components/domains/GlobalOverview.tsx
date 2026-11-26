import type React from "react";
import { useState } from "react";
import {
  Users,
  Home,
  Baby,
  UserCheck,
  Building2,
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
import { PopulationPyramid } from "../charts/PopulationPyramid";
import type { GeoRecord, GeoLevel, DrilldownState } from "../../types";

export interface GlobalOverviewProps {
  record?: GeoRecord;
  activeRecord?: GeoRecord;
  drilldown?: DrilldownState;
  isDark?: boolean;
}

const AGE_RATIO_DATA = [
  { cohort: "0-4 yrs", total: 11313, boys: 5740, girls: 5573, pct: 8.2 },
  { cohort: "5-9 yrs", total: 19284, boys: 9842, girls: 9442, pct: 13.9 },
  { cohort: "10-14 yrs", total: 16952, boys: 8620, girls: 8332, pct: 12.2 },
  { cohort: "15-19 yrs", total: 15799, boys: 8010, girls: 7789, pct: 11.4 },
  { cohort: "20-24 yrs", total: 13352, boys: 6790, girls: 6562, pct: 9.6 },
];

const COMMUNITY_DEMO_TABLE = [
  {
    state: "Abia",
    lgas: 8,
    communities: 204,
    households: 9842,
    individuals: 31820,
    children: 13240,
    youth: 4360,
    femaleHhPct: "19.2%",
  },
  {
    state: "Benue",
    lgas: 7,
    communities: 238,
    households: 11430,
    individuals: 39114,
    children: 16270,
    youth: 5360,
    femaleHhPct: "17.8%",
  },
  {
    state: "Oyo",
    lgas: 8,
    communities: 210,
    households: 10120,
    individuals: 33640,
    children: 13990,
    youth: 4610,
    femaleHhPct: "20.1%",
  },
  {
    state: "Sokoto",
    lgas: 8,
    communities: 212,
    households: 10120,
    individuals: 34102,
    children: 14188,
    youth: 4682,
    femaleHhPct: "16.5%",
  },
];

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
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
          title="Total Households"
          value={active?.households ?? 41512}
          subtitle="Enumerated households"
          tag="NSR COVERAGE"
          tone="positive"
          isDark={isDark}
          icon={Home}
        />
        <KpiCard
          title="Total Individuals"
          value={active?.individuals ?? 138676}
          subtitle="Male: 70,312 | Female: 68,364"
          tag="ALL MEMBERS"
          tone="neutral"
          isDark={isDark}
          icon={Users}
        />
        <KpiCard
          title="Children (0 - 17)"
          value={active?.children017 ?? 57688}
          subtitle="41.6% of registry"
          tag="41.6% POP"
          tone="warning"
          isDark={isDark}
          icon={Baby}
        />
        <KpiCard
          title="Youth (18 - 24)"
          value={active?.youth1824 ?? 19012}
          subtitle="13.7% of registry"
          tag="13.7% POP"
          tone="neutral"
          isDark={isDark}
          icon={UserCheck}
        />
        <KpiCard
          title="Communities Covered"
          value={active?.communities ?? 864}
          subtitle="Across 31 LGAs"
          tag="864 SETTLEMENTS"
          tone="positive"
          isDark={isDark}
          icon={Building2}
        />
      </div>

      {/* 2-COLUMN LAYER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LAYER 2 (Left, 55% width / 7 cols): GIS Vector Map */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-400" />
              <h3 className="text-sm font-semibold text-white">
                Geographic Coverage & Administrative Morphing
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
              activeDomain="overview"
              record={active}
            />
          </div>
        </div>

        {/* LAYER 3 (Right, 45% width / 5 cols): Bilateral Population Pyramid & Age Ratio Chart */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
            <PopulationPyramid isDark={isDark} />
          </div>

          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur flex-1">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              Age Cohort Distribution (0 - 24 Years)
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={AGE_RATIO_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#134e4a"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="cohort"
                    stroke="#94a3b8"
                    tick={{ fontSize: 11 }}
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
                    dataKey="boys"
                    name="Boys"
                    fill="#0EA5E9"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="girls"
                    name="Girls"
                    fill="#EC4899"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 4: Bottom Demographic Breakdown Table */}
      <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-4 shadow-md backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              State-Level Pilot Enumeration Summary
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Source: National Social Safety Nets Project (NASSP-SU) Microdata
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#134e4a]/60 bg-[#071c1a]/80 text-teal-300">
                <th className="py-2 px-3 font-semibold">Pilot State</th>
                <th className="py-2 px-3 font-semibold text-right">
                  Targeted LGAs
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  Communities
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  Households
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  Individuals
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  Children (0-17)
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  Youth (18-24)
                </th>
                <th className="py-2 px-3 font-semibold text-right">
                  Female-Headed HH %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#134e4a]/30 text-slate-200">
              {COMMUNITY_DEMO_TABLE.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#134e4a]/20 transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-white">
                    {row.state}
                  </td>
                  <td className="py-2.5 px-3 text-right">{row.lgas}</td>
                  <td className="py-2.5 px-3 text-right">{row.communities}</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.households.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.individuals.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-teal-300">
                    {row.children.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.youth.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold text-emerald-400">
                    {row.femaleHhPct}
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

export const Overview = GlobalOverview;
export default GlobalOverview;
