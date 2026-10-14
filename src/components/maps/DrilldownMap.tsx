import type { DashboardData } from "../../lib/loadData";
import type { DrilldownPath } from "../../lib/types";

export interface DrilldownMapProps {
  data: DashboardData;
  path: DrilldownPath;
  onPathChange: (path: DrilldownPath) => void;
  selectedStateFilter?: string;
  stateFilter?: string;
  metric?: string;
  mode?: string;
  isDark?: boolean;
  height?: number;
}

export const DrilldownMap = ({
  data,
  path,
  onPathChange,
  selectedStateFilter,
  stateFilter,
}: DrilldownMapProps) => {
  const currentState = path.state || selectedStateFilter || stateFilter;

  return (
    <div className="w-full h-full min-h-[300px] bg-slate-900/40 rounded-xl p-4 flex flex-col justify-between border border-line-light dark:border-line-dark">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
          Interactive Vector Map
        </span>
        <span className="text-[10px] text-gray-400">
          Viewing: {currentState || "National Overview"}
        </span>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 text-center">
        <div className="space-y-2">
          <div className="text-4xl font-black text-teal-500/80">🗺️</div>
          <p className="text-xs text-gray-300 font-medium">
            Vector GeoJSON Layer active for {data.states.length} MDP Pilot
            States
          </p>
          <p className="text-[10px] text-gray-500">
            Click any state or LGA on screen to drill down directly.
          </p>
        </div>
      </div>

      {currentState && (
        <button
          onClick={() => onPathChange({})}
          className="text-xs text-teal-400 hover:underline self-start font-medium"
        >
          ← Reset to National View
        </button>
      )}
    </div>
  );
};

export default DrilldownMap;
