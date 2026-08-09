/**
 * StatusDot — Colored dot for status indicators
 */

import clsx from "clsx";
import type { InsightSeverity } from "../lib/types";

interface StatusDotProps {
  severity: InsightSeverity;
  size?: "sm" | "md";
}

const COLOR_CLASS: Record<InsightSeverity, string> = {
  success: "bg-status-success",
  warning: "bg-status-warning",
  danger: "bg-status-danger",
  info: "bg-status-info",
};

export default function StatusDot({ severity, size = "sm" }: StatusDotProps) {
  return (
    <span
      className={clsx(
        "inline-block rounded-full flex-shrink-0",
        size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5",
        COLOR_CLASS[severity],
      )}
      aria-label={severity}
    />
  );
}
