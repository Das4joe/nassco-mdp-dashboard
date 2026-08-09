/**
 * NASSCO MDP Dashboard — Design Token System
 * Single source of truth for colors, typography, spacing.
 */

export const THEME = {
  brand: {
    primary: "#075E54",
    primaryLight: "#128C7E",
    primaryDark: "#054A42",
    primaryPale: "#E6F4F1",
  },
  nsr: {
    accent: "#25D366",
    scale: [
      "#DCFCE7",
      "#BBF7D0",
      "#86EFAC",
      "#4ADE80",
      "#25D366",
      "#16A34A",
      "#15803D",
      "#166534",
    ],
  },
  upd: {
    accent: "#FF7A00",
    scale: [
      "#FFEDD5",
      "#FED7AA",
      "#FDBA74",
      "#FB923C",
      "#FF7A00",
      "#EA580C",
      "#C2410C",
      "#9A3412",
    ],
  },
  neutral: {
    surface: "#FFFFFF",
    page: "#F0F2F5",
    surfaceDark: "#0F1F1B",
    pageDark: "#0A1613",
    border: "#E9EDEF",
    borderDark: "#1F3D33",
  },
  text: {
    primary: "#111B21",
    muted: "#667781",
    faint: "#8696A0",
    onDark: "#E9EDEF",
    onDarkMuted: "#8696A0",
  },
  status: {
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },
  nonMdp: {
    fill: "#E9EDEF",
    fillDark: "#1A2A24",
    border: "#D0D7DE",
    borderDark: "#243530",
  },
} as const;

export type DashboardMode = "nsr" | "update";

export function modeAccent(mode: DashboardMode): string {
  return mode === "nsr" ? THEME.nsr.accent : THEME.upd.accent;
}

export function modeScale(mode: DashboardMode): readonly string[] {
  return mode === "nsr" ? THEME.nsr.scale : THEME.upd.scale;
}
