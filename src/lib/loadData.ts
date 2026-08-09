/**
 * Data Loader
 * Fetches all pre-aggregated JSON files from public/data/.
 * Files are cached in memory after first load.
 */

import type { GeoRecord, TimeseriesPoint, DataMetadata } from "./types";

let cache: DashboardData | null = null;

export interface DashboardData {
  national: GeoRecord;
  states: GeoRecord[];
  lgas: GeoRecord[];
  wards: GeoRecord[];
  communities: GeoRecord[];
  timeseries: TimeseriesPoint[];
  metadata: DataMetadata;
}

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function loadAllData(): Promise<DashboardData> {
  if (cache) return cache;

  const [national, states, lgas, wards, communities, timeseries, metadata] =
    await Promise.all([
      fetchJson<GeoRecord>("/data/national_summary.json"),
      fetchJson<GeoRecord[]>("/data/states_summary.json"),
      fetchJson<GeoRecord[]>("/data/lga_summary.json"),
      fetchJson<GeoRecord[]>("/data/ward_summary.json"),
      fetchJson<GeoRecord[]>("/data/community_summary.json"),
      fetchJson<TimeseriesPoint[]>("/data/timeseries.json"),
      fetchJson<DataMetadata>("/data/metadata.json"),
    ]);

  cache = { national, states, lgas, wards, communities, timeseries, metadata };
  return cache;
}

export function invalidateCache(): void {
  cache = null;
}
