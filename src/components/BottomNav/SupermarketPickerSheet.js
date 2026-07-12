import { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import SupermarketImage from "../Images/SupermarketImage";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import "./SupermarketPickerSheet.css";

/**
 * A bottom-sheet supermarket picker for action #5's "custom selection" compare
 * mode. Groups all supermarkets by chain; a chain can be expanded to toggle
 * individual branches, or selected whole (all its branches join the comparison).
 * Returns the chosen supermarket objects via onConfirm.
 *
 * @param {boolean} open
 * @param {Array<{supermarketID,name,address,city}>} supermarkets
 * @param {() => void} onClose
 * @param {(chosen: Array) => void} onConfirm
 */
export default function SupermarketPickerSheet({
  open,
  supermarkets,
  onClose,
  onConfirm,
}) {
  const [selected, setSelected] = useState(() => new Set());
  const [expanded, setExpanded] = useState(() => new Set());
  const [query, setQuery] = useState("");
  useBodyScrollLock(open);

  const chains = useMemo(() => {
    const map = new Map();
    (supermarkets || []).forEach((s) => {
      if (!s || s.supermarketID == null) return;
      const name = s.name || `סופר #${s.supermarketID}`;
      if (!map.has(name)) map.set(name, []);
      map.get(name).push(s);
    });
    const arr = [...map.entries()].map(([name, branches]) => ({
      name,
      branches,
    }));
    arr.sort(
      (a, b) =>
        b.branches.length - a.branches.length ||
        a.name.localeCompare(b.name, "he")
    );
    return arr;
  }, [supermarkets]);

  const q = query.trim();
  const filtered = useMemo(() => {
    if (!q) return chains;
    return chains
      .map((c) => {
        if (c.name.includes(q)) return c;
        const branches = c.branches.filter((b) =>
          [b.address, b.city].filter(Boolean).join(" ").includes(q)
        );
        return branches.length ? { ...c, branches } : null;
      })
      .filter(Boolean);
  }, [chains, q]);

  if (!open) return null;

  const toggleBranch = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const k = String(id);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  const chainState = (branches) => {
    const ids = branches.map((b) => String(b.supermarketID));
    const on = ids.filter((k) => selected.has(k)).length;
    return on === 0 ? "none" : on === ids.length ? "all" : "some";
  };

  const toggleChain = (branches) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const ids = branches.map((b) => String(b.supermarketID));
      const allOn = ids.every((k) => next.has(k));
      ids.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });

  const toggleExpand = (name) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const count = selected.size;
  const confirm = () => {
    const chosen = (supermarkets || []).filter((s) =>
      selected.has(String(s.supermarketID))
    );
    if (chosen.length) onConfirm(chosen);
  };

  return ReactDOM.createPortal(
    <div className="smpick" dir="rtl" onClick={onClose}>
      <div
        className="smpick__sheet"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-label="בחירת סופרים להשוואה"
      >
        <span className="smpick__grip" aria-hidden="true" />
        <div className="smpick__head">
          <span className="smpick__title">בחר סופרים להשוואה</span>
          <button
            type="button"
            className="smpick__x"
            onClick={onClose}
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        <input
          className="smpick__search"
          type="search"
          inputMode="search"
          placeholder="חיפוש רשת / כתובת / עיר…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="smpick__list">
          {filtered.map((c) => {
            const st = chainState(c.branches);
            const isOpen = expanded.has(c.name) || !!q;
            return (
              <div className="smpick__chain" key={c.name}>
                <div className="smpick__chain-row">
                  <button
                    type="button"
                    className={`smpick__check smpick__check--${st}`}
                    onClick={() => toggleChain(c.branches)}
                    aria-label={`בחר את כל סניפי ${c.name}`}
                  />
                  <button
                    type="button"
                    className="smpick__chain-main"
                    onClick={() => toggleExpand(c.name)}
                  >
                    <span className="smpick__chain-logo">
                      <SupermarketImage supermarketName={c.name} />
                    </span>
                    <span className="smpick__chain-name">{c.name}</span>
                    <span className="smpick__chain-count">
                      {c.branches.length}
                    </span>
                    <span
                      className={`smpick__chev${isOpen ? " is-open" : ""}`}
                      aria-hidden="true"
                    >
                      ‹
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <ul className="smpick__branches">
                    {c.branches.map((b) => {
                      const on = selected.has(String(b.supermarketID));
                      return (
                        <li key={b.supermarketID}>
                          <button
                            type="button"
                            className={`smpick__branch${on ? " is-on" : ""}`}
                            onClick={() => toggleBranch(b.supermarketID)}
                          >
                            <span
                              className={`smpick__check smpick__check--${
                                on ? "all" : "none"
                              }`}
                            />
                            <span className="smpick__branch-text">
                              {[b.address, b.city].filter(Boolean).join(" · ") ||
                                `סופר #${b.supermarketID}`}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <div className="smpick__foot">
          <span className="smpick__count">
            {count === 0
              ? "לא נבחרו סופרים"
              : count === 1
              ? "סופר אחד נבחר"
              : `${count} סופרים נבחרו`}
          </span>
          <button
            type="button"
            className="smpick__confirm"
            disabled={count === 0}
            onClick={confirm}
          >
            השווה מחירים
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
