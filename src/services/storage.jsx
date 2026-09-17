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
