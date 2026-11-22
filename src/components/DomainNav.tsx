import React from "react";
import type { DomainId } from "../lib/types";

export interface DomainNavProps {
  activeDomain?: DomainId;
  currentDomain?: DomainId;
  onSelectDomain?: (id: DomainId) => void;
  onDomainChange?: (id: DomainId) => void;
  className?: string;
}

interface DomainTab {
  id: DomainId;
  label: string;
  icon: string;
  color: string;
}

const DOMAIN_TABS: DomainTab[] = [
  {
    id: "overview",
    label: "Demographics & Overview",
    icon: "📊",
    color: "#002F6C",
  },
  {
    id: "civil-registration",
    label: "Civil Registration",
    icon: "🪪",
    color: "#10B981",
  },
  {
    id: "education",
    label: "Education & OOSC",
    icon: "🎓",
    color: "#F59E0B",
  },
  {
    id: "health-nutrition",
    label: "Health & Nutrition",
    icon: "🏥",
    color: "#EF4444",
  },
  {
    id: "disabilities",
    label: "Disabilities (PLWD)",
    icon: "♿",
    color: "#8B5CF6",
  },
  {
    id: "livelihoods",
    label: "Livelihoods & Resilience",
    icon: "🌾",
    color: "#06B6D4",
  },
];

export const DomainNav: React.FC<DomainNavProps> = ({
  activeDomain,
  currentDomain,
  onSelectDomain,
  onDomainChange,
  className = "",
}) => {
  const selectedDomain = activeDomain || currentDomain || "overview";

  const handleClick = (id: DomainId) => {
    if (onSelectDomain) onSelectDomain(id);
    if (onDomainChange) onDomainChange(id);
  };

  return (
    <nav
      className={`w-full overflow-x-auto no-scrollbar border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors ${className}`}
      aria-label="Domain Tabs"
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2">
        {DOMAIN_TABS.map((tab) => {
          const isActive = selectedDomain === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleClick(tab.id)}
              className={`group relative flex items-center gap-2 py-3.5 px-4 text-xs font-semibold whitespace-nowrap transition-all border-b-2 ${
                isActive
                  ? "border-blue-600 text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
              }`}
            >
              <span className="text-sm opacity-90 group-hover:scale-110 transition-transform">
                {tab.icon}
              </span>
              <span>{tab.label}</span>
              {isActive && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: tab.color }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default DomainNav;
