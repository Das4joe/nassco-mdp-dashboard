import React, { useState } from "react";
import type { GeoRecord, GeoLevel, DrilldownPath } from "../types";
import { MapPin, ChevronRight, RotateCcw, Compass } from "lucide-react";

export interface DrilldownMapProps {
  currentRecord?: GeoRecord;
  record?: GeoRecord;
  selectedState?: string | null;
  selectedLga?: string | null;
  drilldown?: DrilldownPath;
  states?: GeoRecord[];
  communities?: GeoRecord[];
  allCommunities?: GeoRecord[];
  onSelectLocation?: (name: string, level: GeoLevel | any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
  className?: string;
}

interface StateGeo {
  id: string;
  name: string;
  path: string;
  center: [number, number];
  isPilot: boolean;
}

const NIGERIA_STATES: StateGeo[] = [
  // 4 UNICEF Pilot States (Teal Highlights)
  {
    id: "SOKOTO",
    name: "Sokoto",
    isPilot: true,
    center: [200, 110],
    path: "M 140 70 L 260 60 L 270 120 L 230 160 L 170 150 L 130 110 Z",
  },
  {
    id: "BENUE",
    name: "Benue",
    isPilot: true,
    center: [520, 390],
    path: "M 440 350 L 580 340 L 620 400 L 560 440 L 460 420 L 430 380 Z",
  },
  {
    id: "OYO",
    name: "Oyo",
    isPilot: true,
    center: [160, 380],
    path: "M 110 330 L 210 320 L 230 400 L 170 450 L 120 410 Z",
  },
  {
    id: "ABIA",
    name: "Abia",
    isPilot: true,
    center: [430, 520],
    path: "M 400 490 L 460 480 L 470 540 L 420 560 L 390 530 Z",
  },

  // Non-Pilot States
  {
    id: "ZAMFARA",
    name: "Zamfara",
    isPilot: false,
    center: [280, 150],
    path: "M 230 120 L 310 110 L 330 180 L 260 200 L 220 160 Z",
  },
  {
    id: "KATSINA",
    name: "Katsina",
    isPilot: false,
    center: [370, 100],
    path: "M 320 60 L 420 50 L 430 140 L 350 160 L 310 110 Z",
  },
  {
    id: "KANO",
    name: "Kano",
    isPilot: false,
    center: [460, 140],
    path: "M 410 110 L 510 100 L 520 170 L 440 190 L 400 150 Z",
  },
  {
    id: "JIGAWA",
    name: "Jigawa",
    isPilot: false,
    center: [530, 90],
    path: "M 480 50 L 600 60 L 580 130 L 490 120 Z",
  },
  {
    id: "YOBE",
    name: "Yobe",
    isPilot: false,
    center: [660, 110],
    path: "M 590 60 L 730 70 L 710 170 L 600 160 Z",
  },
  {
    id: "BORNO",
    name: "Borno",
    isPilot: false,
    center: [800, 130],
    path: "M 720 70 L 880 90 L 860 240 L 730 210 Z",
  },
  {
    id: "KEBBI",
    name: "Kebbi",
    isPilot: false,
    center: [110, 170],
    path: "M 70 120 L 160 110 L 170 230 L 90 240 Z",
  },
  {
    id: "NIGER",
    name: "Niger",
    isPilot: false,
    center: [280, 280],
    path: "M 190 220 L 370 210 L 380 340 L 240 350 L 180 280 Z",
  },
  {
    id: "KADUNA",
    name: "Kaduna",
    isPilot: false,
    center: [410, 220],
    path: "M 350 170 L 480 170 L 470 280 L 360 280 Z",
  },
  {
    id: "BAUCHI",
    name: "Bauchi",
    isPilot: false,
    center: [580, 210],
    path: "M 520 160 L 650 170 L 630 270 L 510 260 Z",
  },
  {
    id: "GOMBE",
    name: "Gombe",
    isPilot: false,
    center: [680, 220],
    path: "M 640 180 L 720 190 L 710 270 L 640 260 Z",
  },
  {
    id: "ADAMAWA",
    name: "Adamawa",
    isPilot: false,
    center: [780, 310],
    path: "M 720 220 L 830 230 L 800 410 L 710 360 Z",
  },
  {
    id: "PLATEAU",
    name: "Plateau",
    isPilot: false,
    center: [510, 290],
    path: "M 460 250 L 560 250 L 570 340 L 470 330 Z",
  },
  {
    id: "TARABA",
    name: "Taraba",
    isPilot: false,
    center: [670, 390],
    path: "M 610 320 L 740 330 L 710 490 L 590 460 Z",
  },
  {
    id: "NASARAWA",
    name: "Nasarawa",
    isPilot: false,
    center: [430, 330],
    path: "M 370 300 L 490 300 L 480 370 L 380 360 Z",
  },
  {
    id: "FCT",
    name: "FCT (Abuja)",
    isPilot: false,
    center: [370, 310],
    path: "M 350 290 L 390 290 L 390 330 L 350 330 Z",
  },
  {
    id: "KOGI",
    name: "Kogi",
    isPilot: false,
    center: [340, 390],
    path: "M 280 350 L 410 340 L 420 430 L 310 440 Z",
  },
  {
    id: "KWARA",
    name: "Kwara",
    isPilot: false,
    center: [200, 330],
    path: "M 140 280 L 270 270 L 260 360 L 160 360 Z",
  },
  {
    id: "EKITI",
    name: "Ekiti",
    isPilot: false,
    center: [240, 400],
    path: "M 220 380 L 270 380 L 260 430 L 220 420 Z",
  },
  {
    id: "OSUN",
    name: "Osun",
    isPilot: false,
    center: [200, 420],
    path: "M 180 395 L 230 395 L 220 445 L 180 440 Z",
  },
  {
    id: "ONDO",
    name: "Ondo",
    isPilot: false,
    center: [260, 440],
    path: "M 230 410 L 290 400 L 280 490 L 230 470 Z",
  },
  {
    id: "OGUN",
    name: "Ogun",
    isPilot: false,
    center: [140, 450],
    path: "M 100 420 L 190 420 L 180 475 L 110 470 Z",
  },
  {
    id: "LAGOS",
    name: "Lagos",
    isPilot: false,
    center: [140, 485],
    path: "M 105 470 L 180 470 L 180 495 L 115 495 Z",
  },
  {
    id: "EDO",
    name: "Edo",
    isPilot: false,
    center: [310, 460],
    path: "M 270 420 L 350 415 L 340 495 L 275 490 Z",
  },
  {
    id: "DELTA",
    name: "Delta",
    isPilot: false,
    center: [310, 520],
    path: "M 265 490 L 355 485 L 340 560 L 270 545 Z",
  },
  {
    id: "ANAMBRA",
    name: "Anambra",
    isPilot: false,
    center: [375, 490],
    path: "M 350 470 L 400 470 L 395 520 L 355 520 Z",
  },
  {
    id: "ENUGU",
    name: "Enugu",
    isPilot: false,
    center: [420, 460],
    path: "M 390 435 L 450 435 L 445 485 L 395 485 Z",
  },
  {
    id: "EBONYI",
    name: "Ebonyi",
    isPilot: false,
    center: [470, 470],
    path: "M 445 440 L 495 440 L 490 500 L 445 495 Z",
  },
  {
    id: "IMO",
    name: "Imo",
    isPilot: false,
    center: [380, 535],
    path: "M 360 515 L 405 515 L 400 555 L 360 550 Z",
  },
  {
    id: "RIVERS",
    name: "Rivers",
    isPilot: false,
    center: [370, 575],
    path: "M 335 550 L 420 545 L 405 610 L 340 595 Z",
  },
  {
    id: "BAYELSA",
    name: "Bayelsa",
    isPilot: false,
    center: [305, 575],
    path: "M 270 550 L 340 550 L 325 610 L 275 590 Z",
  },
  {
    id: "CROSS RIVER",
    name: "Cross River",
    isPilot: false,
    center: [505, 495],
    path: "M 470 430 L 530 430 L 525 565 L 465 540 Z",
  },
  {
    id: "AKWA IBOM",
    name: "Akwa Ibom",
    isPilot: false,
    center: [445, 575],
    path: "M 420 545 L 475 545 L 460 605 L 420 595 Z",
  },
];

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  currentRecord,
  record,
  selectedState,
  selectedLga,
  drilldown,
  onSelectLocation,
  onDrilldownChange,
  isDark = true,
  className = "",
}) => {
  const activeRecord: GeoRecord | undefined = record || currentRecord;
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const selectedStateName = selectedState || drilldown?.state || null;
  const selectedLgaName = selectedLga || drilldown?.lga || null;

  const totalHH =
    activeRecord?.total_households ?? activeRecord?.households ?? 41512;
  const totalInd =
    activeRecord?.total_individuals ?? activeRecord?.individuals ?? 138676;
  const maleCount = activeRecord?.male ?? 70312;
  const femaleCount = activeRecord?.female ?? 68364;

  const handleStateClick = (stateName: string) => {
    const isPilot = ["Abia", "Benue", "Oyo", "Sokoto"].some(
      (s) => s.toLowerCase() === stateName.toLowerCase(),
    );
    if (isPilot && onSelectLocation) {
      onSelectLocation(stateName, "state");
    }
  };

  const resetToNational = () => {
    if (onDrilldownChange) {
      onDrilldownChange({ state: null, lga: null, community: null });
    } else if (onSelectLocation) {
      onSelectLocation("National", "national");
    }
  };

  return (
    <div
      className={`relative flex flex-col w-full h-[540px] rounded-2xl overflow-hidden border ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-800"
      } shadow-xl backdrop-blur-md ${className}`}
    >
      {/* Top Map Header & Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg pointer-events-auto">
          <button
            onClick={resetToNational}
            className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>NIGERIA</span>
          </button>

          {selectedStateName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <button
                onClick={() =>
                  onSelectLocation &&
                  onSelectLocation(selectedStateName, "state")
                }
                className="text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
              >
                {selectedStateName}
              </button>
            </>
          )}

          {selectedLgaName && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs font-medium text-emerald-400">
                {selectedLgaName}
              </span>
            </>
          )}
        </div>

        {/* Pilot Indicator & Reset Button */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">
              4 Pilot States
            </span>
          </div>
          {(selectedStateName || selectedLgaName) && (
            <button
              onClick={resetToNational}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-medium transition-all shadow-lg"
              title="Reset View"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* SVG Nigeria Vector Map */}
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <svg
          viewBox="40 30 860 610"
          className="w-full h-full max-h-[480px] drop-shadow-2xl transition-all duration-300"
        >
          <defs>
            <filter id="glow-teal" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="pilotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2DD4BF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0D9488" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient
              id="selectedPilotGrad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#D97706" stopOpacity="0.85" />
            </linearGradient>
          </defs>

          {/* Render All States */}
          {NIGERIA_STATES.map((st) => {
            const isSelected =
              selectedStateName?.toLowerCase() === st.name.toLowerCase();
            const isHovered = hoveredState === st.name;

            let fill = isDark ? "#1E293B" : "#E2E8F0";
            let stroke = isDark ? "#334155" : "#CBD5E1";
            let strokeWidth = 1.2;
            let filter = undefined;

            if (st.isPilot) {
              if (isSelected) {
                fill = "url(#selectedPilotGrad)";
                stroke = "#FDE68A";
                strokeWidth = 2.4;
                filter = "url(#glow-teal)";
              } else if (isHovered) {
                fill = "#38BDF8";
                stroke = "#E0F2FE";
                strokeWidth = 2.0;
                filter = "url(#glow-teal)";
              } else {
                fill = "url(#pilotGrad)";
                stroke = "#99F6E4";
                strokeWidth = 1.6;
              }
            } else if (isHovered) {
              fill = isDark ? "#334155" : "#CBD5E1";
            }

            return (
              <g
                key={st.id}
                className={
                  st.isPilot
                    ? "cursor-pointer transition-transform duration-200"
                    : "cursor-default"
                }
              >
                <path
                  d={st.path}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={strokeWidth}
                  filter={filter}
                  onMouseEnter={() => setHoveredState(st.name)}
                  onMouseLeave={() => setHoveredState(null)}
                  onClick={() => handleStateClick(st.name)}
                  className="transition-colors duration-150"
                />
                <text
                  x={st.center[0]}
                  y={st.center[1]}
                  textAnchor="middle"
                  dominantBaseline="central"
                  pointerEvents="none"
                  className={`text-[11px] font-bold tracking-wider select-none ${
                    st.isPilot
                      ? "fill-slate-950 drop-shadow"
                      : isDark
                        ? "fill-slate-500"
                        : "fill-slate-400"
                  }`}
                >
                  {st.name.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Bottom Floating Spatial HUD Stats Bar */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-4 px-4 py-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Active View
              </div>
              <div className="text-sm font-bold text-teal-300">
                {selectedLgaName ||
                  selectedStateName ||
                  "Nigeria (4 Pilot States)"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-slate-700/60">
            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                Households
              </div>
              <div className="text-sm font-bold text-white tracking-wide">
                {totalHH.toLocaleString()}
              </div>
            </div>

            <div className="pl-6 text-right">
              <div className="text-[10px] uppercase font-semibold text-slate-400">
                Individuals
              </div>
              <div className="text-sm font-bold text-white tracking-wide">
                {totalInd.toLocaleString()}
              </div>
            </div>

            <div className="pl-6 flex items-center gap-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-400">
                  Male:{" "}
                </span>
                <span className="font-bold text-sky-400">
                  {maleCount.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-medium text-slate-400">
                  Female:{" "}
                </span>
                <span className="font-bold text-rose-400">
                  {femaleCount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrilldownMap;
