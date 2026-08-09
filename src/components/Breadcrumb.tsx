/**
 * Breadcrumb — Drilldown navigation
 * Click any level to jump back up the hierarchy.
 */

import { ChevronRight, Home } from "lucide-react";
import clsx from "clsx";
import { titleCase } from "../lib/formatters";
import type { DrilldownPath } from "../lib/types";

type Level = "national" | "state" | "lga" | "ward" | "community";

interface BreadcrumbProps {
  path: DrilldownPath;
  onNavigate: (level: Level) => void;
}

interface Crumb {
  label: string;
  level: Level;
  showIcon?: boolean;
}

export default function Breadcrumb({ path, onNavigate }: BreadcrumbProps) {
  const crumbs: Crumb[] = [
    { label: "Nigeria", level: "national", showIcon: true },
  ];
  if (path.state) crumbs.push({ label: titleCase(path.state), level: "state" });
  if (path.lga) crumbs.push({ label: titleCase(path.lga), level: "lga" });
  if (path.ward) crumbs.push({ label: titleCase(path.ward), level: "ward" });
  if (path.community)
    crumbs.push({ label: titleCase(path.community), level: "community" });

  return (
    <nav
      aria-label="Drilldown breadcrumb"
      className="flex items-center gap-1 text-sm flex-wrap"
    >
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;

        return (
          <div key={`${c.level}-${i}`} className="flex items-center gap-1">
            {i > 0 && (
              <ChevronRight
                size={14}
                className="text-ink-faint dark:text-ink-onDarkMuted"
              />
            )}
            <button
              onClick={() => !isLast && onNavigate(c.level)}
              disabled={isLast}
              className={clsx(
                "flex items-center gap-1 px-2 py-1 rounded-md transition",
                isLast
                  ? "text-ink-primary dark:text-ink-onDark font-semibold cursor-default"
                  : "text-ink-muted dark:text-ink-onDarkMuted hover:text-brand-600 dark:hover:text-nsr-500 hover:bg-brand-50 dark:hover:bg-brand-950 cursor-pointer",
              )}
            >
              {c.showIcon && <Home size={14} />}
              {c.label}
            </button>
          </div>
        );
      })}
    </nav>
  );
}
