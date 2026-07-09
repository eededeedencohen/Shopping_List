import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DOMAIN } from "../../constants";
import "./BudgetTracker.css";

/* ════════════════════════════════════════════════════════════════
   BUDGET TRACKER — homepage widget
   Synced with the stats page (/advanced-stats):
   · same budget (localStorage "statsBudget")
   · same month math (LOCAL month key of purchase totals)
   Gradient progress ring: filled arc = spent, ghost arc = projected
   end-of-month pace. Tap → the full stats page.
   ════════════════════════════════════════════════════════════════ */

const nis = (n) => "₪" + Math.round(n || 0).toLocaleString("he-IL");
const pad2 = (n) => String(n).padStart(2, "0");
/* Local (not UTC) month key — must match AdvancedStatsDashboard */
const monthKey = (d) => { const x = new Date(d); return x.getFullYear() + "-" + pad2(x.getMonth() + 1); };

const BUDGET_KEY = "statsBudget";
const readBudget = () => {
  try { const v = localStorage.getItem(BUDGET_KEY); return v !== null ? Number(JSON.parse(v)) || 0 : 0; }
  catch { return 0; }
};

/* gradient stops + aura per state */
const STATE_STYLE = {
  none: { stops: ["#93c5fd", "#60a5fa"], glow: "rgba(96, 165, 250, 0.30)" },
  ok: { stops: ["#22d3ee", "#2563eb"], glow: "rgba(37, 99, 235, 0.32)" },
  warn: { stops: ["#fbbf24", "#f97316"], glow: "rgba(249, 115, 22, 0.30)" },
  over: { stops: ["#f87171", "#dc2626"], glow: "rgba(220, 38, 38, 0.30)" },
};

/* icons */
const WalletIco = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
const ChevIco = (p) => (
  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const PlusIco = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...p}>
    <path d="M12 5v14" /><path d="M5 12h14" />
  </svg>
);

/* count-up for the hero number */
function useCounter(target, ms = 750) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target === null || target === undefined) { setV(0); return; }
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

/* ── the gradient ring ─────────────────────────────────────────── */
function Ring({ size = 66, stroke = 7, progress, ghost, state }) {
  const { stops } = STATE_STYLE[state];
  const r = (size - stroke) / 2, C = 2 * Math.PI * r, cx = size / 2;
  const gid = "btgrad-" + state;
  const seg = (p) => `${Math.max(Math.min(p, 1), 0.005) * C} ${C}`;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" className="budget-tracker__ring-svg" aria-hidden="true">
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={stops[0]} />
          <stop offset="100%" stopColor={stops[1]} />
        </linearGradient>
      </defs>
      {/* track */}
      <circle cx={cx} cy={cx} r={r} fill="none"
        stroke="rgba(30, 58, 95, 0.10)" strokeWidth={state === "none" ? stroke - 1.5 : stroke}
        strokeDasharray={state === "none" ? "2.5 6" : undefined} strokeLinecap="round" />
      {/* ghost arc — projected end-of-month pace */}
      {ghost !== null && (
        <circle className="budget-tracker__ring-ghost" cx={cx} cy={cx} r={r} fill="none"
          stroke={stops[1]} strokeOpacity="0.20" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={seg(ghost)} transform={`rotate(-90 ${cx} ${cx})`} />
      )}
      {/* filled arc — actual spending */}
      {progress !== null && (
        <circle className="budget-tracker__ring-fill" cx={cx} cy={cx} r={r} fill="none"
          stroke={`url(#${gid})`} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={seg(progress)} transform={`rotate(-90 ${cx} ${cx})`}
          style={{ filter: `drop-shadow(0 0 5px ${stops[1]}66)` }} />
      )}
    </svg>
  );
}

function BudgetTracker() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [spent, setSpent] = useState(null);      /* current-month total; null = loading */
  const [failed, setFailed] = useState(false);
  const [budget, setBudget] = useState(readBudget);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const [ringOn, setRingOn] = useState(false);   /* mount → animate arcs in */

  /* ── fetch this month's spending (slim payload: date+totalPrice only) ── */
  useEffect(() => {
    let alive = true;
    axios.get(`${DOMAIN}/api/v1/history/?fields=date,totalPrice`)
      .then((r) => {
        if (!alive) return;
        const rows = (r.data && r.data.data && r.data.data.history) || [];
        const cur = monthKey(new Date());
        const total = rows.reduce((a, h) => a + (monthKey(h.date) === cur ? h.totalPrice || 0 : 0), 0);
        setSpent(total);
      })
      .catch((e) => { console.error("BudgetTracker fetch error:", e); if (alive) { setFailed(true); setSpent(0); } });
    return () => { alive = false; };
  }, []);

  /* arcs sweep in a beat after the data lands */
  useEffect(() => {
    if (spent === null) return;
    const t = setTimeout(() => setRingOn(true), 120);
    return () => clearTimeout(t);
  }, [spent]);

  /* ── keep the budget in sync with the stats page ── */
  useEffect(() => {
    const sync = () => setBudget(readBudget());
    window.addEventListener("focus", sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("focus", sync); window.removeEventListener("storage", sync); };
  }, []);
  useEffect(() => { if (editing && inputRef.current) inputRef.current.focus(); }, [editing]);

  const saveBudget = useCallback(() => {
    const v = parseFloat(draft);
    if (v > 0) {
      try { localStorage.setItem(BUDGET_KEY, JSON.stringify(v)); } catch { }
      setBudget(v);
    }
    setEditing(false);
    setDraft("");
  }, [draft]);

  /* ── derived ── */
  const now = new Date();
  const monthName = now.toLocaleDateString("he-IL", { month: "long" });
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - dayOfMonth;

  const info = useMemo(() => {
    if (spent === null) return null;
    const projected = dayOfMonth >= 3 ? (spent / dayOfMonth) * daysInMonth : null;
    if (!(budget > 0)) return { projected, state: "none", ratio: 0 };
    const ratio = spent / budget;
    const left = budget - spent;
    const perDay = left > 0 && daysLeft > 0 ? left / daysLeft : 0;
    const state = ratio > 1 ? "over" : ratio >= 0.75 ? "warn" : "ok";
    return { projected, ratio, left, perDay, state };
  }, [spent, budget, dayOfMonth, daysInMonth, daysLeft]);

  const state = spent === null ? "none" : failed ? "none" : info.state;
  const glow = STATE_STYLE[state].glow;
  const shownSpent = useCounter(spent === null ? 0 : spent);
  const pct = info && budget > 0 ? Math.round(info.ratio * 100) : 0;

  const openStats = useCallback(() => navigate("/advanced-stats"), [navigate]);
  const stop = (e) => e.stopPropagation();
  const startEditing = useCallback((e) => { e.stopPropagation(); setEditing(true); }, []);

  /* ── loading skeleton ── */
  if (spent === null) {
    return (
      <div className="budget-tracker budget-tracker--loading" data-state="none" style={{ "--bt-glow": glow }} aria-hidden="true">
        <div className="budget-tracker__skel-ring" />
        <div className="budget-tracker__skel-lines">
          <div className="budget-tracker__skel-line" style={{ width: "34%" }} />
          <div className="budget-tracker__skel-line budget-tracker__skel-line--big" style={{ width: "52%" }} />
          <div className="budget-tracker__skel-line" style={{ width: "72%" }} />
        </div>
      </div>
    );
  }

  /* ── render ── */
  return (
    <div
      className="budget-tracker"
      data-state={state}
      style={{ "--bt-glow": glow }}
      role="button"
      tabIndex={0}
      aria-label="מעקב הוצאות חודשי — מעבר לסטטיסטיקות"
      onClick={openStats}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openStats(); } }}
    >
      <span className="budget-tracker__shine" aria-hidden="true" />

      <div className="budget-tracker__row">
        {/* the ring */}
        <div
          className={`budget-tracker__ring ${budget > 0 ? "" : "budget-tracker__ring--empty"}`}
          onClick={budget > 0 ? undefined : startEditing}
          title={budget > 0 ? undefined : "קבע תקציב"}
        >
          <Ring
            state={state}
            progress={budget > 0 && info ? (ringOn ? Math.min(info.ratio || 0, 1) : 0) : null}
            ghost={budget > 0 && info && info.projected !== null && info.projected > spent
              ? (ringOn ? Math.min(info.projected / budget, 1) : 0)
              : null}
          />
          <div className="budget-tracker__ring-center">
            {budget > 0 ? (
              <>
                <span className="budget-tracker__pct">{pct}%</span>
                <span className="budget-tracker__pct-lbl">מהתקציב</span>
              </>
            ) : (
              <span className="budget-tracker__ring-plus"><PlusIco /></span>
            )}
          </div>
        </div>

        {/* the numbers */}
        <div className="budget-tracker__main">
          <span className="budget-tracker__label">
            <WalletIco /> הוצאות {monthName}
          </span>
          <div className="budget-tracker__amount-row">
            <span className="budget-tracker__spent">{failed ? "—" : nis(shownSpent)}</span>
            {budget > 0 && <span className="budget-tracker__of">מתוך {nis(budget)}</span>}
          </div>
          {/* one aligned status line — the answer to "כמה מותר לי" */}
          {!editing && (
            <p className="budget-tracker__status">
              {failed ? (
                <span className="budget-tracker__status-rest">אין חיבור לנתונים כרגע</span>
              ) : budget > 0 ? (
                info.left >= 0 ? (
                  <>
                    <b className={`budget-tracker__status-lead budget-tracker__status-lead--${state}`}>
                      נשארו {nis(info.left)}
                    </b>
                    {daysLeft > 0
                      ? (info.perDay > 0 && <span className="budget-tracker__status-rest"> · עוד {nis(info.perDay)} ליום</span>)
                      : <span className="budget-tracker__status-rest"> · היום האחרון של החודש</span>}
                  </>
                ) : (
                  <>
                    <b className="budget-tracker__status-lead budget-tracker__status-lead--over">
                      חריגה של {nis(-info.left)}
                    </b>
                    {info.projected !== null && <span className="budget-tracker__status-rest"> · בקצב הזה: {nis(info.projected)}</span>}
                  </>
                )
              ) : info.projected !== null ? (
                <span className="budget-tracker__status-rest">צפי לסוף החודש: <b>{nis(info.projected)}</b></span>
              ) : (
                <span className="budget-tracker__status-rest">קבע תקציב כדי לדעת כמה מותר להוציא</span>
              )}
            </p>
          )}
        </div>

        {/* far edge: navigation hint, or the setup action when no budget yet */}
        {!failed && budget <= 0 && !editing ? (
          <button type="button" className="budget-tracker__set-btn" onClick={startEditing}>
            קבע תקציב
          </button>
        ) : (
          <span className="budget-tracker__chev"><ChevIco /></span>
        )}
      </div>

      {/* inline budget editor */}
      {editing && (
        <div className="budget-tracker__edit" onClick={stop}>
          <input
            ref={inputRef}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="תקציב חודשי בשקלים"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveBudget(); if (e.key === "Escape") setEditing(false); }}
          />
          <button type="button" className="budget-tracker__save" onClick={saveBudget}>שמירה</button>
          <button type="button" className="budget-tracker__cancel" onClick={(e) => { stop(e); setEditing(false); setDraft(""); }}>ביטול</button>
        </div>
      )}
    </div>
  );
}

export default BudgetTracker;
