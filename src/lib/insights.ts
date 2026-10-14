import type { DashboardData } from "./loadData";
import type {
  GeoRecord,
  InsightFlag,
  RankedItem,
  DrilldownPath,
} from "./types";

export interface DecileBar {
  decile: string;
  label: string;
  count: number;
  pct: number;
  isPoorest?: boolean;
}

export function computeDecileDistribution(record?: GeoRecord): DecileBar[] {
  if (!record) return [];
  const dist = record.vulnerability?.decile_distribution ?? {};
  const total =
    Object.values(dist).reduce((a, b) => a + (Number(b) || 0), 0) || 1;
  const labels = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"];

  return labels.map((d, i) => {
    const count = Number(
      dist[d] ?? dist[`decile_${i + 1}`] ?? dist[String(i + 1)] ?? 0,
    );
    return {
      decile: d,
      label: `Decile ${i + 1}`,
      count,
      pct: (count / total) * 100,
      // D1–D3 are conventionally the poorest deciles in PMT targeting
      isPoorest: i < 3,
    };
  });
}

/**
 * topLgas(data, count?)
 * topLgas(data, mode, count?)
 * Supports both call signatures used across the app.
 */
export function topLgas(
  data: DashboardData,
  modeOrCount?: string | number,
  countArg?: number,
): RankedItem[] {
  if (!data?.lgas) return [];

  let count = 5;
  // Resolve flexible argument order: (data, 5) OR (data, mode, 5) OR (data, mode)
  if (typeof modeOrCount === "number") {
    count = modeOrCount;
  } else if (typeof countArg === "number") {
    count = countArg;
  }

  return [...data.lgas]
    .sort(
      (a, b) => (b.nsr?.total_households ?? 0) - (a.nsr?.total_households ?? 0),
    )
    .slice(0, count)
    .map((l, i) => ({
      id: `lga-top-${l.lga ?? i}`,
      rank: i + 1,
      name: l.lga || "Unknown",
      state: l.state,
      value: l.nsr?.total_households ?? 0,
      score: l.nsr?.total_households ?? 0,
      sublabel: `${(l.nsr?.total_households ?? 0).toLocaleString()} HHs`,
    }));
}

export function generateInsights(
  data: DashboardData,
  _path?: DrilldownPath,
  _mode?: string,
): InsightFlag[] {
  if (!data) return [];
  const flags: InsightFlag[] = [];
  const nationalNinRate = data.national?.nsr?.nin_verification_rate ?? 0;

  (data.states || []).forEach((st: GeoRecord) => {
    const ninRate = st.nsr?.nin_verification_rate ?? 0;
    if (ninRate > nationalNinRate + 2) {
      flags.push({
        id: `nin-high-${st.state}`,
        title: `High NIN Verification in ${st.state}`,
        severity: "success",
        category: "Civil Registration",
        body: `${ninRate.toFixed(1)}% verified — ${(ninRate - nationalNinRate).toFixed(1)}pp above average`,
        location: st.state,
      });
    } else if (ninRate < nationalNinRate - 2) {
      flags.push({
        id: `nin-low-${st.state}`,
        title: `Low NIN Verification in ${st.state}`,
        severity: "warning",
        category: "Civil Registration",
        body: `${(nationalNinRate - ninRate).toFixed(1)}pp below national average (${nationalNinRate.toFixed(1)}%)`,
        location: st.state,
      });
    }
  });

  return flags;
}
