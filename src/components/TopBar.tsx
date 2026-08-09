import { Moon, Sun, Download } from "lucide-react";
import { formatNumber } from "../lib/formatters";
import type { DataMetadata } from "../lib/types";

interface TopBarProps {
  meta: DataMetadata;
  isDark: boolean;
  onToggleDark: () => void;
  onExport?: () => void;
}

export default function TopBar({
  meta,
  isDark,
  onToggleDark,
  onExport,
}: TopBarProps) {
  const mdpStates = meta.mdp_states ?? [];
  const totalHouseholds = meta.total_households ?? 0;

  return (
    <header className="sticky top-0 z-40 bg-brand-600 dark:bg-brand-950 text-white shadow-md">
      <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl flex-shrink-0">
            🏛️
          </div>
          <div className="min-w-0">
            <h1 className="text-lg font-semibold leading-tight truncate">
              NASSCO Multi-Dimensional Poverty
            </h1>
            <p className="text-2xs text-white/70 truncate">
              {mdpStates.length} MDP States · {formatNumber(totalHouseholds)}{" "}
              Households
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onToggleDark}
            className="p-2 rounded-lg hover:bg-white/10 transition"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {onExport && (
            <button
              onClick={onExport}
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-nsr-500 hover:bg-nsr-600 transition text-sm font-medium"
            >
              <Download size={16} />
              Export
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
