// src/App.tsx
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP SOVEREIGN INTELLIGENCE DASHBOARD
// Household Enumeration — Oyo · Benue · Sokoto · Abia
// FIXES:
//   1. SectionTitle subtitle color responds to dark/light theme
//   2. State pills moved OUT of LGA map panel → beside selector
//   3. Legend import removed (legend lives in StateLgaMap)
//   4. ExportModal receives no geo props (fetches internally)
// ═══════════════════════════════════════════════════════════════

import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Utilities ──────────────────────────────────────────────────
import { normalize } from "./lib/normalize";
import { loadCsv } from "./lib/loadCsv";
import type { StateAgg, LgaAgg } from "./lib/aggregations";
import { byState, byLga } from "./lib/aggregations";
import { normalizeGeoJSON } from "./lib/geoUtils";
import type { GeoJSONCollection } from "./lib/geoUtils";

// ── Map components ─────────────────────────────────────────────
import NigeriaStateMap from "./maps/NigeriaStateMap";
import NigeriaMap from "./maps/NigeriaMap";
import StateLgaMap from "./maps/StateLgaMap";

// ── UI components ──────────────────────────────────────────────
import LgaCharts from "./components/LgaCharts";
import HeroCards from "./components/HeroCards";
import ExportModal from "./components/ExportModal";

// ── Theme ──────────────────────────────────────────────────────
import { getTheme, STATE_COLORS } from "./theme";

// ═══════════════════════════════════════════════════════════════
// LOADING SCREEN
// ═══════════════════════════════════════════════════════════════
function LoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        background: "#0D1F14",
        gap: 20,
      }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        style={{
          width: 56,
          height: 56,
          border: "4px solid rgba(76,175,80,0.2)",
          borderTop: "4px solid #4CAF50",
          borderRadius: "50%",
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{ textAlign: "center" }}
      >
        <p
          style={{
            color: "#4CAF50",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 18,
            fontWeight: 700,
            margin: 0,
            letterSpacing: 0.5,
          }}
        >
          NASSCO MDP Dashboard
        </p>
        <p
          style={{
            color: "#A5D6A7",
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            margin: "6px 0 0",
          }}
        >
          Loading household enumeration data…
        </p>
      </motion.div>
      <div style={{ display: "flex", gap: 8 }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
            transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#4CAF50",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ERROR SCREEN
// ═══════════════════════════════════════════════════════════════
function ErrorScreen({ error }: { error: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: 40,
        fontFamily: "'DM Sans', Arial, sans-serif",
        background: "#FEF2F2",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          background: "#fff",
          border: "1px solid #FECACA",
          borderRadius: 12,
          padding: "20px 24px",
          borderLeft: "5px solid #EF4444",
          maxWidth: 700,
          margin: "0 auto 24px",
        }}
      >
        <h1
          style={{ color: "#991B1B", margin: 0, fontSize: 22, fontWeight: 700 }}
        >
          ⚠️ Dashboard Load Error
        </h1>
        <p
          style={{
            color: "#B91C1C",
            marginTop: 10,
            fontSize: 13,
            fontFamily: "monospace",
            background: "#FEE2E2",
            padding: "10px 14px",
            borderRadius: 6,
          }}
        >
          {error}
        </p>
      </div>
      <div
        style={{
          background: "#fff",
          border: "1px solid #E5E7EB",
          borderRadius: 12,
          padding: "20px 24px",
          maxWidth: 700,
          margin: "0 auto",
        }}
      >
        <h2 style={{ color: "#374151", fontSize: 15, marginTop: 0 }}>
          🔧 Troubleshooting Checklist
        </h2>
        <ul
          style={{
            color: "#4B5563",
            lineHeight: 2.2,
            fontSize: 13,
            paddingLeft: 20,
          }}
        >
          <li>
            Confirm <code>public/data/EnumaratedHH_STATE.csv</code> exists
          </li>
          <li>
            Confirm <code>public/geojson/nigeria-states.json</code> exists
            (TopoJSON)
          </li>
          <li>
            Confirm <code>public/geojson/nigeria_lga.json</code> exists
            (GeoJSON)
          </li>
          <li>
            Run <code>npm install</code> then <code>npm run dev</code>
          </li>
          <li>Open DevTools F12 → Console for full error details</li>
        </ul>
      </div>
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION CARD
// ═══════════════════════════════════════════════════════════════
function SectionCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 14,
        marginBottom: 20,
        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
        border: "1px solid #F3F4F6",
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION TITLE
// ── FIX 4: subtitle color now receives isDark and adjusts ──────
// ═══════════════════════════════════════════════════════════════
function SectionTitle({
  icon,
  title,
  subtitle,
  isDark = false,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  isDark?: boolean;
}) {
  return (
    <div style={{ marginBottom: 14 }}>
      <h2
        style={{
          margin: 0,
          fontSize: 16,
          fontWeight: 700,
          // Title always uses theme text (passed via inline style from parent)
          color: "inherit",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span>{icon}</span>
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: "4px 0 0",
            fontSize: 12,
            // FIX: bright/readable in dark mode, muted grey in light mode
            color: isDark ? "rgba(200, 230, 200, 0.9)" : "#6B7280",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════
export default function App() {
  // ── Core state ──────────────────────────────────────────────
  const [data, setData] = useState<any[]>([]);
  const [statesGeo, setStatesGeo] = useState<GeoJSONCollection | null>(null);
  const [lgasGeo, setLgasGeo] = useState<GeoJSONCollection | null>(null);
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedLga, setSelectedLga] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [exportOpen, setExportOpen] = useState<boolean>(false);

  const theme = useMemo(() => getTheme(isDark), [isDark]);

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      isDark ? "dark" : "light",
    );
  }, [isDark]);

  // ═══════════════════════════════════════════════════════════
  // DATA LOADING
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    Promise.all([
      loadCsv("/data/EnumaratedHH_STATE.csv"),

      fetch("/geojson/nigeria-states.json").then((r) => {
        if (!r.ok)
          throw new Error(`nigeria-states.json: ${r.status} ${r.statusText}`);
        return r.json();
      }),

      fetch("/geojson/nigeria_lga.json").then((r) => {
        if (!r.ok)
          throw new Error(`nigeria_lga.json: ${r.status} ${r.statusText}`);
        return r.json();
      }),
    ])
      .then(([csv, rawStates, rawLgas]) => {
        const sGeo = normalizeGeoJSON(rawStates);
        const lGeo = normalizeGeoJSON(rawLgas);

        if (!sGeo) throw new Error("nigeria-states.json failed to parse.");
        if (!lGeo) throw new Error("nigeria_lga.json failed to parse.");

        console.log(`✅ CSV:    ${(csv as any[]).length} rows`);
        console.log(`✅ States: ${sGeo.features.length} features`);
        console.log(`✅ LGAs:   ${lGeo.features.length} features`);

        setData(csv as any[]);
        setStatesGeo(sGeo);
        setLgasGeo(lGeo);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("❌ Bootstrap failed:", err);
        setError(err instanceof Error ? err.message : String(err));
        setLoading(false);
      });
  }, []);

  // ── LGA click events from map ────────────────────────────────
  useEffect(() => {
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ lga?: string }>;
      setSelectedLga(ce.detail?.lga ?? null);
    };
    window.addEventListener("lga-selected", handler as EventListener);
    return () =>
      window.removeEventListener("lga-selected", handler as EventListener);
  }, []);

  // ═══════════════════════════════════════════════════════════
  // AGGREGATIONS
  // ═══════════════════════════════════════════════════════════
  const statesAgg = useMemo<StateAgg[]>(() => byState(data), [data]);

  const lgaAgg = useMemo<LgaAgg[]>(
    () => (selectedState ? byLga(data, selectedState) : []),
    [data, selectedState],
  );

  const chartData = useMemo<LgaAgg[]>(
    () => (selectedLga ? lgaAgg.filter((l) => l.lga === selectedLga) : lgaAgg),
    [lgaAgg, selectedLga],
  );

  const communityCounts = useMemo<Record<string, number>>(() => {
    const counts: Record<string, number> = {};
    for (const r of data) {
      const rawState =
        (r as any).state ?? (r as any).State ?? (r as any).STATE ?? "";
      const ns = normalize(rawState);
      const displayState = statesAgg.find(
        (s) => s.normalizedState === ns,
      )?.state;
      if (!displayState) continue;
      counts[displayState] = (counts[displayState] ?? 0) + 1;
    }
    return counts;
  }, [data, statesAgg]);

  // ── Handlers ────────────────────────────────────────────────
  const handleStateClick = useCallback((stateName: string) => {
    setSelectedState(stateName);
    setSelectedLga(null);
  }, []);

  const handleStateChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedState(e.target.value);
      setSelectedLga(null);
    },
    [],
  );

  const handleClearState = useCallback(() => {
    setSelectedState("");
    setSelectedLga(null);
  }, []);

  const handleClearLga = useCallback(() => setSelectedLga(null), []);

  // ── Guards ───────────────────────────────────────────────────
  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;

  // ═══════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════
  return (
    <div
      id="dashboard-root"
      style={{
        padding: "20px 24px",
        background: theme.bg,
        minHeight: "100vh",
        fontFamily: "'DM Sans', Arial, sans-serif",
        maxWidth: 1400,
        margin: "0 auto",
        transition: "background 0.3s ease",
      }}
    >
      {/* ════════════════════════════════════════════════════
          HEADER
      ════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 22 }}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          background: theme.bgCard,
          padding: "16px 22px",
          borderRadius: 14,
          boxShadow: theme.shadow,
          border: `1px solid ${theme.border}`,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            style={{
              width: 44,
              height: 44,
              background: "linear-gradient(135deg, #4CAF50, #1A5632)",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(76,175,80,0.35)",
            }}
          >
            🏠
          </motion.div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 18,
                fontWeight: 800,
                color: theme.textMain,
                letterSpacing: 0.3,
              }}
            >
              NASSCO MDP Dashboard
            </h1>
            <p
              style={{
                margin: "2px 0 0",
                fontSize: 11,
                color: theme.textMuted,
                letterSpacing: 0.2,
              }}
            >
              Household Enumeration · Oyo · Benue · Sokoto · Abia
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              padding: "5px 12px",
              background: isDark
                ? "rgba(76,175,80,0.15)"
                : "rgba(45,138,78,0.08)",
              border: `1px solid ${theme.border}`,
              borderRadius: 20,
              fontSize: 11,
              color: theme.textMuted,
              fontWeight: 500,
            }}
          >
            {data.length.toLocaleString()} records
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setIsDark((d) => !d)}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              width: 38,
              height: 38,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 18,
            }}
          >
            {isDark ? "☀️" : "🌙"}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setExportOpen(true)}
            style={{
              padding: "9px 18px",
              background: "linear-gradient(135deg, #2D8A4E, #1A5632)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              gap: 7,
              boxShadow: "0 3px 10px rgba(26,86,50,0.35)",
              letterSpacing: 0.3,
            }}
          >
            📄 Export
          </motion.button>
        </div>
      </motion.div>

      {/* ════════════════════════════════════════════════════
          HERO CARDS
      ════════════════════════════════════════════════════ */}
      <div style={{ marginBottom: 20 }}>
        <HeroCards statesAgg={statesAgg} />
      </div>

      {/* ════════════════════════════════════════════════════
          MAPS SIDE-BY-SIDE
      ════════════════════════════════════════════════════ */}
      <div className="maps-side-by-side">
        {/* MAP 1 — State level */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 20 }}
          style={{
            background: theme.bgCard,
            borderRadius: 16,
            padding: "18px 18px 14px",
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            color: theme.textMain, // ← inherit fix
          }}
        >
          {/* FIX 4: pass isDark so subtitle is visible in dark mode */}
          <SectionTitle
            icon="🇳🇬"
            title="Nigeria — State Coverage"
            subtitle="State-level boundaries · Hover for HH & community counts · Click to drill down"
            isDark={isDark}
          />
          <div
            style={{
              borderRadius: 10,
              overflow: "hidden",
              border: `1px solid ${theme.border}`,
              flex: 1,
            }}
          >
            <NigeriaStateMap
              statesAgg={statesAgg}
              geojson={statesGeo}
              communityCounts={communityCounts}
              onStateClick={handleStateClick}
            />
          </div>
        </motion.div>

        {/* MAP 2 — LGA level
            FIX 3: pills REMOVED from here → moved to selector row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: "spring",
            stiffness: 180,
            damping: 20,
            delay: 0.08,
          }}
          style={{
            background: theme.bgCard,
            borderRadius: 16,
            padding: "18px 18px 14px",
            boxShadow: theme.shadow,
            border: `1px solid ${theme.border}`,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            color: theme.textMain,
          }}
        >
          {/* FIX 4: pass isDark */}
          <SectionTitle
            icon="🗺️"
            title="Nigeria — LGA Level"
            subtitle="Intervention states at LGA resolution · Hover for HH counts · Click to drill down"
            isDark={isDark}
          />
          <div
            style={{
              borderRadius: 10,
              overflow: "hidden",
              border: `1px solid ${theme.border}`,
              flex: 1,
            }}
          >
            <NigeriaMap
              statesAgg={statesAgg}
              geojson={lgasGeo}
              onStateClick={handleStateClick}
            />
          </div>
          {/* No pills here — relocated below to selector row */}
        </motion.div>
      </div>
      {/* end .maps-side-by-side */}

      {/* ════════════════════════════════════════════════════
          STATE SELECTOR ROW
          FIX 3: State pills live HERE, beside the dropdown
      ════════════════════════════════════════════════════ */}
      <SectionCard
        style={{
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          boxShadow: theme.shadow,
          padding: "14px 20px",
        }}
      >
        {/* Top row: label + dropdown + clear + badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 14,
          }}
        >
          <label
            htmlFor="state-select"
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: theme.textMain,
              whiteSpace: "nowrap",
            }}
          >
            📍 Select State:
          </label>

          <select
            id="state-select"
            value={selectedState}
            onChange={handleStateChange}
            style={{
              padding: "8px 14px",
              borderRadius: 8,
              border: `1px solid ${theme.border}`,
              fontSize: 13,
              color: theme.textMain,
              background: theme.bgCard,
              cursor: "pointer",
              minWidth: 240,
              fontFamily: "'DM Sans', sans-serif",
              outline: "none",
            }}
          >
            <option value="">— Select a State to view LGAs —</option>
            {statesAgg.map((s) => (
              <option key={s.normalizedState} value={s.state}>
                {s.state} — {s.hh.toLocaleString()} HHs · {s.lgaCount} LGAs
              </option>
            ))}
          </select>

          <AnimatePresence>
            {selectedState && (
              <motion.button
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleClearState}
                style={{
                  padding: "8px 14px",
                  background: "#FEE2E2",
                  color: "#991B1B",
                  border: "1px solid #FECACA",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                ✕ Clear
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {selectedState && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                style={{
                  marginLeft: "auto",
                  padding: "6px 14px",
                  background: isDark
                    ? "rgba(76,175,80,0.15)"
                    : "rgba(45,138,78,0.08)",
                  border: `1px solid ${
                    STATE_COLORS[selectedState] ?? theme.border
                  }`,
                  borderRadius: 20,
                  fontSize: 12,
                  fontWeight: 600,
                  color: STATE_COLORS[selectedState] ?? theme.textMuted,
                }}
              >
                {selectedState} · {lgaAgg.length} LGAs ·{" "}
                {lgaAgg.reduce((s, l) => s + l.hh, 0).toLocaleString()} HHs
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/*
          FIX 3: State summary pills live HERE — beside the selector.
          They are always visible (not just when state selected) so the
          user can see which states are available and click to select.
        */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            paddingTop: 4,
            borderTop: `1px solid ${theme.border}`,
          }}
        >
          <span
            style={{
              fontSize: 11,
              color: theme.textMuted,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              paddingRight: 4,
            }}
          >
            Quick select:
          </span>
          {statesAgg.map((s) => (
            <motion.button
              key={s.normalizedState}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleStateClick(s.state)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 12px",
                background:
                  selectedState === s.state
                    ? (STATE_COLORS[s.state] ?? "#4CAF50")
                    : theme.bgCard,
                border: `1.5px solid ${STATE_COLORS[s.state] ?? "#4CAF50"}`,
                borderRadius: 20,
                cursor: "pointer",
                fontSize: 11,
                fontWeight: 700,
                color:
                  selectedState === s.state
                    ? "#fff"
                    : (STATE_COLORS[s.state] ?? "#4CAF50"),
                transition: "all 0.18s",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: STATE_COLORS[s.state] ?? "#4CAF50",
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              {s.state}
              <span
                style={{
                  fontWeight: 400,
                  opacity: 0.75,
                  fontSize: 10,
                }}
              >
                {s.hh.toLocaleString()} HHs
              </span>
            </motion.button>
          ))}
        </div>
      </SectionCard>

      {/* ════════════════════════════════════════════════════
          LGA DRILL-DOWN MAP + CHART
          Shown only when a state is selected
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {selectedState && (
          <>
            {/* LGA Map card */}
            <SectionCard
              style={{
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
                color: theme.textMain,
              }}
            >
              <SectionTitle
                icon="📍"
                title={`${selectedState} — LGA Boundaries`}
                subtitle={
                  selectedLga
                    ? `Viewing: ${selectedLga} · Click another LGA or clear to reset`
                    : "Darker shading = more enumerated households. Click any LGA to filter the chart below."
                }
                isDark={isDark}
              />

              {/* Selected LGA indicator */}
              <AnimatePresence>
                {selectedLga && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 12,
                      padding: "8px 14px",
                      background: isDark
                        ? "rgba(76,175,80,0.1)"
                        : "rgba(45,138,78,0.06)",
                      border: `1px solid ${theme.border}`,
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 12, color: theme.textMuted }}>
                      📌 Selected LGA:
                    </span>
                    <strong style={{ fontSize: 13, color: theme.textMain }}>
                      {selectedLga}
                    </strong>
                    <span style={{ fontSize: 12, color: theme.textMuted }}>
                      —{" "}
                      {(
                        lgaAgg.find((l) => l.lga === selectedLga)?.hh ?? 0
                      ).toLocaleString()}{" "}
                      HHs
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={handleClearLga}
                      style={{
                        marginLeft: "auto",
                        padding: "3px 10px",
                        background: "#FEE2E2",
                        color: "#991B1B",
                        border: "1px solid #FECACA",
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ✕ Clear LGA
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/*
                overflow: visible so DynamicLegend rendered inside
                StateLgaMap is not clipped by the parent border-radius
              */}
              <div
                style={{
                  borderRadius: 10,
                  overflow: "visible",
                  border: `1px solid ${theme.border}`,
                }}
              >
                <StateLgaMap
                  lgaAgg={lgaAgg}
                  geojson={lgasGeo}
                  selectedState={selectedState}
                />
              </div>

              {/* LGA pill buttons — sorted by HH descending */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginTop: 14,
                }}
              >
                {lgaAgg
                  .slice()
                  .sort((a, b) => b.hh - a.hh)
                  .map((l) => (
                    <motion.button
                      key={l.normalizedLga}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() =>
                        setSelectedLga((prev) =>
                          prev === l.lga ? null : l.lga,
                        )
                      }
                      title={`${l.lga}: ${l.hh.toLocaleString()} HHs`}
                      style={{
                        padding: "4px 10px",
                        background:
                          selectedLga === l.lga
                            ? (STATE_COLORS[selectedState] ?? "#4CAF50")
                            : theme.bgCard,
                        border: `1px solid ${
                          selectedLga === l.lga
                            ? (STATE_COLORS[selectedState] ?? "#4CAF50")
                            : theme.border
                        }`,
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: selectedLga === l.lga ? 700 : 400,
                        color: selectedLga === l.lga ? "#fff" : theme.textMuted,
                        transition: "all 0.15s",
                      }}
                    >
                      {l.lga}{" "}
                      <span style={{ opacity: 0.7 }}>
                        {l.hh.toLocaleString()}
                      </span>
                    </motion.button>
                  ))}
              </div>
            </SectionCard>

            {/* Bar Chart */}
            <SectionCard
              style={{
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
              }}
            >
              <SectionTitle
                icon="📊"
                title={
                  selectedLga
                    ? `Enumerated HHs — ${selectedLga} (${selectedState})`
                    : `Enumerated HHs by LGA — ${selectedState}`
                }
                subtitle={
                  selectedLga
                    ? "Showing selected LGA only. Click Clear LGA above to see all."
                    : `${lgaAgg.length} LGAs · Click a bar or LGA badge to filter.`
                }
                isDark={isDark}
              />
              <LgaCharts data={chartData} />
            </SectionCard>
          </>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════
          EMPTY STATE — no state selected yet
      ════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {!selectedState && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            style={{
              textAlign: "center",
              padding: "52px 24px",
              background: isDark
                ? "rgba(36,53,41,0.5)"
                : "rgba(255,255,255,0.7)",
              borderRadius: 14,
              border: `1.5px dashed ${theme.border}`,
              marginBottom: 20,
            }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              style={{ fontSize: 52, marginBottom: 14 }}
            >
              🗺️
            </motion.div>
            <h3
              style={{
                color: theme.textMain,
                margin: "0 0 8px",
                fontSize: 17,
                fontWeight: 800,
              }}
            >
              Select a State to Explore LGA Data
            </h3>
            <p
              style={{
                color: theme.textMuted,
                fontSize: 13,
                maxWidth: 400,
                margin: "0 auto 24px",
                lineHeight: 1.6,
              }}
            >
              Click any highlighted state on the maps above, or use the Quick
              Select buttons in the selector row to view LGA-level boundaries
              and enumerated household counts.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {statesAgg.map((s) => (
                <motion.button
                  key={s.normalizedState}
                  whileHover={{ scale: 1.06, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleStateClick(s.state)}
                  style={{
                    padding: "10px 22px",
                    background: STATE_COLORS[s.state] ?? "#4CAF50",
                    color: "#fff",
                    border: "none",
                    borderRadius: 10,
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: `0 4px 14px ${
                      STATE_COLORS[s.state] ?? "#4CAF50"
                    }55`,
                  }}
                >
                  {s.state}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════ */}
      <div
        style={{
          marginTop: 12,
          paddingTop: 16,
          borderTop: `1px solid ${theme.border}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: theme.textMuted }}>
          NASSCO MDP · Household Enumeration · {data.length.toLocaleString()}{" "}
          records · {statesAgg.length} intervention states
        </p>
        <p style={{ margin: 0, fontSize: 11, color: theme.textMuted }}>
          {new Date().toLocaleDateString("en-NG", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* ════════════════════════════════════════════════════
          EXPORT MODAL — fixed centred, draggable
      ════════════════════════════════════════════════════ */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        statesAgg={statesAgg}
        lgaAgg={lgaAgg}
        selectedState={selectedState}
        communityCounts={communityCounts}
      />
    </div>
  );
}
