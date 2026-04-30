// src/lib/loadCsv.ts
import Papa from "papaparse";

export async function loadCsv<T = Record<string, string>>(
  path: string
): Promise<T[]> {
  const res = await fetch(path);

  if (!res.ok) {
    throw new Error(
      `Failed to load CSV: ${path} — ${res.status} ${res.statusText}`
    );
  }

  const text = await res.text();

  return new Promise((resolve, reject) => {
    Papa.parse<T>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),   // ✅ Strip whitespace from headers
      complete: (r) => resolve(r.data),
      error: (err) => reject(err),
    });
  });
}