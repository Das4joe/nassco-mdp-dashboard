import React from "react";
import type { GeoRecord, DrilldownPath, GeoLevel } from "../../types";
import KpiCard from "../KpiCard";
import DrilldownMap from "../DrilldownMap";
import {
  GraduationCap,
  BookOpen,
  AlertTriangle,
  UserMinus,
  HelpCircle,
} from "lucide-react";

export interface EducationProps {
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

export const Education: React.FC<EducationProps> = ({
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
      children_0_17: 57688,
      children_6_15: 37497,
      oosc_count: 12824,
      edu_never_enrolled: 8720,
      edu_dropped_out: 4104,
    };

  const commsList = communities.length > 0 ? communities : allCommunities || [];

  const schoolAgeChildren =
    activeRecord.children_6_15 ??
    Math.round((activeRecord.children_0_17 ?? 57688) * 0.65);
  const ooscCount =
    activeRecord.oosc_count ?? Math.round(schoolAgeChildren * 0.342);
  const ooscRate =
    schoolAgeChildren > 0
      ? ((ooscCount / schoolAgeChildren) * 100).toFixed(1)
      : "34.2";

  const neverEnrolled =
    activeRecord.edu_never_enrolled ?? Math.round(ooscCount * 0.68);
  const droppedOut = activeRecord.edu_dropped_out ?? ooscCount - neverEnrolled;
  const enrolledInSchool = schoolAgeChildren - ooscCount;

  return (
    <div className="space-y-6">
      {/* 4 Education KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Out-of-School Rate"
          value={`${ooscRate}%`}
          subtitle={`${ooscCount.toLocaleString()} children out of school`}
          tag="OOSC Indicator"
          accentColor="#F43F5E"
          icon={<AlertTriangle className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Never Enrolled"
          value={neverEnrolled.toLocaleString()}
          subtitle="Zero formal schooling exposure"
          tag="Critical Gap"
          accentColor="#EA580C"
          icon={<UserMinus className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="School Dropouts"
          value={droppedOut.toLocaleString()}
          subtitle="Left school before completion"
          tag="Retention Gap"
          accentColor="#F59E0B"
          icon={<HelpCircle className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Currently Enrolled"
          value={enrolledInSchool.toLocaleString()}
          subtitle={`${(100 - parseFloat(ooscRate)).toFixed(1)}% net attendance`}
          tag="Attending"
          accentColor="#2DD4BF"
          icon={<GraduationCap className="w-5 h-5" />}
          isDark={isDark}
        />
      </div>

      {/* Embedded Authentic Boundary Drilldown Map */}
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

      {/* Education Distribution Breakdown */}
      <div
        className={`p-5 rounded-2xl border ${
          isDark
            ? "bg-slate-900/90 border-slate-700/80"
            : "bg-white border-slate-200"
        } shadow-lg`}
      >
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-teal-400" />
          School-Age Children (6–15 Years) Education Status
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/30">
            <div className="text-xs font-bold text-teal-400">
              Currently in School
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {enrolledInSchool.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              {(100 - parseFloat(ooscRate)).toFixed(1)}% of cohort
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
            <div className="text-xs font-bold text-amber-400">
              Never Enrolled
            </div>
            <div className="text-2xl font-black text-white mt-1">
              {neverEnrolled.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              {((neverEnrolled / schoolAgeChildren) * 100).toFixed(1)}% of
              cohort
            </div>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30">
            <div className="text-xs font-bold text-rose-400">Dropped Out</div>
            <div className="text-2xl font-black text-white mt-1">
              {droppedOut.toLocaleString()}
            </div>
            <div className="text-xs text-slate-300 font-medium mt-1">
              {((droppedOut / schoolAgeChildren) * 100).toFixed(1)}% of cohort
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Education;
