import React from "react";
import type { DataMetadata, DashboardMetadata } from "../lib/types";

export interface TopBarProps {
  meta?: DataMetadata | DashboardMetadata;
  isDark?: boolean;
  darkMode?: boolean;
  onToggleDark?: () => void;
  onToggleTheme?: () => void;
  className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  meta,
  isDark,
  darkMode,
  onToggleDark,
  onToggleTheme,
  className = "",
}) => {
  const activeDark = Boolean(isDark ?? darkMode ?? false);
  const handleToggle = () => {
    if (onToggleDark) onToggleDark();
    else if (onToggleTheme) onToggleTheme();
  };

  const totalHh = Number(meta?.total_households ?? meta?.total_hh ?? 0) || 0;
  const totalInd = Number(meta?.total_individuals ?? meta?.total_ind ?? 0) || 0;
  const stateCount = Number(meta?.states_count ?? meta?.total_states ?? 4) || 4;
  const lgaCount = Number(meta?.lgas_count ?? meta?.total_lgas ?? 0) || 0;
  const commCount =
    Number(meta?.communities_count ?? meta?.total_communities ?? 0) || 0;

  return (
    <header
      className={`border-b transition-colors duration-200 sticky top-0 z-40 backdrop-blur-md ${
        activeDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100"
          : "bg-white/95 border-slate-200 text-slate-900"
      } ${className}`}
    >
      <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 text-white font-black text-base shadow-sm ring-1 ring-blue-600/30">
            NSR
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight uppercase truncate">
                NASSCO MDP &bull; NSR Expansion
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                UNICEF Pilot
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              Abia &bull; Benue &bull; Oyo &bull; Sokoto Multi-Domain
              Vulnerability Matrix
            </p>
          </div>
        </div>

        {/* Global Key Stats Badge Strip */}
        <div className="hidden xl:flex items-center gap-6 px-4 py-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Households
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {totalHh.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Individuals
            </span>
            <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
              {totalInd.toLocaleString()}
            </span>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700" />
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Coverage
            </span>
            <span className="font-mono text-slate-700 dark:text-slate-300">
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {stateCount}
              </span>{" "}
              States &bull;{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {lgaCount}
              </span>{" "}
              LGAs &bull;{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {commCount}
              </span>{" "}
              Comms
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            type="button"
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors"
            title={activeDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {activeDark ? (
              <svg
                className="w-5 h-5 text-amber-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5 text-slate-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
