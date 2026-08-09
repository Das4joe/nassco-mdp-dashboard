/**
 * HealthNutrition domain view — v4
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

interface HealthNutritionProps {
  data: GeoRecord;
  states: GeoRecord[];
  national: GeoRecord;
  stateFilter?: string | null;
}

const C_GREEN = "#10B981";
const C_YELLOW = "#F59E0B";
const C_RED = "#DC2626";
const C_ACTIVE = "#7C3AED";
const C_PREG = "#DB2777";
const C_LACT = "#8B5CF6";
const C_NO_INS = "#EA580C";

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

export const HealthNutrition: FC<HealthNutritionProps> = ({
  data,
  states,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const { unicef, extended } = data;
  if (!extended || !unicef) return <NoExtendedData />;

  const muacCats = extended.muac_distribution.categories;
  const muacTotal = muacCats.Green + muacCats.Yellow + muacCats.Red;
  const muacDonut = [
    { name: "Normal (Green)", value: muacCats.Green, color: C_GREEN },
    { name: "MAM (Yellow)", value: muacCats.Yellow, color: C_YELLOW },
    { name: "SAM (Red)", value: muacCats.Red, color: C_RED },
  ];

  const muacByState = states.map((s) => {
    const cats = s.extended?.muac_distribution.categories ?? {
      Green: 0,
      Yellow: 0,
      Red: 0,
    };
    const total = cats.Green + cats.Yellow + cats.Red;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      normal_pct: total > 0 ? (100 * cats.Green) / total : 0,
      mam_pct: total > 0 ? (100 * cats.Yellow) / total : 0,
      sam_pct: total > 0 ? (100 * cats.Red) / total : 0,
      normal_n: cats.Green,
      mam_n: cats.Yellow,
      sam_n: cats.Red,
      total_screened: total,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const noInsByState = states.map((s) => {
    const ni = s.extended?.no_health_insurance;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: ni?.pct ?? 0,
      n: ni?.n ?? 0,
      d: ni?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const plwByState = states.map((s) => {
    const plw = s.extended?.plw;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      preg_pct: plw?.pregnant.pct ?? 0,
      lact_pct: plw?.lactating.pct ?? 0,
      preg_n: plw?.pregnant.n ?? 0,
      lact_n: plw?.lactating.n ?? 0,
      women_repro: plw?.women_repro_age ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const noIns = extended.no_health_insurance;
  const plw = extended.plw;
  const muacHist = extended.muac_distribution.histogram;
  const assist = extended.assistance_awareness;
  const hcDistance = extended.healthcare_access.distance_dist;

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
          title="MUAC screening — under-5 nutritional status"
          takeaway={`Of ${fmtInt(muacTotal)} children screened: ${fmtPct((100 * muacCats.Green) / muacTotal)} normal, ${fmtPct((100 * muacCats.Yellow) / muacTotal)} MAM, ${fmtPct((100 * muacCats.Red) / muacTotal)} SAM.`}
          footer="MUAC = Mid-Upper Arm Circumference. Red = severe acute malnutrition. Yellow = moderate acute. Green = normal."
          height={320}
          className="col-span-12 lg:col-span-5"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={muacDonut}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                labelLine={false}
              >
                {muacDonut.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, n: string) => [
                  `${fmtInt(v)} children`,
                  n,
                ]}
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
          title="MUAC categories — by state"
          takeaway="Red + Yellow combined = wasting rate."
          height={320}
          className="col-span-12 lg:col-span-7"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={muacByState}
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
                formatter={(value: number, name: string, p: any) => {
                  if (name === "Normal (Green)")
                    return [
                      `${value.toFixed(1)}% (${fmtInt(p.payload.normal_n)})`,
                      name,
                    ];
                  if (name === "MAM (Yellow)")
                    return [
                      `${value.toFixed(1)}% (${fmtInt(p.payload.mam_n)})`,
                      name,
                    ];
                  return [
                    `${value.toFixed(1)}% (${fmtInt(p.payload.sam_n)})`,
                    name,
                  ];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="square"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "8px",
                  color: theme.legendText,
                }}
              />
              <Bar
                dataKey="normal_pct"
                name="Normal (Green)"
                stackId="muac"
                fill={C_GREEN}
                barSize={45}
              />
              <Bar
                dataKey="mam_pct"
                name="MAM (Yellow)"
                stackId="muac"
                fill={C_YELLOW}
                barSize={45}
              />
              <Bar
                dataKey="sam_pct"
                name="SAM (Red)"
                stackId="muac"
                fill={C_RED}
                radius={[4, 4, 0, 0]}
                barSize={45}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Households without health service access — by state"
          takeaway={`${fmtPct(noIns.pct)} of households nationally (${fmtInt(noIns.n)}) have no member benefiting from healthcare services.`}
          height={340}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={noInsByState}
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
                  "HHs without access",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={50}>
                {noInsByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? C_NO_INS)
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
          title="Pregnant and lactating women — by state"
          takeaway={`Nationally ${fmtInt(plw.pregnant.n)} pregnant (${fmtPct(plw.pregnant.pct)}) and ${fmtInt(plw.lactating.n)} lactating (${fmtPct(plw.lactating.pct)}) women identified.`}
          footer="Priority group for antenatal and nutrition programmes."
          height={340}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={plwByState}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              barCategoryGap="20%"
            >
              <XAxis
                dataKey="state"
                tick={axisTick}
                stroke={theme.axisStroke}
              />
              <YAxis
                tick={axisTickNum}
                stroke={theme.axisStroke}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, name: string, p: any) => {
                  if (name === "Pregnant")
                    return [
                      `${value.toFixed(2)}% (${fmtInt(p.payload.preg_n)} women)`,
                      name,
                    ];
                  return [
                    `${value.toFixed(2)}% (${fmtInt(p.payload.lact_n)} women)`,
                    name,
                  ];
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={28}
                iconType="square"
                wrapperStyle={{
                  fontSize: "12px",
                  paddingTop: "8px",
                  color: theme.legendText,
                }}
              />
              <Bar
                dataKey="preg_pct"
                name="Pregnant"
                fill={C_PREG}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="lact_pct"
                name="Lactating"
                fill={C_LACT}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionHeader label="Detailed View" variant="secondary" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="MUAC raw measurement distribution (cm)"
          takeaway="Cut-offs: below 11.5 cm = SAM, 11.5–12.5 cm = MAM, 12.5 cm and above = normal."
          height={320}
          className="col-span-12 lg:col-span-7"
          empty={muacHist.every((b) => b.count === 0)}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={muacHist}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              barCategoryGap="10%"
            >
              <XAxis
                dataKey="bin"
                tick={{ fontSize: 10, fill: theme.axisTick }}
                stroke={theme.axisStroke}
                angle={-15}
                textAnchor="end"
                height={50}
                interval={0}
              />
              <YAxis
                tick={axisTickNum}
                stroke={theme.axisStroke}
                tickFormatter={kFmt}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number) => [fmtInt(value), "Children"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                {muacHist.map((b, i) => {
                  let color = C_GREEN;
                  if (b.bin.includes("SAM")) color = C_RED;
                  else if (b.bin.includes("MAM")) color = C_YELLOW;
                  else if (
                    b.bin.startsWith("<") ||
                    b.bin.startsWith("8-") ||
                    b.bin.startsWith("10-")
                  )
                    color = C_RED;
                  return <Cell key={i} fill={color} />;
                })}
                <LabelList
                  dataKey="count"
                  position="top"
                  formatter={kFmt}
                  style={{
                    fill: theme.barLabel,
                    fontSize: 10,
                    fontWeight: 600,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Distance to nearest health centre"
          takeaway={
            hcDistance.length > 0
              ? `Most common: ${hcDistance[0].label} (${fmtPct(hcDistance[0].pct)}).`
              : "No distance data at this level."
          }
          height={320}
          className="col-span-12 lg:col-span-5"
          empty={hcDistance.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={hcDistance}
              layout="vertical"
              margin={{ top: 10, right: 60, left: 10, bottom: 10 }}
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
                width={130}
                interval={0}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, _n: string, p: any) => [
                  `${fmtInt(value)} (${p.payload.pct}%)`,
                  "Respondents",
                ]}
              />
              <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
                {hcDistance.map((_, i) => {
                  const palette = ["#10B981", "#F59E0B", "#DC2626"];
                  return <Cell key={i} fill={palette[i % palette.length]} />;
                })}
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
        <div className="col-span-12 bg-surface-page dark:bg-surface-darker rounded-2xl border border-status-warning/40 p-6">
          <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark mb-3">
            Assistance awareness
          </h3>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mb-4 leading-relaxed">
            When surveyed households were asked about the food, therapeutic
            feeding, or cash assistance they receive or are eligible for,{" "}
            <strong className="text-ink-primary dark:text-ink-onDark">
              {fmtPct(assist.dontknow_yes_pct)} answered "Don't know"
            </strong>
            . Improving awareness of available services is an opportunity for
            programme design.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-status-warning/30">
              <div className="text-2xl font-bold text-status-danger">
                {fmtPct(assist.dontknow_yes_pct)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
                Don't know
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-line-light dark:border-line-dark">
              <div className="text-2xl font-bold text-ink-primary dark:text-ink-onDark">
                {fmtPct(assist.rutf_yes_pct)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
                Aware of therapeutic feeding
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-line-light dark:border-line-dark">
              <div className="text-2xl font-bold text-ink-primary dark:text-ink-onDark">
                {fmtPct(assist.food_yes_pct)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
                Aware of food assistance
              </div>
            </div>
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 border border-line-light dark:border-line-dark">
              <div className="text-2xl font-bold text-ink-primary dark:text-ink-onDark">
                {fmtPct(assist.cash_yes_pct)}
              </div>
              <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
                Aware of cash assistance
              </div>
            </div>
          </div>
          <p className="text-[11px] text-ink-faint dark:text-ink-onDarkMuted mt-4">
            Denominator: {fmtInt(assist.asked_n)} respondents.
          </p>
        </div>
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
