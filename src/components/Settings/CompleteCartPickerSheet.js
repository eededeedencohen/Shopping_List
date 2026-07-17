import { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import "../BottomNav/SupermarketPickerSheet.css";
import { IconClose } from "../Icons/UiIcons";

/**
 * Bottom-sheet picker for the "complete cart" definition — a flat, searchable
 * multi-select of generalName strings. Toggling persists immediately (via
 * onToggle), matching the preferred-supermarkets picker.
 *
 * @param {boolean} open
 * @param {string[]} allNames    every distinct generalName
 * @param {string[]} selected    currently chosen names
 * @param {(name:string)=>void} onToggle
 * @param {()=>void} onClose
 */
export default function CompleteCartPickerSheet({
  open,
  allNames,
  selected,
  onToggle,
  onClose,
}) {
  const [query, setQuery] = useState("");
  useBodyScrollLock(open);

  const selectedSet = useMemo(() => new Set(selected || []), [selected]);

  const sorted = useMemo(() => {
    const names = [...new Set((allNames || []).filter(Boolean))];
    // selected first, then alphabetical (Hebrew)
    names.sort((a, b) => {
      const sa = selectedSet.has(a) ? 0 : 1;
      const sb = selectedSet.has(b) ? 0 : 1;
      return sa - sb || a.localeCompare(b, "he");
    });
    return names;
  }, [allNames, selectedSet]);

  const q = query.trim();
  const filtered = useMemo(
    () => (q ? sorted.filter((n) => n.includes(q)) : sorted),
    [sorted, q]
  );

  if (!open) return null;

  const count = selectedSet.size;

  return ReactDOM.createPortal(
    <div className="smpick" dir="rtl" onClick={onClose}>
      <div
        className="smpick__sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="בחירת מוצרים לעגלה השלמה"
      >
        <span className="smpick__grip" aria-hidden="true" />
        <div className="smpick__head">
          <span className="smpick__title">בחר מוצרים לעגלה השלמה</span>
          <button
            type="button"
            className="smpick__x"
            onClick={onClose}
            aria-label="סגור"
          >
            <IconClose />
          </button>
        </div>

        <input
          className="smpick__search"
          type="search"
          inputMode="search"
          placeholder="חיפוש מוצר…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="smpick__list">
          {filtered.map((name) => {
            const on = selectedSet.has(name);
            return (
              <button
                key={name}
                type="button"
                className={`smpick__flat${on ? " is-on" : ""}`}
                onClick={() => onToggle(name)}
              >
                <span
                  className={`smpick__check smpick__check--${on ? "all" : "none"}`}
                />
                <span className="smpick__flat-text">{name}</span>
              </button>
            );
          })}
          {!filtered.length && (
            <span className="smpick__empty">לא נמצאו מוצרים</span>
          )}
        </div>

        <div className="smpick__foot">
          <span className="smpick__count">
            {count === 0
              ? "לא נבחרו מוצרים"
              : count === 1
              ? "מוצר אחד נבחר"
              : `${count} מוצרים נבחרו`}
          </span>
          <button type="button" className="smpick__confirm" onClick={onClose}>
            סיום
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
