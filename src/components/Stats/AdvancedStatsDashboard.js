import React, { useEffect, useLayoutEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DOMAIN } from "../../constants";
import s from "./AdvancedStatsDashboard.module.css";

/* ════════════════════════════════════════════════════════════════
   DESIGN TOKENS
   Light, clean, matches the app shell (cyan→white gradient).
   Categorical palette = validated 8-slot set (CVD-safe, fixed order).
   Single-hue (sequential) blue for magnitude charts.
   ════════════════════════════════════════════════════════════════ */
const INK = "#16324f";        // primary text
const MUTED = "#7e93a8";      // axis / secondary labels
const GRID = "#e3edf4";       // hairline gridlines
const BASE = "#c7d7e2";       // baseline / axis rule
const BLUE = "#2a78d6";       // data slot 1 — single-series charts
const BLUE_DARK = "#1c5cab";  // emphasis step of the same hue
const TRACK = "#e6eff8";      // unfilled track (same-ramp light step)
const DEEMPH = "#b9cfe3";     // de-emphasized series (context bars)
const GOOD = "#0ca30c";       // status: good (marks)
const GOOD_TEXT = "#006300";  // status: good (text)
const BAD = "#d03b3b";        // status: critical
const WARN = "#eda100";       // status: warning
const CAT_COLORS = ["#2a78d6", "#1baf7a", "#eda100", "#008300", "#4a3aa7", "#e34948", "#e87ba4", "#eb6834"];
const OTHER_COLOR = "#8aa0b4";
const HEAT = ["#cde2fb", "#9ec5f4", "#5598e7", "#2a78d6", "#1c5cab"]; // sequential blue ramp
const HEAT_ZERO = "#edf3f8";

/* ════════════════════════════════════════════════════════════════
   ICONS (inline SVG, 1.8px stroke)
   ════════════════════════════════════════════════════════════════ */
const ic = (path, extra = null) => (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    {path}{extra}
  </svg>
);
const I = {
  Wallet: ic(<><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>),
  Cart: ic(<><circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" /><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" /></>),
  Package: ic(<><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.29 7 12 12 20.71 7" /><line x1="12" y1="22" x2="12" y2="12" /></>),
  Receipt: ic(<><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" /><path d="M8 8h8" /><path d="M8 12h8" /><path d="M8 16h5" /></>),
  TrendUp: ic(<><polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" /></>),
  Pie: ic(<><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></>),
  Store: ic(<><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" /><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" /><path d="M2 7h20" /></>),
  Calendar: ic(<><path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" /></>),
  Filter: ic(<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />),
  X: ic(<><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>),
  Search: ic(<><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></>),
  ChevDown: ic(<path d="m6 9 6 6 6-6" />),
  Grid: ic(<><rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" /></>),
  Zap: ic(<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />),
  Target: ic(<><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>),
  Map: ic(<><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>),
  Layers: ic(<><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></>),
  Percent: ic(<><line x1="19" y1="5" x2="5" y2="19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>),
  Repeat: ic(<><path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path d="M21 13v1a4 4 0 0 1-4 4H3" /></>),
  Clock: ic(<><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>),
  Scale: ic(<><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" /><path d="M7 21h10" /><path d="M12 3v18" /><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" /></>),
  Coins: ic(<><circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" /></>),
  Tag: ic(<><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></>),
  Award: ic(<><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></>),
  Bar: ic(<><line x1="12" x2="12" y1="20" y2="10" /><line x1="18" x2="18" y1="20" y2="4" /><line x1="6" x2="6" y1="20" y2="16" /></>),
  Activity: ic(<polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />),
  Info: ic(<><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></>),
};

/* ════════════════════════════════════════════════════════════════
   HELPERS
   ════════════════════════════════════════════════════════════════ */
const nis = (n) => "₪" + Math.round(n || 0).toLocaleString("he-IL");
const nis1 = (n) => "₪" + (n || 0).toLocaleString("he-IL", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
const nisCompact = (n) => (Math.abs(n) >= 10000 ? "₪" + (n / 1000).toFixed(Math.abs(n) >= 100000 ? 0 : 1) + "K" : nis(n));
const fmtDate = (d) => new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short", year: "numeric" });
const fmtShort = (d) => new Date(d).toLocaleDateString("he-IL", { day: "numeric", month: "short" });
const mLbl = (m) => new Date(m + "-15T12:00:00").toLocaleDateString("he-IL", { month: "short" });
const mLblFull = (m) => new Date(m + "-15T12:00:00").toLocaleDateString("he-IL", { month: "long", year: "numeric" });
const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const DAY_SHORT = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"];
const pctOf = (cur, prev) => (prev > 0 ? ((cur - prev) / prev) * 100 : null);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const pad2 = (n) => String(n).padStart(2, "0");
/* Local (not UTC) keys — avoids day/month drift around midnight in Israel time */
const monthKey = (d) => { const x = new Date(d); return x.getFullYear() + "-" + pad2(x.getMonth() + 1); };
const dayKeyOf = (d) => { const x = new Date(d); return x.getFullYear() + "-" + pad2(x.getMonth() + 1) + "-" + pad2(x.getDate()); };
const nextMonthKey = (k) => { let [y, m] = k.split("-").map(Number); m++; if (m > 12) { m = 1; y++; } return y + "-" + pad2(m); };
const catName = (c) => (!c || c === "Other" ? "אחר" : c);

function niceTicks(max, count = 4) {
  if (!(max > 0)) return [1];
  const raw = max / count;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((st) => st >= raw) || 10 * pow;
  const ticks = [];
  for (let v = step; v < max + step * 0.999; v += step) ticks.push(Math.round(v * 100) / 100);
  return ticks;
}
const roundedTopRect = (x, y, w, h, r) => {
  const rr = Math.min(r, h, w / 2);
  return `M${x},${y + h} L${x},${y + rr} Q${x},${y} ${x + rr},${y} L${x + w - rr},${y} Q${x + w},${y} ${x + w},${y + rr} L${x + w},${y + h} Z`;
};

/* ── Chain grouping (branch names → chain) ─────────────────────── */
const CHAINS = [
  { r: /שופרסל/i, n: "שופרסל" }, { r: /רמי\s*לוי/i, n: "רמי לוי" }, { r: /אושר\s*עד/i, n: "אושר עד" },
  { r: /יש\s*(חסד|בשכונה)/i, n: "יש" }, { r: /מחסני\s*השוק/i, n: "מחסני השוק" }, { r: /שערי\s*רווחה/i, n: "שערי רווחה" },
  { r: /carrefour|קרפור/i, n: "קרפור סיטי" }, { r: /ויקטורי/i, n: "ויקטורי" }, { r: /יוחננוף/i, n: "יוחננוף" },
  { r: /טיב\s*טעם/i, n: "טיב טעם" }, { r: /יינות\s*ביתן/i, n: "יינות ביתן" }, { r: /סטופ\s*מרקט/i, n: "סטופ מרקט" },
  { r: /חצי\s*חינם/i, n: "חצי חינם" }, { r: /סופר\s*פארם/i, n: "סופר פארם" }, { r: /good\s*מרקט/i, n: "Good מרקט" },
  { r: /זול\s*ובגדול/i, n: "זול ובגדול" }, { r: /קינג\s*סטור/i, n: "קינג סטור" }, { r: /מגה/i, n: "מגה" },
];
function getChain(nm) { if (!nm) return "לא ידוע"; for (const c of CHAINS) if (c.r.test(nm)) return c.n; return nm; }

/* ── Filters ────────────────────────────────────────────────────── */
const PERIODS = [
  { key: "all", label: "הכל" },
  { key: "12m", label: "שנה" },
  { key: "6m", label: "6 חוד'" },
  { key: "3m", label: "3 חוד'" },
  { key: "1m", label: "חודש" },
  { key: "2w", label: "שבועיים" },
];
const PERIOD_DAYS = { "12m": 365, "6m": 183, "3m": 92, "1m": 31, "2w": 14 };
function periodCut(pk) {
  const days = PERIOD_DAYS[pk];
  if (!days) return null;
  const c = new Date(); c.setHours(0, 0, 0, 0); c.setDate(c.getDate() - days);
  return c;
}
const EMPTY_FILTERS = { period: "all", from: "", to: "", chains: [], cities: [], cats: [], min: "", max: "" };

const TABS = [
  { key: "overview", label: "סקירה", Ico: I.Grid },
  { key: "spending", label: "הוצאות", Ico: I.TrendUp },
  { key: "products", label: "מוצרים", Ico: I.Package },
  { key: "stores", label: "חנויות", Ico: I.Store },
];

/* ════════════════════════════════════════════════════════════════
   SMALL HOOKS
   ════════════════════════════════════════════════════════════════ */
function useCounter(target, ms = 700) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!target) { setV(0); return; }
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}
function useEntered(delay = 60) {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), delay); return () => clearTimeout(t); }, [delay]);
  return on;
}

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : init; }
    catch { return init; }
  });
  const set = useCallback((v) => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch { }
  }, [key]);
  return [val, set];
}

/* ════════════════════════════════════════════════════════════════
   GENERIC UI ATOMS
   ════════════════════════════════════════════════════════════════ */
function Card({ Ico, tint = BLUE, title, sub, badge, action, children, className = "" }) {
  return (
    <section className={`${s.card} ${className}`}>
      {title && (
        <header className={s.cardHead}>
          <div className={s.cardHeadMain}>
            {Ico && <span className={s.cardIcon} style={{ background: tint + "14", color: tint }}><Ico /></span>}
            <div className={s.cardTitles}>
              <h3 className={s.cardTitle}>{title}</h3>
              {sub && <p className={s.cardSub}>{sub}</p>}
            </div>
          </div>
          <div className={s.cardHeadSide}>
            {badge && <span className={s.cardBadge}>{badge}</span>}
            {action}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}

/* Floating tooltip. Values lead, labels follow; series keyed by a short color stroke.
   Self-positioning: measures itself, clamps into the visible window of the nearest
   [data-tipclip] scroll container, and flips below the anchor when it would clip
   at the top — so it can never be cut off (the anchor point is tip.x/tip.y). */
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

function Tip({ tip }) {
  const ref = useRef(null);
  const [pos, setPos] = useState(null);

  useIsoLayoutEffect(() => {
    if (!tip || !ref.current) { setPos(null); return; }
    const el = ref.current;
    const parent = el.offsetParent;
    if (!parent) { setPos(null); return; }
    const clip = parent.closest("[data-tipclip]") || parent;
    const pr = parent.getBoundingClientRect();
    const cr = clip.getBoundingClientRect();
    const w = el.offsetWidth, h = el.offsetHeight;

    /* anchor x — numbers are parent px, strings are percentages of the parent */
    const anchorX = typeof tip.x === "number" ? tip.x : (parseFloat(tip.x) / 100) * parent.clientWidth;

    /* clamp horizontally into the clip's VISIBLE window (in parent coords) */
    const half = w / 2 + 4;
    const minX = (cr.left - pr.left) + half;
    const maxX = (cr.right - pr.left) - half;
    const x = clamp(anchorX, minX, Math.max(maxX, minX));

    /* flip below the anchor when there's no headroom above */
    const clipTop = cr.top - pr.top;
    const clipBottom = cr.bottom - pr.top;
    let y = tip.y, below = false;
    if (tip.y - h - 4 < clipTop) { below = true; y = tip.y + 14; }
    if (below && y + h > clipBottom) y = Math.max(clipBottom - h - 2, clipTop + 2);

    setPos({ x, y, below });
  }, [tip]);

  if (!tip) return null;
  return (
    <div
      ref={ref}
      className={s.tip}
      style={{
        left: pos ? pos.x : tip.x,
        top: pos ? pos.y : tip.y,
        transform: pos && pos.below ? "translate(-50%, 0)" : "translate(-50%, -100%)",
        visibility: pos ? "visible" : "hidden",
      }}
    >
      {tip.title && <p className={s.tipTitle}>{tip.title}</p>}
      {(tip.rows || []).map((r, i) => (
        <div key={i} className={s.tipRow}>
          {r.c && <span className={s.tipKey} style={{ background: r.c }} />}
          <span className={s.tipVal}>{r.v}</span>
          {r.l && <span className={s.tipLbl}>{r.l}</span>}
        </div>
      ))}
    </div>
  );
}

function EmptyNote({ text }) {
  return <p className={s.emptyNote}><I.Info style={{ width: 15, height: 15 }} /> {text}</p>;
}

/* Delta chip — spending semantics: up = red (bad), down = green (good); neutral = informational */
function Delta({ value, invert = false, neutral = false, label }) {
  if (value === null || value === undefined || !isFinite(value)) return null;
  const up = value > 0;
  const good = invert ? up : !up;
  if (Math.round(Math.abs(value)) === 0) return <span className={`${s.delta} ${s.deltaFlat}`}>ללא שינוי</span>;
  return (
    <span className={`${s.delta} ${neutral ? s.deltaFlat : good ? s.deltaGood : s.deltaBad}`}>
      {up ? "▲" : "▼"} {Math.abs(Math.round(value))}%{label ? ` ${label}` : ""}
    </span>
  );
}

/* ════════════════════════════════════════════════════════════════
   CHARTS — hand-rolled SVG/DOM, per the mark specs:
   thin marks, 4px rounded data-ends, hairline solid grid,
   2px surface gaps, hover tooltips, selective direct labels.
   ════════════════════════════════════════════════════════════════ */

/* KPI sparkline — compact, de-emphasized line with accent end-dot */
function Spark({ data, color = BLUE }) {
  if (!data || data.length < 2) return null;
  const w = 104, h = 30;
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const rng = max - min || 1;
  const pts = data.map((v, i) => [3 + (i / (data.length - 1)) * (w - 10), h - 4 - ((v - min) / rng) * (h - 10)]);
  const line = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg width={w} height={h} className={s.spark} aria-hidden="true">
      <path d={`${line} L${last[0]},${h - 1} L3,${h - 1} Z`} fill={color} className={s.areaIn} />
      <path d={line} fill="none" stroke={color} strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className={s.lineDraw} />
      <circle cx={last[0]} cy={last[1]} r="3" fill={color} stroke="#fff" strokeWidth="1.5" className={s.lblIn} />
    </svg>
  );
}

/* Catmull-Rom → cubic bezier: a jagged polyline reads as noise; a smooth curve reads as a trend */
function smoothPath(pts) {
  if (pts.length < 3) return pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ");
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d;
}

/* HERO TREND — full-bleed gradient area with month labels, a labeled peak,
   and touch-scrub: drag across it to read every month. */
function HeroTrend({ months }) {
  const wrapRef = useRef(null);
  const [w, setW] = useState(0);
  const [ix, setIx] = useState(-1);
  useEffect(() => {
    const measure = () => { if (wrapRef.current) setW(wrapRef.current.clientWidth); };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  if (!months || months.length < 2) return null;

  const h = 84, pT = 14, pB = 18;
  const plotH = h - pT - pB;
  const n = months.length;
  const totals = months.map((m) => m.total);
  const max = Math.max(...totals, 1), min = Math.min(...totals, 0);
  const rng = max - min || 1;
  const X = (i) => 4 + (i / (n - 1)) * (w - 10);
  const Y = (v) => pT + plotH - ((v - min) / rng) * plotH;
  const pts = totals.map((v, i) => [X(i), Y(v)]);
  const line = smoothPath(pts);
  const area = `${line} L${X(n - 1)},${h} L${X(0)},${h} Z`;
  const maxIdx = totals.indexOf(max);
  const last = pts[n - 1];

  /* month tick labels: first · third · two-thirds · last (deduped) */
  const tickIdx = [...new Set([0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])];
  const active = ix >= 0 ? months[ix] : null;

  return (
    <div ref={wrapRef} className={s.heroTrend} data-tipclip="1">
      {w > 8 && (
        <svg width={w} height={h} dir="ltr" aria-label="מגמת הוצאות חודשית"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setIx(clamp(Math.round(((e.clientX - rect.left) - 4) / ((w - 10) / (n - 1))), 0, n - 1));
          }}
          onPointerLeave={() => setIx(-1)}>
          <defs>
            <linearGradient id="heroTrendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BLUE} stopOpacity="0.26" />
              <stop offset="100%" stopColor={BLUE} stopOpacity="0.02" />
            </linearGradient>
            <linearGradient id="heroTrendLine" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#2563eb" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#heroTrendFill)" className={s.areaInFull} />
          <path d={line} fill="none" stroke="url(#heroTrendLine)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className={s.lineDraw} />

          {/* labeled peak — the one number that explains the shape */}
          {maxIdx !== n - 1 && (
            <g className={s.lblIn}>
              <circle cx={pts[maxIdx][0]} cy={pts[maxIdx][1]} r="3" fill={BLUE_DARK} stroke="#fff" strokeWidth="1.5" />
              <text x={clamp(pts[maxIdx][0], 26, w - 26)} y={Math.max(pts[maxIdx][1] - 7, 9)} textAnchor="middle" fontSize="10" fontWeight="700" fill={INK} className={s.tnum}>
                {nisCompact(max)}
              </text>
            </g>
          )}

          {/* current month end-dot */}
          <circle cx={last[0]} cy={last[1]} r="4" fill={BLUE_DARK} stroke="#fff" strokeWidth="2" className={s.lblIn} />

          {/* month axis */}
          {tickIdx.map((i) => (
            <text key={i} x={clamp(X(i), 14, w - 14)} y={h - 5} textAnchor="middle" fontSize="9.5" fontWeight={i === n - 1 ? 700 : 500}
              fill={i === n - 1 ? INK : MUTED} className={s.lblIn}>
              {mLbl(months[i].month)}
            </text>
          ))}

          {/* scrub layer */}
          {ix >= 0 && (
            <g pointerEvents="none">
              <line x1={X(ix)} x2={X(ix)} y1={pT - 6} y2={h - pB + 4} stroke={BASE} strokeWidth="1" />
              <circle cx={X(ix)} cy={Y(months[ix].total)} r="4.5" fill={BLUE_DARK} stroke="#fff" strokeWidth="2" />
            </g>
          )}
        </svg>
      )}
      {active && (
        <Tip tip={{
          x: X(ix), y: Math.max(Y(active.total) - 10, 4), title: mLblFull(active.month),
          rows: [
            { v: nis(active.total), l: "סה\"כ", c: BLUE },
            { v: String(active.count), l: "רכישות" },
          ],
        }} />
      )}
    </div>
  );
}

/* Pinned y-axis column — stays visible while the plot scrolls under it */
function AxisCol({ ticks, y, height }) {
  return (
    <div className={s.axisCol} style={{ height }} aria-hidden="true">
      {ticks.map((t) => (
        <span key={t} className={s.tnum} style={{ top: y(t) - 6 }}>{nisCompact(t)}</span>
      ))}
    </div>
  );
}

/* Monthly columns — single hue, average rule, y-ticks, tooltip, latest emphasized */
function ColumnChart({ data }) {
  const wrapRef = useRef(null);
  const [tip, setTip] = useState(null);
  const [hover, setHover] = useState(-1);
  useEffect(() => { if (wrapRef.current) wrapRef.current.scrollLeft = wrapRef.current.scrollWidth; }, [data.length]);
  if (!data.length) return <EmptyNote text="אין נתונים בטווח שנבחר" />;

  const bw = 26, gap = 14, pT = 30, pB = 26, plotH = 182;
  const ticks = niceTicks(Math.max(...data.map((d) => d.total), 1));
  const scaleMax = ticks[ticks.length - 1];
  const innerW = data.length * (bw + gap) + gap;
  const svgH = plotH + pT + pB;
  const avg = data.reduce((a, d) => a + d.total, 0) / data.length;
  const y = (v) => pT + plotH - (v / scaleMax) * plotH;
  const maxIdx = data.reduce((mi, d, i) => (d.total > data[mi].total ? i : mi), 0);
  const showYear = data.length > 13;

  return (
    <div className={s.chartRow} dir="ltr">
      <div className={s.chartScroll} ref={wrapRef} data-tipclip="1">
        <div className={s.chartInner} style={{ width: innerW }}>
          <svg width={innerW} height={svgH} role="img" aria-label="הוצאות חודשיות">
            {ticks.map((t) => (
              <line key={t} x1={0} x2={innerW} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            ))}
            <line x1={0} x2={innerW} y1={y(0)} y2={y(0)} stroke={BASE} strokeWidth="1" />
            {data.length > 1 && (
              <g>
                <line x1={0} x2={innerW} y1={y(avg)} y2={y(avg)} stroke={BLUE} strokeOpacity="0.35" strokeWidth="1" />
                <text x={innerW - 4} y={y(avg) - 4} textAnchor="end" fontSize="9" fontWeight="600" fill={BLUE_DARK}>ממוצע {nisCompact(avg)}</text>
              </g>
            )}
            {data.map((d, i) => {
              const x = gap + i * (bw + gap);
              const h = d.total > 0 ? Math.max((d.total / scaleMax) * plotH, 2) : 0;
              const yy = pT + plotH - h;
              const isLast = i === data.length - 1;
              const active = hover === i;
              const labeled = (isLast || i === maxIdx) && d.total > 0;
              return (
                <g key={d.month}>
                  {h > 0 && <path d={roundedTopRect(x, yy, bw, h, 4)} fill={active || isLast ? BLUE_DARK : BLUE} opacity={hover >= 0 && !active ? 0.45 : 0.95} className={s.barGrow} style={{ transition: "opacity .15s", animationDelay: `${Math.min(i * 40, 700)}ms` }} />}
                  {labeled && <text x={x + bw / 2} y={yy - 7} textAnchor="middle" fontSize="11" fontWeight="700" fill={INK} className={`${s.tnum} ${s.lblIn}`}>{nisCompact(d.total)}</text>}
                  <text x={x + bw / 2} y={svgH - 8} textAnchor="middle" fontSize="10.5" fill={active ? INK : MUTED} fontWeight={active ? 700 : 500}>
                    {showYear && (i === 0 || d.month.slice(0, 4) !== data[i - 1].month.slice(0, 4)) ? mLbl(d.month) + " " + d.month.slice(2, 4) : mLbl(d.month)}
                  </text>
                  <rect x={x - gap / 2} y={pT} width={bw + gap} height={plotH} fill="transparent" style={{ cursor: "pointer" }}
                    onMouseEnter={() => {
                      setHover(i);
                      const prev = i > 0 ? data[i - 1].total : 0;
                      const rows = [
                        { v: nis(d.total), l: "סה\"כ", c: BLUE },
                        { v: String(d.count), l: "רכישות" },
                      ];
                      const ch = pctOf(d.total, prev);
                      if (ch !== null && i > 0) rows.push({ v: (ch > 0 ? "▲" : "▼") + " " + Math.abs(Math.round(ch)) + "%", l: "מול חודש קודם" });
                      setTip({ x: x + bw / 2, y: Math.max(yy - 10, 12), title: mLblFull(d.month), rows });
                    }}
                    onMouseLeave={() => { setHover(-1); setTip(null); }}
                  />
                </g>
              );
            })}
          </svg>
          <Tip tip={tip} />
        </div>
      </div>
      <AxisCol ticks={ticks} y={y} height={svgH} />
    </div>
  );
}

/* Donut — ≤6 slices incl. "אחר", 2px surface gaps, center readout, hover sync with legend */
function Donut({ items, total, active, onActive }) {
  const on = useEntered();
  const sz = 188, sw = 22, r = (sz - sw) / 2 - 3, C = 2 * Math.PI * r, cx = sz / 2;
  const gapLen = items.length > 1 ? 2.5 : 0;
  let acc = 0;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} role="img" aria-label="התפלגות לפי קטגוריה">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={TRACK} strokeWidth={sw - 6} />
      {items.map((d, i) => {
        const frac = total > 0 ? d.value / total : 0;
        const seg = Math.max(frac * C - gapLen, 0);
        if (seg <= 0) return null;
        const rot = ((acc + gapLen / 2) / C) * 360 - 90;
        acc += frac * C;
        const isActive = active === i;
        return (
          <circle key={d.name} cx={cx} cy={cx} r={r} fill="none"
            stroke={d.color} strokeWidth={isActive ? sw + 4 : sw}
            strokeDasharray={on ? `${seg} ${C - seg}` : `0 ${C}`}
            transform={`rotate(${rot} ${cx} ${cx})`}
            opacity={active >= 0 && !isActive ? 0.3 : 1}
            style={{ transition: `stroke-dasharray .8s cubic-bezier(.22,1,.36,1) ${i * 90}ms, opacity .15s ease, stroke-width .15s ease`, cursor: "pointer" }}
            onMouseEnter={() => onActive(i)} onMouseLeave={() => onActive(-1)}
          />
        );
      })}
    </svg>
  );
}

/* Stacked monthly columns by category — 2px surface gaps between segments */
function StackedColumns({ data, cats }) {
  const wrapRef = useRef(null);
  const [tip, setTip] = useState(null);
  const [hover, setHover] = useState(-1);
  useEffect(() => { if (wrapRef.current) wrapRef.current.scrollLeft = wrapRef.current.scrollWidth; }, [data.length]);
  if (data.length < 2) return <EmptyNote text="צריך לפחות חודשיים של נתונים" />;

  const bw = 28, gap = 14, pT = 26, pB = 26, plotH = 186;
  const totals = data.map((d) => cats.reduce((a, c) => a + (d.values[c.name] || 0), 0));
  const ticks = niceTicks(Math.max(...totals, 1));
  const scaleMax = ticks[ticks.length - 1];
  const innerW = data.length * (bw + gap) + gap;
  const svgH = plotH + pT + pB;
  const y0 = pT + plotH;
  const yOf = (v) => y0 - (v / scaleMax) * plotH;

  return (
    <div className={s.chartRow} dir="ltr">
      <div className={s.chartScroll} ref={wrapRef} data-tipclip="1">
        <div className={s.chartInner} style={{ width: innerW }}>
          <svg width={innerW} height={svgH} role="img" aria-label="קטגוריות לאורך זמן">
            {ticks.map((t) => (
              <line key={t} x1={0} x2={innerW} y1={yOf(t)} y2={yOf(t)} stroke={GRID} strokeWidth="1" />
            ))}
            <line x1={0} x2={innerW} y1={y0} y2={y0} stroke={BASE} strokeWidth="1" />
            {data.map((d, i) => {
            const x = gap + i * (bw + gap);
            let cursor = y0;
            const segs = [];
            cats.forEach((c) => {
              const v = d.values[c.name] || 0;
              if (v <= 0) return;
              const h = (v / scaleMax) * plotH;
              segs.push({ c, v, top: cursor - h, h });
              cursor -= h;
            });
              const active = hover === i;
              return (
                <g key={d.month} opacity={hover >= 0 && !active ? 0.45 : 1} style={{ transition: "opacity .15s" }}>
                  <g className={s.barGrow} style={{ animationDelay: `${Math.min(i * 45, 700)}ms` }}>
                    {segs.map((sg, j) => {
                      const isTop = j === segs.length - 1;
                      const gh = Math.max(sg.h - 2, 0.75); /* 2px surface gap between segments */
                      return isTop
                        ? <path key={sg.c.name} d={roundedTopRect(x, sg.top, bw, gh, 4)} fill={sg.c.color} />
                        : <rect key={sg.c.name} x={x} y={sg.top} width={bw} height={gh} fill={sg.c.color} />;
                    })}
                  </g>
                  <text x={x + bw / 2} y={svgH - 8} textAnchor="middle" fontSize="10.5" fill={active ? INK : MUTED} fontWeight={active ? 700 : 500}>{mLbl(d.month)}</text>
                  <rect x={x - gap / 2} y={pT} width={bw + gap} height={plotH} fill="transparent" style={{ cursor: "pointer" }}
                    onMouseEnter={() => {
                      setHover(i);
                      const rows = segs.slice().reverse().map((sg) => ({ v: nis(sg.v), l: sg.c.name, c: sg.c.color }));
                      rows.push({ v: nis(totals[i]), l: "סה\"כ" });
                      setTip({ x: x + bw / 2, y: Math.max(yOf(totals[i]) - 10, 12), title: mLblFull(d.month), rows });
                    }}
                    onMouseLeave={() => { setHover(-1); setTip(null); }}
                  />
                </g>
              );
            })}
          </svg>
          <Tip tip={tip} />
        </div>
      </div>
      <AxisCol ticks={ticks} y={yOf} height={svgH} />
    </div>
  );
}

/* Purchases timeline — 2px line, 10% wash, crosshair + snap tooltip */
function AreaTimeline({ data }) {
  const wrapRef = useRef(null);
  const [ix, setIx] = useState(-1);
  useEffect(() => { if (wrapRef.current) wrapRef.current.scrollLeft = wrapRef.current.scrollWidth; }, [data.length]);
  if (data.length < 2) return <EmptyNote text="צריך לפחות שתי רכישות בטווח" />;

  const step = 16, pL = 10, pT = 26, pB = 22, plotH = 138;
  const innerW = pL + (data.length - 1) * step + 10;
  const svgH = plotH + pT + pB;
  const ticks = niceTicks(Math.max(...data.map((d) => d.amount), 1), 3);
  const scaleMax = ticks[ticks.length - 1];
  const y = (v) => pT + plotH - (v / scaleMax) * plotH;
  const X = (i) => pL + i * step;
  const line = data.map((d, i) => (i ? "L" : "M") + X(i) + "," + y(d.amount).toFixed(1)).join(" ");
  const area = `${line} L${X(data.length - 1)},${pT + plotH} L${X(0)},${pT + plotH} Z`;
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));
  const active = ix >= 0 ? data[ix] : null;

  return (
    <div className={s.chartRow} dir="ltr">
      <div className={s.chartScroll} ref={wrapRef} data-tipclip="1">
        <div className={s.chartInner} style={{ width: innerW }}>
          <svg width={innerW} height={svgH} role="img" aria-label="ציר זמן רכישות"
            onMouseLeave={() => setIx(-1)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const px = e.clientX - rect.left;
              setIx(clamp(Math.round((px - pL) / step), 0, data.length - 1));
            }}>
            {ticks.map((t) => (
              <line key={t} x1={0} x2={innerW} y1={y(t)} y2={y(t)} stroke={GRID} strokeWidth="1" />
            ))}
            <line x1={0} x2={innerW} y1={pT + plotH} y2={pT + plotH} stroke={BASE} strokeWidth="1" />
            <path d={area} fill={BLUE} className={s.areaIn} />
            <path d={line} fill="none" stroke={BLUE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="1" className={s.lineDraw} />
            {data.map((d, i) => (
              i % labelEvery === 0 && (
                <text key={i} x={X(i)} y={svgH - 6} textAnchor="middle" fontSize="9.5" fill={MUTED}>{fmtShort(d.date)}</text>
              )
            ))}
            {ix >= 0 && (
              <g pointerEvents="none">
                <line x1={X(ix)} x2={X(ix)} y1={pT} y2={pT + plotH} stroke={BASE} strokeWidth="1" />
                <circle cx={X(ix)} cy={y(active.amount)} r="4.5" fill={BLUE_DARK} stroke="#fff" strokeWidth="2" />
              </g>
            )}
          </svg>
          {ix >= 0 && (
            <Tip tip={{
              x: X(ix), y: Math.max(y(active.amount) - 12, 12), title: fmtDate(active.date),
              rows: [
                { v: nis(active.amount), l: active.store, c: BLUE },
                { v: String(active.items), l: "פריטים" },
              ],
            }} />
          )}
        </div>
      </div>
      <AxisCol ticks={ticks} y={y} height={svgH} />
    </div>
  );
}

/* Generic mini columns (weekday pattern, price histogram) — DOM-based, responsive, RTL-native */
function MiniColumns({ items, height = 128, tipFor, ariaLabel }) {
  const [tip, setTip] = useState(null);
  const on = useEntered();
  const max = Math.max(...items.map((it) => it.value), 1);
  const maxIdx = items.reduce((mi, it, i) => (it.value > items[mi].value ? i : mi), 0);
  return (
    <div className={s.mcWrap} role="img" aria-label={ariaLabel}>
      <div className={s.mcGrid} style={{ height }}>
        {items.map((it, i) => {
          const hp = (it.value / max) * 100;
          const isMax = i === maxIdx && it.value > 0;
          return (
            <div key={i} className={s.mcCol}
              onMouseEnter={() => setTip({ x: `${((i + 0.5) / items.length) * 100}%`, y: Math.max(height * (1 - hp / 100) - 8, 8), ...tipFor(it, i) })}
              onMouseLeave={() => setTip(null)}>
              {isMax && <span className={`${s.mcVal} ${s.lblIn}`} style={{ bottom: `calc(${hp}% + 5px)` }}>{it.topLabel !== undefined ? it.topLabel : nisCompact(it.value)}</span>}
              <div className={s.mcBar} style={{ height: on ? `${Math.max(hp, it.value > 0 ? 2 : 0)}%` : "0%", background: isMax ? BLUE_DARK : BLUE, transitionDelay: `${i * 55}ms` }} />
            </div>
          );
        })}
      </div>
      <div className={s.mcLabels}>
        {items.map((it, i) => <span key={i} className={s.mcLbl}>{it.label}</span>)}
      </div>
      <Tip tip={tip} />
    </div>
  );
}

/* Daily heatmap — sequential single-hue ramp, 13 weeks */
function Heatmap({ history, weeks = 13 }) {
  const [tip, setTip] = useState(null);
  const byDay = useMemo(() => {
    const m = {};
    history.forEach((h) => {
      const k = dayKeyOf(h.date);
      if (!m[k]) m[k] = { total: 0, count: 0 };
      m[k].total += h.totalPrice || 0;
      m[k].count += 1;
    });
    return m;
  }, [history]);

  const today = new Date(); today.setHours(12, 0, 0, 0);
  const start = new Date(today);
  start.setDate(start.getDate() - (weeks * 7 - 1) - today.getDay());
  const cols = [];
  for (let w = 0; w <= weeks; w++) {
    const col = [];
    for (let d = 0; d < 7; d++) {
      const dt = new Date(start);
      dt.setDate(start.getDate() + w * 7 + d);
      if (dt > today) { col.push(null); continue; }
      const k = dayKeyOf(dt);
      col.push({ key: k, date: dt, ...(byDay[k] || { total: 0, count: 0 }) });
    }
    cols.push(col);
  }
  const maxVal = Math.max(...cols.flat().map((c) => (c ? c.total : 0)), 1);
  const colorOf = (v) => (v <= 0 ? HEAT_ZERO : HEAT[clamp(Math.ceil((v / maxVal) * HEAT.length) - 1, 0, HEAT.length - 1)]);

  return (
    <div className={s.heatOuter}>
      <div className={s.heatScroll} dir="ltr" data-tipclip="1">
        <div className={s.heatBody}>
          <div className={s.heatDayCol} aria-hidden="true">
            {DAY_SHORT.map((d) => <span key={d} className={s.heatDayLbl}>{d}</span>)}
          </div>
          <div className={s.heatGridWrap}>
            <div className={s.heatMonths}>
              {cols.map((col, w) => {
                const first = col.find(Boolean);
                const prevCol = w > 0 ? cols[w - 1].find(Boolean) : null;
                const show = first && (!prevCol || first.date.getMonth() !== prevCol.date.getMonth());
                return <span key={w} className={s.heatMonthLbl}>{show ? first.date.toLocaleDateString("he-IL", { month: "short" }) : ""}</span>;
              })}
            </div>
            <div className={s.heatGrid} role="img" aria-label="הוצאות יומיות — 13 שבועות אחרונים">
              {cols.map((col, w) => (
                <div key={w} className={s.heatWeek}>
                  {col.map((c, d) => (
                    <div key={d}
                      className={`${s.heatCell} ${s.heatPop}`}
                      style={{ background: c ? colorOf(c.total) : "transparent", animationDelay: `${Math.min((w * 7 + d) * 4, 900)}ms` }}
                      onMouseEnter={c ? (e) => {
                        const cell = e.currentTarget;
                        const grid = cell.closest(`.${s.heatGrid}`);
                        const cr = cell.getBoundingClientRect(), gr = grid.getBoundingClientRect();
                        setTip({
                          x: cr.left - gr.left + cr.width / 2, y: Math.max(cr.top - gr.top - 8, 4),
                          title: fmtDate(c.date),
                          rows: c.count
                            ? [{ v: nis(c.total), l: "סה\"כ", c: BLUE }, { v: String(c.count), l: "רכישות" }]
                            : [{ v: "ללא רכישות" }],
                        });
                      } : undefined}
                      onMouseLeave={c ? () => setTip(null) : undefined}
                    />
                  ))}
                </div>
              ))}
              <Tip tip={tip} />
            </div>
          </div>
        </div>
      </div>
      <div className={s.heatLegend}>
        <span>פחות</span>
        <span className={s.heatLegendCell} style={{ background: HEAT_ZERO }} />
        {HEAT.map((c) => <span key={c} className={s.heatLegendCell} style={{ background: c }} />)}
        <span>יותר</span>
      </div>
    </div>
  );
}

/* Horizontal bar list — label / track / value rows */
function HBarList({ items, fmtVal = nis, showRank = false }) {
  const on = useEntered();
  const max = Math.max(...items.map((it) => it.value), 1);
  return (
    <div className={s.hbList}>
      {items.map((it, i) => (
        <div key={it.label} className={s.hbRow} style={{ animationDelay: `${i * 0.04}s` }}>
          {showRank && <span className={`${s.hbRank} ${i === 0 ? s.hbRankTop : ""}`}>{i + 1}</span>}
          <div className={s.hbMain}>
            <div className={s.hbTop}>
              <span className={s.hbLabel}>{it.label}{it.tag && <span className={s.hbTag}>{it.tag}</span>}</span>
              <span className={`${s.hbVal} ${s.tnum}`}>{fmtVal(it.value)}</span>
            </div>
            <div className={s.hbTrack}>
              <div className={s.hbFill} style={{ width: on ? `${(it.value / max) * 100}%` : "0%", background: it.color || BLUE, transitionDelay: `${Math.min(i * 70, 600)}ms` }} />
            </div>
            {it.sub && <span className={s.hbSub}>{it.sub}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

/* Budget meter — same-ramp track; fill shifts blue→amber→red; projection tick */
function Meter({ value, max, projected }) {
  const on = useEntered();
  const ratio = max > 0 ? value / max : 0;
  const color = ratio < 0.75 ? BLUE : ratio <= 1 ? WARN : BAD;
  return (
    <div className={s.meterTrack}>
      <div className={s.meterFill} style={{ width: on ? `${clamp(ratio, 0, 1) * 100}%` : "0%", background: color }} />
      {projected != null && max > 0 && projected > value && (
        <div className={s.meterMark} style={{ insetInlineStart: `${clamp(projected / max, 0, 1) * 100}%` }} />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════ */
export default function AdvancedStatsDashboard() {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  /* ── State ─────────────────────────────────────────────────── */
  const [rawHistory, setRawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [tab, setTab] = useState("overview");
  const [flt, setFlt] = useState(EMPTY_FILTERS);
  const [draft, setDraft] = useState(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [donutHover, setDonutHover] = useState(-1);
  const [topProdMode, setTopProdMode] = useState("spent");
  const [prodSearch, setProdSearch] = useState("");
  const [prodSort, setProdSort] = useState("spent");
  const [prodDir, setProdDir] = useState(-1);
  const [prodPage, setProdPage] = useState(0);
  const [storeSort, setStoreSort] = useState("total");
  const [expandedRecent, setExpandedRecent] = useState(null);
  const [budget, setBudget] = useLocalStorage("statsBudget", 0);
  const [budgetEditing, setBudgetEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const PRODS_PER_PAGE = 12;

  /* ── Fetch ─────────────────────────────────────────────────── */
  const fetchHistory = useCallback(() => {
    setLoading(true); setError(false);
    axios.get(`${DOMAIN}/api/v1/history/`)
      .then((r) => setRawHistory(r.data.data.history || []))
      .catch((e) => { console.error("Fetch error:", e); setError(true); })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  /* ── Stable metadata (from the FULL dataset — colors never repaint on filter) ── */
  const meta = useMemo(() => {
    const chains = new Set(), cities = new Set(), catTotals = {};
    rawHistory.forEach((h) => {
      chains.add(getChain(h.supermarketName));
      if (h.supermarketCity) cities.add(h.supermarketCity);
      (h.products || []).forEach((p) => {
        const c = catName(p.category);
        catTotals[c] = (catTotals[c] || 0) + (p.totalPrice || 0);
      });
    });
    const cats = Object.entries(catTotals).sort((a, b) => b[1] - a[1]).map(([n]) => n);
    const catColor = {};
    cats.forEach((c, i) => { catColor[c] = i < CAT_COLORS.length ? CAT_COLORS[i] : OTHER_COLOR; });
    catColor["אחר"] = catColor["אחר"] || OTHER_COLOR;
    return {
      chains: [...chains].sort((a, b) => a.localeCompare(b, "he")),
      cities: [...cities].sort((a, b) => a.localeCompare(b, "he")),
      cats, catColor,
    };
  }, [rawHistory]);
  const catColorOf = useCallback((name) => (name === "אחר" ? OTHER_COLOR : meta.catColor[name] || OTHER_COLOR), [meta]);

  /* ── Filtering pipeline (shared with the live count in the sheet) ── */
  const applyFilters = useCallback((data, f) => {
    let d = data;
    const cut = f.from ? new Date(f.from) : periodCut(f.period);
    if (cut) d = d.filter((h) => new Date(h.date) >= cut);
    if (f.to) { const end = new Date(f.to + "T23:59:59"); d = d.filter((h) => new Date(h.date) <= end); }
    if (f.chains.length) d = d.filter((h) => f.chains.includes(getChain(h.supermarketName)));
    if (f.cities.length) d = d.filter((h) => f.cities.includes(h.supermarketCity));
    const min = parseFloat(f.min), max = parseFloat(f.max);
    if (!isNaN(min) && min > 0) d = d.filter((h) => (h.totalPrice || 0) >= min);
    if (!isNaN(max) && max > 0) d = d.filter((h) => (h.totalPrice || 0) <= max);
    if (f.cats.length) {
      d = d.map((h) => {
        const prods = (h.products || []).filter((p) => f.cats.includes(catName(p.category)));
        if (!prods.length) return null;
        return { ...h, products: prods, totalPrice: prods.reduce((a, p) => a + (p.totalPrice || 0), 0) };
      }).filter(Boolean);
    }
    return d;
  }, []);

  const history = useMemo(() => applyFilters(rawHistory, flt), [rawHistory, flt, applyFilters]);

  /* ── Previous equivalent window (for the KPI deltas) ───────── */
  const prev = useMemo(() => {
    const cut = flt.from ? new Date(flt.from) : periodCut(flt.period);
    if (!cut) return null;
    const end = flt.to ? new Date(flt.to + "T23:59:59") : new Date();
    const span = end - cut;
    if (span <= 0) return null;
    const prevCut = new Date(cut.getTime() - span);
    let d = applyFilters(rawHistory, { ...flt, period: "all", from: "", to: "" });
    d = d.filter((h) => { const t = new Date(h.date); return t >= prevCut && t < cut; });
    if (!d.length) return null;
    const spent = d.reduce((a, h) => a + (h.totalPrice || 0), 0);
    return { spent, count: d.length, avg: spent / d.length };
  }, [rawHistory, flt, applyFilters]);

  /* ── Filter actions ────────────────────────────────────────── */
  const filterCount =
    (flt.from || flt.to ? 1 : 0) + flt.chains.length + flt.cities.length + flt.cats.length + (flt.min || flt.max ? 1 : 0);
  const hasFilters = filterCount > 0 || flt.period !== "all";

  const openSheet = useCallback(() => { setDraft(flt); setSheetOpen(true); }, [flt]);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  const applySheet = useCallback(() => {
    const f = { ...draft };
    if (f.from || f.to) f.period = "custom";
    else if (f.period === "custom") f.period = "all";
    setFlt(f); setSheetOpen(false); setProdPage(0);
  }, [draft]);
  const resetAll = useCallback(() => { setFlt(EMPTY_FILTERS); setDraft(EMPTY_FILTERS); setProdPage(0); }, []);
  const setPeriod = useCallback((p) => { setFlt((f) => ({ ...f, period: p, from: "", to: "" })); setProdPage(0); }, []);
  const removeFrom = useCallback((key, val) => {
    setFlt((f) => ({ ...f, [key]: f[key].filter((x) => x !== val) }));
  }, []);
  const toggleDraft = useCallback((key, val) => {
    setDraft((f) => ({ ...f, [key]: f[key].includes(val) ? f[key].filter((x) => x !== val) : [...f[key], val] }));
  }, []);
  const draftCount = useMemo(
    () => (sheetOpen ? applyFilters(rawHistory, { ...draft, period: draft.from || draft.to ? "custom" : draft.period }).length : 0),
    [sheetOpen, rawHistory, draft, applyFilters]
  );

  /* ── Aggregations ──────────────────────────────────────────── */
  const stats = useMemo(() => {
    if (!history.length) return null;

    const totalSpent = history.reduce((a, h) => a + (h.totalPrice || 0), 0);
    let totalItems = 0;
    const uniq = new Set();
    history.forEach((h) => (h.products || []).forEach((p) => {
      totalItems += p.amount || 0;
      uniq.add(p.generalName || p.name);
    }));
    const purchases = history.length;
    const avg = totalSpent / purchases;

    /* Monthly series — zero-filled between first and last month (honest time axis) */
    const mm = {}, mc = {}, mi = {};
    history.forEach((h) => {
      const k = monthKey(h.date);
      mm[k] = (mm[k] || 0) + (h.totalPrice || 0);
      mc[k] = (mc[k] || 0) + 1;
      mi[k] = (mi[k] || 0) + (h.products || []).reduce((a, p) => a + (p.amount || 0), 0);
    });
    const mKeys = Object.keys(mm).sort();
    const monthly = [];
    if (mKeys.length) {
      let k = mKeys[0];
      const last = mKeys[mKeys.length - 1];
      let guard = 0;
      while (k <= last && guard++ < 240) {
        monthly.push({ month: k, total: mm[k] || 0, count: mc[k] || 0, items: mi[k] || 0 });
        k = nextMonthKey(k);
      }
    }
    const monthlyTotals = monthly.map((m) => m.total);
    const monthlyCounts = monthly.map((m) => m.count);
    const monthlyAvg = monthly.map((m) => (m.count ? m.total / m.count : 0));
    let trend = null;
    if (monthly.length >= 2) trend = pctOf(monthly[monthly.length - 1].total, monthly[monthly.length - 2].total);

    /* Categories (filtered view) — colors come from the stable global map */
    const cm = {};
    history.forEach((h) => (h.products || []).forEach((p) => {
      const c = catName(p.category);
      cm[c] = (cm[c] || 0) + (p.totalPrice || 0);
    }));
    const catAll = Object.entries(cm).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const catTotal = catAll.reduce((a, c) => a + c.value, 0);
    const TOP_N = 5;
    const catTop = catAll.slice(0, TOP_N).map((c) => ({ ...c, color: catColorOf(c.name) }));
    const restVal = catAll.slice(TOP_N).reduce((a, c) => a + c.value, 0);
    const donutItems = restVal > 0
      ? [...catTop.filter((c) => c.name !== "אחר"), { name: "אחר", value: restVal + (catTop.find((c) => c.name === "אחר")?.value || 0), color: OTHER_COLOR }]
      : catTop;

    /* Categories over time (stacked) — same entities as the donut */
    const stackCats = donutItems.map((c) => ({ name: c.name, color: c.color }));
    const stackNames = stackCats.map((c) => c.name).filter((n) => n !== "אחר");
    const catMonthly = {};
    history.forEach((h) => {
      const k = monthKey(h.date);
      if (!catMonthly[k]) catMonthly[k] = {};
      (h.products || []).forEach((p) => {
        const c = catName(p.category);
        const slot = stackNames.includes(c) ? c : "אחר";
        catMonthly[k][slot] = (catMonthly[k][slot] || 0) + (p.totalPrice || 0);
      });
    });
    const catOverTime = monthly.map((m) => ({ month: m.month, values: catMonthly[m.month] || {} }));

    /* Products */
    const pmap = {};
    history.forEach((h) => (h.products || []).forEach((p) => {
      const key = p.generalName || p.name;
      if (!pmap[key]) pmap[key] = { name: key, heName: p.name, amount: 0, spent: 0, freq: 0, cat: catName(p.category), unitPts: [], saved: 0 };
      const e = pmap[key];
      e.amount += p.amount || 0;
      e.spent += p.totalPrice || 0;
      e.freq += 1;
      if ((p.amount || 0) > 0 && (p.totalPrice || 0) > 0) e.unitPts.push({ t: new Date(h.date).getTime(), month: monthKey(h.date), unit: (p.totalPrice || 0) / p.amount });
      if (p.hasDiscount && (p.price || 0) > 0 && (p.amount || 0) > 0) e.saved += Math.max(p.price * p.amount - (p.totalPrice || 0), 0);
    }));
    const prods = Object.values(pmap).map((p) => ({ ...p, avgUnit: p.amount > 0 ? p.spent / p.amount : 0 }));
    const topBySpend = [...prods].sort((a, b) => b.spent - a.spent).slice(0, 7);
    const topByAmt = [...prods].sort((a, b) => b.amount - a.amount).slice(0, 7);
    const topByFreq = [...prods].sort((a, b) => b.freq - a.freq).slice(0, 7);

    /* Price index — unit price drift for repeat products */
    const movers = [];
    prods.forEach((p) => {
      if (p.freq < 3 || p.unitPts.length < 3) return;
      const pts = [...p.unitPts].sort((a, b) => a.t - b.t);
      if (pts[pts.length - 1].t - pts[0].t < 40 * 24 * 3600 * 1000) return;
      const byMonth = {};
      pts.forEach((u) => { (byMonth[u.month] = byMonth[u.month] || []).push(u.unit); });
      const months = Object.keys(byMonth).sort();
      if (months.length < 2) return;
      const avgOf = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
      const first = avgOf(byMonth[months[0]]);
      const lastAvg = avgOf(byMonth[months[months.length - 1]]);
      const change = pctOf(lastAvg, first);
      if (change === null || Math.abs(change) < 3) return;
      movers.push({ name: p.name, heName: p.heName, first, last: lastAvg, change, freq: p.freq, series: months.map((mk) => avgOf(byMonth[mk])) });
    });
    movers.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    /* Brands */
    const bm = {};
    history.forEach((h) => (h.products || []).forEach((p) => {
      const b = (p.brand || "").trim();
      if (!b || /^no brand$/i.test(b)) return;
      bm[b] = (bm[b] || 0) + (p.totalPrice || 0);
    }));
    const brands = Object.entries(bm).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

    /* Savings from discounts */
    let saved = 0, discLines = 0, allLines = 0;
    const savedByChain = {}, savedByProd = {};
    history.forEach((h) => {
      const chain = getChain(h.supermarketName);
      (h.products || []).forEach((p) => {
        allLines += 1;
        if (!p.hasDiscount) return;
        discLines += 1;
        if ((p.price || 0) > 0 && (p.amount || 0) > 0) {
          const sv = Math.max(p.price * p.amount - (p.totalPrice || 0), 0);
          if (sv > 0) {
            saved += sv;
            savedByChain[chain] = (savedByChain[chain] || 0) + sv;
            const key = p.generalName || p.name;
            savedByProd[key] = (savedByProd[key] || 0) + sv;
          }
        }
      });
    });
    const savedPct = totalSpent + saved > 0 ? (saved / (totalSpent + saved)) * 100 : 0;
    const discShare = allLines > 0 ? (discLines / allLines) * 100 : 0;
    const topSavedProds = Object.entries(savedByProd).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);
    const savedChains = Object.entries(savedByChain).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    /* Stores (chains) */
    const smap = {};
    history.forEach((h) => {
      const c = getChain(h.supermarketName);
      if (!smap[c]) smap[c] = { name: c, total: 0, visits: 0, items: 0, cities: new Set(), saved: 0 };
      smap[c].total += h.totalPrice || 0;
      smap[c].visits += 1;
      smap[c].items += (h.products || []).reduce((a, p) => a + (p.amount || 0), 0);
      if (h.supermarketCity) smap[c].cities.add(h.supermarketCity);
    });
    Object.keys(savedByChain).forEach((c) => { if (smap[c]) smap[c].saved = savedByChain[c]; });
    const stores = Object.values(smap).map((c) => ({
      ...c, cities: [...c.cities], avg: c.total / c.visits, avgItems: Math.round(c.items / c.visits),
    }));
    const comparableStores = stores.filter((c) => c.visits >= 2);
    const cheapestChain = comparableStores.length >= 2 ? [...comparableStores].sort((a, b) => a.avg - b.avg)[0] : null;

    /* Cities */
    const cityMap = {};
    history.forEach((h) => {
      const c = h.supermarketCity || "לא ידוע";
      cityMap[c] = (cityMap[c] || 0) + (h.totalPrice || 0);
    });
    const cities = Object.entries(cityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

    /* Weekday pattern */
    const dowTotals = [0, 0, 0, 0, 0, 0, 0], dowCounts = [0, 0, 0, 0, 0, 0, 0];
    history.forEach((h) => {
      const d = new Date(h.date).getDay();
      dowTotals[d] += h.totalPrice || 0;
      dowCounts[d] += 1;
    });
    const busiestDay = dowTotals.indexOf(Math.max(...dowTotals));

    /* Purchase-size distribution */
    const buckets = [
      { label: "עד ₪50", test: (p) => p < 50 },
      { label: "50–100", test: (p) => p >= 50 && p < 100 },
      { label: "100–200", test: (p) => p >= 100 && p < 200 },
      { label: "200–400", test: (p) => p >= 200 && p < 400 },
      { label: "₪400+", test: (p) => p >= 400 },
    ].map((b) => ({ ...b, value: history.filter((h) => b.test(h.totalPrice || 0)).length }));

    /* Timeline, recents, extremes, cadence */
    const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));
    const timeline = sorted.map((h) => ({
      date: h.date, amount: h.totalPrice || 0, store: getChain(h.supermarketName),
      city: h.supermarketCity || "", items: (h.products || []).length,
    }));
    const recent = [...history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
    const most = sorted.reduce((a, h) => ((h.totalPrice || 0) > (a?.totalPrice || -1) ? h : a), null);
    const least = sorted.reduce((a, h) => (a === null || (h.totalPrice || 0) < (a.totalPrice || 0) ? h : a), null);
    const baskets = history.map((h) => (h.products || []).length);
    const avgBasket = baskets.reduce((a, b) => a + b, 0) / baskets.length;
    const maxBasket = Math.max(...baskets);
    let cadence = 0;
    if (sorted.length >= 2) {
      cadence = Math.round((new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / (1000 * 60 * 60 * 24) / (sorted.length - 1));
    }

    /* Current calendar month + end-of-month projection */
    const now = new Date();
    const curKey = monthKey(now);
    const currentMonthSpent = mm[curKey] || 0;
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projected = dayOfMonth >= 3 ? (currentMonthSpent / dayOfMonth) * daysInMonth : null;

    return {
      totalSpent, totalItems, purchases, avg, uniqueProducts: uniq.size,
      monthly, monthlyTotals, monthlyCounts, monthlyAvg, trend,
      catAll, catTotal, donutItems, stackCats, catOverTime,
      prods, topBySpend, topByAmt, topByFreq, movers, brands,
      saved, savedPct, discShare, topSavedProds, savedChains,
      stores, comparableStores, cheapestChain, cities,
      dowTotals, dowCounts, busiestDay, buckets,
      timeline, recent, most, least, avgBasket, maxBasket, cadence,
      currentMonthSpent, projected,
    };
  }, [history, catColorOf]);

  /* ── Insights ──────────────────────────────────────────────── */
  const insights = useMemo(() => {
    if (!stats) return [];
    const list = [];
    if (stats.trend !== null && Math.abs(stats.trend) >= 1 && stats.monthly.length >= 2) {
      const up = stats.trend > 0;
      list.push({
        Ico: I.TrendUp, tint: up ? BAD : GOOD,
        text: `ההוצאות ${up ? "עלו" : "ירדו"} ב־${Math.abs(Math.round(stats.trend))}% לעומת החודש הקודם`,
      });
    }
    if (stats.saved > 0) {
      list.push({ Ico: I.Coins, tint: GOOD, text: `חסכת ${nis(stats.saved)} בזכות מבצעים — ${Math.round(stats.savedPct)}% מהסל` });
    }
    if (stats.cheapestChain) {
      list.push({ Ico: I.Scale, tint: BLUE, text: `הסל הממוצע הזול ביותר: ${stats.cheapestChain.name} (${nis(stats.cheapestChain.avg)} לרכישה)` });
    }
    if (stats.donutItems.length) {
      const top = stats.donutItems[0];
      list.push({ Ico: I.Pie, tint: WARN, text: `${top.name} — ${Math.round((top.value / Math.max(stats.catTotal, 1)) * 100)}% מסך ההוצאות` });
    }
    if (stats.movers.length) {
      const m = stats.movers[0];
      const up = m.change > 0;
      list.push({ Ico: I.Tag, tint: up ? BAD : GOOD, text: `${m.name}: המחיר ליחידה ${up ? "עלה" : "ירד"} ב־${Math.abs(Math.round(m.change))}% מתחילת התקופה` });
    }
    if (stats.cadence > 0) {
      list.push({ Ico: I.Repeat, tint: BLUE, text: `קנייה בממוצע כל ${stats.cadence} ימים · סל ממוצע ${nis(stats.avg)}` });
    }
    if (stats.dowCounts[stats.busiestDay] > 0) {
      list.push({ Ico: I.Calendar, tint: OTHER_COLOR, text: `יום ${DAY_NAMES[stats.busiestDay]} הוא היום היקר בשבוע (${nis(stats.dowTotals[stats.busiestDay])} מצטבר)` });
    }
    if (stats.topByFreq.length) {
      const p = stats.topByFreq[0];
      list.push({ Ico: I.Package, tint: BLUE_DARK, text: `המוצר השכיח ביותר: ${p.name} (${p.freq} רכישות)` });
    }
    return list;
  }, [stats]);

  /* ── Products table ────────────────────────────────────────── */
  const tableProds = useMemo(() => {
    if (!stats) return [];
    let list = stats.prods;
    if (prodSearch.trim()) {
      const q = prodSearch.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.heName || "").toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
    }
    const key = prodSort;
    return [...list].sort((a, b) => {
      if (key === "name") return a.name.localeCompare(b.name, "he") * -prodDir;
      return (a[key] - b[key]) * prodDir;
    });
  }, [stats, prodSearch, prodSort, prodDir]);
  const prodPages = Math.max(1, Math.ceil(tableProds.length / PRODS_PER_PAGE));
  const pagedProds = tableProds.slice(prodPage * PRODS_PER_PAGE, (prodPage + 1) * PRODS_PER_PAGE);

  const sortedStores = useMemo(() => {
    if (!stats) return [];
    const key = storeSort;
    return [...stats.stores].sort((a, b) => b[key] - a[key]);
  }, [stats, storeSort]);

  /* ── KPI counters ──────────────────────────────────────────── */
  const cSpent = useCounter(stats ? Math.round(stats.totalSpent) : 0);
  const cPurch = useCounter(stats ? stats.purchases : 0);
  const cAvg = useCounter(stats ? Math.round(stats.avg) : 0);
  const cSaved = useCounter(stats ? Math.round(stats.saved) : 0);

  const switchTab = useCallback((t) => {
    setTab(t);
    if (contentRef.current && contentRef.current.getBoundingClientRect().top < 80) {
      contentRef.current.scrollIntoView({ block: "start" });
    }
  }, []);

  const submitBudget = useCallback(() => {
    const v = parseFloat(budgetInput);
    if (v > 0) setBudget(v); else if (budgetInput === "0" || budgetInput === "") setBudget(0);
    setBudgetEditing(false); setBudgetInput("");
  }, [budgetInput, setBudget]);

  /* ════════════════════════════════════════════════════════════
     STATES: loading / error / empty
     ════════════════════════════════════════════════════════════ */
  if (loading) {
    return (
      <div className={s.stateWrap}>
        <div className={s.spinner} aria-hidden="true" />
        <p className={s.stateText}>טוען נתונים…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className={s.stateWrap}>
        <div className={s.stateIcon}><I.Activity style={{ width: 26, height: 26 }} /></div>
        <h2 className={s.stateTitle}>לא הצלחנו לטעון את הנתונים</h2>
        <p className={s.stateText}>בדוק שהשרת פועל ונסה שוב</p>
        <button className={s.btnPrimary} onClick={fetchHistory}>נסה שוב</button>
      </div>
    );
  }
  if (!rawHistory.length) {
    return (
      <div className={s.stateWrap}>
        <div className={s.stateIcon}><I.Bar style={{ width: 26, height: 26 }} /></div>
        <h2 className={s.stateTitle}>עדיין אין נתונים</h2>
        <p className={s.stateText}>אחרי הקנייה הראשונה תמצא כאן את כל הסטטיסטיקות שלך</p>
        <button className={s.btnPrimary} onClick={() => navigate("/products")}>להתחיל קנייה</button>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════ */
  return (
    <div className={s.page}>
      {/* ── Sticky header ─────────────────────────────────── */}
      <header className={s.header}>
        <div>
          <h1 className={s.headerTitle}>סטטיסטיקות</h1>
          <p className={s.headerSub}>
            {stats ? `${stats.purchases} רכישות · ${stats.uniqueProducts} מוצרים` : "אין תוצאות לסינון הנוכחי"}
          </p>
        </div>
        <button className={`${s.filterBtn} ${sheetOpen || filterCount > 0 ? s.filterBtnActive : ""}`}
          onClick={sheetOpen ? closeSheet : openSheet} aria-expanded={sheetOpen}>
          <I.Filter style={{ width: 15, height: 15 }} />
          <span>סינון</span>
          {filterCount > 0 && <span className={s.filterBadge}>{filterCount}</span>}
        </button>
      </header>

      {/* ── Filter sheet ──────────────────────────────────── */}
      <div className={`${s.sheet} ${sheetOpen ? s.sheetOpen : ""}`}>
        <div className={s.sheetInner}>
          <div className={s.sheetSection}>
            <p className={s.sheetLabel}><I.Calendar style={{ width: 13, height: 13 }} /> טווח תאריכים מותאם</p>
            <div className={s.dateRow}>
              <label className={s.dateField}>
                <span>מתאריך</span>
                <input type="date" value={draft.from} onChange={(e) => setDraft((f) => ({ ...f, from: e.target.value }))} />
              </label>
              <label className={s.dateField}>
                <span>עד תאריך</span>
                <input type="date" value={draft.to} onChange={(e) => setDraft((f) => ({ ...f, to: e.target.value }))} />
              </label>
            </div>
          </div>

          {meta.chains.length > 0 && (
            <div className={s.sheetSection}>
              <p className={s.sheetLabel}><I.Store style={{ width: 13, height: 13 }} /> רשתות</p>
              <div className={s.chipWrap}>
                {meta.chains.map((c) => (
                  <button key={c} className={`${s.chip} ${draft.chains.includes(c) ? s.chipOn : ""}`} onClick={() => toggleDraft("chains", c)} aria-pressed={draft.chains.includes(c)}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {meta.cities.length > 0 && (
            <div className={s.sheetSection}>
              <p className={s.sheetLabel}><I.Map style={{ width: 13, height: 13 }} /> ערים</p>
              <div className={s.chipWrap}>
                {meta.cities.map((c) => (
                  <button key={c} className={`${s.chip} ${draft.cities.includes(c) ? s.chipOn : ""}`} onClick={() => toggleDraft("cities", c)} aria-pressed={draft.cities.includes(c)}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {meta.cats.length > 0 && (
            <div className={s.sheetSection}>
              <p className={s.sheetLabel}><I.Pie style={{ width: 13, height: 13 }} /> קטגוריות</p>
              <div className={s.chipWrap}>
                {meta.cats.map((c) => (
                  <button key={c} className={`${s.chip} ${draft.cats.includes(c) ? s.chipOn : ""}`} onClick={() => toggleDraft("cats", c)} aria-pressed={draft.cats.includes(c)}>
                    <span className={s.chipDot} style={{ background: catColorOf(c) }} />{c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={s.sheetSection}>
            <p className={s.sheetLabel}><I.Receipt style={{ width: 13, height: 13 }} /> סכום רכישה (₪)</p>
            <div className={s.dateRow}>
              <label className={s.dateField}>
                <span>מינימום</span>
                <input type="number" min="0" inputMode="numeric" placeholder="0" value={draft.min} onChange={(e) => setDraft((f) => ({ ...f, min: e.target.value }))} />
              </label>
              <label className={s.dateField}>
                <span>מקסימום</span>
                <input type="number" min="0" inputMode="numeric" placeholder="ללא הגבלה" value={draft.max} onChange={(e) => setDraft((f) => ({ ...f, max: e.target.value }))} />
              </label>
            </div>
          </div>

          <div className={s.sheetFooter}>
            <span className={s.sheetCount}>{draftCount} רכישות תואמות</span>
            <div className={s.sheetBtns}>
              <button className={s.btnGhost} onClick={() => setDraft(EMPTY_FILTERS)}>אפס</button>
              <button className={s.btnPrimary} onClick={applySheet} disabled={draftCount === 0}>הצג תוצאות</button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Period presets ────────────────────────────────── */}
      <div className={s.periodRow} role="tablist" aria-label="תקופה">
        {PERIODS.map((p) => (
          <button key={p.key} role="tab" aria-selected={flt.period === p.key}
            className={`${s.periodChip} ${flt.period === p.key ? s.periodChipOn : ""}`}
            onClick={() => setPeriod(p.key)}>{p.label}</button>
        ))}
        {flt.period === "custom" && (
          <button className={`${s.periodChip} ${s.periodChipOn}`} onClick={() => setPeriod("all")}>
            {flt.from ? fmtShort(flt.from) : "…"} – {flt.to ? fmtShort(flt.to) : "היום"} <I.X style={{ width: 11, height: 11 }} />
          </button>
        )}
      </div>

      {/* ── Active filter chips ───────────────────────────── */}
      {(flt.chains.length + flt.cities.length + flt.cats.length > 0 || flt.min || flt.max) && (
        <div className={s.activeRow}>
          {flt.chains.map((c) => (
            <span key={"ch" + c} className={s.activeChip}><I.Store style={{ width: 10, height: 10 }} />{c}
              <button onClick={() => removeFrom("chains", c)} aria-label={`הסר ${c}`}>×</button></span>
          ))}
          {flt.cities.map((c) => (
            <span key={"ci" + c} className={s.activeChip}><I.Map style={{ width: 10, height: 10 }} />{c}
              <button onClick={() => removeFrom("cities", c)} aria-label={`הסר ${c}`}>×</button></span>
          ))}
          {flt.cats.map((c) => (
            <span key={"ca" + c} className={s.activeChip}><span className={s.chipDot} style={{ background: catColorOf(c) }} />{c}
              <button onClick={() => removeFrom("cats", c)} aria-label={`הסר ${c}`}>×</button></span>
          ))}
          {(flt.min || flt.max) && (
            <span className={s.activeChip}>₪{flt.min || 0}–{flt.max ? `₪${flt.max}` : "∞"}
              <button onClick={() => setFlt((f) => ({ ...f, min: "", max: "" }))} aria-label="הסר טווח סכום">×</button></span>
          )}
          <button className={s.clearAll} onClick={resetAll}>נקה הכל</button>
        </div>
      )}

      {!stats ? (
        <div className={s.stateWrap}>
          <div className={s.stateIcon}><I.Filter style={{ width: 24, height: 24 }} /></div>
          <h2 className={s.stateTitle}>אין תוצאות לסינון הזה</h2>
          <p className={s.stateText}>נסה להרחיב את הטווח או להסיר חלק מהפילטרים</p>
          <button className={s.btnPrimary} onClick={resetAll}>נקה פילטרים</button>
        </div>
      ) : (
        <>
          {/* ── KPI tiles ─────────────────────────────────── */}
          <div className={s.kpiGrid}>
            <div className={`${s.kpi} ${s.kpiHero}`}>
              <div className={s.kpiHead}>
                <span className={s.kpiIcon} style={{ background: BLUE + "14", color: BLUE_DARK }}><I.Wallet /></span>
                <span className={s.kpiLabel}>סה"כ הוצאות</span>
                {prev && (
                  <span className={s.kpiHeadSide}>
                    <Delta value={pctOf(stats.totalSpent, prev.spent)} label="מהתקופה הקודמת" />
                  </span>
                )}
              </div>
              <p className={s.kpiHeroVal}>{nis(cSpent)}</p>
              {stats.monthly.length > 1 && (
                <div className={s.kpiHeroSpark}>
                  <HeroTrend months={stats.monthly} />
                </div>
              )}
            </div>

            <div className={s.kpi}>
              <div className={s.kpiHead}>
                <span className={s.kpiIcon} style={{ background: BLUE + "14", color: BLUE_DARK }}><I.Cart /></span>
                <span className={s.kpiLabel}>רכישות</span>
              </div>
              <p className={s.kpiVal}>{cPurch.toLocaleString("he-IL")}</p>
              <div className={s.kpiFoot}>
                {prev ? <Delta value={pctOf(stats.purchases, prev.count)} neutral /> : <span className={s.kpiSub}>{stats.totalItems.toLocaleString("he-IL")} פריטים</span>}
              </div>
            </div>

            <div className={s.kpi}>
              <div className={s.kpiHead}>
                <span className={s.kpiIcon} style={{ background: BLUE + "14", color: BLUE_DARK }}><I.Receipt /></span>
                <span className={s.kpiLabel}>ממוצע לרכישה</span>
              </div>
              <p className={s.kpiVal}>{nis(cAvg)}</p>
              <div className={s.kpiFoot}>
                {prev ? <Delta value={pctOf(stats.avg, prev.avg)} /> : <span className={s.kpiSub}>{Math.round(stats.avgBasket)} מוצרים בסל</span>}
              </div>
            </div>

            <div className={s.kpi}>
              <div className={s.kpiHead}>
                <span className={s.kpiIcon} style={{ background: GOOD + "14", color: GOOD_TEXT }}><I.Coins /></span>
                <span className={s.kpiLabel}>חיסכון ממבצעים</span>
              </div>
              <p className={s.kpiVal} style={{ color: stats.saved > 0 ? GOOD_TEXT : undefined }}>{nis(cSaved)}</p>
              <div className={s.kpiFoot}>
                <span className={s.kpiSub}>{stats.saved > 0 ? `${Math.round(stats.savedPct)}% מהסל המלא` : "אין מבצעים בטווח"}</span>
              </div>
            </div>

            <div className={s.kpi}>
              <div className={s.kpiHead}>
                <span className={s.kpiIcon} style={{ background: BLUE + "14", color: BLUE_DARK }}><I.Package /></span>
                <span className={s.kpiLabel}>פריטים</span>
              </div>
              <p className={s.kpiVal}>{stats.totalItems.toLocaleString("he-IL")}</p>
              <div className={s.kpiFoot}><span className={s.kpiSub}>{stats.uniqueProducts} מוצרים שונים</span></div>
            </div>
          </div>

          {/* ── Tab bar (sticky) ──────────────────────────── */}
          <nav className={s.tabBar} role="tablist" aria-label="תצוגות">
            {TABS.map((t) => (
              <button key={t.key} role="tab" aria-selected={tab === t.key}
                className={`${s.tabBtn} ${tab === t.key ? s.tabBtnOn : ""}`}
                onClick={() => switchTab(t.key)}>
                <t.Ico style={{ width: 15, height: 15 }} />
                <span>{t.label}</span>
              </button>
            ))}
          </nav>

          <div className={s.content} ref={contentRef}>

            {/* ════════ TAB: OVERVIEW ════════ */}
            {tab === "overview" && (
              <div className={s.grid}>
                <Card Ico={I.Bar} tint={BLUE} title="הוצאות חודשיות"
                  sub={stats.monthly.length > 1 ? `ממוצע חודשי ${nis(stats.monthlyTotals.reduce((a, b) => a + b, 0) / stats.monthly.length)}` : null}
                  badge={`${stats.monthly.length} חודשים`} className={s.span2}>
                  <ColumnChart data={stats.monthly} />
                </Card>

                <Card Ico={I.Pie} tint="#1baf7a" title="לאן הולך הכסף" sub="התפלגות ההוצאות לפי קטגוריה" badge={`${stats.catAll.length} קטגוריות`}>
                  <div className={s.donutWrap}>
                    <div className={s.donutBox}>
                      <Donut items={stats.donutItems} total={stats.catTotal} active={donutHover} onActive={setDonutHover} />
                      <div className={s.donutCenter}>
                        <span className={s.donutCenterVal}>
                          {donutHover >= 0 && stats.donutItems[donutHover] ? nis(stats.donutItems[donutHover].value) : nis(stats.catTotal)}
                        </span>
                        <span className={s.donutCenterLbl}>
                          {donutHover >= 0 && stats.donutItems[donutHover] ? stats.donutItems[donutHover].name : "סה\"כ"}
                        </span>
                      </div>
                    </div>
                    <div className={s.legend}>
                      {stats.donutItems.map((c, i) => (
                        <div key={c.name} className={`${s.legendRow} ${donutHover === i ? s.legendRowOn : ""}`}
                          onMouseEnter={() => setDonutHover(i)} onMouseLeave={() => setDonutHover(-1)}>
                          <span className={s.legendDot} style={{ background: c.color }} />
                          <span className={s.legendName}>{c.name}</span>
                          <span className={s.legendPct}>{Math.round((c.value / Math.max(stats.catTotal, 1)) * 100)}%</span>
                          <span className={`${s.legendVal} ${s.tnum}`}>{nis(c.value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {insights.length > 0 && (
                  <Card Ico={I.Zap} tint={WARN} title="תובנות" badge={`${insights.length}`}>
                    <div className={s.insList}>
                      {insights.slice(0, 4).map((ins, i) => (
                        <div key={i} className={s.insRow} style={{ animationDelay: `${i * 0.05}s` }}>
                          <span className={s.insIcon} style={{ background: ins.tint + "14", color: ins.tint }}><ins.Ico /></span>
                          <p className={s.insText}>{ins.text}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                <Card Ico={I.Clock} tint="#4a3aa7" title="רכישות אחרונות" badge={`${stats.recent.length} מתוך ${stats.purchases}`}
                  className={s.span2}
                  action={<button className={s.linkBtn} onClick={() => navigate("/history")}>להיסטוריה המלאה</button>}>
                  <div className={s.recList}>
                    {stats.recent.map((r) => {
                      const open = expandedRecent === r._id;
                      return (
                        <div key={r._id} className={s.recCard}>
                          <button className={s.recRow} onClick={() => setExpandedRecent(open ? null : r._id)} aria-expanded={open}>
                            <span className={s.recIcon}><I.Receipt /></span>
                            <span className={s.recInfo}>
                              <span className={s.recStore}>{getChain(r.supermarketName)}</span>
                              <span className={s.recDate}>{fmtDate(r.date)}{r.supermarketCity ? ` · ${r.supermarketCity}` : ""}</span>
                            </span>
                            <span className={s.recSide}>
                              <span className={`${s.recPrice} ${s.tnum}`}>{nis(r.totalPrice)}</span>
                              <span className={s.recItems}>{(r.products || []).length} מוצרים</span>
                            </span>
                            <I.ChevDown style={{ width: 14, height: 14, transform: open ? "rotate(180deg)" : "none", transition: "transform .2s", color: MUTED }} />
                          </button>
                          {open && (
                            <div className={s.recDetail}>
                              {(r.products || []).slice(0, 10).map((p, pi) => (
                                <div key={pi} className={s.recProd}>
                                  <span className={s.recProdName}>{p.name || p.generalName}</span>
                                  <span className={s.recProdQty}>×{p.amount || 1}</span>
                                  <span className={`${s.recProdPrice} ${s.tnum}`}>{nis(p.totalPrice || 0)}</span>
                                </div>
                              ))}
                              {(r.products || []).length > 10 && <p className={s.recMore}>+{r.products.length - 10} מוצרים נוספים</p>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {/* ════════ TAB: SPENDING ════════ */}
            {tab === "spending" && (
              <div className={s.grid}>
                <Card Ico={I.Target} tint={BLUE} title="תקציב חודשי" sub={mLblFull(monthKey(new Date()))}
                  action={
                    <button className={s.linkBtn} onClick={() => { setBudgetEditing(!budgetEditing); setBudgetInput(budget > 0 ? String(budget) : ""); }}>
                      {budgetEditing ? "ביטול" : budget > 0 ? "עריכה" : "הגדרת תקציב"}
                    </button>
                  }>
                  {budgetEditing && (
                    <div className={s.budgetEdit}>
                      <input type="number" min="0" inputMode="numeric" placeholder="סכום התקציב בשקלים" value={budgetInput}
                        onChange={(e) => setBudgetInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitBudget()} autoFocus />
                      <button className={s.btnPrimary} onClick={submitBudget}>שמירה</button>
                    </div>
                  )}
                  {budget > 0 ? (
                    <div className={s.budgetBody}>
                      <div className={s.budgetTopRow}>
                        <span className={s.budgetBig}>{nis(stats.currentMonthSpent)}</span>
                        <span className={s.budgetOf}>מתוך {nis(budget)}</span>
                      </div>
                      <Meter value={stats.currentMonthSpent} max={budget} projected={stats.projected} />
                      <div className={s.budgetMeta}>
                        <span className={stats.currentMonthSpent <= budget ? s.budgetOk : s.budgetOver}>
                          {stats.currentMonthSpent <= budget
                            ? `נשארו ${nis(budget - stats.currentMonthSpent)}`
                            : `חריגה של ${nis(stats.currentMonthSpent - budget)}`}
                        </span>
                        {stats.projected != null && (
                          <span className={s.budgetProj} style={{ color: stats.projected > budget ? BAD : MUTED }}>
                            צפי לסוף החודש: {nis(stats.projected)}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : !budgetEditing && (
                    <p className={s.budgetHint}>הגדר תקציב חודשי כדי לעקוב אחרי הקצב — כולל צפי לסוף החודש לפי הקצב הנוכחי.</p>
                  )}
                </Card>

                <Card Ico={I.Grid} tint="#4a3aa7" title="רצף יומי" sub="13 השבועות האחרונים">
                  <Heatmap history={history} />
                </Card>

                <Card Ico={I.Calendar} tint="#1baf7a" title="דפוס שבועי" sub={`היום היקר ביותר: יום ${DAY_NAMES[stats.busiestDay]}`}>
                  <MiniColumns
                    ariaLabel="הוצאות לפי יום בשבוע"
                    items={DAY_SHORT.map((lbl, i) => ({ label: lbl, value: stats.dowTotals[i] }))}
                    tipFor={(it, i) => ({
                      title: `יום ${DAY_NAMES[i]}`,
                      rows: [
                        { v: nis(stats.dowTotals[i]), l: "סה\"כ", c: BLUE },
                        { v: String(stats.dowCounts[i]), l: "רכישות" },
                        { v: stats.dowCounts[i] ? nis(stats.dowTotals[i] / stats.dowCounts[i]) : "—", l: "ממוצע לרכישה" },
                      ],
                    })}
                  />
                </Card>

                <Card Ico={I.Layers} tint={WARN} title="קטגוריות לאורך זמן" badge={`${stats.stackCats.length} קטגוריות`} className={s.span2}>
                  <StackedColumns data={stats.catOverTime} cats={stats.stackCats} />
                  <div className={s.stackLegend}>
                    {stats.stackCats.map((c) => (
                      <span key={c.name} className={s.stackLegendItem}>
                        <span className={s.legendDot} style={{ background: c.color }} />{c.name}
                      </span>
                    ))}
                  </div>
                </Card>

                <Card Ico={I.Receipt} tint={BLUE} title="גודל רכישה אופייני" sub="כמה רכישות בכל טווח סכום">
                  <MiniColumns
                    ariaLabel="התפלגות סכומי רכישה"
                    items={stats.buckets.map((b) => ({ label: b.label, value: b.value, topLabel: String(b.value) }))}
                    tipFor={(it) => ({
                      title: it.label,
                      rows: [
                        { v: String(it.value), l: "רכישות", c: BLUE },
                        { v: Math.round((it.value / Math.max(stats.purchases, 1)) * 100) + "%", l: "מכלל הרכישות" },
                      ],
                    })}
                  />
                </Card>

                <Card Ico={I.Activity} tint="#e34948" title="ציר זמן" sub="כל רכישה על ציר הזמן">
                  <AreaTimeline data={stats.timeline} />
                </Card>

                <Card Ico={I.Award} tint="#4a3aa7" title="שיאים" className={s.span2}>
                  <div className={s.extGrid}>
                    <div className={s.extItem}>
                      <span className={s.extLabel}>הרכישה היקרה ביותר</span>
                      <span className={s.extVal}>{stats.most ? nis(stats.most.totalPrice) : "—"}</span>
                      {stats.most && <span className={s.extSub}>{getChain(stats.most.supermarketName)} · {fmtShort(stats.most.date)}</span>}
                    </div>
                    <div className={s.extItem}>
                      <span className={s.extLabel}>הרכישה הזולה ביותר</span>
                      <span className={s.extVal}>{stats.least ? nis(stats.least.totalPrice) : "—"}</span>
                      {stats.least && <span className={s.extSub}>{getChain(stats.least.supermarketName)} · {fmtShort(stats.least.date)}</span>}
                    </div>
                    <div className={s.extItem}>
                      <span className={s.extLabel}>הסל הגדול ביותר</span>
                      <span className={s.extVal}>{stats.maxBasket}</span>
                      <span className={s.extSub}>מוצרים ברכישה אחת</span>
                    </div>
                    <div className={s.extItem}>
                      <span className={s.extLabel}>קצב קניות</span>
                      <span className={s.extVal}>{stats.cadence > 0 ? `כל ${stats.cadence} ימים` : "—"}</span>
                      <span className={s.extSub}>בממוצע בין רכישות</span>
                    </div>
                  </div>
                </Card>

                {insights.length > 4 && (
                  <Card Ico={I.Zap} tint={WARN} title="עוד תובנות" className={s.span2}>
                    <div className={`${s.insList} ${s.insCols}`}>
                      {insights.slice(4).map((ins, i) => (
                        <div key={i} className={s.insRow}>
                          <span className={s.insIcon} style={{ background: ins.tint + "14", color: ins.tint }}><ins.Ico /></span>
                          <p className={s.insText}>{ins.text}</p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {/* ════════ TAB: PRODUCTS ════════ */}
            {tab === "products" && (
              <div className={s.grid}>
                <Card Ico={I.Award} tint={WARN} title="המוצרים המובילים"
                  action={
                    <div className={s.segRow} role="tablist" aria-label="מיון מוצרים מובילים">
                      {[{ k: "spent", l: "הוצאה" }, { k: "amount", l: "כמות" }, { k: "freq", l: "תדירות" }].map((m) => (
                        <button key={m.k} role="tab" aria-selected={topProdMode === m.k}
                          className={`${s.segBtn} ${topProdMode === m.k ? s.segBtnOn : ""}`}
                          onClick={() => setTopProdMode(m.k)}>{m.l}</button>
                      ))}
                    </div>
                  }>
                  <HBarList
                    showRank
                    items={(topProdMode === "spent" ? stats.topBySpend : topProdMode === "amount" ? stats.topByAmt : stats.topByFreq).map((p) => ({
                      label: p.name,
                      value: topProdMode === "spent" ? p.spent : topProdMode === "amount" ? p.amount : p.freq,
                      sub: topProdMode === "spent" ? `${p.amount} יח' · ${p.freq} רכישות` : nis(p.spent) + " סה\"כ",
                    }))}
                    fmtVal={topProdMode === "spent" ? nis : (v) => (topProdMode === "amount" ? `${v} יח'` : `${v} פעמים`)}
                  />
                </Card>

                <Card Ico={I.Tag} tint="#e34948" title="מעקב מחירים" sub="שינוי מחיר ליחידה במוצרים שאתה קונה שוב ושוב">
                  {stats.movers.length ? (
                    <div className={s.moversList}>
                      {stats.movers.slice(0, 6).map((m) => {
                        const up = m.change > 0;
                        return (
                          <div key={m.name} className={s.moverRow}>
                            <div className={s.moverInfo}>
                              <span className={s.moverName}>{m.name}</span>
                              <span className={s.moverSub}>מ־{nis1(m.first)} ל־{nis1(m.last)} ליחידה · {m.freq} רכישות</span>
                            </div>
                            {m.series.length > 1 && <Spark data={m.series} color={up ? BAD : GOOD} />}
                            <span className={`${s.moverChip} ${up ? s.moverUp : s.moverDown}`}>{up ? "▲" : "▼"} {Math.abs(Math.round(m.change))}%</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <EmptyNote text="אין מספיק רכישות חוזרות בטווח הזה כדי לעקוב אחרי מחירים" />
                  )}
                </Card>

                {stats.brands.length > 1 && (
                  <Card Ico={I.Store} tint="#4a3aa7" title="מותגים מובילים" sub="לפי סך ההוצאה" badge={`${stats.brands.length}`}>
                    <HBarList items={stats.brands.map((b) => ({ label: b.name, value: b.value }))} />
                  </Card>
                )}

                {stats.topSavedProds.length > 0 && (
                  <Card Ico={I.Coins} tint={GOOD} title="אלופי החיסכון" sub="המוצרים שחסכו לך הכי הרבה במבצעים">
                    <HBarList items={stats.topSavedProds.map((p) => ({ label: p.name, value: p.value, color: GOOD }))} />
                  </Card>
                )}

                <Card Ico={I.Package} tint={BLUE} title="כל המוצרים" badge={`${tableProds.length} מוצרים`} className={s.span2}>
                  <div className={s.searchBox}>
                    <I.Search style={{ width: 14, height: 14 }} />
                    <input type="text" placeholder="חיפוש מוצר או קטגוריה…" value={prodSearch}
                      onChange={(e) => { setProdSearch(e.target.value); setProdPage(0); }} aria-label="חיפוש מוצר" />
                    {prodSearch && <button className={s.searchClear} onClick={() => { setProdSearch(""); setProdPage(0); }} aria-label="נקה חיפוש"><I.X style={{ width: 12, height: 12 }} /></button>}
                  </div>
                  <div className={s.table} role="table" aria-label="טבלת כל המוצרים">
                    <div className={s.thead} role="row">
                      {[
                        { key: "name", label: "מוצר" },
                        { key: "amount", label: "כמות" },
                        { key: "spent", label: "הוצאה" },
                        { key: "avgUnit", label: "₪ ליחידה" },
                        { key: "freq", label: "תדירות" },
                      ].map((col) => (
                        <button key={col.key} role="columnheader"
                          className={`${s.th} ${s["col_" + col.key]} ${prodSort === col.key ? s.thOn : ""}`}
                          onClick={() => {
                            if (prodSort === col.key) setProdDir((d) => -d);
                            else { setProdSort(col.key); setProdDir(-1); }
                            setProdPage(0);
                          }}>
                          {col.label}{prodSort === col.key && <span className={s.sortArrow}>{prodDir === -1 ? "▼" : "▲"}</span>}
                        </button>
                      ))}
                    </div>
                    <div className={s.tbody}>
                      {pagedProds.map((p) => (
                        <div key={p.name} className={s.trow} role="row">
                          <div className={`${s.td} ${s.col_name}`}>
                            <span className={s.tdProd}>{p.name}</span>
                            <span className={s.tdCat}><span className={s.chipDot} style={{ background: catColorOf(p.cat) }} />{p.cat}</span>
                          </div>
                          <span className={`${s.td} ${s.col_amount} ${s.tnum}`}>{p.amount}</span>
                          <span className={`${s.td} ${s.col_spent} ${s.tnum}`}>{nis(p.spent)}</span>
                          <span className={`${s.td} ${s.col_avgUnit} ${s.tnum}`}>{nis1(p.avgUnit)}</span>
                          <span className={`${s.td} ${s.col_freq} ${s.tnum}`}>{p.freq}</span>
                        </div>
                      ))}
                      {!pagedProds.length && <EmptyNote text="לא נמצאו מוצרים תואמים" />}
                    </div>
                    {prodPages > 1 && (
                      <div className={s.pager}>
                        <button className={s.pagerBtn} disabled={prodPage === 0} onClick={() => setProdPage((p) => p - 1)}>הקודם</button>
                        <span className={`${s.pagerInfo} ${s.tnum}`}>{prodPage + 1} / {prodPages}</span>
                        <button className={s.pagerBtn} disabled={prodPage >= prodPages - 1} onClick={() => setProdPage((p) => p + 1)}>הבא</button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            )}

            {/* ════════ TAB: STORES ════════ */}
            {tab === "stores" && (
              <div className={s.grid}>
                <Card Ico={I.Store} tint={BLUE} title="השוואת רשתות" badge={`${stats.stores.length} רשתות`} className={s.span2}
                  action={
                    <div className={s.segRow} role="tablist" aria-label="מיון רשתות">
                      {[{ k: "total", l: "הוצאה" }, { k: "visits", l: "ביקורים" }, { k: "avg", l: "ממוצע" }, { k: "saved", l: "חיסכון" }].map((m) => (
                        <button key={m.k} role="tab" aria-selected={storeSort === m.k}
                          className={`${s.segBtn} ${storeSort === m.k ? s.segBtnOn : ""}`}
                          onClick={() => setStoreSort(m.k)}>{m.l}</button>
                      ))}
                    </div>
                  }>
                  <div className={s.storeGrid}>
                    {sortedStores.map((st, i) => {
                      const sortMax = Math.max(...sortedStores.map((x) => x[storeSort]), 1);
                      return (
                        <div key={st.name} className={s.storeCard}>
                          <div className={s.storeTop}>
                            <span className={`${s.storeRank} ${i === 0 ? s.storeRankTop : ""}`}>{i + 1}</span>
                            <div className={s.storeNames}>
                              <span className={s.storeName}>{st.name}</span>
                              {st.cities.length > 0 && <span className={s.storeCities}>{st.cities.join(" · ")}</span>}
                            </div>
                            <span className={`${s.storeTotal} ${s.tnum}`}>{storeSort === "avg" ? nis(st.avg) : storeSort === "visits" ? st.visits : nis(st[storeSort])}</span>
                          </div>
                          <div className={s.hbTrack}>
                            <div className={s.hbFill} style={{ width: `${(st[storeSort] / sortMax) * 100}%`, background: storeSort === "saved" ? GOOD : BLUE }} />
                          </div>
                          <div className={s.storeMeta}>
                            <span><b className={s.tnum}>{st.visits}</b> ביקורים</span>
                            <span><b className={s.tnum}>{nis(st.avg)}</b> לרכישה</span>
                            <span><b className={s.tnum}>{st.avgItems}</b> פריטים/ביקור</span>
                            {st.saved > 0 && <span className={s.storeSaved}><b className={s.tnum}>{nis(st.saved)}</b> חיסכון</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {stats.comparableStores.length >= 2 && (
                  <Card Ico={I.Scale} tint={GOOD} title="איפה הסל הכי משתלם" sub="ממוצע לרכישה — רשתות עם 2+ ביקורים">
                    <HBarList
                      items={[...stats.comparableStores].sort((a, b) => a.avg - b.avg).map((st, i, arr) => ({
                        label: st.name,
                        value: st.avg,
                        color: i === 0 ? GOOD : DEEMPH,
                        tag: `${st.visits} ביקורים`,
                        sub: i === 0 ? "הכי משתלם" : `יקר ב־${Math.round((st.avg / arr[0].avg - 1) * 100)}% מהזול ביותר`,
                      }))}
                    />
                  </Card>
                )}

                {stats.saved > 0 && stats.savedChains.length > 0 && (
                  <Card Ico={I.Coins} tint={GOOD} title="חיסכון לפי רשת" sub="כמה חסכת במבצעים בכל רשת">
                    <HBarList items={stats.savedChains.map((c) => ({ label: c.name, value: c.value, color: GOOD }))} />
                  </Card>
                )}

                {stats.cities.length > 1 && (
                  <Card Ico={I.Map} tint={BLUE} title="הוצאות לפי עיר" badge={`${stats.cities.length} ערים`}>
                    <HBarList items={stats.cities.map((c) => ({ label: c.name, value: c.value }))} />
                  </Card>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

