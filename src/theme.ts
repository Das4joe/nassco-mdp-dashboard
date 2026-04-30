// ═══════════════════════════════════════════════════════════════
// NASSCO MDP SOVEREIGN INTELLIGENCE — THEME & CONSTANTS
// ═══════════════════════════════════════════════════════════════

export const getTheme = (isDark: boolean) => ({
  bg: isDark ? "#0D1F14" : "#E8F5E9",
  bgCard: isDark ? "rgba(36,53,41,0.92)" : "#FFFFFF",
  bgCardSolid: isDark ? "#1E3528" : "#FFFFFF",
  border: isDark ? "rgba(129,199,132,0.2)" : "rgba(45,138,78,0.2)",
  textMain: isDark ? "#E8F5E9" : "#1A5632",
  textMuted: isDark ? "#A5D6A7" : "#2D7A4E",
  textSub: isDark ? "#C8E6C9" : "#3D8B5E",
  textOnMap: isDark ? "#E8F5E9" : "#1A5632",
  shadow: isDark ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 16px rgba(0,0,0,0.08)",
  shadowHover: isDark
    ? "0 8px 32px rgba(0,0,0,0.7)"
    : "0 8px 24px rgba(0,0,0,0.15)",
  mapBg: isDark ? "#0A1A0F" : "#C8E6C9",
  tooltipBg: isDark ? "#1E3528" : "#FFFFFF",
  tooltipText: isDark ? "#E8F5E9" : "#1A5632",
  tooltipBorder: isDark ? "#4CAF50" : "#2D8A4E",
  inputBg: isDark ? "rgba(0,0,0,0.25)" : "#FFFFFF",
});

export const COLORS = {
  primary: "#4CAF50",
  primaryDark: "#2D8A4E",
  primaryDeep: "#1A5632",
  primaryLight: "#81C784",
  accent: "#42A5F5",
  accentDark: "#1976D2",
  warning: "#FFA726",
  warningDark: "#E65100",
  danger: "#EF5350",
  dangerDark: "#C62828",
  dangerLight: "#FF7043",
  success: "#66BB6A",
  pink: "#EC4899",
  purple: "#8B5CF6",
  teal: "#26C6DA",
  amber: "#FFCA28",
};

export const CHART_COLORS = [
  "#4CAF50",
  "#42A5F5",
  "#FFA726",
  "#8B5CF6",
  "#EC4899",
  "#66BB6A",
  "#FF7043",
  "#1976D2",
  "#EF5350",
  "#26C6DA",
  "#FFCA28",
  "#2D8A4E",
];

export const STATE_COLORS: Record<string, string> = {
  Oyo: "#4CAF50",
  Sokoto: "#42A5F5",
  Abia: "#FFA726",
  Benue: "#8B5CF6",
};

export const STATE_FILL_DARK: Record<string, string> = {
  Oyo: "#2E7D32",
  Sokoto: "#1565C0",
  Abia: "#E65100",
  Benue: "#4A148C",
};

export const MUAC_COLORS: Record<string, string> = {
  Green: "#4CAF50",
  Yellow: "#FFA726",
  Red: "#EF5350",
};

export const DEPRIVATION_SCALE = [
  { threshold: 35, color: "#C62828", label: "Severe" },
  { threshold: 25, color: "#EF5350", label: "High" },
  { threshold: 15, color: "#FFA726", label: "Moderate" },
  { threshold: 5, color: "#66BB6A", label: "Low" },
  { threshold: 0, color: "#4CAF50", label: "Minimal" },
];

export const GRM_CATEGORIES = [
  "Targeting – Wrongful Exclusion",
  "Targeting – Wrongful Inclusion",
  "Enumeration",
  "Service Linkages & Referrals",
  "Gender & Social Inclusion",
  "Staff Conduct & Ethics",
  "Fraud & Corruption",
  "GBV/PSEA/SEA",
  "Service Quality Feedback",
  "Positive/Neutral Feedback",
];

export const GRM_CHANNELS = [
  "Hotline (NOA 7477)",
  "In-person",
  "Staff phone",
  "Letter/email",
  "Suggestion Box",
  "Help-desk",
  "QR code",
  "Social media/Online",
];

export const GRM_STATUSES = ["Open", "In Progress", "Resolved and closed"];

export const GRM_OFFICER_FUNCTIONS = [
  "Community GRV",
  "LG GRO",
  "SOCU",
  "NASSCO",
  "NOA Agent",
];

export const MDP_DIMENSIONS = [
  "Health",
  "Education",
  "Nutrition",
  "Livelihood",
  "Shocks",
  "Social Services",
  "Living Standards",
];

export const UNICEF_AGE_GROUPS = [
  { label: "0–5", min: 0, max: 5 },
  { label: "6–14", min: 6, max: 14 },
  { label: "15–18", min: 15, max: 18 },
  { label: "19–35", min: 19, max: 35 },
  { label: "36–59", min: 36, max: 59 },
  { label: "60+", min: 60, max: 120 },
];

export const CHILD_AGE_GROUPS = [
  { label: "0–5", min: 0, max: 5 },
  { label: "6–14", min: 6, max: 14 },
  { label: "15–18", min: 15, max: 18 },
];

export const VULNERABILITY_CATEGORIES = [
  "No Birth Registration",
  "No NIN",
  "No Health Insurance",
  "Disability",
  "Out of School",
  "Malnutrition (MUAC)",
  "PLW",
  "Prone to Shocks",
];

export const DISABILITY_TYPES = [
  "None",
  "Physical",
  "Visual",
  "Hearing",
  "Intellectual",
  "Multiple",
];

export const HEALTH_INSURANCE_TYPES = [
  "State Social HI",
  "Community Based HI",
  "Employer — State/LGA",
  "Employer — Federal",
  "NHIA (GIFSHIP)",
  "Private HMO",
  "Others",
];

export const LIVELIHOOD_SOURCES = [
  "Rain-fed crop farming",
  "Irrigated farming",
  "Livestock",
  "Fishing",
  "Informal trade/services",
  "Salaried",
  "Remittances/pensions",
];

export const SHOCK_TYPES = [
  "Flood",
  "Drought",
  "Storm",
  "Conflict/Violence",
  "Epidemic",
  "Landslide",
  "Fire",
];

export const COPING_MECHANISMS = [
  "Sale of livestock",
  "Sale of land",
  "Sent children away",
  "Withdrew children from school",
  "Borrowed money",
  "Reduced food",
  "Relied on savings",
];

export const IMPLEMENTATION_PHASES = [
  "Pre-sensitization",
  "Sensitization & Mobilization",
  "Community Engagement",
  "Enumeration",
  "Data Cleaning & Validation",
];

export const STATE_POPULATIONS: Record<string, number> = {
  Oyo: 8_635_000,
  Sokoto: 5_735_000,
  Abia: 4_112_000,
  Benue: 6_236_000,
};
