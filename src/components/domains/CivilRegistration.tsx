/**
 * Civil Registration — UNICEF page (was Child Protection & Documentation)
 * Dedicated map coloured by birth cert / NIN coverage.
 */

import { useState, type FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { FileCheck, CreditCard, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import KpiCard from "../KpiCard";
import DrilldownMap from "../maps/DrilldownMap";
import type { MapMetric } from "../maps/DrilldownMap";

const BRAND = "#075E54";
const NSR = "#128C7E";
const UPD = "#E67E22";
const DANGER = "#DC2626";
const SKY = "#0284C7";
const AMBER = "#D97706";
const EMERALD = "#059669";

interface CivilRegistrationProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const CivilRegistration: FC<CivilRegistrationProps> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const theme = useChartTheme();
  const [mapMetric, setMapMetric] = useState<MapMetric>("birth_cert");

  const civil = record.extended.civil_registration;
  const c017 = civil?.children_0_17 ?? {
    total: record.extended.birth_cert?.all_children?.d ?? 0,
    birth_cert_yes: record.extended.birth_cert?.all_children?.n ?? 0,
    birth_cert_no: 0,
    birth_cert_pct: record.extended.birth_cert?.all_children?.pct ?? 0,
    nin_yes: record.extended.individual_nin?.children?.n ?? 0,
    nin_no: 0,
    nin_pct: record.extended.individual_nin?.children?.pct ?? 0,
    both: 0,
    both_pct: 0,
    cert_only: 0,
    cert_only_pct: 0,
    nin_only: 0,
    nin_only_pct: 0,
    neither: 0,
    neither_pct: 0,
    by_gender: {
      male: {
        total: 0,
        birth_cert_yes: 0,
        nin_yes: 0,
        birth_cert_pct: 0,
        nin_pct: 0,
      },
      female: {
        total: 0,
        birth_cert_yes: 0,
        nin_yes: 0,
        birth_cert_pct: 0,
        nin_pct: 0,
      },
    },
  };
  const c05 = civil?.children_0_5 ?? {
    total: record.extended.birth_cert?.under_5?.d ?? 0,
    birth_cert_yes: record.extended.birth_cert?.under_5?.n ?? 0,
    birth_cert_no: 0,
    birth_cert_pct: record.extended.birth_cert?.under_5?.pct ?? 0,
    nin_yes: 0,
    nin_no: 0,
    nin_pct: 0,
    both: 0,
    both_pct: 0,
    cert_only: 0,
    cert_only_pct: 0,
    nin_only: 0,
    nin_only_pct: 0,
    neither: 0,
    neither_pct: 0,
    by_gender: {
      male: {
        total: 0,
        birth_cert_yes: 0,
        nin_yes: 0,
        birth_cert_pct: 0,
        nin_pct: 0,
      },
      female: {
        total: 0,
        birth_cert_yes: 0,
        nin_yes: 0,
        birth_cert_pct: 0,
        nin_pct: 0,
      },
    },
  };

  const crossTabData = [
    {
      name: "Both (Cert + NIN)",
      value: c017.both,
      pct: c017.both_pct,
      color: EMERALD,
    },
    {
      name: "Birth Cert Only",
      value: c017.cert_only,
      pct: c017.cert_only_pct,
      color: SKY,
    },
    {
      name: "NIN Only",
      value: c017.nin_only,
      pct: c017.nin_only_pct,
      color: AMBER,
    },
    {
      name: "Neither",
      value: c017.neither,
      pct: c017.neither_pct,
      color: DANGER,
    },
  ];

  const genderData = [
    {
      group: "0–5 M",
      "Birth Cert %": c05.by_gender.male.birth_cert_pct,
      "NIN %": c05.by_gender.male.nin_pct,
    },
    {
      group: "0–5 F",
      "Birth Cert %": c05.by_gender.female.birth_cert_pct,
      "NIN %": c05.by_gender.female.nin_pct,
    },
    {
      group: "0–17 M",
      "Birth Cert %": c017.by_gender.male.birth_cert_pct,
      "NIN %": c017.by_gender.male.nin_pct,
    },
    {
      group: "0–17 F",
      "Birth Cert %": c017.by_gender.female.birth_cert_pct,
      "NIN %": c017.by_gender.female.nin_pct,
    },
  ];

  const certAbsence = [
    {
      name: "With birth certificate",
      count: c017.birth_cert_yes,
      pct: c017.birth_cert_pct,
    },
    {
      name: "Without birth certificate",
      count:
        c017.birth_cert_no || Math.max(0, c017.total - c017.birth_cert_yes),
      pct: Math.round((100 - c017.birth_cert_pct) * 10) / 10,
    },
  ];

  const ninAbsence = [
    { name: "With registered NIN", count: c017.nin_yes, pct: c017.nin_pct },
    {
      name: "Without registered NIN",
      count: c017.nin_no || Math.max(0, c017.total - c017.nin_yes),
      pct: Math.round((100 - c017.nin_pct) * 10) / 10,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Civil Registration
          </h2>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-0.5">
            Birth certificate and NIN coverage by age band and gender
          </p>
        </div>
        <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted bg-surface-page dark:bg-surface-darker px-3 py-1.5 rounded-lg border border-line-light dark:border-line-dark">
          Data as of:{" "}
          <span className="font-semibold text-brand-600 dark:text-brand-400">
            September 2026
          </span>
        </div>
      </div>

      {/* KPIs — KpiCard uses label / value / sub / icon as ReactNode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Birth certificate (0–17)"
          value={`${c017.birth_cert_pct}%`}
          sub={`${c017.birth_cert_yes.toLocaleString()} of ${c017.total.toLocaleString()} children`}
          icon={<FileCheck size={18} />}
          accent={BRAND}
        />
        <KpiCard
          label="NIN registration (0–17)"
          value={`${c017.nin_pct}%`}
          sub={`${c017.nin_yes.toLocaleString()} children with NIN`}
          icon={<CreditCard size={18} />}
          accent={NSR}
        />
        <KpiCard
          label="Dual documented (both)"
          value={`${c017.both_pct}%`}
          sub={`${c017.both.toLocaleString()} with cert + NIN`}
          icon={<CheckCircle2 size={18} />}
          accent={EMERALD}
        />
        <KpiCard
          label="Unregistered (neither)"
          value={`${c017.neither_pct}%`}
          sub={`${c017.neither.toLocaleString()} lacking both documents`}
          icon={<ShieldAlert size={18} />}
          accent={UPD}
        />
      </div>

      {/* Dedicated page map */}
      <div className="space-y-3">
        <div className="flex items-center justify-between bg-surface-light dark:bg-surface-dark p-3 rounded-xl border border-line-light dark:border-line-dark">
          <span className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
            Civil Registration map
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMapMetric("birth_cert")}
              className={
                mapMetric === "birth_cert"
                  ? "px-3 py-1 text-xs font-medium rounded-lg bg-brand-600 text-white shadow-sm"
                  : "px-3 py-1 text-xs font-medium rounded-lg text-ink-muted dark:text-ink-onDarkMuted hover:bg-black/5 dark:hover:bg-white/5"
              }
            >
              Birth cert %
            </button>
            <button
              type="button"
              onClick={() => setMapMetric("nin")}
              className={
                mapMetric === "nin"
                  ? "px-3 py-1 text-xs font-medium rounded-lg bg-brand-600 text-white shadow-sm"
                  : "px-3 py-1 text-xs font-medium rounded-lg text-ink-muted dark:text-ink-onDarkMuted hover:bg-black/5 dark:hover:bg-white/5"
              }
            >
              NIN %
            </button>
          </div>
        </div>
        <DrilldownMap
          data={data}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter}
          metric={mapMetric}
          height={400}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Documentation status (children 0–17)"
          takeaway="4-way cross-tab: both · cert only · NIN only · neither"
          height={320}
          accent={c017.neither_pct > 50 ? "bad" : "neutral"}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={crossTabData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {crossTabData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number, _n, item) => {
                  const p = (item as { payload?: { pct?: number } })?.payload;
                  return [
                    `${Number(val).toLocaleString()} (${p?.pct ?? 0}%)`,
                    "",
                  ];
                }}
              />
              <Legend
                verticalAlign="bottom"
                formatter={(v) => (
                  <span className="text-xs text-ink-primary dark:text-ink-onDark">
                    {v}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Coverage by gender and age"
          takeaway="Birth certificate and NIN rates for boys and girls, 0–5 and 0–17"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genderData}
              margin={{ top: 16, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="group"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                unit="%"
                domain={[0, 100]}
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number) => [`${val}%`, ""]}
              />
              <Legend
                verticalAlign="top"
                align="right"
                formatter={(v) => (
                  <span className="text-xs text-ink-primary dark:text-ink-onDark">
                    {v}
                  </span>
                )}
              />
              <Bar
                dataKey="Birth Cert %"
                fill={BRAND}
                radius={[4, 4, 0, 0]}
                barSize={22}
              />
              <Bar
                dataKey="NIN %"
                fill={NSR}
                radius={[4, 4, 0, 0]}
                barSize={22}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Birth certificate — with vs without (0–17)"
          takeaway="Explicit count of children without a birth certificate"
          height={280}
          accent="warn"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={certAbsence}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number, _n, item) => {
                  const p = (item as { payload?: { pct?: number } })?.payload;
                  return [
                    `${Number(val).toLocaleString()} (${p?.pct ?? 0}%)`,
                    "",
                  ];
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={26}>
                <Cell fill={EMERALD} />
                <Cell fill={DANGER} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="NIN — with vs without (0–17)"
          takeaway="Explicit count of children without a registered NIN"
          height={280}
          accent="warn"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ninAbsence}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 8, bottom: 4 }}
            >
              <XAxis
                type="number"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                width={150}
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
                formatter={(val: number, _n, item) => {
                  const p = (item as { payload?: { pct?: number } })?.payload;
                  return [
                    `${Number(val).toLocaleString()} (${p?.pct ?? 0}%)`,
                    "",
                  ];
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={26}>
                <Cell fill={SKY} />
                <Cell fill={AMBER} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default CivilRegistration;
