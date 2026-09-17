/*
 * Workspace session state. Holds everything generated during a session so it
 * survives route changes: live analyses, thesis versions, live target scores,
 * red team results and dispositions, and the audit trail.
 *
 * Persisted to sessionStorage (cleared when the tab closes). Raw documents are
 * never stored here. Reset restores the original synthetic dataset by clearing
 * this store only.
 */
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const KEY = "mcm.workspace.v1";
const EMPTY = {
  analyses: {},        // companyId -> { current, previous }
  thesisVersions: [],  // [{ id, name, createdAt, source, input, result }]
  liveScores: {},      // companyId -> { fit, rationale, confidence, thesis, versionId }
  redTeam: {},         // dealName -> { result, source, meta, dispositions: {idx: label}, createdAt }
  audit: [],           // [{ id, time, actor, kind: human|ai|system, action, subject, detail }]
  documents: {},       // dealName -> [{ id, name, source: uploaded, createdAt, pages, extraction, findings, meta }]
  conflicts: [],       // [{ id, deal, metric, previous: {value,page,source}, current: {value,page,source}, status: pending|accepted|kept|review, explanation, createdAt, resolvedAt }]
  events: [],          // intelligence feed [{ id, time, deal, kind, severity, title, detail, source, page }]
  questions: [],       // diligence questions [{ id, deal, question, workstream, source, page, severity, status, owner, createdBy, createdAt, notes }]
  memos: {},           // dealName -> { current: { data, source, meta, at }, previous }
  outreach: {},        // companyId -> { body, tone, objective, source, at, factsUsed, avoided }
  research: [],        // research library records [{ id, title, type, deal, thesis, producedBy, created, sources, summary, findings }]
};

function load() {
  try { if (typeof sessionStorage === "undefined") return EMPTY; const raw = sessionStorage.getItem(KEY); return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY; } catch { return EMPTY; }
}

const Ctx = createContext(null);

export function WorkspaceProvider({ children }) {
  const [ws, setWs] = useState(load);
  useEffect(() => { try { sessionStorage.setItem(KEY, JSON.stringify(ws)); } catch {} }, [ws]);

  const api = useMemo(() => {
    const update = (fn) => setWs((w) => fn(w));
    const audit = (entry) => update((w) => ({ ...w, audit: [{ id: Date.now() + Math.random().toString(16).slice(2, 6), time: new Date().toISOString(), ...entry }, ...w.audit].slice(0, 300) }));
    return {
      ws,
      audit,
      setAnalysis: (companyId, current) => update((w) => ({ ...w, analyses: { ...w.analyses, [companyId]: { current, previous: w.analyses[companyId]?.current || null } } })),
      saveThesisVersion: (v) => { const id = "v" + (ws.thesisVersions.length + 1); update((w) => ({ ...w, thesisVersions: [{ id, createdAt: new Date().toISOString(), ...v }, ...w.thesisVersions] })); return id; },
      setLiveScores: (scores) => update((w) => ({ ...w, liveScores: { ...w.liveScores, ...scores } })),
      clearLiveScores: () => update((w) => ({ ...w, liveScores: {} })),
      setRedTeam: (deal, data) => update((w) => ({ ...w, redTeam: { ...w.redTeam, [deal]: { ...(w.redTeam[deal] || {}), ...data } } })),
      setDisposition: (deal, idx, label) => update((w) => { const cur = w.redTeam[deal] || {}; return { ...w, redTeam: { ...w.redTeam, [deal]: { ...cur, dispositions: { ...(cur.dispositions || {}), [idx]: label } } } }; }),
      addDocument: (deal, doc) => update((w) => ({ ...w, documents: { ...w.documents, [deal]: [doc, ...(w.documents[deal] || [])] } })),
      addConflicts: (list) => update((w) => ({ ...w, conflicts: [...list, ...w.conflicts] })),
      resolveConflict: (id, status) => update((w) => ({ ...w, conflicts: w.conflicts.map((c) => (c.id === id ? { ...c, status, resolvedAt: new Date().toISOString() } : c)) })),
      addEvents: (list) => update((w) => ({ ...w, events: [...list, ...w.events].slice(0, 200) })),
      addResearch: (rec) => update((w) => ({ ...w, research: [rec, ...w.research] })),
      addQuestions: (list) => { const added = []; update((w) => { const existing = new Set(w.questions.map((q) => q.deal + "|" + q.question.toLowerCase().trim())); const fresh = list.filter((q) => !existing.has(q.deal + "|" + q.question.toLowerCase().trim())).map((q, i) => ({ id: `dq-${Date.now()}-${i}`, status: "Open", owner: "Unassigned", createdAt: new Date().toISOString(), notes: "", ...q })); added.push(...fresh); return { ...w, questions: [...fresh, ...w.questions] }; }); return added; },
      updateQuestion: (id, patch) => update((w) => ({ ...w, questions: w.questions.map((q) => (q.id === id ? { ...q, ...patch } : q)) })),
      setMemo: (deal, current) => update((w) => ({ ...w, memos: { ...w.memos, [deal]: { current, previous: w.memos[deal]?.current || null } } })),
      setOutreach: (companyId, draft) => update((w) => ({ ...w, outreach: { ...w.outreach, [companyId]: draft } })),
      reset: () => { try { sessionStorage.removeItem(KEY); sessionStorage.removeItem("mcm.aiLog"); } catch {} setWs(EMPTY); },
    };
  }, [ws]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return v;
}
