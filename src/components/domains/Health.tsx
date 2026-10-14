import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import KpiCard from "../KpiCard";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import { Heart, Activity, ShieldCheck, Baby } from "lucide-react";

interface Props {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const Health: React.FC<Props> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const rec = (record || {}) as any;
  const ext = rec.extended || {};
  const health =
    ext.health_v2 || ext.health_nutrition || rec.health_nutrition || {};

  const pregnant = Number(health.pregnant_total ?? health.pregnant_women ?? 0);
  const lactating = Number(
    health.lactating_total ?? health.lactating_mothers ?? 0,
  );
  const plwd = Number(health.plwd_total ?? health.plwd ?? 0);
  const childrenPlwd = Number(
    health.children_plwd ?? health.children_with_disabilities ?? 0,
  );
  const ins07Covered = Number(health.health_insurance_0_7_covered ?? 0);
  const ins07Not = Number(health.health_insurance_0_7_not_covered ?? 0);
  const ins05Covered = Number(health.health_insurance_0_5_covered ?? 0);
  const ins05Not = Number(health.health_insurance_0_5_not_covered ?? 0);

  const chart07 = [
    { name: "Covered by Health Insurance", value: ins07Covered },
    { name: "No Health Insurance Cover", value: ins07Not },
  ];
  const chart05 = [
    { name: "Covered by Health Insurance", value: ins05Covered },
    { name: "No Health Insurance Cover", value: ins05Not },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Health
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Currently Pregnant"
            value={pregnant.toLocaleString()}
            icon={<Heart size={16} />}
            accent="#9333EA"
          />
          <KpiCard
            label="Lactating Mothers"
            value={lactating.toLocaleString()}
            icon={<ShieldCheck size={16} />}
            accent="#0284C7"
          />
          <KpiCard
            label="Persons with Disabilities"
            value={plwd.toLocaleString()}
            icon={<Activity size={16} />}
            accent="#DC2626"
          />
          <KpiCard
            label="Children with Disabilities"
            value={childrenPlwd.toLocaleString()}
            icon={<Baby size={16} />}
            accent="#B91C1C"
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
          <ChartCard
            title="Children (0-7) living in household health insurance status"
            height={280}
          >
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chart07}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="value" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
          <ChartCard
            title="Children (0-5) living in household health insurance status"
            height={280}
          >
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chart05}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#334155"
                    opacity={0.3}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "#94a3b8", fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F172A",
                      border: "1px solid #334155",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="value" fill="#F87171" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default Health;
