// src/lib/exportPdf.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export async function exportDashboardPdf(elementId: string): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: canvas.width > canvas.height ? "landscape" : "portrait",
      unit: "px",
      format: [canvas.width / 2, canvas.height / 2],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
    pdf.save("NASSCO-MDP-Dashboard.pdf");
  } catch (err) {
    console.error("PDF export failed:", err);
    alert("PDF export failed. See console for details.");
  }
}