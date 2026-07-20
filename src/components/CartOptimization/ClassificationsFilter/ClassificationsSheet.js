import React, { useMemo, useRef, useState, useEffect } from "react";
import "./ClassificationsSheet.css";
import BottomSheet from "../BottomSheet/BottomSheet";
import { useSettingsOperations } from "../../../hooks/optimizationHooks";

/* Tag-filter editor for one cart product, inside the shared bottom sheet.
     • numeric rows (אחוז שומן…) — a dual-handle range slider over the values
       that actually exist in the catalog; the selected span turns green.
     • string rows — chips cycling none → green (רק כאלה) → red (בשום אופן).
     • per row: "שאר הערכים לאדום" (everything uncolored turns red) + reset.
     • sticky footer: live match count + reset-all + done.
   The rules semantics are untouched — this is only a new surface over the
   existing hook operations. */

const isNumericRow = (row) => row.kind === "מספרי" && (row.values || []).length >= 3;

const sortedNumericTags = (row) =>
  [...(row.values || [])]
    .map((v) => v.tag)
    .sort((a, b) => parseFloat(a) - parseFloat(b));

/* ───────────────────────── numeric range slider ───────────────────────── */

function RangeRow({ barcode, family, row, rule }) {
  const { setClassificationRowGreenExact, classificationBlankToRed, resetClassificationRow } =
    useSettingsOperations();

  const tags = useMemo(() => sortedNumericTags(row), [row]);
  const n = tags.length;
  const reds = useMemo(() => new Set(rule.red || []), [rule]);

  /* derive [lo, hi] indexes from the row's greens (empty → full span) */
  const derived = useMemo(() => {
    const greens = rule.green || [];
    if (!greens.length) return [0, n - 1];
    const idxs = greens
      .map((t) => tags.indexOf(t))
      .filter((i) => i !== -1);
    if (!idxs.length) return [0, n - 1];
    return [Math.min(...idxs), Math.max(...idxs)];
  }, [rule, tags, n]);

  const [range, setRange] = useState(derived);
  const [isDragging, setIsDragging] = useState(false);
  const dragHandle = useRef(null);
  const trackRef = useRef(null);

  /* resync when the rules change from outside (reset buttons etc.) */
  useEffect(() => {
    if (!isDragging) setRange(derived);
  }, [derived, isDragging]);

  const [lo, hi] = range;
  const pct = (i) => (n <= 1 ? 0 : (i / (n - 1)) * 100);

  const indexFromX = (clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    /* RTL: the smallest value sits on the RIGHT edge */
    const frac = (r.right - clientX) / r.width;
    return Math.max(0, Math.min(n - 1, Math.round(frac * (n - 1))));
  };

  const commit = ([a, b]) => {
    setClassificationRowGreenExact(
      barcode,
      family,
      row.name,
      tags.slice(a, b + 1),
      tags
    );
  };

  const onPointerDown = (e) => {
    if (n <= 1) return;
    e.preventDefault();
    const idx = indexFromX(e.clientX);
    /* grab the nearer handle */
    const handle = Math.abs(idx - lo) <= Math.abs(idx - hi) ? "lo" : "hi";
    dragHandle.current = handle;
    setIsDragging(true);
    setRange(handle === "lo" ? [Math.min(idx, hi), hi] : [lo, Math.max(idx, lo)]);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!isDragging || dragHandle.current == null) return;
    const idx = indexFromX(e.clientX);
    setRange(([a, b]) =>
      dragHandle.current === "lo"
        ? [Math.min(idx, b), b]
        : [a, Math.max(idx, a)]
    );
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    dragHandle.current = null;
    setRange((r) => {
      commit(r);
      return r;
    });
  };

  const isFull = lo === 0 && hi === n - 1;

  return (
    <div className="cs-group">
      <div className="cs-group-head">
        <h4 className="cs-group-name">{row.name}</h4>
        <button
          type="button"
          className="cs-groupbtn"
          title="כל הערכים שמחוץ לטווח הירוק יסומנו באדום"
          onClick={() => classificationBlankToRed(barcode, family, row.name, tags)}
        >
          שאר הערכים לאדום
        </button>
        <button
          type="button"
          className="cs-groupbtn"
          onClick={() => resetClassificationRow(barcode, family, row.name)}
        >
          איפוס
        </button>
      </div>

      <div className="cs-slider">
        <div
          className="cs-slider-track"
          ref={trackRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div className="cs-slider-rail" />
          <div
            className="cs-slider-fill"
            style={{ right: `${pct(lo)}%`, width: `${pct(hi) - pct(lo)}%` }}
          />
          {tags.map((t, i) => (
            <span
              key={t}
              className={`cs-tick${i >= lo && i <= hi ? " in" : ""}${
                reds.has(t) ? " red" : ""
              }`}
              style={{ right: `${pct(i)}%` }}
            />
          ))}
          <span className="cs-handle" style={{ right: `${pct(lo)}%` }} />
          <span className="cs-handle" style={{ right: `${pct(hi)}%` }} />
        </div>
        <div className="cs-slider-edge">
          <span>{tags[0]}</span>
          <span>{tags[n - 1]}</span>
        </div>
        <div className={`cs-slider-out${isFull ? " is-full" : ""}`}>
          {isFull
            ? "כל הערכים מותרים"
            : `בין ${tags[lo]} ל־${tags[hi]}`}
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── string chips row ───────────────────────── */

function ChipsRow({ barcode, family, row, rule }) {
  const { cycleClassificationTag, classificationBlankToRed, resetClassificationRow } =
    useSettingsOperations();

  const stateOf = (tag) => {
    if ((rule.green || []).includes(tag)) return "green";
    if ((rule.red || []).includes(tag)) return "red";
    return "none";
  };

  return (
    <div className="cs-group">
      <div className="cs-group-head">
        <h4 className="cs-group-name">{row.name}</h4>
        <button
          type="button"
          className="cs-groupbtn"
          title="כל הערכים חסרי הצבע יסומנו באדום"
          onClick={() =>
            classificationBlankToRed(
              barcode,
              family,
              row.name,
              row.values.map((v) => v.tag)
            )
          }
        >
          שאר הערכים לאדום
        </button>
        <button
          type="button"
          className="cs-groupbtn"
          onClick={() => resetClassificationRow(barcode, family, row.name)}
        >
          איפוס
        </button>
      </div>
      <div className="cs-chips">
        {row.values.map((v) => (
          <button
            key={v.tag}
            type="button"
            className={`cs-chip cs-chip--${stateOf(v.tag)}`}
            onClick={() => cycleClassificationTag(barcode, family, row.name, v.tag)}
          >
            {v.tag}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── the sheet ───────────────────────── */

export default function ClassificationsSheet({
  isOpen,
  onClose,
  barcode,
  family,
  familyDef,
  rules,
  matchCount,
}) {
  const { clearClassificationRules } = useSettingsOperations();

  /* the "מותג" row duplicates the brands filter — never shown here */
  const rows = ((familyDef && familyDef.types) || []).filter(
    (t) => t.name !== "מותג"
  );

  const ruleOf = (rowName) => (rules && rules.rows && rules.rows[rowName]) || {};

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="סינון לפי תיוגים"
      headEnd={
        <span className="cs-legend">
          <i className="cs-dot cs-dot--green" /> רק כאלה
          <i className="cs-dot cs-dot--red" /> בשום אופן
        </span>
      }
      footer={
        <>
          <span className={`bsheet-match${matchCount === 0 ? " is-zero" : ""}`}>
            <b>{matchCount}</b> מוצרים תואמים
          </span>
          <button
            type="button"
            className="bsheet-btn"
            onClick={() => clearClassificationRules(barcode, family)}
          >
            איפוס הכול
          </button>
          <button type="button" className="bsheet-btn bsheet-btn--done" onClick={onClose}>
            סיום
          </button>
        </>
      }
    >
      {rows.map((row) =>
        isNumericRow(row) ? (
          <RangeRow
            key={row.name}
            barcode={barcode}
            family={family}
            row={row}
            rule={ruleOf(row.name)}
          />
        ) : (
          <ChipsRow
            key={row.name}
            barcode={barcode}
            family={family}
            row={row}
            rule={ruleOf(row.name)}
          />
        )
      )}
    </BottomSheet>
  );
}
