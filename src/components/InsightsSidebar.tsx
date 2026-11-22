import React from "react";
import type { InsightFlag, RankedItem } from "../lib/types";
import { StatusDot } from "./StatusDot";

interface InsightsSidebarProps {
  flags: InsightFlag[];
  rankedItems?: RankedItem[];
  isDark?: boolean;
}

export const InsightsSidebar: React.FC<InsightsSidebarProps> = ({
  flags = [],
  rankedItems = [],
  isDark = false,
}) => {
  return (
    <aside
      className={`rounded-xl border p-4 space-y-5 transition-colors ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div>
        <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-3">
          Vulnerability Alerts ({flags.length})
        </h3>
        {flags.length === 0 ? (
          <p className="text-xs text-slate-400">
            No high severity alerts identified for this location.
          </p>
        ) : (
          <div className="space-y-2.5">
            {flags.map((f, i) => (
              <div
                key={f.id || i}
                className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                  f.severity === "critical" || f.severity === "high"
                    ? "border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20"
                    : "border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <StatusDot severity={f.severity} size="sm" />
                  <span>{f.title || f.category || "Alert"}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {f.message || f.description || ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {rankedItems && rankedItems.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-xs font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 mb-3">
            Top Ranked Communities
          </h3>
          <div className="space-y-2">
            {rankedItems.slice(0, 5).map((r, i) => (
              <div
                key={r.id || i}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
              >
                <div>
                  <span className="font-semibold block">{r.name}</span>
                  <span className="text-[10px] text-slate-400">
                    {r.state || ""}
                  </span>
                </div>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                  {r.sublabel ||
                    r.formattedValue ||
                    (r.value !== undefined
                      ? r.value.toLocaleString()
                      : (r.score ?? "—"))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};

export default InsightsSidebar;
