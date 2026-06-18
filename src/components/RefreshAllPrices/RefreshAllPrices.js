import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./RefreshAllPrices.css";
import {
  startRefreshAllPrices,
  getRefreshStatus,
} from "../../services/priceRefreshService";

const POLL_INTERVAL_MS = 1500;

const PHASE_INFO = {
  fetching: {
    label: "טעינת HTML מ-CHP",
    hint: "מורידים את עמוד המחירים של כל ברקוד",
  },
  parsing: {
    label: "חילוץ מחירים",
    hint: "מנתחים כל עמוד ומפיקים את שורות המחירים",
  },
  writing: {
    label: "החלפת המחירים במסד הנתונים",
    hint: "מוחקים מחירים ישנים ומכניסים את החדשים",
  },
};

const PHASE_ORDER = ["fetching", "parsing", "writing"];

function formatDuration(ms) {
  if (!ms || ms < 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s} שנ׳`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m} דק׳ ${rem ? `${rem} שנ׳` : ""}`.trim();
}

function pct(done, total) {
  if (!total) return 0;
  return Math.min(100, Math.max(0, (done / total) * 100));
}

function deriveView(status) {
  if (!status) return null;
  const total = status.total || 0;
  return {
    state: status.state,
    phase: status.phase,
    total,
    current: status.currentBarcode,
    fetching: {
      done: status.fetched || 0,
      ok: status.fetchedOk || 0,
      fail: status.fetchedFail || 0,
      pct: pct(status.fetched, total),
      duration: status.phaseDuration?.fetching || 0,
    },
    parsing: {
      done: status.parsed || 0,
      ok: status.parsedOk || 0,
      fail: status.parsedFail || 0,
      pct: pct(status.parsed, total),
      duration: status.phaseDuration?.parsing || 0,
    },
    writing: {
      done: status.written || 0,
      ok: status.writtenOk || 0,
      fail: status.writtenFail || 0,
      pct: pct(status.written, total),
      duration: status.phaseDuration?.writing || 0,
    },
    summary: {
      totalPrices: status.totalPricesUpserted || 0,
      barcodesWithPrices: status.barcodesWithPrices || 0,
      barcodesWithoutPrices: status.barcodesWithoutPrices || 0,
      newSupermarkets: status.newSupermarkets || 0,
      durationMs: status.durationMs || 0,
      startedAt: status.startedAt,
      finishedAt: status.finishedAt,
    },
    lastError: status.lastError,
    errors: status.errors || [],
  };
}

export default function RefreshAllPrices() {
  const [status, setStatus] = useState(null);
  const [initialized, setInitialized] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState(null);
  const pollRef = useRef(null);

  /* Initial fetch */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await getRefreshStatus();
        if (!cancelled) {
          setStatus(s);
          setInitialized(true);
        }
      } catch {
        if (!cancelled) setInitialized(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /* Poll while running */
  const currentState = status ? status.state : null;
  useEffect(() => {
    const isRunning = currentState === "running";
    if (isRunning && !pollRef.current) {
      pollRef.current = setInterval(async () => {
        try {
          const s = await getRefreshStatus();
          setStatus(s);
        } catch {
          /* network blips — keep polling */
        }
      }, POLL_INTERVAL_MS);
    } else if (!isRunning && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, [currentState]);

  /* Clear on unmount */
  useEffect(
    () => () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    },
    []
  );

  const handleStart = async () => {
    if (starting) return;
    setStarting(true);
    setStartError(null);
    try {
      await startRefreshAllPrices();
      const s = await getRefreshStatus();
      setStatus(s);
    } catch (err) {
      setStartError(err.message || "שגיאה בהפעלת העדכון");
    } finally {
      setStarting(false);
    }
  };

  const view = deriveView(status);
  const uiMode = (() => {
    if (!initialized) return "loading";
    if (!status || status.state === "idle") return "confirm";
    if (status.state === "running") return "running";
    if (status.state === "done") return "done";
    if (status.state === "failed") return "failed";
    return "confirm";
  })();

  return (
    <div className="rfp-page">
      <div className="rfp-page-inner">
        <header className="rfp-page-header">
          <Link to="/settings" className="rfp-back-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            חזרה להגדרות
          </Link>
          <h1 className="rfp-page-title">רענון כל המחירים מ-CHP</h1>
          <p className="rfp-page-subtitle">
            {uiMode === "confirm" && "פעולה גדולה שיכולה לקחת מספר דקות"}
            {uiMode === "running" &&
              (view?.phase ? PHASE_INFO[view.phase]?.hint || "" : "מתחיל…")}
            {uiMode === "done" && "כל המחירים עודכנו"}
            {uiMode === "failed" && "העדכון נכשל"}
            {uiMode === "loading" && "טוען מצב נוכחי…"}
          </p>
        </header>

        <div className="rfp-page-content">
          {uiMode === "loading" && (
            <div className="rfp-loading">
              <div className="rfp-spinner" aria-hidden />
            </div>
          )}

          {uiMode === "confirm" && (
            <ConfirmView
              starting={starting}
              startError={startError}
              onStart={handleStart}
            />
          )}

          {uiMode === "running" && view && <RunningView view={view} />}

          {uiMode === "done" && view && (
            <SummaryView
              view={view}
              kind="done"
              starting={starting}
              startError={startError}
              onRetry={handleStart}
            />
          )}

          {uiMode === "failed" && view && (
            <SummaryView
              view={view}
              kind="failed"
              starting={starting}
              startError={startError}
              onRetry={handleStart}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────  Sub-views  ───────────────────────── */

function ConfirmView({ starting, startError, onStart }) {
  return (
    <div className="rfp-confirm">
      <p className="rfp-confirm-lead">
        הפעולה תטען מ-chp.co.il את עמוד המחירים של <b>כל מוצר ב-DB</b>,
        תחלץ את המחירים, ותחליף את כל אובייקטי המחירים במסד הנתונים.
      </p>

      <ul className="rfp-confirm-steps">
        <li>
          <span className="rfp-step-num">1</span>
          <span>טעינת HTML של כל ברקוד מ-CHP (במקביל, ~25 בו-זמנית)</span>
        </li>
        <li>
          <span className="rfp-step-num">2</span>
          <span>חילוץ המחירים מכל עמוד</span>
        </li>
        <li>
          <span className="rfp-step-num">3</span>
          <span>החלפה אטומית של כל מחיר לפי ברקוד במסד הנתונים</span>
        </li>
      </ul>

      <p className="rfp-confirm-warn">
        ⚠ כל מחירי המוצרים הקיימים יוחלפו במחירים העדכניים מ-CHP.
      </p>

      <button
        type="button"
        className={`rfp-start-btn ${starting ? "is-loading" : ""}`}
        onClick={onStart}
        disabled={starting}
      >
        {starting ? (
          <span className="rfp-btn-spinner" aria-hidden />
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
        )}
        {starting ? "מפעיל…" : "התחל רענון"}
      </button>

      {startError && <div className="rfp-error">{startError}</div>}
    </div>
  );
}

function RunningView({ view }) {
  const activePhase = view.phase;
  const isPhaseActive = (key) => activePhase === key;
  const isPhaseDone = (key) => {
    if (activePhase === "done") return true;
    const i = PHASE_ORDER.indexOf(activePhase);
    const j = PHASE_ORDER.indexOf(key);
    return i > j;
  };

  return (
    <div className="rfp-running">
      <div className="rfp-total-row">
        <span className="rfp-total-label">סה"כ ברקודים</span>
        <span className="rfp-total-value">{view.total.toLocaleString()}</span>
      </div>

      {PHASE_ORDER.map((key, idx) => {
        const info = PHASE_INFO[key];
        const data = view[key];
        const active = isPhaseActive(key);
        const done = isPhaseDone(key);
        const pending = !active && !done;
        return (
          <div
            key={key}
            className={`rfp-phase ${active ? "is-active" : ""} ${
              done ? "is-done" : ""
            } ${pending ? "is-pending" : ""}`}
          >
            <div className="rfp-phase-header">
              <div className="rfp-phase-num-wrap">
                <span className="rfp-phase-num">
                  {done ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    idx + 1
                  )}
                </span>
              </div>
              <div className="rfp-phase-title-wrap">
                <span className="rfp-phase-title">{info.label}</span>
                <span className="rfp-phase-hint">{info.hint}</span>
              </div>
              <span className="rfp-phase-counter">
                {data.done.toLocaleString()} / {view.total.toLocaleString()}
              </span>
            </div>

            <div className="rfp-progress">
              <div
                className="rfp-progress-fill"
                style={{ width: `${data.pct}%` }}
              />
              <span className="rfp-progress-label">{data.pct.toFixed(1)}%</span>
            </div>

            <div className="rfp-phase-stats">
              <span className="rfp-stat rfp-stat--ok">
                ✓ {data.ok.toLocaleString()}
              </span>
              {data.fail > 0 && (
                <span className="rfp-stat rfp-stat--fail">
                  ✕ {data.fail.toLocaleString()}
                </span>
              )}
              {done && (
                <span className="rfp-stat rfp-stat--time">
                  ⏱ {formatDuration(data.duration)}
                </span>
              )}
            </div>
          </div>
        );
      })}

      {view.current && view.state === "running" && (
        <div className="rfp-current">
          ברקוד נוכחי:{" "}
          <span className="rfp-current-bc" dir="ltr">
            {view.current}
          </span>
        </div>
      )}
    </div>
  );
}

function SummaryView({ view, kind, starting, startError, onRetry }) {
  return (
    <div className={`rfp-summary rfp-summary--${kind}`}>
      <div className="rfp-summary-icon">
        {kind === "done" ? (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        )}
      </div>

      <h2 className="rfp-summary-title">
        {kind === "done" ? "העדכון הושלם בהצלחה" : "העדכון נכשל"}
      </h2>

      <div className="rfp-summary-grid">
        <div className="rfp-summary-cell">
          <span className="rfp-summary-cell-label">ברקודים שטופלו</span>
          <span className="rfp-summary-cell-value">
            {view.total.toLocaleString()}
          </span>
        </div>
        <div className="rfp-summary-cell">
          <span className="rfp-summary-cell-label">סה"כ מחירים שנכתבו</span>
          <span className="rfp-summary-cell-value">
            {view.summary.totalPrices.toLocaleString()}
          </span>
        </div>
        <div className="rfp-summary-cell">
          <span className="rfp-summary-cell-label">ברקודים עם מחירים</span>
          <span className="rfp-summary-cell-value">
            {view.summary.barcodesWithPrices.toLocaleString()}
          </span>
        </div>
        <div className="rfp-summary-cell">
          <span className="rfp-summary-cell-label">ברקודים ללא תוצאות</span>
          <span className="rfp-summary-cell-value">
            {view.summary.barcodesWithoutPrices.toLocaleString()}
          </span>
        </div>
        <div className="rfp-summary-cell">
          <span className="rfp-summary-cell-label">סניפים חדשים</span>
          <span className="rfp-summary-cell-value">
            {view.summary.newSupermarkets.toLocaleString()}
          </span>
        </div>
        <div className="rfp-summary-cell">
          <span className="rfp-summary-cell-label">זמן כולל</span>
          <span className="rfp-summary-cell-value">
            {formatDuration(view.summary.durationMs)}
          </span>
        </div>
      </div>

      <div className="rfp-summary-phases">
        {PHASE_ORDER.map((key, idx) => {
          const info = PHASE_INFO[key];
          const data = view[key];
          return (
            <div key={key} className="rfp-summary-phase">
              <span className="rfp-summary-phase-num">{idx + 1}</span>
              <span className="rfp-summary-phase-name">{info.label}</span>
              <span className="rfp-summary-phase-stats">
                <span className="rfp-stat rfp-stat--ok">
                  ✓ {data.ok.toLocaleString()}
                </span>
                {data.fail > 0 && (
                  <span className="rfp-stat rfp-stat--fail">
                    ✕ {data.fail.toLocaleString()}
                  </span>
                )}
                <span className="rfp-stat rfp-stat--time">
                  ⏱ {formatDuration(data.duration)}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      {kind === "failed" && view.lastError && (
        <div className="rfp-error">{view.lastError}</div>
      )}

      {onRetry && (
        <button
          type="button"
          className={`rfp-start-btn ${starting ? "is-loading" : ""}`}
          onClick={onRetry}
          disabled={starting}
        >
          {starting ? (
            <span className="rfp-btn-spinner" aria-hidden />
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          )}
          {starting
            ? "מפעיל…"
            : kind === "failed"
            ? "נסה שוב (ימשיך מהקבצים השמורים)"
            : "התחל ריצה חדשה"}
        </button>
      )}

      {startError && <div className="rfp-error">{startError}</div>}

      {view.errors && view.errors.length > 0 && (
        <details className="rfp-errors-details">
          <summary>הראה {view.errors.length} שגיאות</summary>
          <ul className="rfp-errors-list">
            {view.errors.slice(0, 30).map((e, i) => (
              <li key={i}>
                <span className="rfp-err-phase">[{e.phase}]</span>{" "}
                <span className="rfp-err-bc" dir="ltr">
                  {e.barcode}
                </span>{" "}
                — <span className="rfp-err-msg">{e.message}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
