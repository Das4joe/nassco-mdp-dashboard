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
} from "recharts";
import { Users, User, Baby, Activity, Heart, ShieldCheck } from "lucide-react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
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
  const theme = useChartTheme();

  // Cast record to any for safe, flexible property lookup across schemas
  const rec = (record || {}) as any;
  const nsr = rec.nsr || {};

  // Safe Metric Extractions with Nullish Fallbacks
  const totalHouseholds = nsr.total_households ?? rec.total_households ?? 0;
  const totalIndividuals = nsr.total_individuals ?? rec.total_individuals ?? 0;
  const children017 =
    rec.children_0_17 ??
    rec.extended?.age_bands_v2?.["0-17"]?.total ??
    nsr.children_under18 ??
    0;
  const children05 =
    rec.children_0_5 ?? rec.extended?.age_bands_v2?.["0-3"]?.total ?? 0;
  const youth1824 =
    rec.youth_18_24 ?? rec.extended?.age_bands_v2?.["18-24"]?.total ?? 0;
  const plwdTotal =
    rec.plwd ??
    nsr.pwd ??
    rec.extended?.health_v2?.plwd_total ??
    rec.extended?.disability?.rate?.n ??
    0;
  const childrenPlwd =
    rec.children_with_disabilities ??
    rec.extended?.health_v2?.children_plwd ??
    0;
  const pregnantTotal =
    rec.pregnant_women ??
    rec.extended?.health_v2?.pregnant_total ??
    rec.extended?.plw?.pregnant?.n ??
    0;
  const lactatingTotal =
    rec.lactating_mothers ??
    rec.extended?.health_v2?.lactating_total ??
    rec.extended?.plw?.lactating?.n ??
    0;

  // Process Diverging Population Pyramid Data (Males = negative, Females = positive)
  const targetBands = ["0-4", "5-9", "10-14", "15-19", "20-24"];
  const rawPyramid = rec.pyramid_0_24 ?? rec.extended?.age_sex_pyramid ?? [];

  const pyramidData = targetBands.map((band) => {
    const found = rawPyramid.find(
      (b: any) =>
        (b.ageGroup || b.band) === band ||
        (b.ageGroup || b.band) === band.replace("-", "–"),
    );
    const maleVal = found?.boys ?? found?.male ?? 0;
    const femaleVal = found?.girls ?? found?.female ?? 0;

    return {
      band,
      male: -Math.abs(maleVal),
      female: Math.abs(femaleVal),
      total: Math.abs(maleVal) + Math.abs(femaleVal),
    };
  });

  // Process Gender Ratio Data
  const boys017 =
    rec.gender_ratio?.boys ??
    rec.extended?.age_bands_v2?.["0-17"]?.male ??
    nsr.total_male ??
    0;
  const girls017 =
    rec.gender_ratio?.girls ??
    rec.extended?.age_bands_v2?.["0-17"]?.female ??
    nsr.total_female ??
    0;

  const genderRatio = [
    { name: "Boys", value: boys017, color: "#0284C7" },
    { name: "Girls", value: girls017, color: "#E67E22" },
  ];

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
            metric="vulnerability"
          />
        </div>

        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Population pyramid [0-24] (boys & girls)"
            height={305}
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pyramidData}
                layout="vertical"
                margin={{ left: 10, right: 10, top: 10, bottom: 5 }}
                stackOffset="sign"
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="band"
                  type="category"
                  width={50}
                  tick={{ fontSize: 11, fill: theme?.axisTick || "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value: any) =>
                    Math.abs(Number(value)).toLocaleString()
                  }
                  contentStyle={theme?.tooltip}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: "11px" }}
                />
                <Bar
                  dataKey="male"
                  name="Boys"
                  fill="#0284C7"
                  stackId="a"
                  radius={[4, 0, 0, 4]}
                />
                <Bar
                  dataKey="female"
                  name="Girls"
                  fill="#E67E22"
                  stackId="a"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Gender ratio (boys and girls)" height={305}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderRatio}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {genderRatio.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => Number(v).toLocaleString()}
                  contentStyle={theme?.tooltip}
                />
                <Legend
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Age ratio (0-24yrs)" height={305}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={pyramidData}
                margin={{ top: 20, right: 10, left: -10, bottom: 0 }}
              >
                <XAxis
                  dataKey="band"
                  tick={{ fontSize: 11, fill: theme?.axisTick || "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme?.axisTick || "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={theme?.tooltip}
                />
                <Bar
                  dataKey="total"
                  name="Total Population"
                  fill="#075E54"
                  radius={[4, 4, 0, 0]}
                  label={{
                    position: "top",
                    fill: theme?.axisTick || "#64748b",
                    fontSize: 10,
                    formatter: (v: any) => Number(v).toLocaleString(),
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard
            title="Disabilities distribution amongst children"
            height={305}
          >
            <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50 dark:bg-surface-darker/50">
              Detailed cross-tabulation for child disabilities by age ranges
              (0-24) is not captured in the current JSON expansion schema.
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default GlobalOverview;
