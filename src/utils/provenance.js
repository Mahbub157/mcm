/* Provenance helpers shared by exports. A value never becomes "confirmed" by being exported. */
export const STATUS_LABEL = { confirmed: "Confirmed", inferred: "Inferred", estimated: "Estimated", unknown: "Unknown", risk: "Risk" };
export const cap = (s) => (s ? String(s)[0].toUpperCase() + String(s).slice(1) : "");
export function statusLabel(s) { return STATUS_LABEL[s] || cap(s) || "Unknown"; }
export function sourceLabel(item, fallback = "") { return item?.source && item.source !== "none" ? item.source : fallback; }
export function pageLabel(p) { return Number.isInteger(p) ? String(p) : ""; }
export const DISCLAIMER = "AI-assisted draft prepared by MCM Intelligence (concept prototype). Values marked Estimated or Inferred are not verified facts; Unknown means no evidence was available. Investment professional review required before any use. Not for distribution.";
export function stamp() { return new Date().toLocaleString([], { dateStyle: "medium", timeStyle: "short" }); }
