/**
 * LivelihoodsResilience domain view — v4
 * Added labelStyle/itemStyle to every <Tooltip>.
 */

import type { FC } from "react";
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
  LabelList,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { useChartTheme } from "../../lib/useChartTheme";
import type { GeoRecord } from "../../lib/types";

interface LivelihoodsResilienceProps {
  data: GeoRecord;
  states: GeoRecord[];
  national: GeoRecord;
  stateFilter?: string | null;
}

const C_ACTIVE = "#7C3AED";
const C_SHOCK = "#DC2626";
const C_COPING = "#F59E0B";
const C_LIVELIHOOD = "#0EA5B7";
const CAT_PALETTE = [
  "#0EA5B7",
  "#DB2777",
  "#F59E0B",
  "#7C3AED",
  "#DC2626",
  "#10B981",
  "#6366F1",
  "#EC4899",
];

const STATE_COLORS: Record<string, string> = {
  ABIA: "#0EA5B7",
  BENUE: "#DB2777",
  OYO: "#F59E0B",
  SOKOTO: "#DC2626",
};

const fmtInt = (n: number) => n.toLocaleString();
const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const kFmt = (v: number) =>
  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);
const toTitle = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const LivelihoodsResilience: FC<LivelihoodsResilienceProps> = ({
  data,
  states,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const { extended } = data;
  if (!extended) return <NoExtendedData />;

  const shocks = extended.shocks;
  const coping = extended.coping;
  const livelihoods = extended.livelihoods;
  const housing = extended.housing;

  const shockExposureByState = states.map((s) => {
    const exp = s.extended?.shocks.exposure_pct;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: exp?.pct ?? 0,
      n: exp?.n ?? 0,
      d: exp?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const shockTypes = shocks.types;
  const livelihoodSources = livelihoods.labour_status;
  const copingTop10 = coping.mechanisms.slice(0, 10);

  const axisTick = { fontSize: 12, fill: theme.axisLabel, fontWeight: 500 };
  const axisTickNum = { fontSize: 11, fill: theme.axisTick };
  const axisTickCategory = {
    fontSize: 12,
    fill: theme.axisLabel,
    fontWeight: 500,
  };
  const barLabelStyle = { fill: theme.barLabel, fontSize: 11, fontWeight: 600 };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      <SectionHeader label="Overview" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Shock-prone households — by state"
          takeaway={`Nationally ${fmtPct(shocks.exposure_pct.pct)} of households (${fmtInt(shocks.exposure_pct.n)}) reported experiencing at least one shock in recent years.`}
          height={340}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shockExposureByState}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="state"
                tick={axisTick}
                stroke={theme.axisStroke}
              />
              <YAxis
                tick={axisTickNum}
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
                  "HHs shock-exposed",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={50}>
                {shockExposureByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? C_SHOCK)
                    }
                  />
                ))}
                <LabelList
                  dataKey="pct"
                  position="top"
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                  style={barLabelStyle}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Shock types experienced"
          takeaway={
            shockTypes.length > 0
              ? `${shockTypes[0].label} is the most-reported shock (${fmtPct(shockTypes[0].pct)} of shock-exposed households).`
              : "No shock data at this level."
          }
          footer="Distribution among households reporting a shock."
          height={340}
          className="col-span-12 lg:col-span-6"
          empty={shockTypes.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={shockTypes}
              layout="vertical"
              margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
              barCategoryGap="20%"
            >
              <XAxis
                type="number"
                tick={axisTickNum}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={axisTickCategory}
                stroke={theme.axisStroke}
                width={150}
                interval={0}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  "HHs",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={26}>
                {shockTypes.map((_, i) => (
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
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Livelihood sources — by labour status"
          takeaway={
            livelihoodSources.length > 0
              ? `${livelihoodSources[0].label} is the most common labour status (${fmtPct(livelihoodSources[0].pct)}).`
              : "No livelihood data."
          }
          height={400}
          className="col-span-12"
          empty={livelihoodSources.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={livelihoodSources}
              layout="vertical"
              margin={{ top: 10, right: 80, left: 10, bottom: 10 }}
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                tick={axisTickNum}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={axisTickCategory}
                stroke={theme.axisStroke}
                width={220}
                interval={0}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  "Individuals",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                {livelihoodSources.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 0
                        ? C_LIVELIHOOD
                        : CAT_PALETTE[i % CAT_PALETTE.length]
                    }
                  />
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
      </div>

      <SectionHeader label="Detailed View" variant="secondary" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Coping mechanisms — top 10"
          takeaway={
            copingTop10.length > 0
              ? `${copingTop10[0].label} is the most-used coping strategy among shock-exposed households (${fmtPct(copingTop10[0].pct)}).`
              : "No coping data at this level."
          }
          footer={`Denominator: ${fmtInt(coping.shock_exposed_hh)} shock-exposed households.`}
          height={420}
          className="col-span-12 lg:col-span-7"
          empty={copingTop10.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={copingTop10}
              layout="vertical"
              margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                tick={axisTickNum}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: theme.axisLabel, fontWeight: 500 }}
                stroke={theme.axisStroke}
                width={220}
                interval={0}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  "HHs",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                {copingTop10.map((_, i) => (
                  <Cell
                    key={i}
                    fill={
                      i === 0 ? C_COPING : CAT_PALETTE[i % CAT_PALETTE.length]
                    }
                  />
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
          title="Housing quality — roof material"
          takeaway={
            housing.roof.length > 0
              ? `${housing.roof[0].label} is the most common roof material (${fmtPct(housing.roof[0].pct)}).`
              : "No roof data."
          }
          height={420}
          className="col-span-12 lg:col-span-5"
          empty={housing.roof.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={housing.roof}
                dataKey="count"
                nameKey="label"
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={100}
                paddingAngle={2}
                labelLine={false}
              >
                {housing.roof.map((_, i) => (
                  <Cell key={i} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  p.payload.label,
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                wrapperStyle={{
                  fontSize: "11px",
                  paddingTop: "8px",
                  color: theme.legendText,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Housing — toilet facilities"
          takeaway={
            housing.toilet.length > 0
              ? `Most common: ${housing.toilet[0].label} (${fmtPct(housing.toilet[0].pct)}).`
              : "No data."
          }
          height={340}
          className="col-span-12 lg:col-span-6"
          empty={housing.toilet.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={housing.toilet}
              layout="vertical"
              margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                tick={axisTickNum}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: theme.axisLabel, fontWeight: 500 }}
                stroke={theme.axisStroke}
                width={200}
                interval={0}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  "HHs",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                {housing.toilet.map((_, i) => (
                  <Cell key={i} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Housing — drinking water source"
          takeaway={
            housing.water.length > 0
              ? `Most common: ${housing.water[0].label} (${fmtPct(housing.water[0].pct)}).`
              : "No data."
          }
          height={340}
          className="col-span-12 lg:col-span-6"
          empty={housing.water.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={housing.water}
              layout="vertical"
              margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                tick={axisTickNum}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 11, fill: theme.axisLabel, fontWeight: 500 }}
                stroke={theme.axisStroke}
                width={200}
                interval={0}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  "HHs",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={20}>
                {housing.water.map((_, i) => (
                  <Cell key={i} fill={CAT_PALETTE[i % CAT_PALETTE.length]} />
                ))}
              </Bar>
            </BarChart>
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
    className={`flex items-baseline gap-3 pb-2 border-b-2 ${
      variant === "primary"
        ? "border-brand-500 dark:border-brand-400"
        : "border-line-light dark:border-line-dark border-dashed"
    }`}
  >
    <span
      className={`text-xs font-bold uppercase tracking-widest ${
        variant === "primary"
          ? "text-brand-600 dark:text-brand-300"
          : "text-ink-muted dark:text-ink-onDarkMuted"
      }`}
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
    </div>
  </div>
);
