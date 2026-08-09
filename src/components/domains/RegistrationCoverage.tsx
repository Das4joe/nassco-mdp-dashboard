/**
 * RegistrationCoverage domain view — v6
 * Added labelStyle/itemStyle to every <Tooltip> for dark-mode visibility.
 */

import type { FC } from "react";
import { useMemo } from "react";
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
  LineChart,
  Line,
  Legend,
  LabelList,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { useChartTheme } from "../../lib/useChartTheme";
import type { GeoRecord, TimeseriesPoint } from "../../lib/types";

interface RegistrationCoverageProps {
  data: GeoRecord;
  states: GeoRecord[];
  national: GeoRecord;
  timeseries: TimeseriesPoint[];
  stateFilter?: string | null;
}

const C_MALE = "#0EA5B7";
const C_FEMALE = "#DB2777";
const C_ACTIVE = "#7C3AED";
const CAT_PALETTE = [
  "#0EA5B7",
  "#DB2777",
  "#F59E0B",
  "#7C3AED",
  "#DC2626",
  "#10B981",
  "#6366F1",
];

const STATE_COLORS: Record<string, string> = {
  ABIA: "#0EA5B7",
  BENUE: "#DB2777",
  OYO: "#F59E0B",
  SOKOTO: "#7C3AED",
};

const fmtInt = (n: number) => n.toLocaleString();
const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const kFmt = (v: number) =>
  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);
const toTitle = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const RegistrationCoverage: FC<RegistrationCoverageProps> = ({
  data,
  states,
  timeseries,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const { nsr, extended } = data;
  if (!extended) return <NoExtendedData />;

  const stateComparison = states.map((s) => ({
    state: toTitle(s.state ?? ""),
    stateRaw: s.state,
    households: s.nsr.total_households,
    individuals: s.nsr.total_individuals,
    isActive: stateFilter ? s.state === stateFilter : false,
  }));

  const totalPeople = nsr.total_female + nsr.total_male;
  const femalePct =
    totalPeople > 0 ? (100 * nsr.total_female) / totalPeople : 0;
  const sexData = [
    { name: "Female", value: nsr.total_female, color: C_FEMALE },
    { name: "Male", value: nsr.total_male, color: C_MALE },
  ];

  const unicefAgeBands = useMemo(() => {
    return [...extended.age_bands_unicef].reverse().map((b) => ({
      band: b.band,
      Male: -b.male,
      Female: b.female,
    }));
  }, [extended.age_bands_unicef]);

  const maxUnicefAge = useMemo(() => {
    const m = Math.max(
      1,
      ...extended.age_bands_unicef.map((b) => Math.max(b.male, b.female)),
    );
    const magnitude = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / magnitude) * magnitude;
  }, [extended.age_bands_unicef]);

  const trendData = useMemo(() => {
    const rows = stateFilter
      ? timeseries.filter((r) => r.state === stateFilter)
      : timeseries;
    const byMonth = new Map<
      string,
      { households: number; individuals: number }
    >();
    rows.forEach((r) => {
      const prev = byMonth.get(r.month) ?? { households: 0, individuals: 0 };
      byMonth.set(r.month, {
        households: prev.households + r.households,
        individuals: prev.individuals + r.individuals,
      });
    });
    return Array.from(byMonth.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, v]) => ({ month, ...v }));
  }, [timeseries, stateFilter]);

  const peakMonth = trendData.length
    ? trendData.reduce((a, b) => (a.households > b.households ? a : b))
    : null;

  const fhhByState = states.map((s) => {
    const fpr = s.extended?.female_primary_respondent;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: fpr?.pct ?? 0,
      n: fpr?.n ?? 0,
      d: fpr?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const pyramid7 = useMemo(() => {
    return [...extended.age_sex_pyramid].reverse().map((b) => ({
      band: b.band,
      Male: -b.male,
      Female: b.female,
    }));
  }, [extended.age_sex_pyramid]);

  const maxPyramid7 = useMemo(() => {
    const m = Math.max(
      1,
      ...extended.age_sex_pyramid.map((b) => Math.max(b.male, b.female)),
    );
    const magnitude = Math.pow(10, Math.floor(Math.log10(m)));
    return Math.ceil(m / magnitude) * magnitude;
  }, [extended.age_sex_pyramid]);

  const barLabelStyle = { fill: theme.barLabel, fontSize: 11, fontWeight: 600 };
  const axisTick = { fontSize: 12, fill: theme.axisTick, fontWeight: 500 };
  const axisTickSmall = { fontSize: 11, fill: theme.axisTick };
  const axisTickCategory = {
    fontSize: 13,
    fill: theme.axisLabel,
    fontWeight: 600,
  };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      <SectionHeader label="Overview" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Total households registered — by state"
          takeaway={`${fmtInt(states.reduce((a, s) => a + s.nsr.total_households, 0))} households registered across all 4 states.`}
          height={280}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stateComparison}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="state"
                tick={axisTick}
                stroke={theme.axisStroke}
              />
              <YAxis
                tick={axisTickSmall}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number) => [fmtInt(value), "Households"]}
              />
              <Bar dataKey="households" radius={[6, 6, 0, 0]} barSize={50}>
                {stateComparison.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? "#0EA5B7")
                    }
                  />
                ))}
                <LabelList
                  dataKey="households"
                  position="top"
                  formatter={kFmt}
                  style={barLabelStyle}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Total individuals — by state"
          takeaway={`${fmtInt(states.reduce((a, s) => a + s.nsr.total_individuals, 0))} individuals across all 4 states.`}
          height={280}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={stateComparison}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="state"
                tick={axisTick}
                stroke={theme.axisStroke}
              />
              <YAxis
                tick={axisTickSmall}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number) => [fmtInt(value), "Individuals"]}
              />
              <Bar dataKey="individuals" radius={[6, 6, 0, 0]} barSize={50}>
                {stateComparison.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? "#0EA5B7")
                    }
                  />
                ))}
                <LabelList
                  dataKey="individuals"
                  position="top"
                  formatter={kFmt}
                  style={barLabelStyle}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Sex disaggregation"
          takeaway={`${fmtPct(femalePct)} of registered individuals are female.`}
          height={280}
          className="col-span-12 lg:col-span-4"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={sexData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="42%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                labelLine={false}
              >
                {sexData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [fmtInt(v), n]}
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "8px",
                  color: theme.legendText,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Population by age group — by sex"
          takeaway="Age groups: 0–5 (under 6), 6–14 (school age), 15–17 (adolescents), 18+ (adults)."
          height={280}
          className="col-span-12 lg:col-span-8"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={unicefAgeBands}
              layout="vertical"
              stackOffset="sign"
              margin={{ top: 10, right: 40, left: 20, bottom: 30 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                domain={[-maxUnicefAge, maxUnicefAge]}
                tickFormatter={(v) => kFmt(Math.abs(v))}
                tick={axisTickSmall}
                stroke={theme.axisStroke}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="band"
                tick={axisTickCategory}
                stroke={theme.axisStroke}
                width={60}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: theme.cursorFill }}
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(value: number, name: string) => [
                  fmtInt(Math.abs(value)),
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="square"
                wrapperStyle={{
                  fontSize: "13px",
                  paddingTop: "10px",
                  color: theme.legendText,
                }}
                payload={[
                  { value: "Male", type: "square", color: C_MALE, id: "m" },
                  { value: "Female", type: "square", color: C_FEMALE, id: "f" },
                ]}
              />
              <Bar
                dataKey="Male"
                fill={C_MALE}
                stackId="p"
                barSize={26}
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="Female"
                fill={C_FEMALE}
                stackId="p"
                barSize={26}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="New households registered — monthly trend"
          takeaway={
            trendData.length === 0
              ? "No monthly data yet."
              : trendData.length === 1
                ? "One month recorded so far — trend will build as more months arrive."
                : peakMonth
                  ? `Registration peaked in ${peakMonth.month} (${fmtInt(peakMonth.households)} households).`
                  : `${trendData.length} months of activity.`
          }
          footer={
            stateFilter
              ? `Filtered to ${toTitle(stateFilter)}.`
              : "All 4 states combined."
          }
          height={300}
          className="col-span-12 lg:col-span-7"
          empty={trendData.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{ top: 20, right: 40, left: 10, bottom: 30 }}
            >
              <XAxis
                dataKey="month"
                tick={axisTickSmall}
                stroke={theme.axisStroke}
              />
              <YAxis
                tick={axisTickSmall}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, name: string) => [
                  fmtInt(value),
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={30}
                iconType="line"
                wrapperStyle={{
                  fontSize: "13px",
                  paddingTop: "10px",
                  color: theme.legendText,
                }}
              />
              <Line
                type="monotone"
                dataKey="households"
                name="Households"
                stroke={C_MALE}
                strokeWidth={3}
                dot={{ r: 6, fill: C_MALE, strokeWidth: 0 }}
                activeDot={{ r: 8 }}
              />
              <Line
                type="monotone"
                dataKey="individuals"
                name="Individuals"
                stroke={C_FEMALE}
                strokeWidth={3}
                dot={{ r: 6, fill: C_FEMALE, strokeWidth: 0 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Female-headed households — by state"
          takeaway={`Rate varies from ${fmtPct(Math.min(...fhhByState.map((f) => f.pct)))} to ${fmtPct(Math.max(...fhhByState.map((f) => f.pct)))} across the 4 states.`}
          height={300}
          className="col-span-12 lg:col-span-5"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={fhhByState}
              margin={{ top: 20, right: 40, left: 10, bottom: 30 }}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="state"
                tick={axisTick}
                stroke={theme.axisStroke}
              />
              <YAxis
                tick={axisTickSmall}
                stroke={theme.axisStroke}
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(_v: number, _n: string, p: any) => [
                  `${p.payload.pct.toFixed(1)}% (${fmtInt(p.payload.n)}/${fmtInt(p.payload.d)})`,
                  "Female-headed",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={50}>
                {fhhByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? "#0EA5B7")
                    }
                  />
                ))}
                <LabelList
                  dataKey="pct"
                  position="top"
                  formatter={(v: number) => `${v.toFixed(0)}%`}
                  style={barLabelStyle}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionHeader label="Detailed View" variant="secondary" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Population pyramid — detailed age bands"
          takeaway="Seven-band breakdown for identifying specific age cohorts."
          height={400}
          className="col-span-12 lg:col-span-8"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={pyramid7}
              layout="vertical"
              stackOffset="sign"
              margin={{ top: 10, right: 40, left: 20, bottom: 30 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                domain={[-maxPyramid7, maxPyramid7]}
                tickFormatter={(v) => kFmt(Math.abs(v))}
                tick={axisTickSmall}
                stroke={theme.axisStroke}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="band"
                tick={axisTickCategory}
                stroke={theme.axisStroke}
                width={60}
                interval={0}
              />
              <Tooltip
                cursor={{ fill: theme.cursorFill }}
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(value: number, name: string) => [
                  fmtInt(Math.abs(value)),
                  name,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="square"
                wrapperStyle={{
                  fontSize: "13px",
                  paddingTop: "10px",
                  color: theme.legendText,
                }}
                payload={[
                  { value: "Male", type: "square", color: C_MALE, id: "m" },
                  { value: "Female", type: "square", color: C_FEMALE, id: "f" },
                ]}
              />
              <Bar
                dataKey="Male"
                fill={C_MALE}
                stackId="p7"
                barSize={22}
                radius={[4, 0, 0, 4]}
              />
              <Bar
                dataKey="Female"
                fill={C_FEMALE}
                stackId="p7"
                barSize={22}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="col-span-12 lg:col-span-4 bg-surface-light dark:bg-surface-dark rounded-2xl border border-line-light dark:border-line-dark p-5 shadow-card">
          <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark mb-1">
            Households and people
          </h3>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mb-4">
            Scope of what's registered at current view.
          </p>
          <div className="space-y-4">
            <div>
              <div className="text-3xl font-bold text-ink-primary dark:text-ink-onDark">
                {fmtInt(nsr.total_households)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted">
                Households
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-ink-primary dark:text-ink-onDark">
                {fmtInt(nsr.total_individuals)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted">
                Individuals
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold text-brand-600 dark:text-brand-300">
                {nsr.avg_household_size.toFixed(1)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted">
                Average people per household
              </div>
            </div>
            <div className="pt-4 border-t border-line-light dark:border-line-dark">
              <div className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
                {fmtInt(nsr.urban_households)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted">
                Urban households ({fmtPct(nsr.urban_pct)})
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
                {fmtInt(nsr.rural_households)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted">
                Rural households
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Marital status (adults 15+)"
          takeaway={
            extended.marital_status.length > 0
              ? `${extended.marital_status[0].label} is most common (${fmtPct(extended.marital_status[0].pct)}).`
              : "No data."
          }
          height={280}
          className="col-span-12 lg:col-span-6"
          empty={extended.marital_status.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={extended.marital_status}
              layout="vertical"
              margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                tick={axisTickSmall}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12, fill: theme.axisLabel, fontWeight: 500 }}
                stroke={theme.axisStroke}
                width={140}
                interval={0}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  "Adults",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                {extended.marital_status.map((_, i) => (
                  <Cell key={i} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  formatter={kFmt}
                  style={barLabelStyle}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Female-headed households — current view"
          takeaway={`${fmtPct(extended.female_primary_respondent.pct)} of households at this level.`}
          height={280}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  {
                    name: "Female-headed",
                    value: extended.female_primary_respondent.n,
                    color: C_FEMALE,
                  },
                  {
                    name: "Male-headed",
                    value: Math.max(
                      0,
                      extended.female_primary_respondent.d -
                        extended.female_primary_respondent.n,
                    ),
                    color: C_MALE,
                  },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="42%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                labelLine={false}
              >
                <Cell fill={C_FEMALE} />
                <Cell fill={C_MALE} />
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [fmtInt(v), n]}
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "8px",
                  color: theme.legendText,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const SectionHeader: FC<{
  label: string;
  variant?: "primary" | "secondary";
}> = ({ label, variant = "primary" }) => (
  <div
    className={
      "flex items-baseline gap-3 pb-2 border-b-2 " +
      (variant === "primary"
        ? "border-brand-500 dark:border-brand-400"
        : "border-line-light dark:border-line-dark border-dashed")
    }
  >
    <span
      className={
        "text-xs font-bold uppercase tracking-widest " +
        (variant === "primary"
          ? "text-brand-600 dark:text-brand-300"
          : "text-ink-muted dark:text-ink-onDarkMuted")
      }
    >
      {label}
    </span>
  </div>
);

const NoExtendedData: FC = () => (
  <div className="max-w-[1600px] mx-auto px-6 py-16">
    <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-status-warning/40 p-8 text-center shadow-card">
      <div className="text-3xl mb-3">⚠️</div>
      <h2 className="text-lg font-semibold text-ink-primary dark:text-ink-onDark mb-2">
        Data not available at this level
      </h2>
      <p className="text-sm text-ink-muted dark:text-ink-onDarkMuted max-w-md mx-auto">
        Please try a broader view.
      </p>
    </div>
  </div>
);
