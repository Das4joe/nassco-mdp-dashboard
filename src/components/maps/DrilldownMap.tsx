import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import { feature } from "topojson-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Search, RotateCcw, ChevronRight } from "lucide-react";

export interface DrilldownPath {
  state?: string;
  lga?: string;
  ward?: string;
}

export interface DashboardData {
  summary?: any;
  state_metrics?: Record<string, any>;
  lga_metrics?: Record<string, any>;
  ward_metrics?: Record<string, any>;
  statesGeo?: any;
  lgasGeo?: any;
  wardsGeo?: any;
  [key: string]: any;
}

export interface DrilldownMapProps {
  data: DashboardData;
  path: DrilldownPath;
  onNavigate?: (path: DrilldownPath) => void;
  onPathChange?: (path: DrilldownPath) => void;
  selectedStateFilter?: string;
  metric?: string;
  height?: number | string;
}

// Safely scales and centers the map around the currently active polygon(s)
function MapBoundsController({ geojson }: { geojson: any }) {
  const map = useMap();
  useEffect(() => {
    if (!geojson || !geojson.features || geojson.features.length === 0 || !map)
      return;
    try {
      const layer = L.geoJSON(geojson);
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [20, 20],
          maxZoom: 11,
          animate: true,
        });
      }
    } catch (err) {
      console.warn("Could not fit map bounds:", err);
    }
  }, [geojson, map]);
  return null;
}

// Safely fetches geometry files and prevents HTML 404 SPA fallback crashes
async function loadGeoJson(filename: string): Promise<any> {
  const rawBase = import.meta.env.BASE_URL || "/";
  const cleanBase = rawBase.endsWith("/") ? rawBase.slice(0, -1) : rawBase;

  const paths = [
    `${cleanBase}/data/${filename}`.replace(/(?<!:)\/\/+/g, "/"),
    `/data/${filename}`,
    `data/${filename}`,
  ];

  for (const url of paths) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const text = await res.text();
      const trimmed = text.trim();

      // If it's an HTML page (Vercel SPA 404), skip it
      if (
        trimmed.startsWith("<") ||
        trimmed.toLowerCase().startsWith("<!doctype")
      ) {
        continue;
      }

      const parsed = JSON.parse(trimmed);
      if (parsed && (parsed.type || parsed.objects)) {
        return parsed;
      }
    } catch (err) {
      // Continue to next path candidate
    }
  }

  throw new Error(`Could not load map boundary: ${filename}`);
}

export const DrilldownMap: React.FC<DrilldownMapProps> = ({
  data,
  path,
  onNavigate,
  onPathChange,
  selectedStateFilter,
  metric: initialMetric = "vulnerability",
  height = 600,
}) => {
  const [geoData, setGeoData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<
    "vulnerability" | "households" | "poverty"
  >((initialMetric as any) || "vulnerability");
  const [hoverInfo, setHoverInfo] = useState<{
    name: string;
    val: string | number;
    extra?: string;
  } | null>(null);
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  const handleNavigation = (newPath: DrilldownPath) => {
    if (onPathChange) onPathChange(newPath);
    else if (onNavigate) onNavigate(newPath);
  };

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkTheme(document.documentElement.classList.contains("dark"));
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const activeState = path.state || selectedStateFilter;
  const currentLevel = useMemo(() => {
    if (path.ward) return "ward";
    if (path.lga) return "lga";
    if (activeState) return "state";
    return "national";
  }, [path, activeState]);

  // Load and Parse correct map boundaries
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchBoundaries = async () => {
      try {
        let rawJson: any = null;

        // Fetch based on current drilldown level
        if (currentLevel === "national" || currentLevel === "state") {
          rawJson =
            data.statesGeo || (await loadGeoJson("nigeria-states.json"));
        } else if (currentLevel === "lga") {
          rawJson = data.lgasGeo || (await loadGeoJson("nigeria_lga.json"));
        } else if (currentLevel === "ward") {
          rawJson = data.wardsGeo || (await loadGeoJson("nigeria_ward.json"));
        }

        if (!rawJson) throw new Error("No geometry data resolved");

        let parsedGeo: any = rawJson;

        // Handle TopoJSON (like NGA_adm1) -> Convert to GeoJSON
        if (rawJson.type === "Topology" && rawJson.objects) {
          const objKey = Object.keys(rawJson.objects)[0];
          if (objKey) {
            parsedGeo = feature(rawJson, rawJson.objects[objKey]);
          }
        }

        // Apply strict spatial filtering for drilldown so we only show current region
        if (parsedGeo && parsedGeo.features) {
          if (currentLevel === "lga" && activeState) {
            const target = activeState.toLowerCase();
            parsedGeo.features = parsedGeo.features.filter((f: any) => {
              const p = f.properties || {};
              const st = String(
                p.state || p.NAME_1 || p.admin1Name || "",
              ).toLowerCase();
              return st.includes(target) || target.includes(st);
            });
          } else if (currentLevel === "ward" && path.lga) {
            const target = path.lga.toLowerCase();
            parsedGeo.features = parsedGeo.features.filter((f: any) => {
              const p = f.properties || {};
              const lg = String(
                p.lga || p.NAME_2 || p.admin2Name || "",
              ).toLowerCase();
              return lg.includes(target) || target.includes(lg);
            });
          }
        }

        if (isMounted) {
          setGeoData(parsedGeo);
          setLoading(false);
        }
      } catch (err) {
        console.error("Map loading error:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchBoundaries();
    return () => {
      isMounted = false;
    };
  }, [currentLevel, activeState, path.lga, data]);

  const getFeatureName = (properties: any): string => {
    if (!properties) return "Unknown";
    if (currentLevel === "ward")
      return (
        properties.ward ||
        properties.NAME_3 ||
        properties.admin3Name ||
        properties.name ||
        "Unknown Ward"
      );
    if (currentLevel === "lga")
      return (
        properties.lga ||
        properties.NAME_2 ||
        properties.admin2Name ||
        properties.name ||
        "Unknown LGA"
      );
    return (
      properties.state ||
      properties.NAME_1 ||
      properties.admin1Name ||
      properties.name ||
      "Unknown State"
    );
  };

  // Extracts metric value strictly from real data. Returns null if region has no NASSCO data.
  const getMetricValue = (
    name: string,
  ): { val: number; label: string } | null => {
    const cleanName = name.toLowerCase().trim();
    let metricsObj: Record<string, any> | undefined = undefined;

    if (currentLevel === "national" || currentLevel === "state")
      metricsObj = data.state_metrics;
    else if (currentLevel === "lga") metricsObj = data.lga_metrics;
    else if (currentLevel === "ward") metricsObj = data.ward_metrics;

    if (metricsObj) {
      const matchKey = Object.keys(metricsObj).find((k) =>
        k.toLowerCase().trim().includes(cleanName),
      );
      if (matchKey && metricsObj[matchKey]) {
        const m = metricsObj[matchKey];
        if (selectedMetric === "vulnerability")
          return {
            val: m.vulnerability_rate || 0,
            label: `${(m.vulnerability_rate || 0).toFixed(1)}% Vulnerable`,
          };
        if (selectedMetric === "households")
          return {
            val: m.households || 0,
            label: `${(m.households || 0).toLocaleString()} Households`,
          };
        if (selectedMetric === "poverty")
          return {
            val: m.poverty_rate || 0,
            label: `${(m.poverty_rate || 0).toFixed(1)}% Poverty`,
          };
      }
    }

    // Returns null to prevent fabricating colors for states outside your dataset
    return null;
  };

  const getColor = (val: number) => {
    if (selectedMetric === "households") {
      if (val > 10000) return "#065f46";
      if (val > 5000) return "#047857";
      if (val > 2000) return "#10b981";
      if (val > 500) return "#34d399";
      return "#6ee7b7";
    }
    if (val >= 40) return "#991b1b";
    if (val >= 30) return "#c2410c";
    if (val >= 20) return "#d97706";
    if (val >= 10) return "#059669";
    return "#10b981";
  };

  const styleFeature = (featureItem: any) => {
    const name = getFeatureName(featureItem.properties);
    const metric = getMetricValue(name);
    const isMatchesSearch = searchQuery
      ? name.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    // If region has no data (e.g., non-target states), render as a dark grey silhouette
    if (!metric) {
      return {
        fillColor: isDarkTheme ? "#1e293b" : "#f1f5f9",
        weight: 0.8,
        color: isDarkTheme ? "#334155" : "#cbd5e1",
        fillOpacity: 0.6,
      };
    }

    return {
      fillColor: getColor(metric.val),
      weight: isMatchesSearch ? 1.5 : 0.5,
      opacity: 1,
      color: isDarkTheme ? "#475569" : "#94a3b8",
      fillOpacity: isMatchesSearch ? 0.9 : 0.3,
    };
  };

  const onEachFeature = (featureItem: any, layer: L.Layer) => {
    const name = getFeatureName(featureItem.properties);
    const metric = getMetricValue(name);

    if (!metric) {
      // Inactive states get a basic tooltip indicating no survey data
      layer.bindTooltip(`${name} (No Survey Data)`, {
        direction: "auto",
        className: "text-xs text-slate-500 bg-slate-900 border-slate-700",
      });
      return;
    }

    layer.on({
      mouseover: (e) => {
        const l = e.target;
        l.setStyle({ weight: 3, color: "#38bdf8", fillOpacity: 1 });
        if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
          l.bringToFront();
        }
        setHoverInfo({
          name,
          val: metric.label,
          extra: `Click to drill down into ${name}`,
        });
      },
      mouseout: (e) => {
        const l = e.target;
        l.setStyle(styleFeature(featureItem));
        setHoverInfo(null);
      },
      click: () => {
        if (currentLevel === "national" || currentLevel === "state")
          handleNavigation({ state: name });
        else if (currentLevel === "lga")
          handleNavigation({ state: activeState, lga: name });
        else if (currentLevel === "ward")
          handleNavigation({ state: activeState, lga: path.lga, ward: name });
      },
    });
  };

  const mapBgColor = isDarkTheme ? "#0f172a" : "#f8fafc";
  const containerHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 flex flex-col shadow-xl"
      style={{ height: containerHeight }}
    >
      {/* Top Map Toolbar & Navigation Breadcrumbs */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 dark:bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-700/60 shadow-lg">
        <div className="flex items-center space-x-2 text-sm font-semibold">
          <button
            onClick={() => handleNavigation({})}
            className={`px-2.5 py-1 rounded-md transition-all ${
              currentLevel === "national"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
            }`}
          >
            Nigeria
          </button>
          {activeState && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <button
                onClick={() => handleNavigation({ state: activeState })}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currentLevel === "lga"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {activeState}
              </button>
            </>
          )}
          {path.lga && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <button
                onClick={() =>
                  handleNavigation({ state: activeState, lga: path.lga })
                }
                className={`px-2.5 py-1 rounded-md transition-all ${
                  currentLevel === "ward"
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                }`}
              >
                {path.lga}
              </button>
            </>
          )}
          {path.ward && (
            <>
              <ChevronRight className="w-4 h-4 text-slate-500" />
              <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">
                {path.ward}
              </span>
            </>
          )}
        </div>

        {/* Metric Controls & Search */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${currentLevel}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs rounded-md bg-slate-800 border border-slate-700 text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-44"
            />
          </div>

          <div className="flex bg-slate-800 p-0.5 rounded-md border border-slate-700 text-xs">
            <button
              onClick={() => setSelectedMetric("vulnerability")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedMetric === "vulnerability"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Vulnerability
            </button>
            <button
              onClick={() => setSelectedMetric("households")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                selectedMetric === "households"
                  ? "bg-emerald-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Households
            </button>
          </div>

          {(activeState || path.lga || path.ward) && (
            <button
              onClick={() => handleNavigation({})}
              title="Reset View to National"
              className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700 transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Tile-Free Vector Map */}
      <div
        className="w-full h-full relative"
        style={{ backgroundColor: mapBgColor }}
      >
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-slate-300 text-sm font-semibold tracking-wide">
              Resolving Geographic Boundaries...
            </p>
          </div>
        )}

        <MapContainer
          center={[9.082, 8.6753]} // Default Nigeria center
          zoom={6}
          zoomControl={false}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%", backgroundColor: mapBgColor }}
          className="z-0"
        >
          {geoData && geoData.features && (
            <>
              <GeoJSON
                key={`${currentLevel}-${activeState || "nat"}-${path.lga || ""}-${selectedMetric}`}
                data={geoData}
                style={styleFeature}
                onEachFeature={onEachFeature}
              />
              <MapBoundsController geojson={geoData} />
            </>
          )}
        </MapContainer>
      </div>

      {/* Interactive Tooltip Card */}
      {hoverInfo && (
        <div className="absolute bottom-6 left-6 z-[1000] bg-slate-900/90 border border-emerald-500/50 p-3 rounded-lg shadow-xl backdrop-blur-md max-w-xs pointer-events-none">
          <p className="text-xs text-emerald-400 uppercase font-bold tracking-wider">
            {currentLevel}
          </p>
          <h4 className="text-base font-bold text-white">{hoverInfo.name}</h4>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            {hoverInfo.val}
          </p>
          {hoverInfo.extra && (
            <p className="text-xs text-slate-400 mt-1 italic">
              {hoverInfo.extra}
            </p>
          )}
        </div>
      )}

      {/* Dynamic Vector Choropleth Map Legend */}
      <div className="absolute bottom-6 right-6 z-[1000] bg-slate-900/90 dark:bg-slate-900/95 border border-slate-700/80 p-3 rounded-lg shadow-lg backdrop-blur-md text-xs pointer-events-none">
        <div className="font-semibold text-slate-300 mb-2 flex items-center justify-between gap-4">
          <span>
            {selectedMetric === "vulnerability"
              ? "Vulnerability Rate"
              : "Total Households"}
          </span>
          <span className="text-[10px] text-emerald-400 font-mono">
            SVG Vector
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {selectedMetric === "vulnerability" ? (
            <>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#10b981]" />
                <span className="text-[10px] text-slate-400 mt-1">&lt;10%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#059669]" />
                <span className="text-[10px] text-slate-400 mt-1">10%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#d97706]" />
                <span className="text-[10px] text-slate-400 mt-1">20%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#c2410c]" />
                <span className="text-[10px] text-slate-400 mt-1">30%</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#991b1b]" />
                <span className="text-[10px] text-slate-400 mt-1">40%+</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#6ee7b7]" />
                <span className="text-[10px] text-slate-400 mt-1">Low</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#34d399]" />
                <span className="text-[10px] text-slate-400 mt-1">Med</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#10b981]" />
                <span className="text-[10px] text-slate-400 mt-1">High</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="w-5 h-3 rounded-sm bg-[#065f46]" />
                <span className="text-[10px] text-slate-400 mt-1">
                  Very High
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrilldownMap;
