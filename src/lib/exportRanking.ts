import type { RankedItem } from "./types";
import { INDICATOR_CATALOGUE, type UnicefIndicatorDef } from "./unicefRanking";

export function exportRankingsToCSV(
  rankings: RankedItem[],
  filename: string = "community_rankings.csv",
): void {
  if (!rankings || rankings.length === 0) return;

  const domains = Array.from(
    new Set(INDICATOR_CATALOGUE.map((i: UnicefIndicatorDef) => i.domain)),
  );

  const baseHeaders = [
    "Rank",
    "Decile",
    "Community ID",
    "Community Name",
    "LGA",
    "State",
    "Total Households",
    "Total Individuals",
    "Overall Vulnerability Score",
  ];

  const domainHeaders = domains.map((d: string) => `${d} Score`);
  const indicatorHeaders = INDICATOR_CATALOGUE.map(
    (i: UnicefIndicatorDef) => `[${i.domain}] ${i.name}`,
  );

  const allHeaders = [...baseHeaders, ...domainHeaders, ...indicatorHeaders];

  const rows = rankings.map((r: RankedItem) => {
    const baseCols = [
      r.rank ?? "",
      r.decile ?? "",
      `"${r.id || ""}"`,
      `"${r.name || r.community || ""}"`,
      `"${r.lga || ""}"`,
      `"${r.state || ""}"`,
      r.total_hh ?? 0,
      r.total_ind ?? 0,
      r.score ?? 0,
    ];

    const domainCols = domains.map((d: string) => {
      const score = r.domain_scores ? r.domain_scores[d] : undefined;
      return score !== undefined ? score.toFixed(2) : "—";
    });

    const indicatorCols = INDICATOR_CATALOGUE.map((ind: UnicefIndicatorDef) => {
      const val = r.indicators
        ? r.indicators[ind.susiKey || ind.key]
        : undefined;
      return val !== undefined ? val : "—";
    });

    return [...baseCols, ...domainCols, ...indicatorCols].join(",");
  });

  const csvContent =
    "data:text/csv;charset=utf-8," + [allHeaders.join(","), ...rows].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
