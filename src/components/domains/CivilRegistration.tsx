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

interface CivilRegistrationProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
  states?: GeoRecord[];
  national?: GeoRecord;
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

  const pctFormatter = (v: number) => (v > 0 ? `${v.toFixed(1)}%` : "");
  const valFormatter = (v: number) => (v > 0 ? v.toLocaleString() : "");
  const labelPct = {
    position: "top" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: pctFormatter,
  };
  const labelValH = {
    position: "right" as const,
    fill: theme.axisTick,
    fontSize: 11,
    formatter: valFormatter,
  };

  const civil = record.extended.civil_registration;
  const c017 = civil?.children_0_17 ?? {
    total: 1,
    birth_cert_yes: 0,
    birth_cert_no: 0,
    birth_cert_pct: 0,
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
  const c05 = civil?.children_0_5 ?? {
    total: 1,
    birth_cert_yes: 0,
    birth_cert_no: 0,
    birth_cert_pct: 0,
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
    { name: "Both", value: c017.both, pct: c017.both_pct, color: "#059669" },
    {
      name: "Cert Only",
      value: c017.cert_only,
      pct: c017.cert_only_pct,
      color: "#0284C7",
    },
    {
      name: "NIN Only",
      value: c017.nin_only,
      pct: c017.nin_only_pct,
      color: "#D97706",
    },
    {
      name: "Neither",
      value: c017.neither,
      pct: c017.neither_pct,
      color: "#DC2626",
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
      count: c017.birth_cert_no,
      pct: Math.round((100 - c017.birth_cert_pct) * 10) / 10,
    },
  ];

  const ninAbsence = [
    { name: "With registered NIN", count: c017.nin_yes, pct: c017.nin_pct },
    {
      name: "Without registered NIN",
      count: c017.nin_no,
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
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Birth cert (0–17)"
          value={`${c017.birth_cert_pct}%`}
          icon={<FileCheck size={18} />}
          accent="#075E54"
        />
        <KpiCard
          label="NIN reg (0–17)"
          value={`${c017.nin_pct}%`}
          icon={<CreditCard size={18} />}
          accent="#128C7E"
        />
        <KpiCard
          label="Dual documented"
          value={`${c017.both_pct}%`}
          icon={<CheckCircle2 size={18} />}
          accent="#059669"
        />
        <KpiCard
          label="Unregistered"
          value={`${c017.neither_pct}%`}
          icon={<ShieldAlert size={18} />}
          accent="#E67E22"
        />
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setMapMetric("birth_cert")}
            className={
              mapMetric === "birth_cert"
                ? "px-3 py-1 bg-brand-600 text-white rounded text-xs"
                : "px-3 py-1 text-ink-muted rounded text-xs border"
            }
          >
            Birth cert %
          </button>
          <button
            onClick={() => setMapMetric("nin")}
            className={
              mapMetric === "nin"
                ? "px-3 py-1 bg-brand-600 text-white rounded text-xs"
                : "px-3 py-1 text-ink-muted rounded text-xs border"
            }
          >
            NIN %
          </button>
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Documentation status (children 0–17)" height={320}>
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
              />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Coverage by gender and age" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={genderData}
              margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
            >
              <XAxis
                dataKey="group"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                unit="%"
                tick={{ fill: theme.axisTick, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={theme.tooltip}
                labelStyle={theme.tooltipLabel}
                itemStyle={theme.tooltipItem}
              />
              <Legend verticalAlign="top" align="right" />
              <Bar
                dataKey="Birth Cert %"
                fill="#075E54"
                radius={[4, 4, 0, 0]}
                label={labelPct}
              />
              <Bar
                dataKey="NIN %"
                fill="#128C7E"
                radius={[4, 4, 0, 0]}
                label={labelPct}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Birth certificate — with vs without" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={certAbsence}
              layout="vertical"
              margin={{ top: 8, right: 35, left: 8, bottom: 4 }}
            >
              <XAxis type="number" hide />
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
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} label={labelValH}>
                {certAbsence.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#059669" : "#DC2626"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="NIN — with vs without" height={280}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={ninAbsence}
              layout="vertical"
              margin={{ top: 8, right: 35, left: 8, bottom: 4 }}
            >
              <XAxis type="number" hide />
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
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} label={labelValH}>
                {ninAbsence.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === 0 ? "#0284C7" : "#D97706"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

export default CivilRegistration;
