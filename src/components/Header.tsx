import React from "react";
import type { DomainId } from "../types";
import { ShieldCheck, Sparkles } from "lucide-react";

export interface HeaderProps {
  activeDomain?: DomainId;
  onSelectDomain?: (domain: DomainId) => void;
  isDark?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isDark = true }) => {
  return (
    <header
      className={`w-full border-b transition-colors ${
        isDark
          ? "bg-slate-900/90 border-slate-800"
          : "bg-white border-slate-200"
      } backdrop-blur-md sticky top-0 z-30`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Subtitle */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 shadow-md shadow-teal-500/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                NASSCO <span className="text-teal-400">MDP</span>
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 border border-teal-500/30">
                UNICEF Section 3
              </span>
            </div>
            <p className="text-xs text-slate-400">
              National Social Register (NSR) Expansion & Child Multi-Dimensional
              Poverty
            </p>
          </div>
        </div>

        {/* Pilot States Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>Pilot: Abia • Benue • Oyo • Sokoto</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
