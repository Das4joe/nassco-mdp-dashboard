import React from "react";
import type { GeoRecord } from "../lib/types";
import { computeDecileDistribution, type DecileBar } from "../lib/insights";

interface DecileChartProps {
  record: GeoRecord;
}

export const DecileChart: React.FC<DecileChartProps> = ({ record }) => {
  const bars: DecileBar[] = computeDecileDistribution(record);
  const maxCount = Math.max(...bars.map((b) => b.count), 1);

  return (
    <div className="space-y-1.5">
      <div className="text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted flex items-center justify-between">
        <span>Poverty Distribution</span>
      </div>
      <div className="space-y-1">
        {bars.map((b) => {
          const pct = Math.round((b.count / maxCount) * 100);
          return (
            <div key={b.decile} className="flex items-center text-xs gap-2">
              <span className="w-7 font-mono font-semibold text-ink-muted dark:text-ink-onDarkMuted text-right">
                {b.decile}
              </span>
              <div className="flex-1 bg-surface-page dark:bg-surface-darker h-4 rounded overflow-hidden relative">
                <div
                  className={`h-full transition-all duration-300 ${
                    b.isPoorest
                      ? "bg-amber-500"
                      : "bg-emerald-600/40 dark:bg-emerald-500/30"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-12 text-right font-mono text-ink-primary dark:text-ink-onDark text-[11px]">
                {b.count.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="text-[10px] text-center text-ink-faint italic mt-1">
        Poorest 30% highlighted
      </div>
    </div>
  );
};

export default DecileChart;
