export function hhColor(hh: number): string {
  if (hh > 2000) return "#08306b";
  if (hh > 1000) return "#08519c";
  if (hh > 500) return "#2171b5";
  if (hh > 200) return "#4292c6";
  if (hh > 100) return "#6baed6";
  if (hh > 50) return "#9ecae1";
  return "#c6dbef";
}
