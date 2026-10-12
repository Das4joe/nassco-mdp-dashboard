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
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import type { MapMetric } from "../maps/DrilldownMap";

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
    { name: "Both", value: c017.both, color: "#059669" },
    { name: "Cert Only", value: c017.cert_only, color: "#0284C7" },
    { name: "NIN Only", value: c017.nin_only, color: "#D97706" },
    { name: "Neither", value: c017.neither, color: "#DC2626" },
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
    { name: "With birth certificate", count: c017.birth_cert_yes },
    { name: "Without birth certificate", count: c017.birth_cert_no },
  ];

  const ninAbsence = [
    { name: "With registered NIN", count: c017.nin_yes },
    { name: "Without registered NIN", count: c017.nin_no },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Civil Registration (Exact Counts)
          </h2>
        </div>
      </div>

      {/* 14 Custom Indicators Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
        {[
          {
            l: "Child (0-17) w/ Birth Cert",
            v: c017.birth_cert_yes,
            c: "#059669",
          },
          {
            l: "Child (0-5) w/ Birth Cert",
            v: c05.birth_cert_yes,
            c: "#059669",
          },
          {
            l: "Child (0-17) w/out Birth Cert",
            v: c017.birth_cert_no,
            c: "#DC2626",
          },
          {
            l: "Child (0-5) w/out Birth Cert",
            v: c05.birth_cert_no,
            c: "#DC2626",
          },
          { l: "Child (0-17) w/ NIN", v: c017.nin_yes, c: "#0284C7" },
          { l: "Child (0-5) w/ NIN", v: c05.nin_yes, c: "#0284C7" },
          { l: "Child (0-17) w/out NIN", v: c017.nin_no, c: "#D97706" },
          { l: "Child (0-5) w/out NIN", v: c05.nin_no, c: "#D97706" },
          { l: "Child (0-17) No BC, No NIN", v: c017.neither, c: "#991B1B" },
          { l: "Child (0-5) No BC, No NIN", v: c05.neither, c: "#991B1B" },
          {
            l: "Child (0-17) BC only, No NIN",
            v: c017.cert_only,
            c: "#10B981",
          },
          { l: "Child (0-5) BC only, No NIN", v: c05.cert_only, c: "#10B981" },
          { l: "Child (0-17) NIN only, No BC", v: c017.nin_only, c: "#3B82F6" },
          { l: "Child (0-5) NIN only, No BC", v: c05.nin_only, c: "#3B82F6" },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-lg p-3 shadow-sm"
          >
            <div className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-onDarkMuted mb-1 line-clamp-2">
              {item.l}
            </div>
            <div className="text-lg font-black" style={{ color: item.c }}>
              {item.v.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3 mt-4">
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
        <ChartCard
          title="Birth certificate — with vs without (0-17)"
          height={280}
        >
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
              <Tooltip contentStyle={theme.tooltip} />
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
        <ChartCard title="NIN — with vs without (0-17)" height={280}>
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
              <Tooltip contentStyle={theme.tooltip} />
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
