import React from "react";
import type { LucideIcon } from "lucide-react";

export interface MetricCardItem {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  badge?: string;
  icon: LucideIcon | React.ComponentType<{ className?: string }>;
  accentColor?: "emerald" | "teal" | "amber" | "cyan" | "rose" | "indigo";
}

interface SummaryCardsProps {
  cards: MetricCardItem[];
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
      {cards.map((card) => {
        const IconComponent = card.icon;

        let badgeStyle =
          "dark:bg-emerald-950/60 bg-emerald-100/80 dark:text-emerald-300 text-emerald-800 border-emerald-300 dark:border-emerald-800/40";
        let iconBg =
          "dark:bg-emerald-900/30 bg-emerald-50 dark:text-emerald-400 text-emerald-600";

        if (card.accentColor === "teal") {
          badgeStyle =
            "dark:bg-teal-950/60 bg-teal-100/80 dark:text-teal-300 text-teal-800 border-teal-300 dark:border-teal-800/40";
          iconBg =
            "dark:bg-teal-900/30 bg-teal-50 dark:text-teal-400 text-teal-600";
        } else if (card.accentColor === "amber") {
          badgeStyle =
            "dark:bg-amber-950/60 bg-amber-100/80 dark:text-amber-300 text-amber-800 border-amber-300 dark:border-amber-800/40";
          iconBg =
            "dark:bg-amber-900/30 bg-amber-50 dark:text-amber-400 text-amber-600";
        } else if (card.accentColor === "cyan") {
          badgeStyle =
            "dark:bg-cyan-950/60 bg-cyan-100/80 dark:text-cyan-300 text-cyan-800 border-cyan-300 dark:border-cyan-800/40";
          iconBg =
            "dark:bg-cyan-900/30 bg-cyan-50 dark:text-cyan-400 text-cyan-600";
        } else if (card.accentColor === "rose") {
          badgeStyle =
            "dark:bg-rose-950/60 bg-rose-100/80 dark:text-rose-300 text-rose-800 border-rose-300 dark:border-rose-800/40";
          iconBg =
            "dark:bg-rose-900/30 bg-rose-50 dark:text-rose-400 text-rose-600";
        }

        return (
          <div
            key={card.id}
            className="flex flex-col justify-between p-3.5 rounded-xl border dark:border-[#1a3d36] border-slate-200 dark:bg-[#0c221e] bg-white shadow-sm hover:shadow transition-all"
          >
            {/* Card Header: Title & Icon */}
            <div className="flex items-center justify-between space-x-2 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider dark:text-slate-400 text-slate-600 truncate">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg flex-shrink-0 ${iconBg}`}>
                <IconComponent className="w-4 h-4" />
              </div>
            </div>

            {/* Card Main Metric */}
            <div className="my-1">
              <div className="text-2xl font-black dark:text-white text-slate-900 tracking-tight">
                {typeof card.value === "number"
                  ? card.value.toLocaleString()
                  : card.value}
              </div>
            </div>

            {/* Card Footer: Badge & Subtitle */}
            <div className="flex items-center space-x-2 mt-2 pt-2 border-t dark:border-slate-800/80 border-slate-100">
              {card.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${badgeStyle} flex-shrink-0`}
                >
                  {card.badge}
                </span>
              )}
              <span className="text-[11px] font-medium dark:text-slate-400 text-slate-600 truncate">
                {card.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
