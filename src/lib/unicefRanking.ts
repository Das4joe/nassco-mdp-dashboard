import type { GeoRecord, RankedItem } from "./types";

export type CommunityRanking = RankedItem;

export interface UnicefIndicatorDef {
  key: string;
  name: string;
  domain: string;
  direction: "positive" | "negative";
  weight: number;
  susiKey?: string;
  q1?: number;
  q2?: number;
  q3?: number;
}

export const UNICEF_INDICATORS_CATALOGUE: UnicefIndicatorDef[] = [
  {
    key: "under5_wasting",
    name: "Child Wasting (MUAC Red/Yellow)",
    domain: "Health & Nutrition",
    direction: "negative",
    weight: 1.5,
    susiKey: "under5_wasting",
  },
  {
    key: "pregnant_lactating_share",
    name: "Pregnant & Lactating Share",
    domain: "Health & Nutrition",
    direction: "negative",
    weight: 1.0,
    susiKey: "pregnant_lactating_share",
  },
  {
    key: "health_insurance_gap",
    name: "Lack of Health Insurance",
    domain: "Health & Nutrition",
    direction: "negative",
    weight: 1.0,
    susiKey: "health_insurance_gap",
  },
  {
    key: "out_of_school_rate",
    name: "Out of School Rate (6-17)",
    domain: "Education & Child Dev",
    direction: "negative",
    weight: 2.0,
    susiKey: "out_of_school_rate",
  },
  {
    key: "never_enrolled_rate",
    name: "Never Enrolled Rate",
    domain: "Education & Child Dev",
    direction: "negative",
    weight: 1.5,
    susiKey: "never_enrolled_rate",
  },
  {
    key: "girls_oos_rate",
    name: "Girls Out of School Share",
    domain: "Education & Child Dev",
    direction: "negative",
    weight: 1.5,
    susiKey: "girls_oos_rate",
  },
  {
    key: "birth_cert_gap",
    name: "Lack of Birth Certificate",
    domain: "Living Standards",
    direction: "negative",
    weight: 1.5,
    susiKey: "birth_cert_gap",
  },
  {
    key: "nin_gap",
    name: "Lack of National Identity (NIN)",
    domain: "Living Standards",
    direction: "negative",
    weight: 1.0,
    susiKey: "nin_gap",
  },
  {
    key: "pwd_rate",
    name: "Persons with Disabilities Rate",
    domain: "Living Standards",
    direction: "negative",
    weight: 1.2,
    susiKey: "pwd_rate",
  },
  {
    key: "female_headed_share",
    name: "Female Headed Households",
    domain: "Work & Shocks",
    direction: "negative",
    weight: 1.0,
    susiKey: "female_headed_share",
  },
  {
    key: "negative_coping_rate",
    name: "Severe Negative Coping Rate",
    domain: "Work & Shocks",
    direction: "negative",
    weight: 1.5,
    susiKey: "negative_coping_rate",
  },
  {
    key: "child_coping_rate",
    name: "Child-Related Coping Strategies",
    domain: "Work & Shocks",
    direction: "negative",
    weight: 1.8,
    susiKey: "child_coping_rate",
  },
];

export const INDICATOR_CATALOGUE = UNICEF_INDICATORS_CATALOGUE;

export function calculateQuartileScore(
  val: number,
  def: UnicefIndicatorDef,
): number {
  const q1 = def.q1 ?? 10;
  const q2 = def.q2 ?? 25;
  const q3 = def.q3 ?? 50;

  if (def.direction === "negative") {
    if (val >= q3) return 3;
    if (val >= q2) return 2;
    if (val >= q1) return 1;
    return 0;
  } else {
    if (val <= q1) return 3;
    if (val <= q2) return 2;
    if (val <= q3) return 1;
    return 0;
  }
}

export function rankCommunities(communities: GeoRecord[]): RankedItem[] {
  if (!communities || communities.length === 0) return [];

  const scoredList = communities.map((rec) => {
    let totalScore = 0;
    let totalWeights = 0;
    const domainScores: Record<string, number> = {};
    const unicefSrc = (rec.unicef_indicators || rec.unicef || {}) as Record<
      string,
      any
    >;

    UNICEF_INDICATORS_CATALOGUE.forEach((def) => {
      const raw = Number(unicefSrc[def.susiKey || def.key] ?? 0) || 0;
      const qScore = calculateQuartileScore(raw, def);
      const weighted = qScore * def.weight;

      totalScore += weighted;
      totalWeights += def.weight * 3;

      domainScores[def.domain] = (domainScores[def.domain] || 0) + weighted;
    });

    const normalizedScore =
      totalWeights > 0 ? (totalScore / totalWeights) * 100 : 0;

    return {
      id: rec.id,
      name: rec.name || rec.community || "Unknown Community",
      level: rec.level || "community",
      state: rec.state || "",
      lga: rec.lga || "",
      ward: rec.ward || "",
      community: rec.community || rec.name || "",
      total_hh: rec.demographics?.total_hh || rec.households || 0,
      total_ind: rec.demographics?.total_individuals || rec.individuals || 0,
      score: Number(normalizedScore.toFixed(2)),
      rank: 0,
      decile: 0,
      domain_scores: domainScores,
      indicators: unicefSrc,
    };
  });

  scoredList.sort((a, b) => b.score - a.score);

  scoredList.forEach((item, index) => {
    item.rank = index + 1;
    item.decile = Math.min(
      10,
      Math.floor((index / scoredList.length) * 10) + 1,
    );
  });

  return scoredList;
}
