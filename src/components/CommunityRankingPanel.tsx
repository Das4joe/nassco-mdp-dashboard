import { useMemo, useState } from "react";
import { Download, Trophy, MapPin } from "lucide-react";
import type { DashboardData } from "../lib/loadData";
import { rankCommunities } from "../lib/unicefRanking";
import { exportCommunityRankingXlsx } from "../lib/exportRanking";
import { THEME } from "../theme";

interface CommunityRankingPanelProps {
  data: DashboardData;
}

// --------------------------------------------------------------------------
// Score badge — shows "x.xx / 3.0" in colour-coded text
// --------------------------------------------------------------------------
function ScoreBadge({
  score,
  small = false,
}: {
  score: number | null;
  small?: boolean;
}) {
  if (score === null)
    return <span className="text-ink-faint dark:text-ink-onDarkMuted">—</span>;

  const pct = score / 3;
  const color =
    pct <= 0.25
      ? "text-status-danger"
      : pct <= 0.5
        ? "text-status-warning"
        : pct <= 0.75
          ? "text-ink-primary dark:text-ink-onDark"
          : "text-status-success";

  return (
    <span
      className={`tabular font-semibold ${small ? "text-xs" : ""} ${color}`}
    >
      {score.toFixed(2)}
      <span className="font-normal text-ink-muted dark:text-ink-onDarkMuted">
        {" / 3.0"}
      </span>
    </span>
  );
}

// --------------------------------------------------------------------------
// Main panel
// --------------------------------------------------------------------------
export default function CommunityRankingPanel({
  data,
}: CommunityRankingPanelProps) {
  const [stateFilter, setStateFilter] = useState<string>("ALL");
  const [topN, setTopN] = useState<number>(20);

  const rankings = useMemo(
    () => rankCommunities(data.communities),
    [data.communities],
  );

  const filtered = useMemo(
    () =>
      stateFilter === "ALL"
        ? rankings
        : rankings.filter((r) => r.state === stateFilter),
    [rankings, stateFilter],
  );

  const displayed = filtered.slice(0, topN === 9999 ? undefined : topN);

  const handleDownload = () => {
    exportCommunityRankingXlsx(
      rankings,
      stateFilter === "ALL" ? null : stateFilter,
    );
  };

  const mdpStates = data.metadata.mdp_states ?? [];

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card p-4">
        <div className="flex flex-wrap items-end gap-3">
          {/* State filter */}
          <div className="flex-1 min-w-[180px]">
            <label className="text-xs font-semibold text-ink-muted dark:text-ink-onDarkMuted uppercase tracking-wide">
              State
            </label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-line-light
                         dark:border-line-dark bg-surface-light dark:bg-surface-darker
                         text-ink-primary dark:text-ink-onDark text-sm"
            >
              <option value="ALL">All 4 MDP States</option>
              {mdpStates.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Top-N selector */}
          <div className="min-w-[150px]">
            <label className="text-xs font-semibold text-ink-muted dark:text-ink-onDarkMuted uppercase tracking-wide">
              Show top
            </label>
            <select
              value={topN}
              onChange={(e) => setTopN(Number(e.target.value))}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-line-light
                         dark:border-line-dark bg-surface-light dark:bg-surface-darker
                         text-ink-primary dark:text-ink-onDark text-sm"
            >
              <option value={10}>10 communities</option>
              <option value={20}>20 communities</option>
              <option value={50}>50 communities</option>
              <option value={100}>100 communities</option>
              <option value={9999}>All</option>
            </select>
          </div>

          {/* Download button */}
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold
                       text-sm text-white shadow-card"
            style={{ backgroundColor: THEME.brand.primary }}
          >
            <Download size={15} />
            Download UNICEF Excel
          </button>
        </div>

        <div className="mt-3 text-xs text-ink-muted dark:text-ink-onDarkMuted">
          Showing{" "}
          <span className="font-semibold text-ink-primary dark:text-ink-onDark">
            {displayed.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-ink-primary dark:text-ink-onDark">
            {filtered.length}
          </span>{" "}
          communities — lowest score = highest priority for intervention
        </div>
      </div>

      {/* Rankings table */}
      <div className="rounded-xl border border-line-light dark:border-line-dark bg-surface-light dark:bg-surface-dark shadow-card overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-line-light dark:border-line-dark">
          <Trophy size={16} className="text-status-warning" />
          <span className="text-sm font-semibold text-ink-primary dark:text-ink-onDark">
            Community Ranking — lowest score = highest priority
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-page dark:bg-surface-darker text-ink-muted dark:text-ink-onDarkMuted text-xs uppercase tracking-wide">
                <th className="px-3 py-2 text-left w-8">#</th>
                <th className="px-3 py-2 text-left">Community</th>
                <th className="px-3 py-2 text-left">LGA</th>
                <th className="px-3 py-2 text-left">State</th>
                <th className="px-3 py-2 text-right">Primary attend.</th>
                <th className="px-3 py-2 text-right">Out-of-school</th>
                <th className="px-3 py-2 text-right">U5 wasting</th>
                <th className="px-3 py-2 text-right">Education score</th>
                <th className="px-3 py-2 text-right">Health score</th>
                <th className="px-3 py-2 text-right">Composite</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((r, i) => {
                const eduScore =
                  r.domainScores.find(
                    (d) => d.domain === "Education & Child Development",
                  )?.score ?? null;

                const healthScore =
                  r.domainScores.find((d) => d.domain === "Health & Nutrition")
                    ?.score ?? null;

                const primary = r.rawIndicators["primary_attendance"];
                const oos = r.rawIndicators["out_of_school"];
                const wasting = r.rawIndicators["under5_wasting"];

                const oosHigh = oos !== undefined && oos > 50;
                const wastingHigh = wasting !== undefined && wasting > 15; // WHO crisis threshold

                return (
                  <tr
                    key={`${r.state}-${r.lga}-${r.ward}-${r.community}-${i}`}
                    className="border-t border-line-light dark:border-line-dark
                               hover:bg-surface-page dark:hover:bg-surface-darker
                               transition-colors"
                  >
                    <td className="px-3 py-2.5 text-ink-muted dark:text-ink-onDarkMuted text-xs">
                      {i + 1}
                    </td>

                    <td className="px-3 py-2.5 font-medium text-ink-primary dark:text-ink-onDark max-w-[160px]">
                      <div className="flex items-center gap-1.5">
                        <MapPin
                          size={11}
                          className="text-ink-faint dark:text-ink-onDarkMuted flex-shrink-0"
                        />
                        <span className="truncate">{r.community}</span>
                      </div>
                    </td>

                    <td className="px-3 py-2.5 text-ink-muted dark:text-ink-onDarkMuted text-xs">
                      {r.lga || "—"}
                    </td>

                    <td className="px-3 py-2.5 text-ink-muted dark:text-ink-onDarkMuted text-xs">
                      {r.state}
                    </td>

                    <td className="px-3 py-2.5 text-right tabular text-xs">
                      {primary !== undefined ? `${primary.toFixed(1)}%` : "—"}
                    </td>

                    <td className="px-3 py-2.5 text-right tabular text-xs">
                      {oos !== undefined ? (
                        <span
                          className={
                            oosHigh ? "text-status-danger font-semibold" : ""
                          }
                        >
                          {oos.toFixed(1)}%
                          {oosHigh && (
                            <span className="ml-1 text-[9px] font-bold uppercase tracking-wide">
                              ⚠
                            </span>
                          )}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>

                    {/* NEW — under-5 wasting, flagged red above WHO's 15% crisis threshold */}
                    <td className="px-3 py-2.5 text-right tabular text-xs">
                      {wasting !== undefined ? (
                        <span
                          className={
                            wastingHigh
                              ? "text-status-danger font-semibold"
                              : ""
                          }
                        >
                          {wasting.toFixed(1)}%
                          {wastingHigh && (
                            <span className="ml-1 text-[9px] font-bold uppercase tracking-wide">
                              ⚠
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-ink-faint">—</span>
                      )}
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <ScoreBadge score={eduScore} small />
                    </td>

                    {/* NEW — Health & Nutrition domain score */}
                    <td className="px-3 py-2.5 text-right">
                      <ScoreBadge score={healthScore} small />
                    </td>

                    <td className="px-3 py-2.5 text-right">
                      <ScoreBadge score={r.compositeScore} small />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {displayed.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-ink-muted dark:text-ink-onDarkMuted">
            No communities match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
