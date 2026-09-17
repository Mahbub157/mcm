/*
 * Task registry shared by the server (api/ai.js) and the client (aiClient.js).
 * Each task declares: a system prompt, how to build the user message from the
 * client payload, a JSON schema used to force a structured tool-use response,
 * and a lightweight validator the client runs before trusting the result.
 *
 * Product rules encoded here apply to every task:
 *   Evidence before assertion. Unknown is different from negative.
 *   AI recommends, humans decide. Never invent evidence.
 */

const HOUSE_RULES = `
You are the analysis engine inside MCM Intelligence, an internal tool for a
lower-middle-market private equity firm. Rules that apply to every response:
- Evidence before assertion. Only cite facts that appear in the provided context.
- If the context does not contain enough information, say exactly
  "Not enough evidence available." and do not fill the gap with general assumptions.
- Distinguish confirmed facts, inferences, estimates and unknowns. Unknown is not
  negative: missing information lowers confidence, it never becomes a risk by itself.
  A risk requires actual adverse evidence or an explicitly stated screening rule.
- You recommend; the investment team decides. Never state that a decision has been made.
- Be concise and specific. Investment professionals are the audience.
- Use plain hyphens and commas in prose; do not use em dashes.
`;

const STATUS = { type: "string", enum: ["confirmed", "inferred", "estimated", "unknown"] };
const CONF = { type: "string", enum: ["high", "medium", "low"] };
const SEV = { type: "string", enum: ["high", "medium", "low"] };

const claimItem = {
  type: "object",
  properties: {
    text: { type: "string" },
    status: STATUS,
    confidence: CONF,
    source: { type: "string", description: "Where in the provided context this comes from, or 'none' if not available" },
  },
  required: ["text", "status", "confidence"],
};

const docClaim = {
  type: "object",
  properties: { text: { type: "string" }, page: { type: "integer", description: "Page number from the grounded findings; must be one of the pages that appeared there" }, status: STATUS, confidence: CONF },
  required: ["text", "page", "status", "confidence"],
};
const docList = { type: "array", items: docClaim };

export const TASKS = {
  /* ---------------------------------------------------------------- ask */
  ask: {
    tool: "answer_investment_question",
    description: "Answer a question about the current workspace using only the supplied context.",
    maxTokens: 1200,
    system: HOUSE_RULES,
    buildUser: ({ question, context }) =>
      `CONTEXT (the only facts you may rely on):\n${context}\n\nQUESTION: ${question}\n\nRespond with a structured answer. Evidence must be quoted or closely paraphrased from the context, each item tagged with its status.`,
    schema: {
      type: "object",
      properties: {
        conclusion: { type: "string" },
        reasoning: { type: "string" },
        evidence: { type: "array", items: { type: "string" }, description: "Each item: a short fact from the context followed by its status in parentheses, e.g. 'ISO 13485 active (Confirmed)'" },
        uncertainty: { type: "string" },
        next_action: { type: "string" },
        enough_evidence: { type: "boolean" },
      },
      required: ["conclusion", "reasoning", "evidence", "uncertainty", "next_action", "enough_evidence"],
    },
    validate: (d) => isObj(d) && str(d.conclusion) && str(d.reasoning) && arr(d.evidence) && str(d.uncertainty) && str(d.next_action),
  },

  /* ----------------------------------------------------- company_analysis */
  company_analysis: {
    tool: "company_analysis",
    description: "Score a company against an investment thesis using the supplied facts and evidence.",
    maxTokens: 2500,
    system: HOUSE_RULES + `
Scoring guidance: each fit dimension is 0-100. Financial fit compares stated figures with
the criteria. Do not lower a dimension because data is missing; instead record the gap under
unknowns and lower overall confidence. Recommendation values: prioritize, research_further,
monitor, pass.`,
    buildUser: ({ company, thesis, evidence }) =>
      `COMPANY FACTS:\n${company}\n\nACTIVE THESIS AND CRITERIA:\n${thesis}\n\nEVIDENCE ITEMS (each with status and source):\n${evidence}\n\nProduce the structured company analysis.`,
    schema: {
      type: "object",
      properties: {
        summary: { type: "string" },
        confidence: CONF,
        recommendation: { type: "string", enum: ["prioritize", "research_further", "monitor", "pass"] },
        fit_dimensions: {
          type: "object",
          properties: {
            financial_fit: { type: "integer" }, strategic_fit: { type: "integer" }, technical_differentiation: { type: "integer" },
            end_market_fit: { type: "integer" }, ownership_fit: { type: "integer" }, commercial_opportunity: { type: "integer" }, risk_profile: { type: "integer" },
          },
          required: ["financial_fit", "strategic_fit", "technical_differentiation", "end_market_fit", "ownership_fit", "commercial_opportunity", "risk_profile"],
        },
        supports_thesis: { type: "array", items: claimItem },
        risks: { type: "array", items: { ...claimItem, properties: { ...claimItem.properties, severity: SEV } } },
        unknowns: { type: "array", items: { type: "object", properties: { text: { type: "string" }, how_to_resolve: { type: "string" } }, required: ["text", "how_to_resolve"] } },
        next_actions: { type: "array", items: { type: "string" } },
      },
      required: ["summary", "confidence", "recommendation", "fit_dimensions", "supports_thesis", "risks", "unknowns", "next_actions"],
    },
    validate: (d) => isObj(d) && str(d.summary) && isObj(d.fit_dimensions) && arr(d.supports_thesis) && arr(d.risks) && arr(d.unknowns) && arr(d.next_actions),
  },

  /* ------------------------------------------------------ thesis_analysis */
  thesis_analysis: {
    tool: "thesis_analysis",
    description: "Evaluate an investment thesis and score a supplied synthetic company universe against it.",
    maxTokens: 3500,
    system: HOUSE_RULES + `
You are evaluating a sourcing thesis. You have NOT discovered any companies; you may only
score the companies listed in the context. Do not claim knowledge of real private companies.`,
    buildUser: ({ thesis, universe }) =>
      `THESIS:\n${thesis}\n\nCOMPANY UNIVERSE (synthetic, the only companies you may score):\n${universe}\n\nProduce the structured thesis analysis and a fit score for every company id listed.`,
    schema: {
      type: "object",
      properties: {
        thesis_summary: { type: "string" },
        why_attractive: { type: "array", items: { type: "string" } },
        what_could_invalidate: { type: "array", items: { type: "string" } },
        screening_criteria: { type: "array", items: { type: "string" } },
        risk_exclusions: { type: "array", items: { type: "string" } },
        diligence_questions: { type: "array", items: { type: "string" } },
        market_signals: { type: "array", items: { type: "string" } },
        research_plan: { type: "array", items: { type: "string" } },
        important_assumptions: { type: "array", items: { type: "string" } },
        confidence: CONF,
        company_scores: { type: "array", items: { type: "object", properties: { id: { type: "string" }, fit: { type: "integer" }, rationale: { type: "string" }, confidence: CONF }, required: ["id", "fit", "rationale", "confidence"] } },
      },
      required: ["thesis_summary", "why_attractive", "what_could_invalidate", "screening_criteria", "risk_exclusions", "diligence_questions", "market_signals", "research_plan", "important_assumptions", "confidence", "company_scores"],
    },
    validate: (d) => isObj(d) && str(d.thesis_summary) && arr(d.why_attractive) && arr(d.company_scores),
  },

  /* ------------------------------------------------------------- red_team */
  red_team: {
    tool: "red_team_review",
    description: "Independent adversarial review of an investment thesis using the supplied deal context.",
    maxTokens: 3000,
    system: HOUSE_RULES + `
You are an independent private-equity Red Team reviewer. Your objective is to challenge the
current investment thesis. Do not attempt to justify the original recommendation. Identify
explicit and implicit assumptions. Look for contrary evidence in the context. Distinguish
adverse evidence, unresolved uncertainty and missing information. Test assumptions using the
financial and operating data provided. Do not invent facts. Do not recommend rejecting an
investment solely because information is missing. You do not disposition your own findings;
the deal team does.`,
    buildUser: ({ thesis, context }) =>
      `THESIS UNDER REVIEW:\n${thesis}\n\nDEAL CONTEXT (CIM extraction, financials, diligence status, open questions):\n${context}\n\nProduce the structured red team review.`,
    schema: {
      type: "object",
      properties: {
        findings: { type: "array", items: { type: "object", properties: {
          assumption: { type: "string" }, challenge: { type: "string" }, evidence: { type: "array", items: { type: "string" } },
          test_performed: { type: "string" }, severity: SEV, confidence: CONF,
          finding_type: { type: "string", enum: ["adverse_evidence", "unresolved_uncertainty", "missing_information"] },
          required_resolution: { type: "string" },
        }, required: ["assumption", "challenge", "evidence", "test_performed", "severity", "confidence", "finding_type", "required_resolution"] } },
        overall_assessment: { type: "string" },
        critical_management_questions: { type: "array", items: { type: "string" } },
        bull_case: { type: "array", items: { type: "object", properties: { dimension: { type: "string" }, view: { type: "string" } }, required: ["dimension", "view"] } },
        bear_case: { type: "array", items: { type: "object", properties: { dimension: { type: "string" }, view: { type: "string" } }, required: ["dimension", "view"] } },
        gating_questions: { type: "array", items: { type: "string" } },
        confidence: CONF,
      },
      required: ["findings", "overall_assessment", "critical_management_questions", "bull_case", "bear_case", "gating_questions", "confidence"],
    },
    validate: (d) => isObj(d) && arr(d.findings) && d.findings.length > 0 && str(d.overall_assessment) && arr(d.bull_case) && arr(d.bear_case),
  },

  /* --------------------------------------------------- document_normalize */
  document_normalize: {
    tool: "normalize_document_findings",
    description: "Convert grounded, page-cited document findings into the MCM Intelligence CIM schema without adding claims.",
    maxTokens: 4000,
    system: HOUSE_RULES + `
You receive findings that were extracted from a document in a previous pass, each with a page
number and the supporting excerpt. Your only job is to organize them into the application schema.
Hard rules: do not add any claim, number or page that is not present in the findings; if a
schema field has no supporting finding, leave its list empty or mark the value as not disclosed
with status unknown. Keep the original page number on every item. Prefer exact figures as written.
Inconsistencies means places where the document contradicts itself or where the figures do not
reconcile. Investment fit is judged against MCM criteria: revenue $8M-$50M, EBITDA $1.5M-$6M,
manufacturing gross margin 30%+, distribution 20%+, and is 'unclear' when key figures are missing.`,
    buildUser: ({ findings, filename }) => `DOCUMENT: ${filename}

GROUNDED FINDINGS (JSON, from the citation pass):
${findings}

Organize these into the schema. Never invent.`,
    schema: {
      type: "object",
      properties: {
        company_name: { type: "string" },
        overview: { type: "string", description: "Two to four sentences drawn only from the findings" },
        investment_fit: { type: "string", enum: ["strong", "potential", "weak", "unclear"] },
        confidence: CONF,
        metrics: { type: "array", items: { type: "object", properties: {
          metric: { type: "string", enum: ["Revenue", "Revenue growth", "Gross profit", "Gross margin", "Reported EBITDA", "EBITDA adjustments", "Adjusted EBITDA", "Adjusted EBITDA margin", "Capex", "Employees", "Top customer share", "Top 5 customer share", "Net working capital", "Facilities", "Other"] },
          label: { type: "string", description: "Display label, e.g. 'Revenue FY2025'" }, value: { type: "string" }, period: { type: "string" }, page: { type: "integer" }, status: STATUS, confidence: CONF,
        }, required: ["metric", "label", "value", "page", "status", "confidence"] } },
        investment_highlights: docList,
        risks: { type: "array", items: { ...docClaim, properties: { ...docClaim.properties, severity: SEV }, required: [...docClaim.required, "severity"] } },
        customer_concentration: docList,
        end_market_exposure: docList,
        facilities_and_operations: docList,
        management: docList,
        ebitda_adjustments: docList,
        inconsistencies: docList,
        missing_information: { type: "array", items: { type: "object", properties: { text: { type: "string" }, why_it_matters: { type: "string" } }, required: ["text", "why_it_matters"] } },
        diligence_questions: { type: "array", items: { type: "object", properties: { question: { type: "string" }, workstream: { type: "string", enum: ["Financial", "Commercial", "Operational", "Legal", "Management", "Technology", "Cybersecurity", "ESG"] }, page: { type: "integer" }, severity: SEV }, required: ["question", "workstream", "severity"] } },
      },
      required: ["company_name", "overview", "investment_fit", "confidence", "metrics", "investment_highlights", "risks", "customer_concentration", "end_market_exposure", "facilities_and_operations", "management", "ebitda_adjustments", "inconsistencies", "missing_information", "diligence_questions"],
    },
    validate: (d) => isObj(d) && str(d.overview) && arr(d.metrics) && arr(d.risks) && arr(d.missing_information) && arr(d.diligence_questions),
  },
};

/* Conceptual model tiers. The server maps a tier to a concrete model id via env. */
export const TASK_TIER = {
  ask: "balanced",
  company_analysis: "balanced",
  thesis_analysis: "balanced",
  red_team: "advanced",
  document_normalize: "balanced",
};

function isObj(x) { return x && typeof x === "object" && !Array.isArray(x); }
function str(x) { return typeof x === "string" && x.length > 0; }
function arr(x) { return Array.isArray(x); }
