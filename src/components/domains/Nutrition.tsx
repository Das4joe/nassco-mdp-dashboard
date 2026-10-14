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
            label="Children Moderately Acute Malnutrition - MAM"
            value={mam.toLocaleString()}
            icon={<Activity size={16} />}
            accent="#F59E0B"
          />
          <KpiCard
            label="Children Moderately Acute Malnutrition - Normal"
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
            metric="vulnerability"
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
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                  />
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
            title="Children with Malnutrition enrolled into food and nutrition programmes"
            height={300}
          >
            <div className="h-full min-h-[200px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Enrolment into food and nutrition programmes is not captured in
              the current survey wave.
            </div>
          </ChartCard>
          <ChartCard
            title="Children with Malnutrition not enrolled into food and nutrition programmes"
            height={300}
          >
            <div className="h-full min-h-[200px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
              Enrolment status for malnutrition programmes is not captured in
              the current survey wave.
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Nutrition;
