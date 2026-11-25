import React from "react";
import type { GeoRecord, DrilldownPath, GeoLevel } from "../../types";
import KpiCard from "../KpiCard";
import DrilldownMap from "../DrilldownMap";
import { FileCheck, FileX, CreditCard, Baby, UserX } from "lucide-react";

export interface CivilRegistrationProps {
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

export const CivilRegistration: React.FC<CivilRegistrationProps> = ({
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
      birth_cert_has: 22152,
      nin_has: 40493,
    };

  const commsList = communities.length > 0 ? communities : allCommunities || [];

  const individuals =
    activeRecord.total_individuals ?? activeRecord.individuals ?? 138676;
  const children = activeRecord.children_0_17 ?? 57688;

  // Birth Certificate metrics
  const birthCertHas =
    activeRecord.birth_cert_has ?? Math.round(children * 0.384);
  const birthCertNo = children - birthCertHas;
  const birthCertCoveragePct =
    children > 0 ? ((birthCertHas / children) * 100).toFixed(1) : "38.4";

  // National Identity Number (NIN) metrics
  const ninHas = activeRecord.nin_has ?? Math.round(individuals * 0.292);
  const ninNo = individuals - ninHas;
  const ninCoveragePct =
    individuals > 0 ? ((ninHas / individuals) * 100).toFixed(1) : "29.2";

  return (
    <div className="space-y-6">
      {/* 4 Core Registration KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Birth Certificate Rate"
          value={`${birthCertCoveragePct}%`}
          subtitle={`${birthCertHas.toLocaleString()} registered children`}
          tag="NPC Registered"
          accentColor="#2DD4BF"
          icon={<Baby className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Children Unregistered"
          value={birthCertNo.toLocaleString()}
          subtitle={`${(100 - parseFloat(birthCertCoveragePct)).toFixed(1)}% lack birth certificates`}
          tag="Identity Gap"
          accentColor="#F43F5E"
          icon={<FileX className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="NIN Ownership Rate"
          value={`${ninCoveragePct}%`}
          subtitle={`${ninHas.toLocaleString()} with valid NIN`}
          tag="NIMC Enrolled"
          accentColor="#38BDF8"
          icon={<CreditCard className="w-5 h-5" />}
          isDark={isDark}
        />
        <KpiCard
          title="Population Without NIN"
          value={ninNo.toLocaleString()}
          subtitle={`${(100 - parseFloat(ninCoveragePct)).toFixed(1)}% excluded from social registry ID`}
          tag="Social Exclusion"
          accentColor="#F59E0B"
          icon={<UserX className="w-5 h-5" />}
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

      {/* Gap Analysis Visual Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Birth Registration Status Breakdown */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200"
          } shadow-lg`}
        >
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
            <FileCheck className="w-4 h-4 text-teal-400" />
            Child Birth Registration (Under-18)
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-teal-400">Has NPC Birth Certificate</span>
                <span className="text-slate-200">
                  {birthCertHas.toLocaleString()} ({birthCertCoveragePct}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-teal-400 rounded-full"
                  style={{ width: `${birthCertCoveragePct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-rose-400">No Birth Certificate</span>
                <span className="text-slate-200">
                  {birthCertNo.toLocaleString()} (
                  {(100 - parseFloat(birthCertCoveragePct)).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full"
                  style={{
                    width: `${100 - parseFloat(birthCertCoveragePct)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* National Identity Number (NIN) Breakdown */}
        <div
          className={`p-5 rounded-2xl border ${
            isDark
              ? "bg-slate-900/80 border-slate-800"
              : "bg-white border-slate-200"
          } shadow-lg`}
        >
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-sky-400" />
            National Identification Number (NIN) Coverage
          </h3>
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-sky-400">Enrolled with Valid NIN</span>
                <span className="text-slate-200">
                  {ninHas.toLocaleString()} ({ninCoveragePct}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-400 rounded-full"
                  style={{ width: `${ninCoveragePct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-400">No NIN Enrolment</span>
                <span className="text-slate-200">
                  {ninNo.toLocaleString()} (
                  {(100 - parseFloat(ninCoveragePct)).toFixed(1)}%)
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${100 - parseFloat(ninCoveragePct)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CivilRegistration;
