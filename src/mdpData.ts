/* mdpData.ts
   Safe, mutable, normalized data layer
*/

export type RawRow = Record<string, unknown>;

export type MdpRow = {
  id: string;
  state: string;
  lga: string;
  ward: string;
  zone: string;
  indicator: string;
  value: number;
  year: number | null;
  sex: string;
  source: string;
};

export const MDP_RAW: RawRow[] = [
  // ⬅️ paste your existing raw data objects here
  // DO NOT use `as const`
];

const s = (v: unknown): string =>
  v === null || v === undefined ? "" : String(v).trim();

const n = (v: unknown): number => {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const x = Number(v.replace(/,/g, ""));
    return Number.isFinite(x) ? x : 0;
  }
  return 0;
};

const year = (v: unknown): number | null => {
  const y = Number(v);
  return Number.isFinite(y) ? y : null;
};

const pick = (o: RawRow, keys: string[]) =>
  keys.find((k) => o[k] !== undefined)
    ? o[keys.find((k) => o[k] !== undefined)!]
    : undefined;

export const MDP_DATA: MdpRow[] = MDP_RAW.map((r, i) => ({
  id: `row-${i}`,
  state: s(pick(r, ["state", "State", "STATE"])),
  lga: s(pick(r, ["lga", "LGA"])),
  ward: s(pick(r, ["ward", "Ward"])),
  zone: s(pick(r, ["zone", "Zone"])),
  indicator: s(pick(r, ["indicator", "Indicator", "metric"])),
  value: n(pick(r, ["value", "Value", "total", "Total"])),
  year: year(pick(r, ["year", "Year"])),
  sex: s(pick(r, ["sex", "Sex", "gender"])),
  source: s(pick(r, ["source", "Source"])),
})).filter((r) => r.state || r.indicator);
