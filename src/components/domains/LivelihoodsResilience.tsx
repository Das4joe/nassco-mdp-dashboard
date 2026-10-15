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
import KpiCard from "../KpiCard";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import { Briefcase, UserX, Home, AlertTriangle, Users } from "lucide-react";

interface Props {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const LivelihoodsResilience: React.FC<Props> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const rec = (record || {}) as any;
  const ext = rec.extended || {};
  const liv =
    ext.livelihoods_resilience_v2 || ext.livelihoods || rec.livelihoods || {};

  const femaleHeaded = Number(liv.female_headed_hhs ?? 0);
  const youthEmployed = Number(liv.youth_employed ?? 0);
  const youthUnemployed = Number(liv.youth_unemployed ?? 0);
  const shockProne = Number(liv.shock_prone_hhs ?? 0);
  const childrenInRisk = Number(liv.children_in_risk_hhs ?? 0);

  // --- NEW: Household cross-tab data ---
  const hhCross = ext.hh_cross ?? rec.hh_cross ?? null;

  const femaleHeadedShock = Number(hhCross?.female_headed_shock ?? 0);
  const disabilityShock = Number(hhCross?.disability_shock ?? 0);
  const multiVulnerable = Number(hhCross?.multi_vulnerable ?? 0);

  const totalHh = Number(
    rec.total_households ?? rec.nsr?.total_households ?? 0,
  );

  const femaleShockPct =
    femaleHeaded > 0
      ? ((femaleHeadedShock / femaleHeaded) * 100).toFixed(1)
      : "0.0";

  const disabilityShockPct =
    shockProne > 0 ? ((disabilityShock / shockProne) * 100).toFixed(1) : "0.0";

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
          Livelihoods
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Female-Headed Households"
            value={femaleHeaded.toLocaleString()}
            icon={<Home size={16} />}
            accent="#7C3AED"
          />
          <KpiCard
            label="Youth Employment"
            value={youthEmployed.toLocaleString()}
            icon={<Briefcase size={16} />}
            accent="#059669"
          />
          <KpiCard
            label="Youth Unemployment"
            value={youthUnemployed.toLocaleString()}
            icon={<UserX size={16} />}
            accent="#DC2626"
          />
          <KpiCard
            label="Shock-Prone Households"
            value={shockProne.toLocaleString()}
            icon={<AlertTriangle size={16} />}
            accent="#D97706"
          />
          <KpiCard
            label="Children in Risk-Prone Households"
            value={childrenInRisk.toLocaleString()}
            icon={<Users size={16} />}
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
          <ChartCard title="Children in Risk-Prone Households" height={260}>
            <div className="h-full min-h-[180px] flex items-center justify-center text-3xl font-bold text-emerald-400">
              {childrenInRisk.toLocaleString()}
            </div>
          </ChartCard>

          {/* Female-headed x Shock-prone */}
          <ChartCard
            title="Female-headed households (shock prone)"
            height={260}
          >
            {hhCross ? (
              <div className="h-full flex flex-col items-center justify-center p-4 space-y-2">
                <div className="text-4xl font-black text-purple-400">
                  {femaleHeadedShock.toLocaleString()}
                </div>
                <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted text-center">
                  {femaleShockPct}% of {femaleHeaded.toLocaleString()}{" "}
                  female-headed HHs
                </div>
                <div style={{ width: "100%", height: 80 }}>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart
                      data={[
                        { label: "Shock-prone", count: femaleHeadedShock },
                        {
                          label: "Other FHH",
                          count: Math.max(0, femaleHeaded - femaleHeadedShock),
                        },
                      ]}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 5, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="label"
                        type="category"
                        width={85}
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        <Cell fill="#7C3AED" />
                        <Cell fill="#CBD5E1" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[180px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
                Cross-tabulation will appear after running the updated
                aggregator.
              </div>
            )}
          </ChartCard>

          {/* Disability x Shock-prone */}
          <ChartCard
            title="Households with disabilities (shock prone)"
            height={260}
          >
            {hhCross ? (
              <div className="h-full flex flex-col items-center justify-center p-4 space-y-2">
                <div className="text-4xl font-black text-amber-400">
                  {disabilityShock.toLocaleString()}
                </div>
                <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted text-center">
                  {disabilityShockPct}% of {shockProne.toLocaleString()}{" "}
                  shock-prone HHs also have a disabled member
                </div>
                <div style={{ width: "100%", height: 80 }}>
                  <ResponsiveContainer width="100%" height={80}>
                    <BarChart
                      data={[
                        { label: "Disability+Shock", count: disabilityShock },
                        {
                          label: "Shock only",
                          count: Math.max(0, shockProne - disabilityShock),
                        },
                      ]}
                      layout="vertical"
                      margin={{ top: 0, right: 10, left: 5, bottom: 0 }}
                    >
                      <XAxis type="number" hide />
                      <YAxis
                        dataKey="label"
                        type="category"
                        width={100}
                        tick={{ fill: "#94a3b8", fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip contentStyle={tooltipStyle} />
                      <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                        <Cell fill="#D97706" />
                        <Cell fill="#CBD5E1" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[180px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
                Disability x shock cross-tab will appear after running the
                updated aggregator.
              </div>
            )}
          </ChartCard>

          {/* Multiple vulnerable members */}
          <ChartCard
            title="Households with multiple vulnerable members"
            height={260}
          >
            {hhCross ? (
              <div className="h-full flex flex-col items-center justify-center p-4 space-y-2">
                <div className="text-4xl font-black text-red-400">
                  {multiVulnerable.toLocaleString()}
                </div>
                <div className="text-xs text-ink-muted dark:text-ink-onDarkMuted text-center">
                  HHs with 2+ vulnerable members (disabled, chronically ill,
                  pregnant, lactating, or under-5)
                </div>
                <div className="text-[10px] text-ink-faint dark:text-ink-onDarkMuted text-center mt-1">
                  {totalHh > 0
                    ? `${((multiVulnerable / totalHh) * 100).toFixed(1)}% of ${totalHh.toLocaleString()} total HHs`
                    : ""}
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[180px] flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
                Multiple vulnerability counts will appear after running the
                updated aggregator.
              </div>
            )}
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default LivelihoodsResilience;
