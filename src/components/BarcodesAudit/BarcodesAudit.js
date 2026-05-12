import React, { useEffect, useMemo, useState } from "react";
import { DOMAIN } from "../../constants";
import "./BarcodesAudit.css";

const TABS = [
  { value: "missing", label: "חסרים" },
  { value: "existing", label: "קיימים" },
];

export default function BarcodesAudit() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("missing");
  const [query, setQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${DOMAIN}/api/v1/barcodes-audit/summary`
        );
        const json = await res.json();
        if (cancelled) return;
        if (json.status !== "success") {
          setError(json.message || "שגיאה בטעינת הסיכום");
          return;
        }
        setData(json.data);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const list = useMemo(() => {
    if (!data) return [];
    const src =
      tab === "missing" ? data.missingBarcodes : data.existingBarcodes;
    const q = query.trim();
    if (!q) return src;
    return src.filter((b) => b.includes(q));
  }, [data, tab, query]);

  return (
    <div className="ba-page">
      <header className="ba-header">
        <h1 className="ba-title">סיכום ברקודים</h1>
        <p className="ba-subtitle">
          השוואה בין <code>barcodes.json</code> שבשרת לבין מסד הנתונים
        </p>
      </header>

      {loading && (
        <div className="ba-card ba-state">
          <div className="ba-spinner" />
          <p>טוען סיכום…</p>
        </div>
      )}

      {error && <div className="ba-card ba-error">{error}</div>}

      {data && (
        <>
          {/* Summary stats */}
          <section className="ba-stats">
            <div className="ba-stat ba-stat--total">
              <span className="ba-stat-label">סך הכל בקובץ</span>
              <span className="ba-stat-value">{data.total.toLocaleString()}</span>
            </div>
            <div className="ba-stat ba-stat--existing">
              <span className="ba-stat-label">קיימים ב-DB</span>
              <span className="ba-stat-value">{data.existing.toLocaleString()}</span>
            </div>
            <div className="ba-stat ba-stat--missing">
              <span className="ba-stat-label">חסרים</span>
              <span className="ba-stat-value">{data.missing.toLocaleString()}</span>
            </div>
            <div className="ba-stat ba-stat--percent">
              <span className="ba-stat-label">% כיסוי</span>
              <span className="ba-stat-value">
                {data.percentage.toFixed(1)}
                <span className="ba-stat-unit">%</span>
              </span>
            </div>
          </section>

          {/* Progress bar */}
          <div className="ba-progress" aria-label={`${data.percentage}% covered`}>
            <div
              className="ba-progress-fill"
              style={{ width: `${data.percentage}%` }}
            />
            <span className="ba-progress-label">
              {data.existing.toLocaleString()} / {data.total.toLocaleString()}
            </span>
          </div>

          {/* List of barcodes (existing/missing) */}
          <section className="ba-list-card">
            <div className="ba-tabs">
              {TABS.map((t) => {
                const active = tab === t.value;
                const count =
                  t.value === "missing" ? data.missing : data.existing;
                return (
                  <button
                    key={t.value}
                    type="button"
                    className={`ba-tab ${active ? "is-active" : ""}`}
                    onClick={() => setTab(t.value)}
                  >
                    {t.label}
                    <span className="ba-tab-count">{count.toLocaleString()}</span>
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
                {list.length.toLocaleString()} תוצאות
              </span>
            </div>

            <ul className="ba-list">
              {list.length === 0 ? (
                <li className="ba-list-empty">אין תוצאות</li>
              ) : (
                list.slice(0, 500).map((b) => (
                  <li key={b} className="ba-list-item">
                    <span className="ba-list-barcode">{b}</span>
                  </li>
                ))
              )}
            </ul>

            {list.length > 500 && (
              <p className="ba-list-truncated">
                מציג 500 ראשונים מתוך {list.length.toLocaleString()} — צמצם
                חיפוש לראות עוד
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
