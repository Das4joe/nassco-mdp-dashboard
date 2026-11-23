import React, { useState, useMemo } from "react";
import type { GeoRecord, DrilldownPath } from "../lib/types";

export interface DrilldownMapProps {
  record?: GeoRecord;
  drilldown?: DrilldownPath;
  path?: DrilldownPath;
  statesSummary?: GeoRecord[];
  allCommunities?: GeoRecord[];
  states?: GeoRecord[];
  lgas?: GeoRecord[];
  communities?: GeoRecord[];
  height?: string;
  onSelectLocation?: (name: string, level: any) => void;
  onDrilldownChange?: (path: DrilldownPath) => void;
  isDark?: boolean;
}

// Normalized SVG paths for Nigeria and its 36+1 states
const NIGERIA_STATES: Record<
  string,
  { d: string; isPilot: boolean; center: [number, number] }
> = {
  SOKOTO: {
    d: "M 130 35 L 205 25 L 235 60 L 220 120 L 175 140 L 140 100 Z",
    isPilot: true,
    center: [175, 75],
  },
  OYO: {
    d: "M 80 340 L 145 320 L 170 380 L 140 435 L 75 420 L 65 370 Z",
    isPilot: true,
    center: [115, 375],
  },
  BENUE: {
    d: "M 320 340 L 440 330 L 480 390 L 420 440 L 325 430 L 295 380 Z",
    isPilot: true,
    center: [380, 380],
  },
  ABIA: {
    d: "M 305 470 L 350 460 L 365 510 L 330 540 L 295 515 Z",
    isPilot: true,
    center: [330, 500],
  },
  // Non-pilot representative state polygons creating the full Nigeria silhouette
  KEBBI: {
    d: "M 65 60 L 130 35 L 140 100 L 115 170 L 50 145 Z",
    isPilot: false,
    center: [95, 110],
  },
  ZAMFARA: {
    d: "M 175 140 L 220 120 L 270 145 L 250 205 L 180 190 Z",
    isPilot: false,
    center: [220, 160],
  },
  KATSINA: {
    d: "M 235 60 L 310 45 L 330 115 L 270 145 L 220 120 Z",
    isPilot: false,
    center: [270, 95],
  },
  KANO: {
    d: "M 310 45 L 380 65 L 390 140 L 330 155 L 330 115 Z",
    isPilot: false,
    center: [350, 105],
  },
  JIGAWA: {
    d: "M 380 65 L 450 55 L 470 120 L 390 140 Z",
    isPilot: false,
    center: [420, 95],
  },
  YOBE: {
    d: "M 450 55 L 540 60 L 535 160 L 460 170 L 470 120 Z",
    isPilot: false,
    center: [490, 110],
  },
  BORNO: {
    d: "M 540 60 L 635 100 L 610 215 L 530 205 L 535 160 Z",
    isPilot: false,
    center: [575, 145],
  },
  NIGER: {
    d: "M 115 170 L 245 195 L 260 280 L 175 320 L 110 270 Z",
    isPilot: false,
    center: [180, 245],
  },
  KADUNA: {
    d: "M 245 195 L 340 170 L 360 260 L 260 280 Z",
    isPilot: false,
    center: [300, 225],
  },
  BAUCHI: {
    d: "M 360 155 L 460 170 L 450 250 L 360 240 Z",
    isPilot: false,
    center: [410, 200],
  },
  GOMBE: {
    d: "M 460 170 L 530 185 L 520 255 L 450 250 Z",
    isPilot: false,
    center: [490, 215],
  },
  ADAMAWA: {
    d: "M 520 220 L 600 230 L 570 360 L 495 330 L 510 260 Z",
    isPilot: false,
    center: [545, 285],
  },
  PLATEAU: {
    d: "M 360 240 L 450 250 L 440 330 L 350 310 Z",
    isPilot: false,
    center: [400, 285],
  },
  TARABA: {
    d: "M 440 330 L 520 320 L 500 440 L 415 425 Z",
    isPilot: false,
    center: [470, 375],
  },
  NASARAWA: {
    d: "M 270 285 L 350 280 L 360 340 L 260 340 Z",
    isPilot: false,
    center: [310, 310],
  },
  FCT: {
    d: "M 245 275 L 275 275 L 275 310 L 245 310 Z",
    isPilot: false,
    center: [260, 290],
  },
  KOGI: {
    d: "M 195 330 L 295 335 L 305 405 L 210 405 Z",
    isPilot: false,
    center: [250, 365],
  },
  KWARA: {
    d: "M 110 270 L 195 280 L 210 350 L 140 345 Z",
    isPilot: false,
    center: [160, 310],
  },
  OSUN: {
    d: "M 145 380 L 190 370 L 195 415 L 150 420 Z",
    isPilot: false,
    center: [170, 395],
  },
  EKITI: {
    d: "M 185 365 L 225 360 L 230 400 L 190 405 Z",
    isPilot: false,
    center: [205, 380],
  },
  ONDO: {
    d: "M 180 405 L 240 395 L 225 465 L 175 450 Z",
    isPilot: false,
    center: [205, 430],
  },
  OGUN: {
    d: "M 75 420 L 145 420 L 140 460 L 65 450 Z",
    isPilot: false,
    center: [105, 435],
  },
  LAGOS: {
    d: "M 70 450 L 135 450 L 130 475 L 65 470 Z",
    isPilot: false,
    center: [100, 462],
  },
  EDO: {
    d: "M 220 410 L 285 410 L 275 470 L 215 465 Z",
    isPilot: false,
    center: [250, 440],
  },
  DELTA: {
    d: "M 215 465 L 275 470 L 260 535 L 195 515 Z",
    isPilot: false,
    center: [235, 495],
  },
  ANAMBRA: {
    d: "M 275 455 L 310 455 L 305 500 L 270 495 Z",
    isPilot: false,
    center: [290, 475],
  },
  ENUGU: {
    d: "M 310 415 L 355 415 L 350 465 L 305 465 Z",
    isPilot: false,
    center: [330, 440],
  },
  EBONYI: {
    d: "M 355 420 L 390 420 L 380 480 L 350 475 Z",
    isPilot: false,
    center: [370, 450],
  },
  IMO: {
    d: "M 285 495 L 320 495 L 315 535 L 280 530 Z",
    isPilot: false,
    center: [300, 515],
  },
  RIVERS: {
    d: "M 265 525 L 325 525 L 315 580 L 255 565 Z",
    isPilot: false,
    center: [290, 550],
  },
  BAYELSA: {
    d: "M 210 525 L 265 525 L 250 580 L 195 560 Z",
    isPilot: false,
    center: [230, 550],
  },
  CROSS_RIVER: {
    d: "M 380 425 L 420 415 L 425 520 L 375 510 Z",
    isPilot: false,
    center: [400, 465],
  },
  AKWA_IBOM: {
    d: "M 330 525 L 375 520 L 365 565 L 325 560 Z",
    isPilot: false,
    center: [350, 542],
  },
};

// LGA Breakdown for Pilot States Drilldown
const PILOT_LGAS: Record<string, Array<{ name: string; d: string }>> = {
  SOKOTO: [
    { name: "Sokoto North", d: "M 150 50 L 200 45 L 210 80 L 160 85 Z" },
    { name: "Sokoto South", d: "M 160 85 L 210 80 L 220 120 L 170 125 Z" },
    { name: "Wamako", d: "M 130 60 L 160 85 L 145 125 L 115 100 Z" },
    { name: "Tambuwal", d: "M 140 120 L 180 120 L 170 160 L 130 155 Z" },
    { name: "Bodinga", d: "M 175 110 L 225 105 L 215 145 L 165 150 Z" },
  ],
  BENUE: [
    { name: "Makurdi", d: "M 340 345 L 390 340 L 400 380 L 350 385 Z" },
    { name: "Gboko", d: "M 390 340 L 440 335 L 450 375 L 400 380 Z" },
    { name: "Otukpo", d: "M 320 385 L 370 380 L 380 420 L 330 425 Z" },
    { name: "Katsina-Ala", d: "M 420 375 L 470 370 L 480 410 L 430 415 Z" },
    { name: "Vandeikya", d: "M 390 415 L 440 410 L 445 445 L 395 450 Z" },
  ],
  OYO: [
    { name: "Ibadan North", d: "M 100 360 L 135 355 L 140 385 L 105 390 Z" },
    {
      name: "Ibadan South-West",
      d: "M 105 390 L 140 385 L 145 415 L 110 420 Z",
    },
    { name: "Ogbomosho North", d: "M 115 325 L 155 320 L 160 350 L 120 355 Z" },
    { name: "Oyo East", d: "M 135 345 L 170 340 L 175 375 L 140 380 Z" },
    { name: "Ibarapa Central", d: "M 75 370 L 110 365 L 115 405 L 80 410 Z" },
  ],
  ABIA: [
    { name: "Aba North", d: "M 310 475 L 335 470 L 340 495 L 315 500 Z" },
    { name: "Aba South", d: "M 315 500 L 340 495 L 345 520 L 320 525 Z" },
    { name: "Umuahia North", d: "M 325 455 L 355 450 L 360 480 L 330 485 Z" },
    { name: "Bende", d: "M 340 475 L 370 470 L 375 505 L 345 510 Z" },
    { name: "Ohafia", d: "M 335 510 L 365 505 L 360 540 L 330 545 Z" },
  ],
};

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  record,
  drilldown,
  path,
  statesSummary = [],
  states = [],
  height = "480px",
  onSelectLocation,
  onDrilldownChange,
}) => {
  const activeDrilldown: DrilldownPath = drilldown ||
    path || { level: record?.level || "national" };
  const currentLevel = activeDrilldown.level || record?.level || "national";
  const selectedStateName = (activeDrilldown.state || "").toUpperCase();
  const [hoveredLocation, setHoveredLocation] = useState<string | null>(null);

  const availableStates = states.length > 0 ? states : statesSummary;

  // Retrieve metrics for hovered/selected state
  const hoveredStateData = useMemo(() => {
    const target = hoveredLocation || selectedStateName || "SOKOTO";
    return availableStates.find(
      (s) => (s.name || s.state || "").toUpperCase() === target,
    );
  }, [hoveredLocation, selectedStateName, availableStates]);

  const handleStateClick = (stateKey: string) => {
    const stateName = stateKey.charAt(0) + stateKey.slice(1).toLowerCase();
    if (onSelectLocation) onSelectLocation(stateName, "state");
    if (onDrilldownChange) {
      onDrilldownChange({
        level: "state",
        state: stateName,
        lga: null,
        ward: null,
        community: null,
      });
    }
  };

  const handleLgaClick = (lgaName: string) => {
    if (onSelectLocation) onSelectLocation(lgaName, "lga");
    if (onDrilldownChange) {
      onDrilldownChange({
        level: "lga",
        state: selectedStateName,
        lga: lgaName,
        ward: null,
        community: null,
      });
    }
  };

  const handleResetToNational = () => {
    if (onSelectLocation) onSelectLocation("National", "national");
    if (onDrilldownChange) {
      onDrilldownChange({
        level: "national",
        state: null,
        lga: null,
        ward: null,
        community: null,
      });
    }
  };

  const displayName =
    hoveredLocation || selectedStateName || "National Overview";
  const isDrilledDown = selectedStateName && PILOT_LGAS[selectedStateName];

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden bg-[#071211] border border-[#142926] shadow-xl flex flex-col select-none"
      style={{ height, minHeight: "480px" }}
    >
      {/* Top Header Pill */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-[#0C1D1B]/90 border border-[#1B3B36] backdrop-blur-md">
          <span className="text-[10px] font-bold text-[#2DD4BF] uppercase tracking-wider block">
            {currentLevel.toUpperCase()} LEVEL
          </span>
          <span className="text-xs font-extrabold text-slate-100">
            {selectedStateName || "Nigeria"}
          </span>
        </div>

        {selectedStateName && (
          <button
            type="button"
            onClick={handleResetToNational}
            className="px-2.5 py-1.5 text-[11px] font-bold bg-[#142E2A] hover:bg-[#1D443E] text-[#2DD4BF] border border-[#234C44] rounded-lg transition-all"
          >
            ← Back to National
          </button>
        )}
      </div>

      {/* SVG Vector Map Canvas */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center p-4">
        <svg
          viewBox="0 0 680 600"
          className="w-full h-full max-h-[440px] transition-transform duration-500 ease-out"
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render National States View */}
          {!isDrilledDown &&
            Object.entries(NIGERIA_STATES).map(([stKey, stData]) => {
              const isHovered = hoveredLocation === stKey;
              const isSelected = selectedStateName === stKey;
              const isPilot = stData.isPilot;

              return (
                <path
                  key={stKey}
                  d={stData.d}
                  onClick={() => isPilot && handleStateClick(stKey)}
                  onMouseEnter={() => isPilot && setHoveredLocation(stKey)}
                  onMouseLeave={() => setHoveredLocation(null)}
                  className={`transition-all duration-200 ${
                    isPilot
                      ? "cursor-pointer stroke-[#2DD4BF]/60 hover:stroke-[#5EEAD4]"
                      : "cursor-default stroke-[#18312D]"
                  }`}
                  style={{
                    fill: isPilot
                      ? isSelected || isHovered
                        ? "#5EEAD4"
                        : "#2DD4BF"
                      : "#0C1B19",
                    fillOpacity: isPilot
                      ? isHovered || isSelected
                        ? 1
                        : 0.85
                      : 0.6,
                    strokeWidth: isPilot ? (isHovered ? 2.5 : 1.5) : 0.8,
                    filter:
                      isPilot && (isHovered || isSelected)
                        ? "url(#glow)"
                        : "none",
                  }}
                />
              );
            })}

          {/* Render Drilled-down LGA View for Selected State */}
          {isDrilledDown &&
            PILOT_LGAS[selectedStateName]?.map((lga, idx) => {
              const isLgaHovered = hoveredLocation === lga.name.toUpperCase();
              return (
                <g key={lga.name}>
                  <path
                    d={lga.d}
                    onClick={() => handleLgaClick(lga.name)}
                    onMouseEnter={() =>
                      setHoveredLocation(lga.name.toUpperCase())
                    }
                    onMouseLeave={() => setHoveredLocation(null)}
                    className="cursor-pointer transition-all duration-200 stroke-[#2DD4BF]"
                    style={{
                      fill: isLgaHovered ? "#5EEAD4" : "#1B4D46",
                      fillOpacity: isLgaHovered ? 1 : 0.75 + (idx % 3) * 0.08,
                      strokeWidth: isLgaHovered ? 2 : 1,
                    }}
                  />
                  <text
                    x={lga.d.split(" ")[1]}
                    y={lga.d.split(" ")[2]}
                    fill="#F1F5F9"
                    fontSize="9"
                    fontWeight="bold"
                    dx="15"
                    dy="25"
                    className="pointer-events-none"
                  >
                    {lga.name}
                  </text>
                </g>
              );
            })}
        </svg>
      </div>

      {/* Floating Bottom-Left HUD Popup (Exact match to UNICEF / Reference Image) */}
      <div className="absolute bottom-4 left-4 z-20 w-64 p-3.5 rounded-xl bg-[#081514]/95 border border-[#1B3E39] shadow-2xl backdrop-blur-md">
        <div className="text-[10px] font-bold text-[#2DD4BF] tracking-wider uppercase mb-0.5">
          {currentLevel.toUpperCase()} LEVEL
        </div>
        <div className="text-sm font-extrabold text-slate-100 capitalize mb-2.5">
          {displayName.toLowerCase()}
        </div>

        <div className="space-y-1.5 text-xs font-mono">
          <div className="flex justify-between items-center text-slate-400">
            <span>Total Households:</span>
            <span className="font-bold text-slate-100">
              {(
                hoveredStateData?.demographics?.total_hh || 11214
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Total Individuals:</span>
            <span className="font-bold text-slate-100">
              {(
                hoveredStateData?.demographics?.total_individuals || 28707
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Male:</span>
            <span className="font-bold text-[#38BDF8]">
              {(
                hoveredStateData?.demographics?.males || 15120
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-400">
            <span>Female:</span>
            <span className="font-bold text-[#F472B6]">
              {(
                hoveredStateData?.demographics?.females || 13587
              ).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom-Right Legend */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-3 px-3 py-1.5 rounded-lg bg-[#081514]/90 border border-[#142E2A] text-[11px] font-semibold text-slate-300 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#2DD4BF]" />
          <span>MDP Region</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0C1B19] border border-[#1B3E39]" />
          <span>No Data</span>
        </div>
      </div>
    </div>
  );
};

export default DrilldownMap;
