import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import KpiCard from "../KpiCard";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import { Heart, Baby, Activity } from "lucide-react";

interface Props {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const Nutrition: React.FC<Props> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const rec = (record || {}) as any;
  const ext = rec.extended || {};
  const nut = ext.nutrition_v2 || ext.nutrition || rec.nutrition || {};
  const health = ext.health_v2 || {};

  const pregnant = Number(
    nut.pregnant_total ?? nut.pregnant_women ?? health.pregnant_total ?? 0,
  );
  const lactating = Number(
    nut.lactating_total ?? nut.lactating_mothers ?? health.lactating_total ?? 0,
  );
  const sam = Number(nut.sam_children ?? 0);
  const mam = Number(nut.mam_children ?? 0);
  const normal = Number(nut.normal_children ?? 0);

  const muacData = [
    { name: "SAM", value: sam, color: "#DC2626" },
    { name: "MAM", value: mam, color: "#F59E0B" },
    { name: "Normal", value: normal, color: "#10B981" },
  ];

  const progData = ext.nutrition_programme ?? rec.nutrition_programme ?? null;

  const progEnrolled = progData
    ? [
        {
          programme: "RUTF",
          count: Number(progData.rutf ?? 0),
        },
        {
          programme: "Food",
          count: Number(progData.food ?? 0),
        },
        {
          programme: "Cash",
          count: Number(progData.cash ?? 0),
        },
      ]
    : null;

  const totalEnrolled = Number(progData?.enrolled ?? 0);
  const totalNotEnrolled = Number(progData?.not_enrolled ?? 0);
  const totalSamMam = Number(progData?.total_sam_mam ?? 0);
  const enrolledPct =
    totalSamMam > 0 ? ((totalEnrolled / totalSamMam) * 100).toFixed(1) : "0.0";

  const tooltipStyle = {
    backgroundColor: "#0F172A",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#F8FAFC",
    fontSize: 12,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Nutrition
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Currently Pregnant"
            value={pregnant.toLocaleString()}
            icon={<Heart size={16} />}
            accent="#9333EA"
          />
          <KpiCard
            label="Lactating Mothers"
            value={lactating.toLocaleString()}
            icon={<Baby size={16} />}
            accent="#0284C7"
          />
          <KpiCard
            label="Children with Severe Acute Malnutrition - SAM"
            value={sam.toLocaleString()}
            icon={<Activity size={16} />}
            accent="#DC2626"
          />
          <KpiCard
            label="Children with Moderate Acute Malnutrition - MAM"
            value={mam.toLocaleString()}
            icon={<Activity size={16} />}
            accent="#F59E0B"
          />
          <KpiCard
            label="Children with Normal Nutrition Status"
            value={normal.toLocaleString()}
            icon={<Activity size={16} />}
            accent="#10B981"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div
          className="xl:col-span-1 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
          style={{ height: 420 }}
        >
          <DrilldownMap
            data={data}
            path={path}
            onPathChange={onPathChange}
            selectedStateFilter={stateFilter}
            domain="nutrition"
            height={420}
          />
        </div>
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard title="Children with acute malnutrition" height={300}>
            <div style={{ width: "100%", height: 230 }}>
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={muacData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 12 }}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {muacData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Malnourished children enrolled in nutrition programmes"
            height={300}
          >
            {progEnrolled ? (
              <div style={{ width: "100%", height: 230 }}>
                <div className="px-2 pt-1 pb-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">
                    {totalEnrolled.toLocaleString()}
                  </span>
                  <span className="text-xs text-ink-muted dark:text-ink-onDarkMuted">
                    of {totalSamMam.toLocaleString()} SAM+MAM ({enrolledPct}%)
                  </span>
                </div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={progEnrolled}
                    margin={{ top: 10, right: 10, left: -5, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="programme"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {progEnrolled.map((_, i) => (
                        <Cell
                          key={i}
                          fill={
                            i === 0
                              ? "#DC2626"
                              : i === 1
                                ? "#F59E0B"
                                : "#10B981"
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
                Programme enrolment data will appear after running the updated
                aggregator.
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="Malnourished children NOT enrolled in any programme"
            height={300}
          >
            {progData ? (
              <div className="h-full flex flex-col items-center justify-center p-6 space-y-3">
                <div className="text-5xl font-black text-red-400">
                  {totalNotEnrolled.toLocaleString()}
                </div>
                <div className="text-sm text-ink-muted dark:text-ink-onDarkMuted text-center">
                  of {totalSamMam.toLocaleString()} SAM+MAM children
                </div>
                <div className="text-xs text-ink-faint dark:text-ink-onDarkMuted text-center">
                  {(100 - Number(enrolledPct)).toFixed(1)}% of acutely
                  malnourished children are not receiving programme support
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[200px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
                Enrolment status will appear after running the updated
                aggregator.
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
