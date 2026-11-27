import React from "react";

export interface MetricCardItem {
  id?: string;
  title: string;
  value: string | number;
  subValue?: string;
  subtitle?: string;
  badge?: string;
  badgeType?: "danger" | "warning" | "success" | "neutral" | "info";
  icon?: React.ComponentType<{ className?: string }>;
}

export interface SummaryCardsProps {
  cards?: MetricCardItem[];
  indicators?: MetricCardItem[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  cards,
  indicators,
}) => {
  const items = cards || indicators || [];

  const getBadgeStyle = (type?: string) => {
    switch (type) {
      case "danger":
        return "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-900";
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-900";
      case "success":
        return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-900";
      case "info":
        return "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-900";
      case "neutral":
      default:
        return "bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700";
    }
  };

  const getIconColor = (type?: string) => {
    switch (type) {
      case "danger":
        return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40";
      case "warning":
        return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40";
      case "success":
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40";
      case "info":
        return "text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40";
      default:
        return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40";
    }
  };

  return (
    <div
      className={`grid gap-4 ${
        items.length === 5
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5"
          : items.length === 4
            ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
      }`}
    >
      {items.map((card, idx) => {
        const IconComponent = card.icon;
        const sub = card.subValue || card.subtitle;

        return (
          <div
            key={card.id || `${card.title}-${idx}`}
            className="p-4 rounded-xl border border-slate-200 dark:border-emerald-900/40 bg-white dark:bg-[#071715] shadow-xs flex flex-col justify-between transition-all hover:border-emerald-500/50"
          >
            <div className="flex items-start justify-between space-x-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400 leading-tight">
                {card.title}
              </span>
              {IconComponent && (
                <div
                  className={`p-1.5 rounded-lg shrink-0 ${getIconColor(card.badgeType)}`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
              )}
            </div>

            <div className="mt-3">
              <div className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-none">
                {card.value}
              </div>

              {(sub || card.badge) && (
                <div className="mt-2.5 flex items-center flex-wrap gap-1.5">
                  {card.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(
                        card.badgeType,
                      )}`}
                    >
                      {card.badge}
                    </span>
                  )}
                  {sub && (
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      {sub}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SummaryCards;
