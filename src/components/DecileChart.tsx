import type { DecileBar } from "../lib/insights";
import { formatNumber } from "../lib/formatters";

interface DecileChartProps {
  data: DecileBar[];
  accentColor: string;
}

export default function DecileChart({ data, accentColor }: DecileChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="space-y-1.5 mt-2">
      {data.map((row) => {
        const width = (row.count / maxCount) * 100;
        const isPoor = ["D1", "D2", "D3"].includes(row.decile);

        return (
          <div key={row.decile} className="flex items-center text-xs">
            <div className="w-8 font-medium text-ink-muted dark:text-ink-onDarkMuted">
              {row.decile}
            </div>
            <div className="flex-1 h-4 bg-line-light dark:bg-line-dark rounded-r overflow-hidden flex items-center">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${width}%`,
                  backgroundColor: isPoor ? accentColor : undefined,
                }}
                title={`${formatNumber(row.count)} HHs`}
              >
                {!isPoor && (
                  <div className="w-full h-full bg-brand-200 dark:bg-brand-800" />
                )}
              </div>
            </div>
            <div className="w-16 text-right tabular text-ink-faint dark:text-ink-onDarkMuted text-2xs">
              {formatNumber(row.count)}
            </div>
          </div>
        );
      })}
    </div>
  );
}
