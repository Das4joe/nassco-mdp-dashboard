import type { FeatureCollection } from "geojson";
import type { GeoLevel, GeoRecord } from "../types";

// Cache to prevent duplicate network calls
const cache = new Map<string, any>();

async function fetchJson<T>(path: string): Promise<T | null> {
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const baseUrl = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const url = `${baseUrl}${cleanPath}`;

  if (cache.has(url)) {
    return cache.get(url) as T;
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    const data = await res.json();
    cache.set(url, data);
    return data as T;
  } catch (err) {
    console.warn(`[dataService] Could not load ${url}:`, err);
    return null;
  }
}

// 1. Fetch GeoJSON Boundaries (supports all GeoLevels)
export async function getGeoJson(
  level: GeoLevel,
): Promise<FeatureCollection | null> {
  let file = "geojson/nigeria-states.json";
  if (level === "state" || level === "lga") {
    file = "geojson/nigeria_lga.json";
  } else if (level === "ward" || level === "community") {
    file = "geojson/nigeria_ward.json";
  }
  return fetchJson<FeatureCollection>(file);
}

// 2. Fetch Data Summaries
export async function getNationalSummary(): Promise<GeoRecord | null> {
  return fetchJson<GeoRecord>("data/national_summary.json");
}

export async function getStatesSummary(): Promise<
  Record<string, any> | any[] | null
> {
  return fetchJson("data/states_summary.json");
}

export async function getLgaSummary(): Promise<
  Record<string, any> | any[] | null
> {
  return fetchJson("data/lga_summary.json");
}

export async function getWardSummary(): Promise<
  Record<string, any> | any[] | null
> {
  return fetchJson("data/ward_summary.json");
}
