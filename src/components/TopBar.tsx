import type { DataMetadata } from "../lib/types";
import { Sun, Moon } from "lucide-react";

export interface TopBarProps {
  meta?: DataMetadata;
  isDark: boolean;
  onToggleDark: () => void;
}

export function TopBar({ meta, isDark, onToggleDark }: TopBarProps) {
  const mdpStates = meta?.mdp_states ?? ["ABIA", "BENUE", "OYO", "SOKOTO"];
  const totalHouseholds = meta?.total_households ?? 41512;

  return (
    <header className="bg-[#075E54] dark:bg-[#083832] text-white px-4 md:px-6 py-3 flex items-center justify-between border-b border-teal-800/40">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
          <span className="text-xl">🏛️</span>
        </div>
        <div>
          <h1 className="text-base font-bold tracking-tight leading-none text-white">
            NASSCO Multi-Dimensional Poverty
          </h1>
          <p className="text-[11px] text-teal-100/80 mt-1 font-medium">
            {mdpStates.length} MDP States • {totalHouseholds.toLocaleString()}{" "}
            Households
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white"
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

export default TopBar;
