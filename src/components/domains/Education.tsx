import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import { useChartTheme } from "../../lib/useChartTheme";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";

interface EducationProps {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const Education: React.FC<EducationProps> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const theme = useChartTheme();

  const labelVal = {
    position: "top" as const,
    fill: theme?.axisTick || "#94a3b8",
    fontSize: 10,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };

  const labelValH = {
    position: "right" as const,
    fill: theme?.axisTick || "#94a3b8",
    fontSize: 10,
    formatter: (v: number) => (v > 0 ? v.toLocaleString() : ""),
  };

  const rec = (record || {}) as any;
  const ext = rec.extended || {};

  const edu = ext.education_v2 ??
    rec.education ?? {
      oos_6_17: { oos: 0, male: { oos: 0 }, female: { oos: 0 } },
      oos_6_9: { oos: 0, male: { oos: 0 }, female: { oos: 0 } },
      oos_10_14: { oos: 0, male: { oos: 0 }, female: { oos: 0 } },
      oos_15_17: { oos: 0, male: { oos: 0 }, female: { oos: 0 } },
      disabled_children: { oos: 0 },
    };

  const oos617Male = edu?.oos_6_17?.male?.oos ?? 0;
  const oos617Female = edu?.oos_6_17?.female?.oos ?? 0;

  const oos69Total = edu?.oos_6_9?.oos ?? 0;
  const oos69Male = edu?.oos_6_9?.male?.oos ?? 0;
  const oos69Female = edu?.oos_6_9?.female?.oos ?? 0;

  const oos1014Total = edu?.oos_10_14?.oos ?? 0;
  const oos1014Male = edu?.oos_10_14?.male?.oos ?? 0;
  const oos1014Female = edu?.oos_10_14?.female?.oos ?? 0;

  const oos1517Total = edu?.oos_15_17?.oos ?? 0;
  const oos1517Male = edu?.oos_15_17?.male?.oos ?? 0;
  const oos1517Female = edu?.oos_15_17?.female?.oos ?? 0;

  const disabledChildrenOos = edu?.disabled_children?.oos ?? 0;

  const genderNotAttendingData = [
    { gender: "Boys not attending (0-17)", count: oos617Male },
    { gender: "Girls not attending (0-17)", count: oos617Female },
  ];

  // --- NEW: Disabled never enrolled by gender ---
  const disabledByGender =
    ext.disabled_never_enrolled_by_gender ??
    rec.disabled_never_enrolled_by_gender ??
    null;

  const disabledOosGenderData = disabledByGender
    ? [
        {
          gender: "Boys",
          count: Number(disabledByGender.boys ?? 0),
        },
        {
          gender: "Girls",
          count: Number(disabledByGender.girls ?? 0),
        },
      ]
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Education
          </h2>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Indicator
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              l: "Out-of-School Children/Never Enrolled (6-9)",
              v: oos69Total,
              c: "#E67E22",
            },
            {
              l: "Out-of-School Children/Never Enrolled (10-14)",
              v: oos1014Total,
              c: "#0284C7",
            },
            {
              l: "Out-of-School Children/Never Enrolled (15-17)",
              v: oos1517Total,
              c: "#128C7E",
            },
            {
              l: "Children with disabilities never enrolled (0-17)",
              v: disabledChildrenOos,
              c: "#075E54",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-lg p-3 shadow-sm flex flex-col justify-between"
            >
              <div className="text-[10px] uppercase font-bold text-ink-muted dark:text-ink-onDarkMuted mb-2 leading-tight">
                {item.l}
              </div>
              <div className="text-xl font-black" style={{ color: item.c }}>
                {item.v.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs font-semibold text-ink-primary dark:text-ink-onDark">
          Out-of-School Rate Map
        </div>
        <DrilldownMap
          data={data}
          path={path}
          onPathChange={onPathChange}
          selectedStateFilter={stateFilter}
          metric="out_of_school"
          height={400}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Out-of-School Children/Never Enrolled (6-9)"
          height={280}
        >
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { gender: "Boys", count: oos69Male },
                  { gender: "Girls", count: oos69Female },
                ]}
                margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
              >
                <XAxis
                  dataKey="gender"
                  tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={theme?.tooltip} />
                <Bar
                  dataKey="count"
                  fill="#E67E22"
                  radius={[4, 4, 0, 0]}
                  label={labelVal}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Out-of-School Children/Never Enrolled (10-14)"
          height={280}
        >
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { gender: "Boys", count: oos1014Male },
                  { gender: "Girls", count: oos1014Female },
                ]}
                margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
              >
                <XAxis
                  dataKey="gender"
                  tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={theme?.tooltip} />
                <Bar
                  dataKey="count"
                  fill="#0284C7"
                  radius={[4, 4, 0, 0]}
                  label={labelVal}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard
          title="Out-of-School Children/Never Enrolled (15-17)"
          height={280}
        >
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { gender: "Boys", count: oos1517Male },
                  { gender: "Girls", count: oos1517Female },
                ]}
                margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
              >
                <XAxis
                  dataKey="gender"
                  tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={theme?.tooltip} />
                <Bar
                  dataKey="count"
                  fill="#128C7E"
                  radius={[4, 4, 0, 0]}
                  label={labelVal}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Boys/Girls not attending (0-17)" height={280}>
          <div style={{ width: "100%", height: 220 }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={genderNotAttendingData}
                layout="vertical"
                margin={{ top: 25, right: 30, left: 10, bottom: 4 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="gender"
                  type="category"
                  width={140}
                  tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip contentStyle={theme?.tooltip} />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} label={labelValH}>
                  {genderNotAttendingData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#0284C7" : "#E67E22"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Children with disabilities never enrolled (6-17)"
          height={280}
        >
          {disabledOosGenderData ? (
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={disabledOosGenderData}
                  margin={{ top: 25, right: 12, left: -8, bottom: 4 }}
                >
                  <XAxis
                    dataKey="gender"
                    tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: theme?.axisTick || "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip contentStyle={theme?.tooltip} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} label={labelVal}>
                    {disabledOosGenderData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? "#0284C7" : "#E67E22"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-full min-h-[180px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
              Gender disaggregation will appear after running the updated
              aggregator. Total: {disabledChildrenOos.toLocaleString()}
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
};

export default Education;
