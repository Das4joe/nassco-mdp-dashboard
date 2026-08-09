import { Users, Target } from "lucide-react";
import clsx from "clsx";
import type { DashboardMode } from "../lib/types";

interface ModeToggleProps {
  mode: DashboardMode;
  onChange: (m: DashboardMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="flex justify-center py-2">
      <div
        className={clsx(
          "inline-flex items-center rounded-full p-1 gap-1",
          "bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark shadow-card",
        )}
      >
        <button
          onClick={() => onChange("nsr")}
          className={clsx(
            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all",
            mode === "nsr"
              ? "bg-nsr-500 text-white shadow-sm"
              : "text-ink-muted hover:text-ink-primary dark:text-ink-onDarkMuted dark:hover:text-ink-onDark",
          )}
        >
          <Users size={16} />
          <span>Household Profile</span>
        </button>

        <button
          onClick={() => onChange("update")}
          className={clsx(
            "flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium transition-all",
            mode === "update"
              ? "bg-upd-500 text-white shadow-sm"
              : "text-ink-muted hover:text-ink-primary dark:text-ink-onDarkMuted dark:hover:text-ink-onDark",
          )}
        >
          <Target size={16} />
          <span>Deprivation Analysis</span>
        </button>
      </div>
    </div>
  );
}
