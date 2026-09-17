/*
 * aiClient: the only module React components use to talk to AI.
 *
 * Every call returns { data, source, meta, error? } where source is "live"
 * or "demo". Callers pass a fallback (value or function) that is returned
 * when the live path is unavailable, fails, times out, or returns a
 * response that does not validate. The UI therefore never breaks because
 * of an AI failure.
 *
 * Mode: "checking" -> "live" | "demo". Probed once on load from GET /api/ai.
 */
import { useEffect, useState } from "react";
import { TASKS } from "./aiSchemas.js";

const ENDPOINT = "/api/ai";
const LOG_KEY = "mcm.aiLog";
const DEFAULT_TIMEOUT = 50_000;

const state = { mode: "checking", model: null, listeners: new Set(), probed: false };

function setMode(mode, model = null) {
  state.mode = mode; state.model = model;
  state.listeners.forEach((fn) => { try { fn(mode); } catch {} });
}

export function getAiMode() { return state.mode; }
export function getAiModel() { return state.model; }
export function subscribeAiMode(fn) { state.listeners.add(fn); return () => state.listeners.delete(fn); }

export async function probeAiStatus(force = false) {
  if (state.probed && !force) return state.mode;
  state.probed = true;
  try {
    const r = await fetch(ENDPOINT, { method: "GET", cache: "no-store" });
    if (!r.ok) throw new Error("health " + r.status);
    const j = await r.json();
    setMode(j.configured ? "live" : "demo", j.model || null);
  } catch {
    setMode("demo");
  }
  return state.mode;
}

/* React hook: re-renders when mode changes. */
export function useAiMode() {
  const [mode, set] = useState(state.mode);
  useEffect(() => { const off = subscribeAiMode(set); if (!state.probed) probeAiStatus(); return off; }, []);
  return mode;
}

/* ------------------------------------------------------------ AI log */
export function getAiLog() {
  try { return JSON.parse(sessionStorage.getItem(LOG_KEY) || "[]"); } catch { return []; }
}
function appendLog(entry) {
  try {
    const log = getAiLog();
    log.unshift({ id: Date.now() + Math.random().toString(16).slice(2, 6), ...entry });
    sessionStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 200)));
    window.dispatchEvent(new CustomEvent("mcm:ai-log", { detail: entry }));
  } catch {}
}
export function clearAiLog() { try { sessionStorage.removeItem(LOG_KEY); } catch {} }

/* --------------------------------------------------------- messaging */
const FRIENDLY = {
  NO_KEY: "Live analysis is not configured on this deployment.",
  AUTH: "Live analysis could not authenticate with the AI provider.",
  RATE_LIMIT: "The AI provider is rate limiting requests. Try again in a moment.",
  TIMEOUT: "The live analysis took too long to respond.",
  NETWORK: "Live analysis is unreachable right now.",
  SCHEMA: "The live response did not match the expected format.",
  NO_STRUCTURED: "The live response did not match the expected format.",
  UPSTREAM: "Live analysis is unavailable right now.",
  TOO_LARGE: "The request is too large for live analysis.",
};
export function friendlyAiError(code) { return FRIENDLY[code] || FRIENDLY.UPSTREAM; }

function resolveFallback(fb) { return typeof fb === "function" ? fb() : fb; }

/* ----------------------------------------------------------- core */
async function callAi(task, input, { fallback, timeoutMs = DEFAULT_TIMEOUT, preferredModelTier, signal } = {}) {
  const def = TASKS[task];
  if (!def) throw new Error("Unknown AI task: " + task);
  const started = Date.now();

  if (!state.probed) await probeAiStatus();
  if (state.mode === "demo") {
    return { data: resolveFallback(fallback), source: "demo", meta: { task, status: "demo", latencyMs: 0, timestamp: new Date().toISOString() } };
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  if (signal) signal.addEventListener("abort", () => ctrl.abort(), { once: true });

  try {
    const r = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task, input, preferredModelTier }),
      signal: ctrl.signal,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      const err = new Error(j.error || "AI request failed"); err.code = j.code || "UPSTREAM"; throw err;
    }
    if (!def.validate(j.data)) { const err = new Error("Schema mismatch"); err.code = "SCHEMA"; throw err; }
    const meta = { ...(j.meta || {}), task, status: "complete", latencyMs: j.meta?.latencyMs ?? Date.now() - started };
    appendLog({ ...meta, source: "live" });
    return { data: j.data, source: "live", meta };
  } catch (e) {
    const code = e?.name === "AbortError" ? (signal?.aborted ? "CANCELLED" : "TIMEOUT") : e?.code || "NETWORK";
    const meta = { task, status: code === "CANCELLED" ? "cancelled" : "failed", code, latencyMs: Date.now() - started, timestamp: new Date().toISOString() };
    appendLog({ ...meta, source: "live" });
    if (code === "NO_KEY") setMode("demo");
    return { data: resolveFallback(fallback), source: "demo", meta, error: code === "CANCELLED" ? null : friendlyAiError(code) };
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------------------------------ public API */
export const askIntelligence = (input, opts) => callAi("ask", input, opts);
export const analyzeCompany = (input, opts) => callAi("company_analysis", input, opts);
export const analyzeThesis = (input, opts) => callAi("thesis_analysis", input, opts);
export const runRedTeam = (input, opts) => callAi("red_team", input, { preferredModelTier: "advanced", ...opts });

/* Placeholders wired in later phases; they resolve to fallback until then. */
export const analyzeCIM = (input, opts = {}) => Promise.resolve({ data: resolveFallback(opts.fallback), source: "demo", meta: { task: "document_analysis", status: "not_implemented" } });
export const generateFounderQuestions = (input, opts) => callAi("ask", { question: "Draft questions for the founder.", context: input.context }, opts);
export const generateOutreachDraft = (input, opts = {}) => Promise.resolve({ data: resolveFallback(opts.fallback), source: "demo", meta: { task: "outreach_draft", status: "not_implemented" } });
export const generateICMemo = (input, opts = {}) => Promise.resolve({ data: resolveFallback(opts.fallback), source: "demo", meta: { task: "ic_memo", status: "not_implemented" } });
export const searchKnowledge = (input, opts = {}) => Promise.resolve({ data: resolveFallback(opts.fallback), source: "demo", meta: { task: "knowledge_search", status: "not_implemented" } });

/*
 * useAiTask: small state machine for buttons and panels.
 *   const { run, status, error, source, cancel } = useAiTask(askIntelligence);
 *   status: idle | processing | success | error
 */
export function useAiTask(fn) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);
  const [ctrl, setCtrl] = useState(null);
  const run = async (input, opts = {}) => {
    const c = new AbortController(); setCtrl(c);
    setStatus("processing"); setError(null);
    const res = await fn(input, { ...opts, signal: c.signal });
    setSource(res.source);
    if (res.error) { setError(res.error); setStatus("error"); } else { setStatus("success"); }
    return res;
  };
  const cancel = () => { ctrl?.abort(); setStatus("idle"); };
  return { run, status, error, source, cancel };
}
