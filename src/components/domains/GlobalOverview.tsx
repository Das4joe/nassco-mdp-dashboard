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

  const totalHouseholds = Number(
    nsr.total_households ?? rec.total_households ?? 0,
  );
  const totalIndividuals = Number(
    nsr.total_individuals ?? rec.total_individuals ?? 0,
  );
  const children017 = Number(
    ext.age_bands_v2?.["0-17"]?.total ??
      rec.children_0_17 ??
      nsr.children_under18 ??
      nsr.children_0_17 ??
      0,
  );
  const children05 = Number(
    ext.age_bands_v2?.["0-5"]?.total ??
      ext.age_bands_v2?.["0-3"]?.total ??
      rec.children_0_5 ??
      nsr.children_under5 ??
      0,
  );
  const youth1824 = Number(
    ext.age_bands_v2?.["18-24"]?.total ??
      rec.youth_18_24 ??
      nsr.youth_18_24 ??
      0,
  );
  const plwdTotal = Number(
    ext.health_v2?.plwd_total ?? rec.plwd ?? nsr.pwd ?? nsr.plwd ?? 0,
  );
  const childrenPlwd = Number(
    ext.health_v2?.children_plwd ??
      rec.children_with_disabilities ??
      nsr.children_plwd ??
      0,
  );
  const pregnantTotal = Number(
    ext.health_v2?.pregnant_total ??
      rec.pregnant_women ??
      nsr.pregnant_women ??
      0,
  );
  const lactatingTotal = Number(
    ext.health_v2?.lactating_total ??
      rec.lactating_mothers ??
      nsr.lactating_mothers ??
      0,
  );

  const targetBands = ["0-4", "5-9", "10-14", "15-19", "20-24"];
  const rawPyramid: any[] = rec.pyramid_0_24 ?? ext.age_sex_pyramid ?? [];

  const pyramidData = targetBands.map((band) => {
    const found = rawPyramid.find(
      (b: any) =>
        b?.ageGroup === band ||
        b?.band === band ||
        b?.ageGroup === band.replace("-", "–") ||
        b?.band === band.replace("-", "–"),
    );
    const maleVal = Number(found?.boys ?? found?.male ?? 0);
    const femaleVal = Number(found?.girls ?? found?.female ?? 0);
    return {
      band,
      male: -Math.abs(maleVal),
      female: Math.abs(femaleVal),
      total: Math.abs(maleVal) + Math.abs(femaleVal),
    };
  });

  const boys017 = Number(
    rec.gender_ratio?.boys ??
      ext.age_bands_v2?.["0-17"]?.male ??
      nsr.total_male ??
      0,
  );
  const girls017 = Number(
    rec.gender_ratio?.girls ??
      ext.age_bands_v2?.["0-17"]?.female ??
      nsr.total_female ??
      0,
  );

  const genderRatioData = [
    { name: "Boys", value: boys017, color: "#38BDF8" },
    { name: "Girls", value: girls017, color: "#FB923C" },
  ];

  const formatAbs = (v: any) => Math.abs(Number(v || 0)).toLocaleString();

  const disabilityTypesRaw =
    ext.disability_types_children ?? rec.disability_types_children ?? null;

  const DISABILITY_LABELS: Record<string, string> = {
    blind: "Blind",
    deaf: "Deaf",
    physicaldisability: "Physical",
    mentalill: "Mental Illness",
    epilepsy: "Epilepsy",
    dumb: "Speech Impairment",
    autism: "Autism",
    otherdisability: "Other",
  };

  const disabilityData = disabilityTypesRaw
    ? Object.entries(disabilityTypesRaw)
        .map(([key, count]) => ({
          type: DISABILITY_LABELS[key] || key,
          count: Number(count ?? 0),
        }))
        .filter((d) => d.count > 0)
        .sort((a, b) => b.count - a.count)
    : null;

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div
          className="xl:col-span-1 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
          style={{ height: 640 }}
        >
          <DrilldownMap
            data={data}
            path={path}
            onPathChange={onPathChange}
            selectedStateFilter={stateFilter}
            domain="overview"
            height={640}
          />
        </div>

        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Population pyramid [0-24] (boys & girls)"
            height={320}
          >
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={pyramidData}
                  layout="vertical"
                  stackOffset="sign"
                  margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#475569"
                    opacity={0.4}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={formatAbs}
                    tick={{ fontSize: 11, fill: "#CBD5E1" }}
                  />
                  <YAxis
                    dataKey="band"
                    type="category"
                    width={50}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#CBD5E1" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.06)" }}
                    formatter={(value: any, name: any) => [
                      formatAbs(value),
                      name === "male" ? "Boys" : "Girls",
                    ]}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#F8FAFC",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11 }}
                    formatter={(v) => (v === "male" ? "Boys" : "Girls")}
                  />
                  <Bar
                    dataKey="male"
                    name="male"
                    fill="#38BDF8"
                    stackId="pyramid"
                    radius={[4, 0, 0, 4]}
                  />
                  <Bar
                    dataKey="female"
                    name="female"
                    fill="#FB923C"
                    stackId="pyramid"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Gender ratio (boys and girls)" height={320}>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={genderRatioData}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={4}
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
                      backgroundColor: "#0F172A",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#F8FAFC",
                      fontSize: 12,
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    wrapperStyle={{ fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Age ratio (0-24yrs)" height={320}>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={pyramidData}
                  margin={{ top: 25, right: 10, left: -10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#475569"
                    opacity={0.4}
                  />
                  <XAxis
                    dataKey="band"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#CBD5E1" }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#CBD5E1" }}
                    tickFormatter={(v) => Number(v).toLocaleString()}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.06)" }}
                    formatter={(v: any) => Number(v).toLocaleString()}
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid #334155",
                      borderRadius: 8,
                      color: "#F8FAFC",
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="total"
                    name="Total Population"
                    fill="#10B981"
                    radius={[4, 4, 0, 0]}
                    label={{
                      position: "top",
                      fill: "#CBD5E1",
                      fontSize: 10,
                      formatter: (v: any) => Number(v).toLocaleString(),
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Disabilities distribution amongst children"
            height={320}
          >
            {disabilityData && disabilityData.length > 0 ? (
              <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart
                    data={disabilityData}
                    layout="vertical"
                    margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      horizontal={false}
                      stroke="#475569"
                      opacity={0.3}
                    />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: "#CBD5E1" }}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                    />
                    <YAxis
                      dataKey="type"
                      type="category"
                      width={110}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 10, fill: "#CBD5E1" }}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(255,255,255,0.06)" }}
                      formatter={(v: any) => Number(v).toLocaleString()}
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        border: "1px solid #334155",
                        borderRadius: 8,
                        color: "#F8FAFC",
                        fontSize: 12,
                      }}
                    />
                    <Bar
                      dataKey="count"
                      name="Children"
                      fill="#14B8A6"
                      radius={[0, 4, 4, 0]}
                      label={{
                        position: "right",
                        fill: "#CBD5E1",
                        fontSize: 10,
                        formatter: (v: any) =>
                          v > 0 ? Number(v).toLocaleString() : "",
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center p-6 text-center text-xs text-ink-muted dark:text-ink-onDarkMuted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/40 dark:bg-surface-darker/40">
                Disability type breakdown will appear after running the updated
                data aggregator. Total children with disabilities:{" "}
                {childrenPlwd.toLocaleString()}
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;
