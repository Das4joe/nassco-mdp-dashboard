import React, { useMemo } from "react";
import { SummaryCards, type MetricCardItem } from "../SummaryCards";
import { NasspGisMap } from "../NasspGisMap";
import {
  getStateSummary,
  STATES_BASELINE,
  type StateSummaryItem,
} from "../../services/dataService";
import {
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  AlertOctagon,
  Activity,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export interface HealthNutritionProps {
  selectedState?: string | null;
  selectedLga?: string | null;
  onStateSelect: (stateName: string) => void;
  onLgaSelect: (lgaName: string) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export const HealthNutrition: React.FC<HealthNutritionProps> = ({
  selectedState,
  selectedLga,
  onStateSelect,
  onLgaSelect,
  onReset,
  isDarkMode = true,
}) => {
  const summary = useMemo(
    () => getStateSummary(selectedState || undefined),
    [selectedState],
  );

  const kpiCards: MetricCardItem[] = useMemo(
    () => [
      {
        id: "kpi-pregnant",
        title: "Pregnant Women",
        value: summary.pregnantWomen,
        subtitle: "Targeted for ANC & CCT",
        badge: "MATERNAL CARE",
        icon: HeartPulse,
        accentColor: "rose",
      },
      {
        id: "kpi-lactating",
        title: "Lactating Mothers",
        value: summary.lactatingMothers,
        subtitle: "Targeted for IYCF & Nutrition",
        badge: "INFANT HEALTH",
        icon: Stethoscope,
        accentColor: "teal",
      },
      {
        id: "kpi-sam",
        title: "Severe Acute Malnutrition",
        value: summary.muacSam,
        subtitle: "SAM Cases Requiring RUTF",
        badge: "3.1% SAM RATE",
        icon: AlertOctagon,
        accentColor: "rose",
      },
      {
        id: "kpi-insurance",
        title: "Health Insurance Access",
        value: `${summary.healthInsurancePct}%`,
        subtitle: "Formal or Community Scheme",
        badge: "4.2% REGISTRY AVG",
        icon: ShieldCheck,
        accentColor: "cyan",
      },
      {
        id: "kpi-nutr-serv",
        title: "Nutrition Services Access",
        value: `${summary.nutritionAccessPct}%`,
        subtitle: "Supplements & Screening",
        badge: "26.8% REGISTRY AVG",
        icon: Activity,
        accentColor: "emerald",
      },
    ],
    [summary],
  );

  const muacPieData = [
    { name: "Normal (Green)", value: summary.muacNormal, color: "#10b981" },
    { name: "MAM (Yellow)", value: summary.muacMam, color: "#f59e0b" },
    { name: "SAM (Red)", value: summary.muacSam, color: "#ef4444" },
  ];

  const stateSamComparison = useMemo(() => {
    return STATES_BASELINE.map((s: StateSummaryItem) => ({
      state: s.state,
      "SAM Cases": s.muacSam,
      "MAM Cases": s.muacMam,
    }));
  }, []);

  return (
    <div className="flex flex-col space-y-4 w-full">
      {/* Layer 1: Top 5 KPI Cards */}
      <SummaryCards cards={kpiCards} />

      {/* Layers 2 & 3: Map (55%) & Charts (45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 w-full h-[480px]">
          <NasspGisMap
            selectedState={selectedState || undefined}
            selectedLga={selectedLga || undefined}
            onStateSelect={onStateSelect}
            onLgaSelect={onLgaSelect}
            onReset={onReset}
            isDarkMode={isDarkMode}
          />
        </div>

        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-1">
              Child MUAC Nutritional Status
            </h3>
            <div className="w-full flex-1 min-h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={muacPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={55}
                    innerRadius={28}
                    paddingAngle={4}
                  >
                    {muacPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#0c221e" : "#ffffff",
                      borderColor: isDarkMode ? "#1a3d36" : "#cbd5e1",
                      color: isDarkMode ? "#ffffff" : "#0f172a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm flex-1 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-200 text-slate-800 mb-1">
              Malnutrition Cases (MAM & SAM) by State
            </h3>
            <div className="w-full flex-1 min-h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stateSamComparison}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#1a3d36" : "#e2e8f0"}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="state"
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                  />
                  <YAxis
                    stroke={isDarkMode ? "#64748b" : "#475569"}
                    fontSize={10}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDarkMode ? "#0c221e" : "#ffffff",
                      borderColor: isDarkMode ? "#1a3d36" : "#cbd5e1",
                      color: isDarkMode ? "#ffffff" : "#0f172a",
                      borderRadius: "8px",
                      fontSize: "11px",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: "10px" }} />
                  <Bar
                    dataKey="MAM Cases"
                    fill="#f59e0b"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="SAM Cases"
                    fill="#ef4444"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Priority Matrix */}
      <div className="rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b dark:border-[#1a3d36] border-slate-200 dark:bg-[#132c26] bg-slate-50">
          <h3 className="text-xs font-bold uppercase tracking-wider dark:text-slate-100 text-slate-800">
            Health & Nutrition Intervention Priority by State
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="dark:bg-[#0f2823] bg-slate-100 dark:text-slate-300 text-slate-700 font-bold border-b dark:border-[#1a3d36] border-slate-200">
              <tr>
                <th className="px-4 py-2.5">Pilot State</th>
                <th className="px-4 py-2.5 text-right">Pregnant Women</th>
                <th className="px-4 py-2.5 text-right">Lactating Mothers</th>
                <th className="px-4 py-2.5 text-right">MUAC SAM Cases</th>
                <th className="px-4 py-2.5 text-right">MUAC MAM Cases</th>
                <th className="px-4 py-2.5 text-right">Insurance %</th>
                <th className="px-4 py-2.5 text-right">Nutrition Access %</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-[#1a3d36] divide-slate-100 dark:text-slate-200 text-slate-800 font-medium">
              {STATES_BASELINE.map((st: StateSummaryItem) => (
                <tr
                  key={st.code}
                  onClick={() => onStateSelect(st.state)}
                  className="hover:dark:bg-[#13332c] hover:bg-emerald-50/60 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-2.5 font-bold text-emerald-700 dark:text-emerald-400">
                    {st.state}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-rose-600 dark:text-rose-400">
                    {st.pregnantWomen.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-teal-600 dark:text-teal-400">
                    {st.lactatingMothers.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-red-600 dark:text-red-400">
                    {st.muacSam.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold text-amber-600 dark:text-amber-400">
                    {st.muacMam.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-semibold">
                    {st.healthInsurancePct}%
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">
                    {st.nutritionAccessPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HealthNutrition;
