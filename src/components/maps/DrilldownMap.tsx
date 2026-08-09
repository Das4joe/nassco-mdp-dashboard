// src/components/maps/DrilldownMap.tsx
import { useEffect, useMemo, useState } from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import { feature as topoFeature } from "topojson-client";

import type { FeatureCollection } from "geojson";
import type { DashboardData } from "../../lib/loadData";
import type { DashboardMode, DrilldownPath, GeoRecord } from "../../lib/types";
import { THEME, modeScale } from "../../theme";
import { formatNumber, formatPercent } from "../../lib/formatters";

type AnyFC = FeatureCollection<any, any>;

let STATES_CACHE: AnyFC | null = null;
let LGA_CACHE: AnyFC | null = null;

function normUpper(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toUpperCase();
}
function normLower(v: unknown): string {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function metricValue(rec: GeoRecord, mode: DashboardMode): number {
  if (mode === "nsr") return Number(rec.nsr.nin_verification_rate ?? 0);
  return Number(rec.vulnerability.poorest_pct ?? 0);
}

function metricLabel(rec: GeoRecord, mode: DashboardMode): string {
  if (mode === "nsr") {
    return `NIN Verified: <b>${formatPercent(rec.nsr.nin_verification_rate)}</b>`;
  }
  return `Poorest (D1–D3): <b>${formatPercent(rec.vulnerability.poorest_pct)}</b>`;
}

/**
 * Vivid color mapping.
 * We stretch a 0-100 metric across the 8-step scale but bias upward so
 * mid-range values (e.g. NIN 50%) don't land on the almost-white steps.
 * Anything at or below 10 uses step 1; anything at/above 80 uses top step.
 */
function colorFor(value: number, mode: DashboardMode): string {
  const scale = modeScale(mode);
  const v = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const t = Math.pow(v / 100, 0.75);
  const idx = Math.min(
    scale.length - 1,
    Math.max(1, Math.floor(t * scale.length)),
  );
  return scale[idx];
}

async function loadStates(): Promise<AnyFC> {
  if (STATES_CACHE) return STATES_CACHE;
  const res = await fetch("/geojson/nigeria-states.json");
  if (!res.ok) throw new Error(`Failed to load nigeria-states.json`);
  const topo = (await res.json()) as any;
  const obj = topo?.objects?.NGA_adm1;
  if (!obj) {
    throw new Error(
      `nigeria-states.json is TopoJSON but objects.NGA_adm1 not found`,
    );
  }
  const fc = topoFeature(topo, obj) as unknown as AnyFC;
  STATES_CACHE = fc;
  return fc;
}

async function loadLgas(): Promise<AnyFC> {
  if (LGA_CACHE) return LGA_CACHE;
  const res = await fetch("/geojson/nigeria_lga.json");
  if (!res.ok) throw new Error(`Failed to load nigeria_lga.json`);
  const fc = (await res.json()) as AnyFC;
  LGA_CACHE = fc;
  return fc;
}

function FitBounds({ geo }: { geo: AnyFC | null }) {
  const map = useMap();
  useEffect(() => {
    if (!geo) return;
    const bounds = L.geoJSON(geo as any).getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [24, 24] });
    }
  }, [geo, map]);
  return null;
}

function InvalidateOnMount() {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => map.invalidateSize(), 100);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

/** Shared tooltip HTML builder — used at both state and LGA level */
function buildTooltip(opts: {
  title: string;
  households: number | null;
  individuals: number | null;
  metricHtml: string | null;
  note?: string;
}): string {
  const { title, households, individuals, metricHtml, note } = opts;

  const hhLine =
    households !== null
      ? `<div style="margin-top:4px;">
           <span style="color:#667781;">Households:</span>
           <b style="margin-left:4px;">${formatNumber(households)}</b>
         </div>`
      : "";

  const indLine =
    individuals !== null
      ? `<div>
           <span style="color:#667781;">Individuals:</span>
           <b style="margin-left:4px;">${formatNumber(individuals)}</b>
         </div>`
      : "";

  const metricLine = metricHtml
    ? `<div style="margin-top:5px; padding-top:5px; border-top:1px solid #E9EDEF;">
         ${metricHtml}
       </div>`
    : "";

  const noteLine = note
    ? `<div style="margin-top:4px; font-size:11px; color:#8696A0;">${note}</div>`
    : "";

  return `
    <div style="
      font-family: inherit;
      padding: 10px 12px;
      min-width: 190px;
      max-width: 240px;
      line-height: 1.5;
    ">
      <div style="font-weight:700; font-size:13px; margin-bottom:2px;">${title}</div>
      ${hhLine}
      ${indLine}
      ${metricLine}
      ${noteLine}
    </div>
  `;
}

interface DrilldownMapProps {
  data: DashboardData;
  path: DrilldownPath;
  mode: DashboardMode;
  isDark: boolean;
  onPathChange: (next: DrilldownPath) => void;
}

export default function DrilldownMap({
  data,
  path,
  mode,
  isDark,
  onPathChange,
}: DrilldownMapProps) {
  const [statesFc, setStatesFc] = useState<AnyFC | null>(null);
  const [lgaFc, setLgaFc] = useState<AnyFC | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    Promise.all([loadStates(), loadLgas()])
      .then(([s, l]) => {
        if (!mounted) return;
        setStatesFc(s);
        setLgaFc(l);
      })
      .catch((e) => {
        if (!mounted) return;
        setGeoError(String(e));
      });
    return () => {
      mounted = false;
    };
  }, []);

  const mdpStates = useMemo(() => {
    return new Set((data.metadata.mdp_states ?? []).map((s) => normUpper(s)));
  }, [data.metadata.mdp_states]);

  const stateIndex = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.states) m.set(normUpper(r.state), r);
    return m;
  }, [data.states]);

  const lgaIndex = useMemo(() => {
    const m = new Map<string, GeoRecord>();
    for (const r of data.lgas) {
      const k = `${normUpper(r.state)}|${normLower(r.lga)}`;
      m.set(k, r);
    }
    return m;
  }, [data.lgas]);

  const level: "national" | "state" = path.state ? "state" : "national";

  const viewGeo: AnyFC | null = useMemo(() => {
    if (!statesFc) return null;
    if (level === "national") return statesFc;
    if (!lgaFc) return null;
    const s = normUpper(path.state);
    const filtered = {
      ...lgaFc,
      features: lgaFc.features.filter(
        (f: any) => normUpper(f?.properties?.NAME_1) === s,
      ),
    } as AnyFC;
    return filtered;
  }, [statesFc, lgaFc, level, path.state]);

  const border = isDark ? "#2A4A40" : "#B5C3BF";
  const nonMdpFill = isDark ? "#243530" : "#D5DDD9";

  const geoStyle = (feat: any) => {
    if (!feat?.properties) {
      return {
        color: border,
        weight: 1,
        fillOpacity: 1,
        fillColor: nonMdpFill,
      };
    }

    if (level === "national") {
      const name = feat.properties.NAME_1;
      const key = normUpper(name);
      if (key === "WATER BODY") return { opacity: 0, fillOpacity: 0 };

      const isMdp = mdpStates.has(key);
      const rec = stateIndex.get(key);
      const selected = path.state && normUpper(path.state) === key;

      if (!isMdp || !rec) {
        return {
          color: border,
          weight: selected ? 2.5 : 0.8,
          fillOpacity: 1,
          fillColor: nonMdpFill,
        };
      }

      const val = metricValue(rec, mode);
      return {
        color: selected ? THEME.brand.primaryLight : border,
        weight: selected ? 2.5 : 1,
        fillOpacity: 1,
        fillColor: colorFor(val, mode),
      };
    }

    // LGA-level view
    const lgaName = feat.properties.NAME_2;
    const s = normUpper(path.state);
    const k = `${s}|${normLower(lgaName)}`;
    const rec = lgaIndex.get(k);
    const selected = path.lga && normLower(path.lga) === normLower(lgaName);

    if (!rec) {
      return {
        color: border,
        weight: selected ? 2.5 : 0.8,
        fillOpacity: 1,
        fillColor: nonMdpFill,
      };
    }

    const val = metricValue(rec, mode);
    return {
      color: selected ? THEME.brand.primaryLight : border,
      weight: selected ? 2.5 : 1,
      fillOpacity: 1,
      fillColor: colorFor(val, mode),
    };
  };

  const onEach = (feat: any, layer: L.Layer) => {
    const l = layer as L.Path;

    if (level === "national") {
      const name = feat?.properties?.NAME_1;
      const key = normUpper(name);
      if (key === "WATER BODY") return;

      const isMdp = mdpStates.has(key);
      const rec = stateIndex.get(key);

      if (!isMdp || !rec) {
        // Non-MDP state — show name + "Not in MDP scope", no counts
        l.bindTooltip(
          buildTooltip({
            title: String(name ?? "Unknown"),
            households: null,
            individuals: null,
            metricHtml: null,
            note: "Not in MDP scope",
          }),
          { sticky: true, direction: "top", opacity: 0.97 },
        );
        return;
      }

      // MDP state — show full counts + metric
      l.bindTooltip(
        buildTooltip({
          title: String(name ?? "Unknown"),
          households: rec.nsr.total_households,
          individuals: rec.nsr.total_individuals,
          metricHtml: metricLabel(rec, mode),
        }),
        { sticky: true, direction: "top", opacity: 0.97 },
      );

      l.on("click", () => {
        onPathChange({ state: key });
      });

      return;
    }

    // LGA level
    const lgaName = feat?.properties?.NAME_2;
    const stateName = feat?.properties?.NAME_1;
    const s = normUpper(path.state ?? stateName);
    const k = `${s}|${normLower(lgaName)}`;
    const rec = lgaIndex.get(k);

    if (!rec) {
      // LGA with no survey records — show name only
      l.bindTooltip(
        buildTooltip({
          title: String(lgaName ?? "Unknown"),
          households: null,
          individuals: null,
          metricHtml: null,
          note: "No survey records",
        }),
        { sticky: true, direction: "top", opacity: 0.97 },
      );
      return;
    }

    // LGA with survey data — full tooltip
    l.bindTooltip(
      buildTooltip({
        title: `${String(lgaName ?? "Unknown")} LGA`,
        households: rec.nsr.total_households,
        individuals: rec.nsr.total_individuals,
        metricHtml: metricLabel(rec, mode),
      }),
      { sticky: true, direction: "top", opacity: 0.97 },
    );

    // Click popup — more detail, consistent with tooltip data
    const popup = `
      <div style="
        font-family: inherit;
        padding: 12px 14px 10px;
        min-width: 220px;
        line-height: 1.6;
      ">
        <div style="font-weight:700; font-size:14px; margin-bottom:6px;">
          ${String(lgaName ?? "")} LGA
        </div>
        <div>
          <span style="color:#667781;">Households:</span>
          <b style="margin-left:4px;">${formatNumber(rec.nsr.total_households)}</b>
        </div>
        <div>
          <span style="color:#667781;">Individuals:</span>
          <b style="margin-left:4px;">${formatNumber(rec.nsr.total_individuals)}</b>
        </div>
        <div style="margin-top:8px; padding-top:8px; border-top:1px solid #E9EDEF;">
          <div>
            <span style="color:#667781;">NIN Verified:</span>
            <b style="margin-left:4px;">${formatPercent(rec.nsr.nin_verification_rate)}</b>
          </div>
          <div>
            <span style="color:#667781;">PMT Mean:</span>
            <b style="margin-left:4px;">${rec.vulnerability.pmt_mean.toFixed(2)}</b>
          </div>
          <div>
            <span style="color:#667781;">Poorest (D1–D3):</span>
            <b style="margin-left:4px;">${formatPercent(rec.vulnerability.poorest_pct)}</b>
          </div>
        </div>
      </div>
    `;
    (layer as any).bindPopup(popup, { closeButton: true });

    l.on("click", () => {
      if (!lgaName) return;
      onPathChange({ state: s, lga: String(lgaName) });
    });
  };

  const legend = useMemo(() => {
    const scale = modeScale(mode);
    const label =
      mode === "nsr" ? "NIN verification rate" : "Poorest households (D1–D3)";
    return { scale, label };
  }, [mode]);

  if (geoError) {
    return (
      <div
        className="flex items-center justify-center text-status-danger p-6"
        style={{ height: "100%", width: "100%" }}
      >
        {geoError}
      </div>
    );
  }

  return (
    <div className="relative" style={{ height: "100%", width: "100%" }}>
      {/* Back-to-Nigeria button */}
      <div className="absolute z-[1000] top-3 left-3 flex items-center gap-2">
        {path.state && (
          <button
            className="px-3 py-1.5 rounded-lg text-sm font-semibold border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card"
            onClick={() => onPathChange({})}
          >
            ← Nigeria
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute z-[1000] bottom-3 left-3 rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card p-3">
        <div className="text-xs font-semibold mb-2 text-ink-primary dark:text-ink-onDark">
          {legend.label}
        </div>
        <div className="flex items-center gap-1">
          {legend.scale.map((c) => (
            <div
              key={c}
              style={{ background: c }}
              className="w-6 h-3 rounded-sm"
            />
          ))}
        </div>
        <div className="flex justify-between text-[10px] mt-1 text-ink-muted dark:text-ink-onDarkMuted">
          <span>0%</span>
          <span>100%</span>
        </div>

        {path.state && !path.lga && (
          <div className="mt-2 text-[11px] text-ink-muted dark:text-ink-onDarkMuted">
            Click an LGA to drill down
          </div>
        )}
        {path.lga && (
          <div className="mt-2 text-[11px] text-ink-muted dark:text-ink-onDarkMuted">
            Ward-level map coming next
          </div>
        )}
      </div>

      <MapContainer
        center={[9.08, 8.67]}
        zoom={6}
        minZoom={5}
        maxZoom={9}
        scrollWheelZoom={false}
        zoomControl={true}
        attributionControl={false}
        maxBounds={[
          [3.0, 1.5],
          [14.8, 15.8],
        ]}
        maxBoundsViscosity={1.0}
        style={{ height: "100%", width: "100%" }}
      >
        <InvalidateOnMount />

        {viewGeo && (
          <>
            <GeoJSON
              key={`${level}-${path.state ?? "ng"}-${path.lga ?? ""}-${mode}`}
              data={viewGeo as any}
              style={geoStyle as any}
              onEachFeature={onEach as any}
            />
            <FitBounds geo={viewGeo} />
          </>
        )}
      </MapContainer>
    </div>
  );
}
