import React from "react";
import type { GeoLevel, DrilldownPath } from "../lib/types";

export interface BreadcrumbProps {
  path?: DrilldownPath;
  drilldown?: DrilldownPath;
  onSelectLevel?: (level: GeoLevel) => void;
  onNavigate?: (level: GeoLevel) => void;
  isDark?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  path,
  drilldown,
  onSelectLevel,
  onNavigate,
  isDark = false,
}) => {
  const currentPath = path || drilldown || { level: "national" };
  const handleLevelClick = (lvl: GeoLevel) => {
    if (onSelectLevel) onSelectLevel(lvl);
    if (onNavigate) onNavigate(lvl);
  };

  return (
    <nav
      aria-label="Hierarchy Drilldown"
      className="flex items-center gap-1.5 text-xs font-medium"
    >
      <button
        type="button"
        onClick={() => handleLevelClick("national")}
        className={`hover:underline transition-colors ${
          !currentPath.state
            ? "font-bold text-blue-600 dark:text-blue-400"
            : isDark
              ? "text-slate-400 hover:text-slate-200"
              : "text-slate-600 hover:text-slate-900"
        }`}
      >
        National
      </button>

      {currentPath.state && (
        <>
          <span className="text-slate-400">/</span>
          <button
            type="button"
            onClick={() => handleLevelClick("state")}
            className={`hover:underline transition-colors ${
              !currentPath.lga
                ? "font-bold text-blue-600 dark:text-blue-400"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {currentPath.state} State
          </button>
        </>
      )}

      {currentPath.lga && (
        <>
          <span className="text-slate-400">/</span>
          <button
            type="button"
            onClick={() => handleLevelClick("lga")}
            className={`hover:underline transition-colors ${
              !currentPath.ward
                ? "font-bold text-blue-600 dark:text-blue-400"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {currentPath.lga} LGA
          </button>
        </>
      )}

      {currentPath.ward && (
        <>
          <span className="text-slate-400">/</span>
          <button
            type="button"
            onClick={() => handleLevelClick("ward")}
            className={`hover:underline transition-colors ${
              !currentPath.community
                ? "font-bold text-blue-600 dark:text-blue-400"
                : isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {currentPath.ward} Ward
          </button>
        </>
      )}

      {currentPath.community && (
        <>
          <span className="text-slate-400">/</span>
          <span className="font-bold text-blue-600 dark:text-blue-400">
            {currentPath.community}
          </span>
        </>
      )}
    </nav>
  );
};

export default Breadcrumb;
