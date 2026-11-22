import React, { useState, useMemo } from "react";
import type { GeoRecord } from "../lib/types";

export interface CommunityRankingPanelProps {
  communities?: GeoRecord[];
  records?: GeoRecord[];
  isDark?: boolean;
  onSelectCommunity?: (comm: GeoRecord) => void;
}

export const CommunityRankingPanel: React.FC<CommunityRankingPanelProps> = ({
  communities = [],
  records,
  isDark = false,
  onSelectCommunity,
}) => {
  const commList = records || communities;
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("ALL");

  const filtered = useMemo(() => {
    return commList.filter((c) => {
      const nameMatch =
        (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.community || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.lga || "").toLowerCase().includes(searchTerm.toLowerCase());
      const stateMatch =
        selectedState === "ALL" ||
        (c.state || "").toUpperCase() === selectedState.toUpperCase();
      return nameMatch && stateMatch;
    });
  }, [commList, searchTerm, selectedState]);

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = [
      "Community",
      "Ward",
      "LGA",
      "State",
      "Households",
      "Individuals",
      "Children (0-17)",
      "Youth (18-24)",
      "OOS Children (6-17)",
      "Children w/o BC",
    ];

    const rows = filtered.map((c) => [
      `"${c.name || c.community || ""}"`,
      `"${c.ward || ""}"`,
      `"${c.lga || ""}"`,
      `"${c.state || ""}"`,
      c.demographics?.total_hh || 0,
      c.demographics?.total_individuals || 0,
      c.demographics?.children_0_17 || 0,
      c.demographics?.youth_18_24 || 0,
      c.education?.oos_children_6_17 || 0,
      c.civil_registration?.children_without_birth_certificate || 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `community_demographics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-colors ${
        isDark
          ? "bg-slate-900/90 border-slate-800 text-slate-100"
          : "bg-white border-slate-200 text-slate-900"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Community Level Demographics
          </h3>
          <p className="text-xs text-slate-400">
            Showing {filtered.length.toLocaleString()} surveyed communities
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Search community, LGA..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`text-xs px-3 py-1.5 rounded-lg border outline-none ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-200 focus:border-blue-500"
                : "bg-slate-50 border-slate-300 text-slate-800 focus:border-blue-600"
            }`}
          />
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className={`text-xs px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${
              isDark
                ? "bg-slate-800 border-slate-700 text-slate-200"
                : "bg-slate-50 border-slate-300 text-slate-800"
            }`}
          >
            <option value="ALL">All States</option>
            <option value="ABIA">Abia</option>
            <option value="BENUE">Benue</option>
            <option value="OYO">Oyo</option>
            <option value="SOKOTO">Sokoto</option>
          </select>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>↓</span> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[380px] border border-slate-200 dark:border-slate-800 rounded-lg">
        <table className="w-full text-left text-xs">
          <thead
            className={`sticky top-0 z-10 uppercase text-[10px] tracking-wider font-bold border-b ${
              isDark
                ? "bg-slate-800/90 text-slate-300 border-slate-700"
                : "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <tr>
              <th className="py-2.5 px-3">Community</th>
              <th className="py-2.5 px-3">LGA</th>
              <th className="py-2.5 px-3">State</th>
              <th className="py-2.5 px-3 text-right">Households</th>
              <th className="py-2.5 px-3 text-right">Individuals</th>
              <th className="py-2.5 px-3 text-right">Children (0–17)</th>
              <th className="py-2.5 px-3 text-right">Youth (18–24)</th>
              <th className="py-2.5 px-3 text-right">OOSC (6–17)</th>
              <th className="py-2.5 px-3 text-right">No Birth Cert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
            {filtered.slice(0, 100).map((c, i) => (
              <tr
                key={c.id || i}
                onClick={() => onSelectCommunity && onSelectCommunity(c)}
                className={`hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors ${
                  onSelectCommunity ? "cursor-pointer" : ""
                }`}
              >
                <td className="py-2 px-3 font-sans font-medium text-slate-900 dark:text-slate-100 truncate max-w-[140px]">
                  {c.name || c.community}
                </td>
                <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                  {c.lga || "—"}
                </td>
                <td className="py-2 px-3 font-sans text-slate-600 dark:text-slate-400">
                  {c.state || "—"}
                </td>
                <td className="py-2 px-3 text-right">
                  {(c.demographics?.total_hh || 0).toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right">
                  {(c.demographics?.total_individuals || 0).toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right">
                  {(c.demographics?.children_0_17 || 0).toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right">
                  {(c.demographics?.youth_18_24 || 0).toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right text-red-600 dark:text-red-400">
                  {(c.education?.oos_children_6_17 || 0).toLocaleString()}
                </td>
                <td className="py-2 px-3 text-right text-amber-600 dark:text-amber-400">
                  {(
                    c.civil_registration?.children_without_birth_certificate ||
                    0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CommunityRankingPanel;
