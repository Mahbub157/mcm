import React, { useState, useEffect, useMemo, useRef } from "react";
import { askIntelligence, analyzeCompany, analyzeThesis, runRedTeam, analyzeCIM, validateDocument, generateICMemo, searchKnowledge, generateOutreachDraft, useAiMode, probeAiStatus, getAiModel, getAiLog } from "./services/aiClient.js";
import { WorkspaceProvider, useWorkspace } from "./services/storage.jsx";
import { buildPdf } from "./utils/exportPdf.js";
import { downloadWorkbook } from "./utils/exportExcel.js";
import { statusLabel, sourceLabel, pageLabel, cap } from "./utils/provenance.js";
import {
  LayoutGrid, Lightbulb, Radar, Building2, Network, Send, Kanban, FileText, ClipboardCheck,
  ShieldAlert, FileSignature, Briefcase, TrendingUp, BookOpen, Library, Activity, FlaskConical,
  Search, Bell, MessageSquare, ChevronRight, ChevronDown, ChevronLeft, CheckCircle2, AlertTriangle,
  HelpCircle, Info, X, Play, ArrowRight, ExternalLink, Clock, Users, Target, Flag, Bot, Cpu,
  Database, Mail, Globe, FolderLock, BarChart3, Layers, Scale, Check, Minus, Plus, Filter, Monitor,
  ArrowUpDown, Download, GitCompare, Eye, PanelLeftClose, PanelLeftOpen, Command, Loader2,
  CircleDot, Zap, Route, Lock, Shield, Wrench, DollarSign, Gavel, Leaf, Building
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar as RRadar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, LineChart, Line, CartesianGrid, Cell
} from "recharts";

/* ---------- design tokens ---------- */
const T = {
  nav: "#0F1C2E",
  navText: "#9AA8BC",
  navActive: "#182840",
  accent: "#245A91",
  accentSoft: "#E9F0F7",
  bg: "#F7F7F5",
  soft: "#F1F3F5",
  border: "#E4E6EA",
  text: "#14202F",
  muted: "#5F6B7A",
  green: "#168457",
  greenSoft: "#E6F3EC",
  amber: "#B87716",
  amberSoft: "#FBF2E2",
  red: "#C0392B",
  redSoft: "#FBEAE8",
  unknown: "#7A8493",
  unknownSoft: "#EEF0F3",
};
const FONT = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', Inter, 'Segoe UI', system-ui, sans-serif" };
const SHADOW = "0 1px 2px rgba(15,28,46,0.04), 0 6px 20px rgba(15,28,46,0.06)";
const SHADOW_HOVER = "0 2px 4px rgba(15,28,46,0.05), 0 14px 34px rgba(15,28,46,0.10)";
const EASE = "all 180ms cubic-bezier(.2,.8,.2,1)";
const R = { card: 14, ctl: 10, chip: 999, hero: 18 };

/* ---------- icon set (custom SVG, 24 grid, 1.75 stroke) ---------- */
const Ico = ({ d, size = 18, style, fill, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{children}{d && <path d={d} />}</svg>
);
const I = {
  home: (pr) => <Ico {...pr}><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="7" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="13.5" width="7" height="7" rx="2" /></Ico>,
  thesis: (pr) => <Ico {...pr}><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1.1 2.2h5c.1-.9.5-1.7 1.1-2.2A6 6 0 0 0 12 3z" /></Ico>,
  radar: (pr) => <Ico {...pr}><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><path d="M12 3.5V7M12 17v3.5M3.5 12H7M17 12h3.5" /><circle cx="12" cy="12" r="1" fill="currentColor" /></Ico>,
  building: (pr) => <Ico {...pr}><path d="M4.5 20.5V6.5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14M15.5 10.5h2a2 2 0 0 1 2 2v8M3 20.5h18" /><path d="M8 8.5h2M8 12h2M8 15.5h2M12 8.5h.01M12 12h.01M12 15.5h.01" /></Ico>,
  network: (pr) => <Ico {...pr}><circle cx="12" cy="5.5" r="2.5" /><circle cx="5.5" cy="17.5" r="2.5" /><circle cx="18.5" cy="17.5" r="2.5" /><path d="M10.7 7.6 7 15.3M13.3 7.6l3.7 7.7M8 17.5h8" /></Ico>,
  send: (pr) => <Ico {...pr}><path d="M20.5 3.5 3.8 10.2a.8.8 0 0 0 .1 1.5l6.4 2 2 6.4a.8.8 0 0 0 1.5.1z" /><path d="M20.5 3.5 10.3 13.7" /></Ico>,
  kanban: (pr) => <Ico {...pr}><rect x="3.5" y="4" width="5" height="16" rx="1.5" /><rect x="9.5" y="4" width="5" height="11" rx="1.5" /><rect x="15.5" y="4" width="5" height="7" rx="1.5" /></Ico>,
  doc: (pr) => <Ico {...pr}><path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5z" /><path d="M14 3.5V8.5h5M8.5 12.5h7M8.5 16h5" /></Ico>,
  clipboard: (pr) => <Ico {...pr}><rect x="5" y="5" width="14" height="16" rx="2" /><path d="M9 5V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1M8.5 13.5l2.5 2.5 4.5-5" /></Ico>,
  shield: (pr) => <Ico {...pr}><path d="M12 3.5 5 6v5.5c0 4.3 2.9 7.6 7 9 4.1-1.4 7-4.7 7-9V6z" /><path d="M12 8.5v4M12 15.5h.01" /></Ico>,
  memo: (pr) => <Ico {...pr}><path d="M12 20.5h8.5M4 20.5l4.2-1 10-10a1.9 1.9 0 0 0-3.2-3.2l-10 10z" /><path d="M13.5 7.8l3.2 3.2" /></Ico>,
  briefcase: (pr) => <Ico {...pr}><rect x="3.5" y="7.5" width="17" height="12" rx="2.5" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17" /></Ico>,
  trend: (pr) => <Ico {...pr}><path d="M3.5 17.5 9 12l3.5 3.5 8-8" /><path d="M15.5 7.5h5v5" /></Ico>,
  book: (pr) => <Ico {...pr}><path d="M4.5 5.5A2 2 0 0 1 6.5 3.5H19v14H6.5a2 2 0 0 0-2 2z" /><path d="M4.5 19.5a2 2 0 0 1 2-2H19v3H6.5a2 2 0 0 1-2-1z" /></Ico>,
  library: (pr) => <Ico {...pr}><path d="M4 4.5h3v15H4zM9 4.5h3v15H9zM14.5 5.2l2.9-.8 3.7 14.4-2.9.8z" /></Ico>,
  activity: (pr) => <Ico {...pr}><path d="M3.5 12h3.2l2.6-6 3.4 12 2.6-6h5.2" /></Ico>,
  flask: (pr) => <Ico {...pr}><path d="M9.5 3.5h5M10 3.5v5.2L4.9 17.6A2 2 0 0 0 6.6 20.5h10.8a2 2 0 0 0 1.7-2.9L14 8.7V3.5" /><path d="M7.5 15h9" /></Ico>,
  search: (pr) => <Ico {...pr}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.3-4.3" /></Ico>,
  bell: (pr) => <Ico {...pr}><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z" /><path d="M10 20.5a2 2 0 0 0 4 0" /></Ico>,
  chat: (pr) => <Ico {...pr}><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V16H6.5A2.5 2.5 0 0 1 4 13.5z" /><path d="M8.5 9h7M8.5 12h4" /></Ico>,
  panelClose: (pr) => <Ico {...pr}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9 4.5v15M15.5 10l-2 2 2 2" /></Ico>,
  panelOpen: (pr) => <Ico {...pr}><rect x="3.5" y="4.5" width="17" height="15" rx="2.5" /><path d="M9 4.5v15M13.5 10l2 2-2 2" /></Ico>,
};

/* ---------- formatting ---------- */
const money = (m) => (m == null ? "Unknown" : `$${m.toFixed(1)}M`);
const pct = (p) => (p == null ? "Unknown" : `${p.toFixed(1)}%`);

/* ---------- primitives ---------- */
function Card({ children, className = "", style = {}, pad = true, bordered }) {
  return (
    <div
      className={`bg-white ${pad ? "p-4" : ""} ${className}`}
      style={{ borderRadius: R.card, boxShadow: SHADOW, border: bordered ? `1px solid ${T.border}` : "none", transition: EASE, ...style }}
    >
      {children}
    </div>
  );
}
function SectionTitle({ children, right }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3 style={{ color: T.text, fontSize: 15, fontWeight: 600, margin: 0 }}>{children}</h3>
      {right}
    </div>
  );
}
function Demo({ children = "Synthetic demo" }) {
  return (
    <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: R.chip, background: T.unknownSoft, color: T.unknown, whiteSpace: "nowrap" }}>
      {children}
    </span>
  );
}
const LEVEL = {
  confirmed: { label: "Confirmed", color: T.green, bg: T.greenSoft, Icon: CheckCircle2, border: "solid" },
  inferred: { label: "Inferred", color: T.accent, bg: T.accentSoft, Icon: Info, border: "solid" },
  estimated: { label: "Estimated", color: T.amber, bg: T.amberSoft, Icon: CircleDot, border: "solid" },
  unknown: { label: "Unknown", color: T.unknown, bg: T.unknownSoft, Icon: HelpCircle, border: "dashed" },
  risk: { label: "Risk", color: T.red, bg: T.redSoft, Icon: AlertTriangle, border: "solid" },
};
function Level({ level, small }) {
  const L = LEVEL[level];
  return (
    <span
      className="inline-flex items-center gap-1 font-medium"
      style={{ color: L.color, background: L.bg, border: `1px ${L.border} ${L.color}55`, fontSize: 11, padding: small ? "0 7px" : "2px 8px", borderRadius: R.chip }}
    >
      <L.Icon size={11} /> {L.label}
    </span>
  );
}
function Legend({ levels = ["confirmed", "inferred", "estimated", "unknown", "risk"] }) {
  return <div className="flex items-center gap-1.5 flex-wrap">{levels.map((l) => <Level key={l} level={l} small />)}</div>;
}
function Num({ children, muted, color }) {
  return <span className="tabular-nums text-right block" style={{ color: color || (muted ? T.muted : T.text), fontVariantNumeric: "tabular-nums" }}>{children}</span>;
}
/* priority system: critical / review / active / healthy */
const PRI = { critical: [T.red, T.redSoft, "Critical"], review: [T.amber, T.amberSoft, "Needs review"], active: [T.accent, T.accentSoft, "Active"], healthy: [T.green, T.greenSoft, "Healthy"] };
function Pri({ p, label }) {
  const [c, b, l] = PRI[p];
  return <span className="inline-flex items-center gap-1.5 font-medium" style={{ color: c, background: b, fontSize: 11, padding: "2px 9px", borderRadius: R.chip }}><span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />{label || l}</span>;
}
function Conf({ v }) {
  const c = v === "High" ? T.green : v === "Medium" ? T.amber : T.unknown;
  return (
    <span className="inline-flex items-center gap-1 font-medium" style={{ color: c, fontSize: 12 }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: c }} /> {v}
    </span>
  );
}
function FitBadge({ v }) {
  const s = v >= 90 ? { c: T.green, t: "Strong fit" } : v >= 75 ? { c: T.accent, t: "Potential fit" } : { c: T.unknown, t: "Monitor" };
  return (
    <span className="inline-block" style={{ minWidth: 88 }}>
      <span className="flex items-baseline gap-1.5"><span className="tabular-nums" style={{ color: s.c, fontSize: 16, fontWeight: 600, lineHeight: 1 }}>{v}</span><span style={{ color: T.muted, fontSize: 11 }}>{s.t}</span></span>
      <span className="block mt-1 rounded" style={{ height: 3, background: T.soft }}><span className="block rounded" style={{ height: 3, width: `${v}%`, background: s.c }} /></span>
    </span>
  );
}
function Sev({ v }) {
  const m = { High: [T.red, T.redSoft], Medium: [T.amber, T.amberSoft], Low: [T.green, T.greenSoft] }[v];
  return <span className="font-medium" style={{ color: m[0], background: m[1], fontSize: 11, padding: "2px 9px", borderRadius: R.chip }}>{v}</span>;
}
function Btn({ children, primary, ghost, onClick, icon: I, small, danger, disabled }) {
  const base = small ? "px-2.5 py-1" : "px-3 py-1.5";
  const st = primary
    ? { background: T.accent, color: "#fff", border: `1px solid ${T.accent}` }
    : danger
    ? { background: T.red, color: "#fff", border: `1px solid ${T.red}` }
    : ghost
    ? { background: "transparent", color: T.muted, border: "1px solid transparent" }
    : { background: "#fff", color: T.text, border: `1px solid ${T.border}` };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-medium ${base} hover:opacity-90 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-50`}
      style={{ ...st, fontSize: small ? 12 : 13, borderRadius: R.ctl, transition: EASE }}
    >
      {I && <I size={14} />} {children}
    </button>
  );
}
function Tabs({ tabs, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-0.5 p-1" style={{ background: T.soft, borderRadius: 12 }}>
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className="px-3 py-1.5" style={{ fontSize: 13, borderRadius: 9, transition: EASE, color: value === t ? T.text : T.muted, background: value === t ? "#fff" : "transparent", boxShadow: value === t ? "0 1px 3px rgba(15,28,46,0.12)" : "none", fontWeight: value === t ? 600 : 500 }}>{t}</button>
      ))}
    </div>
  );
}
function KV({ k, v, level }) {
  return (
    <div className="flex items-start justify-between py-1.5" style={{ borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
      <span style={{ color: T.muted }}>{k}</span>
      <span className="flex items-center gap-2 font-medium tabular-nums text-right" style={{ color: T.text }}>
        {v} {level && <Level level={level} small />}
      </span>
    </div>
  );
}
function Skeleton({ h = 12, w = "100%" }) {
  return <div className="rounded animate-pulse" style={{ height: h, width: w, background: "#e9eaed" }} />;
}
function Tip({ text, children }) {
  return (
    <span className="relative group inline-flex">
      {children}
      <span className="absolute z-30 hidden group-hover:block left-1/2 -translate-x-1/2 top-full mt-1 px-2 py-1 whitespace-nowrap" style={{ background: T.text, color: "#fff", fontSize: 11, borderRadius: 4 }}>{text}</span>
    </span>
  );
}
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16" style={{ background: "rgba(15,28,46,0.45)" }} onClick={onClose}>
      <div className={`bg-white shadow-xl ${wide ? "w-[960px]" : "w-[640px]"} max-w-[95vw] max-h-[85vh] overflow-auto`} onClick={(e) => e.stopPropagation()} style={{ borderRadius: R.card }}>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <div className="font-semibold" style={{ color: T.text, fontSize: 14 }}>{title}</div>
          <button onClick={onClose} style={{ color: T.muted }}><X size={16} /></button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
function PageHeader({ title, sub, crumbs = [], right, demo }) {
  return (
    <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
      <div>
        {crumbs.length > 0 && (
          <div className="flex items-center gap-1 mb-1" style={{ color: T.muted, fontSize: 12 }}>
            {crumbs.map((c, i) => (
              <React.Fragment key={i}>
                {i > 0 && <ChevronRight size={12} />}
                <span>{c}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3">
          <h1 style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.2, letterSpacing: "-0.02em" }}>{title}</h1>
          <Demo>{demo || "Synthetic demo"}</Demo>
        </div>
        {sub && <p style={{ color: T.muted, fontSize: 13, margin: "4px 0 0" }}>{sub}</p>}
      </div>
      {right && <div className="flex items-center gap-2 pt-1">{right}</div>}
    </div>
  );
}
function Metric({ k, v, color, secondary, sub }) {
  return secondary
    ? <div className="flex items-baseline justify-between py-2" style={{ borderBottom: `1px solid ${T.border}` }}><span style={{ color: T.muted, fontSize: 12 }}>{k}</span><span className="tabular-nums font-semibold" style={{ color: T.text, fontSize: 15 }}>{v}</span></div>
    : <Card><div style={{ color: T.muted, fontSize: 12 }}>{k}</div><div className="tabular-nums" style={{ color: color || T.text, fontSize: 26, fontWeight: 700, lineHeight: 1.15, marginTop: 4, letterSpacing: "-0.01em" }}>{v}</div>{sub && <div style={{ color: T.muted, fontSize: 11, marginTop: 2 }}>{sub}</div>}</Card>;
}
function Stat({ label, value, color }) {
  return <div><div style={{ color: T.muted, fontSize: 11 }}>{label}</div><div className="tabular-nums" style={{ color: color || T.text, fontSize: 15, fontWeight: 600 }}>{value}</div></div>;
}

/* ---------- mock data (synthetic) ---------- */
const COMPANIES = [
  { id: "pms", name: "Precision MedTech Solutions", sector: "Medical Components", loc: "Cleveland, OH", rev: 26.0, ebitda: 3.8, gm: 34.2, own: "Founder-owned", fit: 91, conf: "High", rel: "No relationship", signal: "Strong technical fit", thesis: "Medical Device Precision Components", risk: "Customer concentration", emp: 115 },
  { id: "ams", name: "Apex Motion Systems", sector: "Aerospace", loc: "Pittsburgh, PA", rev: 41.0, ebitda: 5.2, gm: 38.1, own: "Family-owned", fit: 88, conf: "High", rel: "Warm intro available", signal: "Founder succession signal", thesis: "Aerospace Precision Components", risk: "Program dependency", emp: 190 },
  { id: "npt", name: "Nova Polymer Technologies", sector: "Engineered Materials", loc: "Grand Rapids, MI", rev: 18.0, ebitda: 2.7, gm: 36.0, own: "Founder-owned", fit: 86, conf: "Medium", rel: "No relationship", signal: "Specialty polymer capability", thesis: "Medical Device Precision Components", risk: "Scale", emp: 84 },
  { id: "spc", name: "Sterling Precision Components", sector: "Medical / Aerospace", loc: "Rochester, NY", rev: 32.0, ebitda: 4.1, gm: 33.4, own: "Family-owned", fit: 84, conf: "High", rel: "Met at trade show 2025", signal: "Capacity expansion", thesis: "Aerospace Precision Components", risk: "Capex intensity", emp: 140 },
  { id: "htd", name: "Hartwell Thermal Devices", sector: "Thermal Management", loc: "Dayton, OH", rev: 22.5, ebitda: 3.1, gm: 31.8, own: "Founder-owned", fit: 82, conf: "Medium", rel: "No relationship", signal: "Defense program wins", thesis: "Engineered Thermal Management", risk: "Margin volatility", emp: 96 },
  { id: "cvs", name: "Crestline Valve Supply", sector: "Industrial Distribution", loc: "Indianapolis, IN", rev: 37.0, ebitda: 3.4, gm: 24.6, own: "Family-owned", fit: 79, conf: "High", rel: "Banker relationship", signal: "Non-discretionary parts", thesis: "Specialty Industrial Distribution", risk: "Supplier concentration", emp: 72 },
  { id: "lmm", name: "Lakeshore Micro Machining", sector: "Medical Components", loc: "Erie, PA", rev: 14.0, ebitda: 2.1, gm: 35.5, own: "Founder-owned", fit: 78, conf: "Medium", rel: "No relationship", signal: "Swiss machining niche", thesis: "Medical Device Precision Components", risk: "Owner dependency", emp: 58 },
  { id: "bcm", name: "Brightline Composite Works", sector: "Engineered Materials", loc: "Toledo, OH", rev: 29.0, ebitda: 3.6, gm: 30.9, own: "PE-backed", fit: 71, conf: "High", rel: "No relationship", signal: "Already sponsor-owned", thesis: "Aerospace Precision Components", risk: "Ownership", emp: 130 },
  { id: "kfs", name: "Keystone Fluid Systems", sector: "Diversified Industrial", loc: "Akron, OH", rev: 24.0, ebitda: 2.9, gm: 29.2, own: "Founder-owned", fit: 74, conf: "Medium", rel: "Cold email 2024", signal: "Margin slightly below threshold", thesis: "Engineered Thermal Management", risk: "Gross margin", emp: 101 },
  { id: "rsd", name: "Ridgeway Silicone Molding", sector: "Medical Components", loc: "Minneapolis, MN", rev: 20.0, ebitda: 3.2, gm: 37.4, own: "Founder-owned", fit: 87, conf: "Medium", rel: "No relationship", signal: "LSR cleanroom molding", thesis: "Medical Device Precision Components", risk: "Revenue estimate", emp: 90 },
  { id: "ohe", name: "Ohio Elevator Parts Co.", sector: "Industrial Distribution", loc: "Columbus, OH", rev: 16.5, ebitda: 2.0, gm: 22.1, own: "Family-owned", fit: 76, conf: "High", rel: "Referral pending", signal: "Repair-parts recurring demand", thesis: "Specialty Industrial Distribution", risk: "Scale", emp: 44 },
  { id: "vtc", name: "Vantage Tube & Coil", sector: "Aerospace", loc: "Wichita, KS", rev: 45.0, ebitda: 5.8, gm: 32.0, own: "Family-owned", fit: 83, conf: "High", rel: "No relationship", signal: "Tube fabrication", thesis: "Aerospace Precision Components", risk: "Customer concentration", emp: 210 },
];

const THESES = [
  { name: "Medical Device Injection Molding", status: "Active", targets: 327, qualified: 48, owner: "C. Hren", updated: "Today" },
  { name: "Aerospace Precision Components", status: "Active", targets: 284, qualified: 41, owner: "B. Kingsbury", updated: "Yesterday" },
  { name: "Engineered Thermal Management", status: "Researching", targets: 196, qualified: 22, owner: "Research Agent", updated: "2 days ago" },
  { name: "Specialty Industrial Distribution", status: "Active", targets: 412, qualified: 32, owner: "C. Hren", updated: "3 days ago" },
];

const DEALS = [
  { name: "Project Falcon", stage: "Diligence", sector: "Aerospace components", ev: "$42M-$48M", owner: "B. Kingsbury", days: 18, risk: "Customer concentration 31%", ai: "CIM extracted, red team complete" },
  { name: "Project Orion", stage: "CIM Received", sector: "Medical LSR molding", ev: "$22M-$26M", owner: "C. Hren", days: 4, risk: "EBITDA adjustments", ai: "Extraction in progress" },
  { name: "Project Atlas", stage: "Management Meeting", sector: "Industrial distribution", ev: "$30M-$34M", owner: "M. Mansour", days: 9, risk: "Supplier concentration", ai: "Meeting brief drafted" },
  { name: "Project Summit", stage: "NDA", sector: "Thermal management", ev: "$18M-$21M", owner: "C. Hren", days: 2, risk: "Limited public data", ai: "Pre-research complete" },
  { name: "Project Beacon", stage: "Initial Review", sector: "Optical coatings", ev: "$14M-$17M", owner: "Research Agent", days: 1, risk: "Scale below range", ai: "Teaser screened" },
];

const EVIDENCE = [
  { claim: "Company manufactures tight-tolerance components used in diagnostic equipment.", src: ["Company website / Capabilities"], conf: "High", level: "confirmed", verified: "Today", excerpt: "Capabilities page lists micro-molded and machined components for in-vitro diagnostic instruments with tolerances to +/- 0.0005 in." },
  { claim: "Revenue estimated between $24M and $29M.", src: ["Industry database", "Employee count model", "Import/export activity"], conf: "Medium", level: "estimated", verified: "Today", excerpt: "Three independent estimates triangulate to a $24M-$29M range. Midpoint used for screening: $26.0M." },
  { claim: "Gross margin approximately 34%.", src: ["Peer benchmark model", "Facility and headcount signals"], conf: "Medium", level: "estimated", verified: "Yesterday", excerpt: "Peer set of eight precision medical molders shows 31%-37% gross margin. Headcount-to-revenue ratio is consistent with the upper half of the set." },
  { claim: "Founder retains 100% ownership.", src: ["State business filings", "Press interview 2022"], conf: "High", level: "confirmed", verified: "2 days ago", excerpt: "Secretary of State filing lists a single member. 2022 interview: 'I still own the whole thing and plan to keep building it.'" },
  { claim: "Largest customer likely represents 28%-35% of revenue.", src: ["Job postings referencing key account", "Shipment pattern analysis"], conf: "Medium", level: "inferred", verified: "Today", excerpt: "Two job postings reference a dedicated program team for one OEM. Shipment frequency to a single destination is elevated." },
  { claim: "ISO 13485 certified.", src: ["Certificate registry"], conf: "High", level: "confirmed", verified: "Today", excerpt: "Registry shows active ISO 13485:2016 certificate, expiry 2027." },
  { claim: "Management succession plan.", src: [], conf: "Low", level: "unknown", verified: "Not verified", excerpt: "No public information located. This is a gap, not a negative finding. Suggested source: founder conversation." },
  { claim: "Capacity utilization.", src: [], conf: "Low", level: "unknown", verified: "Not verified", excerpt: "No public information located. 2024 facility expansion suggests recent investment; utilization requires site visit or management data." },
];

const TIMELINE = [
  { y: "2019", t: "Company added to industry database", level: "confirmed" },
  { y: "2022", t: "Founder interviewed in regional manufacturing publication", level: "confirmed" },
  { y: "2024", t: "New production facility announced", level: "confirmed" },
  { y: "2025", t: "VP Sales hired", level: "inferred" },
  { y: "2026", t: "Founder discusses succession planning in industry panel", level: "inferred" },
];

const AGENT_EVENTS = [
  { agent: "Research Agent", text: "Analyzed 18 companies against Medical Device Injection Molding thesis", time: "08:42", icon: Radar },
  { agent: "Qualification Agent", text: "Promoted 3 targets to Priority", time: "08:37", icon: Target },
  { agent: "Red Team", text: "Flagged customer concentration risk on Project Falcon", time: "08:15", icon: ShieldAlert },
  { agent: "Market Agent", text: "Updated aerospace thesis with Q3 program data", time: "07:58", icon: TrendingUp },
  { agent: "CIM Agent", text: "Completed initial extraction for Project Falcon", time: "07:20", icon: FileText },
];

/* ---------- navigation ---------- */
const NAV = [
  { group: "Overview", items: [{ id: "home", label: "Command Center", icon: I.home }] },
  { group: "Sourcing", items: [
    { id: "thesis", label: "Thesis Builder", icon: I.thesis },
    { id: "discovery", label: "Target Discovery", icon: I.radar },
    { id: "companies", label: "Companies", icon: I.building },
    { id: "relationship", label: "Relationship Intelligence", icon: I.network },
    { id: "outreach", label: "Outreach", icon: I.send },
  ]},
  { group: "Deals", items: [
    { id: "pipeline", label: "Deal Pipeline", icon: I.kanban },
    { id: "cim", label: "CIM Analyzer", icon: I.doc },
    { id: "diligence", label: "Due Diligence", icon: I.clipboard },
    { id: "redteam", label: "Red Team", icon: I.shield },
    { id: "icmemo", label: "IC Memo", icon: I.memo },
  ]},
  { group: "Portfolio", items: [
    { id: "portfolio", label: "Portfolio Intelligence", icon: I.briefcase },
    { id: "value", label: "Value Creation", icon: I.trend },
  ]},
  { group: "Knowledge", items: [
    { id: "knowledge", label: "MCM Knowledge", icon: I.book },
    { id: "library", label: "Research Library", icon: I.library },
  ]},
  { group: "System", items: [
    { id: "agents", label: "Agent Activity", icon: I.activity },
    { id: "evals", label: "Evaluations", icon: I.flask },
  ]},
];

function Sidebar({ route, go, collapsed, setCollapsed }) {
  return (
    <aside className="flex flex-col shrink-0 h-screen sticky top-0" style={{ width: collapsed ? 56 : 224, background: T.nav, color: T.navText, transition: "width 150ms" }}>
      <div className="flex items-center justify-between" style={{ padding: "20px 16px 12px" }}>
        {!collapsed && (
          <div>
            <div className="flex items-center justify-center bg-white" style={{ width: 44, height: 44, borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.25)" }}><span style={{ color: T.nav, fontWeight: 800, fontSize: 13, letterSpacing: "-0.02em" }}>MCM</span></div>
            <div className="text-white font-semibold" style={{ fontSize: 10.5, letterSpacing: "0.2em", marginTop: 10 }}>INTELLIGENCE</div>
            <div style={{ color: "#5F6F8A", fontSize: 11, marginTop: 2 }}>Concept prototype</div>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-white/10" style={{ color: "#6E7E98" }}>
          {collapsed ? <I.panelOpen size={17} /> : <I.panelClose size={17} />}
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto" style={{ padding: "4px 8px 8px" }}>
        {NAV.map((g) => (
          <div key={g.group} style={{ marginTop: 20 }}>
            {!collapsed && <div style={{ color: "#556479", fontSize: 10.5, letterSpacing: "0.08em", textTransform: "uppercase", padding: "0 10px 6px" }}>{g.group}</div>}
            {g.items.map((it) => {
              const active = route === it.id || (it.id === "companies" && route === "company");
              return (
                <button
                  key={it.id}
                  onClick={() => go(it.id)}
                  title={it.label}
                  className="w-full flex items-center gap-2.5 text-left relative"
                  style={{ padding: "7px 10px", borderRadius: R.ctl, fontSize: 13.5, background: active ? T.navActive : "transparent", color: active ? "#fff" : T.navText, transition: EASE }}
                >
                  <it.icon size={18} style={{ color: active ? "#9EC2EA" : "#7A8AA6", flexShrink: 0 }} />
                  {!collapsed && <span className="truncate">{it.label}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
      {!collapsed && (
        <div className="flex items-center gap-3" style={{ padding: "14px 16px", borderTop: "1px solid #1B2A40", fontSize: 12 }}>
          <div className="flex items-center justify-center" style={{ width: 30, height: 30, borderRadius: 999, background: T.navActive, color: "#fff", fontSize: 11, fontWeight: 600 }}>MA</div>
          <div><div className="text-white font-medium">Mahbub Ahmed</div>
          <div style={{ color: "#5F6F8A" }}>Prototype workspace</div></div>
        </div>
      )}
    </aside>
  );
}

/* ---------- AI mode indicator (unobtrusive) ---------- */
function AiStatusPill() {
  const mode = useAiMode();
  const m = { live: ["Live AI", T.green], demo: ["Demo mode", T.unknown], checking: ["Checking", T.unknown] }[mode] || ["Demo mode", T.unknown];
  return (
    <span title={mode === "live" ? `Live analysis via ${getAiModel() || "configured model"}` : "Live analysis not configured; synthetic demonstration data is shown"} className="inline-flex items-center gap-1.5" style={{ fontSize: 12, color: T.muted }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: m[1], boxShadow: mode === "live" ? `0 0 0 3px ${T.greenSoft}` : "none" }} />{m[0]}
    </span>
  );
}

function Topbar({ openSearch, openAsk, notify }) {
  const [showNotif, setShowNotif] = useState(false);
  return (
    <div className="h-14 grid items-center px-6 sticky top-0 z-20" style={{ gridTemplateColumns: "1fr auto 1fr", background: "rgba(247,247,245,0.8)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.border}` }}>
      <div className="flex items-center gap-2" style={{ fontSize: 13 }}>
        <span className="font-semibold" style={{ color: T.text }}>MCM Capital Partners</span>
        <span style={{ color: T.border }}>/</span>
        <span style={{ color: T.muted }}>Fund IV</span>
      </div>
      <button onClick={openSearch} className="flex items-center gap-2 px-4 py-2 w-[440px] bg-white" style={{ borderRadius: R.chip, color: T.muted, fontSize: 13, boxShadow: "inset 0 0 0 1px " + T.border, transition: EASE }}>
        <I.search size={16} /> <span className="flex-1 text-left">Search companies, deals, documents, people</span>
        <span style={{ fontSize: 11, padding: "0 6px", borderRadius: 6, background: T.soft }}>Ctrl K</span>
      </button>
      <div className="flex items-center justify-end gap-3">
        <AiStatusPill />
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="relative flex items-center justify-center bg-white" style={{ width: 36, height: 36, borderRadius: 12, color: T.muted, boxShadow: "inset 0 0 0 1px " + T.border, transition: EASE }}>
            <I.bell size={17} />
            <span className="absolute -top-1 -right-1 flex items-center justify-center text-white tabular-nums" style={{ width: 16, height: 16, borderRadius: 999, background: T.red, fontSize: 9.5, fontWeight: 700 }}>3</span>
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 bg-white z-30 overflow-hidden" style={{ borderRadius: R.card, boxShadow: SHADOW_HOVER, fontSize: 13 }}>
              {[
                ["Red Team", "Project Falcon: three items require resolution", "critical"],
                ["Qualification", "Precision MedTech Solutions promoted to Priority", "active"],
                ["Diligence", "2 financial questions awaiting owner", "review"],
              ].map(([a, b, pr], i) => (
                <div key={i} className="px-3 py-2.5 flex gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRI[pr][0] }} />
                  <div><div style={{ fontSize: 11, color: T.muted }}>{a}</div><div style={{ color: T.text }}>{b}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
        <Btn primary icon={I.chat} onClick={openAsk}>Ask Intelligence</Btn>
      </div>
    </div>
  );
}

/* ---------- global search ---------- */
function GlobalSearch({ onClose, go, openCompany }) {
  const [q, setQ] = useState("");
  const ref = useRef(null);
  useEffect(() => { ref.current && ref.current.focus(); }, []);
  const examples = ["medical manufacturers Ohio", "companies with >30% gross margin", "Project Falcon customer concentration", "founder succession opportunities", "aerospace companies reviewed last year"];
  const ql = q.toLowerCase();
  const results = useMemo(() => {
    if (!ql) return [];
    const r = [];
    COMPANIES.filter((c) => {
      const hit = c.name.toLowerCase().includes(ql) || c.sector.toLowerCase().includes(ql) || c.loc.toLowerCase().includes(ql) || (ql.includes("ohio") && c.loc.endsWith("OH")) || (ql.includes("medical") && c.sector.toLowerCase().includes("medical")) || (ql.includes("30%") && c.gm > 30) || (ql.includes("succession") && c.signal.toLowerCase().includes("succession")) || (ql.includes("aerospace") && c.sector.toLowerCase().includes("aerospace"));
      return hit;
    }).slice(0, 6).forEach((c) => r.push({ kind: "Company", title: c.name, sub: `${c.sector}, ${c.loc}, ${money(c.rev)} revenue`, action: () => openCompany(c.id) }));
    DEALS.filter((d) => d.name.toLowerCase().includes(ql) || ql.includes("falcon")).forEach((d) => r.push({ kind: "Deal", title: d.name, sub: `${d.stage}, ${d.sector}`, action: () => go(d.name === "Project Falcon" ? "cim" : "pipeline") }));
    if (ql.includes("concentration")) r.push({ kind: "Document", title: "Project Falcon CIM, p. 48 Customer analysis", sub: "Top customer 31%, top 5 customers 64%", action: () => go("cim") });
    if (ql.includes("succession")) r.push({ kind: "Relationship", title: "Succession signals across monitored universe", sub: "2 founders discussing succession in last 12 months", action: () => go("relationship") });
    if (ql.includes("aerospace")) r.push({ kind: "Knowledge", title: "Aerospace Precision Components thesis", sub: "41 qualified companies, updated yesterday", action: () => go("thesis") });
    if (ql.includes("medical")) r.push({ kind: "Knowledge", title: "Illustrative insight: medical injection molding", sub: "Institutional memory, synthetic", action: () => go("knowledge") });
    return r;
  }, [ql]);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24" style={{ background: "rgba(16,26,43,0.45)" }} onClick={onClose}>
      <div className="bg-white w-[680px] max-w-[95vw] overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ borderRadius: R.hero, boxShadow: "0 24px 64px rgba(15,28,46,0.28)" }}>
        <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
          <Search size={16} style={{ color: T.muted }} />
          <input ref={ref} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search across companies, deals, documents, relationships, research, portfolio, knowledge" className="flex-1 text-sm outline-none" style={{ color: T.text }} />
          <span className="text-xs" style={{ color: T.muted }}>Esc</span>
        </div>
        <div className="p-2 max-h-96 overflow-auto">
          {!q && (
            <div className="px-2 py-1">
              <div className="text-xs mb-1" style={{ color: T.muted }}>Try</div>
              {examples.map((e) => (
                <button key={e} onClick={() => setQ(e)} className="block w-full text-left text-sm px-2 py-1.5 rounded hover:bg-stone-100" style={{ color: T.text }}>{e}</button>
              ))}
            </div>
          )}
          {q && results.length === 0 && <div className="px-3 py-6 text-sm text-center" style={{ color: T.muted }}>No results in the demo index. Try one of the example searches.</div>}
          {results.map((r, i) => (
            <button key={i} onClick={() => { r.action(); onClose(); }} className="w-full flex items-center gap-3 text-left px-3 py-2 rounded hover:bg-stone-100">
              <span className="text-xs w-20 shrink-0" style={{ color: T.muted }}>{r.kind}</span>
              <span className="flex-1">
                <span className="block text-sm font-medium" style={{ color: T.text }}>{r.title}</span>
                <span className="block text-xs" style={{ color: T.muted }}>{r.sub}</span>
              </span>
              <ChevronRight size={14} style={{ color: T.muted }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Ask MCM Intelligence ---------- */
const ASK_Q = ["Why does this company fit MCM?", "What information are we missing?", "Compare this company with the active thesis.", "Red-team this opportunity.", "Draft questions for the founder.", "What would make us reject this company?"];
/* Builds the plain-text context sent to live AI. Only facts already on screen are included. */
const DEAL_CONTEXT = {
  "Project Falcon": `Deal: Project Falcon (Falcon Precision Technologies), aerospace precision components, received via intermediary. Stage: Diligence, day 18. Owner: B. Kingsbury. EV range $42M-$48M.
CIM extraction (synthetic CIM, page references): FY2025 revenue $38.2M (+8.1%, p.23); gross margin 35.4% (p.23); reported EBITDA $4.4M, adjustments $0.74M, adjusted EBITDA $5.1M (p.71); capex $2.4M (p.84); 168 employees (p.92); top customer 31%, top five 64%, Customer A agreement runs through Q3 2028, pricing mechanics not disclosed (p.48); commercial aerospace 58%, defense 27%, industrial 15% (p.58); management projects 12% CAGR, two thirds from Program X and Program Y (p.58); 42 CNC machines, ~78% utilization on two shifts (p.84); CEO/owner, tenured COO, CFO hired 2023, succession not addressed (p.92). Net working capital: not disclosed.
Diligence: financial 86% complete, commercial 72%, legal 58%, management 45%; 47 open questions (11 legal); 3 material risks: Customer A concentration rose to 44% in latest month (data-room update), $740K adjustments partially recurring, change-of-control clause in Customer A agreement.
Red team (if run): assumption 1 aerospace growth durable (medium); assumption 2 customer durability, agreement expires within 24 months of close (high); assumption 3 EBITDA adjustments reasonable, relocation costs recurred in two of three years (high).
Open questions: Customer A renewal terms and pricing history; which adjustments recur; downside case for 18-month program slip.`,
};
function buildAskContext(ctx) {
  if (ctx.company) {
    const c = ctx.company;
    const ev = c.id === "pms" ? EVIDENCE.map((e) => `- ${e.claim} [${e.level}, confidence ${e.conf}, sources: ${e.src.length ? e.src.join("; ") : "none"}]`).join("\n") : "- No evidence items collected yet for this company beyond the screening facts above.";
    const tl = c.id === "pms" ? TIMELINE.map((t) => `- ${t.y}: ${t.t} [${t.level}]`).join("\n") : "- No relationship history recorded.";
    return `Current workspace: Company Intelligence
Company: ${c.name}
Sector: ${c.sector}. Location: ${c.loc}. Ownership: ${c.own}. Employees: ~${c.emp}.
Active thesis: ${c.thesis}
Screening estimates (external models, not company data): revenue ${money(c.rev)}, EBITDA ${money(c.ebitda)}, gross margin ${pct(c.gm)}. MCM fit score ${c.fit}/100, confidence ${c.conf}. Relationship: ${c.rel}. Primary signal: ${c.signal}. Primary open risk: ${c.risk}.
MCM criteria: revenue $8M-$50M, EBITDA $1.5M-$6M, manufacturing gross margin 30%+, distribution 20%+, US, entrepreneurially led, customer concentration screening threshold 40%.
Evidence items:
${ev}
Relationship history:
${tl}`;
  }
  if (ctx.deal && DEAL_CONTEXT[ctx.deal]) return `Current workspace: ${ctx.deal}\n${DEAL_CONTEXT[ctx.deal]}`;
  return "Current workspace: MCM Intelligence command center. Pipeline: universe 1,284, screened 428, MCM fit 143, priority 37, contacted 21, active dialogue 12, diligence 3, IC 1. Active theses: Medical Device Injection Molding, Aerospace Precision Components, Engineered Thermal Management, Specialty Industrial Distribution. No company or deal is selected.";
}
function askAnswer(q, ctx) {
  const name = ctx.company ? ctx.company.name : ctx.deal || "the current context";
  const c = ctx.company;
  const A = {
    "Why does this company fit MCM?": {
      conclusion: `${name} screens as a priority target for the medical precision components thesis.`,
      reasoning: c ? `Estimated revenue of ${money(c.rev)} and EBITDA of ${money(c.ebitda)} sit inside MCM's range; gross margin of ${pct(c.gm)} clears the 30% manufacturing threshold; ownership is ${c.own.toLowerCase()}, which matches MCM's preference for entrepreneurially led businesses. The end market is medical and the product is highly engineered.` : "Financial range, sector, ownership structure and product engineering intensity align with MCM's published criteria.",
      evidence: ["ISO 13485 certificate (Confirmed)", "Revenue triangulation, three sources (Estimated)", "State ownership filing (Confirmed)"],
      uncertainty: "Financials are estimates from external models, not company data. Customer concentration is inferred, not confirmed.",
      next: "Approve a research brief and identify a warm introduction path to the founder.",
    },
    "What information are we missing?": {
      conclusion: "Four material items are unknown. None is a negative finding yet.",
      reasoning: "Missing data is tracked separately from adverse data so that gaps drive diligence questions rather than lower the score prematurely.",
      evidence: ["Management succession plan: Unknown", "Capacity utilization: Unknown", "Actual customer list and contract terms: Unknown", "Historical EBITDA: Estimated only"],
      uncertainty: "Score of 91 assumes estimates hold. A 10% downward revision in EBITDA would keep the company in range.",
      next: "Request a management conversation focused on succession and capacity before any valuation work.",
    },
    "Compare this company with the active thesis.": {
      conclusion: "Matches 9 of 10 thesis criteria; one criterion (customer diversification) is unresolved.",
      reasoning: "The thesis requires highly engineered components, mission-critical applications, cleanroom or precision capability, US geography, founder or family ownership, and financial range fit. All are met. Risk exclusion 'extreme customer concentration' cannot be cleared with public data.",
      evidence: ["Thesis criteria v3 (12 public sources)", "Company capabilities page (Confirmed)", "Job postings referencing a dedicated OEM program (Inferred)"],
      uncertainty: "Medium. The largest customer share could range from 28% to 35%.",
      next: "Keep in Priority; move to Active Dialogue only after the concentration question is asked directly.",
    },
    "Red-team this opportunity.": {
      conclusion: "Investable in principle, but the thesis rests on two assumptions that public data cannot verify.",
      reasoning: "Assumption 1: margins are durable. If the top customer negotiates pricing at renewal, a 3-point margin decline moves EBITDA to roughly $3.0M. Assumption 2: the founder wants a partner rather than a full exit. Succession commentary could also signal a strategic sale process.",
      evidence: ["Peer margin range 31%-37% (Estimated)", "Founder succession remarks, industry panel 2026 (Inferred)"],
      uncertainty: "High on both assumptions until a management meeting occurs.",
      next: "Run the full Red Team module before any IOI discussion.",
    },
    "Draft questions for the founder.": {
      conclusion: "Seven questions, ordered to build rapport before probing sensitive topics.",
      reasoning: "Early questions concern the business the founder is proud of; later questions concern concentration, capacity and succession.",
      evidence: ["What applications are you proudest of solving for customers?", "How has the 2024 facility changed what you can quote?", "How is the sales team structured since the VP Sales hire?", "What share of revenue comes from your top three programs?", "How are pricing renewals handled with your largest OEM?", "What does the next five years look like for you personally?", "What would a good partner add that you cannot build alone?"],
      uncertainty: "Questions assume a first conversation; adjust if an intermediary is involved.",
      next: "Human review of tone, then attach to the outreach brief.",
    },
    "What would make us reject this company?": {
      conclusion: "Three findings would move this to Pass.",
      reasoning: "MCM's criteria are necessary but not sufficient; the following would override a strong financial fit.",
      evidence: ["Top customer above 40% with a contract expiring inside 24 months", "Founder seeks a full exit with no management bench", "Actual gross margin below 28%, indicating commodity work"],
      uncertainty: "None of these is currently indicated, but none can be ruled out with public data.",
      next: "Structure the first management conversation to surface all three.",
    },
  };
  return A[q] || A["Why does this company fit MCM?"];
}
function AskPanel({ ctx, onClose }) {
  const [thread, setThread] = useState([]);
  const [busy, setBusy] = useState(false);
  const [input, setInput] = useState("");
  const ask = async (q) => {
    setThread((t) => [...t, { role: "user", q }]);
    setBusy(true);
    const res = await askIntelligence({ question: q, context: buildAskContext(ctx) }, { fallback: () => askAnswer(q, ctx) });
    const a = res.source === "live" ? { conclusion: res.data.conclusion, reasoning: res.data.reasoning, evidence: res.data.enough_evidence === false ? res.data.evidence.slice(0, 2) : res.data.evidence, uncertainty: res.data.uncertainty, next: res.data.next_action, insufficient: res.data.enough_evidence === false } : res.data;
    setThread((t) => [...t, { role: "ai", a, q, source: res.source, error: res.error || null, meta: res.meta }]);
    setBusy(false);
  };
  return (
    <div className="fixed right-3 top-3 bottom-3 w-[420px] bg-white z-40 flex flex-col overflow-hidden" style={{ borderRadius: R.hero, boxShadow: SHADOW_HOVER }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: `1px solid ${T.border}` }}>
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: T.text }}><I.chat size={16} style={{ color: T.accent }} /> Ask Intelligence</div>
          <div className="text-xs mt-0.5" style={{ color: T.muted }}>Context: {ctx.company ? ctx.company.name : ctx.deal || "Workspace"}</div>
        </div>
        <button onClick={onClose} style={{ color: T.muted }}><X size={16} /></button>
      </div>
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {thread.length === 0 && (
          <div>
            <div className="text-xs mb-2" style={{ color: T.muted }}>Suggested questions for this context</div>
            {ASK_Q.map((q) => (
              <button key={q} onClick={() => ask(q)} className="block w-full text-left text-sm px-3 py-2 mb-1.5 hover:bg-stone-50" style={{ borderRadius: R.ctl, border: `1px solid ${T.border}`, color: T.text }}>{q}</button>
            ))}
          </div>
        )}
        {thread.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="text-sm px-3 py-2 rounded self-end" style={{ background: T.accentSoft, color: T.text }}>{m.q}</div>
          ) : (
            <div key={i} className="text-sm rounded p-3 space-y-2" style={{ border: `1px solid ${T.border}` }}>
              {m.error && <div className="flex items-center justify-between gap-2 px-2 py-1.5" style={{ background: T.amberSoft, color: T.amber, borderRadius: 8, fontSize: 12 }}><span>{m.error} Showing the synthetic demonstration answer instead.</span><button onClick={() => ask(m.q)} className="underline shrink-0">Retry live</button></div>}
              {m.a.insufficient && <div className="px-2 py-1.5" style={{ background: T.unknownSoft, color: T.unknown, borderRadius: 8, fontSize: 12 }}>Not enough evidence available for a confident answer.</div>}
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.muted }}>Conclusion</div><div className="font-medium" style={{ color: T.text }}>{m.a.conclusion}</div></div>
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.muted }}>Reasoning</div><div style={{ color: T.text }}>{m.a.reasoning}</div></div>
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.muted }}>Evidence</div><ul className="list-disc pl-4 space-y-0.5" style={{ color: T.text }}>{m.a.evidence.map((e, j) => <li key={j}>{e}</li>)}</ul></div>
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.amber }}>Uncertainty</div><div style={{ color: T.text }}>{m.a.uncertainty}</div></div>
              <div className="pt-1" style={{ borderTop: `1px solid ${T.border}` }}><div className="text-xs font-medium mb-0.5" style={{ color: T.accent }}>Recommended next action</div><div style={{ color: T.text }}>{m.a.next}</div></div>
              <div className="flex items-center justify-between text-xs pt-1" style={{ color: T.muted }}><span>AI-assisted response. Investment professional judgment required.</span><span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: m.source === "live" ? T.greenSoft : T.unknownSoft, color: m.source === "live" ? T.green : T.unknown }}>{m.source === "live" ? `Live${m.meta?.latencyMs ? ` · ${(m.meta.latencyMs / 1000).toFixed(1)}s` : ""}` : "Demo"}</span></div>
            </div>
          )
        )}
        {busy && <div className="flex items-center gap-2 text-xs" style={{ color: T.muted }}><Loader2 size={12} className="animate-spin" /> Reading evidence for {ctx.company ? ctx.company.name : ctx.deal || "this workspace"}</div>}
      </div>
      <div className="p-3 flex gap-2" style={{ borderTop: `1px solid ${T.border}` }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && input) { ask(input); setInput(""); } }} placeholder="Ask anything about this company or deal" disabled={busy} className="flex-1 text-sm px-3 py-1.5 rounded outline-none disabled:opacity-60" style={{ border: `1px solid ${T.border}` }} />
        <Btn primary small onClick={() => { if (input) { ask(input); setInput(""); } }}>Ask</Btn>
      </div>
    </div>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="fixed bottom-5 right-5 z-50 text-sm px-4 py-2.5 flex items-center gap-2" style={{ background: T.text, color: "#fff", borderRadius: 12, boxShadow: SHADOW_HOVER }}>
      <Check size={14} style={{ color: "#7fd1a2" }} /> {msg}
    </div>
  );
}

/* ---------- Command Center ---------- */
function CommandCenter({ go, openCompany, setStageFilter }) {
  const { ws } = useWorkspace();
  const auditEvents = ws.audit.slice(0, 4).map((e) => ({ agent: e.actor, text: `${e.action}${e.subject ? `: ${e.subject}` : ""}`, time: new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), icon: e.kind === "human" ? Users : e.kind === "ai" ? Bot : Activity, kind: e.kind }));
  const events = [...auditEvents, ...AGENT_EVENTS].slice(0, 6);
  const funnel = [["Universe", 1284], ["Screened", 428], ["Qualified", 143], ["Priority", 37], ["Contacted", 21], ["Dialogue", 12], ["Diligence", 3], ["IC", 1]];
  const liveAttention = ws.events.filter((e) => e.severity === "critical" || e.severity === "review").slice(0, 3).map((e) => ({ p: e.severity, t: `${e.deal}: ${e.title}`, d: `${e.detail}${e.page ? ` (${e.source}, p.${e.page})` : ` (${e.source})`}`, action: () => go("cim"), cta: "Open document" }));
  const attention = [...liveAttention,
    { p: "critical", t: "Project Falcon", d: "Customer concentration increased from 31% to 44% in the latest data-room update.", action: () => go("diligence"), cta: "Open diligence" },
    { p: "review", t: "Apex Motion Systems", d: "Founder announced a succession planning initiative at an industry panel.", action: () => openCompany("ams"), cta: "Open company" },
    { p: "active", t: "Precision MedTech Solutions", d: "New target surfaced at fit 91. Awaiting deal team decision on priority.", action: () => openCompany("pms"), cta: "Review fit" },
  ].slice(0, 3);
  return (
    <div>
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div style={{ color: T.muted, fontSize: 12 }}>Good morning</div>
          <div className="flex items-center gap-3"><h1 className="tracking-tight" style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: 0, lineHeight: 1.2 }}>Investment Command Center</h1><Demo>Synthetic demo</Demo></div>
          <p style={{ color: T.muted, fontSize: 13, margin: "4px 0 0" }}>One view across sourcing, active opportunities, diligence and portfolio.</p>
        </div>
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr 1.3fr", marginBottom: 24 }}>
        <Metric k="Qualified targets" v="143" />
        <Metric k="Active opportunities" v="12" />
        <Metric k="Deals in diligence" v="3" />
        <Metric k="Investment committee" v="1" sub="Project Falcon, Oct 2" />
        <Card className="py-2">
          <Metric secondary k="Companies monitored" v="1,284" />
          <Metric secondary k="Active theses" v="6" />
          <div className="flex items-baseline justify-between py-2"><span style={{ color: T.muted, fontSize: 12 }}>Research hours saved (est.)</span><span className="tabular-nums font-semibold" style={{ color: T.text, fontSize: 15 }}>184</span></div>
        </Card>
      </div>

      <Card style={{ marginBottom: 24 }}>
        <SectionTitle right={<span style={{ color: T.muted, fontSize: 12 }}>{ws.events.length ? `${ws.events.length} intelligence events this session` : "3 items require review"}</span>}>Needs attention</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          {attention.map((a, ai) => (
            <button key={ai} onClick={a.action} className="text-left p-4" style={{ background: PRI[a.p][1], borderRadius: R.card, transition: EASE }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
              <Pri p={a.p} />
              <div className="mt-2" style={{ color: T.text, fontSize: 14, fontWeight: 600 }}>{a.t}</div>
              <div style={{ color: T.muted, fontSize: 12, marginTop: 4, lineHeight: 1.5 }}>{a.d}</div>
              <div className="flex items-center gap-1 mt-3" style={{ color: PRI[a.p][0], fontSize: 12, fontWeight: 500 }}>{a.cta} <ArrowRight size={12} /></div>
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom: 24 }}>
        <SectionTitle right={<span style={{ color: T.muted, fontSize: 12 }}>Click a stage to open it</span>}>Pipeline</SectionTitle>
        <div className="flex items-end gap-1">
          {funnel.map(([s, n], i) => {
            const prev = i ? funnel[i - 1][1] : null;
            const conv = prev ? Math.round((n / prev) * 100) : null;
            const h = 12 + Math.round(Math.log10(n + 1) * 22);
            return (
              <button key={s} onClick={() => { setStageFilter(s === "Qualified" ? "MCM Fit" : s === "Dialogue" ? "Active Dialogue" : s); go(i >= 6 ? "pipeline" : "discovery"); }} className="flex-1 text-left hover:opacity-90" style={{ minWidth: 0 }}>
                <div style={{ height: h, borderRadius: "8px 8px 3px 3px", background: i >= 6 ? T.accent : `rgba(36,90,145,${0.22 + i * 0.1})`, transition: EASE }} />
                <div className="pt-2">
                  <div style={{ color: T.muted, fontSize: 11 }}>{s}</div>
                  <div className="tabular-nums" style={{ color: T.text, fontSize: 18, fontWeight: 650 }}>{n.toLocaleString()}</div>
                  <div className="tabular-nums" style={{ color: T.muted, fontSize: 11 }}>{conv != null ? `${conv}% of prior` : "monitored"}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card pad={false} className="col-span-2">
          <div className="px-4 pt-4"><SectionTitle>Active investment theses</SectionTitle></div>
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Thesis", "Status", "Targets", "Qualified", "Owner", "Updated"].map((h, i) => <th key={h} className={`font-medium px-4 py-1.5 ${i === 2 || i === 3 ? "text-right" : "text-left"}`} style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
            <tbody>
              {THESES.map((t) => (
                <tr key={t.name} className="hover:bg-stone-50 cursor-pointer" onClick={() => go("thesis")} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <td className="px-4 py-2.5 font-medium" style={{ color: T.text }}>{t.name}</td>
                  <td className="px-4 py-2.5"><Pri p={t.status === "Active" ? "healthy" : "review"} label={t.status} /></td>
                  <td className="px-4 py-2.5 tabular-nums text-right">{t.targets}</td>
                  <td className="px-4 py-2.5 tabular-nums text-right">{t.qualified}</td>
                  <td className="px-4 py-2.5" style={{ color: T.muted }}>{t.owner}</td>
                  <td className="px-4 py-2.5" style={{ color: T.muted }}>{t.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card>
          <SectionTitle right={<span style={{ color: T.muted, fontSize: 11 }}>{ws.audit.length ? "Session and demo events" : "Demo events"}</span>}>Activity</SectionTitle>
          <div className="space-y-3">
            {events.map((e, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 flex items-center justify-center shrink-0" style={{ background: e.kind === "human" ? T.greenSoft : T.accentSoft, color: e.kind === "human" ? T.green : T.accent, borderRadius: 9 }}><e.icon size={13} strokeWidth={1.7} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><span className="font-medium" style={{ color: T.text, fontSize: 12.5 }}>{e.agent}</span><span className="tabular-nums" style={{ color: T.muted, fontSize: 11 }}>{e.time}</span></div>
                  <div style={{ color: T.muted, fontSize: 12 }}>{e.text}</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => go("agents")} className="mt-3 flex items-center gap-1" style={{ color: T.accent, fontSize: 12 }}>View architecture <ArrowRight size={12} /></button>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Thesis Builder ---------- */
function demoThesisAnalysis(form) {
  return {
    thesis_summary: `${form.name}: ${form.rationale.split(".")[0]}.`,
    why_attractive: ["Outsourcing of validated component manufacturing continues to grow as OEMs concentrate on design and regulatory work.", "Certified suppliers with process validation history are rarely switched mid-program.", "Fragmented supplier base with many founder-owned businesses approaching transition."],
    what_could_invalidate: ["OEM insourcing of high-volume programs.", "Pricing pressure from larger contract manufacturers consolidating the space.", "Commodity molders mis-classified as precision suppliers inflate the universe."],
    screening_criteria: ["Revenue $8M-$50M and EBITDA $1.5M-$6M", "Manufacturing gross margin above 30%", "Certified, validated processes (ISO 13485 or equivalent)", "Founder or family ownership"],
    risk_exclusions: form.exclusions,
    diligence_questions: ["What share of revenue is under multi-year program agreements?", "How many qualified programs were lost in the last three years and why?", "What is the certification and validation renewal calendar?"],
    market_signals: ["OEM capex announcements in diagnostics and drug delivery.", "Reshoring of component supply from Asia.", "Hiring activity at competing precision molders."],
    research_plan: ["Build the universe from certification registries and trade directories", "Score each company against the criteria", "Prioritize founder-owned businesses with recent expansion or succession signals"],
    important_assumptions: ["Screening financials are external estimates until company data is received", "Certification status is current"],
    confidence: "medium",
    company_scores: COMPANIES.map((c) => ({ id: c.id, fit: c.fit, rationale: c.signal, confidence: c.conf.toLowerCase() })),
  };
}
function ThesisBuilder({ go, setThesisCtx }) {
  const { ws, saveThesisVersion, setLiveScores, audit } = useWorkspace();
  const [form, setForm] = useState({
    name: "Medical Device Precision Components",
    rationale: "Medical device OEMs continue to outsource highly engineered polymer and machined components to certified specialists. Suppliers with ISO 13485 certification, validated processes and tight-tolerance capability enjoy multi-year program lock-in and switching costs. Many are founder-owned, technically excellent and commercially under-developed, which matches MCM's value-creation playbook.",
    endMarkets: "Medical Device, Life Sciences", type: "Niche Manufacturer", revMin: "$8M", revMax: "$50M", ebMin: "$1.5M", ebMax: "$6M", gm: "30%+", geo: "United States",
    required: ["Highly engineered components", "Mission-critical applications", "Strong switching costs", "Recurring customer relationships"],
    exclusions: ["Extreme customer concentration", "Commodity manufacturing", "Declining end markets", "Weak margins"],
  });
  const [caps, setCaps] = useState({ "Injection molding": true, "Precision machining": true, "Specialty polymers": true, "Cleanroom manufacturing": true });
  const [phase, setPhase] = useState("idle");
  const [result, setResult] = useState(null);
  const [source, setSource] = useState("demo");
  const [meta, setMeta] = useState(null);
  const [liveErr, setLiveErr] = useState(null);
  const [savedId, setSavedId] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const thesisText = () => `Name: ${form.name}\nRationale: ${form.rationale}\nEnd markets: ${form.endMarkets}. Company type: ${form.type}. Revenue ${form.revMin}-${form.revMax}. EBITDA ${form.ebMin}-${form.ebMax}. Gross margin ${form.gm}. Geography ${form.geo}.\nCapabilities: ${Object.keys(caps).filter((k) => caps[k]).join(", ")}.\nRequired characteristics: ${form.required.join("; ")}.\nRisk exclusions: ${form.exclusions.join("; ")}.\n${thesisContextText(form.name)}`;
  const universeText = () => COMPANIES.map((c) => `- id=${c.id} | ${c.name} | ${c.sector} | ${c.loc} | ${c.own} | revenue ${money(c.rev)} (est.) | EBITDA ${money(c.ebitda)} (est.) | GM ${pct(c.gm)} (est.) | employees ~${c.emp} | signal: ${c.signal} | screening risk: ${c.risk} | relationship: ${c.rel}`).join("\n");
  const run = async () => {
    setPhase("running"); setLiveErr(null); setSavedId(null);
    audit({ actor: "M. Ahmed", kind: "human", action: "Analyzed thesis", subject: form.name });
    const res = await analyzeThesis({ thesis: thesisText(), universe: universeText() }, { fallback: () => demoThesisAnalysis(form) });
    setResult(res.data); setSource(res.source); setMeta(res.meta); setLiveErr(res.error || null); setPhase("done");
    audit({ actor: res.source === "live" ? "Claude analysis" : "Demo analysis", kind: res.source === "live" ? "ai" : "system", action: `Thesis analysis ${res.source === "live" ? "completed" : "loaded (fallback)"}`, subject: form.name, detail: `${res.data.company_scores.length} companies scored` });
  };
  const scores = result ? result.company_scores.filter((s) => COMPANIES.some((c) => c.id === s.id)) : [];
  const matches = scores.filter((s) => s.fit >= 75).length, priority = scores.filter((s) => s.fit >= 85).length;
  const save = () => {
    const id = saveThesisVersion({ name: form.name, source, input: { ...form, caps }, result });
    setSavedId(id);
    audit({ actor: "M. Ahmed", kind: "human", action: "Saved thesis version", subject: `${form.name} ${id}` });
  };
  const openTargets = () => {
    const map = {}; scores.forEach((s) => { map[s.id] = { fit: s.fit, rationale: s.rationale, confidence: s.confidence, thesis: form.name, source, versionId: savedId }; });
    setLiveScores(map);
    setThesisCtx && setThesisCtx(form.name);
    go("discovery");
  };
  const Field = ({ label, children }) => <div className="mb-3"><div className="text-xs font-medium mb-1" style={{ color: T.muted }}>{label}</div>{children}</div>;
  const inp = { className: "w-full text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200", style: { border: `1px solid ${T.border}`, color: T.text, borderRadius: R.ctl, transition: EASE } };
  const Chips = ({ items, color }) => <div className="flex flex-wrap gap-1.5">{items.map((i) => <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: color === "red" ? T.redSoft : T.accentSoft, color: color === "red" ? T.red : T.accent }}>{i}</span>)}</div>;
  const sections = result ? [["Why this market may be attractive", result.why_attractive], ["What could invalidate the thesis", result.what_could_invalidate], ["Key screening criteria", result.screening_criteria], ["Risk exclusions", result.risk_exclusions], ["Key diligence questions", result.diligence_questions], ["Market signals to monitor", result.market_signals], ["Research plan", result.research_plan], ["Important assumptions", result.important_assumptions]] : [];
  return (
    <div>
      <PageHeader title="Investment Thesis Builder" sub="Translate MCM investment strategy into a researchable, testable sourcing thesis." crumbs={["Sourcing", "Thesis Builder"]} demo="Synthetic universe" />
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-2">
          <Field label="Thesis name"><input value={form.name} onChange={set("name")} {...inp} /></Field>
          <Field label="Investment rationale"><textarea value={form.rationale} onChange={set("rationale")} rows={5} {...inp} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="End markets"><input value={form.endMarkets} onChange={set("endMarkets")} {...inp} /></Field>
            <Field label="Company type"><input value={form.type} onChange={set("type")} {...inp} /></Field>
            <Field label="Revenue"><div className="flex gap-2"><input value={form.revMin} onChange={set("revMin")} {...inp} /><input value={form.revMax} onChange={set("revMax")} {...inp} /></div></Field>
            <Field label="EBITDA"><div className="flex gap-2"><input value={form.ebMin} onChange={set("ebMin")} {...inp} /><input value={form.ebMax} onChange={set("ebMax")} {...inp} /></div></Field>
            <Field label="Gross margin"><input value={form.gm} onChange={set("gm")} {...inp} /></Field>
            <Field label="Geography"><input value={form.geo} onChange={set("geo")} {...inp} /></Field>
          </div>
          <Field label="Capabilities">
            <div className="flex flex-wrap gap-2">{Object.keys(caps).map((c) => <label key={c} className="flex items-center gap-1.5 text-sm" style={{ color: T.text }}><input type="checkbox" checked={caps[c]} onChange={() => setCaps({ ...caps, [c]: !caps[c] })} /> {c}</label>)}</div>
          </Field>
          <Field label="Required characteristics"><Chips items={form.required} /></Field>
          <Field label="Risk exclusions"><Chips color="red" items={form.exclusions} /></Field>
          <div className="flex items-center gap-2">
            <Btn primary icon={phase === "running" ? Loader2 : Play} onClick={run} disabled={phase === "running"}>{phase === "running" ? "Analyzing thesis" : result ? "Re-analyze thesis" : "Analyze thesis and score universe"}</Btn>
          </div>
          {ws.thesisVersions.length > 0 && (
            <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${T.border}` }}>
              <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Saved versions this session</div>
              {ws.thesisVersions.map((v) => <button key={v.id} onClick={() => { setForm({ ...form, ...v.input }); setCaps(v.input.caps || caps); setResult(v.result); setSource(v.source); setPhase("done"); setSavedId(v.id); }} className="w-full text-left flex items-center justify-between py-1.5 hover:bg-stone-50 rounded-lg px-1" style={{ fontSize: 12 }}><span style={{ color: T.text }}><span className="tabular-nums font-medium">{v.id}</span> · {v.name}</span><span style={{ color: T.muted }}>{new Date(v.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {v.source}</span></button>)}
            </div>
          )}
        </Card>
        <div className="col-span-3 space-y-4">
          {phase === "idle" && (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <Radar size={28} style={{ color: T.muted }} />
              <div className="text-sm font-medium mt-3" style={{ color: T.text }}>No analysis yet</div>
              <div className="text-xs mt-1 max-w-sm" style={{ color: T.muted }}>Analyze the thesis to evaluate its logic, then score every company in the synthetic universe against it. Results flow into Target Discovery.</div>
            </Card>
          )}
          {phase === "running" && <Card><ProcessingStages stages={["Reading thesis criteria", "Evaluating market logic", "Scoring the synthetic universe", "Preparing research plan"]} label="Analyzing thesis..." /><div className="mt-4 space-y-2"><Skeleton /><Skeleton w="80%" /><Skeleton w="60%" /></div></Card>}
          {phase === "done" && result && (
            <>
              <LiveBanner source={source} error={liveErr} onRetry={run} meta={meta} />
              <div className="grid grid-cols-3 gap-3">
                {[["Companies in synthetic universe", COMPANIES.length], ["Potential MCM matches (fit 75+)", matches], ["High-priority targets (fit 85+)", priority]].map(([k, v]) => (
                  <Card key={k}><div className="text-xs" style={{ color: T.muted }}>{k}</div><div className="text-xl font-semibold tabular-nums mt-0.5" style={{ color: T.text }}>{v}</div></Card>
                ))}
              </div>
              <Card>
                <SectionTitle right={<span className="text-xs" style={{ color: T.muted }}>Confidence <b style={{ color: result.confidence === "high" ? T.green : T.amber }}>{result.confidence}</b></span>}>Thesis analysis</SectionTitle>
                <p className="text-sm mb-3" style={{ color: T.text, lineHeight: 1.6 }}>{result.thesis_summary}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {sections.map(([h, items]) => (
                    <div key={h}>
                      <div className="text-xs font-medium mb-1" style={{ color: T.accent }}>{h}</div>
                      <ul className="list-disc pl-4 space-y-1" style={{ color: T.text, fontSize: 13 }}>{(items || []).map((i, n) => <li key={n}>{i}</li>)}</ul>
                    </div>
                  ))}
                </div>
              </Card>
              <Card pad={false}>
                <div className="px-4 pt-4"><SectionTitle right={<span className="text-xs" style={{ color: T.muted }}>Scored against this thesis</span>}>Company scores</SectionTitle></div>
                <table className="w-full text-xs"><thead><tr style={{ color: T.muted }}>{["Company", "Fit", "Confidence", "Rationale"].map((h) => <th key={h} className="text-left font-medium px-4 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
                  <tbody>{[...scores].sort((a, b2) => b2.fit - a.fit).map((s) => { const c = COMPANIES.find((x) => x.id === s.id); return <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}` }}><td className="px-4 py-1.5 font-medium" style={{ color: T.text }}>{c.name}<span className="ml-2" style={{ color: T.muted, fontWeight: 400 }}>{c.sector}</span></td><td className="px-4 py-1.5"><FitBadge v={s.fit} /></td><td className="px-4 py-1.5"><Conf v={s.confidence[0].toUpperCase() + s.confidence.slice(1)} /></td><td className="px-4 py-1.5" style={{ color: T.muted }}>{s.rationale}</td></tr>; })}</tbody></table>
                <div className="px-4 py-3 flex gap-2" style={{ borderTop: `1px solid ${T.border}` }}>
                  <Btn primary icon={Radar} onClick={openTargets}>Open {priority} priority targets in Target Discovery</Btn>
                  <Btn onClick={save} disabled={Boolean(savedId)}>{savedId ? `Saved as ${savedId}` : "Save thesis version"}</Btn>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Target Discovery ---------- */
function TargetDiscovery({ openCompany, stageFilter, companiesMode, thesisCtx, clearCtx }) {
  const { ws } = useWorkspace();
  const live = ws.liveScores || {};
  const scored = (c) => (live[c.id] ? { ...c, fit: live[c.id].fit, liveScore: live[c.id] } : c);
  const [q, setQ] = useState("");
  const [thesis, setThesis] = useState(thesisCtx || "All");
  const [sector, setSector] = useState("All");
  const [minFit, setMinFit] = useState(0);
  const [own, setOwn] = useState("All");
  const [sort, setSort] = useState({ k: "fit", d: -1 });
  const [loading, setLoading] = useState(true);
  const [more, setMore] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 450); return () => clearTimeout(t); }, []);
  useEffect(() => { if (thesisCtx) setThesis(thesisCtx); }, [thesisCtx]);
  const rows = useMemo(() => {
    let r = COMPANIES.map(scored).filter((c) => (thesis === "All" || c.thesis === thesis || Boolean(live[c.id])) && (sector === "All" || c.sector === sector) && c.fit >= minFit && (own === "All" || c.own === own) && (c.name + c.loc + c.signal).toLowerCase().includes(q.toLowerCase()));
    if (stageFilter === "Priority") r = r.filter((c) => c.fit >= 85);
    if (stageFilter === "Contacted" || stageFilter === "Active Dialogue") r = r.filter((c) => c.rel !== "No relationship");
    return [...r].sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : -1) * sort.d);
  }, [q, thesis, sector, minFit, own, sort, stageFilter, ws.liveScores]);
  const Sel = ({ label, v, set, opts }) => (
    <select value={v} onChange={(e) => set(e.target.value)} className="bg-white" style={{ fontSize: 13, padding: "6px 10px", borderRadius: R.chip, border: `1px solid ${T.border}`, color: v === "All" ? T.muted : T.text }}>{opts.map((o) => <option key={o}>{o === "All" ? label : o}</option>)}</select>
  );
  const Th = ({ label, k, right, w }) => (
    <th className={`font-medium px-4 py-2 sticky top-0 bg-white select-none ${right ? "text-right" : "text-left"} ${k ? "cursor-pointer" : ""}`} style={{ borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 11, width: w }} onClick={() => k && setSort({ k, d: sort.k === k ? -sort.d : -1 })}>
      <span className="inline-flex items-center gap-1">{label}{k && <ArrowUpDown size={10} style={{ opacity: sort.k === k ? 1 : 0.35 }} />}</span>
    </th>
  );
  const qualified = COMPANIES.filter((c) => c.fit >= 75).length, priority = COMPANIES.filter((c) => c.fit >= 85).length;
  return (
    <div>
      <PageHeader title={companiesMode ? "Companies" : "Target Discovery"} sub={companiesMode ? "All monitored companies in the demo universe." : "Identify and qualify targets against active investment theses."} crumbs={["Sourcing", companiesMode ? "Companies" : "Target Discovery"]} demo="12 synthetic companies" />
      {(thesisCtx || (stageFilter && stageFilter !== "Universe")) && !companiesMode && (
        <div className="flex items-center justify-between px-4 py-2" style={{ background: T.accentSoft, color: T.accent, borderRadius: 10, marginBottom: 16, fontSize: 12 }}>
          <span className="flex items-center gap-2"><Lightbulb size={12} />{thesisCtx ? `Showing targets scored under the ${thesisCtx} thesis${Object.keys(live).length ? ` (${Object.values(live)[0].source === "live" ? "live" : "demo"} scores from the latest analysis)` : ""}` : `Pipeline stage: ${stageFilter}`}</span>
          <button onClick={() => { setThesis("All"); clearCtx && clearCtx(); }} className="underline">Show all</button>
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 16 }}>
        <span className="flex items-center gap-2 px-4 bg-white" style={{ border: `1px solid ${T.border}`, borderRadius: R.chip, width: 300 }}><Search size={13} style={{ color: T.muted }} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Company, location or signal" className="flex-1 outline-none" style={{ fontSize: 13, padding: "6px 0", color: T.text }} /></span>
        <Sel label="Thesis" v={thesis} set={setThesis} opts={["All", "Medical Device Precision Components", "Aerospace Precision Components", "Engineered Thermal Management", "Specialty Industrial Distribution"]} />
        <Sel label="Sector" v={sector} set={setSector} opts={["All", ...new Set(COMPANIES.map((c) => c.sector))]} />
        <Sel label="Ownership" v={own} set={setOwn} opts={["All", "Founder-owned", "Family-owned", "PE-backed"]} />
        <span className="flex items-center gap-2 px-4 bg-white" style={{ border: `1px solid ${T.border}`, borderRadius: R.chip, fontSize: 12, color: T.muted, height: 34 }}>Fit <input type="range" min={0} max={95} value={minFit} onChange={(e) => setMinFit(+e.target.value)} style={{ width: 90 }} /><span className="tabular-nums" style={{ color: T.text, width: 18 }}>{minFit}</span></span>
        <Btn icon={Filter} onClick={() => setMore(!more)}>More filters (6)</Btn>
        <Btn icon={Download} onClick={() => downloadWorkbook("mcm-target-discovery.xlsx", [{ name: "Targets", columns: ["Company", "Sector", "Location", "Ownership", "Revenue (est.)", "EBITDA (est.)", "Gross margin (est.)", "Fit", "Fit basis", "Confidence", "Relationship", "Primary signal", "Risk", "Thesis", "Financial status"], rows: rows.map((c) => ({ Company: c.name, Sector: c.sector, Location: c.loc, Ownership: c.own, "Revenue (est.)": money(c.rev), "EBITDA (est.)": money(c.ebitda), "Gross margin (est.)": pct(c.gm), Fit: c.fit, "Fit basis": c.liveScore ? (c.liveScore.source === "live" ? "Live thesis analysis" : "Thesis analysis (demo)") : "Screening", Confidence: c.conf, Relationship: c.rel, "Primary signal": c.signal, Risk: c.risk, Thesis: c.thesis, "Financial status": "Estimated (external models)" })) }], { dataStatus: `Synthetic universe · ${rows.length} rows · filters applied` })}>Export XLSX</Btn>
        <span className="ml-auto flex items-center gap-6">
          <Stat label="Qualified" value={qualified} />
          <Stat label="Priority" value={priority} />
        </span>
      </div>
      {more && (
        <div className="flex items-center gap-2 flex-wrap p-3" style={{ background: T.soft, borderRadius: 12, marginBottom: 16 }}>
          {["Revenue", "EBITDA", "Geography", "Relationship", "Last contact", "Risk"].map((f) => <span key={f} className="bg-white" style={{ fontSize: 12, padding: "5px 10px", borderRadius: 6, border: `1px solid ${T.border}`, color: T.muted }}>{f}: Any</span>)}
          <span style={{ fontSize: 11, color: T.muted, marginLeft: 8 }}>Additional filters are illustrative in this prototype.</span>
        </div>
      )}
      <Card pad={false} className="overflow-hidden">
        <div className="overflow-auto" style={{ maxHeight: 600 }}>
          <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
            <thead>
              <tr>
                <Th label="Company" k="name" w={260} />
                <Th label="Revenue" k="rev" right /><Th label="EBITDA" k="ebitda" right /><Th label="GM" k="gm" right />
                <Th label="MCM fit" k="fit" w={140} /><Th label="Confidence" />
                <Th label="Relationship" /><Th label="Signal" />
              </tr>
            </thead>
            <tbody>
              {loading ? [1, 2, 3, 4, 5, 6].map((i) => <tr key={i}><td colSpan={8} className="px-4 py-3"><Skeleton h={14} /></td></tr>) :
                rows.map((c) => (
                  <tr key={c.id} onClick={() => openCompany(c.id)} className="cursor-pointer group" style={{ background: "#fff" }} onMouseEnter={(e) => e.currentTarget.style.background = T.accentSoft + "66"} onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}>
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                      <div className="font-semibold leading-tight" style={{ color: T.text, fontSize: 13.5 }}>{c.name}</div>
                      <div className="leading-tight" style={{ color: T.muted, fontSize: 12, marginTop: 2 }}>{c.sector} · {c.loc}</div>
                      <div className="leading-tight" style={{ color: c.own === "PE-backed" ? T.amber : T.muted, fontSize: 11.5, marginTop: 1 }}>{c.own}</div>
                    </td>
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}><Num>{money(c.rev)}</Num></td>
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}><Num>{money(c.ebitda)}</Num></td>
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}><Num color={c.gm < 30 && !c.sector.includes("Distribution") ? T.amber : undefined}>{pct(c.gm)}</Num></td>
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}><FitBadge v={c.fit} />{c.liveScore && <div title={c.liveScore.rationale} style={{ fontSize: 10.5, color: c.liveScore.source === "live" ? T.green : T.unknown, marginTop: 2 }}>{c.liveScore.source === "live" ? "Live score" : "Thesis score"}</div>}</td>
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}><Conf v={c.conf} /></td>
                    <td className="px-4 py-2.5 whitespace-nowrap" style={{ borderBottom: `1px solid ${T.border}`, color: c.rel === "No relationship" ? T.unknown : T.text, fontSize: 12.5 }}>{c.rel}</td>
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}`, color: T.muted, fontSize: 12.5 }}><span className="flex items-center justify-between gap-2">{c.signal}<ChevronRight size={12} className="opacity-0 group-hover:opacity-100 shrink-0" style={{ color: T.accent }} /></span></td>
                  </tr>
                ))}
              {!loading && rows.length === 0 && <tr><td colSpan={8} className="px-4 py-10 text-center" style={{ color: T.muted }}>No companies match these filters. Widen the fit range or clear the thesis filter.</td></tr>}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 flex items-center justify-between" style={{ color: T.muted, fontSize: 11, borderTop: `1px solid ${T.border}` }}>
          <span>{rows.length} of {COMPANIES.length} companies. Fit bands: 90 to 100 Strong, 75 to 89 Potential, below 75 Monitor.</span>
          <span>Financials are external estimates until company data is received.</span>
        </div>
      </Card>
    </div>
  );
}

/* ---------- Company analysis: demo fallback + context builders ---------- */
const DIM_LABELS = [["financial_fit", "Financial fit"], ["strategic_fit", "Strategic fit"], ["technical_differentiation", "Technical differentiation"], ["end_market_fit", "End market"], ["ownership_fit", "Ownership"], ["commercial_opportunity", "Commercial opportunity"], ["risk_profile", "Risk profile"]];
function demoCompanyAnalysis(c) {
  const isPMS = c.id === "pms";
  const base = { financial_fit: 95, strategic_fit: 94, technical_differentiation: 89, end_market_fit: 92, ownership_fit: 90, commercial_opportunity: 88, risk_profile: 76 };
  const shift = c.fit - 91;
  const dims = Object.fromEntries(Object.entries(base).map(([k, v]) => [k, Math.max(40, Math.min(99, v + shift))]));
  return {
    summary: isPMS ? "Precision MedTech Solutions appears to represent a strong fit with MCM's medical and highly engineered component strategy. The company manufactures tight-tolerance polymer and machined components for diagnostic and drug-delivery OEMs, holds an active ISO 13485 certificate, and expanded its Cleveland facility in 2024. Estimated financials sit inside MCM's range with gross margin above the 30% manufacturing threshold. The founder retains full ownership and recently discussed succession, which may indicate openness to a partner. The open questions are customer concentration, management depth and current capacity utilization. None is a confirmed negative; each requires a management conversation." : `${c.name} screens as a ${c.fit >= 85 ? "priority" : "potential"} target under the ${c.thesis} thesis. Estimated revenue of ${money(c.rev)} and EBITDA of ${money(c.ebitda)} are within MCM's published range and gross margin is ${pct(c.gm)}. The primary signal is ${c.signal.toLowerCase()}; the primary open risk is ${c.risk.toLowerCase()}. Estimates are external until company data is received.`,
    confidence: c.conf.toLowerCase(),
    recommendation: c.fit >= 85 ? "prioritize" : c.fit >= 75 ? "research_further" : "monitor",
    fit_dimensions: dims,
    supports_thesis: [
      { text: "Revenue within $8M-$50M", status: "estimated", confidence: "medium", source: money(c.rev) },
      { text: "EBITDA within $1.5M-$6M", status: "estimated", confidence: "medium", source: money(c.ebitda) },
      { text: c.gm >= 30 ? "Gross margin above 30%" : "Gross margin near threshold", status: "estimated", confidence: "medium", source: pct(c.gm) },
      ...(isPMS ? [
        { text: "Medical end market", status: "confirmed", confidence: "high", source: "Diagnostics, drug delivery" },
        { text: "Highly engineered components", status: "confirmed", confidence: "high", source: "Tolerances to 0.0005 in" },
        { text: "Founder ownership", status: "confirmed", confidence: "high", source: "100%" },
        { text: "Mission-critical applications", status: "confirmed", confidence: "high", source: "Instrument components" },
        { text: "Commercial expansion potential", status: "inferred", confidence: "medium", source: "VP Sales hired 2025" },
      ] : [
        { text: `${c.sector} end market`, status: "confirmed", confidence: "high", source: "Screening record" },
        { text: `${c.own} business`, status: "confirmed", confidence: "high", source: "Screening record" },
        { text: c.signal, status: "inferred", confidence: "medium", source: "Primary signal" },
      ]),
    ],
    risks: isPMS ? [{ text: "Largest customer estimated at 28%-35% of revenue", status: "inferred", confidence: "medium", severity: "medium", source: "Job postings, shipment pattern; threshold 40%" }] : [{ text: c.risk, status: "inferred", confidence: "low", severity: "medium", source: "Screening record" }],
    unknowns: isPMS ? [{ text: "Management succession plan", how_to_resolve: "Ask founder" }, { text: "Capacity utilization", how_to_resolve: "Site visit" }, { text: "Historical EBITDA", how_to_resolve: "Company financials" }] : [{ text: "Historical financials", how_to_resolve: "Request teaser or company data" }, { text: "Management depth", how_to_resolve: "First meeting" }],
    next_actions: isPMS ? ["Identify a warm introduction path to the founder", "Ask about customer concentration directly in the first conversation", "Request a site visit to assess capacity"] : ["Confirm financial estimates with company data", "Identify the decision maker and a warm path"],
  };
}
function fitFromDims(d) { const ks = Object.keys(d); return Math.round(ks.reduce((s, k) => s + (Number(d[k]) || 0), 0) / ks.length); }
function companyContextText(c) {
  return `${c.name}. Sector: ${c.sector}. Location: ${c.loc}. Ownership: ${c.own}. Employees ~${c.emp}. Screening estimates from external models (not company data): revenue ${money(c.rev)}, EBITDA ${money(c.ebitda)}, gross margin ${pct(c.gm)}. Relationship: ${c.rel}. Primary signal: ${c.signal}. Primary open risk flagged at screening: ${c.risk}.${c.id === "pms" ? " Certifications: ISO 13485 active (expiry 2027). Founded 2004; facility expansion 2024; VP Sales hired 2025; founder discussed succession at a 2026 industry panel." : ""}`;
}
function thesisContextText(name) {
  return `${name}. MCM acquisition criteria: revenue $8M-$50M; EBITDA $1.5M-$6M; manufacturing gross margin 30%+ (value-added distribution 20%+); US; majority/control investments in entrepreneurially led companies. Attractive characteristics: highly engineered or mission-critical components, defensible technical capability, high switching costs, strong customer relationships, opportunity to improve business development. Screening rules: customer concentration above 40% without a multi-year agreement is a risk; commodity manufacturing, declining end markets and weak margins are exclusions. Missing data is a gap, never a risk.`;
}
function evidenceContextText(c) {
  return c.id === "pms" ? EVIDENCE.map((e) => `- ${e.claim} [${e.level}; confidence ${e.conf}; sources: ${e.src.length ? e.src.join("; ") : "none"}]`).join("\n") : "- No evidence items collected yet beyond the screening facts.";
}
const RECO_LABEL = { prioritize: "Prioritize", research_further: "Research further", monitor: "Monitor", pass: "Pass" };
const STAGES_COMPANY = ["Reviewing thesis criteria", "Checking known evidence", "Evaluating strategic fit", "Identifying unresolved questions", "Preparing recommendation"];

function ProcessingStages({ stages, label }) {
  const [i, setI] = useState(0);
  useEffect(() => { const t = setInterval(() => setI((x) => Math.min(x + 1, stages.length - 1)), 1400); return () => clearInterval(t); }, [stages.length]);
  return (
    <div className="p-4" style={{ background: T.accentSoft, borderRadius: 12 }}>
      <div className="flex items-center gap-2" style={{ fontSize: 13, fontWeight: 600, color: T.accent }}><Loader2 size={14} className="animate-spin" /> {label}</div>
      <div className="mt-2 space-y-1">{stages.map((s, j) => <div key={s} className="flex items-center gap-2" style={{ fontSize: 12, color: j < i ? T.green : j === i ? T.text : T.muted }}>{j < i ? <CheckCircle2 size={12} /> : <span className="w-3 h-3 rounded-full inline-block" style={{ border: `1px solid ${j === i ? T.accent : T.border}` }} />}{s}</div>)}</div>
      <div className="mt-2" style={{ fontSize: 11, color: T.muted }}>One structured request. Stages describe the work, not separate agents.</div>
    </div>
  );
}
function LiveBanner({ source, error, onRetry, meta }) {
  if (error) {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2 mb-3" style={{ background: T.amberSoft, color: T.amber, borderRadius: 10, fontSize: 12 }}>
        <span>{error} Showing the synthetic demonstration analysis instead.</span>
        {onRetry ? <button onClick={onRetry} className="underline shrink-0">Retry live analysis</button> : null}
      </div>
    );
  }
  if (source === "live") {
    const lat = meta && meta.latencyMs ? ` · ${(meta.latencyMs / 1000).toFixed(1)}s` : "";
    const mod = meta && meta.model ? ` · ${meta.model}` : "";
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 mb-3" style={{ background: T.greenSoft, color: T.green, borderRadius: 10, fontSize: 12 }}>
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: T.green }} />Live analysis{mod}{lat}
      </div>
    );
  }
  return null;
}

/* Push questions into the diligence store from any module. */
function usePushToDiligence() {
  const { addQuestions, audit } = useWorkspace();
  return (list, createdBy, notify) => {
    const added = addQuestions(list.map((q) => ({ createdBy, ...q })));
    audit({ actor: "M. Ahmed", kind: "human", action: `Pushed ${added.length} question${added.length === 1 ? "" : "s"} to diligence`, subject: list[0]?.deal || "", detail: `Created by ${createdBy}` });
    if (notify) notify(added.length ? `${added.length} question${added.length === 1 ? "" : "s"} added to the diligence tracker.` : "Those questions are already in the tracker.");
    return added.length;
  };
}
const DEMO_QUESTIONS = [
  { deal: "Project Falcon", question: "What are the renewal terms and pricing mechanics with Customer A?", workstream: "Commercial", source: "CIM p.48", page: 48, severity: "high", status: "Open", owner: "C. Hren", createdBy: "Demo", createdAt: "2026-09-10T14:00:00Z", notes: "" },
  { deal: "Project Falcon", question: "Which of the $740K adjustments are truly non-recurring?", workstream: "Financial", source: "CIM p.71", page: 71, severity: "high", status: "In progress", owner: "K. Hayes", createdBy: "Demo", createdAt: "2026-09-10T14:00:00Z", notes: "QoE draft due Friday." },
  { deal: "Project Falcon", question: "What is the CEO's post-transaction role and timeline?", workstream: "Management", source: "CIM p.92", page: 92, severity: "medium", status: "Open", owner: "B. Kingsbury", createdBy: "Demo", createdAt: "2026-09-10T14:00:00Z", notes: "" },
];

/* ---------- Company Intelligence ---------- */
function CompanyIntelligence({ company, go, notify, openThesis }) {
  const c = company;
  const [tab, setTab] = useState("Overview");
  const { ws, setAnalysis, audit } = useWorkspace();
  const pushQ = usePushToDiligence();
  const stored = ws.analyses[c.id];
  const [running, setRunning] = useState(false);
  const [liveErr, setLiveErr] = useState(null);
  const [compare, setCompare] = useState(false);
  const [open, setOpen] = useState(null);
  const [decision, setDecision] = useState(null);
  const ran = Boolean(stored);
  const analysis = stored?.current?.data || demoCompanyAnalysis(c);
  const analysisSource = stored?.current?.source || "demo";
  const analysisMeta = stored?.current?.meta || null;
  const previous = stored?.previous?.data || null;
  const fit = stored ? fitFromDims(analysis.fit_dimensions) : c.fit;
  const confLabel = stored ? analysis.confidence[0].toUpperCase() + analysis.confidence.slice(1) : c.conf;
  const recoLabel = stored ? RECO_LABEL[analysis.recommendation] : c.fit >= 85 ? "Prioritize" : c.fit >= 75 ? "Research" : "Monitor";
  const run = async () => {
    setRunning(true); setLiveErr(null);
    audit({ actor: "M. Ahmed", kind: "human", action: "Ran company analysis", subject: c.name });
    const res = await analyzeCompany({ company: companyContextText(c), thesis: thesisContextText(c.thesis), evidence: evidenceContextText(c) }, { fallback: () => demoCompanyAnalysis(c) });
    setAnalysis(c.id, { data: res.data, source: res.source, meta: res.meta, at: new Date().toISOString() });
    audit({ actor: res.source === "live" ? "Claude analysis" : "Demo analysis", kind: res.source === "live" ? "ai" : "system", action: `Company analysis ${res.source === "live" ? "completed" : "loaded (fallback)"}`, subject: c.name, detail: `Fit ${fitFromDims(res.data.fit_dimensions)}, ${RECO_LABEL[res.data.recommendation]}` });
    setLiveErr(res.error || null);
    setRunning(false);
    notify(res.source === "live" ? "Live analysis complete." : "Analysis loaded.");
  };
  const breakdown = DIM_LABELS.map(([k, l]) => [l, analysis.fit_dimensions[k] ?? 0, previous ? previous.fit_dimensions[k] ?? null : null]);
  const isPMS = c.id === "pms";
  const tabs = ["Overview", "Investment Fit", "Financials", "Market", "People", "Relationship", "Evidence", "Agent Analysis"];
  const Fact = ({ k, v, level }) => (
    <div className="flex items-center justify-between py-1 text-xs gap-2" style={{ borderBottom: `1px solid ${T.border}` }}>
      <span style={{ color: T.muted }}>{k}</span>
      <span className="flex items-center gap-1.5 font-medium tabular-nums text-right" style={{ color: level === "unknown" ? T.unknown : T.text }}>{v}{level && <Level level={level} small />}</span>
    </div>
  );
  const finRows = [
    ["Revenue", money(c.rev - 2), money(c.rev), money(c.rev + 3), "Industry DB, headcount model, trade data", "estimated"],
    ["Gross margin", pct(c.gm - 3), pct(c.gm), pct(c.gm + 2), "Peer benchmark (8 companies)", "estimated"],
    ["EBITDA", money(c.ebitda - 0.6), money(c.ebitda), money(c.ebitda + 0.5), "Margin model on revenue midpoint", "estimated"],
    ["EBITDA margin", pct(((c.ebitda - 0.6) / (c.rev + 3)) * 100), pct((c.ebitda / c.rev) * 100), pct(((c.ebitda + 0.5) / (c.rev - 2)) * 100), "Derived", "estimated"],
    ["Employees", `~${c.emp - 10}`, `~${c.emp}`, `~${c.emp + 10}`, "LinkedIn and job postings", "inferred"],
    ["Revenue / employee", null, `$${Math.round((c.rev * 1000) / c.emp)}K`, null, "Derived", "estimated"],
    ["Revenue growth (3 yr)", null, "Not available", null, "Requires company data", "unknown"],
    ["Capex", null, "Not available", null, "Requires company data", "unknown"],
    ["Customer concentration", "28%", "31%", "35%", "Job postings, shipment pattern", "inferred"],
  ];
  return (
    <div>
      <div className="flex items-center gap-1 text-xs mb-2" style={{ color: T.muted }}>
        <span>Sourcing</span><ChevronRight size={12} /><button onClick={() => go("discovery")} className="hover:underline">Target Discovery</button><ChevronRight size={12} /><span style={{ color: T.text }}>{c.name}</span>
      </div>
      <Card pad={false} style={{ marginBottom: 24 }}>
        <div className="grid grid-cols-12">
          <div className="col-span-7 p-5" style={{ borderRight: `1px solid ${T.border}` }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="tracking-tight leading-tight" style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: 0 }}>{c.name}</h1>
                <div className="text-xs mt-0.5" style={{ color: T.muted }}>{isPMS ? "Precision medical-device components" : c.sector}. {c.loc}. {c.own}. ~{c.emp} employees.</div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {[c.sector, isPMS ? "ISO 13485" : null, c.own, "US"].filter(Boolean).map((t) => <span key={t} className="text-xs px-1.5 py-0.5 rounded-lg" style={{ border: `1px solid ${T.border}`, color: T.text }}>{t}</span>)}
                  <button onClick={() => openThesis && openThesis(c.thesis)} className="text-xs px-1.5 py-0.5 rounded-lg flex items-center gap-1" style={{ background: T.accentSoft, color: T.accent }}><Lightbulb size={11} /> {c.thesis}</button>
                </div>
              </div>
              <Demo>Synthetic demonstration company</Demo>
            </div>
            <div className="grid grid-cols-4 gap-x-4 mt-3">
              <Fact k="Est. revenue" v={money(c.rev)} level="estimated" />
              <Fact k="Est. EBITDA" v={money(c.ebitda)} level="estimated" />
              <Fact k="Est. gross margin" v={pct(c.gm)} level="estimated" />
              <Fact k="Relationship" v={c.rel === "No relationship" ? "No prior contact" : c.rel} level={c.rel === "No relationship" ? "unknown" : "confirmed"} />
            </div>
          </div>
          <div className="col-span-5 p-5 flex items-stretch gap-5">
            <div className="flex-1">
              <div className="text-xs" style={{ color: T.muted }}>MCM fit score</div>
              <div className="flex items-baseline gap-1"><span className="text-3xl font-semibold tabular-nums leading-none" style={{ color: fit >= 90 ? T.green : T.accent }}>{fit}</span><span className="text-xs" style={{ color: T.muted }}>/ 100</span>{previous && <span className="text-xs tabular-nums ml-1" style={{ color: fit - fitFromDims(previous.fit_dimensions) >= 0 ? T.green : T.amber }}>{fit - fitFromDims(previous.fit_dimensions) >= 0 ? "+" : ""}{fit - fitFromDims(previous.fit_dimensions)} vs previous</span>}</div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex flex-col"><span style={{ color: T.muted }}>Confidence</span><Conf v={confLabel} /></span>
                <span className="flex flex-col"><span style={{ color: T.muted }}>Recommendation</span><span className="font-semibold" style={{ color: fit >= 85 ? T.green : T.accent }}>{recoLabel}</span></span>
                <span className="flex flex-col"><span style={{ color: T.muted }}>Basis</span><span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: analysisSource === "live" ? T.greenSoft : T.unknownSoft, color: analysisSource === "live" ? T.green : T.unknown }}>{analysisSource === "live" ? "Live analysis" : ran ? "Demo analysis" : "Screening"}</span></span>
              </div>
            </div>
            <div className="w-60 p-3.5 flex flex-col justify-between" style={{ background: T.soft, borderRadius: 12 }}>
              <div>
                <div className="text-xs font-medium" style={{ color: T.text }}>Deal team decision</div>
                <div className="text-xs mb-2" style={{ color: T.muted }}>The score is a recommendation. Status changes only on a human decision.</div>
                {decision && <div className="text-xs mb-2 px-1.5 py-1 rounded-lg" style={{ background: T.greenSoft, color: T.green }}>Recorded: {decision} (M. Ahmed, today)</div>}
              </div>
              <div className="flex flex-col gap-1">
                <Btn primary onClick={() => { setDecision("Promote to Priority"); notify("Promoted to Priority. Relationship Agent will prepare introduction paths."); }}>Promote to Priority</Btn>
                <div className="flex gap-1"><Btn small onClick={() => { setDecision("Analyst review requested"); notify("Review request sent to deal team."); }}>Request review</Btn><Btn small onClick={() => { setDecision("Pass"); notify("Marked Pass. Reason required in CRM (conceptual)."); }}>Pass</Btn></div>
                <Btn small icon={running ? Loader2 : Play} onClick={run} disabled={running}>{running ? "Analyzing company" : ran ? "Re-run analysis" : "Run full analysis"}</Btn>
                {previous && <Btn small icon={GitCompare} onClick={() => setCompare(!compare)}>{compare ? "Hide comparison" : "Compare with previous"}</Btn>}
                <div className="flex gap-1"><Btn small icon={Download} onClick={() => { buildPdf({ filename: `company-brief-${c.id}.pdf`, title: `Company Intelligence Brief: ${c.name}`, subtitle: `${c.sector} · ${c.loc} · ${c.own} · Thesis: ${c.thesis}`, dataStatus: `Synthetic company · ${analysisSource === "live" ? "Live analysis" : ran ? "Demo analysis" : "Screening only"}`, sections: [
                  { heading: "Screening facts", table: { head: ["Item", "Value", "Status"], rows: [["Revenue", money(c.rev), "Estimated"], ["EBITDA", money(c.ebitda), "Estimated"], ["Gross margin", pct(c.gm), "Estimated"], ["Employees", `~${c.emp}`, "Inferred"], ["Relationship", c.rel, c.rel === "No relationship" ? "Unknown" : "Confirmed"], ["MCM fit score", `${fit} / 100`, analysisSource === "live" ? "Live analysis" : "Screening"], ["Recommendation", recoLabel, "AI recommendation, not a decision"]] } },
                  { heading: "Summary", paragraphs: [analysis.summary] },
                  { heading: "Supports the thesis", table: { head: ["Item", "Detail", "Status", "Confidence"], rows: analysis.supports_thesis.map((s) => [s.text, sourceLabel(s), statusLabel(s.status), cap(s.confidence)]) } },
                  { heading: "Risks", table: { head: ["Risk", "Severity", "Status", "Source"], rows: analysis.risks.map((r) => [r.text, cap(r.severity || "medium"), statusLabel(r.status), sourceLabel(r)]) }, note: analysis.risks.length ? "" : "No adverse evidence identified." },
                  { heading: "Unknowns", table: { head: ["Gap", "How to resolve", "Status"], rows: analysis.unknowns.map((u) => [u.text, u.how_to_resolve, "Unknown"]) }, note: "Gaps reduce confidence, not the score." },
                  { heading: "Fit score components", table: { head: ["Dimension", "Score"], rows: breakdown.map(([k, v]) => [k, String(v)]) } },
                  { heading: "Recommended next actions", bullets: analysis.next_actions },
                  { heading: "Evidence register", table: { head: ["Claim", "Status", "Sources", "Confidence", "Verified"], rows: (c.id === "pms" ? EVIDENCE : []).map((e) => [e.claim, statusLabel(e.level), e.src.join("; ") || "None", e.conf, e.verified]) }, note: c.id === "pms" ? "" : "No evidence items collected yet for this company." },
                ] }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported company brief (PDF)", subject: c.name }); }}>Brief PDF</Btn>
                <Btn small icon={Download} onClick={() => { downloadWorkbook(`evidence-register-${c.id}.xlsx`, [{ name: "Evidence", columns: ["Claim", "Status", "Confidence", "Sources", "Last verified", "Excerpt"], rows: (c.id === "pms" ? EVIDENCE : []).map((e) => ({ Claim: e.claim, Status: statusLabel(e.level), Confidence: e.conf, Sources: e.src.join("; ") || "None located", "Last verified": e.verified, Excerpt: e.excerpt })) }, { name: "Analysis items", columns: ["Type", "Item", "Status", "Confidence", "Source or resolution"], rows: [...analysis.supports_thesis.map((s) => ({ Type: "Supports thesis", Item: s.text, Status: statusLabel(s.status), Confidence: cap(s.confidence), "Source or resolution": sourceLabel(s) })), ...analysis.risks.map((r) => ({ Type: "Risk", Item: r.text, Status: statusLabel(r.status), Confidence: cap(r.confidence), "Source or resolution": sourceLabel(r) })), ...analysis.unknowns.map((u) => ({ Type: "Unknown", Item: u.text, Status: "Unknown", Confidence: "Low", "Source or resolution": u.how_to_resolve }))] }], { dataStatus: `Synthetic company · ${analysisSource === "live" ? "Live analysis" : "Demo analysis"}` }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported evidence register (XLSX)", subject: c.name }); }}>Evidence XLSX</Btn></div>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card pad={false}>
        <div className="px-5 pt-4"><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>
        <div className="p-5">
          {tab === "Overview" && running && <div style={{ marginBottom: 16 }}><ProcessingStages stages={STAGES_COMPANY} label="Analyzing company..." /></div>}
          {tab === "Overview" && !running && ran && <LiveBanner source={analysisSource} error={liveErr} onRetry={run} meta={analysisMeta} />}
          {tab === "Overview" && compare && previous && (
            <Card bordered style={{ marginBottom: 16, boxShadow: "none" }}>
              <SectionTitle right={<span style={{ fontSize: 11, color: T.muted }}>Previous run: {stored.previous.source === "live" ? "live" : "demo"} · Current: {analysisSource}</span>}>Previous vs current analysis</SectionTitle>
              <table className="w-full text-xs"><thead><tr style={{ color: T.muted }}><th className="text-left font-medium py-1">Dimension</th><th className="text-right font-medium py-1">Previous</th><th className="text-right font-medium py-1">Current</th><th className="text-right font-medium py-1">Change</th></tr></thead>
                <tbody>{breakdown.map(([l, v, pv]) => <tr key={l} style={{ borderBottom: `1px solid ${T.border}` }}><td className="py-1" style={{ color: T.text }}>{l}</td><td className="py-1 text-right tabular-nums" style={{ color: T.muted }}>{pv}</td><td className="py-1 text-right tabular-nums font-medium">{v}</td><td className="py-1 text-right tabular-nums" style={{ color: v - pv > 0 ? T.green : v - pv < 0 ? T.amber : T.muted }}>{v - pv > 0 ? "+" : ""}{v - pv}</td></tr>)}
                <tr><td className="py-1 font-medium">Recommendation</td><td className="py-1 text-right" style={{ color: T.muted }}>{RECO_LABEL[previous.recommendation]}</td><td className="py-1 text-right font-medium">{RECO_LABEL[analysis.recommendation]}</td><td /></tr></tbody></table>
              <div className="grid grid-cols-2 gap-4 mt-3 text-xs"><div><div style={{ color: T.muted, marginBottom: 2 }}>Previous summary</div><p style={{ color: T.muted, lineHeight: 1.5 }}>{previous.summary}</p></div><div><div style={{ color: T.muted, marginBottom: 2 }}>Current summary</div><p style={{ color: T.text, lineHeight: 1.5 }}>{analysis.summary}</p></div></div>
            </Card>
          )}
          {tab === "Overview" && (
            <div className="grid grid-cols-12 gap-4" style={{ opacity: running ? 0.55 : 1, transition: EASE }}>
              <div className="col-span-8 space-y-3">
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>{ran ? "Analysis summary" : "Screening summary"}</div>
                  <p className="text-sm leading-relaxed" style={{ color: T.text, maxWidth: 720 }}>
                    {analysis.summary}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{ color: T.text }}><span>Supports the thesis</span><span style={{ color: T.muted }}>{analysis.supports_thesis.length} items</span></div>
                    <table className="w-full text-xs">
                      <tbody>{analysis.supports_thesis.map((s) => (
                        <tr key={s.text} style={{ borderBottom: `1px solid ${T.border}` }}><td className="py-1 pr-2" style={{ color: T.text }}>{s.text}</td><td className="py-1 text-right tabular-nums" style={{ color: T.muted }}>{s.source && s.source !== "none" ? s.source : ""}</td><td className="py-1 pl-2 text-right"><Level level={LEVEL[s.status] ? s.status : "inferred"} small /></td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{ color: T.text }}><span>Risks and unresolved items</span><span style={{ color: T.muted }}>{analysis.risks.length} risk{analysis.risks.length === 1 ? "" : "s"}, {analysis.unknowns.length} gap{analysis.unknowns.length === 1 ? "" : "s"}</span></div>
                    <table className="w-full text-xs">
                      <tbody>
                        {analysis.risks.map((r) => <tr key={r.text} style={{ borderBottom: `1px solid ${T.border}`, background: T.redSoft }}><td className="py-1 px-1.5" style={{ color: T.red }}>{r.text}</td><td className="py-1 text-right tabular-nums" style={{ color: T.red }}>{r.severity ? `${r.severity[0].toUpperCase()}${r.severity.slice(1)} severity` : ""}</td><td className="py-1 pl-2 pr-1.5 text-right"><Level level="risk" small /></td></tr>)}
                        {analysis.risks.length === 0 && <tr><td className="py-1 px-1.5" colSpan={3} style={{ color: T.muted }}>No adverse evidence identified.</td></tr>}
                        {analysis.unknowns.map((u) => (
                          <tr key={u.text} style={{ borderBottom: `1px dashed ${T.unknown}88` }}><td className="py-1 px-1.5" style={{ color: T.unknown }}>{u.text}</td><td className="py-1 text-right" style={{ color: T.unknown }}>Resolve: {u.how_to_resolve}</td><td className="py-1 pl-2 pr-1.5 text-right"><Level level="unknown" small /></td></tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-xs mt-1.5" style={{ color: T.muted }}>Gaps reduce confidence, not the score. Only confirmed adverse findings reduce the score.</div>
                  </div>
                </div>
                {ran && analysis.next_actions?.length > 0 && <div><div className="text-xs font-medium mb-1" style={{ color: T.accent }}>Recommended next actions</div><ol className="list-decimal pl-4 text-xs space-y-0.5" style={{ color: T.text }}>{analysis.next_actions.map((a) => <li key={a}>{a}</li>)}</ol></div>}
                {ran && <div className="flex items-center gap-2 pt-2"><Btn small icon={ClipboardCheck} onClick={() => pushQ([...analysis.unknowns.map((u) => ({ deal: c.name, question: `${u.text}: ${u.how_to_resolve}`, workstream: /succession|management/i.test(u.text) ? "Management" : /capacity|utiliz/i.test(u.text) ? "Operational" : /ebitda|financ|revenue|margin/i.test(u.text) ? "Financial" : "Commercial", source: "Company analysis", severity: "medium" })), ...analysis.risks.map((r) => ({ deal: c.name, question: `Verify: ${r.text}`, workstream: "Commercial", source: r.source && r.source !== "none" ? r.source : "Company analysis", severity: r.severity || "medium" }))], analysisSource === "live" ? "Company analysis (live)" : "Company analysis (demo)", notify)}>Push {analysis.unknowns.length + analysis.risks.length} questions to diligence</Btn><span style={{ fontSize: 11, color: T.muted }}>Unknowns and risks become tracked questions for the first meeting.</span></div>}
              </div>
              <div className="col-span-4" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 12 }}>
                <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Fit score components</div>
                <div style={{ height: 190 }}>
                  <ResponsiveContainer>
                    <RadarChart data={breakdown.map(([k, v]) => ({ k, v }))} outerRadius={70}>
                      <PolarGrid stroke={T.border} />
                      <PolarAngleAxis dataKey="k" tick={{ fontSize: 9, fill: T.muted }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <RRadar dataKey="v" stroke={T.accent} fill={T.accent} fillOpacity={0.14} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-xs">
                  <tbody>{breakdown.map(([k, v]) => <tr key={k} style={{ borderBottom: `1px solid ${T.border}` }}><td className="py-0.5" style={{ color: T.muted }}>{k}</td><td className="py-0.5 w-20"><div className="h-1 rounded-lg" style={{ background: T.unknownSoft }}><div className="h-1 rounded-lg" style={{ width: `${v}%`, background: v >= 85 ? T.green : v >= 75 ? T.accent : T.amber }} /></div></td><td className="py-0.5 text-right tabular-nums font-medium w-8" style={{ color: v < 80 ? T.amber : T.text }}>{v}</td></tr>)}</tbody>
                </table>
                <div className="text-xs mt-1.5" style={{ color: T.muted }}>{ran ? "Scores from the latest analysis run." : "Risk profile is held down by the unconfirmed customer concentration."}</div>
              </div>
            </div>
          )}
          {false && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8 space-y-3">
                <div>
                  <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Screening summary</div>
                  <p className="text-sm leading-relaxed" style={{ color: T.text, maxWidth: 720 }}>
                    {isPMS ? "Precision MedTech Solutions appears to represent a strong fit with MCM's medical and highly engineered component strategy. The company manufactures tight-tolerance polymer and machined components for diagnostic and drug-delivery OEMs, holds an active ISO 13485 certificate, and expanded its Cleveland facility in 2024. Estimated financials sit inside MCM's range with gross margin above the 30% manufacturing threshold. The founder retains full ownership and recently discussed succession, which may indicate openness to a partner. The open questions are customer concentration, management depth and current capacity utilization. None is a confirmed negative; each requires a management conversation." : `${c.name} screens as a ${c.fit >= 85 ? "priority" : "potential"} target under the ${c.thesis} thesis. Estimated revenue of ${money(c.rev)} and EBITDA of ${money(c.ebitda)} are within MCM's published range and gross margin is ${pct(c.gm)}. The primary signal is ${c.signal.toLowerCase()}; the primary open risk is ${c.risk.toLowerCase()}. Estimates are external until company data is received.`}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{ color: T.text }}><span>Supports the thesis</span><span style={{ color: T.muted }}>8 items</span></div>
                    <table className="w-full text-xs">
                      <tbody>{[["Revenue within $8M-$50M", money(c.rev), "estimated"], ["EBITDA within $1.5M-$6M", money(c.ebitda), "estimated"], ["Gross margin above 30%", pct(c.gm), "estimated"], ["Medical end market", "Diagnostics, drug delivery", "confirmed"], ["Highly engineered components", "Tolerances to 0.0005 in", "confirmed"], ["Founder ownership", "100%", "confirmed"], ["Mission-critical applications", "Instrument components", "confirmed"], ["Commercial expansion potential", "VP Sales hired 2025", "inferred"]].map(([t, v, l]) => (
                        <tr key={t} style={{ borderBottom: `1px solid ${T.border}` }}><td className="py-1 pr-2" style={{ color: T.text }}>{t}</td><td className="py-1 text-right tabular-nums" style={{ color: T.muted }}>{v}</td><td className="py-1 pl-2 text-right"><Level level={l} small /></td></tr>
                      ))}</tbody>
                    </table>
                  </div>
                  <div>
                    <div className="text-xs font-medium mb-1 flex items-center justify-between" style={{ color: T.text }}><span>Risks and unresolved items</span><span style={{ color: T.muted }}>1 risk, 3 gaps</span></div>
                    <table className="w-full text-xs">
                      <tbody>
                        <tr style={{ borderBottom: `1px solid ${T.border}`, background: T.redSoft }}><td className="py-1 px-1.5" style={{ color: T.red }}>Largest customer estimated at 28%-35%</td><td className="py-1 text-right tabular-nums" style={{ color: T.red }}>Threshold 40%</td><td className="py-1 pl-2 pr-1.5 text-right"><Level level="risk" small /></td></tr>
                        {[["Management succession plan", "Ask founder"], ["Capacity utilization", "Site visit"], ["Historical EBITDA", "Company financials"]].map(([t, s]) => (
                          <tr key={t} style={{ borderBottom: `1px dashed ${T.unknown}88` }}><td className="py-1 px-1.5" style={{ color: T.unknown }}>{t}</td><td className="py-1 text-right" style={{ color: T.unknown }}>Source: {s}</td><td className="py-1 pl-2 pr-1.5 text-right"><Level level="unknown" small /></td></tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="text-xs mt-1.5" style={{ color: T.muted }}>Gaps reduce confidence, not the score. Only confirmed adverse findings reduce the score.</div>
                  </div>
                </div>
              </div>
              <div className="col-span-4" style={{ borderLeft: `1px solid ${T.border}`, paddingLeft: 12 }}>
                <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Fit score components</div>
                <div style={{ height: 190 }}>
                  <ResponsiveContainer>
                    <RadarChart data={breakdown.map(([k, v]) => ({ k, v }))} outerRadius={70}>
                      <PolarGrid stroke={T.border} />
                      <PolarAngleAxis dataKey="k" tick={{ fontSize: 9, fill: T.muted }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
                      <RRadar dataKey="v" stroke={T.accent} fill={T.accent} fillOpacity={0.14} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <table className="w-full text-xs">
                  <tbody>{breakdown.map(([k, v]) => <tr key={k} style={{ borderBottom: `1px solid ${T.border}` }}><td className="py-0.5" style={{ color: T.muted }}>{k}</td><td className="py-0.5 w-20"><div className="h-1 rounded-lg" style={{ background: T.unknownSoft }}><div className="h-1 rounded-lg" style={{ width: `${v}%`, background: v >= 85 ? T.green : v >= 75 ? T.accent : T.amber }} /></div></td><td className="py-0.5 text-right tabular-nums font-medium w-8" style={{ color: v < 80 ? T.amber : T.text }}>{v}</td></tr>)}</tbody>
                </table>
                <div className="text-xs mt-1.5" style={{ color: T.muted }}>Risk profile is held down by the unconfirmed customer concentration.</div>
              </div>
            </div>
          )}
          {tab === "Investment Fit" && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>MCM criteria match</div>
                <table className="w-full text-xs">
                  <thead><tr style={{ color: T.muted }}><th className="text-left font-medium py-1" style={{ borderBottom: `1px solid ${T.border}` }}>Criterion</th><th className="text-right font-medium py-1" style={{ borderBottom: `1px solid ${T.border}` }}>Observed</th><th className="text-right font-medium py-1" style={{ borderBottom: `1px solid ${T.border}` }}>Status</th></tr></thead>
                  <tbody>{[["Revenue $8M-$50M", money(c.rev), true, "estimated"], ["EBITDA $1.5M-$6M", money(c.ebitda), true, "estimated"], ["Manufacturing GM 30%+", pct(c.gm), c.gm >= 30, "estimated"], ["US geography", c.loc, true, "confirmed"], ["Entrepreneurially led", c.own, c.own !== "PE-backed", "confirmed"], ["Core sector", c.sector, true, "confirmed"], ["Customer concentration below 40%", "28%-35% est.", null, "inferred"], ["Management depth", "Not assessed", null, "unknown"]].map(([k, v, ok, l]) => (
                    <tr key={k} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td className="py-1.5 flex items-center gap-2" style={{ color: T.text }}>{ok === true ? <CheckCircle2 size={13} style={{ color: T.green }} /> : ok === false ? <AlertTriangle size={13} style={{ color: T.red }} /> : <HelpCircle size={13} style={{ color: T.unknown }} />}{k}</td>
                      <td className="py-1.5 text-right tabular-nums" style={{ color: T.text }}>{v}</td>
                      <td className="py-1.5 text-right"><Level level={l} small /></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <div>
                <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Qualitative attractiveness</div>
                <table className="w-full text-xs"><tbody>{[["Technical differentiation", "High", T.green], ["Switching costs", "High (validated programs)", T.green], ["Recurring revenue", "Program-based, multi-year", T.green], ["Certifications", "ISO 13485 active", T.green], ["End-market growth", "Mid single digits", T.accent], ["Sales effectiveness", "Under-developed; VP Sales hired 2025", T.amber], ["Add-on potential", "Regional molders and machining", T.accent], ["Capex requirements", "Unknown; recent facility investment", T.unknown]].map(([k, v, col]) => (
                  <tr key={k} style={{ borderBottom: `1px solid ${T.border}` }}><td className="py-1.5" style={{ color: T.muted }}>{k}</td><td className="py-1.5 text-right font-medium" style={{ color: col }}>{v}</td></tr>
                ))}</tbody></table>
              </div>
            </div>
          )}
          {tab === "Financials" && (
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-8">
                <div className="flex items-center justify-between mb-1"><div className="text-xs font-medium" style={{ color: T.muted }}>Screening estimates ($ millions unless noted)</div><Legend levels={["estimated", "inferred", "unknown"]} /></div>
                <table className="w-full text-xs">
                  <thead><tr style={{ color: T.muted, background: "#fafaf8" }}>{["Metric", "Low", "Mid", "High", "Basis", "Status"].map((h, i) => <th key={h} className={`font-medium px-2 py-1 ${i >= 1 && i <= 3 ? "text-right" : "text-left"}`} style={{ borderBottom: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
                  <tbody>{finRows.map(([m, lo, mid, hi, basis, l]) => (
                    <tr key={m} style={{ borderBottom: `1px solid ${T.border}` }}>
                      <td className="px-2 py-1.5 font-medium" style={{ color: l === "unknown" ? T.unknown : T.text }}>{m}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums" style={{ color: T.muted }}>{lo || ""}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums font-semibold" style={{ color: l === "unknown" ? T.unknown : T.text }}>{mid}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums" style={{ color: T.muted }}>{hi || ""}</td>
                      <td className="px-2 py-1.5" style={{ color: T.muted }}>{basis}</td>
                      <td className="px-2 py-1.5"><Level level={l} small /></td>
                    </tr>
                  ))}</tbody>
                </table>
                <div className="text-xs mt-1.5" style={{ color: T.muted }}>No company-provided financials. Mid values are used for screening only and are replaced on receipt of a teaser or CIM.</div>
              </div>
              <div className="col-span-4">
                <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Revenue estimate by source ($M)</div>
                <div style={{ height: 170 }}>
                  <ResponsiveContainer>
                    <BarChart data={[{ n: "Industry DB", v: c.rev - 1.5 }, { n: "Headcount", v: c.rev + 2.6 }, { n: "Trade data", v: c.rev - 0.4 }, { n: "Midpoint", v: c.rev }]} margin={{ left: -14, right: 4 }}>
                      <CartesianGrid stroke={T.border} vertical={false} />
                      <XAxis dataKey="n" tick={{ fontSize: 10, fill: T.muted }} />
                      <YAxis tick={{ fontSize: 10, fill: T.muted }} />
                      <RTooltip formatter={(v) => money(v)} />
                      <Bar dataKey="v" radius={[1, 1, 0, 0]}>{[0, 1, 2, 3].map((i) => <Cell key={i} fill={i === 3 ? T.accent : "#b8c4d6"} />)}</Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-xs" style={{ color: T.muted }}>Spread of about $4M across three methods. Headcount model runs high for automated facilities.</div>
              </div>
            </div>
          )}
          {tab === "Market" && (
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[["End market", "Diagnostic instruments and drug-delivery devices. OEM outsourcing of validated components continues.", "confirmed"], ["Competitive position", "One of an estimated 30-40 US precision medical molders under $50M revenue with active ISO 13485.", "estimated"], ["Regional dynamics", "Northeast Ohio cluster of polymer and machining suppliers supports hiring and add-on options.", "inferred"]].map(([h, b, l]) => (
                <div key={h} className="rounded-lg p-2.5" style={{ border: `1px solid ${T.border}` }}><div className="flex items-center justify-between mb-1"><span className="font-medium" style={{ color: T.text }}>{h}</span><Level level={l} small /></div><p style={{ color: T.muted }}>{b}</p></div>
              ))}
            </div>
          )}
          {tab === "People" && (
            <div className="grid grid-cols-3 gap-3 text-xs">
              {[["Michael Reynolds", "Founder & CEO", "Founded 2004. Engineering background. Discussed succession at 2026 industry panel.", "inferred"], ["Dana Whitfield", "VP Sales (hired 2025)", "Previously regional sales lead at a larger contract manufacturer.", "inferred"], ["Operations leadership", "Unknown", "No public information on plant or quality leadership. Gap to close in first meeting.", "unknown"]].map(([n, r, b, l]) => (
                <div key={n} className="rounded-lg p-2.5" style={{ border: `1px ${l === "unknown" ? "dashed" : "solid"} ${l === "unknown" ? T.unknown : T.border}` }}><div className="font-medium text-sm" style={{ color: T.text }}>{n}</div><div className="mb-1" style={{ color: T.muted }}>{r}</div><p style={{ color: T.muted }}>{b}</p><div className="mt-2 flex items-center justify-between"><Level level={l} small /><span style={{ color: T.unknown }}>Synthetic identity</span></div></div>
              ))}
            </div>
          )}
          {tab === "Relationship" && <RelationshipPanel go={go} />}
          {tab === "Evidence" && (
            <div>
              <div className="flex items-center justify-between mb-1.5"><div className="text-xs" style={{ color: T.muted }}>Every claim carries a source, a confidence level and a status. Click a row to read the excerpt.</div><Legend levels={["confirmed", "inferred", "estimated", "unknown"]} /></div>
              <table className="w-full text-xs">
                <thead><tr style={{ color: T.muted, background: "#fafaf8" }}>{["Claim", "Status", "Sources", "Confidence", "Last verified"].map((h) => <th key={h} className="text-left font-medium px-2 py-1" style={{ borderBottom: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
                <tbody>{EVIDENCE.map((e, i) => (
                  <React.Fragment key={i}>
                    <tr onClick={() => setOpen(open === i ? null : i)} className="cursor-pointer hover:bg-stone-50" style={{ borderBottom: `1px ${e.level === "unknown" ? "dashed" : "solid"} ${e.level === "unknown" ? T.unknown + "88" : T.border}` }}>
                      <td className="px-2 py-1.5" style={{ color: e.level === "unknown" ? T.unknown : T.text }}>{e.claim}</td>
                      <td className="px-2 py-1.5"><Level level={e.level} small /></td>
                      <td className="px-2 py-1.5" style={{ color: T.muted }}>{e.src.length ? e.src.join("; ") : "None located"}</td>
                      <td className="px-2 py-1.5"><Conf v={e.conf} /></td>
                      <td className="px-2 py-1.5" style={{ color: T.muted }}>{e.verified}</td>
                    </tr>
                    {open === i && <tr><td colSpan={5} className="px-3 py-2" style={{ background: T.bg, color: T.text, borderBottom: `1px solid ${T.border}` }}><div className="mb-0.5" style={{ color: T.muted }}>Source excerpt (synthetic)</div>{e.excerpt}</td></tr>}
                  </React.Fragment>
                ))}</tbody>
              </table>
            </div>
          )}
          {tab === "Agent Analysis" && (
            <div className="text-xs">
              <table className="w-full">
                <thead><tr style={{ color: T.muted, background: "#fafaf8" }}>{["Agent", "Work performed", "Model tier", "Status"].map((h) => <th key={h} className="text-left font-medium px-2 py-1" style={{ borderBottom: `1px solid ${T.border}`, borderTop: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
                <tbody>{[["Research", "Collected 14 public sources: website, certificate registry, filings, job postings, two press items. No paid data used in demo.", "Small", "Complete"], ["Qualification", "Scored 7 dimensions against the thesis. Risk profile scored 76 because customer concentration could not be cleared.", "Advanced", "Complete"], ["Relationship", "Found 2 second-degree connections through the MCM advisory network (conceptual CRM integration).", "Small", "Complete"], ["Red-Team", "Runs automatically when a company moves to Active Dialogue.", "Advanced", ran ? "Queued" : "Not run"]].map(([a, b, m, s]) => (
                  <tr key={a} style={{ borderBottom: `1px solid ${T.border}` }}><td className="px-2 py-1.5 font-medium whitespace-nowrap" style={{ color: T.text }}>{a}</td><td className="px-2 py-1.5" style={{ color: T.muted }}>{b}</td><td className="px-2 py-1.5" style={{ color: T.muted }}>{m}</td><td className="px-2 py-1.5" style={{ color: s === "Complete" ? T.green : T.muted }}>{s}</td></tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function RelationshipPanel({ go }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-2">
        <div className="text-xs font-medium mb-2" style={{ color: T.muted }}>Relationship timeline</div>
        <div className="relative pl-6">
          <div className="absolute left-2 top-1 bottom-1 w-px" style={{ background: T.border }} />
          {TIMELINE.map((t) => (
            <div key={t.y} className="relative mb-4">
              <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full" style={{ background: t.level === "confirmed" ? T.green : T.accent, marginLeft: -1 }} />
              <div className="text-xs tabular-nums" style={{ color: T.muted }}>{t.y}</div>
              <div className="text-sm flex items-center gap-2" style={{ color: T.text }}>{t.t}<Level level={t.level} small /></div>
            </div>
          ))}
        </div>
        <div className="rounded p-3 text-xs mt-2" style={{ background: T.accentSoft, color: T.accent }}>The system helps humans manage long-term relationships. It does not contact owners on its own.</div>
      </div>
      <div>
        <KV k="Relationship strength" v="Low" />
        <KV k="Best entry point" v="Founder / CEO" />
        <KV k="Potential warm connections" v="2" level="inferred" />
        <KV k="Suggested next step" v="Research founder and identify introduction paths" />
        <div className="mt-3"><Btn primary icon={Send} onClick={() => go("outreach")}>Prepare outreach brief</Btn></div>
      </div>
    </div>
  );
}

function RelationshipIntelligence({ go, openCompany }) {
  const [done, setDone] = useState({});
  const due = COMPANIES.filter((c) => c.rel !== "No relationship");
  return (
    <div>
      <PageHeader title="Relationship Intelligence" sub="Long-horizon view of owner relationships. Proprietary sourcing compounds over years." crumbs={["Sourcing", "Relationship Intelligence"]} demo="Synthetic relationships" />
      <div className="grid grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        <Metric k="Owners with any contact" v="214" />
        <Metric k="Warm relationships" v="38" />
        <Metric k="Succession signals, 12 months" v="2" color={T.amber} />
        <Metric k="Follow-ups due this week" v={String(due.length)} />
      </div>
      <Card style={{ marginBottom: 24 }}>
        <SectionTitle right={<span style={{ color: T.muted, fontSize: 12 }}>Precision MedTech Solutions</span>}>Relationship timeline</SectionTitle>
        <div className="grid gap-8" style={{ gridTemplateColumns: "65fr 35fr" }}>
          <div className="relative pl-6">
            <div className="absolute left-2 top-1 bottom-1 w-px" style={{ background: T.border }} />
            {TIMELINE.map((t) => (
              <div key={t.y} className="relative" style={{ marginBottom: 16 }}>
                <div className="absolute -left-4 top-1.5 w-2.5 h-2.5 rounded-full" style={{ background: t.level === "confirmed" ? T.green : T.accent, marginLeft: -1 }} />
                <div className="tabular-nums" style={{ color: T.muted, fontSize: 11 }}>{t.y}</div>
                <div className="flex items-center gap-2" style={{ color: T.text, fontSize: 13 }}>{t.t}<Level level={t.level} small /></div>
              </div>
            ))}
            <div className="p-3" style={{ background: T.accentSoft, color: T.accent, borderRadius: 10, fontSize: 12 }}>The system helps humans manage long-term relationships. It does not contact owners on its own.</div>
          </div>
          <div style={{ background: T.soft, borderRadius: 12, padding: 18 }}>
            {[["Relationship strength", "Low", T.amber], ["Best entry point", "Founder / CEO"], ["Warm connections", "2"], ["Next action", "Identify introduction path"]].map(([k, v, c]) => <div key={k} style={{ marginBottom: 12 }}><div style={{ color: T.muted, fontSize: 11 }}>{k}</div><div className="font-semibold" style={{ color: c || T.text, fontSize: 14 }}>{v}</div></div>)}
            <Btn primary icon={Send} onClick={() => go("outreach")}>Prepare outreach brief</Btn>
          </div>
        </div>
      </Card>
      <Card pad={false}>
        <div className="px-4 pt-4"><SectionTitle>Follow-ups due</SectionTitle></div>
        <table className="w-full" style={{ fontSize: 13 }}>
          <thead><tr style={{ color: T.muted, fontSize: 11 }}>{["", "Company", "Suggested follow-up", "Due", "Status"].map((h) => <th key={h} className="text-left font-medium px-4 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{due.map((c, i) => (
            <tr key={c.id} style={{ borderBottom: `1px solid ${T.border}`, opacity: done[c.id] ? 0.5 : 1 }}>
              <td className="px-4 py-2.5" style={{ width: 32 }}><input type="checkbox" checked={!!done[c.id]} onChange={() => setDone({ ...done, [c.id]: !done[c.id] })} /></td>
              <td className="px-4 py-2.5 font-medium cursor-pointer" style={{ color: T.text }} onClick={() => openCompany(c.id)}>{c.name}</td>
              <td className="px-4 py-2.5" style={{ color: T.muted }}>Quarterly check-in on {c.signal.toLowerCase()}</td>
              <td className="px-4 py-2.5 tabular-nums" style={{ color: i < 2 ? T.amber : T.muted }}>{["Today", "Tomorrow", "Fri", "Next week", "Next week"][i]}</td>
              <td className="px-4 py-2.5" style={{ color: T.muted, fontSize: 12 }}>{c.rel}</td>
            </tr>
          ))}</tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------- Outreach ---------- */
function Outreach({ notify }) {
  const { ws, setOutreach, audit } = useWorkspace();
  const c = COMPANIES.find((x) => x.id === "pms");
  const saved = ws.outreach[c.id];
  const [tone, setTone] = useState(saved?.tone || "Founder-to-Founder");
  const [obj, setObj] = useState(saved?.objective || "Introduction");
  const [editing, setEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [liveErr, setLiveErr] = useState(null);
  const [draft, setDraft] = useState(saved || null);
  const drafts = {
    "Founder-to-Founder": `Michael,\n\nI came across Precision MedTech while researching precision suppliers to diagnostic OEMs, and the 2024 expansion caught my attention. We are MCM Capital, a Cleveland firm that has partnered with founder-led precision manufacturers for over thirty years, most recently in injection molding for medical customers.\n\nNo agenda beyond learning how you think about the next chapter for the business. If a conversation over coffee in Cleveland is useful, I would welcome it.\n\nChris Hren\nMCM Capital Partners`,
    Professional: `Dear Mr. Reynolds,\n\nMCM Capital Partners is a Cleveland-based private equity firm focused on niche manufacturers of highly engineered components. Precision MedTech Solutions appears to align with our medical device precision components focus, and we would value the opportunity to introduce our firm.\n\nWe would welcome a brief introductory call at your convenience.\n\nSincerely,\nChris Hren\nVice President, MCM Capital Partners`,
    Concise: `Michael,\n\nMCM Capital partners with founder-led precision manufacturers in Cleveland and beyond. Your work for diagnostic OEMs stood out. Open to a short conversation?\n\nChris Hren, MCM Capital Partners`,
  };
  const text = draft?.body ?? drafts[tone];
  const facts = EVIDENCE.map((e) => `- ${e.claim} [${e.level}]`).join("\n");
  const generate = async (adjust) => {
    setBusy(true); setLiveErr(null); setApproved(false);
    audit({ actor: "M. Ahmed", kind: "human", action: adjust ? `Requested outreach adjustment: ${adjust}` : "Generated outreach draft", subject: c.name });
    const res = await generateOutreachDraft({ company: companyContextText(c), facts, relationship: "No previous contact. Two possible warm paths through MCM's advisory network.", tone, objective: obj, adjust: adjust || "", current: adjust ? text : "" }, { fallback: () => ({ body: drafts[tone], facts_used: ["2024 facility expansion (confirmed)", "Diagnostic OEM customers (confirmed)"], avoided_as_unverified: ["Succession planning (inferred)", "Customer concentration (inferred)"] }) });
    const d = { body: res.data.body, tone, objective: obj, source: res.source, at: new Date().toISOString(), factsUsed: res.data.facts_used, avoided: res.data.avoided_as_unverified };
    setDraft(d); setOutreach(c.id, d); setLiveErr(res.error || null); setBusy(false);
    audit({ actor: res.source === "live" ? "Claude draft" : "Demo draft", kind: res.source === "live" ? "ai" : "system", action: `Outreach draft ${res.source === "live" ? "generated" : "loaded (fallback)"}`, subject: c.name, detail: `${tone}, ${obj}${adjust ? `, ${adjust}` : ""}` });
  };
  const setBody = (body) => { const d = { ...(draft || { tone, objective: obj, source: "manual", factsUsed: [], avoided: [] }), body, at: new Date().toISOString() }; setDraft(d); };
  const save = () => { setOutreach(c.id, draft || { body: text, tone, objective: obj, source: "manual", at: new Date().toISOString(), factsUsed: [], avoided: [] }); audit({ actor: "M. Ahmed", kind: "human", action: "Saved outreach draft", subject: c.name }); notify("Draft saved to workspace."); };
  const exportTxt = () => { const blob = new Blob([`To: Michael Reynolds, Founder & CEO, Precision MedTech Solutions (synthetic)\nTone: ${tone} · Objective: ${obj}\nStatus: DRAFT, not sent. Human approval required.\n\n${text}`], { type: "text/plain" }); const url = URL.createObjectURL(blob); const a2 = document.createElement("a"); a2.href = url; a2.download = "outreach-draft-precision-medtech.txt"; a2.click(); URL.revokeObjectURL(url); audit({ actor: "M. Ahmed", kind: "human", action: "Exported outreach draft", subject: c.name }); };
  return (
    <div>
      <PageHeader title="Outreach" sub="AI-prepared research brief and draft. A human approves every message before it leaves the firm." crumbs={["Sourcing", "Outreach"]} demo="No email is sent" />
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 space-y-4">
          <Card>
            <SectionTitle>Target</SectionTitle>
            <div className="text-sm font-medium" style={{ color: T.text }}>{c.name}</div>
            <div className="text-xs mb-3" style={{ color: T.muted }}>{c.loc}. Fit {c.fit}. No previous contact.</div>
            <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Decision maker</div>
            <div className="text-sm" style={{ color: T.text }}>Michael Reynolds, Founder & CEO <span className="text-xs ml-1" style={{ color: T.unknown }}>Synthetic identity</span></div>
          </Card>
          <Card>
            <SectionTitle>Research brief</SectionTitle>
            <ul className="space-y-1 text-sm" style={{ color: T.text }}>{EVIDENCE.slice(0, 6).map((e) => <li key={e.claim} className="flex items-start justify-between gap-2"><span style={{ fontSize: 12.5 }}>{e.claim}</span><Level level={e.level} small /></li>)}</ul>
            <div className="text-xs mt-2" style={{ color: T.muted }}>Only confirmed items may be stated as fact in the draft. Inferred and estimated items are alluded to, never asserted.</div>
          </Card>
          <Card>
            <SectionTitle>Controls</SectionTitle>
            <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Tone</div>
            <div className="flex gap-1.5 mb-3">{Object.keys(drafts).map((t) => <button key={t} onClick={() => { setTone(t); if (!draft) setApproved(false); }} className="text-xs px-3 py-1.5" style={{ borderRadius: R.chip, border: `1px solid ${tone === t ? T.accent : T.border}`, background: tone === t ? T.accentSoft : "#fff", color: tone === t ? T.accent : T.text }}>{t}</button>)}</div>
            <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Objective</div>
            <div className="flex gap-1.5 mb-3">{["Introduction", "Industry Discussion", "MCM Overview"].map((t) => <button key={t} onClick={() => setObj(t)} className="text-xs px-3 py-1.5" style={{ borderRadius: R.chip, border: `1px solid ${obj === t ? T.accent : T.border}`, background: obj === t ? T.accentSoft : "#fff", color: obj === t ? T.accent : T.text }}>{t}</button>)}</div>
            <div className="flex flex-wrap gap-1.5">
              <Btn primary small icon={busy ? Loader2 : Play} onClick={() => generate("")} disabled={busy}>{busy ? "Drafting" : draft ? "Regenerate" : "Generate draft"}</Btn>
              {draft && ["Shorten", "Make warmer", "Make more direct"].map((a2) => <Btn key={a2} small onClick={() => generate(a2)} disabled={busy}>{a2}</Btn>)}
            </div>
          </Card>
        </div>
        <Card className="col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: T.amberSoft, color: T.amber, border: `1px solid ${T.amber}55` }}>Draft. Not sent. Requires approval by C. Hren</span>{draft && <span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: draft.source === "live" ? T.greenSoft : T.unknownSoft, color: draft.source === "live" ? T.green : T.unknown }}>{draft.source === "live" ? "Live draft" : draft.source === "manual" ? "Edited" : "Demo draft"}</span>}</div>
            <span className="text-xs" style={{ color: T.muted }}>Objective: {obj}</span>
          </div>
          {liveErr && <div className="px-3 py-2 mb-2" style={{ background: T.amberSoft, color: T.amber, borderRadius: 10, fontSize: 12 }}>{liveErr} Showing the synthetic draft instead.</div>}
          {busy ? <div className="flex-1 space-y-2 p-3" style={{ border: `1px solid ${T.border}`, borderRadius: R.ctl }}><Skeleton /><Skeleton w="90%" /><Skeleton w="70%" /><Skeleton w="85%" /></div>
            : editing ? <textarea value={text} onChange={(e) => setBody(e.target.value)} rows={14} className="w-full text-sm p-3 outline-none flex-1 focus:ring-2 focus:ring-blue-200" style={{ border: `1px solid ${T.accent}`, color: T.text, whiteSpace: "pre-wrap", borderRadius: R.ctl }} />
            : <pre className="text-sm p-3 flex-1 whitespace-pre-wrap" style={{ border: `1px solid ${T.border}`, color: T.text, background: T.bg, borderRadius: R.ctl, ...FONT }}>{text}</pre>}
          {draft && (draft.factsUsed?.length > 0 || draft.avoided?.length > 0) && <div className="grid grid-cols-2 gap-3 mt-3" style={{ fontSize: 11.5 }}><div><div style={{ color: T.green, fontWeight: 600 }}>Facts used</div><ul className="list-disc pl-4" style={{ color: T.muted }}>{draft.factsUsed.map((f, i) => <li key={i}>{f}</li>)}</ul></div><div><div style={{ color: T.amber, fontWeight: 600 }}>Held back as unverified</div><ul className="list-disc pl-4" style={{ color: T.muted }}>{draft.avoided.map((f, i) => <li key={i}>{f}</li>)}</ul></div></div>}
          <div className="flex items-center gap-2 mt-3">
            <Btn onClick={() => setEditing(!editing)} disabled={busy}>{editing ? "Done editing" : "Edit"}</Btn>
            <Btn onClick={save} disabled={busy}>Save draft</Btn>
            <Btn icon={Download} onClick={exportTxt} disabled={busy}>Export</Btn>
            <Btn primary icon={Mail} onClick={() => { setApproved(true); audit({ actor: "M. Ahmed", kind: "human", action: "Approved outreach draft for Outlook (conceptual)", subject: c.name }); notify("Draft prepared for human approval."); }} disabled={busy}>Approve for Outlook</Btn>
            <span className="text-xs ml-auto" style={{ color: T.muted }}>{approved ? "Prepared for approval. Nothing has been sent." : "Sending remains manual. No integration is connected."}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- Deal Pipeline ---------- */
function Pipeline({ go }) {
  const groups = [["Early stage", ["Initial Review", "NDA", "CIM Received"]], ["Evaluation", ["Management Meeting", "LOI"]], ["Execution", ["Diligence", "Investment Committee"]]];
  return (
    <div>
      <PageHeader title="Deal Pipeline" sub="Active opportunities by stage. Cards show the key open risk and what has been completed." crumbs={["Deals", "Deal Pipeline"]} demo="5 synthetic projects" />
      <div className="grid grid-cols-3 gap-4">
        {groups.map(([g, stages]) => (
          <div key={g}>
            <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>{g}</div>
            <div className="p-2" style={{ background: T.soft, borderRadius: 16, minHeight: 360 }}>
              {stages.map((s) => {
                const items = DEALS.filter((d) => d.stage === s);
                return (
                  <div key={s} style={{ marginBottom: 12 }}>
                    <div className="flex items-center justify-between px-1" style={{ marginBottom: 6 }}><span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{s}</span><span className="tabular-nums" style={{ fontSize: 11, color: T.muted }}>{items.length}</span></div>
                    {items.length === 0 && <div className="px-2 py-1.5" style={{ fontSize: 11, color: T.unknown, border: `1px dashed ${T.border}`, borderRadius: 6 }}>Empty</div>}
                    {items.map((d) => (
                      <button key={d.name} onClick={() => go(d.name === "Project Falcon" ? "cim" : "pipeline")} className="w-full text-left bg-white" style={{ borderRadius: 12, padding: "12px 14px", marginBottom: 8, boxShadow: SHADOW, transition: EASE }} onMouseEnter={(e) => { e.currentTarget.style.boxShadow = SHADOW_HOVER; e.currentTarget.style.transform = "translateY(-2px)"; }} onMouseLeave={(e) => { e.currentTarget.style.boxShadow = SHADOW; e.currentTarget.style.transform = "none"; }}>
                        <div style={{ fontSize: 11, letterSpacing: "0.05em", textTransform: "uppercase", color: T.muted }}>{d.name.replace("Project ", "Project ")}</div>
                        <div style={{ fontSize: 13, color: T.text, fontWeight: 500 }}>{d.sector}</div>
                        <div className="tabular-nums" style={{ fontSize: 16, fontWeight: 650, color: T.text, marginTop: 6 }}>{d.ev} <span style={{ fontSize: 11, color: T.muted, fontWeight: 400 }}>EV</span></div>
                        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 2 }}>{d.owner} · Day {d.days}</div>
                        <div className="flex items-start gap-1.5" style={{ fontSize: 12, color: T.red, marginTop: 8 }}><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: T.red }} />{d.risk}</div>
                        <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4 }}>{d.ai}</div>
                      </button>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- CIM Analyzer ---------- */
const CIM_EXCERPTS = {
  23: "Falcon Precision Technologies generated $38.2M in FY2025 revenue, an 8.1% increase over FY2024, driven primarily by two aerospace platform ramps.",
  48: "Customer A represented 31% of FY2025 revenue. The top five customers represented 64%. The current supply agreement with Customer A runs through Q3 2028.",
  58: "Management projects 12% revenue CAGR through FY2028, of which approximately two thirds is attributable to Program X and Program Y volumes.",
  71: "Adjusted EBITDA of $5.1M includes $740K of adjustments for owner compensation normalization, one-time legal costs and a facility relocation.",
  84: "The company operates 42 CNC machines across two facilities with an estimated 78% utilization on a two-shift basis.",
  92: "Senior leadership consists of the CEO/owner, a COO with 11 years of tenure, and a CFO hired in 2023.",
};
/* The synthetic CIM, expressed in the same shape the live pipeline produces. */
const DEMO_CIM_DOC = {
  id: "demo-falcon-cim", name: "Falcon CIM (synthetic, 142 pages)", source: "demo", deal: "Project Falcon", pages: 142, createdAt: null,
  meta: { pagesCited: 41, findingsCount: 27 },
  findings: Object.entries(CIM_EXCERPTS).map(([page, excerpt]) => ({ text: excerpt, page: Number(page), excerpt })),
  extraction: {
    company_name: "Falcon Precision Technologies", investment_fit: "strong", confidence: "high",
    overview: "Falcon Precision Technologies is an AS9100-certified manufacturer of precision aerospace components operating two facilities with 168 employees. FY2025 revenue was $38.2M with adjusted EBITDA of $5.1M. Customer A represents 31% of revenue under an agreement running through Q3 2028.",
    metrics: [
      { metric: "Revenue", label: "Revenue", value: "$38.2M", period: "FY2025", prior: ["$32.9M", "$35.3M"], change: "8.1%", page: 23, status: "confirmed", confidence: "high" },
      { metric: "Gross profit", label: "Gross profit", value: "$13.5M", period: "FY2025", prior: ["$11.0M", "$12.1M"], change: "11.6%", page: 23, status: "confirmed", confidence: "high" },
      { metric: "Gross margin", label: "Gross margin", value: "35.4%", period: "FY2025", prior: ["33.4%", "34.2%"], change: "+120 bps", page: 23, status: "confirmed", confidence: "high" },
      { metric: "Reported EBITDA", label: "Reported EBITDA", value: "$4.4M", period: "FY2025", prior: ["$3.6M", "$3.9M"], change: "12.8%", page: 71, status: "confirmed", confidence: "high" },
      { metric: "EBITDA adjustments", label: "Adjustments", value: "$0.7M", period: "FY2025", prior: ["$0.5M", "$0.6M"], change: "", page: 71, status: "confirmed", confidence: "high", flag: "risk" },
      { metric: "Adjusted EBITDA", label: "Adjusted EBITDA", value: "$5.1M", period: "FY2025", prior: ["$4.1M", "$4.5M"], change: "13.3%", page: 71, status: "confirmed", confidence: "high" },
      { metric: "Adjusted EBITDA margin", label: "Adj. EBITDA margin", value: "13.4%", period: "FY2025", prior: ["12.5%", "12.7%"], change: "+70 bps", page: 71, status: "confirmed", confidence: "high" },
      { metric: "Capex", label: "Capex", value: "$2.4M", period: "FY2025", prior: ["$1.9M", "$2.1M"], change: "", page: 84, status: "confirmed", confidence: "high" },
      { metric: "Employees", label: "Employees", value: "168", period: "FY2025", prior: ["151", "160"], change: "", page: 92, status: "confirmed", confidence: "high" },
      { metric: "Top customer share", label: "Top customer share", value: "31%", period: "FY2025", prior: ["29%", "30%"], change: "", page: 48, status: "confirmed", confidence: "high", flag: "risk" },
      { metric: "Top 5 customer share", label: "Top 5 customer share", value: "64%", period: "FY2025", prior: ["61%", "62%"], change: "", page: 48, status: "confirmed", confidence: "high", flag: "risk" },
      { metric: "Net working capital", label: "Net working capital", value: "Not disclosed", period: "", prior: ["", ""], change: "", page: null, status: "unknown", confidence: "low" },
    ],
    investment_highlights: [{ text: "Precision aerospace components with AS9100 certification and long qualification cycles.", page: 23, status: "confirmed", confidence: "high" }, { text: "Gross margin of 35.4% sits above MCM's 30% manufacturing threshold.", page: 23, status: "confirmed", confidence: "high" }, { text: "Two-facility footprint with capacity headroom on a third shift.", page: 84, status: "inferred", confidence: "medium" }],
    risks: [{ text: "Top customer at 31% and top five at 64%; agreement expires Q3 2028.", page: 48, status: "confirmed", confidence: "high", severity: "high" }, { text: "Growth projection depends heavily on two programs.", page: 58, status: "confirmed", confidence: "high", severity: "medium" }, { text: "$740K of EBITDA adjustments require validation.", page: 71, status: "confirmed", confidence: "high", severity: "high" }],
    customer_concentration: [{ text: "Customer A 31%, B 12%, C 9%, D 7%, E 5%. Customer A agreement through Q3 2028; pricing mechanics not disclosed.", page: 48, status: "confirmed", confidence: "high" }],
    end_market_exposure: [{ text: "Commercial aerospace 58%, defense 27%, industrial 15%.", page: 58, status: "confirmed", confidence: "high" }],
    facilities_and_operations: [{ text: "42 CNC machines, estimated 78% utilization on two shifts.", page: 84, status: "confirmed", confidence: "high" }],
    management: [{ text: "CEO/owner, tenured COO, CFO hired 2023. Succession not addressed in CIM.", page: 92, status: "confirmed", confidence: "high" }],
    ebitda_adjustments: [{ text: "Owner compensation normalization, one-time legal costs and a facility relocation total $740K.", page: 71, status: "confirmed", confidence: "high" }],
    inconsistencies: [],
    missing_information: [{ text: "Customer contract copies", why_it_matters: "Renewal and change-of-control terms drive the concentration risk." }, { text: "Quality metrics (scrap, on-time delivery)", why_it_matters: "Operational diligence baseline." }, { text: "Working capital seasonality", why_it_matters: "Affects closing balance sheet and pricing." }],
    diligence_questions: [{ question: "What are the renewal terms and pricing mechanics with Customer A?", workstream: "Commercial", page: 48, severity: "high" }, { question: "Which adjustments in the $740K are truly non-recurring?", workstream: "Financial", page: 71, severity: "high" }, { question: "What is the CEO's post-transaction role and timeline?", workstream: "Management", page: 92, severity: "medium" }],
  },
};
const DOC_STAGES = ["Reading document", "Extracting financials with page citations", "Reviewing customer concentration", "Identifying missing information", "Normalizing into the deal record", "Checking for conflicts with existing facts"];
const CONFLICT_METRICS = ["Revenue", "Gross margin", "Reported EBITDA", "EBITDA adjustments", "Adjusted EBITDA", "Adjusted EBITDA margin", "Capex", "Employees", "Top customer share", "Top 5 customer share"];
const normVal = (v) => String(v || "").toLowerCase().replace(/[\s,$]/g, "").replace(/million|mm/g, "m");
function detectConflicts(deal, prevDoc, newDoc) {
  const out = [];
  for (const m of CONFLICT_METRICS) {
    const a = prevDoc.extraction.metrics.find((x) => x.metric === m && x.status !== "unknown");
    const b = newDoc.extraction.metrics.find((x) => x.metric === m && x.status !== "unknown");
    if (!a || !b) continue;
    if (normVal(a.value) === normVal(b.value)) continue;
    out.push({
      id: `cf-${Date.now()}-${m.replace(/\W/g, "")}`, deal, metric: m, status: "pending", createdAt: new Date().toISOString(),
      previous: { value: a.value, period: a.period || "", page: a.page, source: prevDoc.name },
      current: { value: b.value, period: b.period || "", page: b.page, source: newDoc.name },
      explanation: a.period && b.period && a.period !== b.period ? `Periods differ (${a.period} vs ${b.period}); the figures may not be comparable.` : /customer/i.test(m) ? "May reflect monthly or quarterly mix rather than LTM concentration." : "Definitions or periods may differ between documents. Reconcile before relying on either value.",
      action: /customer/i.test(m) ? "Reconcile LTM and period customer concentration with management." : `Reconcile ${m} between the two sources and record the basis.`,
    });
  }
  return out;
}
function eventsFromDocument(deal, doc, conflicts) {
  const t = new Date().toISOString();
  const ev = [];
  const ex = doc.extraction;
  ex.metrics.filter((m) => m.status !== "unknown" && ["Revenue", "Adjusted EBITDA", "Gross margin", "Top customer share"].includes(m.metric)).slice(0, 4).forEach((m) => ev.push({ id: `ev-${Date.now()}-${ev.length}`, time: t, deal, kind: "financial", severity: "active", title: "New financial information", detail: `${m.label}${m.period ? ` ${m.period}` : ""}: ${m.value}`, source: doc.name, page: m.page }));
  ex.risks.forEach((r) => ev.push({ id: `ev-${Date.now()}-${ev.length}`, time: t, deal, kind: "risk", severity: r.severity === "high" ? "critical" : "review", title: "Material risk identified", detail: r.text, source: doc.name, page: r.page }));
  conflicts.forEach((c) => ev.push({ id: `ev-${Date.now()}-${ev.length}`, time: t, deal, kind: "conflict", severity: "critical", title: "Data conflict detected", detail: `${c.metric}: ${c.previous.value} (${c.previous.source}, p.${c.previous.page}) vs ${c.current.value} (${c.current.source}, p.${c.current.page})`, source: doc.name, page: c.current.page }));
  ex.missing_information.slice(0, 3).forEach((m) => ev.push({ id: `ev-${Date.now()}-${ev.length}`, time: t, deal, kind: "missing", severity: "review", title: "Missing information", detail: m.text, source: doc.name, page: null }));
  ex.diligence_questions.slice(0, 3).forEach((q) => ev.push({ id: `ev-${Date.now()}-${ev.length}`, time: t, deal, kind: "question", severity: "active", title: "Diligence question created", detail: q.question, source: doc.name, page: q.page }));
  return ev;
}

function CIMAnalyzer({ go, notify }) {
  const { ws, addDocument, addConflicts, resolveConflict, addEvents, addResearch, audit } = useWorkspace();
  const pushQ = usePushToDiligence();
  const deal = "Project Falcon";
  const uploaded = ws.documents[deal] || [];
  const docs = [...uploaded, DEMO_CIM_DOC];
  const [docId, setDocId] = useState(uploaded[0]?.id || DEMO_CIM_DOC.id);
  const doc = docs.find((d) => d.id === docId) || DEMO_CIM_DOC;
  const ex = doc.extraction;
  const [page, setPage] = useState(48);
  const [review, setReview] = useState({});
  const [upload, setUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [fileErr, setFileErr] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [liveErr, setLiveErr] = useState(null);
  const mode = useAiMode();
  const pagesCited = useMemo(() => [...new Set(doc.findings.map((f) => f.page))].sort((a, b) => a - b), [doc]);
  const excerptsFor = (pg) => doc.findings.filter((f) => f.page === pg);
  const Cite = ({ p }) => p == null ? <Level level="unknown" small /> : <button onClick={() => setPage(p)} className="tabular-nums ml-1 px-1 rounded-lg" style={{ color: T.accent, background: page === p ? T.accentSoft : "transparent", border: `1px solid ${page === p ? T.accent + "55" : "transparent"}` }}>p. {p}</button>;
  const isDemo = doc.source === "demo";
  const conflictsHere = ws.conflicts.filter((c) => c.deal === deal);
  const pending = conflictsHere.filter((c) => c.status === "pending");
  const sections = [
    ["Investment highlights", ex.investment_highlights],
    ["Potential risks", ex.risks],
    ["Customer concentration", ex.customer_concentration],
    ["Market exposure", ex.end_market_exposure],
    ["Management", ex.management],
    ["Operations", ex.facilities_and_operations],
    ["EBITDA adjustments", ex.ebitda_adjustments],
    ["Inconsistencies", ex.inconsistencies],
  ];
  const reviewed = Object.values(review).filter(Boolean).length;
  const totalSections = sections.length + 2;
  const mark = (k) => setReview((r) => ({ ...r, [k]: !r[k] }));
  const onPick = (f) => { setFile(f); setFileErr(validateDocument(f)); };
  const analyze = async () => {
    if (!file || fileErr) return;
    setProcessing(true); setLiveErr(null);
    audit({ actor: "M. Ahmed", kind: "human", action: "Uploaded document for analysis", subject: `${deal} · ${file.name}` });
    const res = await analyzeCIM({ file }, { fallback: () => null });
    if (res.source !== "live" || !res.data) {
      setLiveErr(res.error || "The document could not be analyzed.");
      audit({ actor: "System", kind: "system", action: "Document analysis failed", subject: file.name, detail: res.error || "" });
      setProcessing(false); return;
    }
    const rec = { id: `doc-${Date.now()}`, name: file.name, source: "uploaded", deal, pages: res.data.pages, createdAt: new Date().toISOString(), meta: res.meta, findings: res.data.findings, extraction: res.data.extraction };
    const prev = docs[0];
    const conflicts = detectConflicts(deal, prev, rec);
    const events = eventsFromDocument(deal, rec, conflicts);
    addDocument(deal, rec); if (conflicts.length) addConflicts(conflicts); addEvents(events);
    addResearch({ id: `rs-${Date.now()}`, title: `${rec.extraction.company_name || "Document"}: ${file.name}`, type: "Uploaded Document", deal, thesis: "Aerospace Precision Components", producedBy: "Document analysis", created: rec.createdAt, updated: rec.createdAt, sources: [`${file.name} (${res.data.pages} pages, ${res.meta.pagesCited} cited)`], summary: rec.extraction.overview, findings: rec.extraction.risks.map((r) => r.text) });
    audit({ actor: "Claude document analysis", kind: "ai", action: `Extracted ${rec.extraction.metrics.length} metrics, ${rec.extraction.risks.length} risks, ${rec.extraction.diligence_questions.length} questions`, subject: file.name, detail: `${res.data.findings.length} cited findings across ${res.meta.pagesCited} pages · ${(res.meta.latencyMs / 1000).toFixed(1)}s${conflicts.length ? ` · ${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""} detected` : ""}` });
    setDocId(rec.id); setPage(rec.findings[0]?.page ?? null); setReview({}); setUpload(false); setFile(null); setProcessing(false);
    notify(`Document analyzed. ${events.length} intelligence events created.`);
  };
  const resolve = (c, status) => { resolveConflict(c.id, status); audit({ actor: "M. Ahmed", kind: "human", action: `Conflict on ${c.metric}: ${status === "accepted" ? "accepted new value" : status === "kept" ? "kept existing value" : "marked for review"}`, subject: deal, detail: `${c.previous.value} vs ${c.current.value}` }); };
  const fitLabel = { strong: ["Strong", T.green], potential: ["Potential", T.accent], weak: ["Weak", T.amber], unclear: ["Unclear", T.unknown] }[ex.investment_fit] || ["Unclear", T.unknown];
  const hasPrior = ex.metrics.some((m) => m.prior && m.prior.some(Boolean));
  return (
    <div>
      <div className="flex items-center gap-1 text-xs mb-2" style={{ color: T.muted }}>
        <span>Deals</span><ChevronRight size={12} /><button onClick={() => go("pipeline")} className="hover:underline">Deal Pipeline</button><ChevronRight size={12} /><span style={{ color: T.text }}>{deal}</span><ChevronRight size={12} /><span style={{ color: T.text }}>Preliminary CIM review</span>
      </div>
      <Card pad={false} style={{ marginBottom: 24 }}>
        <div className="flex items-stretch">
          <div className="flex-1 p-5" style={{ borderRight: `1px solid ${T.border}` }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="tracking-tight leading-tight" style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: 0 }}>{deal}</h1>
                <div className="text-xs mt-0.5" style={{ color: T.muted }}>{ex.company_name || "Falcon Precision Technologies"}. Aerospace precision components. Received via intermediary. Stage: Diligence.</div>
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  {docs.map((d) => <button key={d.id} onClick={() => { setDocId(d.id); setPage(d.findings[0]?.page ?? null); setReview({}); }} className="text-xs px-2 py-0.5 rounded-lg flex items-center gap-1.5" style={{ border: `1px solid ${docId === d.id ? T.accent : T.border}`, color: docId === d.id ? T.accent : T.text, background: docId === d.id ? T.accentSoft : "#fff" }}><FileText size={11} />{d.name}<span style={{ fontSize: 10, color: d.source === "demo" ? T.unknown : T.green }}>{d.source === "demo" ? "Demo" : "Uploaded"}</span></button>)}
                  <Btn small icon={Plus} onClick={() => setUpload(!upload)}>{upload ? "Close" : "Analyze new document"}</Btn>
                </div>
              </div>
              <Demo>{isDemo ? "Synthetic CIM and citations" : "Uploaded source"}</Demo>
            </div>
          </div>
          <div className="w-80 p-5 grid grid-cols-2 gap-x-5">
            <KV k="Investment fit" v={<span style={{ color: fitLabel[1] }}>{fitLabel[0]}</span>} />
            <KV k="Extraction confidence" v={isDemo ? "87%" : ex.confidence} />
            <KV k="Pages cited" v={`${doc.meta?.pagesCited ?? pagesCited.length} of ${doc.pages}`} />
            <KV k="Cited findings" v={doc.meta?.findingsCount ?? doc.findings.length} />
            <KV k="Sections reviewed" v={<span style={{ color: reviewed === totalSections ? T.green : T.amber }}>{reviewed} of {totalSections}</span>} />
            <KV k="Review owner" v="B. Kingsbury" />
          </div>
        </div>
      </Card>

      {upload && (
        <Card style={{ marginBottom: 24 }}>
          <SectionTitle right={mode !== "live" ? <Pri p="review" label="Live analysis not configured" /> : <Pri p="healthy" label="Live analysis available" />}>Analyze a new document</SectionTitle>
          <div className="p-3 mb-3" style={{ background: T.amberSoft, color: T.amber, borderRadius: 10, fontSize: 12.5 }}>This prototype sends uploaded documents to the configured AI provider for analysis. Do not upload confidential material without authorization. Use the synthetic samples to test the workflow.</div>
          <div className="grid grid-cols-12 gap-4 items-start">
            <div className="col-span-7">
              <label className="flex items-center gap-3 p-4 cursor-pointer" style={{ border: `1px dashed ${fileErr ? T.red : T.border}`, borderRadius: 12 }}>
                <input type="file" accept="application/pdf,.pdf" className="hidden" onChange={(e) => onPick(e.target.files?.[0] || null)} disabled={processing} />
                <FileText size={20} style={{ color: T.muted }} />
                <span style={{ fontSize: 13 }}>{file ? <span style={{ color: T.text }}>{file.name} <span style={{ color: T.muted }}>· {(file.size / 1024).toFixed(0)} KB</span></span> : <span style={{ color: T.muted }}>Choose a PDF (up to 3 MB, up to 100 pages)</span>}</span>
              </label>
              {fileErr && <div style={{ fontSize: 12, color: T.red, marginTop: 6 }}>{fileErr}</div>}
              {liveErr && !processing && <div className="flex items-center justify-between gap-2 px-3 py-2 mt-3" style={{ background: T.amberSoft, color: T.amber, borderRadius: 10, fontSize: 12 }}><span>{liveErr} The existing analysis remains available.</span>{file && !fileErr && <button onClick={analyze} className="underline shrink-0">Retry</button>}</div>}
              <div className="flex items-center gap-2 mt-3"><Btn primary icon={processing ? Loader2 : Play} onClick={analyze} disabled={!file || Boolean(fileErr) || processing || mode !== "live"}>{processing ? "Analyzing document" : "Analyze document"}</Btn><Btn onClick={() => { setUpload(false); setFile(null); setFileErr(null); }} disabled={processing}>Cancel</Btn></div>
              {processing && <div style={{ marginTop: 12 }}><ProcessingStages stages={DOC_STAGES} label="Analyzing CIM..." /></div>}
            </div>
            <div className="col-span-5" style={{ fontSize: 12.5, color: T.muted, lineHeight: 1.6 }}>
              <div style={{ fontWeight: 600, color: T.text, marginBottom: 4 }}>How it works</div>
              Pass one reads the PDF with page citations enabled and records each finding with its page and excerpt. Pass two organizes those findings into the deal record and cannot add a claim that was not cited. New figures are compared with the existing record; differences become conflicts for you to resolve.
              <div style={{ marginTop: 8 }}>Synthetic samples: <a href="/samples/falcon-cim-synthetic.pdf" download style={{ color: T.accent }}>Falcon CIM (8 pages)</a> · <a href="/samples/falcon-august-operating-report.pdf" download style={{ color: T.accent }}>August operating report (3 pages)</a></div>
            </div>
          </div>
        </Card>
      )}

      {pending.length > 0 && (
        <Card style={{ marginBottom: 24, borderLeft: `3px solid ${T.red}` }}>
          <SectionTitle right={<Pri p="critical" label={`${pending.length} pending`} />}>Data conflicts</SectionTitle>
          <div className="space-y-3">
            {pending.map((c) => (
              <div key={c.id} className="grid grid-cols-12 gap-4 p-3" style={{ background: T.redSoft, borderRadius: 10 }}>
                <div className="col-span-2"><div style={{ fontSize: 11, color: T.red }}>Metric</div><div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{c.metric}</div></div>
                <div className="col-span-2"><div style={{ fontSize: 11, color: T.muted }}>Previous</div><div className="tabular-nums" style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{c.previous.value}</div><div style={{ fontSize: 11, color: T.muted }}>{c.previous.source}, p.{c.previous.page}{c.previous.period ? ` · ${c.previous.period}` : ""}</div></div>
                <div className="col-span-2"><div style={{ fontSize: 11, color: T.muted }}>New</div><div className="tabular-nums" style={{ fontSize: 15, fontWeight: 600, color: T.red }}>{c.current.value}</div><div style={{ fontSize: 11, color: T.muted }}>{c.current.source}, p.{c.current.page}{c.current.period ? ` · ${c.current.period}` : ""}</div></div>
                <div className="col-span-3"><div style={{ fontSize: 11, color: T.muted }}>Potential explanation</div><div style={{ fontSize: 12, color: T.text }}>{c.explanation}</div><div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Required action: {c.action}</div></div>
                <div className="col-span-3 flex flex-col gap-1.5 justify-center"><Btn small primary onClick={() => resolve(c, "accepted")}>Accept new value</Btn><Btn small onClick={() => resolve(c, "kept")}>Keep existing value</Btn><Btn small onClick={() => resolve(c, "review")}>Mark for review</Btn></div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 11, color: T.muted, marginTop: 8 }}>Neither value is overwritten. Every resolution is recorded in the audit trail.</div>
        </Card>
      )}

      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-8 space-y-3">
          <Card pad={false}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, background: "#fafaf8" }}>
              <span className="text-xs font-medium" style={{ color: T.text }}>{isDemo ? "Financial summary as presented in CIM ($ millions)" : `Financial summary extracted from ${doc.name}`}</span>
              <Legend levels={["confirmed", "estimated", "unknown"]} />
            </div>
            <table className="w-full text-xs">
              <thead><tr style={{ color: T.muted }}>{(hasPrior ? ["", "FY2023", "FY2024", "FY2025", "Growth / change", "Source", "Status"] : ["Metric", "Period", "Value", "Source", "Confidence", "Status"]).map((h, i) => <th key={i} className={`font-medium px-3 py-1 ${hasPrior ? (i >= 1 && i <= 4 ? "text-right" : "text-left") : (i === 2 ? "text-right" : "text-left")}`} style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
              <tbody>{ex.metrics.map((m, i) => {
                const risk = m.flag === "risk"; const unknown = m.status === "unknown";
                return hasPrior ? (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}`, background: risk ? T.redSoft : "transparent" }}>
                    <td className="px-3 py-1 font-medium" style={{ color: unknown ? T.unknown : T.text, paddingLeft: /adj/i.test(m.label) ? 20 : 12 }}>{m.label}</td>
                    <td className="px-3 py-1 text-right tabular-nums" style={{ color: T.muted }}>{m.prior?.[0] || ""}</td>
                    <td className="px-3 py-1 text-right tabular-nums" style={{ color: T.muted }}>{m.prior?.[1] || ""}</td>
                    <td className="px-3 py-1 text-right tabular-nums font-semibold" style={{ color: unknown ? T.unknown : risk ? T.red : T.text }}>{m.value}</td>
                    <td className="px-3 py-1 text-right tabular-nums" style={{ color: (m.change || "").startsWith("+") || /^\d/.test(m.change || "") ? T.green : T.muted }}>{m.change || ""}</td>
                    <td className="px-3 py-1"><Cite p={m.page} /></td>
                    <td className="px-3 py-1 text-right"><Level level={risk ? "risk" : LEVEL[m.status] ? m.status : "inferred"} small /></td>
                  </tr>
                ) : (
                  <tr key={i} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <td className="px-3 py-1 font-medium" style={{ color: unknown ? T.unknown : T.text }}>{m.label}</td>
                    <td className="px-3 py-1" style={{ color: T.muted }}>{m.period || ""}</td>
                    <td className="px-3 py-1 text-right tabular-nums font-semibold" style={{ color: unknown ? T.unknown : T.text }}>{m.value}</td>
                    <td className="px-3 py-1"><Cite p={m.page} /></td>
                    <td className="px-3 py-1"><Conf v={m.confidence[0].toUpperCase() + m.confidence.slice(1)} /></td>
                    <td className="px-3 py-1"><Level level={LEVEL[m.status] ? m.status : "inferred"} small /></td>
                  </tr>
                );
              })}
              {ex.metrics.length === 0 && <tr><td colSpan={7} className="px-3 py-4 text-center" style={{ color: T.muted }}>No financial metrics were cited in this document.</td></tr>}
              </tbody>
            </table>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {sections.map(([h, items]) => (
              <Card key={h} pad={false}>
                <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <span className="text-xs font-medium" style={{ color: h === "Potential risks" || h === "Inconsistencies" ? T.red : T.text }}>{h}{h === "Inconsistencies" && items.length > 0 ? ` (${items.length})` : ""}</span>
                  <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: review[h] ? T.green : T.muted }}><input type="checkbox" checked={!!review[h]} onChange={() => mark(h)} /> {review[h] ? "Reviewed" : "Mark reviewed"}</label>
                </div>
                <ul className="px-3 py-2 space-y-1.5 text-xs" style={{ color: T.text }}>
                  {items.length === 0 && <li style={{ color: T.muted }}>{h === "Inconsistencies" ? "No internal inconsistencies identified." : "Not addressed in this document."}</li>}
                  {items.map((it, i) => <li key={i} className="flex items-start justify-between gap-2"><span>{it.text}<Cite p={it.page} /></span><Level level={it.severity ? "risk" : LEVEL[it.status] ? it.status : "inferred"} small /></li>)}
                </ul>
              </Card>
            ))}
            <Card pad={false}>
              <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}><span className="text-xs font-medium" style={{ color: T.text }}>Key diligence questions</span><label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: review.q ? T.green : T.muted }}><input type="checkbox" checked={!!review.q} onChange={() => mark("q")} /> {review.q ? "Reviewed" : "Mark reviewed"}</label></div>
              <ul className="px-3 py-2 space-y-1.5 text-xs" style={{ color: T.text }}>{ex.diligence_questions.map((q, i) => <li key={i} className="flex items-start justify-between gap-2"><span>{q.question}<Cite p={q.page} /></span><span className="shrink-0 flex items-center gap-1"><span style={{ fontSize: 10.5, color: T.muted }}>{q.workstream}</span><Sev v={q.severity[0].toUpperCase() + q.severity.slice(1)} /></span></li>)}</ul>
              {ex.diligence_questions.length > 0 && <div className="px-3 pb-2"><Btn small icon={ClipboardCheck} onClick={() => pushQ(ex.diligence_questions.map((q) => ({ deal, question: q.question, workstream: q.workstream, source: q.page ? `${isDemo ? "CIM" : doc.name} p.${q.page}` : doc.name, page: q.page, severity: q.severity })), isDemo ? "CIM Analyzer (demo)" : `CIM Analyzer (${doc.name})`, notify)}>Push to diligence</Btn></div>}
            </Card>
            <Card pad={false}>
              <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}><span className="text-xs font-medium" style={{ color: T.unknown }}>Missing information</span><label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: review.m ? T.green : T.muted }}><input type="checkbox" checked={!!review.m} onChange={() => mark("m")} /> {review.m ? "Reviewed" : "Mark reviewed"}</label></div>
              <ul className="px-3 py-2 space-y-1.5 text-xs">{ex.missing_information.map((m, i) => <li key={i} className="flex items-start justify-between gap-2"><span><span style={{ color: T.unknown }}>{m.text}</span><span style={{ color: T.muted }}> · {m.why_it_matters}</span></span><Level level="unknown" small /></li>)}{ex.missing_information.length === 0 && <li style={{ color: T.muted }}>No gaps identified.</li>}</ul>
            </Card>
          </div>
        </div>
        <div className="col-span-4 space-y-3">
          <Card pad={false}>
            <div className="px-3 py-1.5 text-xs font-medium flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, background: "#fafaf8", color: T.text }}><span>Source</span><span style={{ color: T.accent }}>{page != null ? `Page ${page}` : "No page"}</span></div>
            <div className="p-3">
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>{doc.name} · {isDemo ? "Synthetic" : "Uploaded"} · {excerptsFor(page).length} cited finding{excerptsFor(page).length === 1 ? "" : "s"} on this page</div>
              {page == null ? <div style={{ fontSize: 12, color: T.unknown }}>This item has no supporting page in the document. It is recorded as unknown, not as a finding.</div> : excerptsFor(page).length === 0 ? <div style={{ fontSize: 12, color: T.muted }}>No excerpt captured for this page.</div> : excerptsFor(page).map((f, i) => (
                <div key={i} className="pb-3 mb-3" style={{ borderBottom: i < excerptsFor(page).length - 1 ? `1px solid ${T.border}` : "none" }}>
                  {!isDemo && <div style={{ fontSize: 11.5, color: T.text, marginBottom: 4 }}><span style={{ color: T.muted }}>Claim: </span>{f.text}</div>}
                  <p className="text-xs leading-relaxed" style={{ color: T.text, fontFamily: "Georgia, serif" }}>{f.excerpt || f.text}</p>
                </div>
              ))}
              <div className="flex items-center gap-2" style={{ fontSize: 11, color: T.muted }}><Level level="confirmed" small /> Extraction status: {isDemo ? "synthetic demonstration excerpt" : "cited by the model, verify against the page"}</div>
            </div>
          </Card>
          <Card pad={false}>
            <div className="px-3 py-1.5 text-xs font-medium" style={{ borderBottom: `1px solid ${T.border}`, background: "#fafaf8", color: T.text }}>Pages cited</div>
            <div className="p-2 flex flex-wrap gap-1">{pagesCited.map((pg) => <button key={pg} onClick={() => setPage(pg)} className="text-xs px-2 py-1 rounded-lg tabular-nums" style={{ border: `1px solid ${page === pg ? T.accent : T.border}`, color: page === pg ? T.accent : T.text }}>p. {pg}</button>)}</div>
          </Card>
          {conflictsHere.filter((c) => c.status !== "pending").length > 0 && (
            <Card pad={false}>
              <div className="px-3 py-1.5 text-xs font-medium" style={{ borderBottom: `1px solid ${T.border}`, background: "#fafaf8", color: T.text }}>Resolved conflicts</div>
              <div className="p-3 space-y-1.5">{conflictsHere.filter((c) => c.status !== "pending").map((c) => <div key={c.id} style={{ fontSize: 12 }}><span style={{ color: T.text }}>{c.metric}</span> <span style={{ color: T.muted }}>{c.previous.value} vs {c.current.value}</span> <Pri p={c.status === "review" ? "review" : "healthy"} label={c.status === "accepted" ? "New value accepted" : c.status === "kept" ? "Existing kept" : "For review"} /></div>)}</div>
            </Card>
          )}
          <Card>
            <div className="text-xs font-medium mb-1" style={{ color: T.text }}>Analyst sign-off</div>
            <div className="text-xs mb-2" style={{ color: T.muted }}>Extraction is locked for the IC memo only after every section is marked reviewed by a member of the deal team.</div>
            <div className="flex flex-col gap-1.5">
              <Btn primary disabled={reviewed < totalSections} onClick={() => { audit({ actor: "M. Ahmed", kind: "human", action: "Locked extraction for IC memo", subject: doc.name }); notify("Extraction locked for IC memo. Reviewed by B. Kingsbury."); }}>Lock extraction for IC memo</Btn>
              <Btn icon={ShieldAlert} onClick={() => go("redteam")}>Open Red Team findings</Btn>
              <Btn icon={FileSignature} onClick={() => go("icmemo")}>Open IC memo draft</Btn>
              <Btn icon={Download} onClick={() => { const secRows = (items) => items.map((it) => [it.text, pageLabel(it.page), statusLabel(it.severity ? "risk" : it.status), cap(it.confidence)]); buildPdf({ filename: `cim-review-${deal.replace(/\s+/g, "-").toLowerCase()}.pdf`, title: `Preliminary CIM Review: ${deal}`, subtitle: `${ex.company_name || ""} · Source: ${doc.name} (${doc.pages} pages, ${pagesCited.length} cited)`, dataStatus: isDemo ? "Synthetic CIM and citations" : "Uploaded document · AI extraction", sections: [
                { heading: "Overview", paragraphs: [ex.overview, `Investment fit: ${fitLabel[0]}. Extraction confidence: ${isDemo ? "high" : ex.confidence}.`] },
                { heading: "Financial summary", table: { head: hasPrior ? ["Metric", "FY2023", "FY2024", "FY2025", "Change", "Page", "Status"] : ["Metric", "Period", "Value", "Page", "Status", "Confidence"], rows: ex.metrics.map((m) => hasPrior ? [m.label, m.prior?.[0] || "", m.prior?.[1] || "", m.value, m.change || "", pageLabel(m.page), statusLabel(m.flag === "risk" ? "risk" : m.status)] : [m.label, m.period || "", m.value, pageLabel(m.page), statusLabel(m.status), cap(m.confidence)]) } },
                ...sections.filter(([, items]) => items.length).map(([h, items]) => ({ heading: h, table: { head: ["Finding", "Page", "Status", "Confidence"], rows: secRows(items) } })),
                { heading: "Key diligence questions", table: { head: ["Question", "Workstream", "Severity", "Page"], rows: ex.diligence_questions.map((q) => [q.question, q.workstream, cap(q.severity), pageLabel(q.page)]) } },
                { heading: "Missing information", table: { head: ["Item", "Why it matters", "Status"], rows: ex.missing_information.map((m) => [m.text, m.why_it_matters, "Unknown"]) } },
                { heading: "Data conflicts", table: { head: ["Metric", "Previous", "New", "Status"], rows: conflictsHere.map((cf) => [cf.metric, `${cf.previous.value} (${cf.previous.source}, p.${cf.previous.page})`, `${cf.current.value} (${cf.current.source}, p.${cf.current.page})`, cap(cf.status)]) }, note: conflictsHere.length ? "" : "No conflicts recorded." },
                { heading: "Sources", table: { head: ["Page", "Cited excerpt"], rows: doc.findings.slice(0, 40).map((f) => [String(f.page), (f.excerpt || f.text).slice(0, 220)]) } },
              ] }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported CIM review (PDF)", subject: doc.name }); }}>Export review PDF</Btn>
              <Btn icon={Download} onClick={() => { downloadWorkbook(`financial-extraction-${deal.replace(/\s+/g, "-").toLowerCase()}.xlsx`, [{ name: "Financials", columns: ["Metric", "Period", "Value", "Prior 1", "Prior 2", "Change", "Source", "Page", "Status", "Confidence"], rows: ex.metrics.map((m) => ({ Metric: m.label, Period: m.period || "", Value: m.value, "Prior 1": m.prior?.[0] || "", "Prior 2": m.prior?.[1] || "", Change: m.change || "", Source: doc.name, Page: pageLabel(m.page), Status: statusLabel(m.flag === "risk" ? "risk" : m.status), Confidence: cap(m.confidence) })) }, { name: "Risk register", columns: ["Risk", "Severity", "Source", "Page", "Status", "Confidence"], rows: ex.risks.map((r) => ({ Risk: r.text, Severity: cap(r.severity), Source: doc.name, Page: pageLabel(r.page), Status: statusLabel(r.status), Confidence: cap(r.confidence) })) }, { name: "Cited findings", columns: ["Page", "Claim", "Excerpt"], rows: doc.findings.map((f) => ({ Page: f.page, Claim: f.text, Excerpt: f.excerpt })) }], { dataStatus: isDemo ? "Synthetic CIM" : `Uploaded document · ${doc.name}` }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported financial extraction (XLSX)", subject: doc.name }); }}>Financials XLSX</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Red Team ---------- */
const DEMO_RED_TEAM = {
  findings: [
    { assumption: "Aerospace growth will remain strong.", challenge: "67% of projected growth depends on two programs. A delay on either removes most of the plan's upside.", evidence: ["CIM p. 58", "Market Research #14"], test_performed: "18-month slip on one program reduces FY2028 revenue from $53M to $46M.", severity: "medium", confidence: "medium", finding_type: "unresolved_uncertainty", required_resolution: "Build a downside case with an 18-month slip on either program." },
    { assumption: "Customer relationships are highly durable.", challenge: "Top customer is 31% of sales; the agreement expires within 24 months of an expected close. Renewal pricing is not disclosed.", evidence: ["CIM p. 48", "Contract summary (data room)"], test_performed: "Prior renewals: no pricing history in CIM. Requested from management.", severity: "high", confidence: "high", finding_type: "adverse_evidence", required_resolution: "Obtain Customer A renewal terms and pricing history." },
    { assumption: "EBITDA adjustments are reasonable.", challenge: "$740K of adjusted EBITDA relates to items that may recur; relocation costs appeared in two of the last three years.", evidence: ["CIM p. 71", "Quality of earnings draft"], test_performed: "FY2023 and FY2024 adjustments include $180K and $210K of similar items.", severity: "high", confidence: "high", finding_type: "adverse_evidence", required_resolution: "Reconcile each adjustment against FY2023 and FY2024 in the QoE." },
  ],
  overall_assessment: "Investable, but three items require resolution before a binding offer",
  critical_management_questions: ["What are Customer A's renewal terms, and has pricing been renegotiated in prior renewals?", "Which of the $740K adjustments recurred in FY2023 or FY2024, and why?", "What is the downside case if one of the two growth programs slips by 18 months?"],
  bull_case: [["FY2028 revenue", "$53M (12% CAGR)"], ["Adjusted EBITDA", "$5.1M, expanding with mix"], ["Customer A", "Long-standing, sole-source on qualified parts"], ["Growth programs", "Two platform ramps with public OEM backlog"], ["Valuation view", "Upper half of $42M to $48M range"], ["Exit thesis", "Strategic buyers value AS9100 capacity"]].map(([dimension, view]) => ({ dimension, view })),
  bear_case: [["FY2028 revenue", "$44M to $46M (5% to 6% CAGR) if one program slips"], ["Adjusted EBITDA", "$4.4M if $740K adjustments recur"], ["Customer A", "31% share, renewal within 24 months, pricing undisclosed"], ["Growth programs", "67% of growth from two programs; schedule risk not modeled"], ["Valuation view", "Lower half of range, with earn-out on Customer A renewal"], ["Exit thesis", "Concentration discount likely persists at exit"]].map(([dimension, view]) => ({ dimension, view })),
  gating_questions: ["Customer A renewal terms", "Recurrence of adjustments", "Program slip downside case"],
  confidence: "high",
};
const FALCON_THESIS = "Falcon represents a high-quality precision manufacturer benefiting from durable aerospace demand and strong technical barriers.";
function RedTeam({ go }) {
  const { ws, setRedTeam, setDisposition, audit } = useWorkspace();
  const pushQ = usePushToDiligence();
  const deal = "Project Falcon";
  const stored = ws.redTeam[deal] || null;
  const [phase, setPhase] = useState(stored?.result ? "done" : "idle");
  const [compare, setCompare] = useState(false);
  const [liveErr, setLiveErr] = useState(null);
  const result = stored?.result || null;
  const source = stored?.source || "demo";
  const meta = stored?.meta || null;
  const disp = stored?.dispositions || {};
  const run = async () => {
    setPhase("running"); setLiveErr(null);
    audit({ actor: "M. Ahmed", kind: "human", action: "Ran Red Team review", subject: deal });
    const res = await runRedTeam({ thesis: FALCON_THESIS, context: DEAL_CONTEXT[deal] }, { fallback: () => DEMO_RED_TEAM });
    setRedTeam(deal, { result: res.data, source: res.source, meta: res.meta, dispositions: {}, createdAt: new Date().toISOString() });
    setLiveErr(res.error || null); setPhase("done");
    audit({ actor: res.source === "live" ? "Claude Red Team" : "Demo Red Team", kind: res.source === "live" ? "ai" : "system", action: `Created ${res.data.findings.length} findings`, subject: deal, detail: res.data.overall_assessment });
  };
  const dispose = (i, d) => { setDisposition(deal, i, d); audit({ actor: "M. Ahmed", kind: "human", action: `Marked finding #${i + 1} ${d}`, subject: deal }); };
  const A = result ? result.findings.map((f) => ({ a: f.assumption, ch: f.challenge, ev: f.evidence || [], sev: f.severity[0].toUpperCase() + f.severity.slice(1), test: f.test_performed, type: f.finding_type, resolve: f.required_resolution, conf: f.confidence })) : [];
  const hi = A.filter((x) => x.sev === "High").length, med = A.filter((x) => x.sev === "Medium").length, lo = A.filter((x) => x.sev === "Low").length;
  const TYPE_LABEL = { adverse_evidence: "Adverse evidence", unresolved_uncertainty: "Unresolved uncertainty", missing_information: "Missing information" };
  const bg = "#182231", panel = "#202C3D", line = "#2C3A4E", text = "#E6EAF0", mutedD = "#93A0B4", link = "#8FB6E3", warn = "#E07A6C", amberD = "#E0B36C", greenD = "#7FC59F";
  const DBtn = ({ children, onClick, active }) => <button onClick={onClick} style={{ fontSize: 11.5, padding: "4px 9px", borderRadius: 6, border: `1px solid ${active ? text : line}`, color: active ? bg : text, background: active ? text : "transparent" }}>{children}</button>;
  const disposed = Object.keys(disp).length;
  return (
    <div style={{ background: bg, minHeight: "calc(100vh - 80px)", color: text, borderRadius: R.hero, padding: 28, margin: -4 }}>
      <div className="flex items-start justify-between" style={{ marginBottom: 24 }}>
        <div>
          <div className="flex items-center gap-1" style={{ color: mutedD, fontSize: 12, marginBottom: 6 }}><span>Deals</span><ChevronRight size={12} /><button onClick={() => go("cim")} className="hover:underline">Project Falcon</button><ChevronRight size={12} /><span style={{ color: text }}>Red Team</span></div>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: 10.5, letterSpacing: "0.12em", padding: "3px 8px", borderRadius: 4, background: "rgba(224,122,108,0.15)", color: warn, fontWeight: 600 }}>ADVERSARIAL REVIEW</span>
            <h1 className="tracking-tight" style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Red Team Analysis</h1>
          </div>
          <p style={{ color: mutedD, fontSize: 13, margin: "4px 0 0" }}>Independent challenge to the investment thesis. The reviewing agent is instructed to find contrary evidence, not to confirm the case.</p>
        </div>
        <div className="flex items-center gap-3">
          {phase === "done" && <div className="text-right"><div style={{ fontSize: 20, fontWeight: 650, lineHeight: 1 }}>{A.length} findings</div><div style={{ fontSize: 12, color: mutedD }}><span style={{ color: warn }}>{hi} High</span> · <span style={{ color: amberD }}>{med} Medium</span>{lo ? <span> · {lo} Low</span> : null}</div></div>}
          <span style={{ fontSize: 11, padding: "2px 9px", borderRadius: 999, background: source === "live" ? "rgba(127,197,159,0.15)" : panel, color: source === "live" ? greenD : mutedD }}>{source === "live" ? `Live review${meta?.latencyMs ? ` · ${(meta.latencyMs / 1000).toFixed(1)}s` : ""}` : "Synthetic analysis"}</span>
          {phase !== "running" && <button onClick={run} disabled={phase === "running"} className="flex items-center gap-1.5 font-medium disabled:opacity-60" style={{ fontSize: 13, padding: "6px 12px", borderRadius: 6, background: T.accent, color: "#fff" }}>{phase === "running" ? <Loader2 size={13} className="animate-spin" /> : <ShieldAlert size={13} />}{phase === "running" ? "Reviewing" : phase === "done" ? "Re-run review" : "Run Red Team review"}</button>}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4" style={{ marginBottom: 24 }}>
        <div className="col-span-8 p-4" style={{ background: panel, borderRadius: 12 }}>
          <div style={{ color: mutedD, fontSize: 11, marginBottom: 4 }}>Thesis under review (IC memo draft v3)</div>
          <p style={{ fontSize: 15, margin: 0, lineHeight: 1.5 }}>"{FALCON_THESIS}"</p>
        </div>
        <div className="col-span-4 p-4 grid grid-cols-2 gap-x-4 gap-y-2" style={{ background: panel, borderRadius: 12, fontSize: 12 }}>
          {[["Reviewer", source === "live" ? "Claude Red Team review" : "Demo Red Team"], ["Scope", "CIM extraction, diligence status, open questions"], ["Method", "One adversarial structured request"], ["Deal team response", phase === "done" ? `${disposed} of ${A.length} findings` : "Not started"]].map(([k, v]) => <div key={k}><div style={{ color: mutedD, fontSize: 11 }}>{k}</div><div>{v}</div></div>)}
        </div>
      </div>
      {phase === "idle" && (
        <div className="p-10 text-center" style={{ border: `1px dashed ${line}`, borderRadius: 8, color: mutedD, fontSize: 13 }}>
          <div style={{ color: text, fontSize: 14, fontWeight: 500 }}>No Red Team review exists for thesis version 3</div>
          <div style={{ marginTop: 4 }}>The review extracts assumptions, searches for contrary evidence, tests each against prior-year data, and issues a verdict with critical questions.</div>
        </div>
      )}
      {phase === "running" && (
        <div className="p-4 space-y-2" style={{ background: panel, borderRadius: 12, fontSize: 13 }}>
          {["Extracting explicit and implicit assumptions from the thesis", "Searching CIM and data room for contrary evidence", "Testing EBITDA adjustments against FY2023 and FY2024", "Scoring severity and drafting verdict"].map((s) => <div key={s} className="flex items-center gap-2"><Loader2 size={13} className="animate-spin" style={{ color: mutedD }} /> {s}</div>)}
        </div>
      )}
      {phase === "done" && liveErr && <div className="flex items-center justify-between gap-2 px-3 py-2" style={{ background: "rgba(224,179,108,0.14)", color: amberD, borderRadius: 10, fontSize: 12, marginBottom: 16 }}><span>{liveErr} Showing the synthetic demonstration review instead.</span><button onClick={run} className="underline">Retry live review</button></div>}
      {phase === "done" && result && (
        <>
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(3, Math.max(1, A.length))}, minmax(0, 1fr))`, marginBottom: 24 }}>
            {A.map((x, i) => (
              <div key={i} className="p-4 flex flex-col" style={{ background: panel, borderRadius: 12, borderTop: `3px solid ${x.sev === "High" ? warn : amberD}` }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}><span className="tabular-nums" style={{ color: mutedD, fontSize: 11 }}>0{i + 1} · {TYPE_LABEL[x.type] || ""}</span><span style={{ fontSize: 11, fontWeight: 600, color: x.sev === "High" ? warn : x.sev === "Medium" ? amberD : greenD, letterSpacing: "0.06em" }}>{x.sev.toUpperCase()}</span></div>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, marginBottom: 12 }}>{x.a}</div>
                <div style={{ color: mutedD, fontSize: 11, marginBottom: 2 }}>Challenge</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{x.ch}</div>
                <div style={{ color: mutedD, fontSize: 11, marginBottom: 2 }}>Evidence</div>
                <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: 10 }}>{x.ev.map((e) => <span key={e} className="tabular-nums" style={{ fontSize: 11.5, padding: "2px 7px", borderRadius: 4, background: "rgba(143,182,227,0.12)", color: link }}>{e}</span>)}</div>
                <div style={{ color: mutedD, fontSize: 11, marginBottom: 2 }}>Test</div>
                <div style={{ fontSize: 12.5, color: mutedD, lineHeight: 1.5, marginBottom: 8 }}>{x.test}</div>
                <div style={{ color: mutedD, fontSize: 11, marginBottom: 2 }}>Required resolution</div>
                <div style={{ fontSize: 12.5, color: text, lineHeight: 1.5, marginBottom: 14 }}>{x.resolve}</div>
                <div className="mt-auto pt-3" style={{ borderTop: `1px solid ${line}` }}>
                  <div style={{ color: mutedD, fontSize: 11, marginBottom: 6 }}>Deal team disposition</div>
                  <div className="flex flex-wrap gap-1.5">{["Requires resolution", "Accept risk", "Reject finding"].map((d) => <DBtn key={d} active={disp[i] === d} onClick={() => dispose(i, d)}>{d}</DBtn>)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-12 gap-4" style={{ marginBottom: 24 }}>
            <div className="col-span-8 p-4" style={{ background: panel, borderRadius: 12 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}><span style={{ color: mutedD, fontSize: 11 }}>Verdict</span><span style={{ color: mutedD, fontSize: 11 }}>Confidence {result.confidence}. Advisory only; the investment team decides.</span></div>
              <div style={{ fontSize: 18, fontWeight: 650 }}>{result.overall_assessment}</div>
              <div style={{ color: mutedD, fontSize: 11, margin: "12px 0 4px" }}>Critical questions for management</div>
              <ol className="list-decimal pl-5 space-y-1" style={{ fontSize: 13 }}>{result.critical_management_questions.map((q2, n) => <li key={n}>{q2}</li>)}</ol>
              {result.gating_questions?.length > 0 && <div style={{ marginTop: 10 }}><div style={{ color: mutedD, fontSize: 11, marginBottom: 4 }}>Gating questions</div><div className="flex flex-wrap gap-1.5">{result.gating_questions.map((g, n) => <span key={n} style={{ fontSize: 11.5, padding: "2px 8px", borderRadius: 999, background: "rgba(224,122,108,0.14)", color: warn }}>{g}</span>)}</div></div>}
            </div>
            <div className="col-span-4 p-4 flex flex-col justify-between" style={{ background: panel, borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: mutedD }}>{disposed < A.length ? `${A.length - disposed} finding${A.length - disposed > 1 ? "s" : ""} awaiting deal team disposition` : "All findings dispositioned"}</div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={() => setCompare(!compare)} className="flex items-center justify-center gap-1.5 font-medium" style={{ fontSize: 13, padding: "7px 12px", borderRadius: 6, background: T.accent, color: "#fff" }}><GitCompare size={13} /> {compare ? "Hide bull vs bear" : "Compare bull vs bear case"}</button>
                <button onClick={() => { buildPdf({ filename: "red-team-report-project-falcon.pdf", title: `Red Team Report: ${deal}`, subtitle: `Adversarial review · ${source === "live" ? "Live review" : "Synthetic review"} · Confidence ${result.confidence}`, dataStatus: source === "live" ? "Live analysis on synthetic deal record" : "Synthetic analysis", sections: [
                  { heading: "Thesis under review", paragraphs: [FALCON_THESIS] },
                  { heading: "Verdict", paragraphs: [result.overall_assessment, "Advisory only; the investment team decides."] },
                  { heading: "Findings", table: { head: ["#", "Assumption", "Challenge", "Type", "Severity", "Evidence", "Test performed", "Required resolution", "Deal team disposition"], rows: A.map((x, i) => [String(i + 1), x.a, x.ch, TYPE_LABEL[x.type] || "", x.sev, x.ev.join("; "), x.test, x.resolve, disp[i] || "Pending"]) } },
                  { heading: "Critical management questions", bullets: result.critical_management_questions },
                  { heading: "Gating questions", bullets: result.gating_questions },
                  { heading: "Bull vs bear case", table: { head: ["Dimension", "Investment case", "Red Team case"], rows: result.bull_case.map((bc, n) => [bc.dimension, bc.view, (result.bear_case[n] || {}).view || ""]) } },
                ] }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported Red Team report (PDF)", subject: deal }); }} className="flex items-center justify-center gap-1.5" style={{ fontSize: 13, padding: "7px 12px", borderRadius: 6, border: `1px solid ${line}`, color: text }}><Download size={13} /> Export report PDF</button>
                <button onClick={() => { pushQ(result.critical_management_questions.map((q2, n) => ({ deal, question: q2, workstream: /adjust|ebitda|financ/i.test(q2) ? "Financial" : /program|downside|growth/i.test(q2) ? "Commercial" : "Commercial", source: A[n]?.ev?.[0] || "Red Team", page: Number((A[n]?.ev?.[0] || "").replace(/\D/g, "")) || null, severity: A[n]?.sev?.toLowerCase() || "high" })), source === "live" ? "Red Team (live)" : "Red Team (demo)"); go("diligence"); }} className="flex items-center justify-center gap-1.5" style={{ fontSize: 13, padding: "7px 12px", borderRadius: 6, border: `1px solid ${line}`, color: text }}><ClipboardCheck size={13} /> Push {result.critical_management_questions.length} questions to diligence</button>
              </div>
            </div>
          </div>
          {compare && (
            <div className="overflow-hidden" style={{ background: panel, borderRadius: 12 }}>
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead><tr><th className="text-left font-medium px-4 py-2.5" style={{ color: mutedD, borderBottom: `1px solid ${line}`, width: 170, fontSize: 11 }}>Dimension</th><th className="text-left font-medium px-4 py-2.5" style={{ color: greenD, borderBottom: `1px solid ${line}`, fontSize: 11 }}>Investment case</th><th className="text-left font-medium px-4 py-2.5" style={{ color: warn, borderBottom: `1px solid ${line}`, fontSize: 11 }}>Red Team case</th><th className="text-right font-medium px-4 py-2.5" style={{ color: mutedD, borderBottom: `1px solid ${line}`, fontSize: 11 }}></th></tr></thead>
                <tbody>{result.bull_case.map((bc, n) => { const be = result.bear_case[n] || result.bear_case.find((x) => x.dimension === bc.dimension) || { view: "" }; return <tr key={n} style={{ borderBottom: `1px solid ${line}` }}><td className="px-4 py-2.5 font-medium" style={{ color: mutedD }}>{bc.dimension}</td><td className="px-4 py-2.5">{bc.view}</td><td className="px-4 py-2.5">{be.view}</td><td className="px-4 py-2.5 text-right tabular-nums" style={{ color: mutedD }}>{n === 0 && source === "demo" ? "-$7M to -$9M" : ""}</td></tr>; })}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Due Diligence ---------- */
function Diligence({ go }) {
  const { ws, updateQuestion, audit } = useWorkspace();
  const questions = [...ws.questions, ...DEMO_QUESTIONS.filter((d) => !ws.questions.some((q) => q.question === d.question)).map((d, i) => ({ ...d, id: `demo-q-${i}` }))];
  const [filter, setFilter] = useState("All");
  const [wsFilter, setWsFilter] = useState("All");
  const shown = questions.filter((q) => (filter === "All" || q.status === filter) && (wsFilter === "All" || q.workstream === wsFilter));
  const openCount = questions.filter((q) => q.status !== "Answered").length;
  const { addQuestions } = useWorkspace();
  const setQ = (q, patch, label) => { if (q.id.startsWith("demo-q")) { const { id, ...rest } = q; const added = addQuestions([{ ...rest, ...patch }]); if (!added.length) updateQuestion(ws.questions.find((x) => x.question === q.question)?.id, patch); } else updateQuestion(q.id, patch); if (label) audit({ actor: "M. Ahmed", kind: "human", action: label, subject: q.question.slice(0, 60) }); };
  const cats = [
    ["Financial", 86, 142, 3, 1, "K. Hayes", DollarSign], ["Commercial", 72, 96, 9, 2, "C. Hren", Users], ["Operational", 64, 118, 8, 0, "G. Ott", Wrench], ["Legal", 58, 210, 11, 1, "Counsel", Gavel],
    ["Management", 45, 24, 6, 1, "B. Kingsbury", Users], ["Technology", 70, 61, 4, 0, "H. Shimp", Cpu], ["Cybersecurity", 30, 18, 3, 0, "Advisor", Shield], ["ESG", 52, 27, 3, 0, "A. Anton", Leaf],
  ];
  const overall = Math.round(cats.reduce((s, c) => s + c[1], 0) / cats.length);
  const health = (p, r) => (r > 0 ? "critical" : p < 50 ? "review" : "healthy");
  const hl = { critical: "At risk", review: "Watch", healthy: "Healthy" };
  return (
    <div>
      <PageHeader title="Due Diligence" sub="Project Falcon. Workstream status, open questions and material risks." crumbs={["Deals", "Due Diligence", "Project Falcon"]} demo="Demo data" right={<><Btn icon={Download} onClick={() => { downloadWorkbook("diligence-tracker-project-falcon.xlsx", [{ name: "Questions", columns: ["Workstream", "Question", "Status", "Severity", "Owner", "Source", "Page", "Created by", "Created", "Notes"], rows: questions.map((q) => ({ Workstream: q.workstream, Question: q.question, Status: q.status, Severity: cap(q.severity || "medium"), Owner: q.owner, Source: q.source, Page: pageLabel(q.page), "Created by": q.createdBy, Created: new Date(q.createdAt).toLocaleString(), Notes: q.notes || "" })) }, { name: "Workstreams", columns: ["Workstream", "Completion", "Documents", "Open questions", "Material risks", "Owner"], rows: cats.map((c) => ({ Workstream: c[0], Completion: `${c[1]}%`, Documents: c[2], "Open questions": c[3], "Material risks": c[4], Owner: c[5] })) }], { dataStatus: "Synthetic workstreams · session questions" }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported diligence tracker (XLSX)", subject: "Project Falcon" }); }}>Tracker XLSX</Btn><Btn icon={Download} onClick={() => { const rt = ws.redTeam["Project Falcon"]; const docs = ws.documents["Project Falcon"] || []; const latest = docs[0] || DEMO_CIM_DOC; downloadWorkbook("risk-register-project-falcon.xlsx", [{ name: "Risk register", columns: ["Risk", "Origin", "Severity", "Status", "Source", "Page", "Disposition"], rows: [...latest.extraction.risks.map((r) => ({ Risk: r.text, Origin: `Document: ${latest.name}`, Severity: cap(r.severity), Status: statusLabel(r.status), Source: latest.name, Page: pageLabel(r.page), Disposition: "" })), ...(rt?.result?.findings || []).map((f, i) => ({ Risk: `${f.assumption} ${f.challenge}`, Origin: "Red Team", Severity: cap(f.severity), Status: f.finding_type === "adverse_evidence" ? "Risk" : f.finding_type === "missing_information" ? "Unknown" : "Inferred", Source: (f.evidence || []).join("; "), Page: "", Disposition: rt.dispositions?.[i] || "Pending" })), ...[["Customer A concentration rose to 44% in latest month", "Commercial"], ["$740K EBITDA adjustments partially recurring", "Financial"], ["Change-of-control clause in Customer A agreement", "Legal"]].map(([t, w]) => ({ Risk: t, Origin: `Diligence workstream: ${w}`, Severity: "High", Status: "Risk", Source: "Data room (synthetic)", Page: "", Disposition: "" }))] }], { dataStatus: "Synthetic deal · session findings" }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported risk register (XLSX)", subject: "Project Falcon" }); }}>Risk register XLSX</Btn></>} />
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr", marginBottom: 24 }}>
        <Card className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
            <svg viewBox="0 0 36 36" width="72" height="72"><circle cx="18" cy="18" r="15.5" fill="none" stroke={T.soft} strokeWidth="3" /><circle cx="18" cy="18" r="15.5" fill="none" stroke={T.accent} strokeWidth="3" strokeDasharray={`${overall * 0.974} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" /></svg>
            <div className="absolute inset-0 flex items-center justify-center tabular-nums" style={{ fontSize: 17, fontWeight: 650, color: T.text }}>{overall}%</div>
          </div>
          <div><div style={{ color: T.muted, fontSize: 12 }}>Overall completion</div><div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>8 workstreams</div><div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>1,247 documents indexed · 312 tables extracted</div></div>
        </Card>
        <Metric k="Open questions" v={String(44 + openCount)} sub={`${openCount} tracked here, 11 in legal`} />
        <Metric k="Unresolved risks" v="8" />
        <Metric k="Material risks" v="3" color={T.red} />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Card pad={false} className="col-span-2">
          <table className="w-full" style={{ fontSize: 13 }}>
            <thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Workstream", "Health", "Completion", "Documents", "Open questions", "Material risks", "Owner"].map((h, i) => <th key={h} className={`font-medium px-4 py-2 ${i >= 3 && i <= 5 ? "text-right" : "text-left"}`} style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{cats.map(([n, pc, d, q, r, o, I]) => { const h = health(pc, r); return (
              <tr key={n} style={{ borderBottom: `1px solid ${T.border}` }} className="hover:bg-stone-50">
                <td className="px-4 py-2.5 font-medium" style={{ color: T.text }}><span className="flex items-center gap-2"><I size={14} strokeWidth={1.6} style={{ color: T.muted }} /> {n}</span></td>
                <td className="px-4 py-2.5"><Pri p={h} label={hl[h]} /></td>
                <td className="px-4 py-2.5"><div className="flex items-center gap-2"><div className="w-24 rounded" style={{ height: 4, background: T.soft }}><div className="rounded" style={{ height: 4, width: `${pc}%`, background: h === "healthy" ? T.green : h === "review" ? T.amber : T.accent }} /></div><span className="tabular-nums" style={{ color: T.muted, fontSize: 12 }}>{pc}%</span></div></td>
                <td className="px-4 py-2.5 tabular-nums text-right" style={{ color: T.muted }}>{d}</td>
                <td className="px-4 py-2.5 tabular-nums text-right" style={{ color: T.text }}>{q}</td>
                <td className="px-4 py-2.5 tabular-nums text-right font-semibold" style={{ color: r > 0 ? T.red : T.muted }}>{r || "0"}</td>
                <td className="px-4 py-2.5" style={{ color: T.muted }}>{o}</td>
              </tr>
            ); })}</tbody>
          </table>
        </Card>
        <div className="space-y-4">
          <Card>
            <SectionTitle>Material risks</SectionTitle>
            {[["Customer A concentration rose to 44% in latest month", "Commercial"], ["$740K EBITDA adjustments partially recurring", "Financial"], ["Change-of-control clause in Customer A agreement", "Legal"]].map(([t, w]) => <div key={t} className="flex items-start gap-2 py-2" style={{ borderBottom: `1px solid ${T.border}`, fontSize: 13 }}><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: T.red }} /><div><div style={{ color: T.text }}>{t}</div><div style={{ color: T.muted, fontSize: 11 }}>{w}</div></div></div>)}
            <div className="mt-3"><Btn small icon={ShieldAlert} onClick={() => go("redteam")}>Open Red Team</Btn></div>
          </Card>
          <Card>
            <SectionTitle>Completion by workstream</SectionTitle>
            <div style={{ height: 180 }}>
              <ResponsiveContainer>
                <BarChart data={cats.map((c) => ({ n: c[0].slice(0, 5), v: c[1] }))} margin={{ left: -20 }}>
                  <CartesianGrid stroke={T.border} vertical={false} />
                  <XAxis dataKey="n" tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: T.muted }} axisLine={false} tickLine={false} />
                  <RTooltip formatter={(v) => `${v}%`} />
                  <Bar dataKey="v" fill={T.accent} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
      <Card pad={false} style={{ marginTop: 24 }}>
        <div className="px-4 pt-4 flex items-center justify-between">
          <SectionTitle right={<span style={{ fontSize: 12, color: T.muted }}>{questions.length} tracked · {openCount} open</span>}>Diligence question tracker</SectionTitle>
        </div>
        <div className="px-4 pb-3 flex items-center gap-2">
          {["All", "Open", "In progress", "Answered"].map((f) => <button key={f} onClick={() => setFilter(f)} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: filter === f ? T.accentSoft : T.soft, color: filter === f ? T.accent : T.muted, fontWeight: filter === f ? 600 : 500 }}>{f}</button>)}
          <select value={wsFilter} onChange={(e) => setWsFilter(e.target.value)} className="bg-white ml-2" style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, border: `1px solid ${T.border}`, color: T.muted }}>{["All", "Financial", "Commercial", "Operational", "Legal", "Management", "Technology", "Cybersecurity", "ESG"].map((w) => <option key={w}>{w === "All" ? "All workstreams" : w}</option>)}</select>
          <span className="ml-auto" style={{ fontSize: 11, color: T.muted }}>Questions arrive from Company Analysis, Red Team and CIM Analyzer. Status and owner are human decisions.</span>
        </div>
        <table className="w-full" style={{ fontSize: 12.5 }}>
          <thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Question", "Workstream", "Source", "Severity", "Status", "Owner", "Created by"].map((h) => <th key={h} className="text-left font-medium px-4 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{shown.map((q) => (
            <tr key={q.id} style={{ borderBottom: `1px solid ${T.border}`, opacity: q.status === "Answered" ? 0.6 : 1 }}>
              <td className="px-4 py-2" style={{ color: T.text, maxWidth: 420 }}>{q.question}{q.deal && q.deal !== "Project Falcon" && <span style={{ color: T.muted }}> · {q.deal}</span>}</td>
              <td className="px-4 py-2" style={{ color: T.muted }}>{q.workstream}</td>
              <td className="px-4 py-2 tabular-nums" style={{ color: T.accent }}>{q.source}</td>
              <td className="px-4 py-2"><Sev v={(q.severity || "medium")[0].toUpperCase() + (q.severity || "medium").slice(1)} /></td>
              <td className="px-4 py-2"><select value={q.status} onChange={(e) => setQ(q, { status: e.target.value }, `Set question status to ${e.target.value}`)} className="bg-white" style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8, border: `1px solid ${T.border}`, color: q.status === "Answered" ? T.green : q.status === "In progress" ? T.amber : T.text }}>{["Open", "In progress", "Answered"].map((s) => <option key={s}>{s}</option>)}</select></td>
              <td className="px-4 py-2"><select value={q.owner} onChange={(e) => setQ(q, { owner: e.target.value }, `Assigned question to ${e.target.value}`)} className="bg-white" style={{ fontSize: 12, padding: "3px 8px", borderRadius: 8, border: `1px solid ${T.border}`, color: T.text }}>{["Unassigned", "C. Hren", "B. Kingsbury", "K. Hayes", "G. Ott", "Counsel", "M. Ahmed"].map((o) => <option key={o}>{o}</option>)}</select></td>
              <td className="px-4 py-2" style={{ color: T.muted, fontSize: 11.5 }}>{q.createdBy}</td>
            </tr>
          ))}
          {shown.length === 0 && <tr><td colSpan={7} className="px-4 py-6 text-center" style={{ color: T.muted }}>No questions match this filter.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* ---------- IC Memo ---------- */
const DEMO_MEMO = {
  sections: [
    ["Executive Summary", "Falcon Precision Technologies is an AS9100-certified manufacturer of precision aerospace components with $38.2M revenue and $5.1M adjusted EBITDA. The business fits MCM's aerospace precision thesis. Three items from the Red Team must be resolved before a final recommendation: Customer A renewal terms, recurring adjustments, and program schedule risk.", ["CIM p.23", "CIM p.71", "CIM p.48"]],
    ["Company Overview", "Founded 1987, two facilities in Ohio and Kansas, 168 employees, 42 CNC machines. Commercial aerospace 58%, defense 27%, industrial 15%.", ["CIM p.84", "CIM p.92", "CIM p.58"]],
    ["Investment Thesis", "Durable demand from qualified programs, technical barriers from certification and part qualification, and an under-invested commercial function that MCM's playbook can address.", ["CIM p.23"]],
    ["Strategic Fit", "Matches MCM criteria on revenue, EBITDA, margin, ownership and sector. Add-on opportunities exist among regional machining shops.", ["CIM p.23"]],
    ["Market", "Commercial aerospace build rates recovering; defense budgets stable. Two programs drive most projected growth.", ["CIM p.58"]],
    ["Financial Performance", "Revenue growth 8.1% (FY2025), gross margin 35.4%, capex $2.4M. Quality of earnings in progress.", ["CIM p.23", "CIM p.84"]],
    ["Value Creation Plan", "Systematic business development, pricing discipline on low-margin parts, third-shift capacity, one to two add-ons.", ["CIM p.84"]],
    ["Key Risks", "Customer concentration, program dependency, EBITDA adjustment quality, management succession.", ["CIM p.48", "CIM p.58", "CIM p.71", "CIM p.92"]],
    ["Red Team Findings", "Verdict: investable with three items requiring resolution. Two high-severity findings.", ["Red Team review"]],
    ["Deal Structure", "Majority recapitalization with rollover equity; earn-out tied to Customer A renewal under consideration.", []],
    ["Open Questions", "Seven open questions, listed in the diligence tracker, of which three are gating.", ["Diligence tracker"]],
    ["Recommendation", "Proceed to final diligence. Do not submit a binding offer until the three gating items are resolved.", []],
  ].map(([title, body, citations]) => ({ title, body, citations })),
  unsupported_claims: ["\"Defense budgets stable\" lacks a cited source.", "Add-on target count not yet validated."],
  gating_items: ["Customer A renewal terms", "Recurrence of adjustments", "Program slip downside case"],
  next_decision: "Proceed to final diligence; no binding offer until gating items are resolved.",
  confidence: "medium",
};
function memoContext(ws) {
  const deal = "Project Falcon";
  const docs = ws.documents[deal] || [];
  const latest = docs[0] || DEMO_CIM_DOC;
  const ex = latest.extraction;
  const rt = ws.redTeam[deal];
  const qs = [...ws.questions.filter((q) => q.deal === deal), ...DEMO_QUESTIONS];
  const conflicts = ws.conflicts.filter((c) => c.deal === deal);
  const lines = [];
  lines.push(DEAL_CONTEXT[deal]);
  lines.push(`\nLATEST DOCUMENT RECORD (${latest.name}, ${latest.source}):\nOverview: ${ex.overview}\nMetrics: ${ex.metrics.filter((m) => m.status !== "unknown").map((m) => `${m.label}${m.period ? ` ${m.period}` : ""} = ${m.value} (p.${m.page}, ${m.status})`).join("; ")}\nRisks: ${ex.risks.map((r) => `${r.text} (p.${r.page}, ${r.severity})`).join("; ")}\nMissing: ${ex.missing_information.map((m) => m.text).join("; ")}`);
  if (rt?.result) lines.push(`\nRED TEAM (${rt.source}): ${rt.result.overall_assessment}. Findings: ${rt.result.findings.map((f, i) => `#${i + 1} ${f.assumption} -> ${f.challenge} [${f.severity}; disposition: ${rt.dispositions?.[i] || "pending"}]`).join(" | ")}`);
  else lines.push("\nRED TEAM: not yet run this session.");
  lines.push(`\nDILIGENCE QUESTIONS: ${qs.map((q) => `${q.question} [${q.workstream}, ${q.status}, ${q.source}]`).join(" | ")}`);
  if (conflicts.length) lines.push(`\nDATA CONFLICTS: ${conflicts.map((c) => `${c.metric}: ${c.previous.value} (${c.previous.source}) vs ${c.current.value} (${c.current.source}), status ${c.status}`).join(" | ")}`);
  lines.push("\nVALUE CREATION IDEAS: systematic business development, pricing discipline, third shift, add-ons. DEAL STRUCTURE UNDER CONSIDERATION: majority recapitalization with rollover; earn-out tied to Customer A renewal.");
  return lines.join("\n");
}
function ICMemo({ notify }) {
  const { ws, setMemo, audit } = useWorkspace();
  const deal = "Project Falcon";
  const stored = ws.memos[deal];
  const memo = stored?.current?.data || DEMO_MEMO;
  const source = stored?.current?.source || "demo";
  const meta = stored?.current?.meta || null;
  const previous = stored?.previous?.data || null;
  const [open, setOpen] = useState(0);
  const [busy, setBusy] = useState(false);
  const [liveErr, setLiveErr] = useState(null);
  const [showSources, setShowSources] = useState(false);
  const [compare, setCompare] = useState(false);
  const gen = async () => {
    setBusy(true); setLiveErr(null);
    audit({ actor: "M. Ahmed", kind: "human", action: stored ? "Refreshed IC memo draft" : "Generated IC memo draft", subject: deal });
    const res = await generateICMemo({ context: memoContext(ws) }, { fallback: () => DEMO_MEMO });
    setMemo(deal, { data: res.data, source: res.source, meta: res.meta, at: new Date().toISOString() });
    setLiveErr(res.error || null); setBusy(false);
    audit({ actor: res.source === "live" ? "Claude memo draft" : "Demo memo", kind: res.source === "live" ? "ai" : "system", action: `IC memo draft ${res.source === "live" ? "generated" : "loaded (fallback)"}`, subject: deal, detail: `${res.data.sections.length} sections, ${res.data.unsupported_claims.length} unsupported claims` });
    notify(res.source === "live" ? "Memo draft generated. Review required." : "Memo draft loaded.");
  };
  const version = stored ? (stored.previous ? "v4" : "v4") : "v3";
  const openQ = ws.questions.filter((q) => q.deal === deal && q.status !== "Answered").length + DEMO_QUESTIONS.filter((d) => !ws.questions.some((q) => q.question === d.question) && d.status !== "Answered").length;
  const coverage = Math.round((memo.sections.filter((s) => s.citations && s.citations.length > 0).length / memo.sections.length) * 100);
  const allCites = [...new Set(memo.sections.flatMap((s) => s.citations || []))];
  return (
    <div>
      <PageHeader title="Investment Committee Memo" sub={`${deal} · Draft ${version} · Not for distribution · AI-assisted draft. Investment professional review required.`} crumbs={["Deals", "IC Memo", deal]} demo={source === "live" ? "Live draft" : "Synthetic memo"} right={<Btn primary icon={busy ? Loader2 : FileSignature} onClick={gen} disabled={busy}>{busy ? "Drafting memo" : stored ? "Refresh memo" : "Generate memo"}</Btn>} />
      {busy && <div style={{ marginBottom: 16 }}><ProcessingStages stages={["Reading deal record", "Reading document extraction and red team findings", "Reading diligence tracker", "Drafting sections with citations", "Listing unsupported claims"]} label="Drafting IC memo..." /></div>}
      {!busy && stored && <LiveBanner source={source} error={liveErr} onRetry={gen} meta={meta} />}
      {compare && previous && (
        <Card bordered style={{ marginBottom: 16, boxShadow: "none" }}>
          <SectionTitle right={<span style={{ fontSize: 11, color: T.muted }}>Previous ({stored.previous.source}) vs current ({source})</span>}>Compare versions</SectionTitle>
          <div className="space-y-2">{memo.sections.map((s) => { const prev = previous.sections.find((x) => x.title === s.title); const changed = !prev || prev.body !== s.body; return <div key={s.title} className="grid grid-cols-2 gap-4" style={{ fontSize: 12, borderBottom: `1px solid ${T.border}`, paddingBottom: 8 }}><div><div style={{ color: T.muted, fontSize: 11 }}>{s.title} · previous</div><p style={{ color: T.muted, margin: 0 }}>{prev?.body || "Not present"}</p></div><div><div style={{ color: changed ? T.amber : T.muted, fontSize: 11 }}>{s.title} · current{changed ? " · changed" : ""}</div><p style={{ color: T.text, margin: 0 }}>{s.body}</p></div></div>; })}</div>
        </Card>
      )}
      <div className="grid grid-cols-4 gap-4" style={{ opacity: busy ? 0.55 : 1, transition: EASE }}>
        <Card pad={false} className="col-span-3">
          {memo.sections.map((s, i) => (
            <div key={s.title} style={{ borderBottom: `1px solid ${T.border}` }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-stone-50">
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{s.title}</span>
                <span className="flex items-center gap-3" style={{ fontSize: 11, color: T.muted }}>{s.citations?.length > 0 && <span>{s.citations.length} citation{s.citations.length === 1 ? "" : "s"}</span>}{/Not enough evidence/i.test(s.body) && <Level level="unknown" small />}{s.title === "Open Questions" && <span style={{ color: T.amber }}>{openQ} open</span>}<ChevronDown size={14} style={{ transform: open === i ? "rotate(180deg)" : "none" }} /></span>
              </button>
              {open === i && <div className="px-5 pb-4" style={{ fontSize: 13.5, lineHeight: 1.65, color: T.text, maxWidth: 760 }}>{s.body}{s.citations?.length > 0 && <div className="flex flex-wrap gap-1 mt-2">{s.citations.map((c) => <span key={c} className="tabular-nums" style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: T.accentSoft, color: T.accent }}>{c}</span>)}</div>}{s.title === "Key Risks" && <span className="ml-2"><Level level="risk" small /></span>}</div>}
            </div>
          ))}
        </Card>
        <div className="space-y-4">
          <Card>
            <SectionTitle>Memo health</SectionTitle>
            <div className="grid grid-cols-3 gap-2" style={{ marginBottom: 12 }}>
              <div><div className="tabular-nums" style={{ fontSize: 20, fontWeight: 650, color: coverage >= 80 ? T.green : T.amber }}>{coverage}%</div><div style={{ fontSize: 11, color: T.muted }}>Sections cited</div></div>
              <div><div className="tabular-nums" style={{ fontSize: 20, fontWeight: 650, color: memo.unsupported_claims.length ? T.amber : T.green }}>{memo.unsupported_claims.length}</div><div style={{ fontSize: 11, color: T.muted }}>Unsupported</div></div>
              <div><div className="tabular-nums" style={{ fontSize: 20, fontWeight: 650, color: T.text }}>{openQ}</div><div style={{ fontSize: 11, color: T.muted }}>Open questions</div></div>
            </div>
            <div className="p-3.5" style={{ background: T.amberSoft, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: T.amber }}>Ready for IC?</div>
              <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: T.amber }}><span className="w-2 h-2 rounded-full" style={{ background: T.amber }} />Not yet</div>
              <div style={{ fontSize: 12, color: T.text, marginTop: 2 }}>{memo.gating_items.length} gating item{memo.gating_items.length === 1 ? "" : "s"}: {memo.gating_items.join("; ")}.</div>
              <div style={{ fontSize: 12, color: T.text, marginTop: 4 }}>Next decision: {memo.next_decision}</div>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-2">
              <Btn icon={Eye} onClick={() => setShowSources(!showSources)}>{showSources ? "Hide sources" : `Review sources (${allCites.length})`}</Btn>
              <Btn icon={GitCompare} onClick={() => { if (!previous) notify("No previous version yet. Refresh the memo to create one."); else setCompare(!compare); }}>{compare ? "Hide comparison" : "Compare versions"}</Btn>
              <Btn primary icon={Download} onClick={() => { buildPdf({ filename: "ic-memo-draft-project-falcon.pdf", title: `Investment Committee Memo: ${deal}`, subtitle: `Draft ${version} · ${source === "live" ? "Live draft" : "Synthetic draft"} · AI-assisted draft. Investment professional review required. Not for distribution.`, dataStatus: source === "live" ? "Live draft on deal record" : "Synthetic memo", sections: [
                ...memo.sections.map((s) => ({ heading: s.title, paragraphs: [s.body], note: s.citations?.length ? `Sources: ${s.citations.join(", ")}` : "" })),
                { heading: "Memo health", table: { head: ["Item", "Value"], rows: [["Sections cited", `${coverage}%`], ["Unsupported claims", String(memo.unsupported_claims.length)], ["Open questions", String(openQ)], ["Gating items", memo.gating_items.join("; ")], ["Next decision", memo.next_decision], ["Confidence", memo.confidence]] } },
                { heading: "Unsupported claims", bullets: memo.unsupported_claims.length ? memo.unsupported_claims : ["None flagged."] },
              ] }); audit({ actor: "M. Ahmed", kind: "human", action: "Exported IC memo draft (PDF)", subject: deal }); }}>Export draft PDF</Btn>
            </div>
            {showSources && <div className="mt-3 flex flex-wrap gap-1">{allCites.map((c) => <span key={c} className="tabular-nums" style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: T.accentSoft, color: T.accent }}>{c}</span>)}{allCites.length === 0 && <span style={{ fontSize: 12, color: T.muted }}>No citations in this draft.</span>}</div>}
          </Card>
          <Card>
            <div style={{ fontSize: 11, color: T.amber, fontWeight: 600, marginBottom: 4 }}>Unsupported claims</div>
            <ul className="space-y-1" style={{ fontSize: 13, color: T.text }}>{memo.unsupported_claims.map((u, i) => <li key={i}>{u}</li>)}{memo.unsupported_claims.length === 0 && <li style={{ color: T.muted }}>None flagged.</li>}</ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Portfolio Intelligence ---------- */
const PORTCOS = [
  { name: "Portfolio Co. A (aerospace components)", rg: 9.4, eg: 14.2, pipe: "+18% QoQ", cap: "82%", conc: "27%", wc: "Improving", init: "Third shift, pricing review", h: "healthy" },
  { name: "Portfolio Co. B (medical molding)", rg: 12.1, eg: 16.8, pipe: "+7% QoQ", cap: "91%", conc: "22%", wc: "Stable", init: "Capacity expansion, add-on search", h: "review" },
  { name: "Portfolio Co. C (optical coatings)", rg: 4.2, eg: 2.1, pipe: "-3% QoQ", cap: "68%", conc: "34%", wc: "Watch", init: "Business development hire", h: "review" },
  { name: "Portfolio Co. D (industrial distribution)", rg: 6.8, eg: 9.9, pipe: "+11% QoQ", cap: "n/a", conc: "15%", wc: "Improving", init: "Pricing, e-commerce", h: "healthy" },
];
function Portfolio() {
  const [tab, setTab] = useState("Portfolio");
  const trend = [{ q: "Q3 25", a: 100, b: 100, c: 100, d: 100 }, { q: "Q4 25", a: 103, b: 104, c: 101, d: 102 }, { q: "Q1 26", a: 105, b: 108, c: 101, d: 104 }, { q: "Q2 26", a: 109, b: 112, c: 103, d: 107 }];
  return (
    <div>
      <PageHeader title="Portfolio Intelligence" sub="Operating signals across portfolio companies. Names and metrics are fictionalized." crumbs={["Portfolio", "Portfolio Intelligence"]} demo="Fictionalized metrics" />
      <Tabs tabs={["Portfolio", "Value Creation", "Exit Intelligence"]} value={tab} onChange={setTab} />
      <div style={{ marginTop: 24 }}>
        {tab === "Portfolio" && (
          <>
            <div className="grid grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
              <Metric k="Companies" v="4" />
              <Metric k="Expansion opportunities" v="2" color={T.green} />
              <Metric k="Capacity constraints" v="1" color={T.amber} />
              <Metric k="Commercial watch" v="1" color={T.amber} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2 space-y-4">
                <Card pad={false}>
                  <table className="w-full" style={{ fontSize: 13 }}>
                    <thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Company", "Health", "Revenue growth", "EBITDA growth", "Pipeline", "Capacity", "Customer conc.", "Key initiatives"].map((h, i) => <th key={h} className={`font-medium px-4 py-2 ${i >= 2 && i <= 6 ? "text-right" : "text-left"}`} style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
                    <tbody>{PORTCOS.map((p) => (
                      <tr key={p.name} style={{ borderBottom: `1px solid ${T.border}` }} className="hover:bg-stone-50">
                        <td className="px-4 py-2.5 font-medium" style={{ color: T.text }}>{p.name}</td>
                        <td className="px-4 py-2.5"><Pri p={p.h} label={p.h === "healthy" ? "Healthy" : "Watch"} /></td>
                        <td className="px-4 py-2.5 tabular-nums text-right">+{pct(p.rg)}</td>
                        <td className="px-4 py-2.5 tabular-nums text-right" style={{ color: p.eg < 5 ? T.amber : T.text }}>+{pct(p.eg)}</td>
                        <td className="px-4 py-2.5 tabular-nums text-right" style={{ color: p.pipe.startsWith("-") ? T.red : T.text }}>{p.pipe}</td>
                        <td className="px-4 py-2.5 tabular-nums text-right" style={{ color: p.cap === "91%" ? T.amber : T.text }}>{p.cap}</td>
                        <td className="px-4 py-2.5 tabular-nums text-right" style={{ color: parseInt(p.conc) > 30 ? T.amber : T.text }}>{p.conc}</td>
                        <td className="px-4 py-2.5" style={{ color: T.muted, fontSize: 12 }}>{p.init}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </Card>
                <Card>
                  <SectionTitle>Indexed revenue trend (Q3 2025 = 100)</SectionTitle>
                  <div style={{ height: 200 }}>
                    <ResponsiveContainer>
                      <LineChart data={trend} margin={{ left: -20 }}>
                        <CartesianGrid stroke={T.border} vertical={false} />
                        <XAxis dataKey="q" tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                        <YAxis domain={[95, 115]} tick={{ fontSize: 11, fill: T.muted }} axisLine={false} tickLine={false} />
                        <RTooltip />
                        {[["a", T.accent], ["b", T.green], ["c", T.amber], ["d", "#7A8AA8"]].map(([k, c]) => <Line key={k} type="monotone" dataKey={k} stroke={c} dot={false} strokeWidth={2} name={`Co. ${k.toUpperCase()}`} />)}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>
              <Card>
                <SectionTitle>Intelligence alerts</SectionTitle>
                {[["Sales pipeline increased 18% quarter-over-quarter.", "Co. A", "healthy"], ["Two customers show declining order frequency.", "Co. C", "review"], ["Machine utilization indicates potential capacity constraint.", "Co. B", "review"], ["Pricing opportunity identified in low-margin customer segment.", "Co. D", "active"]].map(([t, c, pr]) => (
                  <div key={t} className="py-2.5 flex gap-2" style={{ borderBottom: `1px solid ${T.border}` }}><span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: PRI[pr][0] }} /><div><div style={{ fontSize: 13, color: T.text }}>{t}</div><div style={{ fontSize: 11, color: T.muted }}>{c} · from operational reporting (conceptual)</div></div></div>
                ))}
              </Card>
            </div>
          </>
        )}
        {tab === "Value Creation" && <ValueCreation embedded />}
        {tab === "Exit Intelligence" && <ExitIntel />}
      </div>
    </div>
  );
}
function ValueCreation({ embedded }) {
  const cols = [
    ["Commercial", [["Business Development", TrendingUp, [2, 1, 1]], ["Pricing", DollarSign, [2, 1, 0]], ["Digital", Monitor, [1, 1, 0]]]],
    ["Operations", [["Operational Efficiency", Wrench, [2, 1, 0]], ["Procurement", Layers, [2, 0, 0]], ["Working Capital", Scale, [1, 1, 0]]]],
    ["Strategic", [["Add-on M&A", Building, [3, 1, 0]], ["AI / Automation", Bot, [2, 0, 1]]]],
  ];
  const body = (
    <div className="grid grid-cols-3 gap-4">
      {cols.map(([g, items]) => (
        <div key={g}>
          <div style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", color: T.muted, marginBottom: 8 }}>{g}</div>
          <div className="space-y-3">
            {items.map(([h, I, [ok, watch, blocked]]) => (
              <Card key={h}>
                <div className="flex items-center justify-between" style={{ marginBottom: 6 }}><span className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: T.text }}><I size={15} strokeWidth={1.6} style={{ color: T.muted }} /> {h}</span><span className="tabular-nums" style={{ fontSize: 16, fontWeight: 650, color: T.text }}>{ok + watch + blocked} <span style={{ fontSize: 11, color: T.muted, fontWeight: 400 }}>active</span></span></div>
                <div className="flex gap-2 flex-wrap">
                  {ok > 0 && <Pri p="healthy" label={`${ok} on track`} />}
                  {watch > 0 && <Pri p="review" label={`${watch} watch`} />}
                  {blocked > 0 && <Pri p="critical" label={`${blocked} blocked`} />}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
  if (embedded) return body;
  return <div><PageHeader title="Value Creation" sub="Operating board of active initiatives across the portfolio." crumbs={["Portfolio", "Value Creation"]} demo="Demo data" />{body}</div>;
}
function ExitIntel() {
  const readiness = [["Management dependency", 58, T.amber], ["Customer concentration", 52, T.red], ["Revenue scale", 80, T.green], ["EBITDA margin", 84, T.green], ["Commercial infrastructure", 74, T.accent], ["Systems and reporting", 88, T.green]];
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-2">
        <SectionTitle right={<Demo>Fictional portfolio company</Demo>}>Exit intelligence: Portfolio Co. A</SectionTitle>
        <div className="grid grid-cols-3 gap-6" style={{ fontSize: 13 }}>
          <div><div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Potential strategic buyers</div><ul className="space-y-1" style={{ color: T.text }}><li>Tier 1 aerostructures supplier</li><li>Diversified precision components group</li><li>Defense electronics OEM</li></ul></div>
          <div><div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Potential financial sponsors</div><ul className="space-y-1" style={{ color: T.text }}><li>Aerospace platforms seeking add-ons</li><li>Industrial technology funds, $50M to $150M EV</li></ul></div>
          <div><div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Comparable transactions</div><ul className="space-y-1" style={{ color: T.text }}><li>Precision machining add-on, 2025: 7.5x to 8.5x (illustrative)</li><li>Aerospace components platform, 2024: 9x to 10x (illustrative)</li></ul></div>
        </div>
        <div className="grid grid-cols-3 gap-4" style={{ marginTop: 20 }}>
          <KV k="Valuation range" v="8.0x to 9.5x EBITDA" level="estimated" />
          <KV k="Business quality score" v="78 / 100" level="inferred" />
          <KV k="Estimated exit readiness" v={<span style={{ color: T.accent }}>74 / 100</span>} />
        </div>
      </Card>
      <Card>
        <SectionTitle>Value creation remaining</SectionTitle>
        {readiness.map(([k, v, c]) => <div key={k} className="flex items-center gap-2 py-1" style={{ fontSize: 12 }}><span className="w-40" style={{ color: T.muted }}>{k}</span><div className="flex-1 rounded" style={{ height: 4, background: T.soft }}><div className="rounded" style={{ height: 4, width: `${v}%`, background: c }} /></div><span className="w-6 text-right tabular-nums font-medium" style={{ color: T.text }}>{v}</span></div>)}
        <div style={{ fontSize: 11, color: T.muted, marginTop: 12 }}>Primary blockers</div>
        <div className="flex gap-1.5 mt-1">{["Customer concentration", "Management depth"].map((b) => <Pri key={b} p="critical" label={b} />)}</div>
      </Card>
    </div>
  );
}

/* ---------- MCM Knowledge ---------- */
const SYNTH_KNOWLEDGE = [
  { id: "k1", provenance: "synthetic", category: "Historical pattern", title: "Technical strength, weak business development", text: "Companies with highly technical capabilities but limited systematic business development may present attractive value-creation opportunities.", tags: ["business development", "value creation", "manufacturing"] },
  { id: "k2", provenance: "synthetic", category: "Diligence lesson", title: "Program-level revenue visibility", text: "Program-level revenue visibility mattered more than total customer count in past molding investments. Ask for revenue by program, not only by customer.", tags: ["molding", "customer concentration", "diligence", "medical"] },
  { id: "k3", provenance: "synthetic", category: "Rejected opportunity pattern", title: "Concentration without agreement", text: "Molders whose largest customer exceeded 40% without a multi-year agreement were declined in most illustrative cases, regardless of margin.", tags: ["molding", "customer concentration", "rejected", "medical"] },
  { id: "k4", provenance: "synthetic", category: "Portfolio lesson", title: "Capacity ahead of demand", text: "Capacity investment ahead of validated demand extended payback periods; capacity added against qualified programs paid back faster.", tags: ["capacity", "capex", "portfolio"] },
  { id: "k5", provenance: "synthetic", category: "Diligence lesson", title: "Recurring adjustments", text: "Facility and relocation adjustments that recurred in two of three years were treated as run-rate costs in past quality of earnings reviews.", tags: ["ebitda", "adjustments", "quality of earnings", "aerospace"] },
];
function collectKnowledge(ws) {
  const recs = [...SYNTH_KNOWLEDGE];
  ws.research.forEach((r) => recs.push({ id: r.id, provenance: r.type === "Uploaded Document" ? "uploaded" : "generated", category: r.type, title: r.title, text: `${r.summary} ${(r.findings || []).join(" ")}`, tags: [r.deal, r.thesis].filter(Boolean) }));
  Object.entries(ws.analyses).forEach(([id, a]) => { const c = COMPANIES.find((x) => x.id === id); if (c && a.current) recs.push({ id: `an-${id}`, provenance: "generated", category: "Company analysis", title: `${c.name} analysis`, text: `${a.current.data.summary} Risks: ${a.current.data.risks.map((r) => r.text).join("; ")}. Unknowns: ${a.current.data.unknowns.map((u) => u.text).join("; ")}.`, tags: [c.sector, c.thesis] }); });
  Object.entries(ws.redTeam).forEach(([deal, r]) => { if (r.result) recs.push({ id: `rt-${deal}`, provenance: "generated", category: "Red Team review", title: `${deal} red team`, text: `${r.result.overall_assessment}. ${r.result.findings.map((f) => f.challenge).join(" ")}`, tags: [deal, "red team"] }); });
  ws.conflicts.filter((c) => c.status !== "pending").forEach((c) => recs.push({ id: c.id, provenance: "approved", category: "Analyst-approved finding", title: `${c.deal}: ${c.metric}`, text: `${c.metric} resolved as ${c.status === "accepted" ? `new value ${c.current.value} (${c.current.source}, p.${c.current.page})` : c.status === "kept" ? `existing value ${c.previous.value} (${c.previous.source}, p.${c.previous.page})` : "marked for review"}.`, tags: [c.deal, "conflict", c.metric] }));
  Object.entries(ws.redTeam).forEach(([deal, r]) => Object.entries(r.dispositions || {}).forEach(([i, d]) => { const f = r.result?.findings?.[i]; if (f) recs.push({ id: `disp-${deal}-${i}`, provenance: "approved", category: "Analyst-approved finding", title: `${deal}: finding #${Number(i) + 1} ${d}`, text: `${f.assumption} ${f.challenge}`, tags: [deal, "red team", d] }); }));
  return recs;
}
function retrieve(recs, q) {
  const terms = q.toLowerCase().split(/\W+/).filter((t) => t.length > 2 && !["what", "have", "about", "from", "with", "that", "this", "the", "and", "our", "for", "learned", "historically"].includes(t));
  return recs.map((r) => { const hay = `${r.title} ${r.text} ${(r.tags || []).join(" ")} ${r.category}`.toLowerCase(); const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0) + (r.provenance === "approved" ? 0.5 : r.provenance === "uploaded" ? 0.3 : 0); return { ...r, score }; }).filter((r) => r.score >= 1).sort((a, b) => b.score - a.score).slice(0, 6);
}
const PROV_LABEL = { synthetic: ["Synthetic institutional example", T.unknown, T.unknownSoft], uploaded: ["Uploaded document", T.accent, T.accentSoft], generated: ["Generated analysis", T.amber, T.amberSoft], approved: ["Analyst-approved finding", T.green, T.greenSoft] };
function Knowledge() {
  const { ws, audit } = useWorkspace();
  const [q, setQ] = useState("What have we historically learned from medical-device injection molding investments?");
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const cats = ["Historical Deals", "Investment Theses", "Rejected Opportunities", "Diligence Findings", "Portfolio Lessons", "Market Research", "Investment Committee Decisions"];
  const all = collectKnowledge(ws);
  const search = async () => {
    setBusy(true);
    const hits = retrieve(all, q);
    const fallback = () => ({ answer: hits.length ? `${hits.length} record${hits.length === 1 ? "" : "s"} match. ${hits.slice(0, 2).map((h) => h.text).join(" ")}` : "Not enough evidence available.", supporting: hits.map((h) => ({ record_id: h.id, provenance: h.provenance, point: h.title })), gaps: hits.length ? [] : ["No records match the question yet."], enough_evidence: hits.length > 0 });
    const res = hits.length ? await searchKnowledge({ question: q, records: hits.map((h) => `[${h.id}] (${h.provenance}) ${h.category}: ${h.title}. ${h.text}`).join("\n") }, { fallback }) : { data: fallback(), source: "demo", meta: {} };
    setResult({ ...res, hits }); setBusy(false);
    audit({ actor: "M. Ahmed", kind: "human", action: "Searched institutional knowledge", subject: q.slice(0, 70), detail: `${hits.length} records retrieved · ${res.source}` });
  };
  useEffect(() => { search(); }, []);
  return (
    <div>
      <PageHeader title="MCM Knowledge" sub="Institutional memory as searchable intelligence: synthetic examples, uploaded documents, generated analyses and analyst-approved findings from this session." crumbs={["Knowledge", "MCM Knowledge"]} demo={`${all.length} records indexed`} />
      <div className="flex gap-2" style={{ marginBottom: 12 }}><span className="flex items-center gap-2 px-4 flex-1 bg-white" style={{ border: `1px solid ${T.border}`, borderRadius: R.chip }}><Search size={14} style={{ color: T.muted }} /><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && search()} className="flex-1 outline-none" style={{ fontSize: 13, padding: "8px 0", color: T.text }} /></span><Btn primary icon={busy ? Loader2 : Search} onClick={search} disabled={busy}>{busy ? "Searching" : "Search knowledge"}</Btn></div>
      <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: 16 }}>{cats.map((c) => <span key={c} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: T.soft, color: T.muted }}>{c}</span>)}</div>
      {result && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="col-span-2">
            <SectionTitle right={<span style={{ fontSize: 11, padding: "1px 7px", borderRadius: 999, background: result.source === "live" ? T.greenSoft : T.unknownSoft, color: result.source === "live" ? T.green : T.unknown }}>{result.source === "live" ? "Live synthesis" : "Lexical retrieval"}</span>}>Answer</SectionTitle>
            {result.error && <div className="px-3 py-2 mb-3" style={{ background: T.amberSoft, color: T.amber, borderRadius: 10, fontSize: 12 }}>{result.error} Showing retrieved records without synthesis.</div>}
            {result.data.enough_evidence === false && <div className="px-3 py-2 mb-3" style={{ background: T.unknownSoft, color: T.unknown, borderRadius: 10, fontSize: 12 }}>Not enough evidence available in the current records.</div>}
            <p style={{ fontSize: 13.5, color: T.text, lineHeight: 1.65, margin: 0 }}>{result.data.answer}</p>
            {result.data.supporting.length > 0 && <div className="mt-4"><div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>Supporting records</div>{result.data.supporting.map((s, i) => { const pl = PROV_LABEL[s.provenance] || PROV_LABEL.synthetic; return <div key={i} className="flex items-start gap-2 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, fontSize: 12.5 }}><span className="shrink-0" style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 999, background: pl[2], color: pl[1] }}>{pl[0]}</span><span style={{ color: T.text }}>{s.point}</span></div>; })}</div>}
            {result.data.gaps.length > 0 && <div className="mt-3" style={{ fontSize: 12, color: T.muted }}>Gaps: {result.data.gaps.join("; ")}</div>}
            <div style={{ fontSize: 11, color: T.muted, marginTop: 10 }}>Retrieval is lexical for now and designed to be replaced by embeddings later. Synthetic examples are illustrative; no actual MCM decisions are represented.</div>
          </Card>
          <Card pad={false}>
            <div className="px-4 pt-4"><SectionTitle>Retrieved records ({result.hits.length})</SectionTitle></div>
            {result.hits.map((h) => { const pl = PROV_LABEL[h.provenance]; return <div key={h.id} className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}><div className="flex items-center justify-between gap-2"><span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{h.title}</span><span className="shrink-0" style={{ fontSize: 10.5, padding: "1px 7px", borderRadius: 999, background: pl[2], color: pl[1] }}>{pl[0]}</span></div><div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{h.text}</div></div>; })}
            {result.hits.length === 0 && <div className="px-4 pb-4" style={{ fontSize: 13, color: T.muted }}>No records matched. Analyses, uploads and resolved conflicts from this session are searchable here.</div>}
          </Card>
        </div>
      )}
    </div>
  );
}
function ResearchLibrary() {
  const { ws } = useWorkspace();
  const [openRec, setOpenRec] = useState(null);
  const session = ws.research.map((r) => [r.title, r.type, r.producedBy, new Date(r.created).toLocaleDateString(), r.deal || r.thesis, FileText, r]);
  const docs0 = [["Medical device outsourcing outlook 2026", "Market research", "Market Agent", "Today", "Medical Device thesis", Globe], ["Aerospace build-rate tracker Q3", "Market research", "Market Agent", "Yesterday", "Aerospace thesis", Globe], ["Precision molder peer margin set (8 companies)", "Benchmark", "Financial Agent", "2 days ago", "Medical Device thesis", BarChart3], ["Reshoring signals in component supply", "Market research", "Research Agent", "1 week ago", "Medical Device thesis", Globe], ["Elevator and escalator parts distribution map", "Sector map", "Research Agent", "2 weeks ago", "Distribution thesis", Layers], ["Market Research #14: Program dependency in aerospace suppliers", "Research note", "Red-Team Agent", "3 weeks ago", "Project Falcon", FileText]];
  const demoRecs = docs0.map(([t, ty, a, u, rel, I]) => [t, ty, a, u, rel, I, { title: t, type: ty, producedBy: a, created: new Date().toISOString(), deal: /falcon/i.test(rel) ? rel : "", thesis: /thesis/i.test(rel) ? rel : "", sources: ["Synthetic demonstration record"], summary: `Synthetic ${ty.toLowerCase()} produced by the ${a} for the ${rel}. In a live deployment this record would hold the generated research note, its sources and key findings.`, findings: [], demo: true }]);
  const docs = [...session, ...demoRecs];
  const Sel = ({ label }) => <select className="bg-white" style={{ fontSize: 13, padding: "7px 12px", borderRadius: R.chip, border: `1px solid ${T.border}`, color: T.muted }}><option>{label}</option></select>;
  return (
    <div>
      <PageHeader title="Research Library" sub="Research notes, benchmarks and sector maps, each tied to the thesis or deal that requested it." crumbs={["Knowledge", "Research Library"]} demo="Synthetic documents" />
      <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
        <span className="flex items-center gap-2 px-4 bg-white" style={{ border: `1px solid ${T.border}`, borderRadius: R.chip, width: 300 }}><Search size={13} style={{ color: T.muted }} /><input placeholder="Search research" className="flex-1 outline-none" style={{ fontSize: 13, padding: "6px 0" }} /></span>
        <Sel label="Type" /><Sel label="Produced by" /><Sel label="Date" /><Sel label="Related thesis" />
      </div>
      <Card pad={false}>
        <table className="w-full" style={{ fontSize: 13 }}><thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Title", "Type", "Produced by", "Related to", "Updated"].map((h) => <th key={h} className="text-left font-medium px-4 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
          <tbody>{docs.map(([t, ty, a, u, rel, I, rec]) => <tr key={t} onClick={() => rec && setOpenRec(rec)} className="hover:bg-stone-50 cursor-pointer" style={{ borderBottom: `1px solid ${T.border}` }}><td className="px-4 py-2.5 font-medium" style={{ color: T.text }}><span className="flex items-center gap-2"><I size={14} strokeWidth={1.6} style={{ color: T.muted }} />{t}</span></td><td className="px-4 py-2.5" style={{ color: T.muted }}>{ty}</td><td className="px-4 py-2.5" style={{ color: T.muted }}>{a}</td><td className="px-4 py-2.5"><span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: T.accentSoft, color: T.accent }}>{rel}</span></td><td className="px-4 py-2.5" style={{ color: T.muted }}>{u}<span className="ml-2" style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 999, background: rec && !rec.demo ? T.greenSoft : T.unknownSoft, color: rec && !rec.demo ? T.green : T.unknown }}>{rec && !rec.demo ? "Session" : "Demo"}</span></td></tr>)}</tbody></table>
      </Card>
      {openRec && (
        <Modal title={openRec.title} onClose={() => setOpenRec(null)} wide>
          <div className="grid grid-cols-3 gap-4" style={{ fontSize: 13 }}>
            <div className="col-span-2"><div style={{ fontSize: 11, color: T.muted, marginBottom: 4 }}>Summary</div><p style={{ color: T.text, lineHeight: 1.6 }}>{openRec.summary}</p>{openRec.findings?.length > 0 && <><div style={{ fontSize: 11, color: T.muted, margin: "12px 0 4px" }}>Key findings</div><ul className="list-disc pl-4 space-y-1" style={{ color: T.text }}>{openRec.findings.map((f, i) => <li key={i}>{f}</li>)}</ul></>}</div>
            <div>{[["Type", openRec.type], ["Related deal", openRec.deal || ""], ["Related thesis", openRec.thesis || ""], ["Produced by", openRec.producedBy], ["Created", new Date(openRec.created).toLocaleString()], ["Sources", (openRec.sources || []).join("; ")]].map(([k, v]) => <KV key={k} k={k} v={v} />)}</div>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ---------- Agent Architecture ---------- */
function AgentActivity() {
  const { ws, reset } = useWorkspace();
  const [log, setLog] = useState(getAiLog());
  const [confirm, setConfirm] = useState(false);
  useEffect(() => { const h = () => setLog(getAiLog()); window.addEventListener("mcm:ai-log", h); return () => window.removeEventListener("mcm:ai-log", h); }, []);
  const mode = useAiMode();
  const agents = ["Research", "Qualification", "Market", "Financial", "CIM", "Diligence", "Red-Team", "Relationship", "Reporting"];
  const tools = [["CRM", Database], ["ZoomInfo", Users], ["Outlook", Mail], ["Websites", Globe], ["Research", Library], ["Data room", FolderLock], ["Reporting", BarChart3]];
  const routing = [["Industry classification", "Small", "Low complexity", "Low", "Fast"], ["Document extraction", "Small / local", "Structured extraction", "Low", "Fast"], ["Company research synthesis", "Advanced", "Multi-source reasoning", "Medium", "Medium"], ["CIM synthesis", "Advanced", "Complex reasoning", "High", "Slow"], ["Red-team analysis", "Advanced", "Adversarial reasoning", "High", "Slow"], ["Confidential data-room review", "Local", "Sensitive processing", "Low", "Medium"], ["Outreach personalization", "Advanced", "Tone and judgment", "Medium", "Medium"], ["Portfolio KPI monitoring", "Small", "Rule-based checks", "Low", "Fast"]];
  const Node = ({ label, sub, dark }) => (
    <div className="flex flex-col items-center" style={{ width: 96 }}>
      <span className="rounded-full" style={{ width: 10, height: 10, background: dark ? T.nav : T.accent, border: `2px solid ${dark ? T.nav : "#fff"}`, boxShadow: `0 0 0 1px ${T.accent}` }} />
      <span className="text-center" style={{ fontSize: 12, fontWeight: 500, color: T.text, marginTop: 6, lineHeight: 1.25 }}>{label}</span>
      {sub && <span className="text-center" style={{ fontSize: 11, color: T.muted }}>{sub}</span>}
    </div>
  );
  const VLine = ({ h = 22 }) => <div style={{ width: 1, height: h, background: T.border, margin: "0 auto" }} />;
  const cost = (c) => ({ Low: T.green, Medium: T.amber, High: T.red }[c]);
  return (
    <div>
      <PageHeader title="Agent Activity and Architecture" sub="What has actually run this session, and the conceptual architecture the system is growing toward." crumbs={["System", "Agent Activity"]} demo="Conceptual architecture" right={<>{confirm ? <span className="flex items-center gap-2" style={{ fontSize: 12, color: T.muted }}>Restore the original synthetic dataset? Session analyses, versions and findings will be cleared. <Btn small danger onClick={() => { reset(); setLog([]); setConfirm(false); }}>Reset</Btn><Btn small onClick={() => setConfirm(false)}>Cancel</Btn></span> : <Btn small onClick={() => setConfirm(true)}>Reset demo workspace</Btn>}</>} />
      <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 2fr", marginBottom: 24 }}>
        <Card pad={false}>
          <div className="px-4 pt-4"><SectionTitle right={<span style={{ fontSize: 11, color: T.muted }}>{mode === "live" ? "Live AI" : "Demo mode"} · this session</span>}>AI calls this session</SectionTitle></div>
          {log.length === 0 ? <div className="px-4 pb-4" style={{ fontSize: 13, color: T.muted }}>No live calls yet. Each structured request is recorded here with model, latency, tokens and status.</div> : (
            <table className="w-full" style={{ fontSize: 12.5 }}><thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Time", "Task", "Model", "Latency", "Tokens in / out", "Status"].map((h) => <th key={h} className="text-left font-medium px-4 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
              <tbody>{log.slice(0, 25).map((e) => <tr key={e.id} style={{ borderBottom: `1px solid ${T.border}` }}><td className="px-4 py-1.5 tabular-nums" style={{ color: T.muted }}>{e.timestamp ? new Date(e.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}</td><td className="px-4 py-1.5" style={{ color: T.text }}>{e.task}</td><td className="px-4 py-1.5" style={{ color: T.muted }}>{e.model || ""}</td><td className="px-4 py-1.5 tabular-nums">{e.latencyMs ? `${(e.latencyMs / 1000).toFixed(1)}s` : ""}</td><td className="px-4 py-1.5 tabular-nums" style={{ color: T.muted }}>{e.usage ? `${e.usage.input} / ${e.usage.output}` : ""}</td><td className="px-4 py-1.5"><Pri p={e.status === "complete" ? "healthy" : e.status === "failed" ? "critical" : "review"} label={e.status === "failed" ? `Failed (${e.code})` : e.status} /></td></tr>)}</tbody></table>
          )}
        </Card>
        <Card pad={false}>
          <div className="px-4 pt-4"><SectionTitle>Audit trail</SectionTitle></div>
          {ws.audit.length === 0 ? <div className="px-4 pb-4" style={{ fontSize: 13, color: T.muted }}>No session actions yet. Human decisions, AI analyses and system events are recorded here.</div> : (
            <div className="px-4 pb-3">{ws.audit.slice(0, 12).map((e) => <div key={e.id} className="flex gap-3 py-2" style={{ borderBottom: `1px solid ${T.border}`, fontSize: 12.5 }}><span className="tabular-nums shrink-0" style={{ color: T.muted, width: 62 }}>{new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span><span className="shrink-0" style={{ fontSize: 10.5, padding: "1px 6px", borderRadius: 999, height: 18, background: e.kind === "human" ? T.greenSoft : e.kind === "ai" ? T.accentSoft : T.unknownSoft, color: e.kind === "human" ? T.green : e.kind === "ai" ? T.accent : T.unknown }}>{e.kind === "human" ? "Human" : e.kind === "ai" ? "AI" : "System"}</span><span><span className="font-medium" style={{ color: T.text }}>{e.actor}</span> <span style={{ color: T.text }}>{e.action}</span>{e.subject ? <span style={{ color: T.muted }}> · {e.subject}</span> : null}{e.detail ? <div style={{ color: T.muted, fontSize: 11.5 }}>{e.detail}</div> : null}</span></div>)}</div>
          )}
        </Card>
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 2fr" }}>
        <Card>
          <div style={{ fontSize: 11, color: T.unknown, marginBottom: 4 }}>Future conceptual architecture. Today each analysis is one structured Claude request.</div>
          <div className="flex flex-col items-center py-2">
            <Node label="Orchestrator" dark />
            <VLine />
            <div style={{ width: "88%", height: 1, background: T.border }} />
            <div className="grid grid-cols-3 gap-y-5 w-full justify-items-center" style={{ paddingTop: 10 }}>{agents.map((a) => <Node key={a} label={`${a} Agent`} />)}</div>
            <VLine h={26} />
            <Node label="Model Router" dark />
            <VLine />
            <div style={{ width: "62%", height: 1, background: T.border }} />
            <div className="grid grid-cols-3 gap-2 justify-items-center" style={{ width: "70%", paddingTop: 10 }}>
              <Node label="Fast" sub="Small model" /><Node label="Advanced" sub="Frontier model" /><Node label="Secure" sub="Local, open source" />
            </div>
            <VLine h={26} />
            <div style={{ fontSize: 11, color: T.unknown, marginBottom: 8 }}>Conceptual integrations, not connected</div>
            <div className="flex gap-2 flex-wrap justify-center">{tools.map(([t, I]) => <span key={t} className="flex items-center gap-1.5" style={{ fontSize: 12, padding: "4px 10px", borderRadius: 999, background: T.soft, color: T.muted }}><I size={13} strokeWidth={1.6} />{t}</span>)}</div>
          </div>
          <div className="p-3" style={{ marginTop: 16, background: T.accentSoft, color: T.accent, borderRadius: 6, fontSize: 12 }}>Every output carries evidence tags and a confidence score. Human approval gates outreach, IC recommendations and any external action.</div>
        </Card>
        <div className="space-y-4">
          <Card pad={false}>
            <div className="px-4 pt-4"><SectionTitle>Model selection</SectionTitle></div>
            <table className="w-full" style={{ fontSize: 12.5 }}><thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Task", "Model", "Reason", "Cost", "Latency"].map((h) => <th key={h} className="text-left font-medium px-4 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
              <tbody>{routing.map(([t, m, r, c, l]) => <tr key={t} style={{ borderBottom: `1px solid ${T.border}` }}><td className="px-4 py-2" style={{ color: T.text }}>{t}</td><td className="px-4 py-2" style={{ color: T.muted }}>{m}</td><td className="px-4 py-2" style={{ color: T.muted, fontSize: 11.5 }}>{r}</td><td className="px-4 py-2 font-medium" style={{ color: cost(c) }}>{c}</td><td className="px-4 py-2" style={{ color: T.muted }}>{l}</td></tr>)}</tbody></table>
          </Card>
          <Card>
            <SectionTitle>Cost profile, last 30 days</SectionTitle>
            {[["Small and local models", 71, 18, T.green], ["Advanced models", 29, 82, T.accent]].map(([k, a, b, c]) => <div key={k} style={{ marginBottom: 10 }}><div className="flex items-center justify-between" style={{ fontSize: 13 }}><span style={{ color: T.text }}>{k}</span><span className="tabular-nums" style={{ color: T.muted, fontSize: 12 }}>{a}% of tasks · {b}% of spend</span></div><div className="rounded" style={{ height: 4, background: T.soft, marginTop: 4 }}><div className="rounded" style={{ height: 4, width: `${b}%`, background: c }} /></div></div>)}
            <div style={{ fontSize: 12, color: T.muted }}>Routing cheap tasks to small models keeps frontier-model spend on judgment-heavy work.</div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Evaluations ---------- */
function Evaluations() {
  const [set, setSet] = useState("CIM Extraction");
  const sets = { "Historical Target Qualification": [["Classify: Ridgeway Silicone Molding", "Medical Components, Strong fit", "Medical Components, Strong fit", true, "Matches analyst label"], ["Classify: Brightline Composite Works", "Monitor (PE-backed)", "Potential fit", false, "Ownership exclusion missed; rule added"], ["Revenue band: Nova Polymer", "$15M to $20M", "$16M to $21M", true, "Within tolerance"]], "CIM Extraction": [["Falcon adjusted EBITDA", "$5.1M", "$5.1M", true, "Exact match, p. 71"], ["Falcon top customer share", "31%", "31%", true, "p. 48"], ["Falcon capex FY2025", "$2.4M", "$2.1M", false, "Picked maintenance capex only; prompt revised"], ["Orion employee count", "94", "94", true, ""]], "Investment Memo Generation": [["Every risk has a citation", "12 of 12", "10 of 12", false, "Two claims flagged unsupported"], ["Executive summary under 150 words", "Yes", "Yes", true, ""]], "Red-Team Analysis": [["Identifies concentration risk", "Yes", "Yes", true, ""], ["Finds recurring adjustment", "Yes", "Yes", true, "Cross-checked prior years"], ["Avoids fabricated evidence", "0 fabricated", "0 fabricated", true, ""]], "Outreach Personalization": [["References verified fact only", "Yes", "Yes", true, ""], ["No inferred fact stated as certain", "Yes", "No", false, "Stated succession as fact; corrected to inferred"]] };
  const rows = sets[set];
  const rate = (r) => Math.round((r.filter((x) => x[3]).length / r.length) * 100);
  const passRate = rate(rows);
  const dot = (r) => (rate(r) === 100 ? T.green : rate(r) >= 60 ? T.amber : T.red);
  return (
    <div>
      <PageHeader title="Evaluation Center" sub="Every agent version is tested against labeled cases before its output reaches the investment team." crumbs={["System", "Evaluations"]} demo="Demo metrics" />
      <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr 1fr 1.3fr", marginBottom: 24 }}>
        <Metric k="Citation coverage" v="94.7%" color={T.green} />
        <Metric k="Unsupported claim rate" v="2.8%" color={T.amber} />
        <Metric k="Human agreement rate" v="89.2%" />
        <Card className="py-2"><Metric secondary k="Classification accuracy" v="96.4%" /><div className="flex items-baseline justify-between py-2"><span style={{ color: T.muted, fontSize: 12 }}>Extraction accuracy</span><span className="tabular-nums font-semibold" style={{ color: T.text, fontSize: 15 }}>98.1%</span></div></Card>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <SectionTitle>Evaluation sets</SectionTitle>
          {Object.keys(sets).map((s) => <button key={s} onClick={() => setSet(s)} className="w-full text-left px-2.5 py-2 mb-1 flex items-start gap-2" style={{ borderRadius: R.ctl, background: set === s ? T.accentSoft : "transparent", fontSize: 13 }}><span className="mt-1.5 w-2 h-2 rounded-full shrink-0" style={{ background: dot(sets[s]) }} /><span><span style={{ color: set === s ? T.accent : T.text, fontWeight: set === s ? 600 : 400 }}>{s}</span><span className="block" style={{ fontSize: 11, color: T.muted }}>{sets[s].length} cases · {rate(sets[s])}% pass</span></span></button>)}
        </Card>
        <Card pad={false} className="col-span-3">
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}` }}><span style={{ fontSize: 15, fontWeight: 600, color: T.text }}>{set}</span><Pri p={passRate === 100 ? "healthy" : passRate >= 60 ? "review" : "critical"} label={`Pass rate ${passRate}%`} /></div>
          <table className="w-full" style={{ fontSize: 13 }}><thead><tr style={{ color: T.muted, fontSize: 11 }}>{["Test case", "Expected", "Actual", "Result", "Reviewer notes"].map((h) => <th key={h} className="text-left font-medium px-4 py-2" style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
            <tbody>{rows.map(([t, e, a, p, n]) => <tr key={t} style={{ borderBottom: `1px solid ${T.border}` }}><td className="px-4 py-2.5" style={{ color: T.text }}>{t}</td><td className="px-4 py-2.5 tabular-nums" style={{ color: T.muted }}>{e}</td><td className="px-4 py-2.5 tabular-nums" style={{ color: T.text }}>{a}</td><td className="px-4 py-2.5"><Pri p={p ? "healthy" : "critical"} label={p ? "Pass" : "Fail"} /></td><td className="px-4 py-2.5" style={{ color: T.muted, fontSize: 12 }}>{n}</td></tr>)}</tbody></table>
          <div className="px-4 py-2" style={{ fontSize: 11, color: T.muted }}>Failures create a corrected case and a prompt or rule change. The set is re-run before any agent version is promoted.</div>
        </Card>
      </div>
    </div>
  );
}

/* ---------- App ---------- */
function AppInner() {
  const [route, setRoute] = useState("home");
  const [companyId, setCompanyId] = useState("pms");
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState(false);
  const [ask, setAsk] = useState(false);
  const [toast, setToast] = useState(null);
  const [stageFilter, setStageFilter] = useState(null);
  const [thesisCtx, setThesisCtx] = useState(null);
  const notify = (m) => { setToast(m); setTimeout(() => setToast(null), 2600); };
  const go = (r) => { setRoute(r); if (r !== "discovery" && r !== "pipeline") setStageFilter(null); if (r === "discovery") setStageFilter((s) => s); window.scrollTo(0, 0); };
  const openThesis = (name) => { setThesisCtx(name); setRoute("thesis"); window.scrollTo(0, 0); };
  const openCompany = (id) => { setCompanyId(id); setRoute("company"); window.scrollTo(0, 0); };
  useEffect(() => { probeAiStatus(); }, []);
  useEffect(() => {
    const h = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setSearch(true); } if (e.key === "Escape") { setSearch(false); } };
    window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h);
  }, []);
  const company = COMPANIES.find((c) => c.id === companyId);
  const ctx = route === "company" || route === "outreach" || route === "relationship" ? { company } : ["cim", "redteam", "diligence", "icmemo"].includes(route) ? { deal: "Project Falcon" } : {};
  const page = {
    home: <CommandCenter go={go} openCompany={openCompany} setStageFilter={setStageFilter} />,
    thesis: <ThesisBuilder go={go} setThesisCtx={setThesisCtx} />,
    discovery: <TargetDiscovery openCompany={openCompany} stageFilter={stageFilter} thesisCtx={thesisCtx} clearCtx={() => { setThesisCtx(null); setStageFilter(null); }} />,
    companies: <TargetDiscovery openCompany={openCompany} companiesMode />,
    company: <CompanyIntelligence company={company} go={go} notify={notify} openThesis={openThesis} />,
    relationship: <RelationshipIntelligence go={go} openCompany={openCompany} />,
    outreach: <Outreach notify={notify} />,
    pipeline: <Pipeline go={go} />,
    cim: <CIMAnalyzer go={go} notify={notify} />,
    diligence: <Diligence go={go} />,
    redteam: <RedTeam go={go} />,
    icmemo: <ICMemo notify={notify} />,
    portfolio: <Portfolio />,
    value: <ValueCreation />,
    knowledge: <Knowledge />,
    library: <ResearchLibrary />,
    agents: <AgentActivity />,
    evals: <Evaluations />,
  }[route];
  return (
    <div className="flex min-h-screen" style={{ background: T.bg, color: T.text, WebkitFontSmoothing: "antialiased", MozOsxFontSmoothing: "grayscale", ...FONT }}>
      <style>{`
        button, a, tr, input, select { transition: ${EASE}; }
        ::-webkit-scrollbar { width: 10px; height: 10px; } ::-webkit-scrollbar-thumb { background: rgba(15,28,46,0.18); border-radius: 999px; border: 3px solid transparent; background-clip: content-box; } ::-webkit-scrollbar-track { background: transparent; }
        select { -webkit-appearance: none; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%235F6B7A' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 30px !important; }
        input[type=range] { accent-color: ${T.accent}; } input[type=checkbox] { accent-color: ${T.accent}; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        main > div { animation: fadeUp 240ms cubic-bezier(.2,.8,.2,1); }
        table tbody tr { transition: background 120ms ease; }
      `}</style>
      <Sidebar route={route} go={go} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 min-w-0">
        <Topbar openSearch={() => setSearch(true)} openAsk={() => setAsk(true)} />
        <main style={{ padding: "24px 32px", maxWidth: 1440, marginRight: ask ? 420 : 0, transition: "margin 150ms" }}>{page}</main>
      </div>
      {search && <GlobalSearch onClose={() => setSearch(false)} go={go} openCompany={openCompany} />}
      {ask && <AskPanel ctx={ctx} onClose={() => setAsk(false)} />}
      <Toast msg={toast} />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppInner />
    </WorkspaceProvider>
  );
}
