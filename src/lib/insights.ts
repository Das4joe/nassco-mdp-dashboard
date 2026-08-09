/**
 * Auto-Insight Engine
 * Generates flags (red/yellow/green) and rankings for the sidebar.
 */

import type {
  GeoRecord,
  InsightFlag,
  RankedItem,
  DashboardMode,
  DrilldownPath,
} from "./types";
import { formatNumber, formatPercent, titleCase } from "./formatters";

function inScope(rec: GeoRecord, path: DrilldownPath): boolean {
  if (path.state && rec.state !== path.state) return false;
  if (path.lga && rec.lga !== path.lga) return false;
  if (path.ward && rec.ward !== path.ward) return false;
  return true;
}

export function generateInsights(
  national: GeoRecord,
  states: GeoRecord[],
  lgas: GeoRecord[],
  path: DrilldownPath,
  mode: DashboardMode,
): InsightFlag[] {
  const flags: InsightFlag[] = [];
  const nationalNinRate = national.nsr.nin_verification_rate;

  if (mode === "nsr") {
    states.forEach((s) => {
      const rate = s.nsr.nin_verification_rate;
      const gap = rate - nationalNinRate;

      if (gap < -15) {
        flags.push({
          severity: "danger",
          title: `${titleCase(s.state!)}: NIN rate ${formatPercent(rate)}`,
          detail: `${Math.abs(gap).toFixed(1)}pp below national average (${formatPercent(nationalNinRate)})`,
          location: s.state,
        });
      } else if (gap > 10) {
        flags.push({
          severity: "success",
          title: `${titleCase(s.state!)}: strong NIN performance`,
          detail: `${formatPercent(rate)} verified — ${gap.toFixed(1)}pp above average`,
          location: s.state,
        });
      }
    });
  }

  const scopedLgas = lgas.filter((l) => inScope(l, path));
  const lowCount = scopedLgas.filter(
    (l) => l.nsr.total_households < 100,
  ).length;
  if (lowCount > 0) {
    flags.push({
      severity: "warning",
      title: `${lowCount} LGA${lowCount === 1 ? "" : "s"} with <100 households`,
      detail: `Consider re-mobilization or verification of coverage`,
    });
  }

  if (path.state) {
    const stateLgas = lgas.filter((l) => l.state === path.state);
    const withData = stateLgas.filter((l) => l.nsr.total_households > 0).length;
    const coverage =
      stateLgas.length > 0 ? (withData / stateLgas.length) * 100 : 0;

    if (coverage >= 90) {
      flags.push({
        severity: "success",
        title: `${titleCase(path.state)} at ${formatPercent(coverage, 0)} LGA coverage`,
        detail: `${withData} of ${stateLgas.length} LGAs enumerated`,
        location: path.state,
      });
    } else if (coverage < 50 && stateLgas.length > 0) {
      flags.push({
        severity: "warning",
        title: `${titleCase(path.state)} LGA coverage low`,
        detail: `Only ${withData} of ${stateLgas.length} LGAs enumerated (${formatPercent(coverage, 0)})`,
        location: path.state,
      });
    }
  }

  const scopedRecord = path.state
    ? states.find((s) => s.state === path.state)
    : national;

  if (scopedRecord && scopedRecord.vulnerability.poorest_pct > 20) {
    flags.push({
      severity: "info",
      title: `High poverty concentration`,
      detail: `${formatPercent(scopedRecord.vulnerability.poorest_pct)} of households in poorest 3 deciles`,
      location: path.state,
    });
  }

  return flags;
}

export function topLgas(
  lgas: GeoRecord[],
  path: DrilldownPath,
  mode: DashboardMode,
  n = 5,
): RankedItem[] {
  const scoped = lgas.filter((l) => inScope(l, path));

  const getValue = (l: GeoRecord) =>
    mode === "nsr" ? l.nsr.total_households : l.update.updated_hh;

  return scoped
    .sort((a, b) => getValue(b) - getValue(a))
    .slice(0, n)
    .map((l, i) => ({
      rank: i + 1,
      name: titleCase(l.lga || ""),
      value: getValue(l),
      sublabel: formatNumber(getValue(l)),
      state: l.state,
    }));
}

export interface DecileBar {
  decile: string;
  count: number;
  pct: number;
}

export function decileBars(
  record: GeoRecord,
  totalHouseholds: number,
): DecileBar[] {
  const dist = record.vulnerability.decile_distribution;
  return Array.from({ length: 10 }, (_, i) => {
    const key = `d${i + 1}`;
    const count = dist[key] || 0;
    return {
      decile: `D${i + 1}`,
      count,
      pct: totalHouseholds > 0 ? (count / totalHouseholds) * 100 : 0,
    };
  });
}
