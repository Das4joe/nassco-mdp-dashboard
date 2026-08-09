/**
 * Education domain view — v4
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
  Cell,
  Legend,
  LabelList,
} from "recharts";
import { ChartCard } from "./ChartCard";
import { useChartTheme } from "../../lib/useChartTheme";
import type { GeoRecord } from "../../lib/types";

interface EducationProps {
  data: GeoRecord;
  states: GeoRecord[];
  national: GeoRecord;
  stateFilter?: string | null;
}

const C_OOS = "#DC2626";
const C_ENROLLED = "#10B981";
const C_ACTIVE = "#7C3AED";
const C_6_14 = "#F97316";
const C_15_17 = "#8B5CF6";

const STATE_COLORS: Record<string, string> = {
  ABIA: "#0EA5B7",
  BENUE: "#DB2777",
  OYO: "#F59E0B",
  SOKOTO: "#DC2626",
};

const PMT_DECILE_COLORS = [
  "#DC2626",
  "#EA580C",
  "#F59E0B",
  "#EAB308",
  "#84CC16",
  "#22C55E",
  "#10B981",
  "#14B8A6",
  "#0EA5B7",
  "#0284C7",
];

const fmtInt = (n: number) => n.toLocaleString();
const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const kFmt = (v: number) =>
  v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);
const toTitle = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const Education: FC<EducationProps> = ({
  data,
  states,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const { unicef, extended, vulnerability } = data;
  if (!extended || !unicef) return <NoExtendedData />;

  const oos6_14 = extended.oos_by_band.age_6_14;
  const oos15_17 = extended.oos_by_band.age_15_17;
  const oosCombined = extended.oos_by_band.combined_6_17;

  const oos6_14ByState = states.map((s) => {
    const b = s.extended?.oos_by_band.age_6_14;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: b?.pct ?? 0,
      n: b?.n ?? 0,
      d: b?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const oos15_17ByState = states.map((s) => {
    const b = s.extended?.oos_by_band.age_15_17;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: b?.pct ?? 0,
      n: b?.n ?? 0,
      d: b?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const oosCombinedByState = states.map((s) => {
    const b = s.extended?.oos_by_band.combined_6_17;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: b?.pct ?? 0,
      n: b?.n ?? 0,
      d: b?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const attendanceByAge = [
    {
      band: "Primary\n(6–11)",
      attendance: unicef.primary_age_attendance_pct,
      oos: 100 - unicef.primary_age_attendance_pct,
    },
    {
      band: "Lower sec\n(12–14)",
      attendance: unicef.lower_secondary_attendance_pct,
      oos: 100 - unicef.lower_secondary_attendance_pct,
    },
    {
      band: "Upper sec\n(15–17)",
      attendance: unicef.upper_secondary_attendance_pct,
      oos: 100 - unicef.upper_secondary_attendance_pct,
    },
  ];

  const decileData = Object.entries(vulnerability.decile_distribution).map(
    ([k, v]) => ({
      decile: k.replace("d", "D"),
      count: v,
      color: PMT_DECILE_COLORS[parseInt(k.replace("d", "")) - 1] ?? "#94A3B8",
    }),
  );

  const axisTick = { fontSize: 12, fill: theme.axisLabel, fontWeight: 500 };
  const axisTickNum = { fontSize: 11, fill: theme.axisTick };
  const barLabelStyle = { fill: theme.barLabel, fontSize: 11, fontWeight: 600 };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      <SectionHeader label="Overview" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Out-of-school — ages 6 to 14"
          takeaway={`${fmtPct(oos6_14.pct)} of children age 6–14 are not enrolled in school.`}
          footer={`Denominator: ${fmtInt(oos6_14.d)} children.`}
          height={220}
          className="col-span-12 md:col-span-4"
          accent={oos6_14.pct > 30 ? "bad" : oos6_14.pct > 15 ? "warn" : "good"}
        >
          <BigStat
            value={fmtPct(oos6_14.pct)}
            label={`${fmtInt(oos6_14.n)} of ${fmtInt(oos6_14.d)} children`}
            color={
              oos6_14.pct > 30
                ? "text-red-500"
                : oos6_14.pct > 15
                  ? "text-amber-500"
                  : "text-emerald-500"
            }
          />
        </ChartCard>

        <ChartCard
          title="Out-of-school — ages 15 to 17"
          takeaway={`${fmtPct(oos15_17.pct)} of adolescents age 15–17 are not enrolled.`}
          footer={`Denominator: ${fmtInt(oos15_17.d)} adolescents.`}
          height={220}
          className="col-span-12 md:col-span-4"
          accent={
            oos15_17.pct > 30 ? "bad" : oos15_17.pct > 15 ? "warn" : "good"
          }
        >
          <BigStat
            value={fmtPct(oos15_17.pct)}
            label={`${fmtInt(oos15_17.n)} of ${fmtInt(oos15_17.d)} adolescents`}
            color={
              oos15_17.pct > 30
                ? "text-red-500"
                : oos15_17.pct > 15
                  ? "text-amber-500"
                  : "text-emerald-500"
            }
          />
        </ChartCard>

        <ChartCard
          title="Out-of-school — combined 6 to 17"
          takeaway={`${fmtPct(oosCombined.pct)} of all school-age children are not enrolled.`}
          footer={`Denominator: ${fmtInt(oosCombined.d)} children (6–17).`}
          height={220}
          className="col-span-12 md:col-span-4"
          accent={
            oosCombined.pct > 30
              ? "bad"
              : oosCombined.pct > 15
                ? "warn"
                : "good"
          }
        >
          <BigStat
            value={fmtPct(oosCombined.pct)}
            label={`${fmtInt(oosCombined.n)} of ${fmtInt(oosCombined.d)} children`}
            color={
              oosCombined.pct > 30
                ? "text-red-500"
                : oosCombined.pct > 15
                  ? "text-amber-500"
                  : "text-emerald-500"
            }
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Out-of-school children (6–14) — by state"
          takeaway="Primary-school-age rates by state."
          height={340}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={oos6_14ByState}
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
                  "Out of school",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={50}>
                {oos6_14ByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? C_6_14)
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
          title="Out-of-school adolescents (15–17) — by state"
          takeaway="Adolescent dropout rates by state."
          height={340}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={oos15_17ByState}
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
                  "Out of school",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={50}>
                {oos15_17ByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? C_15_17)
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
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Out-of-school children — combined (6–17) by state"
          takeaway="Combined view highlights the overall education access gap."
          height={340}
          className="col-span-12"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={oosCombinedByState}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              barCategoryGap="30%"
            >
              <XAxis
                dataKey="state"
                tick={{ fontSize: 13, fill: theme.axisLabel, fontWeight: 600 }}
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
                  `${p.payload.pct.toFixed(1)}% (${fmtInt(p.payload.n)} children out of ${fmtInt(p.payload.d)})`,
                  "Out of school",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={80}>
                {oosCombinedByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? C_OOS)
                    }
                  />
                ))}
                <LabelList
                  dataKey="pct"
                  position="top"
                  formatter={(v: number) => `${v.toFixed(1)}%`}
                  style={{
                    fill: theme.barLabel,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <SectionHeader label="Detailed View" variant="secondary" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Attendance vs out-of-school — by school level"
          takeaway="Attendance often drops between primary and secondary levels."
          height={320}
          className="col-span-12 lg:col-span-7"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={attendanceByAge}
              margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="band"
                tick={axisTick}
                stroke={theme.axisStroke}
                interval={0}
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
                formatter={(value: number, name: string) => [
                  `${value.toFixed(1)}%`,
                  name,
                ]}
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
                dataKey="attendance"
                name="Enrolled"
                stackId="edu"
                fill={C_ENROLLED}
                radius={[4, 4, 0, 0]}
                barSize={60}
              />
              <Bar
                dataKey="oos"
                name="Out of school"
                stackId="edu"
                fill={C_OOS}
                barSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Household poverty distribution"
          takeaway={`${fmtPct(vulnerability.poorest_pct)} of households (${fmtInt(vulnerability.poorest_households)}) are in the poorest three deciles.`}
          footer="D1 = poorest 10%, D10 = wealthiest 10%."
          height={320}
          className="col-span-12 lg:col-span-5"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={decileData}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
              barCategoryGap="15%"
            >
              <XAxis
                dataKey="decile"
                tick={axisTickNum}
                stroke={theme.axisStroke}
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
                formatter={(value: number) => [fmtInt(value), "Households"]}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={26}>
                {decileData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
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
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 bg-surface-page dark:bg-surface-darker rounded-2xl border border-line-light dark:border-line-dark p-6">
          <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark mb-3">
            Programme priorities
          </h3>
          <ul className="text-xs text-ink-muted dark:text-ink-onDarkMuted space-y-2.5 leading-relaxed">
            <li>
              •{" "}
              <strong className="text-ink-primary dark:text-ink-onDark">
                Primary-age gap (6–14):
              </strong>{" "}
              {fmtInt(oos6_14.n)} children out of school. Targeted enrolment
              support in the highest-rate states offers the greatest impact.
            </li>
            <li>
              •{" "}
              <strong className="text-ink-primary dark:text-ink-onDark">
                Adolescent dropout (15–17):
              </strong>{" "}
              {fmtInt(oos15_17.n)} adolescents out of school. State-specific
              factors should be examined.
            </li>
            <li>
              •{" "}
              <strong className="text-ink-primary dark:text-ink-onDark">
                Poverty link:
              </strong>{" "}
              {fmtInt(vulnerability.poorest_households)} households are in the
              poorest deciles. Financial-support interventions linked to
              enrolment have proven effective in similar contexts.
            </li>
          </ul>
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

const BigStat: FC<{ value: string; label: string; color: string }> = ({
  value,
  label,
  color,
}) => (
  <div className="w-full h-full flex flex-col items-center justify-center">
    <div className={`text-5xl font-bold ${color} leading-none mb-2`}>
      {value}
    </div>
    <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted text-center">
      {label}
    </div>
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
