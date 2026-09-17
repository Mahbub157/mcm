/*
 * /api/ai  (Vercel serverless function)
 *
 * GET  -> health: { configured: boolean, model: string|null }
 * POST -> { task, input } -> { data, meta } where data is a schema-forced
 *         structured response produced via Anthropic tool use.
 *
 * ANTHROPIC_API_KEY lives only in this process. It is never returned,
 * logged, or accepted from the client.
 */
import Anthropic from "@anthropic-ai/sdk";
import { TASKS, TASK_TIER } from "../src/services/aiSchemas.js";

export const config = { maxDuration: 60 };

const DEFAULT_MODEL = process.env.ANTHROPIC_MODEL_DEFAULT || "claude-sonnet-5";
// Optional per-tier overrides so routing can be introduced later without code changes.
const TIER_MODEL = {
  fast: process.env.ANTHROPIC_MODEL_FAST || DEFAULT_MODEL,
  balanced: process.env.ANTHROPIC_MODEL_BALANCED || DEFAULT_MODEL,
  advanced: process.env.ANTHROPIC_MODEL_ADVANCED || DEFAULT_MODEL,
};
const MAX_BODY_CHARS = 200_000;

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, configured: Boolean(apiKey), model: apiKey ? DEFAULT_MODEL : null });
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed", code: "METHOD" });
  }
  if (!apiKey) {
    return res.status(503).json({ error: "AI is not configured on this deployment.", code: "NO_KEY" });
  }

  const body = typeof req.body === "string" ? safeJson(req.body) : req.body || {};
  const { task, input, preferredModelTier } = body;
  const def = TASKS[task];
  if (!def) return res.status(400).json({ error: "Unknown task.", code: "BAD_TASK" });
  if (!input || typeof input !== "object") return res.status(400).json({ error: "Missing input.", code: "BAD_INPUT" });
  if (JSON.stringify(input).length > MAX_BODY_CHARS) return res.status(413).json({ error: "Request too large.", code: "TOO_LARGE" });

  const tier = preferredModelTier || TASK_TIER[task] || "balanced";
  const model = TIER_MODEL[tier] || DEFAULT_MODEL;
  const client = new Anthropic({ apiKey, maxRetries: 1, timeout: 55_000 });
  const started = Date.now();

  try {
    const msg = await client.messages.create({
      model,
      max_tokens: def.maxTokens || 2000,
      system: def.system,
      messages: [{ role: "user", content: def.buildUser(input) }],
      tools: [{ name: def.tool, description: def.description, input_schema: def.schema }],
      tool_choice: { type: "tool", name: def.tool },
    });
    const block = msg.content.find((b) => b.type === "tool_use");
    if (!block || !block.input) throw Object.assign(new Error("No structured block"), { code: "NO_STRUCTURED" });

    return res.status(200).json({
      data: block.input,
      meta: {
        task,
        tier,
        model,
        latencyMs: Date.now() - started,
        usage: msg.usage ? { input: msg.usage.input_tokens, output: msg.usage.output_tokens } : null,
        stopReason: msg.stop_reason,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (e) {
    const status = e?.status;
    const code = status === 401 ? "AUTH" : status === 429 ? "RATE_LIMIT" : status === 400 ? "BAD_REQUEST" : e?.code === "NO_STRUCTURED" ? "NO_STRUCTURED" : "UPSTREAM";
    // Log the class of failure only; never the prompt or the key.
    console.error(`[api/ai] task=${task} model=${model} code=${code} status=${status || "n/a"} msg=${(e?.message || "").slice(0, 160)}`);
    return res.status(502).json({ error: "The AI request did not complete.", code, latencyMs: Date.now() - started });
  }
}

function safeJson(s) { try { return JSON.parse(s); } catch { return {}; } }
