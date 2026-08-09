/**
 * useChartTheme — v5
 *
 * Changes vs v4:
 *   - Added tooltipLabel and tooltipItem style objects.
 *     Recharts <Tooltip> ignores contentStyle.color for its inner label
 *     and item text, using its own defaults (dark colors). These two
 *     new fields must be passed to <Tooltip labelStyle={...} itemStyle={...}>
 *     to force correct contrast in dark mode.
 */

import { useEffect, useState } from "react";

export interface ChartTheme {
  isDark: boolean;
  axisTick: string;
  axisLabel: string;
  axisStroke: string;
  grid: string;
  tooltip: React.CSSProperties;
  /** Applied to Recharts <Tooltip labelStyle={...}> — controls the title row. */
  tooltipLabel: React.CSSProperties;
  /** Applied to Recharts <Tooltip itemStyle={...}> — controls each data row. */
  tooltipItem: React.CSSProperties;
  labelText: string;
  barLabel: string;
  legendText: string;
  cursorFill: string;
}

const LIGHT_THEME: ChartTheme = {
  isDark: false,
  axisTick: "#1E293B",
  axisLabel: "#0F172A",
  axisStroke: "#E9EDEF",
  grid: "transparent",
  tooltip: {
    background: "#FFFFFF",
    border: "1px solid #E9EDEF",
    borderRadius: "8px",
    fontSize: "12px",
    padding: "8px 12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
    color: "#111B21",
  },
  tooltipLabel: {
    color: "#111B21",
    fontWeight: 600,
    marginBottom: "4px",
  },
  tooltipItem: {
    color: "#111B21",
    fontWeight: 500,
  },
  labelText: "#111B21",
  barLabel: "#111B21",
  legendText: "#111B21",
  cursorFill: "#F0F2F5",
};

const DARK_THEME: ChartTheme = {
  isDark: true,
  axisTick: "#F1F5F9",
  axisLabel: "#F8FAFC",
  axisStroke: "#1F3D33",
  grid: "transparent",
  tooltip: {
    background: "#0F1F1B",
    border: "1px solid #1F3D33",
    borderRadius: "8px",
    fontSize: "12px",
    padding: "8px 12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    color: "#F1F5F9",
  },
  tooltipLabel: {
    color: "#F1F5F9",
    fontWeight: 600,
    marginBottom: "4px",
  },
  tooltipItem: {
    color: "#F1F5F9",
    fontWeight: 500,
  },
  labelText: "#F1F5F9",
  barLabel: "#FFFFFF",
  legendText: "#F1F5F9",
  cursorFill: "#0A1613",
};

export function useChartTheme(): ChartTheme {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const html = document.documentElement;
    const observer = new MutationObserver(() => {
      setIsDark(html.classList.contains("dark"));
    });
    observer.observe(html, { attributes: true, attributeFilter: ["class"] });
    setIsDark(html.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  return isDark ? DARK_THEME : LIGHT_THEME;
}
