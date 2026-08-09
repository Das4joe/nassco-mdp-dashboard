/**
 * UNICEF Community Ranking — Excel Export
 *
 * Generates an .xlsx that mirrors the UNICEF CommunityRankingTemplate layout:
 *   - Header rows with domain groupings
 *   - One row per community
 *   - Raw indicator values (blank for indicators not yet computable)
 *   - Domain averages and composite score columns
 */

import * as XLSX from "xlsx";
import type { CommunityRanking } from "./unicefRanking";
import { INDICATOR_CATALOGUE } from "./unicefRanking";

export function exportCommunityRankingXlsx(
  rankings: CommunityRanking[],
  stateFilter: string | null = null,
): void {
  const filtered = stateFilter
    ? rankings.filter((r) => r.state === stateFilter)
    : rankings;

  const stateLabel = stateFilter ?? "ALL MDP STATES";

  // ------------------------------------------------------------------
  // Build the 2-row header (matches UNICEF template exactly)
  // ------------------------------------------------------------------
  const domainOrder = [
    "Health & Nutrition",
    "Education & Child Development",
    "Living Standards",
    "Work & Shocks",
  ] as const;

  const orderedIndicators = domainOrder.flatMap((d) =>
    INDICATOR_CATALOGUE.filter((i) => i.domain === d),
  );

  const headerRow1: (string | number)[] = ["", "", "", ""];
  const headerRow2: (string | number)[] = ["S/N", "State", "Ward", "Community"];

  // Group indicators under their domain headers
  for (const domain of domainOrder) {
    const domainIndicators = INDICATOR_CATALOGUE.filter(
      (i) => i.domain === domain,
    );
    domainIndicators.forEach((ind, idx) => {
      headerRow1.push(idx === 0 ? domain.toUpperCase() : "");
      headerRow2.push(ind.label);
    });
  }

  // Domain averages + composite
  for (const domain of domainOrder) {
    headerRow1.push("");
    headerRow2.push(`Avg ${domain} score`);
  }
  headerRow1.push("");
  headerRow2.push("COMPOSITE SCORE");
  headerRow1.push("");
  headerRow2.push("Coverage note");

  // ------------------------------------------------------------------
  // Data rows
  // ------------------------------------------------------------------
  const rows: (string | number | null)[][] = filtered.map((r, i) => {
    const row: (string | number | null)[] = [
      i + 1,
      r.state,
      r.ward,
      r.community,
    ];

    for (const ind of orderedIndicators) {
      const val = r.rawIndicators[ind.key];
      row.push(val !== undefined ? Number(val.toFixed(2)) : null);
    }

    for (const ds of r.domainScores) {
      row.push(ds.score !== null ? Number(ds.score.toFixed(2)) : null);
    }

    row.push(
      r.compositeScore !== null ? Number(r.compositeScore.toFixed(2)) : null,
    );

    const availableDomains = r.domainScores.filter(
      (d) => d.score !== null,
    ).length;
    row.push(
      availableDomains === 4
        ? "Full"
        : `Partial (${availableDomains}/4 domains)`,
    );

    return row;
  });

  // ------------------------------------------------------------------
  // Title rows on top
  // ------------------------------------------------------------------
  const titleRow: (string | number)[] = ["NSR EXPANSION PILOT"];
  const subtitle: (string | number)[] = [
    "DATA TOOLKIT FOR COMMUNITY SELECTION",
  ];
  const templateTitle: (string | number)[] = [
    "COMMUNITY RANKING TEMPLATE (UNICEF format)",
  ];
  const stateRow: (string | number)[] = [`State: ${stateLabel}`];
  const generatedRow: (string | number)[] = [
    `Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`,
  ];

  const sheetData: (string | number | null)[][] = [
    titleRow,
    subtitle,
    templateTitle,
    stateRow,
    generatedRow,
    [],
    headerRow1,
    headerRow2,
    ...rows,
  ];

  // ------------------------------------------------------------------
  // Build workbook
  // ------------------------------------------------------------------
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(sheetData);

  // Column widths
  ws["!cols"] = [
    { wch: 6 }, // S/N
    { wch: 10 }, // State
    { wch: 18 }, // Ward
    { wch: 24 }, // Community
    ...Array(orderedIndicators.length).fill({ wch: 18 }),
    ...Array(4).fill({ wch: 20 }),
    { wch: 18 }, // composite
    { wch: 26 }, // coverage note
  ];

  const sheetName = stateFilter ? stateFilter.slice(0, 24) : "AllStates";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // ------------------------------------------------------------------
  // Trigger download
  // ------------------------------------------------------------------
  const filename = `UNICEF_CommunityRanking_${stateFilter ?? "AllStates"}_${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}
