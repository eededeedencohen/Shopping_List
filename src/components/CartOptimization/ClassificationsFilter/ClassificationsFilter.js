import React, { useState } from "react";
import "./ClassificationsFilter.css";
import {
  useProductClassifications,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";

/* Classification-tag filter for one cart product — the NEW pre-filter that
   runs before the brand + weight filtering:
     • tap cycles a tag: none → green (רק כאלה) → red (בשום אופן) → none
     • a row with greens = whitelist; red always excludes; all-white = no effect
     • per row: reset ("איפוס") and "כל חסרי הצבע לאדום"
     • numeric rows (אחוז שומן…) get a "טווח" mode: tap the first value, then
       the last — everything in between turns green in one gesture.
   Rendered only for products that belong to a classification family. */

const IconReset = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);

export default function ClassificationsFilter({ barcode, rules }) {
  const { familyDef, family } = useProductClassifications(barcode);
  const {
    cycleClassificationTag,
    resetClassificationRow,
    classificationBlankToRed,
    setClassificationRangeGreen,
  } = useSettingsOperations();

  /* numeric range mode: { rowName, anchorTag|null } */
  const [rangePick, setRangePick] = useState(null);

  if (!familyDef) return null;

  const rows = familyDef.types || [];
  const ruleOf = (rowName) => (rules && rules.rows && rules.rows[rowName]) || {};
  const stateOf = (rowName, tag) => {
    const r = ruleOf(rowName);
    if ((r.green || []).includes(tag)) return "green";
    if ((r.red || []).includes(tag)) return "red";
    return "none";
  };

  const onChipClick = (row, tag) => {
    if (rangePick && rangePick.rowName === row.name) {
      if (rangePick.anchorTag == null) {
        setRangePick({ rowName: row.name, anchorTag: tag });
        return;
      }
      const tags = row.values.map((v) => v.tag);
      const i1 = tags.indexOf(rangePick.anchorTag);
      const i2 = tags.indexOf(tag);
      const [from, to] = i1 <= i2 ? [i1, i2] : [i2, i1];
      setClassificationRangeGreen(
        barcode,
        family,
        row.name,
        tags.slice(from, to + 1)
      );
      setRangePick(null);
      return;
    }
    cycleClassificationTag(barcode, family, row.name, tag);
  };

  return (
    <section className="cf" dir="rtl">
      <div className="cf-head">
        <span className="cf-title">סינון לפי תיוגים</span>
        <span className="cf-legend">
          <i className="cf-dotd cf-dotd--green" /> רק כאלה
          <i className="cf-dotd cf-dotd--red" /> בשום אופן
        </span>
      </div>

      {rows.map((row) => {
        const inRange = rangePick && rangePick.rowName === row.name;
        return (
          <div className={`cf-row${inRange ? " cf-row--range" : ""}`} key={row.name}>
            <div className="cf-row-top">
              <span className="cf-row-name">{row.name}</span>
              {row.kind === "מספרי" && (
                <button
                  type="button"
                  className={`cf-rowbtn cf-rowbtn--range${inRange ? " is-on" : ""}`}
                  title="סימון טווח: הקש על הערך הראשון ואז על האחרון"
                  onClick={() =>
                    setRangePick(inRange ? null : { rowName: row.name, anchorTag: null })
                  }
                >
                  טווח
                </button>
              )}
              <button
                type="button"
                className="cf-rowbtn"
                title="כל חסרי הצבע לאדום"
                onClick={() =>
                  classificationBlankToRed(
                    barcode,
                    family,
                    row.name,
                    row.values.map((v) => v.tag)
                  )
                }
              >
                השאר לאדום
              </button>
              <button
                type="button"
                className="cf-rowbtn cf-rowbtn--icon"
                title="איפוס השורה"
                aria-label="איפוס השורה"
                onClick={() => {
                  resetClassificationRow(barcode, family, row.name);
                  if (inRange) setRangePick(null);
                }}
              >
                <IconReset />
              </button>
            </div>

            <div className="cf-chips">
              {row.values.map((v) => {
                const st = stateOf(row.name, v.tag);
                const isAnchor = inRange && rangePick.anchorTag === v.tag;
                return (
                  <button
                    key={v.tag}
                    type="button"
                    className={`cf-chip cf-chip--${st}${isAnchor ? " is-anchor" : ""}`}
                    onClick={() => onChipClick(row, v.tag)}
                  >
                    {v.tag}
                  </button>
                );
              })}
            </div>

            {inRange && (
              <div className="cf-range-hint">
                {rangePick.anchorTag == null
                  ? "הקש על הערך הראשון בטווח"
                  : `מ-${rangePick.anchorTag} — הקש על הערך האחרון בטווח`}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
