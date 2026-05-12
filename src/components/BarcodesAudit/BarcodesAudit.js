import React, { useEffect, useMemo, useRef, useState } from "react";
import { DOMAIN } from "../../constants";
import "./BarcodesAudit.css";

const SOURCE_TABS = [
  { value: "missing", label: "חסרים ב-DB" },
  { value: "existing", label: "קיימים ב-DB" },
];

const SCRAPE_TABS = [
  { value: "withPrices", label: "עם מחירים" },
  { value: "withoutPrices", label: "ללא מחירים" },
  { value: "notScraped", label: "לא נסרק" },
];

const IMAGE_TABS = [
  { value: "with", label: "עם תמונה" },
  { value: "without", label: "ללא תמונה" },
  { value: "orphan", label: "תמונות עודפות" },
];

export default function BarcodesAudit() {
  /* ─────  DB summary (existing/missing in Mongo)  ───── */
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  const [sourceTab, setSourceTab] = useState("missing");
  const [query, setQuery] = useState("");

  /* ─────  images coverage  ───── */
  const [imagesData, setImagesData] = useState(null);
  const [imagesError, setImagesError] = useState("");
  const [imageTab, setImageTab] = useState("without");
  const [imageQuery, setImageQuery] = useState("");
  const [showThumbs, setShowThumbs] = useState(false);

  /* ─────  chp.co.il scrape  ───── */
  const [scrapeStatus, setScrapeStatus] = useState(null);
  const [scrapeResults, setScrapeResults] = useState(null);
  const [scrapeTab, setScrapeTab] = useState("withPrices");
  const [scrapeQuery, setScrapeQuery] = useState("");
  const [actionPending, setActionPending] = useState(false);
  const [actionMsg, setActionMsg] = useState("");
  const pollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${DOMAIN}/api/v1/barcodes-audit/summary`);
        const json = await res.json();
        if (cancelled) return;
        if (json.status !== "success") {
          setSummaryError(json.message || "שגיאה בטעינת הסיכום");
          return;
        }
        setSummary(json.data);
      } catch (err) {
        if (!cancelled) setSummaryError(err.message);
      } finally {
        if (!cancelled) setSummaryLoading(false);
      }
    })();
    (async () => {
      try {
        const res = await fetch(
          `${DOMAIN}/api/v1/barcodes-audit/images-summary`
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.status !== "success") {
          setImagesError(json.message || "שגיאה בטעינת סיכום התמונות");
          return;
        }
        setImagesData(json.data);
      } catch (err) {
        if (!cancelled) setImagesError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadStatus = async () => {
    try {
      const res = await fetch(`${DOMAIN}/api/v1/barcodes-audit/scrape-status`);
      const json = await res.json();
      if (json.status === "success") setScrapeStatus(json.data);
    } catch {
      /* swallow */
    }
  };

  const loadResults = async () => {
    try {
      const res = await fetch(`${DOMAIN}/api/v1/barcodes-audit/scrape-results`);
      const json = await res.json();
      if (json.status === "success") setScrapeResults(json.data);
    } catch {
      /* swallow */
    }
  };

  useEffect(() => {
    loadStatus();
    loadResults();
  }, []);

  useEffect(() => {
    const running = scrapeStatus?.state === "running";
    if (running && !pollRef.current) {
      pollRef.current = setInterval(() => {
        loadStatus();
        loadResults();
      }, 2000);
    }
    if (!running && pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, [scrapeStatus?.state]);

  const handleStart = async (fresh) => {
    if (actionPending) return;
    if (
      fresh &&
      !window.confirm(
        "התחל מחדש? כל ה-HTML וקובץ ה-prices.json הקיים יימחקו."
      )
    ) {
      return;
    }
    setActionPending(true);
    setActionMsg("");
    try {
      const res = await fetch(
        `${DOMAIN}/api/v1/barcodes-audit/scrape-all`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fresh: !!fresh }),
        }
      );
      const json = await res.json();
      setActionMsg(json.message || "התחיל");
      await loadStatus();
    } catch (err) {
      setActionMsg("שגיאה: " + err.message);
    } finally {
      setActionPending(false);
    }
  };

  /* ─────  DB-summary list  ───── */
  const sourceList = useMemo(() => {
    if (!summary) return [];
    const src =
      sourceTab === "missing" ? summary.missingBarcodes : summary.existingBarcodes;
    const q = query.trim();
    return q ? src.filter((b) => b.includes(q)) : src;
  }, [summary, sourceTab, query]);

  /* ─────  Scrape results — filtered & sorted  ───── */
  const scrapeList = useMemo(() => {
    if (!scrapeResults?.items) return [];
    let src;
    if (scrapeTab === "withPrices") {
      src = scrapeResults.items.filter((it) => it.priceCount > 0);
    } else if (scrapeTab === "withoutPrices") {
      src = scrapeResults.items.filter(
        (it) => it.scraped && it.priceCount === 0
      );
    } else {
      src = scrapeResults.items.filter((it) => !it.scraped);
    }
    const q = scrapeQuery.trim();
    if (q) {
      src = src.filter(
        (it) =>
          it.barcode.includes(q) ||
          (it.name || "").toLowerCase().includes(q.toLowerCase())
      );
    }
    return [...src].sort((a, b) => b.priceCount - a.priceCount);
  }, [scrapeResults, scrapeTab, scrapeQuery]);

  const imagesList = useMemo(() => {
    if (!imagesData) return [];
    let src;
    if (imageTab === "with") src = imagesData.withImageBarcodes;
    else if (imageTab === "without") src = imagesData.withoutImageBarcodes;
    else src = imagesData.orphanBarcodes;
    const q = imageQuery.trim();
    return q ? src.filter((b) => b.includes(q)) : src;
  }, [imagesData, imageTab, imageQuery]);

  const isRunning = scrapeStatus?.state === "running";
  const progressPct =
    scrapeStatus && scrapeStatus.total
      ? Math.min(100, (scrapeStatus.done / scrapeStatus.total) * 100)
      : 0;

  return (
    <div className="ba-page">
      <header className="ba-header">
        <h1 className="ba-title">סיכום ברקודים</h1>
        <p className="ba-subtitle">
          השוואה בין <code>barcodes.json</code> שבשרת ל-Mongo, וסקרייפ מחירים
          מ-chp.co.il
        </p>
      </header>

      {/* ───────── DB summary ───────── */}
      {summaryLoading && (
        <div className="ba-card ba-state">
          <div className="ba-spinner" />
          <p>טוען סיכום…</p>
        </div>
      )}
      {summaryError && <div className="ba-card ba-error">{summaryError}</div>}

      {summary && (
        <>
          <section className="ba-section-title">
            <h2>במסד הנתונים</h2>
          </section>

          <section className="ba-stats">
            <div className="ba-stat ba-stat--total">
              <span className="ba-stat-label">סך הכל בקובץ</span>
              <span className="ba-stat-value">
                {summary.total.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--existing">
              <span className="ba-stat-label">קיימים ב-DB</span>
              <span className="ba-stat-value">
                {summary.existing.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--missing">
              <span className="ba-stat-label">חסרים</span>
              <span className="ba-stat-value">
                {summary.missing.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--percent">
              <span className="ba-stat-label">% כיסוי</span>
              <span className="ba-stat-value">
                {summary.percentage.toFixed(1)}
                <span className="ba-stat-unit">%</span>
              </span>
            </div>
          </section>

          <div
            className="ba-progress"
            aria-label={`${summary.percentage}% covered`}
          >
            <div
              className="ba-progress-fill"
              style={{ width: `${summary.percentage}%` }}
            />
            <span className="ba-progress-label">
              {summary.existing.toLocaleString()} /{" "}
              {summary.total.toLocaleString()}
            </span>
          </div>

          <section className="ba-list-card">
            <div className="ba-tabs">
              {SOURCE_TABS.map((t) => {
                const active = sourceTab === t.value;
                const count =
                  t.value === "missing" ? summary.missing : summary.existing;
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`ba-tab ${active ? "is-active" : ""}`}
                    onClick={() => setSourceTab(t.value)}
                  >
                    {t.label}
                    <span className="ba-tab-count">
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="ba-search">
              <input
                type="text"
                inputMode="numeric"
                className="ba-search-input"
                placeholder="חיפוש ברקוד…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {query && (
                <button
                  type="button"
                  className="ba-search-clear"
                  onClick={() => setQuery("")}
                  aria-label="נקה חיפוש"
                >
                  ×
                </button>
              )}
              <span className="ba-search-hint">
                {sourceList.length.toLocaleString()} תוצאות
              </span>
            </div>

            <ul className="ba-list">
              {sourceList.length === 0 ? (
                <li className="ba-list-empty">אין תוצאות</li>
              ) : (
                sourceList.slice(0, 500).map((b) => (
                  <li key={b} className="ba-list-item">
                    <span className="ba-list-barcode">{b}</span>
                  </li>
                ))
              )}
            </ul>

            {sourceList.length > 500 && (
              <p className="ba-list-truncated">
                מציג 500 ראשונים מתוך {sourceList.length.toLocaleString()} —
                צמצם חיפוש לראות עוד
              </p>
            )}
          </section>
        </>
      )}

      {/* ───────── Images coverage ───────── */}
      <section className="ba-section-title">
        <h2>תמונות</h2>
        <p className="ba-section-desc">
          קיבולת התמונות מ-<code>images/</code> בשרת מול הברקודים שב-
          <code>barcodes.json</code>
        </p>
      </section>

      {imagesError && <div className="ba-card ba-error">{imagesError}</div>}

      {imagesData && (
        <>
          <section className="ba-stats">
            <div className="ba-stat ba-stat--total">
              <span className="ba-stat-label">סך הכל בקובץ</span>
              <span className="ba-stat-value">
                {imagesData.total.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--existing">
              <span className="ba-stat-label">עם תמונה</span>
              <span className="ba-stat-value">
                {imagesData.withImage.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--missing">
              <span className="ba-stat-label">ללא תמונה</span>
              <span className="ba-stat-value">
                {imagesData.withoutImage.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--percent">
              <span className="ba-stat-label">% כיסוי</span>
              <span className="ba-stat-value">
                {imagesData.percentage.toFixed(1)}
                <span className="ba-stat-unit">%</span>
              </span>
            </div>
          </section>

          <div className="ba-progress">
            <div
              className="ba-progress-fill"
              style={{ width: `${imagesData.percentage}%` }}
            />
            <span className="ba-progress-label">
              {imagesData.withImage.toLocaleString()} /{" "}
              {imagesData.total.toLocaleString()}
            </span>
          </div>

          <div className="ba-images-meta">
            <span>
              סה"כ קבצים בתיקייה:{" "}
              <strong>{imagesData.totalImageFiles.toLocaleString()}</strong>
            </span>
            {imagesData.orphanCount > 0 && (
              <span className="ba-images-orphan-note">
                {imagesData.orphanCount.toLocaleString()} תמונות עודפות (ברקוד
                שלא קיים ב-<code>barcodes.json</code>)
              </span>
            )}
          </div>

          <section className="ba-list-card">
            <div className="ba-tabs">
              {IMAGE_TABS.map((t) => {
                const active = imageTab === t.value;
                let count = 0;
                if (t.value === "with") count = imagesData.withImage;
                else if (t.value === "without") count = imagesData.withoutImage;
                else count = imagesData.orphanCount;
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`ba-tab ${active ? "is-active" : ""}`}
                    onClick={() => setImageTab(t.value)}
                  >
                    {t.label}
                    <span className="ba-tab-count">
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="ba-search">
              <input
                type="text"
                inputMode="numeric"
                className="ba-search-input"
                placeholder="חיפוש ברקוד…"
                value={imageQuery}
                onChange={(e) => setImageQuery(e.target.value)}
              />
              {imageQuery && (
                <button
                  type="button"
                  className="ba-search-clear"
                  onClick={() => setImageQuery("")}
                  aria-label="נקה חיפוש"
                >
                  ×
                </button>
              )}
              <label className="ba-thumbs-toggle">
                <input
                  type="checkbox"
                  checked={showThumbs}
                  onChange={(e) => setShowThumbs(e.target.checked)}
                />
                הצג תמונות
              </label>
              <span className="ba-search-hint">
                {imagesList.length.toLocaleString()} תוצאות
              </span>
            </div>

            {showThumbs && imageTab !== "without" ? (
              <div className="ba-thumbs-grid">
                {imagesList.length === 0 ? (
                  <div className="ba-list-empty">אין תוצאות</div>
                ) : (
                  imagesList.slice(0, 200).map((b) => (
                    <div key={b} className="ba-thumb">
                      <div className="ba-thumb-img-wrap">
                        <img
                          src={`${DOMAIN}/images/${b}.jpg`}
                          alt={b}
                          loading="lazy"
                          onError={(e) => {
                            e.target.style.opacity = 0.18;
                          }}
                        />
                      </div>
                      <span className="ba-thumb-barcode">{b}</span>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <ul className="ba-list">
                {imagesList.length === 0 ? (
                  <li className="ba-list-empty">אין תוצאות</li>
                ) : (
                  imagesList.slice(0, 500).map((b) => (
                    <li key={b} className="ba-list-item">
                      <span className="ba-list-barcode">{b}</span>
                    </li>
                  ))
                )}
              </ul>
            )}

            {imagesList.length > (showThumbs ? 200 : 500) && (
              <p className="ba-list-truncated">
                מציג {showThumbs ? 200 : 500} ראשונים מתוך{" "}
                {imagesList.length.toLocaleString()} — צמצם חיפוש לראות עוד
              </p>
            )}
          </section>
        </>
      )}

      {/* ───────── chp.co.il scrape ───────── */}
      <section className="ba-section-title">
        <h2>סקרייפ מ-chp.co.il</h2>
        <p className="ba-section-desc">
          לכל ברקוד — מושך את עמוד chp.co.il, שומר HTML, ומאחד את כל המחירים
          לקובץ JSON אחד. לא נוגע ב-Mongo.
        </p>
      </section>

      <section className="ba-card ba-scrape-controls">
        <div className="ba-scrape-actions">
          <button
            type="button"
            className="ba-btn ba-btn--primary"
            onClick={() => handleStart(false)}
            disabled={isRunning || actionPending}
          >
            {isRunning ? "פועל…" : "המשך / התחל"}
          </button>
          <button
            type="button"
            className="ba-btn ba-btn--ghost"
            onClick={() => handleStart(true)}
            disabled={isRunning || actionPending}
          >
            התחל מחדש
          </button>
          <button
            type="button"
            className="ba-btn ba-btn--ghost"
            onClick={() => {
              loadStatus();
              loadResults();
            }}
            disabled={actionPending}
          >
            רענן
          </button>
          {actionMsg && <span className="ba-action-msg">{actionMsg}</span>}
        </div>

        {scrapeStatus && (
          <>
            <div className="ba-scrape-summary">
              <span className={`ba-pill ba-pill--${scrapeStatus.state}`}>
                {scrapeStatus.state === "running" && "● פועל"}
                {scrapeStatus.state === "done" && "✓ הסתיים"}
                {scrapeStatus.state === "failed" && "× נכשל"}
                {scrapeStatus.state === "idle" && "○ לא הופעל"}
              </span>
              {scrapeStatus.total > 0 && (
                <span className="ba-scrape-counter">
                  {scrapeStatus.done.toLocaleString()} /{" "}
                  {scrapeStatus.total.toLocaleString()}
                  {" · "}
                  <span className="ba-stat-existing-inline">
                    {scrapeStatus.ok.toLocaleString()} OK
                  </span>
                  {scrapeStatus.fail > 0 && (
                    <>
                      {" · "}
                      <span className="ba-stat-fail-inline">
                        {scrapeStatus.fail} שגיאות
                      </span>
                    </>
                  )}
                  {scrapeStatus.skipped > 0 && (
                    <>
                      {" · "}
                      <span className="ba-stat-muted-inline">
                        {scrapeStatus.skipped} דולגו
                      </span>
                    </>
                  )}
                </span>
              )}
            </div>

            {scrapeStatus.total > 0 && (
              <div className="ba-progress">
                <div
                  className="ba-progress-fill"
                  style={{ width: `${progressPct}%` }}
                />
                <span className="ba-progress-label">
                  {progressPct.toFixed(1)}%
                </span>
              </div>
            )}

            {scrapeStatus.currentBarcode && isRunning && (
              <p className="ba-current-barcode">
                כעת: <code>{scrapeStatus.currentBarcode}</code>
              </p>
            )}

            {scrapeStatus.lastError && (
              <p className="ba-last-error">
                שגיאה אחרונה: {scrapeStatus.lastError}
              </p>
            )}
          </>
        )}
      </section>

      {/* ───────── results breakdown ───────── */}
      {scrapeResults?.ready && (
        <>
          <section className="ba-stats">
            <div className="ba-stat ba-stat--total">
              <span className="ba-stat-label">סך הכל בקובץ</span>
              <span className="ba-stat-value">
                {scrapeResults.total.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--existing">
              <span className="ba-stat-label">עם מחירים</span>
              <span className="ba-stat-value">
                {scrapeResults.withPrices.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--missing">
              <span className="ba-stat-label">ללא מחירים</span>
              <span className="ba-stat-value">
                {scrapeResults.withoutPrices.toLocaleString()}
              </span>
            </div>
            <div className="ba-stat ba-stat--neutral">
              <span className="ba-stat-label">לא נסרקו</span>
              <span className="ba-stat-value">
                {scrapeResults.notScraped.toLocaleString()}
              </span>
            </div>
          </section>

          <section className="ba-card ba-dist">
            <h3 className="ba-dist-title">התפלגות מספר מחירים לברקוד</h3>
            <div className="ba-dist-grid">
              {Object.entries(scrapeResults.distribution).map(([range, n]) => (
                <div key={range} className="ba-dist-cell">
                  <span className="ba-dist-cell-label">{range}</span>
                  <span className="ba-dist-cell-val">
                    {n.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="ba-list-card">
            <div className="ba-tabs">
              {SCRAPE_TABS.map((t) => {
                const active = scrapeTab === t.value;
                let count = 0;
                if (t.value === "withPrices") count = scrapeResults.withPrices;
                else if (t.value === "withoutPrices")
                  count = scrapeResults.withoutPrices;
                else count = scrapeResults.notScraped;
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`ba-tab ${active ? "is-active" : ""}`}
                    onClick={() => setScrapeTab(t.value)}
                  >
                    {t.label}
                    <span className="ba-tab-count">
                      {count.toLocaleString()}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="ba-search">
              <input
                type="text"
                className="ba-search-input"
                placeholder="חיפוש ברקוד או שם…"
                value={scrapeQuery}
                onChange={(e) => setScrapeQuery(e.target.value)}
              />
              {scrapeQuery && (
                <button
                  type="button"
                  className="ba-search-clear"
                  onClick={() => setScrapeQuery("")}
                  aria-label="נקה חיפוש"
                >
                  ×
                </button>
              )}
              <span className="ba-search-hint">
                {scrapeList.length.toLocaleString()} תוצאות
              </span>
            </div>

            <ul className="ba-result-list">
              {scrapeList.length === 0 ? (
                <li className="ba-list-empty">אין תוצאות</li>
              ) : (
                scrapeList.slice(0, 500).map((it) => (
                  <li
                    key={it.barcode}
                    className={`ba-result-item ${
                      it.hasError ? "is-error" : ""
                    }`}
                  >
                    <span className="ba-result-barcode">{it.barcode}</span>
                    <span className="ba-result-name">{it.name || "—"}</span>
                    <span
                      className={`ba-result-count ${
                        it.priceCount === 0 ? "is-zero" : "is-positive"
                      }`}
                    >
                      {it.priceCount}
                    </span>
                  </li>
                ))
              )}
            </ul>

            {scrapeList.length > 500 && (
              <p className="ba-list-truncated">
                מציג 500 ראשונים מתוך {scrapeList.length.toLocaleString()} —
                צמצם חיפוש לראות עוד
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
