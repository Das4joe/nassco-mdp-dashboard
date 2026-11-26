import type React from "react";
import { useState } from "react";
import {
  GraduationCap,
  Users,
  UserX,
  AlertCircle,
  Award,
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
  Legend,
} from "recharts";
import { KpiCard } from "../KpiCard";
import { DrilldownMap } from "../DrilldownMap";
import type { GeoRecord, GeoLevel, DrilldownState } from "../../types";

export interface EducationProps {
  record?: GeoRecord;
  activeRecord?: GeoRecord;
  drilldown?: DrilldownState;
  isDark?: boolean;
}

const OOSC_BY_AGE_GENDER = [
  { ageGroup: "6 - 11 yrs (Primary)", boys: 4100, girls: 4310, total: 8410 },
  { ageGroup: "12 - 14 yrs (JSS)", boys: 2680, girls: 2790, total: 5470 },
  { ageGroup: "15 - 17 yrs (SSS)", boys: 1630, girls: 1730, total: 3360 },
];

const NEVER_ENROLLED_VS_DROPOUT = [
  { category: "Primary (6-11)", neverEnrolled: 5820, dropouts: 2590 },
  { category: "JSS (12-14)", neverEnrolled: 3110, dropouts: 2360 },
  { category: "SSS (15-17)", neverEnrolled: 1830, dropouts: 1530 },
];

const CCT_EDUCATION_TABLE = [
  {
    state: "Abia",
    primaryOosc: 1820,
    jssOosc: 1210,
    sssOosc: 740,
    totalOosc: 3770,
    girlsShare: "51.4%",
    cctTargetHH: 2450,
  },
  {
    state: "Benue",
    primaryOosc: 2450,
    jssOosc: 1590,
    sssOosc: 980,
    totalOosc: 5020,
    girlsShare: "50.8%",
    cctTargetHH: 3260,
  },
  {
    state: "Oyo",
    primaryOosc: 2010,
    jssOosc: 1310,
    sssOosc: 810,
    totalOosc: 4130,
    girlsShare: "51.8%",
    cctTargetHH: 2680,
  },
  {
    state: "Sokoto",
    primaryOosc: 2130,
    jssOosc: 1360,
    sssOosc: 830,
    totalOosc: 4320,
    girlsShare: "51.0%",
    cctTargetHH: 2810,
  },
];

export const Education: React.FC<EducationProps> = ({
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
      {/* LAYER 1: Top KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        <KpiCard
          title="Total Children OOSC (6-17)"
          value="17,240"
          subtitle="35.2% of school-age children"
          tag="35.2% OOSC"
          tone="critical"
          isDark={isDark}
          icon={GraduationCap}
        />
        <KpiCard
          title="OOSC Boys vs Girls"
          value="8,410 / 8,830"
          subtitle="Boys: 48.8% | Girls: 51.2%"
          tag="GENDER SPLIT"
          tone="warning"
          isDark={isDark}
          icon={Users}
        />
        <KpiCard
          title="Never Enrolled"
          value="10,760"
          subtitle="62.4% of total OOSC"
          tag="ZERO SCHOOLING"
          tone="critical"
          isDark={isDark}
          icon={UserX}
        />
        <KpiCard
          title="School Dropouts"
          value="6,480"
          subtitle="37.6% left school early"
          tag="RETENTION DEFICIT"
          tone="warning"
          isDark={isDark}
          icon={AlertCircle}
        />
        <KpiCard
          title="Girls Out of School"
          value="8,830"
          subtitle="High transition risk in JSS/SSS"
          tag="PRIORITY FOCUS"
          tone="critical"
          isDark={isDark}
          icon={Award}
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
                Out-of-School Children (OOSC) Spatial Matrix
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
              activeDomain="education"
              record={active}
            />
          </div>
        </div>

        {/* LAYER 3 (Right, 45%): Analytics Charts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              OOSC by Educational Age Cohort & Gender
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={OOSC_BY_AGE_GENDER}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#134e4a"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="ageGroup"
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
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
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

          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur flex-1">
            <h4 className="text-xs font-semibold text-teal-300 mb-1">
              Never Enrolled vs Dropouts Breakdown
            </h4>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={NEVER_ENROLLED_VS_DROPOUT}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#134e4a"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="category"
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
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar
                    dataKey="neverEnrolled"
                    name="Never Enrolled"
                    fill="#EF4444"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="dropouts"
                    name="Dropouts"
                    fill="#F59E0B"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 4: Bottom CCT Targeting Table */}
      <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-4 shadow-md backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TableIcon className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              Education CCT Intervention & Re-enrollment Targeting Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            UNICEF / NASSCO MDP Education Baseline
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#134e4a]/60 bg-[#071c1a]/80 text-teal-300">
                <th className="py-2.5 px-3 font-semibold">Pilot State</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Primary OOSC (6-11)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  JSS OOSC (12-14)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  SSS OOSC (15-17)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Total OOSC
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Girls' Share %
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Targeted CCT Households
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#134e4a]/30 text-slate-200">
              {CCT_EDUCATION_TABLE.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#134e4a]/20 transition-colors"
                >
                  <td className="py-2.5 px-3 font-medium text-white">
                    {row.state}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.primaryOosc.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.jssOosc.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {row.sssOosc.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-rose-300 font-bold">
                    {row.totalOosc.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-pink-400 font-semibold">
                    {row.girlsShare}
                  </td>
                  <td className="py-2.5 px-3 text-right text-teal-300 font-mono font-semibold">
                    {row.cctTargetHH.toLocaleString()}
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

export default Education;
