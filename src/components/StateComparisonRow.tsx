import React from "react";
import type { GeoRecord } from "../lib/types";

interface StateComparisonRowProps {
  states: GeoRecord[];
  isDark?: boolean;
}

export const StateComparisonRow: React.FC<StateComparisonRowProps> = ({
  states = [],
  isDark = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {states.map((st) => {
        const totalHh =
          st.demographics?.total_hh ||
          st.households ||
          st.total_households ||
          0;
        const totalInd =
          st.demographics?.total_individuals ||
          st.individuals ||
          st.total_individuals ||
          0;
        const oosc =
          st.education?.oos_children_6_17 ||
          st.education?.out_of_school_6_17_total ||
          st.education?.out_of_school_total ||
          0;
        const comms =
          st.communities_covered || st.coverage?.communities_count || "—";

        return (
          <div
            key={st.id}
            className={`p-4 rounded-xl border space-y-2.5 transition-all ${
              isDark
                ? "bg-slate-900/90 border-slate-800"
                : "bg-white border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between border-b pb-2 border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                {st.name} State
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                Pilot
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  Households
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                  {totalHh.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  Individuals
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                  {totalInd.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  OOS Children
                </span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">
                  {oosc.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">
                  Communities
                </span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                  {typeof comms === "number" ? comms.toLocaleString() : comms}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StateComparisonRow;
