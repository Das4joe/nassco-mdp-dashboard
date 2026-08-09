/**
 * ChildProtection domain view — v4
 * Added labelStyle/itemStyle to every <Tooltip>.
 * v4.1 — removed unused kFmt constant (TS6133 fix for Vercel build).
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

interface ChildProtectionProps {
  data: GeoRecord;
  states: GeoRecord[];
  national: GeoRecord;
  stateFilter?: string | null;
}

const C_DOC = "#10B981";
const C_NO_DOC = "#F97316";
const C_ACTIVE = "#7C3AED";
const C_CAT_1 = "#0EA5B7";
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
  SOKOTO: "#7C3AED",
};

const fmtInt = (n: number) => n.toLocaleString();
const fmtPct = (n: number) => `${n.toFixed(1)}%`;
const toTitle = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

export const ChildProtection: FC<ChildProtectionProps> = ({
  data,
  states,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const { nsr, extended } = data;
  if (!extended) return <NoExtendedData />;

  const bcU5 = extended.birth_cert.under_5;
  const bc617 = extended.birth_cert.age_6_17;
  const ninKids = extended.individual_nin.children;
  const dis = extended.disability;
  const chron = extended.chronic_illness;
  const risk = extended.children_in_risk_hh;
  const orphansPct =
    nsr.children_under18 > 0 ? (100 * nsr.orphans) / nsr.children_under18 : 0;

  const bcByState = states.map((s) => {
    const bU5 = s.extended?.birth_cert.under_5;
    const b617 = s.extended?.birth_cert.age_6_17;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct_0_5: bU5?.pct ?? 0,
      pct_6_17: b617?.pct ?? 0,
      n_0_5: bU5?.n ?? 0,
      d_0_5: bU5?.d ?? 0,
      n_6_17: b617?.n ?? 0,
      d_6_17: b617?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const ninByState = states.map((s) => {
    const nin = s.extended?.individual_nin.children;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: nin?.pct ?? 0,
      n: nin?.n ?? 0,
      d: nin?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const riskByState = states.map((s) => {
    const r = s.extended?.children_in_risk_hh;
    return {
      state: toTitle(s.state ?? ""),
      stateRaw: s.state,
      pct: r?.pct ?? 0,
      n: r?.n ?? 0,
      d: r?.d ?? 0,
      isActive: stateFilter ? s.state === stateFilter : false,
    };
  });

  const axisTick = { fontSize: 12, fill: theme.axisLabel, fontWeight: 500 };
  const axisTickNum = { fontSize: 11, fill: theme.axisTick };
  const barLabelStyle = { fill: theme.barLabel, fontSize: 11, fontWeight: 600 };

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
      <SectionHeader label="Overview" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Birth certificate coverage — under 5"
          takeaway={`${fmtPct(bcU5.pct)} of under-5 children have a birth certificate. ${fmtInt(Math.max(0, bcU5.d - bcU5.n))} remain undocumented.`}
          footer={`Denominator: ${fmtInt(bcU5.d)} children age 0–4.`}
          height={280}
          className="col-span-12 lg:col-span-4"
          accent={bcU5.pct >= 80 ? "good" : bcU5.pct >= 50 ? "warn" : "bad"}
        >
          <DocDonut
            yes={bcU5.n}
            total={bcU5.d}
            centerPct={bcU5.pct}
            theme={theme}
          />
        </ChartCard>

        <ChartCard
          title="Birth certificate coverage — ages 6 to 17"
          takeaway={`${fmtPct(bc617.pct)} of school-age children have a birth certificate.`}
          footer={`Denominator: ${fmtInt(bc617.d)} children age 6–17.`}
          height={280}
          className="col-span-12 lg:col-span-4"
          accent={bc617.pct >= 80 ? "good" : bc617.pct >= 50 ? "warn" : "bad"}
        >
          <DocDonut
            yes={bc617.n}
            total={bc617.d}
            centerPct={bc617.pct}
            theme={theme}
          />
        </ChartCard>

        <ChartCard
          title="Children with valid NIN (under 18)"
          takeaway={`${fmtPct(ninKids.pct)} of children have a NIN. NIN enrolment for minors is uncommon nationally.`}
          footer={`Denominator: ${fmtInt(ninKids.d)} children 0–17.`}
          height={280}
          className="col-span-12 lg:col-span-4"
          accent="bad"
        >
          <DocDonut
            yes={ninKids.n}
            total={ninKids.d}
            centerPct={ninKids.pct}
            theme={theme}
          />
        </ChartCard>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Birth registration — by state (under-5 vs 6–17)"
          takeaway="Registration coverage varies across states."
          footer="By age and state."
          height={340}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={bcByState}
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
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(value: number, name: string, p: any) => {
                  if (name === "0–5")
                    return [
                      `${value.toFixed(1)}% (${fmtInt(p.payload.n_0_5)}/${fmtInt(p.payload.d_0_5)})`,
                      "Under 5",
                    ];
                  return [
                    `${value.toFixed(1)}% (${fmtInt(p.payload.n_6_17)}/${fmtInt(p.payload.d_6_17)})`,
                    "6–17",
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
                dataKey="pct_0_5"
                name="0–5"
                fill={C_DOC}
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
              <Bar
                dataKey="pct_6_17"
                name="6–17"
                fill="#3B82F6"
                radius={[4, 4, 0, 0]}
                barSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Children with NIN — by state"
          takeaway="Child NIN enrolment is low across all states."
          footer="Children under 18."
          height={340}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ninByState}
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
                domain={[0, "auto"]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(_v: number, _n: string, p: any) => [
                  `${p.payload.pct.toFixed(2)}% (${fmtInt(p.payload.n)}/${fmtInt(p.payload.d)})`,
                  "Children with NIN",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={50}>
                {ninByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? C_CAT_1)
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
          title="Persons with disability — by type"
          takeaway={`${fmtPct(dis.rate.pct)} of individuals (${fmtInt(dis.rate.n)} people) report a disability.`}
          footer={`Denominator: ${fmtInt(dis.rate.d)} people. Self-reported; a person may report more than one type.`}
          height={360}
          className="col-span-12 lg:col-span-6"
          empty={dis.types.length === 0}
        >
          <TypeBar items={dis.types} theme={theme} />
        </ChartCard>

        <ChartCard
          title="Children in risk-prone households — by state"
          takeaway={`${fmtPct(risk.pct)} of children (${fmtInt(risk.n)}) live in households that reported a shock.`}
          footer="Risk-prone household = reported any shock event."
          height={360}
          className="col-span-12 lg:col-span-6"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={riskByState}
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
                domain={[0, "auto"]}
                tickFormatter={(v) => `${v}%`}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                cursor={{ fill: theme.cursorFill }}
                formatter={(_v: number, _n: string, p: any) => [
                  `${p.payload.pct.toFixed(1)}% (${fmtInt(p.payload.n)} children)`,
                  "In risk-prone HH",
                ]}
              />
              <Bar dataKey="pct" radius={[6, 6, 0, 0]} barSize={50}>
                {riskByState.map((d, i) => (
                  <Cell
                    key={i}
                    fill={
                      d.isActive
                        ? C_ACTIVE
                        : (STATE_COLORS[d.stateRaw ?? ""] ?? C_CAT_1)
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

      <SectionHeader label="Detailed View" variant="secondary" />

      <div className="grid grid-cols-12 gap-6">
        <ChartCard
          title="Chronic illness — by type"
          takeaway={`${fmtPct(chron.rate.pct)} of individuals (${fmtInt(chron.rate.n)}) report a chronic illness.`}
          height={340}
          className="col-span-12 lg:col-span-6"
          empty={chron.types.length === 0}
        >
          <TypeBar items={chron.types} theme={theme} />
        </ChartCard>

        <div className="col-span-12 lg:col-span-6 grid grid-rows-2 gap-6">
          <div className="bg-surface-light dark:bg-surface-dark rounded-2xl border border-line-light dark:border-line-dark p-6 shadow-card">
            <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark mb-1">
              Orphans identified
            </h3>
            <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mb-3">
              Children who have lost one or both parents.
            </p>
            <div className="flex items-baseline gap-3">
              <div className="text-5xl font-bold text-red-500 leading-none">
                {fmtInt(nsr.orphans)}
              </div>
              <div className="text-sm text-ink-muted dark:text-ink-onDarkMuted">
                {fmtPct(orphansPct)} of children under 18
              </div>
            </div>
            <p className="text-[11px] text-ink-faint dark:text-ink-onDarkMuted mt-3">
              Denominator: {fmtInt(nsr.children_under18)} children under 18.
            </p>
          </div>

          <div className="bg-surface-page dark:bg-surface-darker rounded-2xl border border-line-light dark:border-line-dark p-6">
            <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark mb-3">
              Programme priorities
            </h3>
            <ul className="text-xs text-ink-muted dark:text-ink-onDarkMuted space-y-2.5 leading-relaxed">
              <li>
                •{" "}
                <strong className="text-ink-primary dark:text-ink-onDark">
                  Birth-registration drives:
                </strong>{" "}
                prioritise the under-5 cohort ({fmtPct(bcU5.pct)} coverage) for
                greatest impact.
              </li>
              <li>
                •{" "}
                <strong className="text-ink-primary dark:text-ink-onDark">
                  Child NIN gap:
                </strong>{" "}
                {fmtPct(ninKids.pct)} coverage reflects the national policy
                environment.
              </li>
              <li>
                •{" "}
                <strong className="text-ink-primary dark:text-ink-onDark">
                  Risk-prone children:
                </strong>{" "}
                {fmtInt(risk.n)} children live in shock-exposed households —
                priority group for resilience programming.
              </li>
            </ul>
          </div>
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

const DocDonut: FC<{
  yes: number;
  total: number;
  centerPct: number;
  theme: ReturnType<typeof useChartTheme>;
}> = ({ yes, total, centerPct, theme }) => {
  const chartData = [
    { name: "Documented", value: yes, color: C_DOC },
    {
      name: "Not documented",
      value: Math.max(0, total - yes),
      color: C_NO_DOC,
    },
  ];
  return (
    <div className="relative w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="42%"
            innerRadius={58}
            outerRadius={85}
            paddingAngle={3}
            labelLine={false}
          >
            {chartData.map((entry, i) => (
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
      <div
        className="absolute inset-0 flex flex-col items-center justify-start pointer-events-none"
        style={{ paddingTop: "28%" }}
      >
        <div className="text-3xl font-bold text-ink-primary dark:text-ink-onDark leading-none">
          {`${centerPct.toFixed(1)}%`}
        </div>
      </div>
    </div>
  );
};

const TypeBar: FC<{
  items: { label: string; count: number; pct: number }[];
  theme: ReturnType<typeof useChartTheme>;
}> = ({ items, theme }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={items}
      layout="vertical"
      margin={{ top: 10, right: 70, left: 10, bottom: 10 }}
      barCategoryGap="20%"
    >
      <XAxis
        type="number"
        tick={{ fontSize: 11, fill: theme.axisTick }}
        stroke={theme.axisStroke}
        tickFormatter={(v) =>
          v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
        }
        allowDecimals={false}
      />
      <YAxis
        type="category"
        dataKey="label"
        tick={{ fontSize: 12, fill: theme.axisLabel, fontWeight: 500 }}
        stroke={theme.axisStroke}
        width={160}
        interval={0}
      />
      <Tooltip
        contentStyle={theme.tooltip}
        labelStyle={theme.tooltipLabel}
        itemStyle={theme.tooltipItem}
        cursor={{ fill: theme.cursorFill }}
        formatter={(value: number, _n: string, p: any) => [
          `${fmtInt(value)} (${p.payload.pct}%)`,
          "People",
        ]}
      />
      <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={22}>
        {items.map((_, i) => (
          <Cell
            key={i}
            fill={i === 0 ? C_CAT_1 : CAT_PALETTE[i % CAT_PALETTE.length]}
          />
        ))}
        <LabelList
          dataKey="count"
          position="right"
          formatter={(v: number) =>
            v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)
          }
          style={{ fill: theme.barLabel, fontSize: 11, fontWeight: 600 }}
        />
      </Bar>
    </BarChart>
  </ResponsiveContainer>
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
