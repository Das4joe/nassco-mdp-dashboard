import type { DashboardData } from "./loadData";
import type {
  GeoRecord,
  DrilldownPath,
  DashboardMode,
  InsightFlag,
  RankedItem,
} from "./types";

export interface DecileBar {
  decile: string;
  count: number;
  isPoorest: boolean;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

export function computeInsightFlags(
  data: DashboardData,
  _path: DrilldownPath,
  _mode: DashboardMode = "nsr",
): InsightFlag[] {
  const flags: InsightFlag[] = [];
  const stateRecs: GeoRecord[] = data.states || [];

  stateRecs.forEach((st: GeoRecord) => {
    const ninRate = st.nsr?.nin_verification_rate ?? 0;
    if (ninRate > 55) {
      flags.push({
        id: `nin-high-${st.state}`,
        severity: "success",
        category: "Civil Registration",
        title: `${st.state}: strong NIN performance`,
        body: `${ninRate.toFixed(1)}% verified — ${(ninRate - data.national.nsr.nin_verification_rate).toFixed(1)}pp above average`,
        location: st.state,
        metric: "nin_verification_rate",
        value: ninRate,
        linkTab: "civil-registration",
      });
    } else if (ninRate < 25) {
      flags.push({
        id: `nin-low-${st.state}`,
        severity: "danger",
        category: "Civil Registration",
        title: `${st.state}: NIN rate ${ninRate.toFixed(1)}%`,
        body: `${(data.national.nsr.nin_verification_rate - ninRate).toFixed(1)}pp below national average (${data.national.nsr.nin_verification_rate.toFixed(1)}%)`,
        location: st.state,
        metric: "nin_verification_rate",
        value: ninRate,
        linkTab: "civil-registration",
      });
    }
  });

  return flags.slice(0, 4);
}

export const generateInsights = computeInsightFlags;

export function computeVolumeLgas(
  data: DashboardData,
  mode: DashboardMode = "nsr",
  limit = 5,
): RankedItem[] {
  const lgas: GeoRecord[] = data.lgas || [];

  const getValue = (l: GeoRecord): number => {
    if (mode === "nsr") {
      return l.nsr?.total_households ?? 0;
    }
    return l.update?.updated_hh ?? 0;
  };

  const sorted = [...lgas]
    .sort((a, b) => getValue(b) - getValue(a))
    .slice(0, limit);

  return sorted.map((l, i) => ({
    rank: i + 1,
    name: l.lga || "Unknown LGA",
    state: l.state,
    value: getValue(l),
    sublabel: formatNumber(getValue(l)),
  }));
}

export const topLgas = computeVolumeLgas;

export function computeDecileDistribution(record: GeoRecord): DecileBar[] {
  const dist = record.vulnerability?.decile_distribution ?? {};
  const keys = ["D1", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10"];

  return keys.map((key) => {
    const count = dist[key] || 0;
    const dNum = parseInt(key.replace("D", ""), 10);
    return {
      decile: key,
      count,
      isPoorest: dNum <= 3,
    };
  });
}

export const decileBars = computeDecileDistribution;
