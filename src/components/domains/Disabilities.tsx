import type React from "react";
import { useState } from "react";
import {
  Accessibility,
  Baby,
  Users,
  ShieldAlert,
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

export interface DisabilitiesProps {
  record?: GeoRecord;
  activeRecord?: GeoRecord;
  drilldown?: DrilldownState;
  isDark?: boolean;
}

const DISABILITY_TYPE_DATA = [
  { type: "Physical / Mobility", count: 512, pct: 37.2 },
  { type: "Visual Impairment", count: 384, pct: 27.9 },
  { type: "Hearing / Speech", count: 192, pct: 14.0 },
  { type: "Intellectual / Mental", count: 128, pct: 9.3 },
  { type: "Epilepsy", count: 78, pct: 5.7 },
  { type: "Multiple / Other", count: 82, pct: 5.9 },
];

const DISABILITY_TABLE = [
  {
    state: "Abia",
    totalPlwd: 318,
    childrenPlwd: 52,
    boys: 28,
    girls: 24,
    adultPlwd: 266,
    topType: "Physical Mobility",
  },
  {
    state: "Benue",
    totalPlwd: 395,
    childrenPlwd: 64,
    boys: 34,
    girls: 30,
    adultPlwd: 331,
    topType: "Physical Mobility",
  },
  {
    state: "Oyo",
    totalPlwd: 326,
    childrenPlwd: 51,
    boys: 27,
    girls: 24,
    adultPlwd: 275,
    topType: "Visual Impairment",
  },
  {
    state: "Sokoto",
    totalPlwd: 337,
    childrenPlwd: 54,
    boys: 29,
    girls: 25,
    adultPlwd: 283,
    topType: "Visual Impairment",
  },
];

export const Disabilities: React.FC<DisabilitiesProps> = ({
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
      {/* LAYER 1: 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          title="Total PLWD"
          value="1,376"
          subtitle="Persons living with disabilities"
          tag="WASHINGTON GROUP"
          tone="warning"
          isDark={isDark}
          icon={Accessibility}
        />
        <KpiCard
          title="Children PLWD (0 - 17)"
          value="221"
          subtitle="16.1% of all PLWD"
          tag="CHILD PLWD"
          tone="critical"
          isDark={isDark}
          icon={Baby}
        />
        <KpiCard
          title="Adults PLWD (18+)"
          value="1,155"
          subtitle="83.9% of all PLWD"
          tag="ADULT PLWD"
          tone="neutral"
          isDark={isDark}
          icon={Users}
        />
        <KpiCard
          title="Children PLWD by Gender"
          value="118 Boys / 103 Girls"
          subtitle="Boys: 53.4% | Girls: 46.6%"
          tag="GENDER SPLIT"
          tone="warning"
          isDark={isDark}
          icon={ShieldAlert}
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
                Disability Concentration Spatial Matrix
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
              activeDomain="disabilities"
              record={active}
            />
          </div>
        </div>

        {/* LAYER 3 (Right, 45%): Analytics Chart */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur flex-1">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              Impairment Breakdown (Washington Group)
            </h4>
            <div className="h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={DISABILITY_TYPE_DATA}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 60, bottom: 0 }}
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
                    dataKey="type"
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
                  <Bar dataKey="count" fill="#2DD4BF" radius={[0, 4, 4, 0]} />
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
              State-by-State Disability Profile & Assistive Device Targeting
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            NASSCO Disability Microdata Profile
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#134e4a]/60 bg-[#071c1a]/80 text-teal-300">
                <th className="py-2.5 px-3 font-semibold">Pilot State</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Total PLWD
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Children PLWD
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Boys / Girls
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Adults PLWD
                </th>
                <th className="py-2.5 px-3 font-semibold">
                  Primary Impairment
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#134e4a]/30 text-slate-200">
              {DISABILITY_TABLE.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#134e4a]/20 transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-white">
                    {row.state}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-300">
                    {row.totalPlwd.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-amber-300">
                    {row.childrenPlwd.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.boys} / {row.girls}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.adultPlwd.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3">{row.topType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Disabilities;
