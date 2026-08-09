import type { FC } from "react";
import { clsx } from "clsx";

export type DomainKey =
  | "overview"
  | "registration"
  | "child-protection"
  | "education"
  | "health-nutrition"
  | "livelihoods";

interface DomainDef {
  key: DomainKey;
  label: string;
  hint: string;
}

const DOMAINS: DomainDef[] = [
  {
    key: "overview",
    label: "Overview",
    hint: "Map, KPIs and community ranking",
  },
  {
    key: "registration",
    label: "Registration & Coverage",
    hint: "Who was registered — people, households, ages",
  },
  {
    key: "child-protection",
    label: "Child Protection & Documentation",
    hint: "Birth certificates, NIN, disability",
  },
  { key: "education", label: "Education", hint: "Attendance, out-of-school" },
  {
    key: "health-nutrition",
    label: "Health & Nutrition",
    hint: "MUAC, healthcare access, PLW",
  },
  {
    key: "livelihoods",
    label: "Livelihoods & Resilience",
    hint: "Work, shocks, coping, housing",
  },
];

interface DomainNavProps {
  active: DomainKey;
  onChange: (key: DomainKey) => void;
  className?: string;
}

export const DomainNav: FC<DomainNavProps> = ({
  active,
  onChange,
  className,
}) => {
  return (
    <nav
      aria-label="Dashboard domain"
      className={clsx(
        "w-full bg-surface-light dark:bg-surface-dark",
        "border-b border-line-light dark:border-line-dark",
        className,
      )}
    >
      <div className="max-w-[1600px] mx-auto px-6 py-3">
        <div className="flex flex-wrap gap-2">
          {DOMAINS.map((d) => {
            const isActive = d.key === active;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => onChange(d.key)}
                title={d.hint}
                aria-pressed={isActive}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
                  "focus-visible:ring-offset-surface-light dark:focus-visible:ring-offset-surface-dark",
                  isActive
                    ? "bg-brand-600 text-white shadow-card"
                    : "bg-surface-page dark:bg-surface-darker text-ink-muted dark:text-ink-onDarkMuted hover:bg-brand-50 dark:hover:bg-brand-950 hover:text-ink-primary dark:hover:text-ink-onDark",
                )}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export const DOMAIN_LIST = DOMAINS;
