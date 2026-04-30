// src/lib/normalize.ts
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — String Normalization
// Ensures CSV names match GeoJSON properties
// ═══════════════════════════════════════════════════════════════

export const normalize = (v: unknown): string =>
  String(v ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")  // remove accents
    .replace(/['"`’‘]/g, "")          // remove quotes
    .replace(/[-–—_]/g, " ")          // hyphens to spaces
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

// ✅ CRITICAL: Maps normalized names to canonical GeoJSON names
// This fixes the truncation issues in nigeria_lga.json
export const LGA_NAME_MAP: Record<string, string> = {
  // OYO - known truncations
  "ORI IRE": "ORI-IRE",
  "OGO OLUWA": "OGO-OLUW",
  "OGO OLUW": "OGO-OLUW",      // ✅ FIX: GeoJSON truncated version
  "OGO OLUWA": "OGO-OLUW",

  // BENUE
  "GWER EAST": "GWER EAST",
  "GWER WEST": "GWER WEST",

  // ABIA - truncated
  "ISUIKWUATO": "ISUIKWUA",
  "ISUIKWUA": "ISUIKWUA",

  // Common hyphen variants
  "IBADAN NORTH EAST": "IBADAN NORTH-EAST",
  "IBADAN SOUTH WEST": "IBADAN SOUTH-WEST",
  "IBADAN NORTH WEST": "IBADAN NORTH-WEST",
  "IBADAN SOUTH EAST": "IBADAN SOUTH-EAST",
};

export const normalizeLGA = (v: unknown): string => {
  const key = normalize(v);
  return LGA_NAME_MAP[key] ?? key;
};

export const communityKey = (r: any): string =>
  [
    normalize(r.state ?? r.State),
    normalizeLGA(r.lga ?? r.LGA),
    normalize(r.ward ?? r.Ward),
    normalize(r.community_name ?? r.Community),
  ].join("||");