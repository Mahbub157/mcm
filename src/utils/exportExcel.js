/* Excel export via SheetJS. Each workbook gets a Provenance sheet explaining status labels. */
import * as XLSX from "xlsx";
import { DISCLAIMER, stamp } from "./provenance.js";

export function downloadWorkbook(filename, sheets, { dataStatus = "Synthetic demo data" } = {}) {
  const wb = XLSX.utils.book_new();
  sheets.forEach(({ name, rows, columns }) => {
    const ws = rows.length ? XLSX.utils.json_to_sheet(rows, columns ? { header: columns } : undefined) : XLSX.utils.aoa_to_sheet([[...(columns || ["No rows"])]]);
    const widths = (columns || Object.keys(rows[0] || {})).map((c) => ({ wch: Math.min(60, Math.max(12, ...[c, ...rows.map((r) => String(r[c] ?? ""))].map((v) => v.length))) }));
    ws["!cols"] = widths;
    XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  });
  const prov = XLSX.utils.aoa_to_sheet([
    ["MCM Intelligence", "Concept prototype"], ["Generated", stamp()], ["Data status", dataStatus], [],
    ["Status label", "Meaning"], ["Confirmed", "Stated in a cited source"], ["Inferred", "Derived from indirect evidence"], ["Estimated", "Model or benchmark estimate, not company data"], ["Unknown", "No evidence available; not a negative finding"], ["Risk", "Adverse evidence or an explicit screening rule"], [],
    ["Disclaimer", DISCLAIMER],
  ]);
  prov["!cols"] = [{ wch: 18 }, { wch: 90 }];
  XLSX.utils.book_append_sheet(wb, prov, "Provenance");
  XLSX.writeFile(wb, filename);
}
