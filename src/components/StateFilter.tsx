import { useCallback, useEffect, useRef, useState } from "react";
import type { FC } from "react";
import { ChevronDown, Check, MapPin } from "lucide-react";
import { clsx } from "clsx";

interface StateOption {
  value: string | null;
  label: string;
}

interface StateFilterProps {
  value: string | undefined | null;
  onChange: (state: string | null) => void;
  states?: string[];
  className?: string;
}

const DEFAULT_STATES = ["Abia", "Benue", "Oyo", "Sokoto"];

const toDisplay = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const toInternal = (s: string) => s.toUpperCase();

export const StateFilter: FC<StateFilterProps> = ({
  value,
  onChange,
  states = DEFAULT_STATES,
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [focusIndex, setFocusIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const options: StateOption[] = [
    { value: null, label: "All 4 MDP States" },
    ...states.map((s) => ({ value: toInternal(s), label: toDisplay(s) })),
  ];

  const selected =
    options.find((o) => (o.value ?? "") === (value ?? "")) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (!open) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
        }
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setFocusIndex((i) => Math.min(options.length - 1, i + 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setFocusIndex((i) => Math.max(0, i - 1));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = options[focusIndex];
        if (opt) {
          onChange(opt.value);
          setOpen(false);
        }
      }
    },
    [open, focusIndex, options, onChange],
  );

  return (
    <div
      ref={containerRef}
      className={clsx("relative inline-block", className)}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={clsx(
          "inline-flex items-center gap-2 px-4 py-2 min-w-[200px]",
          "bg-surface-light dark:bg-surface-dark",
          "border border-line-light dark:border-line-dark",
          "rounded-xl shadow-card",
          "text-sm font-medium text-ink-primary dark:text-ink-onDark",
          "hover:border-brand-500 dark:hover:border-brand-500",
          "hover:bg-brand-50 dark:hover:bg-brand-950",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2",
          "focus-visible:ring-offset-surface-light dark:focus-visible:ring-offset-surface-dark",
          "transition-colors",
        )}
      >
        <MapPin
          className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0"
          strokeWidth={2}
        />
        <span className="flex-1 text-left">{selected.label}</span>
        <ChevronDown
          className={clsx(
            "w-4 h-4 text-ink-faint dark:text-ink-onDarkMuted shrink-0 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className={clsx(
            "absolute right-0 mt-2 min-w-[240px] z-50",
            "bg-surface-light dark:bg-surface-dark",
            "border border-line-light dark:border-line-dark",
            "rounded-xl shadow-popup py-1 max-h-[320px] overflow-y-auto",
          )}
        >
          {options.map((opt, i) => {
            const isSelected = (opt.value ?? "") === (selected.value ?? "");
            const isFocused = i === focusIndex;
            return (
              <button
                key={opt.value ?? "__all__"}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                onMouseEnter={() => setFocusIndex(i)}
                className={clsx(
                  "w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left",
                  "transition-colors",
                  isFocused &&
                    !isSelected &&
                    "bg-surface-page dark:bg-surface-darker",
                  isSelected &&
                    "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-medium",
                  !isSelected &&
                    "text-ink-muted dark:text-ink-onDarkMuted hover:bg-surface-page dark:hover:bg-surface-darker",
                )}
              >
                <span
                  className={clsx(
                    "w-4 h-4 shrink-0",
                    isSelected
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-transparent",
                  )}
                >
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                </span>
                <span className="flex-1">{opt.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
