import type React from "react";
import {
  Sun,
  Moon,
  RotateCcw,
  Layers,
  GraduationCap,
  FileCheck,
  HeartPulse,
  Accessibility,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import type { DomainId, GeoLevel, DrilldownState } from "../types";

export interface HeaderProps {
  activeDomain: DomainId;
  onDomainChange: (domain: DomainId) => void;
  drilldown?: DrilldownState;
  geoLevel?: GeoLevel;
  selectedState?: string | null;
  selectedLga?: string | null;
  selectedWard?: string | null;
  onResetGeo?: () => void;
  onReset?: () => void;
  isDark?: boolean;
  onToggleTheme?: () => void;
}

const TABS: {
  id: DomainId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Overview", icon: Layers },
  { id: "civil-registration", label: "Civil Registration", icon: FileCheck },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "health-nutrition", label: "Health & Nutrition", icon: HeartPulse },
  { id: "disabilities", label: "Disabilities", icon: Accessibility },
  {
    id: "livelihoods-resilience",
    label: "Livelihoods & Shock",
    icon: Briefcase,
  },
];

export const Header: React.FC<HeaderProps> = ({
  activeDomain,
  onDomainChange,
  drilldown,
  geoLevel: propGeoLevel,
  selectedState: propState,
  selectedLga: propLga,
  selectedWard: propWard,
  onResetGeo,
  onReset,
  isDark = true,
  onToggleTheme,
}) => {
  const level = drilldown?.level || propGeoLevel || "national";
  const state = drilldown?.state || propState;
  const lga = drilldown?.lga || propLga;
  const ward = drilldown?.ward || propWard;
  const handleReset = onResetGeo || onReset;

  return (
    <header className="sticky top-0 z-50 border-b border-[#134e4a]/50 bg-[#081514]/95 backdrop-blur shadow-lg">
      <div className="mx-auto max-w-[1720px] px-3 sm:px-4 lg:px-6">
        {/* Top Header Row */}
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-emerald-600 text-[#081514] font-black text-lg shadow-md shadow-teal-500/20">
              N
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  NASSCO Multi-Dimensional Poverty (MDP) Registry
                </h1>
                <span className="hidden sm:inline-block rounded-full bg-teal-500/20 px-2 py-0.5 text-[10px] font-semibold text-teal-300 border border-teal-500/30">
                  UNICEF Section 3 Pilot
                </span>
              </div>
              <p className="text-xs text-slate-400">
                National Social Safety Nets Project (NASSP-SU) • 4 Expansion
                States
              </p>
            </div>
          </div>

          {/* Breadcrumb Navigation & Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 text-xs bg-[#0b2422] border border-[#134e4a]/50 rounded-lg px-2.5 py-1 text-slate-300">
              <span
                className={
                  level === "national" ? "font-semibold text-teal-300" : ""
                }
              >
                Nigeria
              </span>
              {state && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                  <span
                    className={
                      level === "state" ? "font-semibold text-teal-300" : ""
                    }
                  >
                    {state}
                  </span>
                </>
              )}
              {lga && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                  <span
                    className={
                      level === "lga" ? "font-semibold text-teal-300" : ""
                    }
                  >
                    {lga}
                  </span>
                </>
              )}
              {ward && (
                <>
                  <ChevronRight className="h-3 w-3 text-slate-500" />
                  <span className="font-semibold text-teal-300">{ward}</span>
                </>
              )}
            </div>

            {level !== "national" && handleReset && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 text-xs rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2.5 py-1.5 hover:bg-teal-500/30 transition"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset View</span>
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg border border-[#134e4a]/40 bg-[#0b2422] text-slate-300 hover:text-white hover:border-teal-400"
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Thematic Tabs Navigation Bar */}
        <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-thin">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              activeDomain === tab.id ||
              (tab.id === "overview" && activeDomain === "demographics") ||
              (tab.id === "civil-registration" &&
                activeDomain === "civilRegistration") ||
              (tab.id === "health-nutrition" &&
                (activeDomain === "healthNutrition" ||
                  activeDomain === "health")) ||
              (tab.id === "disabilities" && activeDomain === "disability") ||
              (tab.id === "livelihoods-resilience" &&
                activeDomain === "livelihoods");

            return (
              <button
                key={tab.id}
                onClick={() => onDomainChange(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-3.5 py-2 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? "bg-[#2dd4bf]/20 text-[#2dd4bf] border border-[#2dd4bf]/40 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#0b2422]/60 border border-transparent"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${isActive ? "text-[#2dd4bf]" : "text-slate-400"}`}
                />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};

export default Header;
