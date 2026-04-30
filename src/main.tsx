// src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";

// ── Catch any unhandled errors and show them on screen ────────
window.addEventListener("unhandledrejection", (e) => {
  document.body.innerHTML = `
    <div style="
      padding:32px;
      font-family:monospace;
      background:#FEF2F2;
      min-height:100vh;
      color:#991B1B;
    ">
      <h2>❌ Unhandled Promise Rejection</h2>
      <pre style="
        background:#FEE2E2;
        padding:16px;
        border-radius:8px;
        white-space:pre-wrap;
        word-break:break-all;
        font-size:13px;
      ">${e.reason instanceof Error
        ? `${e.reason.message}\n\n${e.reason.stack}`
        : String(e.reason)
      }</pre>
    </div>
  `;
});

window.addEventListener("error", (e) => {
  document.body.innerHTML = `
    <div style="
      padding:32px;
      font-family:monospace;
      background:#FEF2F2;
      min-height:100vh;
      color:#991B1B;
    ">
      <h2>❌ JavaScript Error</h2>
      <pre style="
        background:#FEE2E2;
        padding:16px;
        border-radius:8px;
        white-space:pre-wrap;
        word-break:break-all;
        font-size:13px;
      ">${e.message}\n\nFile: ${e.filename}\nLine: ${e.lineno}</pre>
    </div>
  `;
});

// ── Check root element exists ─────────────────────────────────
const rootElement = document.getElementById("root");

if (!rootElement) {
  document.body.innerHTML = `
    <div style="padding:32px;font-family:monospace;color:#991B1B;">
      <h2>❌ Fatal: No #root element found in index.html</h2>
      <p>Check that public/index.html contains: &lt;div id="root"&gt;&lt;/div&gt;</p>
    </div>
  `;
  throw new Error("No #root element");
}

// ── Dynamic import to catch module errors ─────────────────────
import("./App")
  .then(({ default: App }) => {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("✅ App mounted successfully");
  })
  .catch((err: unknown) => {
    console.error("❌ App import failed:", err);
    rootElement.innerHTML = `
      <div style="
        padding:32px;
        font-family:monospace;
        background:#FEF2F2;
        min-height:100vh;
        color:#991B1B;
      ">
        <h2>❌ App Failed to Load</h2>
        <p style="margin-bottom:12px;color:#6B7280;">
          The App component could not be imported. 
          This usually means a missing file or import error.
        </p>
        <pre style="
          background:#FEE2E2;
          padding:16px;
          border-radius:8px;
          white-space:pre-wrap;
          word-break:break-all;
          font-size:13px;
        ">${err instanceof Error
          ? `${err.message}\n\n${err.stack ?? ""}`
          : String(err)
        }</pre>
        <div style="
          margin-top:20px;
          padding:16px;
          background:#fff;
          border-radius:8px;
          font-size:12px;
          color:#374151;
          line-height:2;
        ">
          <strong>Common causes:</strong><br/>
          • Missing component file (HeroCards, LgaCharts, etc.)<br/>
          • Wrong import path in App.tsx<br/>
          • TypeScript error in a component<br/>
          • Missing src/components/ folder<br/>
          <br/>
          <strong>Check these files exist:</strong><br/>
          • src/components/HeroCards.tsx<br/>
          • src/components/LgaCharts.tsx<br/>
          • src/maps/NigeriaMap.tsx<br/>
          • src/maps/StateLgaMap.tsx<br/>
          • src/maps/Legend.tsx<br/>
          • src/lib/exportPdf.ts<br/>
          • src/lib/loadCsv.ts<br/>
          • src/lib/aggregations.ts<br/>
          • src/lib/normalize.ts<br/>
        </div>
      </div>
    `;
  });