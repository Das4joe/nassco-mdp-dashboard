import type React from "react";
import { useState } from "react";
import {
  HeartPulse,
  Baby,
  Activity,
  ShieldCheck,
  Utensils,
  Layers,
  Table as TableIcon,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { KpiCard } from "../KpiCard";
import { DrilldownMap } from "../DrilldownMap";
import type { GeoRecord, GeoLevel, DrilldownState } from "../../types";

export interface HealthNutritionProps {
  record?: GeoRecord;
  activeRecord?: GeoRecord;
  drilldown?: DrilldownState;
  isDark?: boolean;
}

const MUAC_STATUS_DATA = [
  { name: "Normal (Green)", value: 32800, percent: 84.9, color: "#10B981" },
  { name: "MAM (Yellow)", value: 4620, percent: 12.0, color: "#F59E0B" },
  { name: "SAM (Red)", value: 1190, percent: 3.1, color: "#EF4444" },
];

const HEALTH_ACCESS_DATA = [
  {
    state: "Abia",
    pregnant: 580,
    lactating: 1680,
    samCases: 240,
    insurancePct: 5.8,
  },
  {
    state: "Benue",
    pregnant: 710,
    lactating: 2040,
    samCases: 380,
    insurancePct: 3.9,
  },
  {
    state: "Oyo",
    pregnant: 610,
    lactating: 1740,
    samCases: 220,
    insurancePct: 4.8,
  },
  {
    state: "Sokoto",
    pregnant: 583,
    lactating: 1720,
    samCases: 350,
    insurancePct: 2.3,
  },
];

export const HealthNutrition: React.FC<HealthNutritionProps> = ({
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
          title="Pregnant Women"
          value="2,483"
          subtitle="Antenatal care targeting"
          tag="ANC PRIORITY"
          tone="neutral"
          isDark={isDark}
          icon={HeartPulse}
        />
        <KpiCard
          title="Lactating Mothers"
          value="7,180"
          subtitle="Infant feeding & nutrition"
          tag="IYCF COHORT"
          tone="positive"
          isDark={isDark}
          icon={Baby}
        />
        <KpiCard
          title="MUAC Malnutrition (MAM/SAM)"
          value="5,810"
          subtitle="15.1% under-5 wasting burden"
          tag="15.1% WASTING"
          tone="critical"
          isDark={isDark}
          icon={Activity}
        />
        <KpiCard
          title="Health Insurance Access"
          value="4.2%"
          subtitle="NHIA / State insurance cover"
          tag="SEVERE GAP"
          tone="critical"
          isDark={isDark}
          icon={ShieldCheck}
        />
        <KpiCard
          title="Nutrition Services Access"
          value="26.8%"
          subtitle="CMAM & micro-nutrient access"
          tag="SUPPLEMENTATION"
          tone="warning"
          isDark={isDark}
          icon={Utensils}
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
                Maternal & Child Health Spatial Matrix
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
              activeDomain="health-nutrition"
              record={active}
            />
          </div>
        </div>

        {/* LAYER 3 (Right, 45%): Analytics Charts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              MUAC Screening Distribution (Under-5)
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={MUAC_STATUS_DATA}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={38}
                    outerRadius={62}
                    paddingAngle={3}
                  >
                    {MUAC_STATUS_DATA.map((entry, idx) => (
                      <Cell key={`muac-${idx}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#071c1a",
                      borderColor: "#134e4a",
                      borderRadius: "8px",
                      fontSize: "11px",
                      color: "#fff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] text-center mt-1">
              {MUAC_STATUS_DATA.map((d, i) => (
                <div
                  key={i}
                  className="rounded p-1 bg-[#071c1a] border border-[#134e4a]/30"
                >
                  <div className="font-semibold text-white">
                    {d.name.split(" ")[0]}
                  </div>
                  <div className="text-slate-400">
                    {d.percent}% ({d.value.toLocaleString()})
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur flex-1">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              Severe Acute Malnutrition (SAM) Cases by State
            </h4>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={HEALTH_ACCESS_DATA}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#134e4a"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="state"
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
                    dataKey="samCases"
                    name="SAM Cases"
                    fill="#EF4444"
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
              State Maternal, Nutrition & Health Access Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            NASSCO Multi-Dimensional Poverty Health Survey
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#134e4a]/60 bg-[#071c1a]/80 text-teal-300">
                <th className="py-2.5 px-3 font-semibold">Pilot State</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Pregnant Women
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Lactating Mothers
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  SAM Wasting Cases
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Health Insurance Access
                </th>
                <th className="py-2.5 px-3 font-semibold">
                  Intervention Focus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#134e4a]/30 text-slate-200">
              {HEALTH_ACCESS_DATA.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#134e4a]/20 transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-white">
                    {row.state}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-teal-300">
                    {row.pregnant.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.lactating.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-400 font-bold">
                    {row.samCases.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.insurancePct}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="inline-block rounded px-2 py-0.5 text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                      RUTF & ANC Linkage
                    </span>
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

export default HealthNutrition;
