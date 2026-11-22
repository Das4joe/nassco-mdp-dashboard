import React from "react";
import type { DashboardMode } from "../lib/types";

interface ModeToggleProps {
  mode: DashboardMode;
  onChange: (m: DashboardMode) => void;
  isDark?: boolean;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({
  mode,
  onChange,
  isDark = false,
}) => {
  return (
    <div
      className={`inline-flex rounded-lg border p-1 text-xs font-medium ${
        isDark
          ? "bg-slate-900 border-slate-800"
          : "bg-slate-100 border-slate-200"
      }`}
    >
      <button
        type="button"
        onClick={() => onChange("overview")}
        className={`px-3 py-1.5 rounded-md transition-all ${
          String(mode) === "nsr" || String(mode) === "overview"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        }`}
      >
        NSR Mode
      </button>
      <button
        type="button"
        onClick={() => onChange("vulnerability")}
        className={`px-3 py-1.5 rounded-md transition-all ${
          String(mode) === "vulnerability"
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
        }`}
      >
        Vulnerability Index
      </button>
    </div>
  );
};

export default ModeToggle;
