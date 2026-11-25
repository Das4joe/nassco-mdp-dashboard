import React from "react";
import type { GeoRecord, DrilldownPath, GeoLevel } from "../../types";
import KpiCard from "../KpiCard";
import DrilldownMap from "../DrilldownMap";
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  AlertCircle,
  UtensilsCrossed,
} from "lucide-react";

export interface HealthNutritionProps {
  record?: GeoRecord;
  currentRecord?: GeoRecord;
  drilldown?: DrilldownPath;
  selectedState?: string | null;
  selectedLga?: string | null;
  states?: GeoRecord[];
  communities?: GeoRecord[];
  allCommunities?: GeoRecord[];
  onSelectLocation?: (name: string, level: GeoLevel | any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
}

export const HealthNutrition: React.FC<HealthNutritionProps> = ({
  record,
  currentRecord,
  drilldown = { state: null, lga: null, community: null },
  selectedState,
  selectedLga,
  states = [],
  communities = [],
  allCommunities,
  onSelectLocation,
  onDrilldownChange,
  isDark = true,
}) => {
  const activeRecord: GeoRecord = record ||
    currentRecord || {
      total_individuals: 138676,
      children_0_17: 57688,
      children_under_5: 18460,
      muac_red_sam: 886,
      muac_yellow_mam: 2289,
      chronic_illness_count: 11926,
      health_insurance_count: 5824,
    };

  const commsList = communities.length > 0 ? communities : allCommunities || [];

  const individuals =
    activeRecord.total_individuals ?? activeRecord.individuals ?? 138676;
  const under5 =
    activeRecord.children_under_5 ??
    Math.round((activeRecord.children_0_17 ?? 57688) * 0.32);

  // MUAC malnutrition counts
  const sam = activeRecord.muac_red_sam ?? Math.round(under5 * 0.048);
  const mam = activeRecord.muac_yellow_mam ?? Math.round(under5 * 0.124);
  const normal = under5 - sam - mam;

  // Chronic Illness & Insurance
  const chronicIll =
    activeRecord.chronic_illness_count ?? Math.round(individuals * 0.086);
  const healthInsured =
    activeRecord.health_insurance_count ?? Math.round(individuals * 0.042);

  return (
    <div className="space-y-6">
      {/* 4 Health & Nutrition KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Severe Malnutrition (SAM)"
          value={sam.toLocaleString()}
          subtitle="MUAC Red Flag (<115mm)"
          tag="Critical Urgent"
          accentColor="#F43F5E"
          icon={<AlertCircle className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Moderate Malnutrition (MAM)"
          value={mam.toLocaleString()}
          subtitle="MUAC Yellow Flag (115-125mm)"
          tag="At Risk"
          accentColor="#F59E0B"
          icon={<Activity className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Chronic Illness Rate"
          value={`${((chronicIll / individuals) * 100).toFixed(1)}%`}
          subtitle={`${chronicIll.toLocaleString()} individuals with chronic diseases`}
          tag="Health Burden"
          accentColor="#38BDF8"
          icon={<HeartPulse className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Health Insurance"
          value={`${((healthInsured / individuals) * 100).toFixed(1)}%`}
          subtitle="Only minimal NHIS/State scheme coverage"
          tag="Safety Net Gap"
          accentColor="#2DD4BF"
          icon={<ShieldCheck className="w-5 h-5" />}
          isDark={isDark}
        />
      </div>

      {/* Embedded Vector Drilldown Map */}
      <div className="w-full">
        <DrilldownMap
          record={activeRecord}
          currentRecord={activeRecord}
          selectedState={selectedState || drilldown.state}
          selectedLga={selectedLga || drilldown.lga}
          drilldown={drilldown}
          states={states}
          communities={commsList}
          onSelectLocation={onSelectLocation}
          onDrilldownChange={onDrilldownChange}
          isDark={isDark}
        />
      </div>

      {/* MUAC Nutrition Status Bar */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark
            ? "bg-slate-900/80 border-slate-800"
            : "bg-white border-slate-200"
        } shadow-lg`}
      >
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
          <UtensilsCrossed className="w-4 h-4 text-teal-400" />
          Under-5 MUAC Nutrition Screening Distribution (
          {under5.toLocaleString()} children)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="text-xs font-semibold text-emerald-400">
              Normal (Green / &gt;125mm)
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {normal.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {((normal / under5) * 100).toFixed(1)}% screened normal
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <div className="text-xs font-semibold text-amber-400">
              MAM (Yellow / 115–125mm)
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {mam.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {((mam / under5) * 100).toFixed(1)}% moderate risk
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20">
            <div className="text-xs font-semibold text-rose-400">
              SAM (Red / &lt;115mm)
            </div>
            <div className="text-2xl font-bold text-white mt-1">
              {sam.toLocaleString()}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {((sam / under5) * 100).toFixed(1)}% severe acute
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthNutrition;
