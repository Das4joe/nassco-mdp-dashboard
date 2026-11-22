import type { GeoRecord, InsightFlag, RankedItem } from "./types";

export interface DecileBar {
  decile: number;
  count: number;
  minScore: number;
  maxScore: number;
  avgScore: number;
}

export function calculateDeciles(values: number[]): number[] {
  if (!values || values.length === 0) return [];
  const sorted = [...values].sort((a, b) => a - b);
  const deciles: number[] = [];
  for (let i = 1; i <= 9; i++) {
    const idx = Math.floor((i * sorted.length) / 10);
    deciles.push(sorted[idx]);
  }
  return deciles;
}

export function computeDecileDistribution(
  items: { score?: number }[],
): DecileBar[] {
  const scores = items
    .map((d) => d.score)
    .filter((s): s is number => typeof s === "number" && !isNaN(s));

  if (scores.length === 0) {
    return Array.from({ length: 10 }, (_, i) => ({
      decile: i + 1,
      count: 0,
      minScore: 0,
      maxScore: 0,
      avgScore: 0,
    }));
  }

  const sorted = [...scores].sort((a, b) => a - b);
  const total = sorted.length;
  const bars: DecileBar[] = [];

  for (let i = 0; i < 10; i++) {
    const startIdx = Math.floor((i * total) / 10);
    const endIdx = i === 9 ? total : Math.floor(((i + 1) * total) / 10);
    const bucket = sorted.slice(startIdx, endIdx);

    const count = bucket.length;
    const minScore = count > 0 ? bucket[0] : 0;
    const maxScore = count > 0 ? bucket[bucket.length - 1] : 0;
    const avgScore =
      count > 0 ? bucket.reduce((sum, v) => sum + v, 0) / count : 0;

    bars.push({
      decile: i + 1,
      count,
      minScore: Number(minScore.toFixed(2)),
      maxScore: Number(maxScore.toFixed(2)),
      avgScore: Number(avgScore.toFixed(2)),
    });
  }

  return bars;
}

export function generateInsights(record: GeoRecord): InsightFlag[] {
  const flags: InsightFlag[] = [];
  if (!record) return flags;

  const totalHh =
    record.demographics?.total_hh ||
    record.households ||
    record.total_hh ||
    record.total_households ||
    100;

  const oosc =
    record.education?.oos_children_6_17 ||
    record.education?.out_of_school_6_17_total ||
    record.education?.out_of_school_total ||
    0;

  const noBcChildren =
    record.civil_registration?.children_without_birth_certificate ||
    record.civil_registration?.children_without_bc ||
    record.civil_registration?.children_no_bc ||
    0;

  if (oosc > 500) {
    flags.push({
      id: `${record.id}-oosc-high`,
      domain: "education",
      title: "High Out-of-School Burden",
      category: "Education",
      description: `${oosc.toLocaleString()} children aged 6-17 are currently out of school.`,
      message: `${oosc.toLocaleString()} children aged 6-17 are currently out of school.`,
      severity: "high",
      metric: "OOSC",
      value: oosc,
      geoName: record.name,
      geoLevel: record.level || "community",
    });
  }

  if (noBcChildren > 1000) {
    flags.push({
      id: `${record.id}-nobc-high`,
      domain: "civil-registration",
      title: "Severe Birth Registration Gap",
      category: "Civil Registration",
      description: `${noBcChildren.toLocaleString()} children lack legal birth registration.`,
      message: `${noBcChildren.toLocaleString()} children lack legal birth registration.`,
      severity: "critical",
      metric: "No BC",
      value: noBcChildren,
      geoName: record.name,
      geoLevel: record.level || "community",
    });
  }

  const femaleHh = record.demographics?.female_headed_hh || 0;
  const femaleHhPct = totalHh > 0 ? (femaleHh / totalHh) * 100 : 0;
  if (femaleHhPct > 35) {
    flags.push({
      id: `${record.id}-female-hh`,
      domain: "livelihoods",
      title: "High Female-Headed Household Density",
      category: "Livelihoods",
      description: `${femaleHhPct.toFixed(1)}% of households are female-headed.`,
      message: `${femaleHhPct.toFixed(1)}% of households are female-headed.`,
      severity: "medium",
      metric: "Female Headed %",
      value: femaleHhPct.toFixed(1),
      geoName: record.name,
      geoLevel: record.level || "community",
    });
  }

  return flags;
}

export function rankGeographiesByMetric(
  records: GeoRecord[],
  metricExtractor: (rec: GeoRecord) => number,
  limit: number = 10,
): RankedItem[] {
  if (!records || records.length === 0) return [];

  const items = records
    .map((rec) => {
      const val = metricExtractor(rec) || 0;
      return {
        id: rec.id,
        name: rec.name,
        level: rec.level || "community",
        state: rec.state || "",
        lga: rec.lga || "",
        ward: rec.ward || "",
        community: rec.community || "",
        total_hh: rec.demographics?.total_hh || rec.households || 0,
        total_ind: rec.demographics?.total_individuals || rec.individuals || 0,
        score: val,
        rank: 0,
        decile: 0,
        value: val,
        formattedValue: val.toLocaleString(),
        sublabel: `${rec.state || ""} ${rec.lga ? `• ${rec.lga}` : ""}`,
      };
    })
    .sort((a, b) => (b.value ?? 0) - (a.value ?? 0));

  items.forEach((item, idx) => {
    item.rank = idx + 1;
    item.decile = Math.min(10, Math.floor((idx / items.length) * 10) + 1);
  });

  return items.slice(0, limit);
}
