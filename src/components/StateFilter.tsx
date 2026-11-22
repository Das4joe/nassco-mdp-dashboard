import React from "react";

export interface StateFilterProps {
  selectedState?: string | null;
  currentState?: string | null;
  value?: string | null;
  states?: string[];
  options?: string[];
  onSelectState?: (state: string | null) => void;
  onChange?: (state: string | null) => void;
  isDark?: boolean;
  className?: string;
}

const DEFAULT_PILOT_STATES = ["Abia", "Benue", "Oyo", "Sokoto"];

export const StateFilter: React.FC<StateFilterProps> = ({
  selectedState,
  currentState,
  value,
  states = DEFAULT_PILOT_STATES,
  options,
  onSelectState,
  onChange,
  isDark = false,
  className = "",
}) => {
  const activeValue = selectedState ?? currentState ?? value ?? "";
  const stateOptions = options || states;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value === "" ? null : e.target.value;
    if (onSelectState) onSelectState(val);
    if (onChange) onChange(val);
  };

  return (
    <select
      value={activeValue}
      onChange={handleChange}
      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-blue-500/30 ${
        isDark
          ? "bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600"
          : "bg-white border-slate-300 text-slate-800 hover:border-slate-400"
      } ${className}`}
      aria-label="Filter Pilot State"
    >
      <option value="">All Pilot States (National)</option>
      {stateOptions.map((st) => (
        <option key={st} value={st}>
          {st} State
        </option>
      ))}
    </select>
  );
};

export default StateFilter;
