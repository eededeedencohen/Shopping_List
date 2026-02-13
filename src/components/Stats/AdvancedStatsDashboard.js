import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DOMAIN } from "../../constants";
import s from "./AdvancedStatsDashboard.module.css";

/* ================================================================
   SVG ICONS — Full Icon Set
   ================================================================ */
const I = {
  Wallet:     p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>,
  Cart:       p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>,
  Package:    p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M16.5 9.4 7.55 4.24"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.29 7 12 12 20.71 7"/><line x1="12" y1="22" x2="12" y2="12"/></svg>,
  Tag:        p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/></svg>,
  TrendUp:    p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>,
  Pie:        p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg>,
  Trophy:     p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>,
  Store:      p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>,
  Activity:   p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Zap:        p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>,
  Calendar:   p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>,
  CreditCard: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>,
  ArrowUp:    p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>,
  ArrowDown:  p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>,
  Receipt:    p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>,
  Clock:      p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  BarChart:   p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>,
  Filter:     p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
  Grid:       p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>,
  Eye:        p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>,
  Map:        p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>,
  Search:     p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Target:     p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  ChevDown:   p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m6 9 6 6 6-6"/></svg>,
  ChevRight:  p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m9 18 6-6-6-6"/></svg>,
  X:          p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Star:       p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Layers:     p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.84Z"/><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65"/><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65"/></svg>,
  Percent:    p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>,
  Repeat:     p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>,
  Hash:       p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="4" x2="20" y1="9" y2="9"/><line x1="4" x2="20" y1="15" y2="15"/><line x1="10" x2="8" y1="3" y2="21"/><line x1="16" x2="14" y1="3" y2="21"/></svg>,
  Flame:      p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>,
  Award:      p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
  Compass:    p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>,
  DollarSign: p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  Scale:      p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z"/><path d="M7 21h10"/><path d="M12 3v18"/><path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2"/></svg>,
};

/* ================================================================
   PALETTE & THEMES
   ================================================================ */
const V = ["#8b5cf6","#06b6d4","#f59e0b","#ef4444","#10b981","#ec4899","#3b82f6","#f97316","#14b8a6","#a855f7","#eab308","#6366f1","#84cc16","#e11d48","#0ea5e9","#d946ef"];
const THEMES = [
  {bg:"linear-gradient(135deg,#7c3aed,#4f46e5)"},
  {bg:"linear-gradient(135deg,#0891b2,#0284c7)"},
  {bg:"linear-gradient(135deg,#059669,#0d9488)"},
  {bg:"linear-gradient(135deg,#d946ef,#a855f7)"},
];

/* ── Chain grouping ─────────────────────────────────────────── */
const CHAINS=[
  {r:/שופרסל/i,n:"שופרסל"},{r:/רמי\s*לוי/i,n:"רמי לוי"},{r:/אושר\s*עד/i,n:"אושר עד"},
  {r:/יש\s*(חסד|בשכונה)/i,n:"יש"},{r:/מחסני\s*השוק/i,n:"מחסני השוק"},{r:/שערי\s*רווחה/i,n:"שערי רווחה"},
  {r:/carrefour|קרפור/i,n:"קרפור סיטי"},{r:/ויקטורי/i,n:"ויקטורי"},{r:/יוחננוף/i,n:"יוחננוף"},
  {r:/טיב\s*טעם/i,n:"טיב טעם"},{r:/יינות\s*ביתן/i,n:"יינות ביתן"},{r:/סטופ\s*מרקט/i,n:"סטופ מרקט"},
  {r:/חצי\s*חינם/i,n:"חצי חינם"},{r:/סופר\s*פארם/i,n:"סופר פארם"},{r:/good\s*מרקט/i,n:"Good מרקט"},
  {r:/זול\s*ובגדול/i,n:"זול ובגדול"},{r:/קינג\s*סטור/i,n:"קינג סטור"},{r:/מגה/i,n:"מגה"},
];
function getChain(nm){if(!nm)return"לא ידוע";for(const c of CHAINS)if(c.r.test(nm))return c.n;return nm;}

/* ── Helpers ────────────────────────────────────────────────── */
const fmt = v => "₪" + Math.round(v).toLocaleString();
const fmtDec = v => "₪" + v.toFixed(1);
const fmtD = d => new Date(d).toLocaleDateString("he-IL",{day:"numeric",month:"short",year:"numeric"});
const fmtShort = d => new Date(d).toLocaleDateString("he-IL",{day:"numeric",month:"short"});
const mLbl = m => new Date(m+"-15").toLocaleDateString("he-IL",{month:"short"});
const mLblFull = m => new Date(m+"-15").toLocaleDateString("he-IL",{month:"long",year:"numeric"});
const dayName = d => ["ראשון","שני","שלישי","רביעי","חמישי","שישי","שבת"][d];
const dayShort = d => ["א'","ב'","ג'","ד'","ה'","ו'","ש'"][d];
const pctChange = (cur, prev) => prev > 0 ? ((cur - prev) / prev * 100) : 0;

const PERIODS = [
  {key:"all",label:"הכל",icon:null},
  {key:"12m",label:"שנה"},
  {key:"6m",label:"6 חודשים"},
  {key:"3m",label:"3 חודשים"},
  {key:"1m",label:"חודש אחרון"},
  {key:"2w",label:"שבועיים"},
];
const TABS = [
  {key:"overview",label:"סקירה",Ico:I.Grid},
  {key:"spending",label:"הוצאות",Ico:I.TrendUp},
  {key:"products",label:"מוצרים",Ico:I.Package},
  {key:"stores",label:"חנויות",Ico:I.Store},
];

function byPeriod(data, pk) {
  if (pk === "all") return data;
  const map = {"12m":12,"6m":6,"3m":3,"1m":1,"2w":0.5};
  const mo = map[pk] || 999;
  const cut = new Date();
  if (mo < 1) cut.setDate(cut.getDate() - mo * 30);
  else cut.setMonth(cut.getMonth() - mo);
  return data.filter(h => new Date(h.date) >= cut);
}

/* ================================================================
   HOOKS
   ================================================================ */
function useCounter(target, ms = 900) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!target) { setV(0); return; }
    const t0 = performance.now(); let raf;
    const tick = now => {
      const p = Math.min((now - t0) / ms, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const v = localStorage.getItem(key); return v !== null ? JSON.parse(v) : init; }
    catch { return init; }
  });
  const set = useCallback(v => {
    setVal(v);
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key]);
  return [val, set];
}

/* ================================================================
   CHART: Donut (enhanced with hover)
   ================================================================ */
function Donut({ data, total, activeIdx, onHover }) {
  const sz = 200, sw = 26, r = (sz - sw) / 2, C = 2 * Math.PI * r, cx = sz / 2;
  const gapAngle = data.length > 1 ? 0.02 : 0;
  const totalGap = gapAngle * data.length;
  const lastIdx = useRef(-1);

  const handleHover = useCallback((idx) => {
    if (idx !== lastIdx.current && idx >= 0) {
      try { navigator.vibrate?.(8); } catch {}
    }
    lastIdx.current = idx;
    onHover?.(idx);
  }, [onHover]);

  let off = 0;
  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth={sw} />
      {data.map((d, i) => {
        const pct = total > 0 ? d.value / total : 0;
        const segLen = Math.max(pct * (1 - totalGap) * C, 0);
        const gapLen = C - segLen;
        const ro = -90 + (off * (1 - totalGap) + gapAngle * i) * 360;
        off += pct;
        const active = activeIdx === i;
        return (
          <circle key={i} cx={cx} cy={cx} r={r} fill="none" stroke={V[i % V.length]}
            strokeWidth={active ? sw + 6 : sw} strokeDasharray={`${segLen} ${gapLen}`}
            transform={`rotate(${ro} ${cx} ${cx})`}
            style={{ opacity: 0, transition: "all 0.3s ease-out", transitionDelay: `${0.2 + i * 0.07}s`, filter: active ? `drop-shadow(0 0 8px ${V[i % V.length]}60)` : "none" }}
            ref={el => { if (el) requestAnimationFrame(() => { el.style.opacity = activeIdx >= 0 && !active ? 0.4 : 1; }); }}
            onMouseEnter={() => handleHover(i)} onMouseLeave={() => handleHover(-1)}
            onTouchStart={() => handleHover(i)} onTouchEnd={() => handleHover(-1)}
            cursor="pointer"
          />
        );
      })}
    </svg>
  );
}

/* ================================================================
   CHART: Bar Chart (monthly – enhanced)
   ================================================================ */
function BarChart({ data, onHover, activeIdx }) {
  if (!data.length) return null;
  const bw = 32, gap = 10, pT = 36, pB = 32, chartH = 190;
  const tw = data.length * (bw + gap) + gap;
  const svgW = Math.max(tw, 320), svgH = chartH + pT + pB;
  const max = Math.max(...data.map(d => d.total), 1);
  const avg = data.reduce((a, d) => a + d.total, 0) / data.length;
  const avgY = pT + chartH - (avg / max) * chartH;

  return (
    <div className={s.chartScroll}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <defs>
          {data.map((_, i) => (
            <linearGradient key={i} id={`bg${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={V[i % V.length]} stopOpacity="1" />
              <stop offset="100%" stopColor={V[i % V.length]} stopOpacity="0.25" />
            </linearGradient>
          ))}
        </defs>
        {[.25, .5, .75, 1].map(f => (
          <g key={f}>
            <line x1={0} x2={svgW} y1={pT + chartH * (1 - f)} y2={pT + chartH * (1 - f)} stroke="rgba(99,102,241,0.06)" strokeWidth={1} />
            <text x={svgW - 4} y={pT + chartH * (1 - f) - 4} textAnchor="end" fill="#94a3b8" fontSize={9}>{fmt(max * f)}</text>
          </g>
        ))}
        <line x1={0} x2={svgW} y1={avgY} y2={avgY} stroke="#8b5cf680" strokeWidth={1} strokeDasharray="4 4" />
        <text x={4} y={avgY - 4} fill="#8b5cf6" fontSize={9} fontWeight={600}>ממוצע</text>
        {data.map((d, i) => {
          const h = (d.total / max) * chartH, x = gap + i * (bw + gap), y = pT + chartH - h;
          const active = activeIdx === i;
          return (
            <g key={d.month} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(-1)} style={{ cursor: "pointer" }}>
              <rect x={x} y={y} width={bw} height={h} rx={6} fill={`url(#bg${i})`}
                style={{ opacity: active ? 1 : 0.8, transition: "all 0.2s", animation: `cardUp 0.5s ease-out ${0.1 + i * 0.04}s both` }} />
              {active && (
                <>
                  <rect x={x - 2} y={y - 2} width={bw + 4} height={h + 4} rx={8} fill="none" stroke={V[i % V.length]} strokeWidth={1.5} strokeOpacity={0.5} />
                  <rect x={x + bw / 2 - 36} y={y - 32} width={72} height={22} rx={6} fill="#fff" stroke={V[i % V.length] + "30"} strokeWidth={1} />
                  <text x={x + bw / 2} y={y - 17} textAnchor="middle" fill="#1e3a5f" fontSize={11} fontWeight={700}>{fmt(d.total)}</text>
                </>
              )}
              <text x={x + bw / 2} y={svgH - 8} textAnchor="middle" fill={active ? "#4f46e5" : "#64748b"} fontSize={10} fontWeight={600}>{mLbl(d.month)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ================================================================
   CHART: Area Chart (timeline – enhanced)
   ================================================================ */
function AreaChart({ data, onHover, activeIdx }) {
  if (data.length < 2) return null;
  const pL = 10, pR = 10, pT = 28, pB = 10;
  const cW = Math.max(data.length * 18, 320), cH = 130;
  const svgW = cW + pL + pR, svgH = cH + pT + pB;
  const max = Math.max(...data.map(d => d.amount), 1);
  const pts = data.map((d, i) => ({ x: pL + (i / (data.length - 1)) * cW, y: pT + cH - (d.amount / max) * cH }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = line + ` L${pts[pts.length - 1].x},${pT + cH} L${pts[0].x},${pT + cH} Z`;

  return (
    <div className={s.chartScroll}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.3" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="lg" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" /><stop offset="50%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#ag)" style={{ animation: "areaFade 1s ease-out both" }} />
        <path d={line} fill="none" stroke="url(#lg)" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 5000, strokeDashoffset: 5000, animation: "lineReveal 2s ease-out 0.3s forwards" }} />
        {pts.map((p, i) => {
          const active = activeIdx === i;
          return (
            <g key={i} onMouseEnter={() => onHover(i)} onMouseLeave={() => onHover(-1)} style={{ cursor: "pointer" }}>
              <circle cx={p.x} cy={p.y} r={active ? 6 : 3} fill={active ? "#4f46e5" : V[i % V.length]} stroke="#fff" strokeWidth={2}
                style={{ transition: "all 0.15s", animation: `dotPop 0.3s ease-out ${0.5 + i * 0.03}s both` }} />
              <circle cx={p.x} cy={p.y} r={16} fill="transparent" />
              {active && (
                <>
                  <line x1={p.x} y1={pT} x2={p.x} y2={pT + cH} stroke={V[i % V.length]} strokeWidth={0.5} strokeOpacity={0.3} strokeDasharray="3 3" />
                  <rect x={p.x - 44} y={p.y - 42} width={88} height={32} rx={8} fill="#fff" stroke="rgba(99,102,241,0.15)" strokeWidth={1} />
                  <text x={p.x} y={p.y - 28} textAnchor="middle" fill="#94a3b8" fontSize={9}>{fmtShort(data[i].date)}</text>
                  <text x={p.x} y={p.y - 16} textAnchor="middle" fill="#1e3a5f" fontSize={12} fontWeight={700}>{fmt(data[i].amount)}</text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ================================================================
   CHART: Sparkline
   ================================================================ */
function Spark({ data, color }) {
  if (!data || data.length < 2) return null;
  const w = 120, h = 30, max = Math.max(...data, 1);
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - (v / max) * h * 0.85 }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const area = line + ` L${w},${h} L0,${h} Z`;
  const gid = `sp${color.replace('#', '')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className={s.sCardSpark} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" /><stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}

/* ================================================================
   CHART: Heatmap (enhanced – 90 days)
   ================================================================ */
function Heatmap({ history, days = 90 }) {
  const [hoverCell, setHoverCell] = useState(null);
  const dayMap = {};
  history.forEach(h => {
    const key = new Date(h.date).toISOString().slice(0, 10);
    dayMap[key] = (dayMap[key] || 0) + (h.totalPrice || 0);
  });
  const today = new Date();
  const cells = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    const dow = d.getDay();
    cells.push({ date: key, val: dayMap[key] || 0, dow, display: fmtShort(key) });
  }
  const maxVal = Math.max(...cells.map(c => c.val), 1);

  return (
    <div className={s.heatmapWrap}>
      <div className={s.heatDayLabels}>
        {["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"].map(d => <span key={d} className={s.heatDayLbl}>{d}</span>)}
      </div>
      <div className={s.heatmapGrid}>
        {cells.map((c, i) => {
          const intensity = c.val / maxVal;
          const bg = c.val === 0 ? "rgba(99,102,241,0.05)" : `rgba(139,92,246,${0.15 + intensity * 0.75})`;
          const isHover = hoverCell === i;
          return (
            <div key={i} className={`${s.heatCell} ${isHover ? s.heatCellActive : ""}`}
              style={{ background: bg, animationDelay: `${i * 0.008}s` }}
              onMouseEnter={() => setHoverCell(i)} onMouseLeave={() => setHoverCell(null)}>
              {isHover && (
                <div className={s.heatTooltip}>
                  <span className={s.heatTooltipDate}>{c.display}</span>
                  <span className={s.heatTooltipVal}>{c.val > 0 ? fmt(c.val) : "ללא רכישות"}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className={s.heatLabels}>
        <span>לפני {days} יום</span>
        <div className={s.heatScaleRow}>
          <span className={s.heatScaleLbl}>פחות</span>
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
            <div key={v} className={s.heatScaleCell} style={{ background: v === 0 ? "rgba(99,102,241,0.05)" : `rgba(139,92,246,${0.15 + v * 0.75})` }} />
          ))}
          <span className={s.heatScaleLbl}>יותר</span>
        </div>
        <span>היום</span>
      </div>
    </div>
  );
}

/* ================================================================
   CHART: Radar (Day of Week) — NEW
   ================================================================ */
function RadarChart({ data, labels, color = "#8b5cf6" }) {
  const sz = 240, cx = sz / 2, cy = sz / 2;
  const n = data.length;
  const max = Math.max(...data, 1);
  const R = 90;

  const angleFor = i => (Math.PI * 2 * i) / n - Math.PI / 2;
  const ptFor = (i, val) => {
    const a = angleFor(i), r = (val / max) * R;
    return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r };
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const polyPts = data.map((v, i) => ptFor(i, v));
  const polyStr = polyPts.map(p => `${p.x},${p.y}`).join(" ");

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} className={s.radarSvg}>
      <defs>
        <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {rings.map(f => {
        const rr = R * f;
        const pts = Array.from({ length: n }, (_, i) => {
          const a = angleFor(i);
          return `${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`;
        }).join(" ");
        return <polygon key={f} points={pts} fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth={1} />;
      })}
      {Array.from({ length: n }, (_, i) => {
        const a = angleFor(i);
        return <line key={i} x1={cx} y1={cy} x2={cx + Math.cos(a) * R} y2={cy + Math.sin(a) * R} stroke="rgba(99,102,241,0.08)" strokeWidth={1} />;
      })}
      <polygon points={polyStr} fill="url(#radarFill)" stroke={color} strokeWidth={2.5} strokeLinejoin="round"
        style={{ opacity: 0, animation: "areaFade 0.8s ease-out 0.3s forwards" }} />
      {polyPts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={4} fill={color} stroke="#fff" strokeWidth={2}
          style={{ animation: `dotPop 0.3s ease-out ${0.5 + i * 0.06}s both` }} />
      ))}
      {labels.map((lbl, i) => {
        const a = angleFor(i), lr = R + 22;
        const lx = cx + Math.cos(a) * lr, ly = cy + Math.sin(a) * lr;
        return (
          <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={12} fontWeight={600}>
            {lbl}
          </text>
        );
      })}
      {data.map((v, i) => {
        const p = ptFor(i, v);
        return v > 0 && (
          <text key={`v${i}`} x={p.x} y={p.y - 12} textAnchor="middle" fill="#1e3a5f" fontSize={10} fontWeight={700}
            style={{ opacity: 0, animation: `areaFade 0.3s ease-out ${0.8 + i * 0.05}s forwards` }}>
            {fmt(v)}
          </text>
        );
      })}
    </svg>
  );
}

/* ================================================================
   CHART: Horizontal Bar — NEW
   ================================================================ */
function HBar({ items, maxVal, fmtVal = fmt, barH = 28, gap = 8 }) {
  if (!items.length) return null;
  return (
    <div className={s.hbarList}>
      {items.map((item, i) => {
        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <div key={item.label} className={s.hbarRow} style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
            <div className={s.hbarLabel}>
              <span className={s.hbarRank} style={{ background: i < 3 ? V[i] + "30" : "rgba(99,102,241,0.08)", color: i < 3 ? V[i] : "#64748b" }}>{i + 1}</span>
              <span className={s.hbarName}>{item.label}</span>
            </div>
            <div className={s.hbarTrack}>
              <div className={s.hbarFill} style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${V[i % V.length]}, ${V[i % V.length]}80)`, animationDelay: `${0.3 + i * 0.06}s` }} />
            </div>
            <span className={s.hbarVal}>{fmtVal(item.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

/* ================================================================
   CHART: Gauge (Budget) — NEW
   ================================================================ */
function Gauge({ value, max, color = "#8b5cf6" }) {
  const pct = max > 0 ? Math.min(value / max, 1.5) : 0;
  const sz = 180, sw = 14, r = (sz - sw * 2) / 2;
  const circumHalf = Math.PI * r;
  const dash = pct * circumHalf;
  const overBudget = pct > 1;
  const displayColor = overBudget ? "#ef4444" : color;

  return (
    <div className={s.gaugeWrap}>
      <svg width={sz} height={sz / 2 + 20} viewBox={`0 0 ${sz} ${sz / 2 + 20}`}>
        <path d={`M ${sw} ${sz / 2 + 4} A ${r} ${r} 0 0 1 ${sz - sw} ${sz / 2 + 4}`}
          fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth={sw} strokeLinecap="round" />
        <path d={`M ${sw} ${sz / 2 + 4} A ${r} ${r} 0 0 1 ${sz - sw} ${sz / 2 + 4}`}
          fill="none" stroke={displayColor} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${dash} ${circumHalf}`}
          style={{ transition: "stroke-dasharray 1s ease-out, stroke 0.3s", filter: `drop-shadow(0 0 6px ${displayColor}40)` }} />
      </svg>
      <div className={s.gaugeCenter}>
        <span className={s.gaugeVal} style={{ color: displayColor }}>{Math.round(pct * 100)}%</span>
        <span className={s.gaugeLbl}>{overBudget ? "חריגה מהתקציב!" : "מהתקציב החודשי"}</span>
      </div>
    </div>
  );
}

/* ================================================================
   CHART: Mini Stacked Bars (category over time) — NEW
   ================================================================ */
function StackedBars({ data, categories, maxVal }) {
  if (!data.length) return null;
  const bw = 28, gap = 6, pT = 8, pB = 24;
  const chartH = 140;
  const tw = data.length * (bw + gap) + gap;
  const svgW = Math.max(tw, 300), svgH = chartH + pT + pB;

  return (
    <div className={s.chartScroll}>
      <svg width={svgW} height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
        {data.map((d, i) => {
          const x = gap + i * (bw + gap);
          let yOff = pT + chartH;
          return (
            <g key={d.month}>
              {categories.map((cat, ci) => {
                const val = d[cat] || 0;
                const h = maxVal > 0 ? (val / maxVal) * chartH : 0;
                yOff -= h;
                return h > 0 && (
                  <rect key={cat} x={x} y={yOff} width={bw} height={h} rx={ci === categories.length - 1 ? 4 : 0}
                    fill={V[ci % V.length]} opacity={0.8}
                    style={{ animation: `cardUp 0.5s ease-out ${0.1 + i * 0.04}s both` }}>
                    <title>{cat}: {fmt(val)}</title>
                  </rect>
                );
              })}
              <text x={x + bw / 2} y={svgH - 4} textAnchor="middle" fill="#475569" fontSize={9} fontWeight={600}>{mLbl(d.month)}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ================================================================
   SECTION HEADER
   ================================================================ */
function SH({ icon, bg, title, badge, action }) {
  return (
    <div className={s.secHead}>
      <div className={s.secTitleRow}>
        <div className={s.secIcon} style={{ background: bg }}>{icon}</div>
        <h2 className={s.secTitle}>{title}</h2>
      </div>
      <div className={s.secHeadRight}>
        {badge && <span className={s.secBadge}>{badge}</span>}
        {action}
      </div>
    </div>
  );
}

/* ================================================================
   MAIN DASHBOARD
   ================================================================ */
export default function AdvancedStatsDashboard() {
  const navigate = useNavigate();
  const contentRef = useRef(null);

  /* ── State ─────────────────────────────────────────────── */
  const [rawHistory, setRawHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedChains, setSelectedChains] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [appliedChains, setAppliedChains] = useState([]);
  const [appliedCities, setAppliedCities] = useState([]);
  const [barHover, setBarHover] = useState(-1);
  const [areaHover, setAreaHover] = useState(-1);
  const [donutHover, setDonutHover] = useState(-1);
  const [prodSort, setProdSort] = useState("amount");
  const [prodSortDir, setProdSortDir] = useState("desc");
  const [prodSearch, setProdSearch] = useState("");
  const [prodPage, setProdPage] = useState(0);
  const [storeSort, setStoreSort] = useState("total");
  const [budget, setBudget] = useLocalStorage("statsBudget", 0);
  const [budgetEditing, setBudgetEditing] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [expandedRecent, setExpandedRecent] = useState(null);
  const PRODS_PER_PAGE = 15;

  /* ── Fetch ─────────────────────────────────────────────── */
  useEffect(() => {
    axios.get(`${DOMAIN}/api/v1/history/`)
      .then(r => setRawHistory(r.data.data.history || []))
      .catch(e => console.error("Fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  /* ── Computed: available chains & cities ─────────────── */
  const allChains = useMemo(() => {
    const set = new Set();
    rawHistory.forEach(h => set.add(getChain(h.supermarketName)));
    return [...set].sort();
  }, [rawHistory]);

  const allCities = useMemo(() => {
    const set = new Set();
    rawHistory.forEach(h => {
      if (h.supermarketCity) set.add(h.supermarketCity);
    });
    return [...set].sort();
  }, [rawHistory]);

  /* ── Filtered history ────────────────────────────────── */
  const history = useMemo(() => {
    let d = byPeriod(rawHistory, period);
    if (appliedDateFrom) d = d.filter(h => new Date(h.date) >= new Date(appliedDateFrom));
    if (appliedDateTo) d = d.filter(h => new Date(h.date) <= new Date(appliedDateTo + "T23:59:59"));
    if (appliedChains.length) d = d.filter(h => appliedChains.includes(getChain(h.supermarketName)));
    if (appliedCities.length) d = d.filter(h => appliedCities.includes(h.supermarketCity));
    return d;
  }, [rawHistory, period, appliedDateFrom, appliedDateTo, appliedChains, appliedCities]);

  const hasFilters = appliedDateFrom || appliedDateTo || appliedChains.length > 0 || appliedCities.length > 0;
  const activeFilterCount = (appliedDateFrom || appliedDateTo ? 1 : 0) + appliedChains.length + appliedCities.length;

  /* ── Filter actions ────────────────────────────────────── */
  const toggleChain = useCallback(c => setSelectedChains(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]), []);
  const toggleCity = useCallback(c => setSelectedCities(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]), []);

  const applyFilters = useCallback(() => {
    setAppliedDateFrom(dateFrom); setAppliedDateTo(dateTo);
    setAppliedChains([...selectedChains]); setAppliedCities([...selectedCities]);
    setFiltersOpen(false);
  }, [dateFrom, dateTo, selectedChains, selectedCities]);

  const resetFilters = useCallback(() => {
    setDateFrom(""); setDateTo(""); setSelectedChains([]); setSelectedCities([]);
    setAppliedDateFrom(""); setAppliedDateTo(""); setAppliedChains([]); setAppliedCities([]);
  }, []);

  const removeChainFilter = useCallback(c => {
    setAppliedChains(p => p.filter(x => x !== c));
    setSelectedChains(p => p.filter(x => x !== c));
  }, []);

  const removeCityFilter = useCallback(c => {
    setAppliedCities(p => p.filter(x => x !== c));
    setSelectedCities(p => p.filter(x => x !== c));
  }, []);

  const removeDateFilter = useCallback(() => {
    setDateFrom(""); setDateTo(""); setAppliedDateFrom(""); setAppliedDateTo("");
  }, []);

  /* ── Stats computation (MASSIVE) ──────────────────────── */
  const stats = useMemo(() => {
    if (!history.length) return null;

    // Basic totals
    const totalSpent = history.reduce((a, h) => a + (h.totalPrice || 0), 0);
    const totalItems = history.reduce((a, h) => a + h.products.reduce((b, p) => b + (p.amount || 0), 0), 0);
    const avg = totalSpent / history.length;
    const uniq = new Set();
    history.forEach(h => h.products.forEach(p => uniq.add(p.generalName || p.name)));

    // Monthly aggregation
    const mm = {};
    history.forEach(h => {
      const k = new Date(h.date).toISOString().slice(0, 7);
      mm[k] = (mm[k] || 0) + (h.totalPrice || 0);
    });
    const monthly = Object.entries(mm).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total }));

    // Trend
    let trend = 0;
    if (monthly.length >= 2) {
      const l = monthly[monthly.length - 1].total, p = monthly[monthly.length - 2].total;
      trend = p > 0 ? ((l - p) / p) * 100 : 0;
    }

    // Monthly sparklines
    const monthlyTotals = monthly.map(m => m.total);
    const miMap = {};
    history.forEach(h => { const k = new Date(h.date).toISOString().slice(0, 7); miMap[k] = (miMap[k] || 0) + h.products.reduce((a, p) => a + (p.amount || 0), 0); });
    const monthlyItems = Object.entries(miMap).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);
    const mpMap = {};
    history.forEach(h => { const k = new Date(h.date).toISOString().slice(0, 7); mpMap[k] = (mpMap[k] || 0) + 1; });
    const monthlyPurchases = Object.entries(mpMap).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v);

    // Categories
    const cm = {};
    history.forEach(h => h.products.forEach(p => {
      const c = p.category || "אחר";
      cm[c] = (cm[c] || 0) + (p.totalPrice || 0);
    }));
    const catData = Object.entries(cm).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
    const catTotal = catData.reduce((a, c) => a + c.value, 0);
    const catNames = catData.map(c => c.name);

    // Category over time (for stacked chart)
    const catMonthly = {};
    history.forEach(h => {
      const k = new Date(h.date).toISOString().slice(0, 7);
      if (!catMonthly[k]) catMonthly[k] = {};
      h.products.forEach(p => {
        const c = p.category || "אחר";
        if (catNames.includes(c)) catMonthly[k][c] = (catMonthly[k][c] || 0) + (p.totalPrice || 0);
      });
    });
    const catOverTime = Object.entries(catMonthly).sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cats]) => ({ month, ...cats }));
    const catOverTimeMax = Math.max(...catOverTime.map(d => catNames.reduce((a, c) => a + (d[c] || 0), 0)), 1);

    // Products
    const pa = {}, ps = {}, pCat = {}, pFreq = {};
    history.forEach(h => h.products.forEach(p => {
      const k = p.generalName || p.name;
      pa[k] = (pa[k] || 0) + (p.amount || 0);
      ps[k] = (ps[k] || 0) + (p.totalPrice || 0);
      if (!pCat[k]) pCat[k] = p.category || "אחר";
      pFreq[k] = (pFreq[k] || 0) + 1;
    }));
    const prods = Object.entries(pa).map(([name, amount]) => ({
      name, amount, spent: ps[name] || 0, category: pCat[name] || "אחר",
      frequency: pFreq[name] || 0, avgPrice: amount > 0 ? (ps[name] || 0) / amount : 0,
    }));
    const topByAmt = [...prods].sort((a, b) => b.amount - a.amount).slice(0, 7);
    const topBySpend = [...prods].sort((a, b) => b.spent - a.spent).slice(0, 7);
    const maxA = topByAmt[0]?.amount || 1, maxS = topBySpend[0]?.spent || 1;

    // Supermarkets
    const chm = {}, chv = {}, chItems = {}, chCities = {};
    history.forEach(h => {
      const c = getChain(h.supermarketName);
      chm[c] = (chm[c] || 0) + (h.totalPrice || 0);
      chv[c] = (chv[c] || 0) + 1;
      chItems[c] = (chItems[c] || 0) + h.products.reduce((a, p) => a + (p.amount || 0), 0);
      if (h.supermarketCity && !chCities[c]) chCities[c] = new Set();
      if (h.supermarketCity) chCities[c].add(h.supermarketCity);
    });
    const maxCh = Math.max(...Object.values(chm), 1);
    const smData = Object.entries(chm).map(([name, total]) => ({
      name, total, visits: chv[name] || 0, pct: (total / maxCh) * 100,
      avg: total / (chv[name] || 1), items: chItems[name] || 0,
      avgItems: Math.round((chItems[name] || 0) / (chv[name] || 1)),
      cities: chCities[name] ? [...chCities[name]] : [],
    })).sort((a, b) => b.total - a.total);

    // Day of week analysis
    const dow = [0, 0, 0, 0, 0, 0, 0], dowCount = [0, 0, 0, 0, 0, 0, 0];
    history.forEach(h => {
      const d = new Date(h.date).getDay();
      dow[d] += h.totalPrice || 0;
      dowCount[d] += 1;
    });
    const dowAvg = dow.map((v, i) => dowCount[i] > 0 ? v / dowCount[i] : 0);
    const busiestDay = dow.indexOf(Math.max(...dow));
    const quietestDay = dow.indexOf(Math.min(...dow.map((v, i) => dowCount[i] > 0 ? v : Infinity)));

    // Weekly pattern
    const weekMap = {};
    history.forEach(h => {
      const d = new Date(h.date);
      const weekStart = new Date(d); weekStart.setDate(d.getDate() - d.getDay());
      const k = weekStart.toISOString().slice(0, 10);
      weekMap[k] = (weekMap[k] || 0) + (h.totalPrice || 0);
    });
    const weeklyData = Object.entries(weekMap).sort(([a], [b]) => a.localeCompare(b))
      .map(([week, total]) => ({ week, total }));

    // City breakdown
    const cityMap = {};
    history.forEach(h => {
      const city = h.supermarketCity || "לא ידוע";
      cityMap[city] = (cityMap[city] || 0) + (h.totalPrice || 0);
    });
    const cityData = Object.entries(cityMap).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
    const cityMax = cityData[0]?.value || 1;

    // Recent purchases
    const recent = [...history].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8);

    // Timeline
    const timeline = [...history].sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(h => ({ date: h.date, amount: h.totalPrice || 0, store: h.supermarketName || "", city: h.supermarketCity || "" }));

    // Insights data
    const dates = history.map(h => new Date(h.date)).sort((a, b) => a - b);
    let avgDays = 0;
    if (dates.length >= 2) avgDays = Math.round((dates[dates.length - 1] - dates[0]) / (1000 * 60 * 60 * 24) / (dates.length - 1));
    const most = Math.max(...history.map(h => h.totalPrice || 0));
    const least = Math.min(...history.map(h => h.totalPrice || 0));
    const mostDate = history.find(h => h.totalPrice === most);
    const leastDate = history.find(h => h.totalPrice === least);

    // Comparison
    let compCurrent = 0, compPrev = 0;
    if (monthly.length >= 2) { compCurrent = monthly[monthly.length - 1].total; compPrev = monthly[monthly.length - 2].total; }

    // Basket analysis
    const basketSizes = history.map(h => h.products.length);
    const avgBasket = basketSizes.reduce((a, b) => a + b, 0) / basketSizes.length;
    const maxBasket = Math.max(...basketSizes);
    const minBasket = Math.min(...basketSizes);

    // Price distribution
    const priceBuckets = { "0-50": 0, "50-100": 0, "100-200": 0, "200-400": 0, "400+": 0 };
    history.forEach(h => {
      const p = h.totalPrice || 0;
      if (p < 50) priceBuckets["0-50"]++;
      else if (p < 100) priceBuckets["50-100"]++;
      else if (p < 200) priceBuckets["100-200"]++;
      else if (p < 400) priceBuckets["200-400"]++;
      else priceBuckets["400+"]++;
    });
    const priceDist = Object.entries(priceBuckets).map(([range, count]) => ({ range, count }));
    const priceDistMax = Math.max(...priceDist.map(d => d.count), 1);

    // Current month spending (for budget)
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const currentMonthSpent = mm[currentMonth] || 0;

    return {
      totalSpent, totalItems, totalPurchases: history.length, avg, uniqueProducts: uniq.size,
      monthly, monthlyTotals, monthlyItems, monthlyPurchases, trend,
      catData, catTotal, catNames, catOverTime, catOverTimeMax,
      prods, topByAmt, topBySpend, maxA, maxS,
      smData, recent, timeline,
      dow, dowAvg, dowCount, busiestDay, quietestDay,
      weeklyData,
      cityData, cityMax,
      avgDays, most, least, mostDate, leastDate,
      compCurrent, compPrev,
      avgBasket, maxBasket, minBasket,
      priceDist, priceDistMax,
      currentMonthSpent,
    };
  }, [history]);

  /* ── Smart Insights Generator ─────────────────────────── */
  const insights = useMemo(() => {
    if (!stats) return [];
    const ins = [];

    if (stats.trend !== 0) {
      const dir = stats.trend > 0 ? "עלו" : "ירדו";
      const emoji = stats.trend > 0 ? "📈" : "📉";
      ins.push({ icon: <I.TrendUp color={stats.trend > 0 ? "#ef4444" : "#10b981"} />, bg: stats.trend > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)", text: `ההוצאות ${dir} ב-${Math.abs(Math.round(stats.trend))}% בחודש האחרון`, type: stats.trend > 0 ? "warning" : "success" });
    }

    if (stats.busiestDay !== undefined) {
      ins.push({ icon: <I.Calendar color="#8b5cf6" />, bg: "rgba(139,92,246,0.1)", text: `היום הכי יקר: יום ${dayName(stats.busiestDay)} (${fmt(stats.dow[stats.busiestDay])})`, type: "info" });
    }

    if (stats.smData.length >= 2) {
      const cheapest = [...stats.smData].sort((a, b) => a.avg - b.avg)[0];
      ins.push({ icon: <I.Store color="#10b981" />, bg: "rgba(16,185,129,0.1)", text: `הממוצע הכי נמוך: ${cheapest.name} (${fmt(cheapest.avg)} לרכישה)`, type: "success" });
    }

    if (stats.catData.length > 0) {
      const topCat = stats.catData[0];
      const pct = Math.round((topCat.value / stats.catTotal) * 100);
      ins.push({ icon: <I.Pie color="#f59e0b" />, bg: "rgba(245,158,11,0.1)", text: `${topCat.name} מהווה ${pct}% מההוצאות שלך`, type: "info" });
    }

    if (stats.avgDays > 0) {
      ins.push({ icon: <I.Repeat color="#06b6d4" />, bg: "rgba(6,182,212,0.1)", text: `תדירות קניות: כל ${stats.avgDays} ימים בממוצע`, type: "info" });
    }

    if (stats.avgBasket > 0) {
      ins.push({ icon: <I.Cart color="#ec4899" />, bg: "rgba(236,72,153,0.1)", text: `סל ממוצע: ${Math.round(stats.avgBasket)} מוצרים, ${fmt(stats.avg)}`, type: "info" });
    }

    if (stats.prods.length > 0) {
      const topProd = stats.prods.sort((a, b) => b.frequency - a.frequency)[0];
      ins.push({ icon: <I.Star color="#f59e0b" />, bg: "rgba(245,158,11,0.1)", text: `המוצר הכי תכוף: ${topProd.name} (${topProd.frequency} רכישות)`, type: "info" });
    }

    if (stats.cityData.length > 1) {
      ins.push({ icon: <I.Map color="#3b82f6" />, bg: "rgba(59,130,246,0.1)", text: `קונה ב-${stats.cityData.length} ערים שונות`, type: "info" });
    }

    return ins;
  }, [stats]);

  /* ── Animated counters ─────────────────────────────────── */
  const cSpent = useCounter(stats?.totalSpent || 0);
  const cItems = useCounter(stats?.totalItems || 0);
  const cPurch = useCounter(stats?.totalPurchases || 0);
  const cUniq = useCounter(stats?.uniqueProducts || 0);

  /* ── Product search & sort ─────────────────────────────── */
  const filteredProds = useMemo(() => {
    if (!stats) return [];
    let list = [...stats.prods];
    if (prodSearch) {
      const q = prodSearch.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }
    const dir = prodSortDir === "desc" ? -1 : 1;
    list.sort((a, b) => {
      if (prodSort === "amount") return (b.amount - a.amount) * dir;
      if (prodSort === "spent") return (b.spent - a.spent) * dir;
      if (prodSort === "frequency") return (b.frequency - a.frequency) * dir;
      if (prodSort === "avgPrice") return (b.avgPrice - a.avgPrice) * dir;
      return (a.name.localeCompare(b.name)) * dir;
    });
    return list;
  }, [stats, prodSearch, prodSort, prodSortDir]);

  const prodPages = Math.ceil(filteredProds.length / PRODS_PER_PAGE);
  const pagedProds = filteredProds.slice(prodPage * PRODS_PER_PAGE, (prodPage + 1) * PRODS_PER_PAGE);

  /* ── Store sort ──────────────────────────────────────── */
  const sortedStores = useMemo(() => {
    if (!stats) return [];
    return [...stats.smData].sort((a, b) => {
      if (storeSort === "total") return b.total - a.total;
      if (storeSort === "visits") return b.visits - a.visits;
      if (storeSort === "avg") return b.avg - a.avg;
      if (storeSort === "items") return b.items - a.items;
      return b.total - a.total;
    });
  }, [stats, storeSort]);

  /* ── Tab change ────────────────────────────────────────── */
  const switchTab = useCallback(t => {
    setTab(t);
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, []);

  /* ── Budget submit ─────────────────────────────────────── */
  const submitBudget = useCallback(() => {
    const val = parseFloat(budgetInput);
    if (val > 0) setBudget(val);
    setBudgetEditing(false);
    setBudgetInput("");
  }, [budgetInput, setBudget]);

  /* ── Loading ────────────────────────────────────────────── */
  if (loading) return (
    <div className={s.loading}>
      <div className={s.loadRing} /><div className={s.loadRing2} />
      <div className={s.loadText}>
        <span className={s.loadDots}><span className={s.loadDot} /><span className={s.loadDot} /><span className={s.loadDot} /></span>
        טוען נתונים
      </div>
    </div>
  );

  if (!rawHistory.length) return (
    <div className={s.empty}>
      <div className={s.emptyIcon}><I.BarChart color="#8b5cf6" /></div>
      <h2 className={s.emptyTitle}>אין נתונים עדיין</h2>
      <p className={s.emptyText}>בצע רכישות כדי לראות את הסטטיסטיקות שלך</p>
      <button className={s.backBtn} onClick={() => navigate(-1)}>חזרה</button>
    </div>
  );

  if (!stats) return (
    <div className={s.empty}>
      <div className={s.emptyIcon}><I.Filter color="#8b5cf6" /></div>
      <h2 className={s.emptyTitle}>אין תוצאות</h2>
      <p className={s.emptyText}>נסה לשנות את הפילטרים</p>
      <button className={s.filterBtnReset} onClick={resetFilters} style={{ margin: "16px auto" }}>אפס פילטרים</button>
      <button className={s.backBtn} onClick={() => navigate(-1)}>חזרה</button>
    </div>
  );

  const topProds = prodSort === "amount" ? stats.topByAmt : stats.topBySpend;
  const topMax = prodSort === "amount" ? stats.maxA : stats.maxS;

  /* ════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════ */
  return (
    <div className={s.page}>
      {/* ── HEADER ──────────────────────────────────────── */}
      <div className={s.header}>
        <div className={s.headerTop}>
          <div>
            <h1 className={s.headerTitle}>דשבורד סטטיסטיקות</h1>
            <p className={s.headerSub}>{stats.totalPurchases} רכישות · {stats.uniqueProducts} מוצרים · {allCities.length > 0 ? `${allCities.length} ערים` : ""}</p>
          </div>
          <div className={s.headerActions}>
            <button className={`${s.headerBtn} ${filtersOpen ? s.headerBtnActive : ""}`} onClick={() => setFiltersOpen(!filtersOpen)}>
              <I.Filter style={{ width: 16, height: 16 }} />
              {activeFilterCount > 0 && <span className={s.filterBadge}>{activeFilterCount}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* ── FILTER PANEL ────────────────────────────────── */}
      <div className={`${s.filterBar} ${filtersOpen ? s.filterBarOpen : ""}`}>
        <div className={s.filterSection}>
          <p className={s.filterLabel}><I.Calendar style={{ width: 12, height: 12 }} /> טווח תאריכים</p>
          <div className={s.filterRow}>
            <div className={s.dateWrap}>
              <input type="date" className={s.dateInput} value={dateFrom} onChange={e => setDateFrom(e.target.value)} placeholder="מתאריך" />
              <span className={s.dateHint}>מ-</span>
            </div>
            <span className={s.dateSep}>—</span>
            <div className={s.dateWrap}>
              <input type="date" className={s.dateInput} value={dateTo} onChange={e => setDateTo(e.target.value)} placeholder="עד תאריך" />
              <span className={s.dateHint}>עד</span>
            </div>
          </div>
        </div>

        {allCities.length > 0 && (
          <div className={s.filterSection}>
            <p className={s.filterLabel}><I.Map style={{ width: 12, height: 12 }} /> ערים ומיקומים</p>
            <div className={s.chainChips}>
              {allCities.map(c => (
                <button key={c} className={`${s.chainChip} ${s.cityChip} ${selectedCities.includes(c) ? s.chainChipActive : ""}`} onClick={() => toggleCity(c)}>
                  <I.Map style={{ width: 10, height: 10 }} /> {c}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={s.filterSection}>
          <p className={s.filterLabel}><I.Store style={{ width: 12, height: 12 }} /> רשתות</p>
          <div className={s.chainChips}>
            {allChains.map(c => (
              <button key={c} className={`${s.chainChip} ${selectedChains.includes(c) ? s.chainChipActive : ""}`} onClick={() => toggleChain(c)}>{c}</button>
            ))}
          </div>
        </div>

        <div className={s.filterActions}>
          <button className={s.filterBtnApply} onClick={applyFilters}>
            <I.Filter style={{ width: 14, height: 14 }} /> החל פילטרים
          </button>
          <button className={s.filterBtnReset} onClick={() => { resetFilters(); setFiltersOpen(false); }}>
            <I.X style={{ width: 14, height: 14 }} /> אפס
          </button>
        </div>
      </div>

      {/* ── ACTIVE FILTERS ──────────────────────────────── */}
      {hasFilters && (
        <div className={s.activeFiltersBar}>
          <span className={s.activeFiltersLabel}>פילטרים פעילים:</span>
          {(appliedDateFrom || appliedDateTo) && (
            <span className={s.activeFilterTag}>
              <I.Calendar style={{ width: 10, height: 10 }} />
              {appliedDateFrom || "..."} — {appliedDateTo || "..."}
              <button className={s.activeFilterRemove} onClick={removeDateFilter}>×</button>
            </span>
          )}
          {appliedCities.map(c => (
            <span key={`city-${c}`} className={`${s.activeFilterTag} ${s.cityTag}`}>
              <I.Map style={{ width: 10, height: 10 }} /> {c}
              <button className={s.activeFilterRemove} onClick={() => removeCityFilter(c)}>×</button>
            </span>
          ))}
          {appliedChains.map(c => (
            <span key={`chain-${c}`} className={s.activeFilterTag}>
              <I.Store style={{ width: 10, height: 10 }} /> {c}
              <button className={s.activeFilterRemove} onClick={() => removeChainFilter(c)}>×</button>
            </span>
          ))}
          <button className={s.clearAllBtn} onClick={resetFilters}>נקה הכל</button>
        </div>
      )}

      {/* ── PERIOD TABS ─────────────────────────────────── */}
      <div className={s.periodTabs}>
        {PERIODS.map(p => (
          <button key={p.key} className={`${s.periodTab} ${period === p.key ? s.periodTabActive : ""}`} onClick={() => setPeriod(p.key)}>{p.label}</button>
        ))}
      </div>

      {/* ── MAIN TAB BAR ────────────────────────────────── */}
      <div className={s.tabBar}>
        {TABS.map(t => (
          <button key={t.key} className={`${s.tabBtn} ${tab === t.key ? s.tabBtnActive : ""}`} onClick={() => switchTab(t.key)}>
            <t.Ico style={{ width: 16, height: 16 }} />
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* ── SUMMARY CARDS (always visible) ──────────────── */}
      <div className={s.summaryScroll}>
        {[
          { icon: <I.Wallet />, val: `₪${cSpent.toLocaleString()}`, label: "סה\"כ הוצאות", theme: THEMES[0], trend: stats.trend, spark: stats.monthlyTotals, sparkColor: "#8b5cf6" },
          { icon: <I.Cart />, val: cPurch, label: "רכישות", theme: THEMES[1], spark: stats.monthlyPurchases, sparkColor: "#06b6d4" },
          { icon: <I.Package />, val: cItems.toLocaleString(), label: "פריטים שנקנו", theme: THEMES[2], spark: stats.monthlyItems, sparkColor: "#10b981" },
          { icon: <I.Tag />, val: cUniq, label: "מוצרים ייחודיים", theme: THEMES[3], sparkColor: "#a855f7" },
        ].map((c, i) => (
          <div key={i} className={s.sCard} style={{ background: c.theme.bg, animationDelay: `${i * 0.06}s` }}>
            <div className={s.sCardShine} />
            <div className={s.sCardIcon}>{c.icon}</div>
            <p className={s.sCardVal}>{c.val}</p>
            <p className={s.sCardLabel}>{c.label}</p>
            {c.trend !== undefined && c.trend !== 0 && (
              <span className={`${s.sCardTrend} ${c.trend > 0 ? s.trendUp : s.trendDown}`}>
                {c.trend > 0 ? "▲" : "▼"} {Math.abs(Math.round(c.trend))}%
              </span>
            )}
            {c.spark && <Spark data={c.spark} color={c.sparkColor} />}
          </div>
        ))}
      </div>

      {/* ── TAB CONTENT ─────────────────────────────────── */}
      <div className={s.content} ref={contentRef}>

        {/* ════════════════════════════════════════════════
           TAB: OVERVIEW
           ════════════════════════════════════════════════ */}
        {tab === "overview" && (
          <>
            {/* Comparison Banner */}
            {stats.monthly.length >= 2 && (
              <div className={s.compBanner}>
                <div className={s.compCard} style={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.15)" }}>
                  <p className={s.compLabel}>חודש נוכחי</p>
                  <p className={s.compVal}>{fmt(stats.compCurrent)}</p>
                  <p className={s.compSub} style={{ color: stats.trend > 0 ? "#fb7185" : "#34d399" }}>
                    {stats.trend > 0 ? "▲" : "▼"} {Math.abs(Math.round(stats.trend))}% מהחודש הקודם
                  </p>
                </div>
                <div className={s.compCard} style={{ background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.15)" }}>
                  <p className={s.compLabel}>חודש קודם</p>
                  <p className={s.compVal}>{fmt(stats.compPrev)}</p>
                  <p className={s.compSub} style={{ color: "#64748b" }}>ממוצע: {fmt(stats.avg)}</p>
                </div>
              </div>
            )}

            {/* Monthly Bars */}
            <div className={s.section}>
              <SH icon={<I.TrendUp color="#8b5cf6" />} bg="rgba(139,92,246,0.12)" title="הוצאות חודשיות" badge={`${stats.monthly.length} חודשים`} />
              <BarChart data={stats.monthly} onHover={setBarHover} activeIdx={barHover} />
            </div>

            {/* Heatmap */}
            <div className={s.section}>
              <SH icon={<I.Grid color="#f59e0b" />} bg="rgba(245,158,11,0.12)" title="מפת חום — 90 יום אחרונים" badge="יומי" />
              <Heatmap history={rawHistory} />
            </div>

            {/* Categories Donut */}
            <div className={s.section}>
              <SH icon={<I.Pie color="#06b6d4" />} bg="rgba(6,182,212,0.12)" title="הוצאות לפי קטגוריה" badge={`${stats.catData.length} קטגוריות`} />
              <div className={s.donutWrap}>
                <div className={s.donutSvgWrap}>
                  <Donut data={stats.catData} total={stats.catTotal} activeIdx={donutHover} onHover={setDonutHover} />
                  <div className={s.donutCenter}>
                    <span className={s.donutCenterVal}>{donutHover >= 0 ? fmt(stats.catData[donutHover]?.value || 0) : fmt(stats.catTotal)}</span>
                    <span className={s.donutCenterLbl}>{donutHover >= 0 ? stats.catData[donutHover]?.name : "סה\"כ"}</span>
                  </div>
                </div>
                <div className={s.legend}>
                  {stats.catData.map((c, i) => (
                    <div key={c.name} className={`${s.legendRow} ${donutHover === i ? s.legendRowActive : ""}`}
                      style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                      onMouseEnter={() => setDonutHover(i)} onMouseLeave={() => setDonutHover(-1)}>
                      <div className={s.legendDot} style={{ background: V[i % V.length] }} />
                      <span className={s.legendName}>{c.name}</span>
                      <span className={s.legendPct}>{Math.round(c.value / stats.catTotal * 100)}%</span>
                      <span className={s.legendVal}>{fmt(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Insights */}
            {insights.length > 0 && (
              <div className={s.section}>
                <SH icon={<I.Zap color="#f59e0b" />} bg="rgba(245,158,11,0.12)" title="תובנות חכמות" badge={`${insights.length} תובנות`} />
                <div className={s.smartInsights}>
                  {insights.slice(0, 4).map((ins, i) => (
                    <div key={i} className={s.smartInsCard} style={{ background: ins.bg, animationDelay: `${0.2 + i * 0.06}s` }}>
                      <div className={s.smartInsIcon}>{ins.icon}</div>
                      <p className={s.smartInsText}>{ins.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Purchases */}
            <div className={s.section}>
              <SH icon={<I.Clock color="#a855f7" />} bg="rgba(168,85,247,0.12)" title="רכישות אחרונות" badge={`אחרונות ${stats.recent.length}`} />
              <div className={s.recList}>
                {stats.recent.map((r, i) => (
                  <div key={r._id || i} className={s.recCard} style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
                    <div className={s.recRow} onClick={() => setExpandedRecent(expandedRecent === r._id ? null : r._id)}>
                      <div className={s.recIcon} style={{ background: `${V[i % V.length]}15` }}><I.Receipt color={V[i % V.length]} /></div>
                      <div className={s.recInfo}>
                        <p className={s.recStore}>{r.supermarketName}</p>
                        <p className={s.recDate}>{fmtD(r.date)}{r.supermarketCity ? ` · ${r.supermarketCity}` : ""}</p>
                      </div>
                      <div className={s.recRight}>
                        <p className={s.recPrice}>{fmt(r.totalPrice)}</p>
                        <p className={s.recItems}>{r.products.length} מוצרים</p>
                      </div>
                      <I.ChevDown style={{ width: 14, height: 14, color: "#475569", transition: "transform 0.2s", transform: expandedRecent === r._id ? "rotate(180deg)" : "rotate(0)" }} />
                    </div>
                    {expandedRecent === r._id && (
                      <div className={s.recExpanded}>
                        {r.products.slice(0, 12).map((p, pi) => (
                          <div key={pi} className={s.recProdRow}>
                            <span className={s.recProdName}>{p.generalName || p.name}</span>
                            <span className={s.recProdQty}>×{p.amount || 1}</span>
                            <span className={s.recProdPrice}>{fmt(p.totalPrice || 0)}</span>
                          </div>
                        ))}
                        {r.products.length > 12 && <p className={s.recMore}>+{r.products.length - 12} מוצרים נוספים</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════
           TAB: SPENDING ANALYSIS
           ════════════════════════════════════════════════ */}
        {tab === "spending" && (
          <>
            {/* Budget Tracker */}
            <div className={s.section}>
              <SH icon={<I.Target color="#8b5cf6" />} bg="rgba(139,92,246,0.12)" title="תקציב חודשי"
                badge={budget > 0 ? `${fmt(budget)}` : "לא הוגדר"}
                action={
                  <button className={s.secTabBtn} onClick={() => { setBudgetEditing(!budgetEditing); setBudgetInput(budget > 0 ? String(budget) : ""); }}>
                    {budgetEditing ? "ביטול" : "הגדר"}
                  </button>
                }
              />
              {budgetEditing && (
                <div className={s.budgetInputRow}>
                  <input type="number" className={s.budgetInput} placeholder="סכום תקציב חודשי" value={budgetInput}
                    onChange={e => setBudgetInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submitBudget()} />
                  <button className={s.budgetSaveBtn} onClick={submitBudget}>שמור</button>
                </div>
              )}
              {budget > 0 ? (
                <div className={s.budgetContent}>
                  <Gauge value={stats.currentMonthSpent} max={budget} />
                  <div className={s.budgetStats}>
                    <div className={s.budgetStat}>
                      <span className={s.budgetStatLabel}>הוצאת החודש</span>
                      <span className={s.budgetStatVal}>{fmt(stats.currentMonthSpent)}</span>
                    </div>
                    <div className={s.budgetStat}>
                      <span className={s.budgetStatLabel}>תקציב</span>
                      <span className={s.budgetStatVal}>{fmt(budget)}</span>
                    </div>
                    <div className={s.budgetStat}>
                      <span className={s.budgetStatLabel}>{stats.currentMonthSpent <= budget ? "נשאר" : "חריגה"}</span>
                      <span className={s.budgetStatVal} style={{ color: stats.currentMonthSpent <= budget ? "#10b981" : "#ef4444" }}>
                        {fmt(Math.abs(budget - stats.currentMonthSpent))}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className={s.budgetEmpty}>הגדר תקציב חודשי כדי לעקוב אחרי ההוצאות שלך</p>
              )}
            </div>

            {/* Day of Week Radar */}
            <div className={s.section}>
              <SH icon={<I.Compass color="#ec4899" />} bg="rgba(236,72,153,0.12)" title="דפוס הוצאות שבועי" badge={`יום הכי יקר: ${dayShort(stats.busiestDay)}`} />
              <div className={s.radarWrap}>
                <RadarChart data={stats.dow} labels={["א'", "ב'", "ג'", "ד'", "ה'", "ו'", "ש'"]} color="#ec4899" />
              </div>
              <div className={s.dowStats}>
                {stats.dow.map((v, i) => (
                  <div key={i} className={s.dowStatItem} style={{ animationDelay: `${0.3 + i * 0.04}s` }}>
                    <span className={s.dowLabel}>{dayShort(i)}</span>
                    <div className={s.dowBarTrack}>
                      <div className={s.dowBarFill} style={{
                        width: `${(v / Math.max(...stats.dow, 1)) * 100}%`,
                        background: i === stats.busiestDay ? "#ec4899" : "rgba(236,72,153,0.3)",
                        animationDelay: `${0.5 + i * 0.05}s`,
                      }} />
                    </div>
                    <span className={s.dowVal}>{fmt(v)}</span>
                    <span className={s.dowCount}>{stats.dowCount[i]} רכישות</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Category Over Time */}
            {stats.catOverTime.length > 1 && (
              <div className={s.section}>
                <SH icon={<I.Layers color="#06b6d4" />} bg="rgba(6,182,212,0.12)" title="קטגוריות לאורך זמן" badge={`${stats.catNames.length} קטגוריות`} />
                <StackedBars data={stats.catOverTime} categories={stats.catNames.slice(0, 6)} maxVal={stats.catOverTimeMax} />
                <div className={s.stackedLegend}>
                  {stats.catNames.slice(0, 6).map((cat, i) => (
                    <span key={cat} className={s.stackedLegendItem}>
                      <span className={s.stackedLegendDot} style={{ background: V[i % V.length] }} />
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Price Distribution */}
            <div className={s.section}>
              <SH icon={<I.DollarSign color="#10b981" />} bg="rgba(16,185,129,0.12)" title="התפלגות מחירי רכישות" badge={`${stats.totalPurchases} רכישות`} />
              <div className={s.priceDistGrid}>
                {stats.priceDist.map((d, i) => (
                  <div key={d.range} className={s.priceDistItem} style={{ animationDelay: `${0.2 + i * 0.06}s` }}>
                    <div className={s.priceDistBarWrap}>
                      <div className={s.priceDistBar} style={{
                        height: `${(d.count / stats.priceDistMax) * 100}%`,
                        background: `linear-gradient(180deg, ${V[i % V.length]}, ${V[i % V.length]}40)`,
                        animationDelay: `${0.4 + i * 0.08}s`,
                      }} />
                    </div>
                    <span className={s.priceDistLabel}>₪{d.range}</span>
                    <span className={s.priceDistCount}>{d.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline */}
            {stats.timeline.length > 1 && (
              <div className={s.section}>
                <SH icon={<I.Activity color="#ec4899" />} bg="rgba(236,72,153,0.12)" title="ציר זמן הוצאות" badge="כל הרכישות" />
                <AreaChart data={stats.timeline} onHover={setAreaHover} activeIdx={areaHover} />
              </div>
            )}

            {/* Insights Grid */}
            <div className={s.section}>
              <SH icon={<I.Zap color="#f59e0b" />} bg="rgba(245,158,11,0.12)" title="תובנות מהירות" />
              <div className={s.insights}>
                {[
                  { icon: <I.Calendar color="#818cf8" />, bg: "rgba(129,140,248,0.08)", ibg: "rgba(129,140,248,0.15)", val: stats.avgDays > 0 ? `${stats.avgDays} ימים` : "—", lbl: "ממוצע בין רכישות" },
                  { icon: <I.CreditCard color="#06b6d4" />, bg: "rgba(6,182,212,0.08)", ibg: "rgba(6,182,212,0.15)", val: fmt(stats.avg), lbl: "ממוצע לרכישה" },
                  { icon: <I.ArrowUp color="#ef4444" />, bg: "rgba(239,68,68,0.08)", ibg: "rgba(239,68,68,0.15)", val: fmt(stats.most), lbl: "רכישה הכי יקרה" },
                  { icon: <I.ArrowDown color="#10b981" />, bg: "rgba(16,185,129,0.08)", ibg: "rgba(16,185,129,0.15)", val: fmt(stats.least), lbl: "רכישה הכי זולה" },
                  { icon: <I.Cart color="#ec4899" />, bg: "rgba(236,72,153,0.08)", ibg: "rgba(236,72,153,0.15)", val: `${Math.round(stats.avgBasket)}`, lbl: "ממוצע מוצרים בסל" },
                  { icon: <I.Hash color="#f59e0b" />, bg: "rgba(245,158,11,0.08)", ibg: "rgba(245,158,11,0.15)", val: `${stats.maxBasket}`, lbl: "הסל הכי גדול" },
                ].map((ins, i) => (
                  <div key={i} className={s.insCard} style={{ background: ins.bg, animationDelay: `${0.3 + i * 0.06}s` }}>
                    <div className={s.insIconWrap} style={{ background: ins.ibg }}>{ins.icon}</div>
                    <p className={s.insVal}>{ins.val}</p>
                    <p className={s.insLbl}>{ins.lbl}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════
           TAB: PRODUCTS
           ════════════════════════════════════════════════ */}
        {tab === "products" && (
          <>
            {/* Top Products Quick View */}
            <div className={s.section}>
              <SH icon={<I.Trophy color="#f59e0b" />} bg="rgba(245,158,11,0.12)" title="מוצרים מובילים" badge={`Top ${topProds.length}`} />
              <div className={s.secTabs}>
                <button className={`${s.secTab} ${prodSort === "amount" ? s.secTabActive : ""}`} onClick={() => { setProdSort("amount"); setProdPage(0); }}>לפי כמות</button>
                <button className={`${s.secTab} ${prodSort === "spent" ? s.secTabActive : ""}`} onClick={() => { setProdSort("spent"); setProdPage(0); }}>לפי הוצאה</button>
                <button className={`${s.secTab} ${prodSort === "frequency" ? s.secTabActive : ""}`} onClick={() => { setProdSort("frequency"); setProdPage(0); }}>לפי תדירות</button>
              </div>
              <div className={s.prodList}>
                {topProds.map((p, i) => (
                  <div key={p.name} className={s.prodRow} style={{ animationDelay: `${0.15 + i * 0.05}s` }}>
                    <div className={`${s.prodRank} ${i === 0 ? s.r1 : i === 1 ? s.r2 : i === 2 ? s.r3 : s.rN}`}>{i + 1}</div>
                    <div className={s.prodInfo}>
                      <p className={s.prodName}>{p.name}</p>
                      <p className={s.prodSub}>{prodSort === "amount" ? `${fmt(p.spent)} הוצאו` : prodSort === "spent" ? `${p.amount} יחידות` : `${p.frequency} רכישות`}</p>
                      <div className={s.prodBar}>
                        <div className={s.prodBarIn} style={{
                          width: `${((prodSort === "amount" ? p.amount : prodSort === "spent" ? p.spent : p.frequency) / topMax) * 100}%`,
                          background: V[i % V.length],
                          animationDelay: `${0.3 + i * 0.06}s`,
                        }} />
                      </div>
                    </div>
                    <span className={s.prodAmt}>{prodSort === "amount" ? `x${p.amount}` : prodSort === "spent" ? fmt(p.spent) : `x${p.frequency}`}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Full Product Table */}
            <div className={s.section}>
              <SH icon={<I.Package color="#3b82f6" />} bg="rgba(59,130,246,0.12)" title="כל המוצרים" badge={`${filteredProds.length} מוצרים`} />
              <div className={s.searchRow}>
                <div className={s.searchWrap}>
                  <I.Search style={{ width: 14, height: 14 }} className={s.searchIcon} />
                  <input type="text" className={s.searchInput} placeholder="חפש מוצר..." value={prodSearch}
                    onChange={e => { setProdSearch(e.target.value); setProdPage(0); }} />
                  {prodSearch && <button className={s.searchClear} onClick={() => setProdSearch("")}><I.X style={{ width: 12, height: 12 }} /></button>}
                </div>
              </div>
              <div className={s.tableWrap}>
                <div className={s.tableHeader}>
                  {[
                    { key: "name", label: "מוצר" },
                    { key: "amount", label: "כמות" },
                    { key: "spent", label: "הוצאה" },
                    { key: "frequency", label: "תדירות" },
                    { key: "avgPrice", label: "מחיר ממוצע" },
                  ].map(col => (
                    <button key={col.key} className={`${s.tableCol} ${s[`col_${col.key}`]} ${prodSort === col.key ? s.tableColActive : ""}`}
                      onClick={() => { if (prodSort === col.key) setProdSortDir(d => d === "desc" ? "asc" : "desc"); else { setProdSort(col.key); setProdSortDir("desc"); } setProdPage(0); }}>
                      {col.label}
                      {prodSort === col.key && <span className={s.sortArrow}>{prodSortDir === "desc" ? "▼" : "▲"}</span>}
                    </button>
                  ))}
                </div>
                <div className={s.tableBody}>
                  {pagedProds.map((p, i) => (
                    <div key={p.name} className={s.tableRow} style={{ animationDelay: `${i * 0.03}s` }}>
                      <div className={`${s.tableCell} ${s.col_name}`}>
                        <span className={s.tableProdName}>{p.name}</span>
                        <span className={s.tableProdCat}>{p.category}</span>
                      </div>
                      <div className={`${s.tableCell} ${s.col_amount}`}>{p.amount}</div>
                      <div className={`${s.tableCell} ${s.col_spent}`}>{fmt(p.spent)}</div>
                      <div className={`${s.tableCell} ${s.col_frequency}`}>{p.frequency}</div>
                      <div className={`${s.tableCell} ${s.col_avgPrice}`}>{fmtDec(p.avgPrice)}</div>
                    </div>
                  ))}
                </div>
                {prodPages > 1 && (
                  <div className={s.pagination}>
                    <button className={s.pageBtn} disabled={prodPage === 0} onClick={() => setProdPage(p => p - 1)}>הקודם</button>
                    <span className={s.pageInfo}>{prodPage + 1} / {prodPages}</span>
                    <button className={s.pageBtn} disabled={prodPage >= prodPages - 1} onClick={() => setProdPage(p => p + 1)}>הבא</button>
                  </div>
                )}
              </div>
            </div>

            {/* Category HBar */}
            <div className={s.section}>
              <SH icon={<I.Pie color="#06b6d4" />} bg="rgba(6,182,212,0.12)" title="הוצאות לפי קטגוריה" badge={`${stats.catData.length}`} />
              <HBar
                items={stats.catData.map(c => ({ label: c.name, value: c.value }))}
                maxVal={stats.catData[0]?.value || 1}
              />
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════════
           TAB: STORES
           ════════════════════════════════════════════════ */}
        {tab === "stores" && (
          <>
            {/* Store Ranking */}
            <div className={s.section}>
              <SH icon={<I.Store color="#10b981" />} bg="rgba(16,185,129,0.12)" title="השוואת רשתות" badge={`${stats.smData.length} רשתות`} />
              <div className={s.secTabs}>
                <button className={`${s.secTab} ${storeSort === "total" ? s.secTabActive : ""}`} onClick={() => setStoreSort("total")}>לפי הוצאה</button>
                <button className={`${s.secTab} ${storeSort === "visits" ? s.secTabActive : ""}`} onClick={() => setStoreSort("visits")}>לפי ביקורים</button>
                <button className={`${s.secTab} ${storeSort === "avg" ? s.secTabActive : ""}`} onClick={() => setStoreSort("avg")}>לפי ממוצע</button>
                <button className={`${s.secTab} ${storeSort === "items" ? s.secTabActive : ""}`} onClick={() => setStoreSort("items")}>לפי פריטים</button>
              </div>
              <div className={s.smList}>
                {sortedStores.map((sm, i) => (
                  <div key={sm.name} className={s.smCard} style={{ animationDelay: `${0.15 + i * 0.06}s` }}>
                    <div className={s.smTop}>
                      <div className={s.smNameRow}>
                        <div className={s.smRank} style={{
                          background: i === 0 ? "linear-gradient(135deg,#f59e0b,#f97316)" : i === 1 ? "linear-gradient(135deg,#8b5cf6,#6366f1)" : i === 2 ? "linear-gradient(135deg,#14b8a6,#06b6d4)" : "rgba(99,102,241,0.08)"
                        }}>{i + 1}</div>
                        <div>
                          <span className={s.smName}>{sm.name}</span>
                          {sm.cities.length > 0 && <span className={s.smCities}>{sm.cities.join(", ")}</span>}
                        </div>
                      </div>
                      <span className={s.smTotal}>{fmt(sm.total)}</span>
                    </div>
                    <div className={s.smBarTrack}>
                      <div className={s.smBarFill} style={{
                        width: `${sm.pct}%`,
                        background: `linear-gradient(90deg,${V[i % V.length]},${V[(i + 2) % V.length]})`,
                        animationDelay: `${0.3 + i * 0.08}s`,
                      }} />
                    </div>
                    <div className={s.smMetaGrid}>
                      <div className={s.smMetaCard}>
                        <I.Eye style={{ width: 13, height: 13, color: "#64748b" }} />
                        <span className={s.smMetaVal}>{sm.visits}</span>
                        <span className={s.smMetaLbl}>ביקורים</span>
                      </div>
                      <div className={s.smMetaCard}>
                        <I.CreditCard style={{ width: 13, height: 13, color: "#64748b" }} />
                        <span className={s.smMetaVal}>{fmt(sm.avg)}</span>
                        <span className={s.smMetaLbl}>ממוצע</span>
                      </div>
                      <div className={s.smMetaCard}>
                        <I.Package style={{ width: 13, height: 13, color: "#64748b" }} />
                        <span className={s.smMetaVal}>{sm.avgItems}</span>
                        <span className={s.smMetaLbl}>פריטים/ביקור</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City Breakdown */}
            {stats.cityData.length > 1 && (
              <div className={s.section}>
                <SH icon={<I.Map color="#3b82f6" />} bg="rgba(59,130,246,0.12)" title="הוצאות לפי עיר" badge={`${stats.cityData.length} ערים`} />
                <HBar
                  items={stats.cityData.map(c => ({ label: c.name, value: c.value }))}
                  maxVal={stats.cityMax}
                />
              </div>
            )}

            {/* Store Price Comparison */}
            {stats.smData.length >= 2 && (
              <div className={s.section}>
                <SH icon={<I.Scale color="#f59e0b" />} bg="rgba(245,158,11,0.12)" title="השוואת מחירים בין רשתות" badge="ממוצע לרכישה" />
                <div className={s.priceCompGrid}>
                  {[...stats.smData].sort((a, b) => a.avg - b.avg).map((sm, i) => {
                    const cheapest = i === 0;
                    const pctMore = stats.smData.length > 1 ? Math.round(((sm.avg / stats.smData.sort((a, b) => a.avg - b.avg)[0].avg) - 1) * 100) : 0;
                    return (
                      <div key={sm.name} className={`${s.priceCompCard} ${cheapest ? s.priceCompCheapest : ""}`} style={{ animationDelay: `${0.2 + i * 0.06}s` }}>
                        <div className={s.priceCompHeader}>
                          <span className={s.priceCompName}>{sm.name}</span>
                          {cheapest && <span className={s.priceCompBadge}>הכי זול</span>}
                        </div>
                        <span className={s.priceCompVal}>{fmt(sm.avg)}</span>
                        {!cheapest && pctMore > 0 && <span className={s.priceCompDiff}>+{pctMore}%</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Insights */}
            {insights.length > 4 && (
              <div className={s.section}>
                <SH icon={<I.Zap color="#f59e0b" />} bg="rgba(245,158,11,0.12)" title="תובנות נוספות" />
                <div className={s.smartInsights}>
                  {insights.slice(4).map((ins, i) => (
                    <div key={i} className={s.smartInsCard} style={{ background: ins.bg, animationDelay: `${0.2 + i * 0.06}s` }}>
                      <div className={s.smartInsIcon}>{ins.icon}</div>
                      <p className={s.smartInsText}>{ins.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── BACK BUTTON ─────────────────────────────────── */}
      <button className={s.backBtn} onClick={() => navigate(-1)}>חזרה</button>
    </div>
  );
}
