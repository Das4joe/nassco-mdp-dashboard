import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
} from "recharts";
import { Users, User, Baby, Activity, Heart, ShieldCheck } from "lucide-react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";

interface GlobalOverviewProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const GlobalOverview: React.FC<GlobalOverviewProps> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const rec = (record || {}) as any;
  const nsr = rec.nsr || {};
  const ext = rec.extended || {};

  // ─── KPI METRICS (safe fallbacks) ───────────────────────────────────────
  const totalHouseholds = nsr.total_households ?? rec.total_households ?? 0;
  const totalIndividuals = nsr.total_individuals ?? rec.total_individuals ?? 0;
  const children017 =
    ext.age_bands_v2?.["0-17"]?.total ??
    rec.children_0_17 ??
    nsr.children_under18 ??
    0;
  const children05 =
    ext.age_bands_v2?.["0-5"]?.total ??
    ext.age_bands_v2?.["0-3"]?.total ??
    rec.children_0_5 ??
    0;
  const youth1824 = ext.age_bands_v2?.["18-24"]?.total ?? rec.youth_18_24 ?? 0;
  const plwdTotal = ext.health_v2?.plwd_total ?? rec.plwd ?? nsr.pwd ?? 0;
  const childrenPlwd =
    ext.health_v2?.children_plwd ?? rec.children_with_disabilities ?? 0;
  const pregnantTotal =
    ext.health_v2?.pregnant_total ?? rec.pregnant_women ?? 0;
  const lactatingTotal =
    ext.health_v2?.lactating_total ?? rec.lactating_mothers ?? 0;

  // ─── POPULATION PYRAMID DATA (diverging: male negative, female positive) ─
  const targetBands = ["0-4", "5-9", "10-14", "15-19", "20-24"];
  const rawPyramid: any[] = rec.pyramid_0_24 ?? ext.age_sex_pyramid ?? [];

  const pyramidData = targetBands.map((band) => {
    const found = rawPyramid.find(
      (b: any) =>
        b.ageGroup === band ||
        b.band === band ||
        b.ageGroup === band.replace("-", "–") ||
        b.band === band.replace("-", "–"),
    );
    const maleVal = Number(found?.boys ?? found?.male ?? 0);
    const femaleVal = Number(found?.girls ?? found?.female ?? 0);
    return {
      band,
      male: -Math.abs(maleVal), // LEFT side of pyramid
      female: Math.abs(femaleVal), // RIGHT side of pyramid
      total: Math.abs(maleVal) + Math.abs(femaleVal),
    };
  });

  // ─── GENDER RATIO (Pie chart) ───────────────────────────────────────────
  const boys017 =
    rec.gender_ratio?.boys ??
    ext.age_bands_v2?.["0-17"]?.male ??
    nsr.total_male ??
    0;
  const girls017 =
    rec.gender_ratio?.girls ??
    ext.age_bands_v2?.["0-17"]?.female ??
    nsr.total_female ??
    0;

  const genderRatioData = [
    { name: "Boys", value: boys017, color: "#0284C7" },
    { name: "Girls", value: girls017, color: "#E67E22" },
  ];

  const formatAbs = (v: any) => Math.abs(Number(v)).toLocaleString();

  return (
    <div className="space-y-6">
      {/* ── KPI ROW ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Indicator
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Total Households Registered"
            value={totalHouseholds.toLocaleString()}
            icon={<Users size={16} />}
            accent="#075E54"
          />
          <KpiCard
            label="Total Individuals"
            value={totalIndividuals.toLocaleString()}
            icon={<User size={16} />}
            accent="#128C7E"
          />
          <KpiCard
            label="Children (0-17)"
            value={children017.toLocaleString()}
            icon={<Baby size={16} />}
            accent="#E67E22"
          />
          <KpiCard
            label="Children (0-5)"
            value={children05.toLocaleString()}
            icon={<Baby size={16} />}
            accent="#D97706"
          />
          <KpiCard
            label="Youth (18-24)"
            value={youth1824.toLocaleString()}
            icon={<User size={16} />}
            accent="#059669"
          />
          <KpiCard
            label="PLWD"
            value={plwdTotal.toLocaleString()}
            icon={<Activity size={16} />}
            accent="#DC2626"
          />
          <KpiCard
            label="Children with disabilities"
            value={childrenPlwd.toLocaleString()}
            icon={<Activity size={16} />}
            accent="#B91C1C"
          />
          <KpiCard
            label="Pregnant women"
            value={pregnantTotal.toLocaleString()}
            icon={<Heart size={16} />}
            accent="#9333EA"
          />
          <KpiCard
            label="Lactating mothers"
            value={lactatingTotal.toLocaleString()}
            icon={<ShieldCheck size={16} />}
            accent="#0284C7"
          />
        </div>
      </div>

      {/* ── MAP + CHARTS ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        {/* Map */}
        <div
          className="xl:col-span-1 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
          style={{ height: 640 }}
        >
          <DrilldownMap
            data={data}
            path={path}
            onPathChange={onPathChange}
            selectedStateFilter={stateFilter}
            metric="vulnerability"
          />
        </div>

        {/* 4 Chart Cards */}
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. POPULATION PYRAMID — diverging horizontal bars */}
          <ChartCard
            title="Population pyramid [0-24] (boys & girls)"
            height={305}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pyramidData}
                layout="vertical"
                stackOffset="sign"
                margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#334155"
                  opacity={0.3}
                />
                <XAxis
                  type="number"
                  tickFormatter={formatAbs}
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                />
                <YAxis
                  dataKey="band"
                  type="category"
                  width={48}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(value: any, name: any) => [
                    formatAbs(value),
                    name === "male" ? "Boys" : "Girls",
                  ]}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: 11, paddingBottom: 4 }}
                  formatter={(value) => (value === "male" ? "Boys" : "Girls")}
                />
                {/* Boys = LEFT (negative values) */}
                <Bar
                  dataKey="male"
                  name="male"
                  fill="#0284C7"
                  stackId="pyramid"
                  radius={[4, 0, 0, 4]}
                />
                {/* Girls = RIGHT (positive values) */}
                <Bar
                  dataKey="female"
                  name="female"
                  fill="#E67E22"
                  stackId="pyramid"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 2. GENDER RATIO — Pie / Donut chart */}
          <ChartCard title="Gender ratio (boys and girls)" height={305}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderRatioData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {genderRatioData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => Number(v).toLocaleString()}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 12 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 3. AGE RATIO — Vertical bar chart (age distribution) */}
          <ChartCard title="Age ratio (0-24yrs)" height={305}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pyramidData}
                margin={{ top: 24, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#334155"
                  opacity={0.3}
                />
                <XAxis
                  dataKey="band"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
                  tickFormatter={(v) => Number(v).toLocaleString()}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(v: any) => Number(v).toLocaleString()}
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="total"
                  name="Total Population"
                  fill="#075E54"
                  radius={[4, 4, 0, 0]}
                  label={{
                    position: "top",
                    fill: "#94a3b8",
                    fontSize: 10,
                    formatter: (v: any) => Number(v).toLocaleString(),
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* 4. DISABILITIES — Honest disclaimer (data not in survey) */}
          <ChartCard
            title="Disabilities distribution amongst children"
            height={305}
          >
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted dark:text-ink-onDarkMuted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/40 dark:bg-surface-darker/40">
              Detailed cross-tabulation for child disabilities by age ranges
              (0-24) is not captured in the current survey wave.
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;
