// src/lib/exportPdf.ts
// ═══════════════════════════════════════════════════════════════
// NASSCO MDP — PDF Export using canvas-rendered maps with labels
// Maps are drawn directly onto canvas so labels appear in export
// ═══════════════════════════════════════════════════════════════
import jsPDF from "jspdf";

// ── Color helpers ──────────────────────────────────────────────
const STATE_COLOR_MAP: Record<string, string> = {
  Oyo: "#4CAF50",
  Benue: "#8B5CF6",
  Sokoto: "#42A5F5",
  Abia: "#FFA726",
};

function hhColor(hh: number): string {
  if (hh > 2000) return "#08306b";
  if (hh > 1000) return "#08519c";
  if (hh > 500) return "#2171b5";
  if (hh > 200) return "#4292c6";
  if (hh > 100) return "#6baed6";
  if (hh > 50) return "#9ecae1";
  return "#c6dbef";
}

// ── Wait helper ────────────────────────────────────────────────
function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Capture Leaflet map as canvas image ────────────────────────
async function captureLeafletMap(containerId: string): Promise<string | null> {
  await wait(800);

  const container = document.getElementById(containerId);
  if (!container) {
    console.warn(`captureLeafletMap: #${containerId} not found`);
    return null;
  }

  const leafletContainer = container.querySelector(
    ".leaflet-container",
  ) as HTMLElement | null;
  if (!leafletContainer) return null;

  const rect = leafletContainer.getBoundingClientRect();
  const W = Math.round(rect.width) || 800;
  const H = Math.round(rect.height) || 500;
  const SCALE = 2;

  const canvas = document.createElement("canvas");
  canvas.width = W * SCALE;
  canvas.height = H * SCALE;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, W, H);

  const svgLayers = leafletContainer.querySelectorAll(
    ".leaflet-overlay-pane svg, .leaflet-zoom-animated",
  );

  for (const svgEl of Array.from(svgLayers)) {
    if (svgEl.tagName.toLowerCase() !== "svg") continue;
    try {
      const clone = svgEl.cloneNode(true) as SVGElement;
      clone.setAttribute("width", String(W));
      clone.setAttribute("height", String(H));

      const paths = clone.querySelectorAll("path");
      const origPaths = svgEl.querySelectorAll("path");
      paths.forEach((p, i) => {
        const orig = origPaths[i];
        if (orig) {
          const cs = window.getComputedStyle(orig);
          p.setAttribute("fill", cs.fill || "none");
          p.setAttribute("fill-opacity", cs.fillOpacity || "1");
          p.setAttribute("stroke", cs.stroke || "none");
          p.setAttribute("stroke-width", cs.strokeWidth || "1");
        }
      });

      const svgStr = new XMLSerializer().serializeToString(clone);
      const svgBlob = new Blob([svgStr], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve) => {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, W, H);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        img.src = url;
      });
    } catch (e) {
      console.warn("SVG layer capture failed:", e);
    }
  }

  return canvas.toDataURL("image/png");
}

// ── Hex to RGB helper ──────────────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

// ── Build professional PDF document ───────────────────────────
function buildPDF(options: {
  title: string;
  subtitle: string;
  mapCanvas: string | null;
  labels: {
    name: string;
    sub: string;
    color: string;
    xPct: number;
    yPct: number;
  }[];
  tableHeaders: string[];
  tableRows: string[][];
  date: string;
  orientation?: "landscape" | "portrait";
}): jsPDF {
  const {
    title,
    subtitle,
    mapCanvas,
    labels,
    tableHeaders,
    tableRows,
    date,
    orientation = "landscape",
  } = options;

  const pdf = new jsPDF({ orientation, unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const M = 14;

  // Header
  pdf.setFillColor(26, 86, 50);
  pdf.rect(0, 0, pageW, 24, "F");

  pdf.setFillColor(45, 138, 78);
  pdf.roundedRect(M, 4, 16, 16, 2, 2, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  pdf.text("MDP", M + 8, 13.5, { align: "center" });

  pdf.setFontSize(13);
  pdf.text("NASSCO MDP — Household Enumeration Dashboard", M + 20, 11);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "normal");
  pdf.text(`Exported: ${date}`, M + 20, 18);
  pdf.text("CONFIDENTIAL", pageW - M, 18, { align: "right" });

  // Accent line
  pdf.setFillColor(76, 175, 80);
  pdf.rect(0, 24, pageW, 1.5, "F");

  // Section title
  pdf.setTextColor(26, 86, 50);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text(title, M, 34);

  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text(subtitle, M, 40);

  let curY = 44;

  // Map
  if (mapCanvas) {
    const mapW = pageW - M * 2;
    const mapH = 105;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(M, curY, mapW, mapH, 2, 2, "S");
    pdf.addImage(mapCanvas, "PNG", M, curY, mapW, mapH);

    if (labels.length > 0) {
      labels.forEach(({ name, sub, color, xPct, yPct }) => {
        const lx = M + mapW * xPct;
        const ly = curY + mapH * yPct;
        const pillW = Math.max(
          pdf.getStringUnitWidth(name) * 3.5 + 8,
          pdf.getStringUnitWidth(sub) * 2.8 + 8,
        );
        const pillH = 10;
        const pillX = lx - pillW / 2;
        const pillY = ly - pillH / 2;

        pdf.setFillColor(255, 255, 255);
        const [cr, cg, cb] = hexToRgb(color);
        pdf.setDrawColor(cr, cg, cb);
        pdf.setLineWidth(0.6);
        pdf.roundedRect(pillX, pillY, pillW, pillH, 1.5, 1.5, "FD");

        pdf.setFontSize(6);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(cr, cg, cb);
        pdf.text(name, lx, pillY + 3.8, { align: "center" });

        pdf.setFontSize(5);
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(55, 65, 81);
        pdf.text(sub, lx, pillY + 7.5, { align: "center" });
      });
    }

    curY += mapH + 8;
  }

  // Table
  if (tableRows.length > 0) {
    const colCount = tableHeaders.length;
    const colW = (pageW - M * 2) / colCount;
    const rowH = 7;

    pdf.setFillColor(26, 86, 50);
    pdf.rect(M, curY, pageW - M * 2, rowH + 1, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "bold");
    tableHeaders.forEach((h, i) => {
      pdf.text(h, M + colW * i + 3, curY + 5.5);
    });
    curY += rowH + 1;

    tableRows.forEach((row, ri) => {
      if (curY > pageH - 18) {
        pdf.addPage();
        curY = M;
      }

      if (ri % 2 === 0) {
        pdf.setFillColor(248, 250, 252);
        pdf.rect(M, curY, pageW - M * 2, rowH, "F");
      }

      pdf.setDrawColor(243, 244, 246);
      pdf.setLineWidth(0.2);
      pdf.line(M, curY + rowH, M + pageW - M * 2, curY + rowH);

      pdf.setTextColor(17, 24, 39);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      row.forEach((cell, i) => {
        pdf.text(String(cell), M + colW * i + 3, curY + 5);
      });
      curY += rowH;
    });

    if (curY < pageH - 18) {
      pdf.setFillColor(220, 252, 231);
      pdf.rect(M, curY, pageW - M * 2, rowH + 1, "F");
      pdf.setTextColor(26, 86, 50);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.text("TOTAL", M + 3, curY + 5.5);
      const totalHH = tableRows.reduce(
        (s, r) => s + parseInt(String(r[1]).replace(/,/g, "") || "0"),
        0,
      );
      if (colCount > 1) {
        pdf.text(totalHH.toLocaleString(), M + colW + 3, curY + 5.5);
      }
    }
  }

  // Footer
  pdf.setFillColor(248, 250, 252);
  pdf.rect(0, pageH - 10, pageW, 10, "F");
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.line(0, pageH - 10, pageW, pageH - 10);
  pdf.setTextColor(156, 163, 175);
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text(
    "NASSCO MDP Household Enumeration Dashboard — Federal Government of Nigeria",
    pageW / 2,
    pageH - 4,
    { align: "center" },
  );
  pdf.text("Page 1", pageW - M, pageH - 4, { align: "right" });

  return pdf;
}

// ── Label positions for each intervention state ────────────────
const STATE_MAP_POSITIONS: Record<string, { xPct: number; yPct: number }> = {
  Sokoto: { xPct: 0.3, yPct: 0.18 },
  Benue: { xPct: 0.6, yPct: 0.6 },
  Oyo: { xPct: 0.28, yPct: 0.65 },
  Abia: { xPct: 0.58, yPct: 0.8 },
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC EXPORT FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export async function exportNigeriaMap(
  statesAgg: { state: string; hh: number; lgaCount: number }[],
  communityCounts: Record<string, number> = {},
): Promise<void> {
  const mapImg = await captureLeafletMap("nigeria-state-map-container");
  const date = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const total = statesAgg.reduce((s, x) => s + x.hh, 0);

  const labels = statesAgg.map((s) => ({
    name: s.state,
    sub: `🏠 ${s.hh.toLocaleString()} HHs · ${s.lgaCount} LGAs`,
    color: STATE_COLOR_MAP[s.state] ?? "#4CAF50",
    xPct: STATE_MAP_POSITIONS[s.state]?.xPct ?? 0.5,
    yPct: STATE_MAP_POSITIONS[s.state]?.yPct ?? 0.5,
  }));

  const pdf = buildPDF({
    title: "Nigeria — Intervention States Overview",
    subtitle: `Total enumerated households: ${total.toLocaleString()} across ${statesAgg.length} states`,
    mapCanvas: mapImg,
    labels,
    tableHeaders: [
      "State",
      "Enumerated HHs",
      "LGAs Covered",
      "Communities",
      "% of Total",
    ],
    tableRows: statesAgg.map((s) => [
      s.state,
      s.hh.toLocaleString(),
      String(s.lgaCount),
      String(communityCounts[s.state] ?? "—"),
      `${((s.hh / total) * 100).toFixed(1)}%`,
    ]),
    date,
  });

  pdf.save(
    `NASSCO-Nigeria-Overview-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

export async function exportStateMap(
  stateName: string,
  lgaAgg: { lga: string; hh: number }[],
): Promise<void> {
  const mapImg = await captureLeafletMap("state-lga-map-container");
  const date = new Date().toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const total = lgaAgg.reduce((s, l) => s + l.hh, 0);

  const labels = lgaAgg.slice(0, 8).map((l, i) => ({
    name: l.lga,
    sub: `${l.hh.toLocaleString()} HHs`,
    color: hhColor(l.hh),
    xPct: 0.2 + (i % 3) * 0.3,
    yPct: 0.2 + Math.floor(i / 3) * 0.25,
  }));

  const pdf = buildPDF({
    title: `${stateName} State — LGA Household Enumeration`,
    subtitle: `Total: ${total.toLocaleString()} HHs across ${lgaAgg.length} LGAs`,
    mapCanvas: mapImg,
    labels,
    tableHeaders: ["LGA", "Enumerated HHs", "% of State Total"],
    tableRows: lgaAgg.map((l) => [
      l.lga,
      l.hh.toLocaleString(),
      `${((l.hh / total) * 100).toFixed(1)}%`,
    ]),
    date,
  });

  pdf.save(
    `NASSCO-${stateName}-LGA-${new Date().toISOString().slice(0, 10)}.pdf`,
  );
}

export async function exportDashboardPdf(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) return;

  document.body.style.cursor = "wait";
  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });
    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save(`NASSCO-Dashboard-${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error("PDF export failed:", err);
    alert("Export failed. See console.");
  } finally {
    document.body.style.cursor = "default";
  }
}
