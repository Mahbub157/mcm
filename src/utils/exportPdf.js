/* PDF export via jsPDF + autotable. One builder, many reports. */
import { jsPDF } from "jspdf";
import * as AutoTableModule from "jspdf-autotable";
/* jspdf-autotable ships a default export that bundlers resolve differently; pick whichever is the function. */
const autoTable = typeof AutoTableModule.default === "function" ? AutoTableModule.default : typeof AutoTableModule.default?.default === "function" ? AutoTableModule.default.default : (AutoTableModule.applyPlugin && ((doc, opts) => { AutoTableModule.applyPlugin(jsPDF); return doc.autoTable(opts); }));
import { DISCLAIMER, stamp } from "./provenance.js";

const NAVY = [15, 28, 46], MUTED = [95, 107, 122], TEXT = [20, 32, 47], LINE = [228, 230, 234];

/*
 * spec: { title, subtitle, dataStatus, filename, sections: [
 *   { heading, paragraphs: [string], bullets: [string], table: { head: [..], rows: [[..]] }, note }
 * ] }
 */
export function buildPdf(spec) {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = 0;

  const header = () => {
    doc.setFillColor(...NAVY); doc.rect(0, 0, W, 54, "F");
    doc.setTextColor(255, 255, 255); doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.text("MCM INTELLIGENCE", M, 24);
    doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(170, 185, 205); doc.text("Concept prototype", M, 38);
    doc.text(`Generated ${stamp()}`, W - M, 24, { align: "right" }); doc.text(spec.dataStatus || "Synthetic demo data", W - M, 38, { align: "right" });
    y = 78;
  };
  const footer = () => {
    const pages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i); doc.setDrawColor(...LINE); doc.line(M, H - 48, W - M, H - 48);
      doc.setFont("helvetica", "normal"); doc.setFontSize(7.5); doc.setTextColor(...MUTED);
      doc.text(doc.splitTextToSize(DISCLAIMER, W - 2 * M - 40), M, H - 36);
      doc.text(`${i} / ${pages}`, W - M, H - 20, { align: "right" });
    }
  };
  const ensure = (need) => { if (y + need > H - 64) { doc.addPage(); header(); } };
  const text = (str, size, color, style = "normal", gap = 4) => {
    doc.setFont("helvetica", style); doc.setFontSize(size); doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(str), W - 2 * M);
    ensure(lines.length * size * 1.25 + gap);
    doc.text(lines, M, y); y += lines.length * size * 1.25 + gap;
  };

  header();
  text(spec.title, 20, NAVY, "bold", 2);
  if (spec.subtitle) text(spec.subtitle, 10, MUTED, "normal", 12);
  (spec.sections || []).forEach((s) => {
    ensure(40);
    y += 6; text(s.heading, 12, NAVY, "bold", 6);
    (s.paragraphs || []).forEach((p) => text(p, 9.5, TEXT, "normal", 6));
    (s.bullets || []).forEach((b) => text(`\u2022  ${b}`, 9.5, TEXT, "normal", 3));
    if (s.table && s.table.rows.length) {
      ensure(60);
      autoTable(doc, { startY: y, margin: { left: M, right: M }, head: [s.table.head], body: s.table.rows, styles: { font: "helvetica", fontSize: 8, cellPadding: 3, textColor: TEXT, lineColor: LINE, lineWidth: 0.5 }, headStyles: { fillColor: [241, 243, 245], textColor: MUTED, fontStyle: "bold" }, alternateRowStyles: { fillColor: [250, 250, 248] }, didDrawPage: (d) => { if (d.pageNumber > 1 && d.cursor.y < 80) header(); } });
      y = doc.lastAutoTable.finalY + 10;
    }
    if (s.note) text(s.note, 8.5, MUTED, "italic", 8);
  });
  footer();
  doc.save(spec.filename || "mcm-intelligence.pdf");
}
