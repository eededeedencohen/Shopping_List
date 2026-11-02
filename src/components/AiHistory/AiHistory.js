import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./AiHistory.css";
import {
  listAiSessions,
  getAiSession,
  getAiSessionStats,
  reviewAiSession,
  reviewAiTurn,
} from "../../services/aiSessionService";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";
import { IconChevronRight } from "../Icons/UiIcons";

/* ── vocabulary ─────────────────────────────────────────────────── */
const ACTION_LABELS = {
  navigate: "ניווט",
  open_subcategory: "פתיחת תת-קטגוריה",
  replace_cheapest: "מעבר לסופר הזול",
  optimize_cart: "ייעול העגלה",
  show_cheapest: "הצגת סופרים זולים",
  select_supermarket: "בחירת סופר מהרשימה",
  compare_supermarkets: "השוואת סופרים",
  apply_compare: "החלטה אחרי השוואה",
  complete_cart: "השלמת העגלה",
  complete_and_compare: "השלמה ומעבר לזול",
  find_product: "מציאת מוצר במדף",
  add_product: "הוספת מוצר לעגלה",
  hush: "השתקה",
  none: "לא הובן",
};

const OUTCOME = {
  done: { label: "בוצע", tone: "ok" },
  silent: { label: "שתק (כמבוקש)", tone: "muted" },
  not_understood: { label: "לא הובן — לא בוצע דבר", tone: "warn" },
  ignored: { label: "לא בוצע (ללא השפעה)", tone: "warn" },
  failed: { label: "נכשל בביצוע", tone: "bad" },
  pending: { label: "לא דווח", tone: "muted" },
};

const FILTERS = [
  { key: "all", label: "הכל" },
  { key: "bad", label: "✗ בעייתיות" },
  { key: "good", label: "✓ טובות" },
  { key: "unreviewed", label: "לא סומנו" },
  { key: "noted", label: "עם הערות" },
];

const PAGE_LABELS = {
  "/": "בית",
  "/products": "מוצרים",
  "/cart": "עגלה",
  "/history": "היסטוריית קניות",
  "/image-parser": "סריקת קבלות",
  "/advanced-stats": "סטטיסטיקות",
  "/barcode-scanner": "סורק ברקוד",
  "/ai": "עוזר AI",
  "/ai-history": "מחקר AI",
  "/settings": "הגדרות",
};

/* the command's parameters, in words — only what matters per action */
function describeParams(cmd) {
  if (!cmd) return "";
  switch (cmd.actionType) {
    case "navigate":
      return PAGE_LABELS[cmd.route] || cmd.route || "";
    case "open_subcategory":
      return `קטגוריה ${cmd.categoryIndex} › תת ${cmd.subIndex}`;
    case "show_cheapest":
      return `${cmd.count || 5} סופרים`;
    case "select_supermarket":
    case "apply_compare": {
      const bits = [];
      if (cmd.decision) bits.push(cmd.decision === "apply" ? "החלף" : "בטל");
      if (cmd.rank != null) bits.push(`מקום ${cmd.rank}`);
      if (cmd.supermarketName) bits.push(cmd.supermarketName);
      return bits.join(" · ");
    }
    case "compare_supermarkets":
    case "complete_and_compare": {
      const bits = [];
      if (cmd.strategy) {
        bits.push(cmd.strategy === "lastPurchased" ? "לפי קניות קודמות" : "הזול ביותר");
      }
      if (cmd.group) {
        bits.push(
          cmd.group === "talpiot" ? "תלפיות" : cmd.group === "online" ? "אונליין" : "לפי שמות"
        );
      }
      if (cmd.supermarketNames && cmd.supermarketNames.length) {
        bits.push(cmd.supermarketNames.join(", "));
      }
      return bits.join(" · ");
    }
    case "complete_cart":
      return cmd.strategy === "lastPurchased" ? "לפי קניות קודמות" : "הזול ביותר";
    case "find_product":
      return cmd.productName || "";
    case "add_product":
      return `${cmd.productName || ""}${cmd.quantity ? ` ×${cmd.quantity}` : ""}`;
    default:
      return "";
  }
}

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "short" });
};
const fmtTime = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("he-IL", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const fmtDayFull = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("he-IL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};
function fmtDuration(start, end) {
  if (!start) return "";
  const ms = (end ? new Date(end) : new Date()) - new Date(start);
  if (ms < 0) return "";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} שנ׳`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} דק׳${s % 60 ? ` ${s % 60} שנ׳` : ""}`;
  const h = Math.floor(m / 60);
  return `${h} שע׳ ${m % 60} דק׳`;
}
const fmtMs = (ms) => (ms >= 1000 ? `${(ms / 1000).toFixed(1)}s` : `${ms || 0}ms`);

function sessionIsLive(s) {
  if (!s || s.endedAt) return false;
  const last = new Date(s.updatedAt || s.startedAt).getTime();
  return Date.now() - last < 10 * 60 * 1000;
}

/* ── icons (local, tiny) ───────────────────────────────────────── */
const IconCheck = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" aria-hidden="true" {...p}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconX = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" aria-hidden="true" {...p}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);
const IconMicSmall = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" aria-hidden="true" {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0" />
    <line x1="12" y1="18" x2="12" y2="21" />
  </svg>
);
const IconRobotSmall = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="1em" height="1em" aria-hidden="true" {...p}>
    <rect x="4" y="8" width="16" height="12" rx="3" />
    <line x1="12" y1="4" x2="12" y2="8" />
    <circle cx="9" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="15" cy="14" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const IconSearchSmall = (p) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" width="1em" height="1em" aria-hidden="true" {...p}>
    <circle cx="11" cy="11" r="7" />
    <line x1="20" y1="20" x2="16.2" y2="16.2" />
  </svg>
);

/* ── review controls (shared by turns + the whole chat) ─────────── */
function ReviewControls({ review, onChange, compact, placeholder }) {
  const verdict = (review && review.verdict) || null;
  const [note, setNote] = useState((review && review.note) || "");
  const [saved, setSaved] = useState(false);
  const debounceRef = useRef(null);
  const lastSentRef = useRef((review && review.note) || "");

  useEffect(() => {
    setNote((review && review.note) || "");
    lastSentRef.current = (review && review.note) || "";
  }, [review]);

  const flush = useCallback(
    async (value) => {
      clearTimeout(debounceRef.current);
      if (value === lastSentRef.current) return;
      lastSentRef.current = value;
      const ok = await onChange({ note: value });
      if (ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 1400);
      }
    },
    [onChange]
  );

  const onNote = (e) => {
    const v = e.target.value;
    setNote(v);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => flush(v), 700);
  };

  const pick = (v) => {
    haptic(v === "bad" ? "warning" : "success");
    uiSound("select");
    onChange({ verdict: verdict === v ? null : v });
  };

  return (
    <div className={`aih-review${compact ? " aih-review--compact" : ""}`}>
      <div className="aih-review__btns" role="group" aria-label="סימון">
        <button
          type="button"
          className={`aih-vbtn aih-vbtn--good${verdict === "good" ? " is-on" : ""}`}
          aria-pressed={verdict === "good"}
          onClick={() => pick("good")}
        >
          <IconCheck />
          <span>טוב</span>
        </button>
        <button
          type="button"
          className={`aih-vbtn aih-vbtn--bad${verdict === "bad" ? " is-on" : ""}`}
          aria-pressed={verdict === "bad"}
          onClick={() => pick("bad")}
        >
          <IconX />
          <span>בעייתי</span>
        </button>
      </div>
      <div className="aih-note">
        <textarea
          className="aih-note__input"
          value={note}
          onChange={onNote}
          onBlur={() => flush(note)}
          rows={1}
          placeholder={placeholder || "הערה — מה היה צריך לקרות?"}
        />
        <span className={`aih-note__saved${saved ? " is-on" : ""}`} aria-live="polite">
          נשמר
        </span>
      </div>
    </div>
  );
}

/* ── one turn in the chat view ─────────────────────────────────── */
function TurnCard({ turn, onReview }) {
  const [showTech, setShowTech] = useState(false);
  const cmd = turn.command || {};
  const action = turn.actionType || cmd.actionType || "none";
  const outcome = (turn.client && turn.client.outcome) || {};
  const o = OUTCOME[outcome.status] || OUTCOME.pending;
  const rawAction = turn.raw && turn.raw.actionType;
  const coerced = rawAction && rawAction !== action;
  const params = describeParams(cmd);
  const verdict = (turn.review && turn.review.verdict) || null;
  const empty = !turn.transcript || !turn.transcript.trim();
  const page = turn.client && turn.client.pageRoute;
  const t = turn.timings || {};

  return (
    <li className={`aih-turn${verdict ? ` aih-turn--${verdict}` : ""}`}>
      <div className="aih-turn__seq">{turn.seq}</div>

      {/* the user */}
      <div className="aih-bubble aih-bubble--user">
        <span className="aih-bubble__who">
          <IconMicSmall /> אתה
          <span className="aih-bubble__time">{fmtTime(turn.at)}</span>
          {page && PAGE_LABELS[page] && (
            <span className="aih-chip aih-chip--page">במסך {PAGE_LABELS[page]}</span>
          )}
        </span>
        <p className={`aih-bubble__text${empty ? " is-empty" : ""}`}>
          {empty ? "(לא זוהה דיבור)" : turn.transcript}
        </p>
        {turn.sttError && (
          <span className="aih-chip aih-chip--err" title={turn.sttError}>
            תקלת תמלול: {turn.sttError}
          </span>
        )}
      </div>

      {/* the robot */}
      <div className="aih-bubble aih-bubble--bot">
        <span className="aih-bubble__who">
          <IconRobotSmall /> הרובוט
          {turn.client && turn.client.interrupted && (
            <span className="aih-chip aih-chip--cut">נקטע</span>
          )}
        </span>
        <div className="aih-action">
          <span className={`aih-action__type aih-action__type--${action === "none" ? "none" : action === "hush" ? "hush" : "ok"}`}>
            {ACTION_LABELS[action] || action}
          </span>
          {params && <span className="aih-action__params">{params}</span>}
        </div>
        {coerced && (
          <div className="aih-coerced">
            המודל בחר <b>{ACTION_LABELS[rawAction] || rawAction}</b> אבל האימות
            תיקן ל-<b>{ACTION_LABELS[action] || action}</b>
            {turn.raw && turn.raw.route ? ` (route: ${turn.raw.route})` : ""}
            {turn.raw && turn.raw.productName ? ` (${turn.raw.productName})` : ""}
          </div>
        )}
        {turn.llmError && (
          <span className="aih-chip aih-chip--err" title={turn.llmError}>
            תקלת מודל: {turn.llmError}
          </span>
        )}
        <p className={`aih-bubble__text${turn.spoken ? "" : " is-empty"}`}>
          {turn.spoken ? `"${turn.spoken}"` : "🔇 שתק"}
        </p>
        {(turn.followUps || []).map((f, i) => (
          <p className="aih-bubble__follow" key={i}>
            ↳ "{f.text}"
          </p>
        ))}
        <div className={`aih-outcome aih-outcome--${o.tone}`}>
          <span className="aih-outcome__status">{o.label}</span>
          {outcome.detail && (
            <span className="aih-outcome__detail">{outcome.detail}</span>
          )}
        </div>
        <button
          type="button"
          className="aih-tech-toggle"
          onClick={() => setShowTech((v) => !v)}
        >
          {showTech ? "הסתר פרטים טכניים" : "פרטים טכניים"}
          <span className="aih-tech-toggle__times">
            STT {fmtMs(t.stt)} · מודל {fmtMs(t.llm)} · קול {fmtMs(t.tts)}
          </span>
        </button>
        {showTech && (
          <pre className="aih-tech" dir="ltr">
            {JSON.stringify(
              {
                raw: turn.raw,
                command: turn.command,
                historyUsed: turn.historyUsed,
                contextSizes: turn.contextSizes,
                timings: turn.timings,
                client: turn.client,
                ttsLanguage: turn.ttsLanguage,
              },
              null,
              2
            )}
          </pre>
        )}
      </div>

      <ReviewControls
        review={turn.review}
        onChange={(patch) => onReview(turn._id, patch)}
        compact
      />
    </li>
  );
}

/* ── the chat view ─────────────────────────────────────────────── */
function SessionDetail({ id, onBack }) {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getAiSession(id);
      setSession(data.session);
      setError(null);
    } catch (e) {
      setError("לא הצלחתי לטעון את השיחה");
    }
  }, [id]);
  useEffect(() => {
    load();
  }, [load]);

  const reviewTurn = async (turnId, patch) => {
    /* optimistic */
    setSession((s) =>
      s
        ? {
            ...s,
            turns: s.turns.map((t) =>
              t._id === turnId ? { ...t, review: { ...(t.review || {}), ...patch } } : t
            ),
          }
        : s
    );
    try {
      const r = await reviewAiTurn(id, turnId, patch);
      if (r && r.counters) setSession((s) => (s ? { ...s, ...r.counters } : s));
      return true;
    } catch (e) {
      return false;
    }
  };
  const reviewWhole = async (patch) => {
    setSession((s) => (s ? { ...s, review: { ...(s.review || {}), ...patch } } : s));
    try {
      await reviewAiSession(id, patch);
      return true;
    } catch (e) {
      return false;
    }
  };

  if (error) {
    return (
      <div className="aih-empty">
        {error}
        <button type="button" className="aih-link" onClick={load}>
          נסה שוב
        </button>
      </div>
    );
  }
  if (!session) return <div className="aih-empty">טוען שיחה…</div>;

  const live = sessionIsLive(session);
  const turns = session.turns || [];
  const good = turns.filter((t) => t.review && t.review.verdict === "good").length;
  const bad = turns.filter((t) => t.review && t.review.verdict === "bad").length;

  return (
    <div className="aih-detail">
      <div className="aih-detail__head">
        <button type="button" className="aih-back" onClick={onBack} aria-label="חזרה">
          <IconChevronRight />
        </button>
        <div className="aih-detail__title">
          <span className="aih-detail__date">
            {fmtDayFull(session.startedAt)} · {fmtTime(session.startedAt)}
          </span>
          <span className="aih-detail__meta">
            <span className={`aih-mode aih-mode--${session.mode}`}>
              {session.mode === "handsfree" ? "שיחה רציפה" : "לחיצה ארוכה"}
            </span>
            {live ? (
              <span className="aih-live">פעילה עכשיו</span>
            ) : (
              <span>{fmtDuration(session.startedAt, session.endedAt)}</span>
            )}
            <span>{turns.length} פקודות</span>
            {good > 0 && <span className="aih-count aih-count--good">✓ {good}</span>}
            {bad > 0 && <span className="aih-count aih-count--bad">✗ {bad}</span>}
          </span>
        </div>
      </div>

      <section className="aih-card aih-card--session-review">
        <div className="aih-card__title">השיחה כולה</div>
        <ReviewControls
          review={session.review}
          onChange={reviewWhole}
          placeholder="הערה כללית על השיחה"
        />
      </section>

      {turns.length === 0 ? (
        <div className="aih-empty">השיחה נפתחה אבל לא נאמרה בה שום פקודה.</div>
      ) : (
        <ol className="aih-turns">
          {turns.map((t) => (
            <TurnCard key={t._id} turn={t} onReview={reviewTurn} />
          ))}
        </ol>
      )}
    </div>
  );
}

/* ── list card ─────────────────────────────────────────────────── */
function SessionCard({ s, onOpen }) {
  const live = sessionIsLive(s);
  const marks = s.turnMarks || [];
  return (
    <li>
      <button type="button" className="aih-session" onClick={() => onOpen(s._id)}>
        <div className="aih-session__top">
          <span className="aih-session__when">
            <b>{fmtDate(s.startedAt)}</b> {fmtTime(s.startedAt)}
          </span>
          <span className={`aih-mode aih-mode--${s.mode}`}>
            {s.mode === "handsfree" ? "רציפה" : "לחיצה"}
          </span>
          {live ? (
            <span className="aih-live">פעילה</span>
          ) : (
            <span className="aih-session__dur">{fmtDuration(s.startedAt, s.endedAt)}</span>
          )}
          <span className="aih-session__chev" aria-hidden="true">
            <IconChevronRight />
          </span>
        </div>
        <p className={`aih-session__first${s.firstTranscript ? "" : " is-empty"}`}>
          {s.firstTranscript || (s.turnsCount ? "(לא זוהה דיבור)" : "ללא פקודות")}
        </p>
        <div className="aih-session__bottom">
          <span className="aih-session__count">{s.turnsCount} פקודות</span>
          <span className="aih-marks" aria-label="סימוני הפקודות">
            {marks.slice(0, 24).map((m, i) => (
              <span
                key={i}
                className={`aih-mark${m.v ? ` aih-mark--${m.v}` : ""}${
                  m.e ? " aih-mark--err" : ""
                }${m.a === "none" ? " aih-mark--none" : ""}`}
                title={ACTION_LABELS[m.a] || m.a}
              />
            ))}
          </span>
          {(s.review && s.review.note) || s.goodCount || s.badCount ? (
            <span className="aih-session__counts">
              {s.goodCount > 0 && <span className="aih-count aih-count--good">✓ {s.goodCount}</span>}
              {s.badCount > 0 && <span className="aih-count aih-count--bad">✗ {s.badCount}</span>}
              {s.review && s.review.note && <span className="aih-count">📝</span>}
            </span>
          ) : null}
        </div>
      </button>
    </li>
  );
}

/* ── the page ──────────────────────────────────────────────────── */
export default function AiHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [query, setQuery] = useState(""); // debounced
  const [sessions, setSessions] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setQuery(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  const loadStats = useCallback(() => {
    getAiSessionStats()
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  const loadList = useCallback(
    async (skip = 0) => {
      setLoading(true);
      try {
        const data = await listAiSessions({ limit: 30, skip, filter, q: query });
        setSessions((prev) => (skip ? [...prev, ...data.sessions] : data.sessions));
        setTotal(data.total || 0);
        setError(null);
      } catch (e) {
        setError("לא הצלחתי לטעון את השיחות");
      } finally {
        setLoading(false);
      }
    },
    [filter, query]
  );

  /* list mode: (re)load on filter/search; also on return from a chat */
  useEffect(() => {
    if (id) return;
    loadList(0);
    loadStats();
  }, [id, loadList, loadStats]);

  const pct = useMemo(() => {
    if (!stats || !stats.totals) return null;
    const { good = 0, bad = 0 } = stats.totals;
    const n = good + bad;
    return n ? Math.round((good / n) * 100) : null;
  }, [stats]);

  if (id) {
    return (
      <div className="aih-page" dir="rtl">
        <SessionDetail id={id} onBack={() => navigate("/ai-history")} />
      </div>
    );
  }

  return (
    <div className="aih-page" dir="rtl">
      <header className="aih-head">
        <h1 className="aih-title">מחקר AI</h1>
        <p className="aih-sub">
          כל שיחה עם הרובוט נשמרת כאן (טקסט בלבד, בלי הקלטות). סמנו ✓ או ✗ לכל
          פקודה והוסיפו הערה — ככה נכוון אותו.
        </p>
      </header>

      {stats && stats.totals && (
        <div className="aih-stats">
          <div className="aih-stat">
            <span className="aih-stat__num">{stats.totals.sessions}</span>
            <span className="aih-stat__label">שיחות</span>
          </div>
          <div className="aih-stat">
            <span className="aih-stat__num">{stats.totals.turns}</span>
            <span className="aih-stat__label">פקודות</span>
          </div>
          <div className="aih-stat aih-stat--good">
            <span className="aih-stat__num">{pct == null ? "—" : `${pct}%`}</span>
            <span className="aih-stat__label">טובות מהמסומנות</span>
          </div>
          <div className="aih-stat aih-stat--bad">
            <span className="aih-stat__num">{stats.totals.bad}</span>
            <span className="aih-stat__label">בעייתיות</span>
          </div>
        </div>
      )}

      {stats && stats.byAction && stats.byAction.length > 0 && (
        <details className="aih-breakdown">
          <summary>פירוט לפי סוג פעולה</summary>
          <table className="aih-table" dir="rtl">
            <thead>
              <tr>
                <th>פעולה</th>
                <th>סה״כ</th>
                <th>✓</th>
                <th>✗</th>
                <th>תקלות</th>
                <th>זמן</th>
              </tr>
            </thead>
            <tbody>
              {stats.byAction.map((a) => (
                <tr key={a.actionType}>
                  <td>{ACTION_LABELS[a.actionType] || a.actionType}</td>
                  <td>{a.count}</td>
                  <td className="aih-td--good">{a.good || ""}</td>
                  <td className="aih-td--bad">{a.bad || ""}</td>
                  <td>{a.sttErrors + a.llmErrors || ""}</td>
                  <td dir="ltr">{fmtMs(a.avgTotalMs)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
      )}

      <div className="aih-tools">
        <div className="aih-search">
          <IconSearchSmall />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="חיפוש בתמלולים, בתשובות ובהערות"
            aria-label="חיפוש"
          />
        </div>
        <div className="aih-filters" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`aih-filter${filter === f.key ? " is-active" : ""}`}
              onClick={() => {
                haptic("selection");
                setFilter(f.key);
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="aih-empty">
          {error}
          <button type="button" className="aih-link" onClick={() => loadList(0)}>
            נסה שוב
          </button>
        </div>
      ) : !loading && sessions.length === 0 ? (
        <div className="aih-empty">
          {query || filter !== "all"
            ? "אין שיחות שמתאימות לסינון."
            : "עדיין אין שיחות. הקישו פעמיים על הרובוט (או לחיצה ארוכה) ודברו — השיחה תופיע כאן."}
        </div>
      ) : (
        <>
          <ul className="aih-list">
            {sessions.map((s) => (
              <SessionCard key={s._id} s={s} onOpen={(sid) => navigate(`/ai-history/${sid}`)} />
            ))}
          </ul>
          {sessions.length < total && (
            <button
              type="button"
              className="aih-more"
              disabled={loading}
              onClick={() => loadList(sessions.length)}
            >
              {loading ? "טוען…" : `עוד שיחות (${total - sessions.length})`}
            </button>
          )}
          {loading && sessions.length === 0 && <div className="aih-empty">טוען…</div>}
        </>
      )}
    </div>
  );
}
