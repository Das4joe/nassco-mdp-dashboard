import type React from "react";
import { useState } from "react";
import {
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Award,
  Layers,
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
  Legend,
} from "recharts";
import { KpiCard } from "../KpiCard";
import { DrilldownMap } from "../DrilldownMap";
import type { GeoRecord, GeoLevel } from "../../types";

interface CivilRegistrationProps {
  record?: GeoRecord;
  isDark?: boolean;
}

// Age cohorts without birth certificate data
const NO_BIRTH_CERT_DATA = [
  { name: "0-4 yrs", value: 7014, percent: 62.0, color: "#2DD4BF" },
  { name: "5-9 yrs", value: 11185, percent: 58.0, color: "#0EA5E9" },
  { name: "10-14 yrs", value: 9493, percent: 56.0, color: "#F59E0B" },
  { name: "15-17 yrs", value: 5421, percent: 55.0, color: "#EF4444" },
];

// Age cohorts without National Identification Number (NIN) data
const NO_NIN_DATA = [
  { name: "0-4 yrs", value: 9616, percent: 85.0, color: "#2DD4BF" },
  { name: "5-9 yrs", value: 14463, percent: 75.0, color: "#0EA5E9" },
  { name: "10-14 yrs", value: 11019, percent: 65.0, color: "#F59E0B" },
  { name: "15-17 yrs", value: 5399, percent: 54.8, color: "#EF4444" },
];

// Age cohort overlap comparison bar chart
const COHORT_COMPARISON_DATA = [
  {
    cohort: "0-4 yrs",
    noBirthCert: 7014,
    noNin: 9616,
    noBoth: 6280,
    bothPresent: 954,
  },
  {
    cohort: "5-9 yrs",
    noBirthCert: 11185,
    noNin: 14463,
    noBoth: 9840,
    bothPresent: 3496,
  },
  {
    cohort: "10-14 yrs",
    noBirthCert: 9493,
    noNin: 11019,
    noBoth: 7620,
    bothPresent: 4050,
  },
  {
    cohort: "15-17 yrs",
    noBirthCert: 5421,
    noNin: 5399,
    noBoth: 4642,
    bothPresent: 2980,
  },
];

// Detailed bottom breakdown table
const DETAILED_COHORT_TABLE = [
  {
    ageGroup: "0 - 4 yrs",
    totalInd: 11313,
    noBirthCertCount: 7014,
    noBirthCertPct: "62.0%",
    noNinCount: 9616,
    noNinPct: "85.0%",
    noBothCount: 6280,
    noBothPct: "55.5%",
    bothCount: 954,
    bothPct: "8.4%",
    priority: "Critical (Early Stage)",
  },
  {
    ageGroup: "5 - 9 yrs",
    totalInd: 19284,
    noBirthCertCount: 11185,
    noBirthCertPct: "58.0%",
    noNinCount: 14463,
    noNinPct: "75.0%",
    noBothCount: 9840,
    noBothPct: "51.0%",
    bothCount: 3496,
    bothPct: "18.1%",
    priority: "High (Primary Age)",
  },
  {
    ageGroup: "10 - 14 yrs",
    totalInd: 16952,
    noBirthCertCount: 9493,
    noBirthCertPct: "56.0%",
    noNinCount: 11019,
    noNinPct: "65.0%",
    noBothCount: 7620,
    noBothPct: "45.0%",
    bothCount: 4050,
    bothPct: "23.9%",
    priority: "High (Transition)",
  },
  {
    ageGroup: "15 - 17 yrs",
    totalInd: 10139,
    noBirthCertCount: 5421,
    noBirthCertPct: "55.0%",
    noNinCount: 5399,
    noNinPct: "54.8%",
    noBothCount: 4642,
    noBothPct: "45.8%",
    bothCount: 2980,
    bothPct: "29.4%",
    priority: "Medium (Youth Entry)",
  },
  {
    ageGroup: "18 - 24 yrs",
    totalInd: 19012,
    noBirthCertCount: 8936,
    noBirthCertPct: "47.0%",
    noNinCount: 8555,
    noNinPct: "45.0%",
    noBothCount: 6464,
    noBothPct: "34.0%",
    bothCount: 7985,
    bothPct: "42.0%",
    priority: "Adult Transition",
  },
  {
    ageGroup: "25+ yrs",
    totalInd: 61976,
    noBirthCertCount: 26030,
    noBirthCertPct: "42.0%",
    noNinCount: 22311,
    noNinPct: "36.0%",
    noBothCount: 15494,
    noBothPct: "25.0%",
    bothCount: 18948,
    bothPct: "30.6%",
    priority: "Standard",
  },
];

export const CivilRegistration: React.FC<CivilRegistrationProps> = ({
  record,
  isDark = true,
}) => {
  const [geoLevel, setGeoLevel] = useState<GeoLevel>("national");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const [selectedWard, setSelectedWard] = useState<string | null>(null);

  // Scaler multiplier for drilldown
  const multiplier =
    geoLevel === "ward"
      ? 0.01
      : geoLevel === "lga"
        ? 0.035
        : geoLevel === "state"
          ? 0.25
          : 1;

  const noBirthCertTotal = Math.round(33113 * multiplier);
  const noNinTotal = Math.round(40497 * multiplier);
  const noBothTotal = Math.round(28382 * multiplier);
  const bothPresentTotal = Math.round(38413 * multiplier);

  return (
    <div className="space-y-4">
      {/* LAYER 1: Top KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <KpiCard
          title="Children w/o Birth Cert (0-17)"
          value={noBirthCertTotal.toLocaleString()}
          subtitle="57.4% of total child population"
          tag="57.4% GAP"
          isDark={isDark}
          icon={FileText}
          accentColor="amber"
        />
        <KpiCard
          title="Children w/o NIN (0-17)"
          value={noNinTotal.toLocaleString()}
          subtitle="70.2% unregistered with NIMC"
          tag="70.2% GAP"
          isDark={isDark}
          icon={CreditCard}
          accentColor="rose"
        />
        <KpiCard
          title="Children w/o Both ID Docs"
          value={noBothTotal.toLocaleString()}
          subtitle="49.2% zero institutional visibility"
          tag="49.2% CRITICAL"
          isDark={isDark}
          icon={AlertTriangle}
          accentColor="rose"
        />
        <KpiCard
          title="Individuals with Both IDs"
          value={bothPresentTotal.toLocaleString()}
          subtitle="27.7% fully documented in NSR"
          tag="27.7% VERIFIED"
          isDark={isDark}
          icon={CheckCircle2}
          accentColor="teal"
        />
      </div>

      {/* 2-COLUMN LAYER (55% Map + 45% Domain Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LAYER 2 (Left, 55% width / 7 cols): Leaflet Vector GIS Map */}
        <div className="lg:col-span-7 flex flex-col rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 text-teal-300">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Civil Registration Spatial Matrix
                </h3>
                <p className="text-[11px] text-slate-400">
                  Targeted States &gt; LGAs &gt; Wards Registration Gaps
                </p>
              </div>
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
              onSelectState={(st) => {
                setSelectedState(st);
                setGeoLevel("state");
              }}
              onSelectLga={(lg) => {
                setSelectedLga(lg);
                setGeoLevel("lga");
              }}
              onSelectWard={(wd) => {
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
              activeDomain="civil-registration"
              record={record}
            />
          </div>
        </div>

        {/* LAYER 3 (Right, 45% width / 5 cols): Civil Registration Analytical Charts */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Dual Donut/Pie Charts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Lack of Birth Certificate Pie */}
            <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
              <h4 className="text-xs font-semibold text-teal-300 truncate mb-1">
                No Birth Cert by Age (0-17)
              </h4>
              <p className="text-[10px] text-slate-400 mb-2">
                Total: 33,113 Children
              </p>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={NO_BIRTH_CERT_DATA}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {NO_BIRTH_CERT_DATA.map((entry, idx) => (
                        <Cell key={`cell-bc-${idx}`} fill={entry.color} />
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
                      formatter={(val: number, name: string) => [
                        `${val.toLocaleString()} children`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 mt-1">
                {NO_BIRTH_CERT_DATA.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="truncate">
                      {d.name}:{" "}
                      <strong className="text-white">{d.percent}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Lack of NIN Pie */}
            <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur">
              <h4 className="text-xs font-semibold text-teal-300 truncate mb-1">
                No NIN by Age Cohort (0-17)
              </h4>
              <p className="text-[10px] text-slate-400 mb-2">
                Total: 40,497 Children
              </p>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={NO_NIN_DATA}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={58}
                      paddingAngle={3}
                    >
                      {NO_NIN_DATA.map((entry, idx) => (
                        <Cell key={`cell-nin-${idx}`} fill={entry.color} />
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
                      formatter={(val: number, name: string) => [
                        `${val.toLocaleString()} children`,
                        name,
                      ]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-300 mt-1">
                {NO_NIN_DATA.map((d, i) => (
                  <div key={i} className="flex items-center gap-1.5 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: d.color }}
                    />
                    <span className="truncate">
                      {d.name}:{" "}
                      <strong className="text-white">{d.percent}%</strong>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Grouped Bar Chart: Documentation Gaps Overlap */}
          <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-3 shadow-md backdrop-blur flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-400" />
                <h4 className="text-xs font-semibold text-white">
                  Registration Gap Overlap by Child Cohort
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">
                UNICEF/NPopC/NIMC
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={COHORT_COMPARISON_DATA}
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
                  <Legend
                    wrapperStyle={{ fontSize: "11px", paddingTop: "6px" }}
                  />
                  <Bar
                    dataKey="noBirthCert"
                    name="No Birth Cert"
                    fill="#F59E0B"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="noNin"
                    name="No NIN"
                    fill="#EF4444"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="noBoth"
                    name="No ID At All"
                    fill="#881337"
                    radius={[3, 3, 0, 0]}
                  />
                  <Bar
                    dataKey="bothPresent"
                    name="Both Verified"
                    fill="#2DD4BF"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* LAYER 4: Bottom Detailed Demographic Overlap Matrix Table */}
      <div className="rounded-xl border border-[#134e4a]/40 bg-[#0b2422]/90 p-4 shadow-md backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-teal-400" />
            <h3 className="text-sm font-semibold text-white">
              Age Cohort Civil Registration & Identity Overlap Matrix
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Microdata Source: NASSCO MDP Survey & Baseline Registry
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#134e4a]/60 bg-[#071c1a]/80 text-teal-300">
                <th className="py-2.5 px-3 font-semibold">Age Cohort</th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Population
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  No Birth Cert (N)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  No Birth Cert (%)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  No NIN (N)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  No NIN (%)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Missing Both (N)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Missing Both (%)
                </th>
                <th className="py-2.5 px-3 font-semibold text-right">
                  Both Verified
                </th>
                <th className="py-2.5 px-3 font-semibold">
                  Intervention Priority
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#134e4a]/30 text-slate-200">
              {DETAILED_COHORT_TABLE.map((row, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-[#134e4a]/20 transition-colors duration-150"
                >
                  <td className="py-2.5 px-3 font-medium text-white">
                    {row.ageGroup}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {Math.round(row.totalInd * multiplier).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-300 font-mono">
                    {Math.round(
                      row.noBirthCertCount * multiplier,
                    ).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-amber-400 font-semibold">
                    {row.noBirthCertPct}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-300 font-mono">
                    {Math.round(row.noNinCount * multiplier).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-400 font-semibold">
                    {row.noNinPct}
                  </td>
                  <td className="py-2.5 px-3 text-right text-red-300 font-mono font-bold">
                    {Math.round(row.noBothCount * multiplier).toLocaleString()}
                  </td>
                  <td className="py-2.5 px-3 text-right text-red-400 font-bold">
                    {row.noBothPct}
                  </td>
                  <td className="py-2.5 px-3 text-right text-teal-300 font-mono">
                    {Math.round(row.bothCount * multiplier).toLocaleString()} (
                    {row.bothPct})
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold ${
                        row.priority.includes("Critical")
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : row.priority.includes("High")
                            ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                            : "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      }`}
                    >
                      {row.priority}
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

export default CivilRegistration;
