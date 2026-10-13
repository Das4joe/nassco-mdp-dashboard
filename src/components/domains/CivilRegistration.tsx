import { useState, type FC } from "react";
import {
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

  const civil = record.extended.civil_registration;
  const c017 = civil?.children_0_17 ?? {
    total: 1,
    birth_cert_yes: 0,
    birth_cert_no: 0,
    nin_yes: 0,
    nin_no: 0,
    both: 0,
    cert_only: 0,
    nin_only: 0,
    neither: 0,
    by_gender: {
      male: { birth_cert_yes: 0, nin_yes: 0 },
      female: { birth_cert_yes: 0, nin_yes: 0 },
    },
  };
  const c05 = civil?.children_0_5 ?? {
    total: 1,
    birth_cert_yes: 0,
    birth_cert_no: 0,
    nin_yes: 0,
    nin_no: 0,
    neither: 0,
    cert_only: 0,
    nin_only: 0,
  };

  const genderBcData = [
    {
      name: "Boys",
      value: c017.by_gender?.male.birth_cert_yes ?? 0,
      color: "#0284C7",
    },
    {
      name: "Girls",
      value: c017.by_gender?.female.birth_cert_yes ?? 0,
      color: "#E67E22",
    },
  ];

  const genderNinData = [
    {
      name: "Boys",
      value: c017.by_gender?.male.nin_yes ?? 0,
      color: "#0284C7",
    },
    {
      name: "Girls",
      value: c017.by_gender?.female.nin_yes ?? 0,
      color: "#E67E22",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-line-light dark:border-line-dark">
        <div>
          <h2 className="text-xl font-bold text-ink-primary dark:text-ink-onDark">
            Civil Registration
          </h2>
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-ink-muted dark:text-ink-onDarkMuted mb-3">
          Indicator
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {[
            {
              l: "Children (0-17) with birth certificate",
              v: c017.birth_cert_yes,
              c: "#059669",
            },
            {
              l: "Children (0-5) with birth certificate",
              v: c05.birth_cert_yes,
              c: "#059669",
            },
            {
              l: "Children (0-17) without birth certificate",
              v: c017.birth_cert_no,
              c: "#DC2626",
            },
            {
              l: "Children (0-5) without birth certificate",
              v: c05.birth_cert_no,
              c: "#DC2626",
            },
            {
              l: "Children (0-17) with registered NIN",
              v: c017.nin_yes,
              c: "#0284C7",
            },
            {
              l: "Children (0-5) with registered NIN",
              v: c05.nin_yes,
              c: "#0284C7",
            },
            {
              l: "Children (0-17) without registered NIN",
              v: c017.nin_no,
              c: "#D97706",
            },
            {
              l: "Children (0-5) without registered NIN",
              v: c05.nin_no,
              c: "#D97706",
            },
            {
              l: "Children (0-17) without birth certificate & registered NIN",
              v: c017.neither,
              c: "#991B1B",
            },
            {
              l: "Children (0-5) without birth certificate & registered NIN",
              v: c05.neither,
              c: "#991B1B",
            },
            {
              l: "Children (0-17) with birth certifcate but no registered NIN",
              v: c017.cert_only,
              c: "#10B981",
            },
            {
              l: "Children (0-5) with birth certifcate but no registered NIN",
              v: c05.cert_only,
              c: "#10B981",
            },
            {
              l: "Children (0-17) with registered NIN but no birth certifcate",
              v: c017.nin_only,
              c: "#3B82F6",
            },
            {
              l: "Children (0-5) with registered NIN but no birth certifcate",
              v: c05.nin_only,
              c: "#3B82F6",
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
        <ChartCard
          title="Birth certificate distribution by gender"
          height={320}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderBcData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {genderBcData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => v.toLocaleString()}
                contentStyle={theme.tooltip}
              />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="NIN distribution by gender" height={320}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={genderNinData}
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {genderNinData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number) => v.toLocaleString()}
                contentStyle={theme.tooltip}
              />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Birth Certificate coverage (%) among children"
          height={280}
        >
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            5-Year age band disaggregation (0-4, 5-9...) is not captured in the
            current JSON export for this indicator.
          </div>
        </ChartCard>
        <ChartCard title="NIN coverage (%) among children" height={280}>
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            5-Year age band disaggregation (0-4, 5-9...) is not captured in the
            current JSON export for this indicator.
          </div>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Children (0-17) without birth certificate & registered NIN"
          height={280}
        >
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Age range disaggregation not available. Total combined count:{" "}
            {c017.neither.toLocaleString()}
          </div>
        </ChartCard>
        <ChartCard
          title="Children (0-5) without birth certificate & registered NIN"
          height={280}
        >
          <div className="h-full flex items-center justify-center p-6 text-center text-xs text-ink-muted italic border-2 border-dashed border-line-light dark:border-line-dark rounded-xl bg-surface-page/50">
            Age range disaggregation not available. Total combined count:{" "}
            {c05.neither.toLocaleString()}
          </div>
        </ChartCard>
      </div>
    </div>
  );
};
export default CivilRegistration;
