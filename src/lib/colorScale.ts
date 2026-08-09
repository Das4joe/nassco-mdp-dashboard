/**
 * Choropleth Color Scale
 * Maps numeric values to colors for map fills, mode-aware.
 */

import { THEME, type DashboardMode } from "../theme";

export function getChoroplethColor(
  value: number,
  min: number,
  max: number,
  mode: DashboardMode,
): string {
  const scale = mode === "nsr" ? THEME.nsr.scale : THEME.upd.scale;

  if (max <= min || value <= min) return scale[0];
  if (value >= max) return scale[scale.length - 1];

  const pct = (value - min) / (max - min);
  const idx = Math.min(scale.length - 1, Math.floor(pct * scale.length));
  return scale[idx];
}

export interface LegendBin {
  label: string;
  color: string;
  from: number;
  to: number;
}

export function buildLegendBins(
  min: number,
  max: number,
  mode: DashboardMode,
  formatter: (n: number) => string,
): LegendBin[] {
  const scale = mode === "nsr" ? THEME.nsr.scale : THEME.upd.scale;
  const steps = 5;
  const step = (max - min) / steps;

  const bins: LegendBin[] = [];
  for (let i = 0; i < steps; i++) {
    const from = min + step * i;
    const to = min + step * (i + 1);
    const idx = Math.min(
      scale.length - 1,
      Math.floor((i / steps) * scale.length),
    );
    bins.push({
      label: `${formatter(from)} – ${formatter(to)}`,
      color: scale[idx],
      from,
      to,
    });
  }
  return bins;
}

export function getNonMdpColor(isDark: boolean): string {
  return isDark ? THEME.nonMdp.fillDark : THEME.nonMdp.fill;
}
