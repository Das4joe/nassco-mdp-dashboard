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

  const ageBands = record.extended?.age_bands_v2;
  const children017 =
    ageBands?.["0-17"]?.total ?? record.nsr?.children_under18 ?? 0;
  const children03 = ageBands?.["0-3"]?.total ?? 0;
  const youth1824 = ageBands?.["18-24"]?.total ?? 0;
  const plwdTotal =
    record.extended?.health_v2?.plwd_total ??
    record.extended?.disability?.rate?.n ??
    0;
  const childrenPlwd = record.extended?.health_v2?.children_plwd ?? 0;
  const pregnantTotal =
    record.extended?.health_v2?.pregnant_total ??
    record.extended?.plw?.pregnant?.n ??
    0;
  const lactatingTotal =
    record.extended?.health_v2?.lactating_total ??
    record.extended?.plw?.lactating?.n ??
    0;

  const pyramidRaw = record.extended?.age_sex_pyramid ?? [];
  const targetBands = [
    "0-4",
    "5-9",
    "10-14",
    "15-19",
    "20-24",
    "0–4",
    "5–9",
    "10–14",
    "15–19",
    "20–24",
  ];

  const pyramidData = pyramidRaw
    .filter((b) => targetBands.includes(b.band))
    .map((b) => ({
      band: b.band,
      male: -(b.male || 0),
      female: b.female || 0,
      total: b.total || 0,
    }));

  const boys017 = ageBands?.["0-17"]?.male ?? record.nsr?.total_male ?? 0;
  const girls017 = ageBands?.["0-17"]?.female ?? record.nsr?.total_female ?? 0;
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
            value={record.nsr.total_households.toLocaleString()}
            icon={<Users size={16} />}
            accent="#075E54"
          />
          <KpiCard
            label="Total Individuals"
            value={record.nsr.total_individuals.toLocaleString()}
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
            label="Children (0-3)"
            value={children03.toLocaleString()}
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
                  tick={{ fontSize: 11, fill: theme.axisTick }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  formatter={(value: number) =>
                    Math.abs(value).toLocaleString()
                  }
                  contentStyle={theme.tooltip}
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
                  formatter={(v: number) => v.toLocaleString()}
                  contentStyle={theme.tooltip}
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
                  tick={{ fontSize: 11, fill: theme.axisTick }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: theme.axisTick }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={theme.tooltip}
                />
                <Bar
                  dataKey="total"
                  name="Total Population"
                  fill="#075E54"
                  radius={[4, 4, 0, 0]}
                  label={{
                    position: "top",
                    fill: theme.axisTick,
                    fontSize: 10,
                    formatter: (v: number) => v.toLocaleString(),
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
