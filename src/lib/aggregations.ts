// src/lib/aggregations.ts
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — Data Aggregation Utilities
// Confirmed CSV columns: 'state', 'lga', 'state_shp', 'lga_shp'
// Each CSV row = 1 enumerated household
// ═══════════════════════════════════════════════════════════════

import { normalize, normalizeLGA } from "./normalize";

// ── Intervention states — normalized uppercase keys ────────────
export const INTERVENTION_STATES = new Set<string>([
  "OYO",
  "BENUE",
  "SOKOTO",
  "ABIA",
]);

// ── Display names must match theme.ts STATE_COLORS keys exactly ─
const STATE_DISPLAY: Record<string, string> = {
  OYO:    "Oyo",
  BENUE:  "Benue",
  SOKOTO: "Sokoto",
  ABIA:   "Abia",
};

// ── Exported types ─────────────────────────────────────────────
export type StateAgg = {
  state: string;           // Display name e.g. "Oyo"
  normalizedState: string; // Normalized key e.g. "OYO"
  hh: number;              // Total enumerated households
  lgaCount: number;        // Number of distinct LGAs
};

export type LgaAgg = {
  lga: string;             // Display name e.g. "Ibadan North"
  normalizedLga: string;   // Normalized key for GeoJSON matching
  state: string;           // Parent state display name
  hh: number;              // Total enumerated households
};

// ── Pick first non-empty value from multiple possible keys ──────
function pick(
  row: Record<string, unknown>,
  keys: string[]
): unknown {
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && String(v).trim() !== "") {
      return v;
    }
  }
  return undefined;
}

// ── Get household count from a row ─────────────────────────────
// Since each CSV row = 1 enumerated household in this dataset,
// we default to 1. But we also check common pre-aggregated fields.
function getHH(row: Record<string, unknown>): number {
  const raw = pick(row, [
    "total_pvhh",
    "TOTAL_PVHH",
    "total_hh",
    "TOTAL_HH",
    "hh",
    "HH",
    "households",
    "HOUSEHOLDS",
    "count",
    "COUNT",
    "enumerated_hh",
  ]);
  const n = Number(raw);
  // Return parsed number if valid and positive, otherwise count row as 1 HH
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
}

// ── Convert string to Title Case ───────────────────────────────
function toTitle(s: string): string {
  return s
    .toLowerCase()
    .split(/[\s\-_]+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

// ── Confirmed CSV field names from console output ──────────────
// Primary:  "state", "lga"
// Fallback: "state_shp", "lga_shp"
const STATE_KEYS = ["state", "State", "STATE", "state_shp"];
const LGA_KEYS   = ["lga",   "LGA",   "Lga",   "lga_shp"];

// ══════════════════════════════════════════════════════════════
// byState — Aggregate all rows into per-state summaries
// ══════════════════════════════════════════════════════════════
export function byState(
  rows: Record<string, unknown>[]
): StateAgg[] {
  const stateMap     = new Map<string, StateAgg>();
  const lgasPerState = new Map<string, Set<string>>();

  for (const r of rows) {
    // Extract state value using confirmed column names
    const rawState = pick(r, STATE_KEYS);
    const ns       = normalize(rawState);

    // Skip rows that do not belong to intervention states
    if (!INTERVENTION_STATES.has(ns)) continue;

    // Extract LGA value using confirmed column names
    const rawLga = pick(r, LGA_KEYS);
    const nl     = normalizeLGA(rawLga);
    const hh     = getHH(r);

    // Initialise state entry on first encounter
    if (!stateMap.has(ns)) {
      stateMap.set(ns, {
        state:           STATE_DISPLAY[ns] ?? toTitle(String(rawState ?? ns)),
        normalizedState: ns,
        hh:              0,
        lgaCount:        0,
      });
      lgasPerState.set(ns, new Set<string>());
    }

    // Accumulate HH count
    stateMap.get(ns)!.hh += hh;

    // Track distinct LGAs for this state
    if (nl) {
      lgasPerState.get(ns)!.add(nl);
    }
  }

  // Attach LGA counts to each state entry
  for (const [ns, entry] of stateMap) {
    entry.lgaCount = lgasPerState.get(ns)?.size ?? 0;
  }

  // Log summary for debugging
  console.log(
    "byState result:",
    [...stateMap.values()].map((s) => `${s.state}: ${s.hh} HHs, ${s.lgaCount} LGAs`)
  );

  // Return sorted alphabetically by display name
  return [...stateMap.values()].sort((a, b) =>
    a.state.localeCompare(b.state)
  );
}

// ══════════════════════════════════════════════════════════════
// byLga — Aggregate rows for one state into per-LGA summaries
// ══════════════════════════════════════════════════════════════
export function byLga(
  rows: Record<string, unknown>[],
  stateName: string
): LgaAgg[] {
  const ns     = normalize(stateName);
  const lgaMap = new Map<string, LgaAgg>();

  for (const r of rows) {
    // Only process rows belonging to the selected state
    const rawState = pick(r, STATE_KEYS);
    if (normalize(rawState) !== ns) continue;

    // Extract LGA
    const rawLga = pick(r, LGA_KEYS);
    const nl     = normalizeLGA(rawLga);

    // Skip rows with no LGA value
    if (!nl) continue;

    const hh = getHH(r);

    // Initialise LGA entry on first encounter
    if (!lgaMap.has(nl)) {
      lgaMap.set(nl, {
        lga:           String(rawLga).trim(),
        normalizedLga: nl,
        state:         STATE_DISPLAY[ns] ?? toTitle(stateName),
        hh:            0,
      });
    }

    // Accumulate HH count
    lgaMap.get(nl)!.hh += hh;
  }

  // Log for debugging
  console.log(
    `byLga(${stateName}): ${lgaMap.size} LGAs found`,
    [...lgaMap.values()].map((l) => `${l.lga}: ${l.hh}`)
  );

  // Return sorted by HH count descending (highest first)
  return [...lgaMap.values()].sort((a, b) => b.hh - a.hh);
}