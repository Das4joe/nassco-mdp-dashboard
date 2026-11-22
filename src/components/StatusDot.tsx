import React from "react";
import type { InsightSeverity } from "../lib/types";

interface StatusDotProps {
  severity: InsightSeverity | string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const severityColors: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  warning: "bg-amber-500",
  medium: "bg-yellow-500",
  info: "bg-blue-500",
  low: "bg-slate-400",
  positive: "bg-emerald-500",
};

const sizeClasses = {
  sm: "h-1.5 w-1.5",
  md: "h-2 w-2",
  lg: "h-2.5 w-2.5",
};

export const StatusDot: React.FC<StatusDotProps> = ({
  severity,
  className = "",
  size = "md",
}) => {
  const color = severityColors[severity] || "bg-slate-400";
  const dotSize = sizeClasses[size];

  return (
    <span
      className={`inline-block rounded-full ${color} ${dotSize} ${className}`}
    />
  );
};

export default StatusDot;
