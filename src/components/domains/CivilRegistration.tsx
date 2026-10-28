import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import type { GeoRecord, DrilldownPath } from "../../lib/types";
import type { DashboardData } from "../../lib/loadData";
import KpiCard from "../KpiCard";
import { ChartCard } from "./ChartCard";
import DrilldownMap from "../maps/DrilldownMap";
import { FileCheck, FileX, IdCard, ShieldAlert } from "lucide-react";

interface Props {
  data: DashboardData;
  record: GeoRecord;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  stateFilter?: string;
}

export const CivilRegistration: React.FC<Props> = ({
  data,
  record,
  path,
  onPathChange,
  stateFilter,
}) => {
  const rec = (record || {}) as any;
  const ext = rec.extended || {};
  const civil = ext.civil_registration || rec.civil_registration || {};

  const c017WithBc = Number(civil.c_0_17_with_bc ?? 0);
  const c05WithBc = Number(civil.c_0_5_with_bc ?? 0);
  const c017NoBc = Number(civil.c_0_17_no_bc ?? 0);
  const c05NoBc = Number(civil.c_0_5_no_bc ?? 0);
  const c017WithNin = Number(civil.c_0_17_with_nin ?? 0);
  const c05WithNin = Number(civil.c_0_5_with_nin ?? 0);
  const c017NoBcNoNin = Number(civil.c_0_17_no_bc_no_nin ?? 0);
  const c05NoBcNoNin = Number(civil.c_0_5_no_bc_no_nin ?? 0);
  const c017BcNoNin = Number(civil.c_0_17_bc_no_nin ?? 0);
  const c05BcNoNin = Number(civil.c_0_5_bc_no_nin ?? 0);
  const c017NinNoBc = Number(civil.c_0_17_nin_no_bc ?? 0);
  const c05NinNoBc = Number(civil.c_0_5_nin_no_bc ?? 0);

  const bcByGender = ext.bc_by_gender ?? rec.bc_by_gender ?? null;
  const ninByGender = ext.nin_by_gender ?? rec.nin_by_gender ?? null;

  const bcGenderData = bcByGender
    ? [
        {
          gender: "Boys",
          "With BC": Number(bcByGender.boys_with_bc ?? 0),
          "Without BC": Number(bcByGender.boys_without_bc ?? 0),
        },
        {
          gender: "Girls",
          "With BC": Number(bcByGender.girls_with_bc ?? 0),
          "Without BC": Number(bcByGender.girls_without_bc ?? 0),
        },
      ]
    : null;

  const ninGenderData = ninByGender
    ? [
        {
          gender: "Boys",
          "With NIN": Number(ninByGender.boys_with_nin ?? 0),
          "Without NIN": Number(ninByGender.boys_without_nin ?? 0),
        },
        {
          gender: "Girls",
          "With NIN": Number(ninByGender.girls_with_nin ?? 0),
          "Without NIN": Number(ninByGender.girls_without_nin ?? 0),
        },
      ]
    : null;

  const children017 = Number(rec.children_0_17 ?? rec.nsr?.children_0_17 ?? 0);
  const bcCoveragePct = children017 > 0 ? (c017WithBc / children017) * 100 : 0;
  const ninCoveragePct =
    children017 > 0 ? (c017WithNin / children017) * 100 : 0;

  const bcCoverageData = [
    {
      name: "BC Coverage",
      Covered: Math.round(bcCoveragePct * 10) / 10,
      Gap: Math.round((100 - bcCoveragePct) * 10) / 10,
    },
  ];

  const ninCoverageData = [
    {
      name: "NIN Coverage",
      Covered: Math.round(ninCoveragePct * 10) / 10,
      Gap: Math.round((100 - ninCoveragePct) * 10) / 10,
    },
  ];

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
          Civil Registration
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <KpiCard
            label="Children (0-17) with Birth Certificate"
            value={c017WithBc.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#059669"
          />
          <KpiCard
            label="Children (0-5) with Birth Certificate"
            value={c05WithBc.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#10B981"
          />
          <KpiCard
            label="Children (0-17) without Birth Certificate"
            value={c017NoBc.toLocaleString()}
            icon={<FileX size={16} />}
            accent="#DC2626"
          />
          <KpiCard
            label="Children (0-5) without Birth Certificate"
            value={c05NoBc.toLocaleString()}
            icon={<FileX size={16} />}
            accent="#EF4444"
          />
          <KpiCard
            label="Children (0-17) with Registered NIN"
            value={c017WithNin.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#0284C7"
          />
          <KpiCard
            label="Children (0-5) with Registered NIN"
            value={c05WithNin.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#0EA5E9"
          />
          <KpiCard
            label="Children (0-17) without Birth Certificate & NIN"
            value={c017NoBcNoNin.toLocaleString()}
            icon={<ShieldAlert size={16} />}
            accent="#B91C1C"
          />
          <KpiCard
            label="Children (0-5) without Birth Certificate & NIN"
            value={c05NoBcNoNin.toLocaleString()}
            icon={<ShieldAlert size={16} />}
            accent="#991B1B"
          />
          <KpiCard
            label="Children (0-17) with BC but no NIN"
            value={c017BcNoNin.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#D97706"
          />
          <KpiCard
            label="Children (0-5) with BC but no NIN"
            value={c05BcNoNin.toLocaleString()}
            icon={<FileCheck size={16} />}
            accent="#F59E0B"
          />
          <KpiCard
            label="Children (0-17) with NIN but no BC"
            value={c017NinNoBc.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#7C3AED"
          />
          <KpiCard
            label="Children (0-5) with NIN but no BC"
            value={c05NinNoBc.toLocaleString()}
            icon={<IdCard size={16} />}
            accent="#8B5CF6"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div
          className="xl:col-span-1 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden"
          style={{ height: 480 }}
        >
          <DrilldownMap
            data={data}
            path={path}
            onPathChange={onPathChange}
            selectedStateFilter={stateFilter}
            domain="civil"
            height={480}
          />
        </div>
        <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Birth certificate distribution by gender"
            height={280}
          >
            {bcGenderData ? (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={bcGenderData}
                    margin={{ top: 15, right: 10, left: -5, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="gender"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="With BC"
                      stackId="bc"
                      fill="#10B981"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="Without BC"
                      stackId="bc"
                      fill="#EF4444"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
                Gender-disaggregated BC data will appear after running the
                updated aggregator.
              </div>
            )}
          </ChartCard>

          <ChartCard title="NIN distribution by gender" height={280}>
            {ninGenderData ? (
              <div style={{ width: "100%", height: 220 }}>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={ninGenderData}
                    margin={{ top: 15, right: 10, left: -5, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#334155"
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="gender"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => Number(v).toLocaleString()}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar
                      dataKey="With NIN"
                      stackId="nin"
                      fill="#0EA5E9"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="Without NIN"
                      stackId="nin"
                      fill="#F97316"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl">
                Gender-disaggregated NIN data will appear after running the
                updated aggregator.
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="Birth Certificate coverage (%) among children 0-17"
            height={280}
          >
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={bcCoverageData}
                  layout="vertical"
                  margin={{ top: 15, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#334155"
                    opacity={0.3}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={90}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: any) => `${v}%`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="Covered"
                    stackId="cov"
                    fill="#10B981"
                    radius={[0, 0, 0, 0]}
                    label={{
                      position: "inside",
                      fill: "#fff",
                      fontSize: 11,
                      fontWeight: "bold",
                      formatter: (v: any) => (v > 5 ? `${v}%` : ""),
                    }}
                  />
                  <Bar
                    dataKey="Gap"
                    stackId="cov"
                    fill="#EF4444"
                    radius={[0, 4, 4, 0]}
                    label={{
                      position: "inside",
                      fill: "#fff",
                      fontSize: 11,
                      formatter: (v: any) => (v > 5 ? `${v}%` : ""),
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="NIN coverage (%) among children 0-17" height={280}>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={ninCoverageData}
                  layout="vertical"
                  margin={{ top: 15, right: 30, left: 10, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#334155"
                    opacity={0.3}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={90}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(v: any) => `${v}%`}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="Covered"
                    stackId="cov"
                    fill="#0EA5E9"
                    radius={[0, 0, 0, 0]}
                    label={{
                      position: "inside",
                      fill: "#fff",
                      fontSize: 11,
                      fontWeight: "bold",
                      formatter: (v: any) => (v > 5 ? `${v}%` : ""),
                    }}
                  />
                  <Bar
                    dataKey="Gap"
                    stackId="cov"
                    fill="#F97316"
                    radius={[0, 4, 4, 0]}
                    label={{
                      position: "inside",
                      fill: "#fff",
                      fontSize: 11,
                      formatter: (v: any) => (v > 5 ? `${v}%` : ""),
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

export default CivilRegistration;
