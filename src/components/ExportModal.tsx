// src/components/ExportModal.tsx
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — Export Modal
// Fixed: modal centred + draggable, PDF includes labelled maps
// ═══════════════════════════════════════════════════════════════
import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import jsPDF from "jspdf";
import type { StateAgg, LgaAgg } from "../lib/aggregations";
import { STATE_COLORS } from "../theme";

// ── Types ──────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  statesAgg: StateAgg[];
  lgaAgg: LgaAgg[];
  selectedState: string;
  communityCounts: Record<string, number>;
}

// ── Colour helpers ─────────────────────────────────────────────
function hhToColor(hh: number): string {
  if (hh === 0) return "#EFF6FF";
  if (hh <= 50) return "#BFDBFE";
  if (hh <= 100) return "#93C5FD";
  if (hh <= 200) return "#60A5FA";
  if (hh <= 500) return "#3B82F6";
  if (hh <= 1000) return "#2563EB";
  if (hh <= 2000) return "#1D4ED8";
  return "#1E3A8A";
}

function labelColor(hh: number): string {
  return hh > 200 ? "#FFFFFF" : "#1E293B";
}

// ── Hex → RGB ──────────────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// ── Project lat/lng → SVG x/y ──────────────────────────────────
function project(
  lng: number,
  lat: number,
  bbox: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  },
  svgW: number,
  svgH: number,
): [number, number] {
  const x = ((lng - bbox.minLng) / (bbox.maxLng - bbox.minLng)) * svgW;
  const y = svgH - ((lat - bbox.minLat) / (bbox.maxLat - bbox.minLat)) * svgH;
  return [x, y];
}

// ── Extract coordinate rings from a GeoJSON feature ────────────
function getRings(geometry: any): number[][][] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return geometry.coordinates;
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(1);
  return [];
}

// ── Compute bounding box ───────────────────────────────────────
function getBbox(features: any[]): {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
} {
  let minLng = 180,
    maxLng = -180;
  let minLat = 90,
    maxLat = -90;
  features.forEach((f) => {
    getRings(f.geometry).forEach((ring) => {
      ring.forEach(([lng, lat]) => {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      });
    });
  });
  const padLng = (maxLng - minLng) * 0.04;
  const padLat = (maxLat - minLat) * 0.04;
  return {
    minLng: minLng - padLng,
    maxLng: maxLng + padLng,
    minLat: minLat - padLat,
    maxLat: maxLat + padLat,
  };
}

// ── Centroid of a ring ─────────────────────────────────────────
function ringCentroid(ring: number[][]): [number, number] {
  let x = 0,
    y = 0;
  ring.forEach(([lng, lat]) => {
    x += lng;
    y += lat;
  });
  return [x / ring.length, y / ring.length];
}

// ── Largest ring of a feature ──────────────────────────────────
function largestRing(geometry: any): number[][] {
  const rings = getRings(geometry);
  if (rings.length === 0) return [];
  return rings.reduce(
    (best, ring) => (ring.length > best.length ? ring : best),
    rings[0],
  );
}

// ── Build Nigeria overview SVG ─────────────────────────────────
function buildNigeriaOverviewSvg(
  statesGeo: any,
  statesAgg: StateAgg[],
): string {
  const W = 800,
    H = 600;
  const features = statesGeo?.features ?? [];
  if (features.length === 0) return "";

  const bbox = getBbox(features);
  const stateMap = new Map(
    statesAgg.map((s) => [s.state.toLowerCase().trim(), s]),
  );

  let paths = "";
  let labels = "";

  features.forEach((f: any) => {
    const rawName: string =
      f.properties?.NAME_1 ??
      f.properties?.name_1 ??
      f.properties?.name ??
      f.properties?.NAME ??
      "";
    const key = rawName.toLowerCase().trim();
    const data = stateMap.get(key);
    const fill = data ? (STATE_COLORS[data.state] ?? "#4CAF50") : "#C8D6C0";
    const stroke = "#1a1a1a";
    const strokeWidth = data ? 1.8 : 0.8;

    getRings(f.geometry).forEach((ring) => {
      const pts = ring
        .map(([lng, lat]) => project(lng, lat, bbox, W, H).join(","))
        .join(" ");
      paths += `<polygon points="${pts}" fill="${fill}"
        fill-opacity="${data ? "0.85" : "0.30"}"
        stroke="${stroke}" stroke-width="${strokeWidth}"
        stroke-linejoin="round"/>`;
    });

    if (data) {
      const lr = largestRing(f.geometry);
      if (lr.length > 0) {
        const [cLng, cLat] = ringCentroid(lr);
        const [cx, cy] = project(cLng, cLat, bbox, W, H);
        labels += `
          <text x="${cx}" y="${cy - 7}"
            font-family="Arial,sans-serif" font-size="11"
            font-weight="bold" fill="${fill}"
            stroke="white" stroke-width="2.5"
            paint-order="stroke" text-anchor="middle">
            ${data.state}
          </text>
          <text x="${cx}" y="${cy + 7}"
            font-family="Arial,sans-serif" font-size="9"
            fill="#111827" stroke="white" stroke-width="2"
            paint-order="stroke" text-anchor="middle">
            ${data.hh.toLocaleString()} HHs
          </text>`;
      }
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg"
    width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#EFF6FF"/>
    ${paths}
    ${labels}
  </svg>`;
}

// ── Build state LGA choropleth SVG ─────────────────────────────
function buildStateLgaSvg(
  lgasGeo: any,
  lgaAgg: LgaAgg[],
  selectedState: string,
): string {
  const W = 800,
    H = 540;

  const stateNorm = selectedState.toLowerCase().trim();
  const allFeatures = lgasGeo?.features ?? [];

  const features = allFeatures.filter((f: any) => {
    const sn: string =
      f.properties?.NAME_1 ??
      f.properties?.name_1 ??
      f.properties?.admin1Name ??
      f.properties?.state ??
      "";
    return sn.toLowerCase().trim() === stateNorm;
  });

  if (features.length === 0) return "";

  const bbox = getBbox(features);
  const lgaMap = new Map(lgaAgg.map((l) => [l.lga.toLowerCase().trim(), l]));

  let paths = "";
  let labels = "";

  features.forEach((f: any) => {
    const rawLga: string =
      f.properties?.NAME_2 ??
      f.properties?.name_2 ??
      f.properties?.LGA ??
      f.properties?.lga ??
      f.properties?.lganame ??
      f.properties?.admin2Name ??
      f.properties?.name ??
      "";
    const key = rawLga.toLowerCase().trim();
    const data = lgaMap.get(key);
    const hh = data?.hh ?? 0;
    const fill = hhToColor(hh);

    getRings(f.geometry).forEach((ring) => {
      const pts = ring
        .map(([lng, lat]) => project(lng, lat, bbox, W, H).join(","))
        .join(" ");
      paths += `<polygon points="${pts}" fill="${fill}"
        fill-opacity="0.92" stroke="#334155"
        stroke-width="1.5" stroke-linejoin="round"/>`;
    });

    const lr = largestRing(f.geometry);
    if (lr.length > 0 && rawLga) {
      const [cLng, cLat] = ringCentroid(lr);
      const [cx, cy] = project(cLng, cLat, bbox, W, H);
      const fg = labelColor(hh);
      labels += `
        <text x="${cx}" y="${cy - 5}"
          font-family="Arial,sans-serif" font-size="10"
          font-weight="bold" fill="${fg}"
          stroke="${hh > 200 ? "rgba(0,0,0,0.4)" : "white"}"
          stroke-width="2.2" paint-order="stroke"
          text-anchor="middle">${rawLga}</text>
        <text x="${cx}" y="${cy + 9}"
          font-family="Arial,sans-serif" font-size="8.5"
          fill="${fg}" opacity="0.9"
          stroke="${hh > 200 ? "rgba(0,0,0,0.3)" : "white"}"
          stroke-width="1.8" paint-order="stroke"
          text-anchor="middle">${hh.toLocaleString()} HHs</text>`;
    }
  });

  const bands = [
    { label: "0", color: "#EFF6FF" },
    { label: "1–50", color: "#BFDBFE" },
    { label: "51–100", color: "#93C5FD" },
    { label: "101–200", color: "#60A5FA" },
    { label: "201–500", color: "#3B82F6" },
    { label: "501–1000", color: "#2563EB" },
    { label: "1001–2000", color: "#1D4ED8" },
    { label: "2000+", color: "#1E3A8A" },
  ];

  let legendSvg = `
    <text x="10" y="${H - 38}"
      font-family="Arial,sans-serif" font-size="9"
      fill="#374151" font-weight="bold">
      Enumerated HHs:
    </text>`;

  bands.forEach((b, i) => {
    const bx = 10 + i * 72;
    legendSvg += `
      <rect x="${bx}" y="${H - 28}" width="40" height="10"
        fill="${b.color}" stroke="#CBD5E1" stroke-width="0.5"/>
      <text x="${bx + 20}" y="${H - 12}"
        font-family="Arial,sans-serif" font-size="7.5"
        fill="#374151" text-anchor="middle">${b.label}</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg"
    width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <rect width="${W}" height="${H}" fill="#EFF6FF"/>
    ${paths}
    ${labels}
    ${legendSvg}
  </svg>`;
}

// ── Render SVG string → PNG data URL via canvas ────────────────
async function svgToDataUrl(svgString: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width || 800;
      canvas.height = img.height || 600;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ── Draw PDF header ────────────────────────────────────────────
function drawPdfHeader(doc: jsPDF, pageW: number) {
  doc.setFillColor(26, 86, 50);
  doc.rect(0, 0, pageW, 28, "F");

  doc.setFillColor(45, 138, 78);
  doc.roundedRect(8, 5, 18, 18, 2, 2, "F");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("MDP", 17, 16, { align: "center" });

  doc.setFontSize(13);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("NASSCO MDP — Household Enumeration Dashboard", 32, 12);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(200, 230, 200);
  doc.text(
    `Exported: ${new Date().toLocaleDateString("en-NG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}`,
    32,
    20,
  );

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(200, 230, 200);
  doc.text("CONFIDENTIAL", pageW - 10, 16, { align: "right" });

  doc.setFillColor(76, 175, 80);
  doc.rect(0, 28, pageW, 2, "F");
}

// ── Draw section heading ───────────────────────────────────────
function drawSectionHeading(
  doc: jsPDF,
  title: string,
  subtitle: string,
  y: number,
  pageW: number,
) {
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 86, 50);
  doc.text(title, 14, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(107, 114, 128);
  doc.text(subtitle, 14, y + 7, { maxWidth: pageW - 28 });
}

// ── Draw LGA table ─────────────────────────────────────────────
// pageW is derived internally from doc — no unused parameter
function drawLgaTable(
  doc: jsPDF,
  lgaAgg: LgaAgg[],
  stateColor: string,
  startY: number,
): number {
  const pageW = doc.internal.pageSize.getWidth();
  const [r, g, b] = hexToRgb(stateColor);
  const colW = [pageW * 0.4, pageW * 0.3, pageW * 0.22];
  const rowH = 9;
  const left = 14;

  // Table header row
  doc.setFillColor(r, g, b);
  doc.rect(left, startY, pageW - 28, rowH, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("LGA", left + 3, startY + 6.2);
  doc.text("Enumerated HHs", left + colW[0] + 3, startY + 6.2);
  doc.text("% of State Total", left + colW[0] + colW[1] + 3, startY + 6.2);

  let y = startY + rowH;
  const total = lgaAgg.reduce((s, l) => s + l.hh, 0);

  lgaAgg
    .slice()
    .sort((a, b) => b.hh - a.hh)
    .forEach((lga, i) => {
      const pct = total > 0 ? ((lga.hh / total) * 100).toFixed(1) + "%" : "—";

      if (i % 2 === 0) {
        doc.setFillColor(245, 250, 245);
        doc.rect(left, y, pageW - 28, rowH, "F");
      }

      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(lga.lga.toUpperCase(), left + 3, y + 6.2);

      doc.setFont("helvetica", "bold");
      doc.text(lga.hh.toLocaleString(), left + colW[0] + 3, y + 6.2);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(pct, left + colW[0] + colW[1] + 3, y + 6.2);

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(left, y + rowH, left + pageW - 28, y + rowH);

      y += rowH;
    });

  // Total row
  doc.setFillColor(220, 240, 220);
  doc.rect(left, y, pageW - 28, rowH, "F");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 86, 50);
  doc.text("TOTAL", left + 3, y + 6.2);
  doc.text(total.toLocaleString(), left + colW[0] + 3, y + 6.2);

  return y + rowH + 6;
}

// ── Export: Nigeria Overview PDF ───────────────────────────────
async function exportNigeriaOverview(statesAgg: StateAgg[], statesGeo: any) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  drawPdfHeader(doc, pageW);

  let y = 36;
  drawSectionHeading(
    doc,
    "Nigeria — All Intervention States Overview",
    "Household enumeration coverage across Oyo · Benue · Sokoto · Abia",
    y,
    pageW,
  );
  y += 14;

  const svgStr = buildNigeriaOverviewSvg(statesGeo, statesAgg);
  if (svgStr) {
    try {
      const dataUrl = await svgToDataUrl(svgStr);
      const mapH = pageH - y - 45;
      const mapW = pageW - 28;
      doc.addImage(dataUrl, "PNG", 14, y, mapW, mapH);
      y += mapH + 6;
    } catch (e) {
      console.warn("Map render failed:", e);
    }
  }

  const colW = (pageW - 28) / statesAgg.length;
  statesAgg.forEach((s, i) => {
    const [sr, sg, sb] = hexToRgb(STATE_COLORS[s.state] ?? "#4CAF50");
    const x = 14 + i * colW;
    doc.setFillColor(sr, sg, sb);
    doc.roundedRect(x, y, colW - 4, 18, 2, 2, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(s.state, x + (colW - 4) / 2, y + 6, { align: "center" });
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${s.hh.toLocaleString()} HHs · ${s.lgaCount} LGAs`,
      x + (colW - 4) / 2,
      y + 12,
      { align: "center" },
    );
  });

  doc.save("NASSCO_Nigeria_Overview.pdf");
}

// ── Export: Single State LGA PDF ───────────────────────────────
async function exportStateLgaPdf(
  state: string,
  lgaAgg: LgaAgg[],
  lgasGeo: any,
  statesAgg: StateAgg[],
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  drawPdfHeader(doc, pageW);

  // statesAgg used only for type safety — suppress lint
  void statesAgg;

  let y = 36;
  const total = lgaAgg.reduce((s, l) => s + l.hh, 0);
  const stateColor = STATE_COLORS[state] ?? "#3B82F6";

  drawSectionHeading(
    doc,
    `${state} State — LGA Household Enumeration`,
    `Total: ${total.toLocaleString()} HHs across ${lgaAgg.length} LGAs`,
    y,
    pageW,
  );
  y += 14;

  // Map section
  const svgStr = buildStateLgaSvg(lgasGeo, lgaAgg, state);
  if (svgStr) {
    try {
      const dataUrl = await svgToDataUrl(svgStr);
      const mapH = pageH * 0.38;
      const mapW = pageW - 28;
      doc.addImage(dataUrl, "PNG", 14, y, mapW, mapH);

      const [sr, sg, sb] = hexToRgb(stateColor);
      doc.setDrawColor(sr, sg, sb);
      doc.setLineWidth(0.6);
      doc.rect(14, y, mapW, mapH);

      y += mapH + 3;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(120, 120, 120);
      doc.text(
        `Figure: ${state} LGA choropleth — darker blue = more enumerated households`,
        14,
        y,
      );
      y += 7;
    } catch (e) {
      console.warn("LGA map render failed:", e);
      y += 4;
    }
  }

  // Table section
  y = drawLgaTable(doc, lgaAgg, stateColor, y);

  // Footer
  doc.setFillColor(245, 247, 250);
  doc.rect(0, pageH - 12, pageW, 12, "F");
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text(
    `NASSCO MDP · ${state} State Report · ${new Date().toLocaleDateString(
      "en-NG",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    )}`,
    pageW / 2,
    pageH - 5,
    { align: "center" },
  );

  doc.save(`NASSCO_${state}_LGA_Report.pdf`);
}

// ── Export: Full Dashboard PDF ─────────────────────────────────
async function exportFullDashboard(
  statesAgg: StateAgg[],
  lgaAgg: LgaAgg[],
  selectedState: string,
  statesGeo: any,
  lgasGeo: any,
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // Page 1 — Overview
  drawPdfHeader(doc, pageW);

  let y = 36;
  drawSectionHeading(
    doc,
    "Nigeria — All Intervention States Overview",
    `Total HHs: ${statesAgg
      .reduce((s, a) => s + a.hh, 0)
      .toLocaleString()} · ${statesAgg.length} States`,
    y,
    pageW,
  );
  y += 14;

  const overviewSvg = buildNigeriaOverviewSvg(statesGeo, statesAgg);
  if (overviewSvg) {
    try {
      const dataUrl = await svgToDataUrl(overviewSvg);
      const mapH = 90;
      doc.addImage(dataUrl, "PNG", 14, y, pageW - 28, mapH);
      y += mapH + 6;
    } catch (e) {
      console.warn("Overview map render failed:", e);
    }
  }

  statesAgg.forEach((s) => {
    const [sr, sg, sb] = hexToRgb(STATE_COLORS[s.state] ?? "#4CAF50");
    doc.setFillColor(sr, sg, sb);
    doc.roundedRect(14, y, pageW - 28, 14, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(s.state, 20, y + 9);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(
      `${s.hh.toLocaleString()} HHs · ${s.lgaCount} LGAs`,
      pageW - 16,
      y + 9,
      { align: "right" },
    );
    y += 18;
  });

  // Per-state pages
  for (const s of statesAgg) {
    doc.addPage();
    drawPdfHeader(doc, pageW);

    let sy = 36;
    const thisLgas = s.state === selectedState ? lgaAgg : [];
    const total = thisLgas.reduce((acc, l) => acc + l.hh, 0);

    drawSectionHeading(
      doc,
      `${s.state} State — LGA Household Enumeration`,
      `Total: ${(total || s.hh).toLocaleString()} HHs across ${
        thisLgas.length || s.lgaCount
      } LGAs`,
      sy,
      pageW,
    );
    sy += 14;

    const lgaSvg = buildStateLgaSvg(lgasGeo, thisLgas, s.state);
    if (lgaSvg && thisLgas.length > 0) {
      try {
        const dataUrl = await svgToDataUrl(lgaSvg);
        const mapH = 95;
        doc.addImage(dataUrl, "PNG", 14, sy, pageW - 28, mapH);
        const [sr, sg, sb] = hexToRgb(STATE_COLORS[s.state] ?? "#4CAF50");
        doc.setDrawColor(sr, sg, sb);
        doc.setLineWidth(0.5);
        doc.rect(14, sy, pageW - 28, mapH);
        sy += mapH + 5;
        doc.setFontSize(7.5);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(130, 130, 130);
        doc.text(`${s.state} LGA choropleth — darker = more HHs`, 14, sy);
        sy += 6;
      } catch (e) {
        console.warn(`Map for ${s.state} failed:`, e);
      }
    }

    if (thisLgas.length > 0) {
      drawLgaTable(doc, thisLgas, STATE_COLORS[s.state] ?? "#4CAF50", sy);
    } else {
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(150, 150, 150);
      doc.text(
        "Select this state in the dashboard to generate a detailed LGA report.",
        14,
        sy + 6,
        { maxWidth: pageW - 28 },
      );
    }

    // Page footer
    doc.setFillColor(245, 247, 250);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text(
      `NASSCO MDP · ${s.state} · Page ${doc.getCurrentPageInfo().pageNumber}`,
      pageW / 2,
      pageH - 5,
      { align: "center" },
    );
  }

  doc.save("NASSCO_Full_Dashboard.pdf");
}

// ═══════════════════════════════════════════════════════════════
// DRAGGABLE MODAL COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function ExportModal({
  isOpen,
  onClose,
  statesAgg,
  lgaAgg,
  selectedState,
  communityCounts,
}: Props) {
  const [statesGeo, setStatesGeo] = useState<any>(null);
  const [lgasGeo, setLgasGeo] = useState<any>(null);
  const [exporting, setExporting] = useState<string>("");

  // Load geo data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (statesGeo && lgasGeo) return;

    Promise.all([
      fetch("/geojson/nigeria-states.json").then((r) => r.json()),
      fetch("/geojson/nigeria_lga.json").then((r) => r.json()),
    ]).then(([rawS, rawL]) => {
      function toGeo(raw: any): any {
        if (raw?.type === "FeatureCollection") return raw;
        if (raw?.type === "Topology") {
          const key = Object.keys(raw.objects ?? {})[0];
          const obj = raw.objects[key];
          const sx = raw.transform?.scale[0] ?? 1;
          const sy = raw.transform?.scale[1] ?? 1;
          const tx = raw.transform?.translate[0] ?? 0;
          const ty = raw.transform?.translate[1] ?? 0;

          function decodeArc(arc: number[][]): [number, number][] {
            let x = 0,
              y = 0;
            return arc.map(([dx, dy]) => {
              x += dx;
              y += dy;
              return [x * sx + tx, y * sy + ty] as [number, number];
            });
          }

          const decoded = (raw.arcs as number[][][]).map(decodeArc);

          function stitchRing(ring: number[]): [number, number][] {
            const pts: [number, number][] = [];
            ring.forEach((idx) => {
              const arc =
                idx >= 0 ? decoded[idx] : [...decoded[~idx]].reverse();
              pts.push(...(pts.length === 0 ? arc : arc.slice(1)));
            });
            return pts;
          }

          const features = obj.geometries.map((g: any) => {
            let coordinates: any = null;
            const type = g.type;
            if (g.type === "Polygon") {
              coordinates = g.arcs.map((ring: number[]) => stitchRing(ring));
            } else if (g.type === "MultiPolygon") {
              coordinates = g.arcs.map((poly: number[][]) =>
                poly.map((ring: number[]) => stitchRing(ring)),
              );
            }
            return {
              type: "Feature",
              properties: g.properties ?? {},
              geometry: coordinates ? { type, coordinates } : null,
            };
          });

          return { type: "FeatureCollection", features };
        }
        return null;
      }

      setStatesGeo(toGeo(rawS));
      setLgasGeo(toGeo(rawL));
    });
  }, [isOpen, statesGeo, lgasGeo]);

  // ── Draggable ──────────────────────────────────────────────
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({
    mx: 0,
    my: 0,
    px: 0,
    py: 0,
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) setPos({ x: 0, y: 0 });
  }, [isOpen]);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      setDragging(true);
      dragStart.current = {
        mx: e.clientX,
        my: e.clientY,
        px: pos.x,
        py: pos.y,
      };
      e.preventDefault();
    },
    [pos],
  );

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      setPos({
        x: dragStart.current.px + (e.clientX - dragStart.current.mx),
        y: dragStart.current.py + (e.clientY - dragStart.current.my),
      });
    };
    const onUp = () => setDragging(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  // ── Export handler ─────────────────────────────────────────
  async function handleExport(type: string) {
    setExporting(type);
    try {
      if (type === "full") {
        await exportFullDashboard(
          statesAgg,
          lgaAgg,
          selectedState,
          statesGeo,
          lgasGeo,
        );
      } else if (type === "nigeria") {
        await exportNigeriaOverview(statesAgg, statesGeo);
      } else if (type === "state" && selectedState) {
        await exportStateLgaPdf(selectedState, lgaAgg, lgasGeo, statesAgg);
      }
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting("");
    }
  }

  // ── Options ────────────────────────────────────────────────
  const options = [
    {
      id: "full",
      icon: "🖥️",
      title: "Full Dashboard PDF",
      desc: "All states — overview map + per-state LGA maps + tables",
      disabled: false,
    },
    {
      id: "nigeria",
      icon: "🗺️",
      title: "Nigeria Overview Map",
      desc: "Nigeria map showing all 4 intervention states with HH counts, LGAs and communities",
      disabled: false,
    },
    ...(selectedState
      ? [
          {
            id: "state",
            icon: "📍",
            title: `${selectedState} — LGA Map`,
            desc: `Export ${selectedState} LGA choropleth map with labelled HH counts per LGA`,
            disabled: lgaAgg.length === 0,
          },
        ]
      : []),
  ];

  // ── Render ─────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="export-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              zIndex: 1000,
              backdropFilter: "blur(3px)",
            }}
          />

          {/* Modal — fixed centred + draggable */}
          <motion.div
            key="export-modal"
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.92, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -20 }}
            transition={{
              type: "spring",
              stiffness: 280,
              damping: 26,
            }}
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
              zIndex: 1001,
              width: "min(560px, 94vw)",
              maxHeight: "85vh",
              display: "flex",
              flexDirection: "column",
              borderRadius: 14,
              overflow: "hidden",
              boxShadow:
                "0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)",
              userSelect: "none",
            }}
          >
            {/* Header / drag handle */}
            <div
              onMouseDown={onMouseDown}
              style={{
                background: "linear-gradient(135deg, #1A5632, #2D8A4E)",
                padding: "16px 20px 14px",
                cursor: dragging ? "grabbing" : "grab",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
                gap: 4,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span style={{ fontSize: 20 }}>📄</span>
                  <div>
                    <h2
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#FFFFFF",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Export Options
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 11,
                        color: "rgba(255,255,255,0.75)",
                        fontFamily: "'DM Sans', sans-serif",
                      }}
                    >
                      Maps include embedded labels &amp; counts
                    </p>
                  </div>
                </div>

                {/* Close button */}
                <motion.button
                  whileHover={{
                    scale: 1.1,
                    background: "rgba(255,255,255,0.2)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    color: "#fff",
                    fontSize: 16,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ✕
                </motion.button>
              </div>

              {/* Drag hint */}
              <p
                style={{
                  margin: 0,
                  fontSize: 10,
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "'DM Sans', sans-serif",
                  letterSpacing: 0.2,
                }}
              >
                ⠿ Drag this bar to reposition the panel
              </p>

              {/* Selected state badge */}
              {selectedState && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                    padding: "3px 10px",
                    background: "rgba(255,255,255,0.15)",
                    borderRadius: 20,
                    width: "fit-content",
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: STATE_COLORS[selectedState] ?? "#4CAF50",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 11,
                      color: "#fff",
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: 600,
                    }}
                  >
                    {selectedState} selected ·{" "}
                    {lgaAgg.reduce((s, l) => s + l.hh, 0).toLocaleString()} HHs
                  </span>
                </div>
              )}
            </div>

            {/* Scrollable options */}
            <div
              style={{
                background: "#FFFFFF",
                overflowY: "auto",
                flex: 1,
                padding: "12px 16px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {options.map((opt) => (
                <div
                  key={opt.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 16px",
                    background: opt.disabled ? "#F9FAFB" : "#FAFFFE",
                    border: "1px solid #E5E7EB",
                    borderRadius: 10,
                    opacity: opt.disabled ? 0.55 : 1,
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      background: opt.disabled ? "#F3F4F6" : "#EFF6FF",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {opt.icon}
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#111827",
                        fontFamily: "'DM Sans', sans-serif",
                        marginBottom: 2,
                      }}
                    >
                      {opt.title}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#6B7280",
                        fontFamily: "'DM Sans', sans-serif",
                        lineHeight: 1.45,
                      }}
                    >
                      {opt.desc}
                    </div>
                  </div>

                  {/* Export button */}
                  <motion.button
                    whileHover={
                      !opt.disabled && exporting === ""
                        ? { scale: 1.04 }
                        : undefined
                    }
                    whileTap={
                      !opt.disabled && exporting === ""
                        ? { scale: 0.97 }
                        : undefined
                    }
                    disabled={opt.disabled || exporting !== ""}
                    onClick={() => handleExport(opt.id)}
                    style={{
                      padding: "8px 16px",
                      background:
                        exporting === opt.id
                          ? "#9CA3AF"
                          : opt.disabled
                            ? "#D1D5DB"
                            : "linear-gradient(135deg, #2D8A4E, #1A5632)",
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      cursor:
                        opt.disabled || exporting !== ""
                          ? "not-allowed"
                          : "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                      minWidth: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 5,
                    }}
                  >
                    {exporting === opt.id ? (
                      <>
                        <motion.span
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          style={{ display: "inline-block" }}
                        >
                          ⟳
                        </motion.span>
                        Exporting…
                      </>
                    ) : (
                      "Export PDF"
                    )}
                  </motion.button>
                </div>
              ))}

              {/* Tip box */}
              <div
                style={{
                  padding: "10px 14px",
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: 8,
                  fontSize: 10.5,
                  color: "#166534",
                  fontFamily: "'DM Sans', sans-serif",
                  lineHeight: 1.5,
                }}
              >
                💡 <strong>Tip:</strong> Select a state from the map or dropdown
                first to enable the state-specific LGA map export with full
                labelling and choropleth colouring.
              </div>

              {/* Community counts summary */}
              {Object.keys(communityCounts).length > 0 && (
                <div
                  style={{
                    padding: "8px 14px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                    borderRadius: 8,
                    fontSize: 10,
                    color: "#6B7280",
                    fontFamily: "'DM Sans', sans-serif",
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {Object.entries(communityCounts).map(([state, count]) => (
                    <span key={state}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          background: STATE_COLORS[state] ?? "#4CAF50",
                          marginRight: 4,
                          verticalAlign: "middle",
                        }}
                      />
                      {state}: {count.toLocaleString()} communities
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
