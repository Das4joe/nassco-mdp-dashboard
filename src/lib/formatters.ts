/**
 * Number & Text Formatters
 */

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-NG").format(Math.round(n));
}

export function formatCompact(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return (n / 1000).toFixed(n < 10_000 ? 1 : 0) + "K";
  if (n < 1_000_000_000) return (n / 1_000_000).toFixed(2) + "M";
  return (n / 1_000_000_000).toFixed(2) + "B";
}

export function formatPercent(n: number, decimals = 1): string {
  return `${n.toFixed(decimals)}%`;
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function titleCase(s: string): string {
  return s
    .toLowerCase()
    .split(/[\s_-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function zoneOf(state: string): string {
  const s = state.toUpperCase();
  if (s === "ABIA") return "SOUTH-EAST";
  if (s === "BENUE") return "NORTH-CENTRAL";
  if (s === "OYO") return "SOUTH-WEST";
  if (s === "SOKOTO") return "NORTH-WEST";
  return "—";
}
