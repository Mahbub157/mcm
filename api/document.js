/*
 * /api/document  (Vercel serverless function)
 *
 * POST { filename, mime, data (base64 PDF) }
 *   -> { findings, extraction, pages, meta }
 *
 * Two-pass design:
 *   Pass A: the PDF is sent to Claude with document citations enabled. Every
 *           text block that carries a page_location citation becomes a
 *           grounded finding { text, page, excerpt }.
 *   Pass B: the grounded findings (never the PDF) are normalized into the
 *           application schema via forced tool use. Any item whose page did
 *           not appear in Pass A is rejected server-side, so Pass B cannot
 *           add claims the document did not support.
 *
 * The PDF is held in memory for this request only. Nothing is written to
 * disk and no file id is created or returned. ANTHROPIC_API_KEY stays here.
 */
import Anthropic from "@anthropic-ai/sdk";
import { TASKS } from "../src/services/aiSchemas.js";

export const config = { maxDuration: 60 };

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL_DEFAULT || "claude-sonnet-5";
const DOC_MODEL = process.env.ANTHROPIC_MODEL_DOCUMENT || DEFAULT_MODEL;
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB PDF ~= 4 MB base64, under the platform body limit
const MAX_PAGES = 100;             // Anthropic PDF limit per request

const PASS_A_PROMPT = `You are reviewing an investment document (for example a confidential information memorandum) for a private equity deal team.
Extract source-backed findings. Write each finding as its own short sentence so it can be cited precisely, and cover, where the document supports it:
company overview; revenue by year and growth; gross profit and gross margin; reported EBITDA, EBITDA adjustments (each adjustment and amount), adjusted EBITDA and margin; capex; employee count; customer concentration (top customer share, top five share, contract terms and expiry); end-market exposure; facilities and capacity; management team and tenure; investment highlights as presented by the seller; risks as presented or as evident from the figures; any figures that do not reconcile or statements that contradict each other; information a buyer would expect that is absent.
Use tables, charts and financial schedules as well as prose. Quote figures exactly as printed with their period. Do not add outside knowledge. If something is not in the document, do not mention it here; the next step handles gaps separately.`;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed", code: "METHOD" });
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "AI is not configured on this deployment.", code: "NO_KEY" });

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const filename = sanitizeName(body.filename);
  const mime = String(body.mime || "");
  const data = typeof body.data === "string" ? body.data : "";

  // ---- validation (never trust the browser) ----
  if (mime !== "application/pdf" || !filename.toLowerCase().endsWith(".pdf")) return res.status(400).json({ error: "Only PDF documents are supported.", code: "UNSUPPORTED" });
  if (!data) return res.status(400).json({ error: "No file content received.", code: "EMPTY" });
  const bytes = Buffer.from(data, "base64");
  if (bytes.length === 0 || bytes.subarray(0, 5).toString("latin1") !== "%PDF-") return res.status(400).json({ error: "The file is not a valid PDF.", code: "CORRUPT" });
  if (bytes.length > MAX_BYTES) return res.status(413).json({ error: "The document is larger than 3 MB. Split it or upload a shorter excerpt.", code: "TOO_LARGE" });
  const raw = bytes.toString("latin1");
  if (/\/Encrypt\b/.test(raw)) return res.status(400).json({ error: "The PDF is password protected. Remove the password and try again.", code: "ENCRYPTED" });
  const pages = Math.max(1, (raw.match(/\/Type\s*\/Page\b/g) || []).length);
  if (pages > MAX_PAGES) return res.status(413).json({ error: `The document has about ${pages} pages; the limit is ${MAX_PAGES} per analysis.`, code: "TOO_MANY_PAGES" });

  const client = new Anthropic({ apiKey, maxRetries: 0, timeout: 55_000 });
  const started = Date.now();
  let usage = { input: 0, output: 0 };

  try {
    // ---- Pass A: grounded review with citations ----
    const a = await client.messages.create({
      model: DOC_MODEL,
      max_tokens: 4000,
      messages: [{ role: "user", content: [
        { type: "document", source: { type: "base64", media_type: "application/pdf", data }, title: filename, citations: { enabled: true } },
        { type: "text", text: PASS_A_PROMPT },
      ] }],
    });
    addUsage(usage, a.usage);
    const findings = [];
    for (const block of a.content) {
      if (block.type !== "text") continue;
      const cites = (block.citations || []).filter((c) => c.type === "page_location");
      if (!cites.length) continue;
      const text = block.text.trim();
      if (!text) continue;
      const c = cites[0];
      findings.push({ text, page: c.start_page_number, pageEnd: c.end_page_number, excerpt: (c.cited_text || "").trim().slice(0, 600) });
    }
    if (findings.length === 0) throw Object.assign(new Error("No cited findings"), { code: "NO_CITATIONS" });
    const allowedPages = new Set(findings.map((f) => f.page));

    // ---- Pass B: normalize into the application schema ----
    const def = TASKS.document_normalize;
    const b = await client.messages.create({
      model: DOC_MODEL,
      max_tokens: def.maxTokens,
      system: def.system,
      messages: [{ role: "user", content: def.buildUser({ filename, findings: JSON.stringify(findings.map(({ text, page }) => ({ text, page })), null, 0) }) }],
      tools: [{ name: def.tool, description: def.description, input_schema: def.schema }],
      tool_choice: { type: "tool", name: def.tool },
    });
    addUsage(usage, b.usage);
    const block = b.content.find((x) => x.type === "tool_use");
    if (!block || !block.input) throw Object.assign(new Error("No structured block"), { code: "NO_STRUCTURED" });
    const extraction = enforcePages(block.input, allowedPages);

    return res.status(200).json({
      findings,
      extraction,
      pages,
      meta: { task: "document_analysis", model: DOC_MODEL, latencyMs: Date.now() - started, usage, pagesCited: allowedPages.size, findingsCount: findings.length, timestamp: new Date().toISOString() },
    });
  } catch (e) {
    const status = e?.status;
    const code = e?.code === "NO_CITATIONS" ? "NO_CITATIONS" : e?.code === "NO_STRUCTURED" ? "NO_STRUCTURED" : status === 401 ? "AUTH" : status === 429 ? "RATE_LIMIT" : status === 400 ? "BAD_REQUEST" : e?.name === "APIConnectionTimeoutError" ? "TIMEOUT" : "UPSTREAM";
    console.error(`[api/document] code=${code} status=${status || "n/a"} pages=${pages} bytes=${bytes.length} msg=${(e?.message || "").slice(0, 160)}`);
    const friendly = { NO_CITATIONS: "The document produced no citable findings. It may be a scanned image without text.", TIMEOUT: "The analysis timed out. Try a shorter document.", BAD_REQUEST: "The AI provider rejected the document. It may be malformed or too complex." }[code] || "The document analysis did not complete.";
    return res.status(502).json({ error: friendly, code, latencyMs: Date.now() - started });
  }
}

/* Reject any claim whose page was not cited in Pass A. */
function enforcePages(x, allowed) {
  const keep = (it) => it && Number.isInteger(it.page) && allowed.has(it.page);
  const out = { ...x };
  for (const k of ["metrics", "investment_highlights", "risks", "customer_concentration", "end_market_exposure", "facilities_and_operations", "management", "ebitda_adjustments", "inconsistencies"]) {
    out[k] = (Array.isArray(x[k]) ? x[k] : []).filter(keep);
  }
  out.diligence_questions = (Array.isArray(x.diligence_questions) ? x.diligence_questions : []).map((q) => ({ ...q, page: allowed.has(q.page) ? q.page : null }));
  out.missing_information = Array.isArray(x.missing_information) ? x.missing_information : [];
  out.rejected = ["metrics", "investment_highlights", "risks", "customer_concentration", "end_market_exposure", "facilities_and_operations", "management", "ebitda_adjustments", "inconsistencies"].reduce((n, k) => n + ((Array.isArray(x[k]) ? x[k].length : 0) - out[k].length), 0);
  return out;
}
function addUsage(u, m) { if (m) { u.input += m.input_tokens || 0; u.output += m.output_tokens || 0; } }
function sanitizeName(n) { return String(n || "document.pdf").replace(/[^\w.\- ()]/g, "_").slice(0, 120); }
function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
