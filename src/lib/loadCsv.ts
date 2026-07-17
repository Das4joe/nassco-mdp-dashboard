// src/lib/loadCsv.ts
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — CSV Loader
// ═══════════════════════════════════════════════════════════════
import Papa from "papaparse";

export function loadCsv(url: string): Promise<unknown[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data as unknown[]),
      error: (err: unknown) => reject(err),
    });
  });
}
