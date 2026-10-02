import React, { useState, useMemo, useEffect } from "react";
import { Download, Search, Building2 } from "lucide-react";
import type { DashboardData } from "../lib/loadData";

interface CommunityRankingPanelProps {
  data: DashboardData;
  selectedStateFilter?: string;
}

export const CommunityRankingPanel: React.FC<CommunityRankingPanelProps> = ({
  data,
  selectedStateFilter,
}) => {
  const [stateFilter, setStateFilter] = useState<string>(
    selectedStateFilter || "ALL",
  );
  const [topCount, setTopCount] = useState<number>(20);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (selectedStateFilter) {
      setStateFilter(selectedStateFilter.toUpperCase());
    } else {
      setStateFilter("ALL");
    }
  }, [selectedStateFilter]);

  const allCommunities = useMemo(() => {
    return data.communities || [];
  }, [data]);

  const filteredCommunities = useMemo(() => {
    let list = allCommunities;

    if (stateFilter && stateFilter !== "ALL") {
      list = list.filter(
        (c) =>
          (c.state || "").trim().toUpperCase() ===
          stateFilter.trim().toUpperCase(),
      );
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) =>
          (c.community || "").toLowerCase().includes(q) ||
          (c.lga || "").toLowerCase().includes(q) ||
          (c.state || "").toLowerCase().includes(q),
      );
    }

    return list;
  }, [allCommunities, stateFilter, searchQuery]);

  const displayedCommunities = useMemo(() => {
    if (topCount === -1) return filteredCommunities;
    return filteredCommunities.slice(0, topCount);
  }, [filteredCommunities, topCount]);

  const handleExportCSV = () => {
    const headers = [
      "#",
      "Community",
      "LGA",
      "State",
      "Number of PVHHs",
      "Number of Individuals",
      "Males",
      "Females",
      "Ages 0-17",
      "18 and Above",
    ];

    const rows = filteredCommunities.map((c, idx) => {
      const totalInd = c.nsr?.total_individuals ?? 0;
      const u18 = c.nsr?.children_under18 ?? 0;
      const a18 = Math.max(0, totalInd - u18);
      const pvhh =
        c.vulnerability?.poorest_households ??
        Math.round(
          (c.nsr?.total_households ?? 0) *
            ((c.vulnerability?.poorest_pct ?? 0) / 100),
        );

      return [
        idx + 1,
        `"${c.community || ""}"`,
        `"${c.lga || ""}"`,
        `"${c.state || ""}"`,
        pvhh,
        totalInd,
        c.nsr?.total_male ?? 0,
        c.nsr?.total_female ?? 0,
        u18,
        a18,
      ];
    });

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `UNICEF_Community_Demographics_${stateFilter}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statesList = ["ABIA", "BENUE", "OYO", "SOKOTO"];

  return (
    <div className="bg-surface-light dark:bg-surface-dark border border-line-light dark:border-line-dark rounded-xl p-5 space-y-4 shadow-card">
      {/* Title & Controls Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-line-light dark:border-line-dark">
        <div>
          <h3 className="text-base font-bold text-ink-primary dark:text-ink-onDark flex items-center gap-2">
            <Building2
              size={18}
              className="text-brand-600 dark:text-brand-400"
            />
            UNICEF COMMUNITY SELECTION & DEMOGRAPHICS
          </h3>
          <p className="text-xs text-ink-muted dark:text-ink-onDarkMuted mt-1">
            Community-level demographic disaggregation across pilot states.
            Download data for field team deployment.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-ink-muted dark:text-ink-onDarkMuted">
              STATE
            </span>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-line-light dark:border-line-dark bg-surface-page dark:bg-surface-darker text-xs font-medium text-ink-primary dark:text-ink-onDark focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All 4 MDP States</option>
              {statesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-ink-muted dark:text-ink-onDarkMuted">
              SHOW TOP
            </span>
            <select
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value))}
              className="px-3 py-1.5 rounded-lg border border-line-light dark:border-line-dark bg-surface-page dark:bg-surface-darker text-xs font-medium text-ink-primary dark:text-ink-onDark focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value={20}>20 communities</option>
              <option value={50}>50 communities</option>
              <option value={100}>100 communities</option>
              <option value={-1}>All communities</option>
            </select>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-sm"
          >
            <Download size={14} />
            Download UNICEF Excel
          </button>
        </div>
      </div>

      {/* Filter / Search Bar & Subtext */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="text-ink-muted dark:text-ink-onDarkMuted font-medium">
          Showing{" "}
          <span className="font-bold text-ink-primary dark:text-ink-onDark">
            {displayedCommunities.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-ink-primary dark:text-ink-onDark">
            {filteredCommunities.length}
          </span>{" "}
          communities
        </div>

        <div className="relative max-w-xs w-full">
          <Search
            size={14}
            className="absolute left-3 top-2.5 text-ink-faint"
          />
          <input
            type="text"
            placeholder="Search community or LGA..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-line-light dark:border-line-dark bg-surface-page dark:bg-surface-darker text-xs text-ink-primary dark:text-ink-onDark focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-line-light dark:border-line-dark">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-surface-page dark:bg-surface-darker border-b border-line-light dark:border-line-dark text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-ink-onDarkMuted">
              <th className="py-3 px-3 w-10 text-center">#</th>
              <th className="py-3 px-3">Community</th>
              <th className="py-3 px-3">LGA</th>
              <th className="py-3 px-3">State</th>
              <th className="py-3 px-3 text-right">Number of PVHHs</th>
              <th className="py-3 px-3 text-right">Number of Individuals</th>
              <th className="py-3 px-3 text-right">Males</th>
              <th className="py-3 px-3 text-right">Females</th>
              <th className="py-3 px-3 text-right">Ages 0–17</th>
              <th className="py-3 px-3 text-right">18 and Above</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line-light dark:divide-line-dark">
            {displayedCommunities.length > 0 ? (
              displayedCommunities.map((c, i) => {
                const totalInd = c.nsr?.total_individuals ?? 0;
                const u18 = c.nsr?.children_under18 ?? 0;
                const a18 = Math.max(0, totalInd - u18);
                const pvhh =
                  c.vulnerability?.poorest_households ??
                  Math.round(
                    (c.nsr?.total_households ?? 0) *
                      ((c.vulnerability?.poorest_pct ?? 0) / 100),
                  );

                return (
                  <tr
                    key={`${c.state}-${c.lga}-${c.community}-${i}`}
                    className="hover:bg-surface-page/60 dark:hover:bg-surface-darker/60 transition-colors text-ink-primary dark:text-ink-onDark"
                  >
                    <td className="py-2.5 px-3 text-center text-ink-faint font-mono text-[11px]">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-brand-700 dark:text-brand-400">
                      {c.community}
                    </td>
                    <td className="py-2.5 px-3 font-medium uppercase text-[11px] text-ink-muted dark:text-ink-onDarkMuted">
                      {c.lga}
                    </td>
                    <td className="py-2.5 px-3 font-medium uppercase text-[11px] text-ink-muted dark:text-ink-onDarkMuted">
                      {c.state}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {pvhh.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold">
                      {totalInd.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-muted dark:text-ink-onDarkMuted">
                      {(c.nsr?.total_male ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-muted dark:text-ink-onDarkMuted">
                      {(c.nsr?.total_female ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-amber-600 dark:text-amber-400 font-medium">
                      {u18.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-ink-muted dark:text-ink-onDarkMuted">
                      {a18.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="py-8 text-center text-ink-muted italic text-xs"
                >
                  No community records match the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunityRankingPanel;
