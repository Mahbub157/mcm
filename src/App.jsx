import React, { useState, useEffect, useMemo, useRef } from "react";
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
      <div className="flex items-center justify-end gap-2">
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
  const ask = (q) => {
    setThread((t) => [...t, { role: "user", q }]);
    setBusy(true);
    setTimeout(() => { setThread((t) => [...t, { role: "ai", a: askAnswer(q, ctx), q }]); setBusy(false); }, 900);
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
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.muted }}>Conclusion</div><div className="font-medium" style={{ color: T.text }}>{m.a.conclusion}</div></div>
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.muted }}>Reasoning</div><div style={{ color: T.text }}>{m.a.reasoning}</div></div>
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.muted }}>Evidence</div><ul className="list-disc pl-4 space-y-0.5" style={{ color: T.text }}>{m.a.evidence.map((e, j) => <li key={j}>{e}</li>)}</ul></div>
              <div><div className="text-xs font-medium mb-0.5" style={{ color: T.amber }}>Uncertainty</div><div style={{ color: T.text }}>{m.a.uncertainty}</div></div>
              <div className="pt-1" style={{ borderTop: `1px solid ${T.border}` }}><div className="text-xs font-medium mb-0.5" style={{ color: T.accent }}>Recommended next action</div><div style={{ color: T.text }}>{m.a.next}</div></div>
              <div className="text-xs pt-1" style={{ color: T.muted }}>AI-assisted response. Investment professional judgment required.</div>
            </div>
          )
        )}
        {busy && <div className="flex items-center gap-2 text-xs" style={{ color: T.muted }}><Loader2 size={12} className="animate-spin" /> Reading evidence for {ctx.company ? ctx.company.name : "context"}</div>}
      </div>
      <div className="p-3 flex gap-2" style={{ borderTop: `1px solid ${T.border}` }}>
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && input) { ask(input); setInput(""); } }} placeholder="Ask about this company or deal" className="flex-1 text-sm px-3 py-1.5 rounded outline-none" style={{ border: `1px solid ${T.border}` }} />
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
  const funnel = [["Universe", 1284], ["Screened", 428], ["Qualified", 143], ["Priority", 37], ["Contacted", 21], ["Dialogue", 12], ["Diligence", 3], ["IC", 1]];
  const attention = [
    { p: "critical", t: "Project Falcon", d: "Customer concentration increased from 31% to 44% in the latest data-room update.", action: () => go("diligence"), cta: "Open diligence" },
    { p: "review", t: "Apex Motion Systems", d: "Founder announced a succession planning initiative at an industry panel.", action: () => openCompany("ams"), cta: "Open company" },
    { p: "active", t: "Precision MedTech Solutions", d: "New target surfaced at fit 91. Awaiting deal team decision on priority.", action: () => openCompany("pms"), cta: "Review fit" },
  ];
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
        <SectionTitle right={<span style={{ color: T.muted, fontSize: 12 }}>3 items require review</span>}>Needs attention</SectionTitle>
        <div className="grid grid-cols-3 gap-4">
          {attention.map((a) => (
            <button key={a.t} onClick={a.action} className="text-left p-4" style={{ background: PRI[a.p][1], borderRadius: R.card, transition: EASE }} onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"} onMouseLeave={(e) => e.currentTarget.style.transform = "none"}>
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
          <SectionTitle right={<span style={{ color: T.muted, fontSize: 11 }}>Updated 08:42</span>}>Activity</SectionTitle>
          <div className="space-y-3">
            {AGENT_EVENTS.map((e, i) => (
              <div key={i} className="flex gap-3">
                <div className="mt-0.5 w-7 h-7 flex items-center justify-center shrink-0" style={{ background: T.accentSoft, color: T.accent, borderRadius: 9 }}><e.icon size={13} strokeWidth={1.7} /></div>
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
function ThesisBuilder({ go, setThesisCtx }) {
  const [phase, setPhase] = useState("idle");
  const [step, setStep] = useState(0);
  const agents = ["Market Research Agent", "Industry Classification Agent", "Company Discovery Agent", "Qualification Agent"];
  const [caps, setCaps] = useState({ "Injection molding": true, "Precision machining": true, "Specialty polymers": true, "Cleanroom manufacturing": true });
  const run = () => {
    setPhase("running"); setStep(0);
    agents.forEach((_, i) => setTimeout(() => setStep(i + 1), 600 * (i + 1)));
    setTimeout(() => setPhase("done"), 600 * agents.length + 400);
  };
  const Field = ({ label, children }) => (
    <div className="mb-3"><div className="text-xs font-medium mb-1" style={{ color: T.muted }}>{label}</div>{children}</div>
  );
  const Input = ({ v, multi }) => multi
    ? <textarea defaultValue={v} rows={4} className="w-full text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200" style={{ border: `1px solid ${T.border}`, color: T.text, borderRadius: R.ctl, transition: EASE }} />
    : <input defaultValue={v} className="w-full text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200" style={{ border: `1px solid ${T.border}`, color: T.text, borderRadius: R.ctl, transition: EASE }} />;
  const Chips = ({ items, color }) => <div className="flex flex-wrap gap-1.5">{items.map((i) => <span key={i} className="text-xs px-2 py-0.5 rounded" style={{ background: color === "red" ? T.redSoft : T.accentSoft, color: color === "red" ? T.red : T.accent }}>{i}</span>)}</div>;
  return (
    <div>
      <PageHeader title="Investment Thesis Builder" sub="Translate MCM investment strategy into a researchable, testable sourcing thesis." crumbs={["Sourcing", "Thesis Builder"]} demo="Synthetic thesis" />
      <div className="grid grid-cols-5 gap-4">
        <Card className="col-span-2">
          <Field label="Thesis name"><Input v="Medical Device Precision Components" /></Field>
          <Field label="Investment rationale"><Input multi v="Medical device OEMs continue to outsource highly engineered polymer and machined components to certified specialists. Suppliers with ISO 13485 certification, validated processes and tight-tolerance capability enjoy multi-year program lock-in and switching costs. Many are founder-owned, technically excellent and commercially under-developed, which matches MCM's value-creation playbook." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="End markets"><Chips items={["Medical Device", "Life Sciences"]} /></Field>
            <Field label="Company type"><Input v="Niche Manufacturer" /></Field>
            <Field label="Revenue"><div className="flex gap-2"><Input v="$8M min" /><Input v="$50M max" /></div></Field>
            <Field label="EBITDA"><div className="flex gap-2"><Input v="$1.5M min" /><Input v="$6M max" /></div></Field>
            <Field label="Gross margin"><Input v="30%+" /></Field>
            <Field label="Geography"><Input v="United States" /></Field>
          </div>
          <Field label="Capabilities">
            <div className="flex flex-wrap gap-2">{Object.keys(caps).map((c) => <label key={c} className="flex items-center gap-1.5 text-sm" style={{ color: T.text }}><input type="checkbox" checked={caps[c]} onChange={() => setCaps({ ...caps, [c]: !caps[c] })} /> {c}</label>)}</div>
          </Field>
          <Field label="Required characteristics"><Chips items={["Highly engineered components", "Mission-critical applications", "Strong switching costs", "Recurring customer relationships"]} /></Field>
          <Field label="Risk exclusions"><Chips color="red" items={["Extreme customer concentration", "Commodity manufacturing", "Declining end markets", "Weak margins"]} /></Field>
          <Btn primary icon={Play} onClick={run} disabled={phase === "running"}>Generate Market Map</Btn>
        </Card>
        <div className="col-span-3 space-y-4">
          {phase === "idle" && (
            <Card className="flex flex-col items-center justify-center py-12 text-center">
              <Radar size={28} style={{ color: T.muted }} />
              <div className="text-sm font-medium mt-3" style={{ color: T.text }}>No market map generated yet</div>
              <div className="text-xs mt-1 max-w-sm" style={{ color: T.muted }}>Generate a market map to estimate the addressable universe, qualify companies against the criteria on the left, and produce a thesis summary with sources.</div>
            </Card>
          )}
          {phase === "running" && (
            <Card>
              <SectionTitle>Agents working</SectionTitle>
              <div className="space-y-2">
                {agents.map((a, i) => (
                  <div key={a} className="flex items-center gap-2 text-sm" style={{ color: step > i ? T.text : T.muted }}>
                    {step > i ? <CheckCircle2 size={15} style={{ color: T.green }} /> : step === i ? <Loader2 size={15} className="animate-spin" style={{ color: T.accent }} /> : <span className="w-[15px] h-[15px] rounded-full" style={{ border: `1px solid ${T.border}` }} />}
                    {a}
                  </div>
                ))}
              </div>
              <div className="mt-4 space-y-2"><Skeleton /><Skeleton w="80%" /><Skeleton w="60%" /></div>
            </Card>
          )}
          {phase === "done" && (
            <>
              <div className="grid grid-cols-3 gap-3">
                {[["Estimated addressable company universe", 327], ["Potential MCM matches", 48], ["High-priority targets", 12]].map(([k, v]) => (
                  <Card key={k}><div className="text-xs" style={{ color: T.muted }}>{k}</div><div className="text-xl font-semibold tabular-nums mt-0.5" style={{ color: T.text }}>{v}</div></Card>
                ))}
              </div>
              <Card>
                <SectionTitle right={<div className="flex items-center gap-3 text-xs"><span style={{ color: T.muted }}>Confidence <b style={{ color: T.green }}>82%</b></span><span style={{ color: T.muted }}>12 public sources reviewed</span></div>}>Investment thesis summary</SectionTitle>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Why this market may be attractive", ["Outsourcing of validated component manufacturing continues to grow as OEMs concentrate on design and regulatory work.", "Certified suppliers with process validation history are rarely switched mid-program.", "Fragmented supplier base with many founder-owned businesses approaching transition."]],
                    ["What could make the thesis wrong", ["OEM insourcing of high-volume programs.", "Pricing pressure from larger contract manufacturers consolidating the space.", "Commodity molders mis-classified as precision suppliers inflate the universe."]],
                    ["Key diligence questions", ["What share of revenue is under multi-year program agreements?", "How many qualified programs were lost in the last three years and why?", "What is the certification and validation renewal calendar?"]],
                    ["Market signals to monitor", ["OEM capex announcements in diagnostics and drug delivery.", "Reshoring of component supply from Asia.", "Hiring activity at competing precision molders."]],
                  ].map(([h, items]) => (
                    <div key={h}>
                      <div className="text-xs font-medium mb-1" style={{ color: T.accent }}>{h}</div>
                      <ul className="list-disc pl-4 space-y-1" style={{ color: T.text }}>{items.map((i) => <li key={i}>{i}</li>)}</ul>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2"><Btn primary icon={Radar} onClick={() => { setThesisCtx && setThesisCtx("Medical Device Precision Components"); go("discovery"); }}>Open the 12 priority targets in Target Discovery</Btn><Btn>Save thesis version</Btn></div>
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
    let r = COMPANIES.filter((c) => (thesis === "All" || c.thesis === thesis) && (sector === "All" || c.sector === sector) && c.fit >= minFit && (own === "All" || c.own === own) && (c.name + c.loc + c.signal).toLowerCase().includes(q.toLowerCase()));
    if (stageFilter === "Priority") r = r.filter((c) => c.fit >= 85);
    if (stageFilter === "Contacted" || stageFilter === "Active Dialogue") r = r.filter((c) => c.rel !== "No relationship");
    return [...r].sort((a, b) => (a[sort.k] > b[sort.k] ? 1 : -1) * sort.d);
  }, [q, thesis, sector, minFit, own, sort, stageFilter]);
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
          <span className="flex items-center gap-2"><Lightbulb size={12} />{thesisCtx ? `Showing targets researched under the ${thesisCtx} thesis` : `Pipeline stage: ${stageFilter}`}</span>
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
                    <td className="px-4 py-2.5" style={{ borderBottom: `1px solid ${T.border}` }}><FitBadge v={c.fit} /></td>
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

/* ---------- Company Intelligence ---------- */
function CompanyIntelligence({ company, go, notify, openThesis }) {
  const c = company;
  const [tab, setTab] = useState("Overview");
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(false);
  const [open, setOpen] = useState(null);
  const [decision, setDecision] = useState(null);
  const run = () => { setRunning(true); setTimeout(() => { setRunning(false); setRan(true); notify("Analysis refreshed. 8 evidence items re-verified."); }, 1600); };
  const breakdown = [["Financial fit", 95], ["Strategic fit", 94], ["Technical differentiation", 89], ["End market", 92], ["Ownership", 90], ["Commercial opportunity", 88], ["Risk profile", 76]];
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
              <div className="flex items-baseline gap-1"><span className="text-3xl font-semibold tabular-nums leading-none" style={{ color: c.fit >= 90 ? T.green : T.accent }}>{c.fit}</span><span className="text-xs" style={{ color: T.muted }}>/ 100</span></div>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <span className="flex flex-col"><span style={{ color: T.muted }}>Confidence</span><Conf v={c.conf} /></span>
                <span className="flex flex-col"><span style={{ color: T.muted }}>Recommendation</span><span className="font-semibold" style={{ color: c.fit >= 85 ? T.green : T.accent }}>{c.fit >= 85 ? "Prioritize" : c.fit >= 75 ? "Research" : "Monitor"}</span></span>
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
                <Btn small icon={running ? Loader2 : Play} onClick={run} disabled={running}>{running ? "Refreshing" : ran ? "Re-run analysis" : "Run full analysis"}</Btn>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card pad={false}>
        <div className="px-5 pt-4"><Tabs tabs={tabs} value={tab} onChange={setTab} /></div>
        <div className="p-5">
          {tab === "Overview" && (
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
  const [tone, setTone] = useState("Founder-to-Founder");
  const [obj, setObj] = useState("Introduction");
  const [editing, setEditing] = useState(false);
  const [approved, setApproved] = useState(false);
  const drafts = {
    "Founder-to-Founder": `Michael,\n\nI came across Precision MedTech while researching precision suppliers to diagnostic OEMs, and the 2024 expansion caught my attention. We are MCM Capital, a Cleveland firm that has partnered with founder-led precision manufacturers for over thirty years, most recently in injection molding for medical customers.\n\nNo agenda beyond learning how you think about the next chapter for the business. If a conversation over coffee in Cleveland is useful, I would welcome it.\n\nChris Hren\nMCM Capital Partners`,
    Professional: `Dear Mr. Reynolds,\n\nMCM Capital Partners is a Cleveland-based private equity firm focused on niche manufacturers of highly engineered components. Precision MedTech Solutions appears to align with our medical device precision components focus, and we would value the opportunity to introduce our firm.\n\nWe would welcome a brief introductory call at your convenience.\n\nSincerely,\nChris Hren\nVice President, MCM Capital Partners`,
    Concise: `Michael,\n\nMCM Capital partners with founder-led precision manufacturers in Cleveland and beyond. Your work for diagnostic OEMs stood out. Open to a short conversation?\n\nChris Hren, MCM Capital Partners`,
  };
  const [text, setText] = useState(drafts[tone]);
  useEffect(() => { setText(drafts[tone]); setApproved(false); }, [tone]);
  return (
    <div>
      <PageHeader title="Outreach" sub="AI-prepared research brief and draft. A human approves every message before it leaves the firm." crumbs={["Sourcing", "Outreach"]} demo="No email is sent" />
      <div className="grid grid-cols-5 gap-4">
        <div className="col-span-2 space-y-4">
          <Card>
            <SectionTitle>Target</SectionTitle>
            <div className="text-sm font-medium" style={{ color: T.text }}>Precision MedTech Solutions</div>
            <div className="text-xs mb-3" style={{ color: T.muted }}>Cleveland, OH. Fit 91. No previous contact.</div>
            <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Decision maker</div>
            <div className="text-sm" style={{ color: T.text }}>Michael Reynolds, Founder & CEO <span className="text-xs ml-1" style={{ color: T.unknown }}>Synthetic identity</span></div>
          </Card>
          <Card>
            <SectionTitle>Research brief</SectionTitle>
            <ul className="list-disc pl-4 text-sm space-y-1" style={{ color: T.text }}>
              <li>Founded 2004; founder retains full ownership and discussed succession in 2026 (Inferred).</li>
              <li>Expanded Cleveland facility in 2024, likely adding molding capacity (Confirmed).</li>
              <li>Hired a VP Sales in 2025, first dedicated commercial leader (Inferred).</li>
              <li>ISO 13485 active; serves diagnostic and drug-delivery OEMs (Confirmed).</li>
            </ul>
            <div className="text-xs mt-2" style={{ color: T.muted }}>Relationship context: none. Two possible warm paths through MCM's advisory network.</div>
          </Card>
          <Card>
            <SectionTitle>Controls</SectionTitle>
            <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Tone</div>
            <div className="flex gap-1.5 mb-3">{Object.keys(drafts).map((t) => <button key={t} onClick={() => setTone(t)} className="text-xs px-3 py-1.5" style={{ borderRadius: R.chip, border: `1px solid ${tone === t ? T.accent : T.border}`, background: tone === t ? T.accentSoft : "#fff", color: tone === t ? T.accent : T.text }}>{t}</button>)}</div>
            <div className="text-xs font-medium mb-1" style={{ color: T.muted }}>Objective</div>
            <div className="flex gap-1.5">{["Introduction", "Industry Discussion", "MCM Overview"].map((t) => <button key={t} onClick={() => setObj(t)} className="text-xs px-3 py-1.5" style={{ borderRadius: R.chip, border: `1px solid ${obj === t ? T.accent : T.border}`, background: obj === t ? T.accentSoft : "#fff", color: obj === t ? T.accent : T.text }}>{t}</button>)}</div>
          </Card>
        </div>
        <Card className="col-span-3 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2"><span className="text-xs px-2 py-0.5 rounded-lg" style={{ background: T.amberSoft, color: T.amber, border: `1px solid ${T.amber}55` }}>Draft. Not sent. Requires approval by C. Hren</span></div>
            <span className="text-xs" style={{ color: T.muted }}>Objective: {obj}</span>
          </div>
          {editing ? <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} className="w-full text-sm p-3 rounded outline-none flex-1 focus:ring-2 focus:ring-blue-200" style={{ border: `1px solid ${T.accent}`, color: T.text, whiteSpace: "pre-wrap" }} />
            : <pre className="text-sm p-3 rounded flex-1 whitespace-pre-wrap" style={{ border: `1px solid ${T.border}`, color: T.text, background: T.bg, ...FONT }}>{text}</pre>}
          <div className="flex items-center gap-2 mt-3">
            <Btn onClick={() => setEditing(!editing)}>{editing ? "Done editing" : "Edit"}</Btn>
            <Btn onClick={() => notify("Draft saved to workspace.")}>Save draft</Btn>
            <Btn primary icon={Mail} onClick={() => { setApproved(true); notify("Draft prepared for human approval."); }}>Approve for Outlook</Btn>
            <span className="text-xs ml-auto" style={{ color: T.muted }}>Approval places the draft in the owner's Outlook drafts folder (conceptual). Sending remains manual.</span>
            {approved && <span className="text-xs" style={{ color: T.green }}>Draft prepared for human approval. Nothing has been sent.</span>}
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
  "CIM p. 23": "Falcon Precision Technologies generated $38.2M in FY2025 revenue, an 8.1% increase over FY2024, driven primarily by two aerospace platform ramps.",
  "CIM p. 48": "Customer A represented 31% of FY2025 revenue. The top five customers represented 64%. The current supply agreement with Customer A runs through Q3 2028.",
  "CIM p. 58": "Management projects 12% revenue CAGR through FY2028, of which approximately two thirds is attributable to Program X and Program Y volumes.",
  "CIM p. 71": "Adjusted EBITDA of $5.1M includes $740K of adjustments for owner compensation normalization, one-time legal costs and a facility relocation.",
  "CIM p. 84": "The company operates 42 CNC machines across two facilities with an estimated 78% utilization on a two-shift basis.",
  "CIM p. 92": "Senior leadership consists of the CEO/owner, a COO with 11 years of tenure, and a CFO hired in 2023.",
};
function CIMAnalyzer({ go, notify }) {
  const [src, setSrc] = useState("CIM p. 48");
  const [review, setReview] = useState({});
  const Cite = ({ p }) => <button onClick={() => setSrc(p)} className="tabular-nums ml-1 px-1 rounded-lg" style={{ color: T.accent, background: src === p ? T.accentSoft : "transparent", border: `1px solid ${src === p ? T.accent + "55" : "transparent"}` }}>{p}</button>;
  const fin = [
    ["Revenue", "$32.9M", "$35.3M", "$38.2M", "8.1%", "CIM p. 23", "confirmed"],
    ["Gross profit", "$11.0M", "$12.1M", "$13.5M", "11.6%", "CIM p. 23", "confirmed"],
    ["Gross margin", "33.4%", "34.2%", "35.4%", "+120 bps", "CIM p. 23", "confirmed"],
    ["Reported EBITDA", "$3.6M", "$3.9M", "$4.4M", "12.8%", "CIM p. 71", "confirmed"],
    ["Adjustments", "$0.5M", "$0.6M", "$0.7M", "", "CIM p. 71", "risk"],
    ["Adjusted EBITDA", "$4.1M", "$4.5M", "$5.1M", "13.3%", "CIM p. 71", "confirmed"],
    ["Adj. EBITDA margin", "12.5%", "12.7%", "13.4%", "+70 bps", "CIM p. 71", "confirmed"],
    ["Capex", "$1.9M", "$2.1M", "$2.4M", "", "CIM p. 84", "confirmed"],
    ["Employees", "151", "160", "168", "", "CIM p. 92", "confirmed"],
    ["Top customer share", "29%", "30%", "31%", "", "CIM p. 48", "risk"],
    ["Top 5 customer share", "61%", "62%", "64%", "", "CIM p. 48", "risk"],
    ["Net working capital", "", "", "Not disclosed", "", "", "unknown"],
  ];
  const sections = [
    ["Investment highlights", [["Precision aerospace components with AS9100 certification and long qualification cycles.", "CIM p. 23", "confirmed"], ["Gross margin of 35.4% sits above MCM's 30% manufacturing threshold.", "CIM p. 23", "confirmed"], ["Two-facility footprint with capacity headroom on a third shift.", "CIM p. 84", "inferred"]]],
    ["Potential risks", [["Top customer at 31% and top five at 64%; agreement expires Q3 2028.", "CIM p. 48", "risk"], ["Growth projection depends heavily on two programs.", "CIM p. 58", "risk"], ["$740K of EBITDA adjustments require validation.", "CIM p. 71", "risk"]]],
    ["Customer concentration", [["Customer A 31%, B 12%, C 9%, D 7%, E 5%. Customer A agreement through Q3 2028; pricing mechanics not disclosed.", "CIM p. 48", "confirmed"]]],
    ["Market exposure", [["Commercial aerospace 58%, defense 27%, industrial 15%.", "CIM p. 58", "confirmed"]]],
    ["Management", [["CEO/owner, tenured COO, CFO hired 2023. Succession not addressed in CIM.", "CIM p. 92", "confirmed"]]],
    ["Operations", [["42 CNC machines, estimated 78% utilization on two shifts.", "CIM p. 84", "confirmed"]]],
    ["Key diligence questions", [["What are the renewal terms and pricing mechanics with Customer A?", "CIM p. 48", null], ["Which adjustments in the $740K are truly non-recurring?", "CIM p. 71", null], ["What is the CEO's post-transaction role and timeline?", "CIM p. 92", null]]],
    ["Missing information", [["Customer contract copies, quality metrics (scrap, on-time delivery), and working capital seasonality are not in the CIM.", null, "unknown"]]],
  ];
  const reviewed = Object.values(review).filter(Boolean).length;
  const mark = (k) => setReview((r) => ({ ...r, [k]: !r[k] }));
  return (
    <div>
      <div className="flex items-center gap-1 text-xs mb-2" style={{ color: T.muted }}>
        <span>Deals</span><ChevronRight size={12} /><button onClick={() => go("pipeline")} className="hover:underline">Deal Pipeline</button><ChevronRight size={12} /><span style={{ color: T.text }}>Project Falcon</span><ChevronRight size={12} /><span style={{ color: T.text }}>Preliminary CIM review</span>
      </div>
      <Card pad={false} style={{ marginBottom: 24 }}>
        <div className="flex items-stretch">
          <div className="flex-1 p-5" style={{ borderRight: `1px solid ${T.border}` }}>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="tracking-tight leading-tight" style={{ color: T.text, fontSize: 24, fontWeight: 700, margin: 0 }}>Project Falcon</h1>
                <div className="text-xs mt-0.5" style={{ color: T.muted }}>Falcon Precision Technologies. Aerospace precision components. Received via intermediary. Stage: Diligence.</div>
                <div className="flex items-center gap-1.5 mt-2">{["142-page CIM", "AS9100", "Aerospace Precision Components thesis", "Two facilities"].map((t) => <span key={t} className="text-xs px-1.5 py-0.5 rounded-lg" style={{ border: `1px solid ${T.border}`, color: T.text }}>{t}</span>)}</div>
              </div>
              <Demo>Synthetic CIM and citations</Demo>
            </div>
          </div>
          <div className="w-80 p-5 grid grid-cols-2 gap-x-5">
            <KV k="Investment fit" v={<span style={{ color: T.green }}>Strong</span>} />
            <KV k="Extraction confidence" v="87%" />
            <KV k="Pages cited" v="41 of 142" />
            <KV k="Tables extracted" v="27" />
            <KV k="Sections reviewed" v={<span style={{ color: reviewed === sections.length ? T.green : T.amber }}>{reviewed} of {sections.length}</span>} />
            <KV k="Review owner" v="B. Kingsbury" />
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-8 space-y-3">
          <Card pad={false}>
            <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}`, background: "#fafaf8" }}>
              <span className="text-xs font-medium" style={{ color: T.text }}>Financial summary as presented in CIM ($ millions)</span>
              <Legend levels={["confirmed", "risk", "unknown"]} />
            </div>
            <table className="w-full text-xs">
              <thead><tr style={{ color: T.muted }}>{["", "FY2023", "FY2024", "FY2025", "Growth / change", "Source", ""].map((h, i) => <th key={i} className={`font-medium px-3 py-1 ${i >= 1 && i <= 4 ? "text-right" : "text-left"}`} style={{ borderBottom: `1px solid ${T.border}` }}>{h}</th>)}</tr></thead>
              <tbody>{fin.map(([m, a, b, c2, g, p, l]) => (
                <tr key={m} style={{ borderBottom: `1px solid ${T.border}`, background: l === "risk" ? T.redSoft : "transparent" }}>
                  <td className="px-3 py-1 font-medium" style={{ color: l === "unknown" ? T.unknown : T.text, paddingLeft: m.startsWith("Adj") || m === "Adjustments" ? 20 : 12 }}>{m}</td>
                  <td className="px-3 py-1 text-right tabular-nums" style={{ color: T.muted }}>{a}</td>
                  <td className="px-3 py-1 text-right tabular-nums" style={{ color: T.muted }}>{b}</td>
                  <td className="px-3 py-1 text-right tabular-nums font-semibold" style={{ color: l === "unknown" ? T.unknown : l === "risk" ? T.red : T.text }}>{c2}</td>
                  <td className="px-3 py-1 text-right tabular-nums" style={{ color: g.startsWith("+") || /^\d/.test(g) ? T.green : T.muted }}>{g}</td>
                  <td className="px-3 py-1">{p && <Cite p={p} />}</td>
                  <td className="px-3 py-1 text-right"><Level level={l} small /></td>
                </tr>
              ))}</tbody>
            </table>
          </Card>
          <div className="grid grid-cols-2 gap-3">
            {sections.map(([h, items]) => (
              <Card key={h} pad={false}>
                <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${T.border}` }}>
                  <span className="text-xs font-medium" style={{ color: h === "Potential risks" ? T.red : h === "Missing information" ? T.unknown : T.text }}>{h}</span>
                  <label className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: review[h] ? T.green : T.muted }}><input type="checkbox" checked={!!review[h]} onChange={() => mark(h)} /> {review[h] ? "Reviewed" : "Mark reviewed"}</label>
                </div>
                <ul className="px-3 py-2 space-y-1.5 text-xs" style={{ color: T.text }}>
                  {items.map(([t, p, l], i) => <li key={i} className="flex items-start justify-between gap-2"><span>{t}{p && <Cite p={p} />}</span>{l && <Level level={l} small />}</li>)}
                </ul>
              </Card>
            ))}
          </div>
        </div>
        <div className="col-span-4 space-y-3">
          <Card pad={false}>
            <div className="px-3 py-1.5 text-xs font-medium flex items-center justify-between" style={{ borderBottom: `1px solid ${T.border}`, background: "#fafaf8", color: T.text }}><span>Source excerpt</span><span style={{ color: T.accent }}>{src}</span></div>
            <div className="p-3">
              <p className="text-xs leading-relaxed" style={{ color: T.text, fontFamily: "Georgia, serif" }}>{CIM_EXCERPTS[src]}</p>
              <div className="text-xs mt-2" style={{ color: T.unknown }}>Synthetic demonstration excerpt. Click any page reference to change the excerpt.</div>
            </div>
          </Card>
          <Card pad={false}>
            <div className="px-3 py-1.5 text-xs font-medium" style={{ borderBottom: `1px solid ${T.border}`, background: "#fafaf8", color: T.text }}>Pages referenced</div>
            <div className="p-2 grid grid-cols-3 gap-1">{Object.keys(CIM_EXCERPTS).map((p) => <button key={p} onClick={() => setSrc(p)} className="text-xs px-1.5 py-1 rounded-lg tabular-nums" style={{ border: `1px solid ${src === p ? T.accent : T.border}`, color: src === p ? T.accent : T.text }}>{p.replace("CIM ", "")}</button>)}</div>
          </Card>
          <Card>
            <div className="text-xs font-medium mb-1" style={{ color: T.text }}>Analyst sign-off</div>
            <div className="text-xs mb-2" style={{ color: T.muted }}>Extraction is locked for the IC memo only after every section is marked reviewed by a member of the deal team.</div>
            <div className="flex flex-col gap-1.5">
              <Btn primary disabled={reviewed < sections.length} onClick={() => notify("Extraction locked for IC memo. Reviewed by B. Kingsbury.")}>Lock extraction for IC memo</Btn>
              <Btn icon={ShieldAlert} onClick={() => go("redteam")}>Open Red Team findings</Btn>
              <Btn icon={FileSignature} onClick={() => go("icmemo")}>Open IC memo draft</Btn>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------- Red Team ---------- */
function RedTeam({ go }) {
  const [phase, setPhase] = useState("idle");
  const [compare, setCompare] = useState(false);
  const [disp, setDisp] = useState({});
  const run = () => { setPhase("running"); setTimeout(() => setPhase("done"), 1500); };
  const A = [
    { a: "Aerospace growth will remain strong.", ch: "67% of projected growth depends on two programs. A delay on either removes most of the plan's upside.", ev: ["CIM p. 58", "Market Research #14"], sev: "Medium", test: "18-month slip on one program reduces FY2028 revenue from $53M to $46M." },
    { a: "Customer relationships are highly durable.", ch: "Top customer is 31% of sales; the agreement expires within 24 months of an expected close. Renewal pricing is not disclosed.", ev: ["CIM p. 48", "Contract summary (data room)"], sev: "High", test: "Prior renewals: no pricing history in CIM. Requested from management." },
    { a: "EBITDA adjustments are reasonable.", ch: "$740K of adjusted EBITDA relates to items that may recur; relocation costs appeared in two of the last three years.", ev: ["CIM p. 71", "Quality of earnings draft"], sev: "High", test: "FY2023 and FY2024 adjustments include $180K and $210K of similar items." },
  ];
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
          {phase === "done" && <div className="text-right"><div style={{ fontSize: 20, fontWeight: 650, lineHeight: 1 }}>3 findings</div><div style={{ fontSize: 12, color: mutedD }}><span style={{ color: warn }}>2 High</span> · <span style={{ color: amberD }}>1 Medium</span></div></div>}
          <span style={{ fontSize: 11, padding: "2px 7px", borderRadius: 4, background: panel, color: mutedD }}>Synthetic analysis</span>
          {phase !== "done" && <button onClick={run} disabled={phase === "running"} className="flex items-center gap-1.5 font-medium disabled:opacity-60" style={{ fontSize: 13, padding: "6px 12px", borderRadius: 6, background: T.accent, color: "#fff" }}>{phase === "running" ? <Loader2 size={13} className="animate-spin" /> : <ShieldAlert size={13} />}{phase === "running" ? "Reviewing" : "Run Red Team review"}</button>}
        </div>
      </div>
      <div className="grid grid-cols-12 gap-4" style={{ marginBottom: 24 }}>
        <div className="col-span-8 p-4" style={{ background: panel, borderRadius: 12 }}>
          <div style={{ color: mutedD, fontSize: 11, marginBottom: 4 }}>Thesis under review (IC memo draft v3)</div>
          <p style={{ fontSize: 15, margin: 0, lineHeight: 1.5 }}>"Falcon represents a high-quality precision manufacturer benefiting from durable aerospace demand and strong technical barriers."</p>
        </div>
        <div className="col-span-4 p-4 grid grid-cols-2 gap-x-4 gap-y-2" style={{ background: panel, borderRadius: 12, fontSize: 12 }}>
          {[["Reviewer", "Red-Team Agent v2"], ["Scope", "CIM, data room, research"], ["Sources checked", "3 documents, 14 notes"], ["Deal team response", phase === "done" ? `${disposed} of 3 findings` : "Not started"]].map(([k, v]) => <div key={k}><div style={{ color: mutedD, fontSize: 11 }}>{k}</div><div>{v}</div></div>)}
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
      {phase === "done" && (
        <>
          <div className="grid grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
            {A.map((x, i) => (
              <div key={i} className="p-4 flex flex-col" style={{ background: panel, borderRadius: 12, borderTop: `3px solid ${x.sev === "High" ? warn : amberD}` }}>
                <div className="flex items-center justify-between" style={{ marginBottom: 8 }}><span className="tabular-nums" style={{ color: mutedD, fontSize: 11 }}>0{i + 1}</span><span style={{ fontSize: 11, fontWeight: 600, color: x.sev === "High" ? warn : amberD, letterSpacing: "0.06em" }}>{x.sev.toUpperCase()}</span></div>
                <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.35, marginBottom: 12 }}>{x.a}</div>
                <div style={{ color: mutedD, fontSize: 11, marginBottom: 2 }}>Challenge</div>
                <div style={{ fontSize: 13, lineHeight: 1.5, marginBottom: 10 }}>{x.ch}</div>
                <div style={{ color: mutedD, fontSize: 11, marginBottom: 2 }}>Evidence</div>
                <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: 10 }}>{x.ev.map((e) => <span key={e} className="tabular-nums" style={{ fontSize: 11.5, padding: "2px 7px", borderRadius: 4, background: "rgba(143,182,227,0.12)", color: link }}>{e}</span>)}</div>
                <div style={{ color: mutedD, fontSize: 11, marginBottom: 2 }}>Test</div>
                <div style={{ fontSize: 12.5, color: mutedD, lineHeight: 1.5, marginBottom: 14 }}>{x.test}</div>
                <div className="mt-auto pt-3" style={{ borderTop: `1px solid ${line}` }}>
                  <div style={{ color: mutedD, fontSize: 11, marginBottom: 6 }}>Deal team disposition</div>
                  <div className="flex flex-wrap gap-1.5">{["Requires resolution", "Accept risk", "Reject finding"].map((d) => <DBtn key={d} active={disp[i] === d} onClick={() => setDisp({ ...disp, [i]: d })}>{d}</DBtn>)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-12 gap-4" style={{ marginBottom: 24 }}>
            <div className="col-span-8 p-4" style={{ background: panel, borderRadius: 12 }}>
              <div className="flex items-center justify-between" style={{ marginBottom: 4 }}><span style={{ color: mutedD, fontSize: 11 }}>Verdict</span><span style={{ color: mutedD, fontSize: 11 }}>Confidence 84%. Advisory only; the investment team decides.</span></div>
              <div style={{ fontSize: 18, fontWeight: 650 }}>Investable, but three items require resolution before a binding offer</div>
              <div style={{ color: mutedD, fontSize: 11, margin: "12px 0 4px" }}>Critical questions for management</div>
              <ol className="list-decimal pl-5 space-y-1" style={{ fontSize: 13 }}>
                <li>What are Customer A's renewal terms, and has pricing been renegotiated in prior renewals?</li>
                <li>Which of the $740K adjustments recurred in FY2023 or FY2024, and why?</li>
                <li>What is the downside case if one of the two growth programs slips by 18 months?</li>
              </ol>
            </div>
            <div className="col-span-4 p-4 flex flex-col justify-between" style={{ background: panel, borderRadius: 12 }}>
              <div style={{ fontSize: 13, color: mutedD }}>{disposed < 3 ? `${3 - disposed} finding${3 - disposed > 1 ? "s" : ""} awaiting deal team disposition` : "All findings dispositioned"}</div>
              <div className="flex flex-col gap-2 mt-4">
                <button onClick={() => setCompare(!compare)} className="flex items-center justify-center gap-1.5 font-medium" style={{ fontSize: 13, padding: "7px 12px", borderRadius: 6, background: T.accent, color: "#fff" }}><GitCompare size={13} /> {compare ? "Hide bull vs bear" : "Compare bull vs bear case"}</button>
                <button onClick={() => go("diligence")} className="flex items-center justify-center gap-1.5" style={{ fontSize: 13, padding: "7px 12px", borderRadius: 6, border: `1px solid ${line}`, color: text }}><ClipboardCheck size={13} /> Push questions to diligence</button>
              </div>
            </div>
          </div>
          {compare && (
            <div className="overflow-hidden" style={{ background: panel, borderRadius: 12 }}>
              <table className="w-full" style={{ fontSize: 13 }}>
                <thead><tr><th className="text-left font-medium px-4 py-2.5" style={{ color: mutedD, borderBottom: `1px solid ${line}`, width: 170, fontSize: 11 }}>Dimension</th><th className="text-left font-medium px-4 py-2.5" style={{ color: greenD, borderBottom: `1px solid ${line}`, fontSize: 11 }}>Investment case</th><th className="text-left font-medium px-4 py-2.5" style={{ color: warn, borderBottom: `1px solid ${line}`, fontSize: 11 }}>Red Team case</th><th className="text-right font-medium px-4 py-2.5" style={{ color: mutedD, borderBottom: `1px solid ${line}`, fontSize: 11 }}>Delta</th></tr></thead>
                <tbody>{[
                  ["FY2028 revenue", "$53M (12% CAGR)", "$44M to $46M (5% to 6% CAGR) if one program slips", "-$7M to -$9M"],
                  ["Adjusted EBITDA", "$5.1M, expanding with mix", "$4.4M if $740K adjustments recur", "-$0.7M"],
                  ["Customer A", "Long-standing, sole-source on qualified parts", "31% share, renewal within 24 months, pricing undisclosed", "Unresolved"],
                  ["Growth programs", "Two platform ramps with public OEM backlog", "67% of growth from two programs; schedule risk not modeled", "Unresolved"],
                  ["Valuation view", "Upper half of $42M to $48M range", "Lower half of range, with earn-out on Customer A renewal", "-$3M to -$5M"],
                  ["Exit thesis", "Strategic buyers value AS9100 capacity", "Concentration discount likely persists at exit", "0.5x to 1.0x multiple"],
                ].map(([k, a2, b2, d]) => <tr key={k} style={{ borderBottom: `1px solid ${line}` }}><td className="px-4 py-2.5 font-medium" style={{ color: mutedD }}>{k}</td><td className="px-4 py-2.5">{a2}</td><td className="px-4 py-2.5">{b2}</td><td className="px-4 py-2.5 text-right tabular-nums" style={{ color: d.startsWith("-") ? warn : mutedD }}>{d}</td></tr>)}</tbody>
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
  const cats = [
    ["Financial", 86, 142, 3, 1, "K. Hayes", DollarSign], ["Commercial", 72, 96, 9, 2, "C. Hren", Users], ["Operational", 64, 118, 8, 0, "G. Ott", Wrench], ["Legal", 58, 210, 11, 1, "Counsel", Gavel],
    ["Management", 45, 24, 6, 1, "B. Kingsbury", Users], ["Technology", 70, 61, 4, 0, "H. Shimp", Cpu], ["Cybersecurity", 30, 18, 3, 0, "Advisor", Shield], ["ESG", 52, 27, 3, 0, "A. Anton", Leaf],
  ];
  const overall = Math.round(cats.reduce((s, c) => s + c[1], 0) / cats.length);
  const health = (p, r) => (r > 0 ? "critical" : p < 50 ? "review" : "healthy");
  const hl = { critical: "At risk", review: "Watch", healthy: "Healthy" };
  return (
    <div>
      <PageHeader title="Due Diligence" sub="Project Falcon. Workstream status, open questions and material risks." crumbs={["Deals", "Due Diligence", "Project Falcon"]} demo="Demo data" />
      <div className="grid gap-4" style={{ gridTemplateColumns: "1.6fr 1fr 1fr 1fr", marginBottom: 24 }}>
        <Card className="flex items-center gap-5">
          <div className="relative shrink-0" style={{ width: 72, height: 72 }}>
            <svg viewBox="0 0 36 36" width="72" height="72"><circle cx="18" cy="18" r="15.5" fill="none" stroke={T.soft} strokeWidth="3" /><circle cx="18" cy="18" r="15.5" fill="none" stroke={T.accent} strokeWidth="3" strokeDasharray={`${overall * 0.974} 100`} strokeLinecap="round" transform="rotate(-90 18 18)" /></svg>
            <div className="absolute inset-0 flex items-center justify-center tabular-nums" style={{ fontSize: 17, fontWeight: 650, color: T.text }}>{overall}%</div>
          </div>
          <div><div style={{ color: T.muted, fontSize: 12 }}>Overall completion</div><div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>8 workstreams</div><div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>1,247 documents indexed · 312 tables extracted</div></div>
        </Card>
        <Metric k="Open questions" v="47" sub="11 in legal" />
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
    </div>
  );
}

/* ---------- IC Memo ---------- */
function ICMemo({ notify }) {
  const secs = [
    ["Executive Summary", "Falcon Precision Technologies is an AS9100-certified manufacturer of precision aerospace components with $38.2M revenue and $5.1M adjusted EBITDA. The business fits MCM's aerospace precision thesis. Three items from the Red Team must be resolved before a final recommendation: Customer A renewal terms, recurring adjustments, and program schedule risk.", 3],
    ["Company Overview", "Founded 1987, two facilities in Ohio and Kansas, 168 employees, 42 CNC machines. Commercial aerospace 58%, defense 27%, industrial 15%.", 4],
    ["Investment Thesis", "Durable demand from qualified programs, technical barriers from certification and part qualification, and an under-invested commercial function that MCM's playbook can address.", 3],
    ["Strategic Fit", "Matches MCM criteria on revenue, EBITDA, margin, ownership and sector. Add-on opportunities exist among regional machining shops.", 2],
    ["Market", "Commercial aerospace build rates recovering; defense budgets stable. Two programs drive most projected growth.", 3],
    ["Financial Performance", "Revenue growth 8.1% (FY2025), gross margin 35.4%, capex $2.4M. Quality of earnings in progress.", 5],
    ["Value Creation Plan", "Systematic business development, pricing discipline on low-margin parts, third-shift capacity, one to two add-ons.", 2],
    ["Key Risks", "Customer concentration, program dependency, EBITDA adjustment quality, management succession.", 4],
    ["Red-Team Findings", "Verdict: investable with three items requiring resolution. Two high-severity findings.", 3],
    ["Deal Structure", "Majority recapitalization with rollover equity; earn-out tied to Customer A renewal under consideration.", 1],
    ["Open Questions", "Seven open questions, listed in the diligence tracker, of which three are gating.", 0],
    ["Recommendation", "Proceed to final diligence. Do not submit a binding offer until the three gating items are resolved.", 2],
  ];
  const [open, setOpen] = useState(0);
  return (
    <div>
      <PageHeader title="Investment Committee Memo" sub="Project Falcon · Draft v3 · Not for distribution · Investment professional review required" crumbs={["Deals", "IC Memo", "Project Falcon"]} demo="Synthetic memo" />
      <div className="grid grid-cols-4 gap-4">
        <Card pad={false} className="col-span-3">
          {secs.map(([h, b, n], i) => (
            <div key={h} style={{ borderBottom: `1px solid ${T.border}` }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-stone-50">
                <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{h}</span>
                <span className="flex items-center gap-3" style={{ fontSize: 11, color: T.muted }}>{n > 0 && <span>{n} citations</span>}{h === "Open Questions" && <span style={{ color: T.amber }}>7 open</span>}<ChevronDown size={14} style={{ transform: open === i ? "rotate(180deg)" : "none" }} /></span>
              </button>
              {open === i && <div className="px-5 pb-4" style={{ fontSize: 13.5, lineHeight: 1.65, color: T.text, maxWidth: 760 }}>{b}{h === "Key Risks" && <span className="ml-2"><Level level="risk" small /></span>}</div>}
            </div>
          ))}
        </Card>
        <div className="space-y-4">
          <Card>
            <SectionTitle>Memo health</SectionTitle>
            <div className="grid grid-cols-3 gap-2" style={{ marginBottom: 12 }}>
              <div><div className="tabular-nums" style={{ fontSize: 20, fontWeight: 650, color: T.green }}>94%</div><div style={{ fontSize: 11, color: T.muted }}>Evidence coverage</div></div>
              <div><div className="tabular-nums" style={{ fontSize: 20, fontWeight: 650, color: T.amber }}>2</div><div style={{ fontSize: 11, color: T.muted }}>Unsupported</div></div>
              <div><div className="tabular-nums" style={{ fontSize: 20, fontWeight: 650, color: T.text }}>7</div><div style={{ fontSize: 11, color: T.muted }}>Open questions</div></div>
            </div>
            <div className="p-3.5" style={{ background: T.amberSoft, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: T.amber }}>Ready for IC?</div>
              <div className="flex items-center gap-2" style={{ fontSize: 14, fontWeight: 600, color: T.amber }}><span className="w-2 h-2 rounded-full" style={{ background: T.amber }} />Not yet</div>
              <div style={{ fontSize: 12, color: T.text, marginTop: 2 }}>3 gating issues remain. Last analyst review today.</div>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-2">
              <Btn icon={Eye} onClick={() => notify("Source panel: 32 citations across CIM, data room and market research.")}>Review sources</Btn>
              <Btn icon={GitCompare} onClick={() => notify("Version 3 vs version 2: Red-Team findings and deal structure sections changed.")}>Compare versions</Btn>
              <Btn primary icon={Download} onClick={() => notify("Draft exported (simulated). Marked 'Draft, not for distribution'.")}>Export draft</Btn>
            </div>
          </Card>
          <Card>
            <div style={{ fontSize: 11, color: T.amber, fontWeight: 600, marginBottom: 4 }}>Unsupported claims</div>
            <ul className="space-y-1" style={{ fontSize: 13, color: T.text }}><li>"Defense budgets stable" lacks a cited source.</li><li>Add-on target count not yet validated.</li></ul>
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
function Knowledge() {
  const [q, setQ] = useState("What have we historically learned from medical-device injection molding investments?");
  const [res, setRes] = useState(true);
  const cats = ["Historical Deals", "Investment Theses", "Rejected Opportunities", "Diligence Findings", "Portfolio Lessons", "Market Research", "Investment Committee Decisions"];
  const insights = [
    ["Historical pattern", "Companies with highly technical capabilities but limited systematic business development may present attractive value-creation opportunities.", ["Historical deals", "Portfolio lessons"]],
    ["Diligence lesson", "Program-level revenue visibility mattered more than total customer count in past molding investments. Ask for revenue by program, not only by customer.", ["Diligence findings"]],
    ["Rejected opportunity pattern", "Molders whose largest customer exceeded 40% without a multi-year agreement were declined in most illustrative cases, regardless of margin.", ["Rejected opportunities", "IC decisions"]],
    ["Portfolio lesson", "Capacity investment ahead of validated demand extended payback periods; capacity added against qualified programs paid back faster.", ["Portfolio lessons"]],
  ];
  return (
    <div>
      <PageHeader title="MCM Knowledge" sub="Institutional memory as searchable intelligence. Decades of decisions, findings and lessons, conceptually indexed." crumbs={["Knowledge", "MCM Knowledge"]} demo="All insights synthetic" />
      <div className="flex gap-2" style={{ marginBottom: 12 }}><span className="flex items-center gap-2 px-4 flex-1 bg-white" style={{ border: `1px solid ${T.border}`, borderRadius: R.chip }}><Search size={14} style={{ color: T.muted }} /><input value={q} onChange={(e) => setQ(e.target.value)} className="flex-1 outline-none" style={{ fontSize: 13, padding: "8px 0", color: T.text }} /></span><Btn primary onClick={() => setRes(true)}>Search knowledge</Btn></div>
      <div className="flex gap-1.5 flex-wrap" style={{ marginBottom: 24 }}>{cats.map((c) => <span key={c} style={{ fontSize: 12, padding: "3px 10px", borderRadius: 999, background: T.soft, color: T.muted }}>{c}</span>)}</div>
      {res && (
        <Card pad={false}>
          <div className="px-5 py-2" style={{ fontSize: 12, color: T.muted, borderBottom: `1px solid ${T.border}` }}>4 results · no actual MCM decisions are represented</div>
          {insights.map(([h, b, src]) => (
            <div key={h} className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}` }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 4 }}><span style={{ fontSize: 14, fontWeight: 600, color: T.accent }}>{h}</span><span style={{ fontSize: 11, padding: "1px 6px", borderRadius: 4, background: T.unknownSoft, color: T.unknown }}>Illustrative</span></div>
              <p style={{ fontSize: 13.5, color: T.text, margin: 0, lineHeight: 1.6, maxWidth: 760 }}>{b}</p>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 6 }}>Sources: {src.join(" · ")}</div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
function ResearchLibrary() {
  const docs = [["Medical device outsourcing outlook 2026", "Market research", "Market Agent", "Today", "Medical Device thesis", Globe], ["Aerospace build-rate tracker Q3", "Market research", "Market Agent", "Yesterday", "Aerospace thesis", Globe], ["Precision molder peer margin set (8 companies)", "Benchmark", "Financial Agent", "2 days ago", "Medical Device thesis", BarChart3], ["Reshoring signals in component supply", "Market research", "Research Agent", "1 week ago", "Medical Device thesis", Globe], ["Elevator and escalator parts distribution map", "Sector map", "Research Agent", "2 weeks ago", "Distribution thesis", Layers], ["Market Research #14: Program dependency in aerospace suppliers", "Research note", "Red-Team Agent", "3 weeks ago", "Project Falcon", FileText]];
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
          <tbody>{docs.map(([t, ty, a, u, rel, I]) => <tr key={t} className="hover:bg-stone-50 cursor-pointer" style={{ borderBottom: `1px solid ${T.border}` }}><td className="px-4 py-2.5 font-medium" style={{ color: T.text }}><span className="flex items-center gap-2"><I size={14} strokeWidth={1.6} style={{ color: T.muted }} />{t}</span></td><td className="px-4 py-2.5" style={{ color: T.muted }}>{ty}</td><td className="px-4 py-2.5" style={{ color: T.muted }}>{a}</td><td className="px-4 py-2.5"><span style={{ fontSize: 12, padding: "2px 8px", borderRadius: 4, background: T.accentSoft, color: T.accent }}>{rel}</span></td><td className="px-4 py-2.5" style={{ color: T.muted }}>{u}</td></tr>)}</tbody></table>
      </Card>
    </div>
  );
}

/* ---------- Agent Architecture ---------- */
function AgentActivity() {
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
      <PageHeader title="Agent Architecture" sub="How work is orchestrated, which model handles each task, and where cost is controlled." crumbs={["System", "Agent Activity"]} demo="Conceptual architecture" />
      <div className="grid gap-4" style={{ gridTemplateColumns: "3fr 2fr" }}>
        <Card>
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
export default function App() {
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
