import React, { useMemo } from "react";
import "./SupermarketsNamesFillter.css";
import { useSettings, useSupermarkets } from "../../../hooks/optimizationHooks";
import SupermarketImage from "../../Images/SupermarketImage";

const CheckIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ChevronIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/**
 * Grid of chains. Each card visually communicates selection state via
 * background tint, top-edge accent and a color-coded count chip.
 */
const SupermarketsNamesFillter = ({ onSelect }) => {
  const { allSupermarkets = [], isAllSupermarketsUploaded } = useSupermarkets();
  const { supermarketIDs = [] } = useSettings();

  const info = useMemo(() => {
    const map = {};
    allSupermarkets.forEach(({ name, supermarketID }) => {
      map[name] ??= { total: 0, selected: 0 };
      map[name].total += 1;
      if (supermarketIDs.includes(supermarketID)) map[name].selected += 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b, "he"));
  }, [allSupermarkets, supermarketIDs]);

  if (!isAllSupermarketsUploaded) {
    return (
      <div className="snf-loading">
        <div className="snf-spinner" />
        <p>טוען רשתות…</p>
      </div>
    );
  }

  if (info.length === 0) {
    return <div className="snf-empty">אין רשתות להצגה</div>;
  }

  return (
    <div className="snf-grid">
      {info.map(([name, { total, selected }]) => {
        const isAll = selected === total && total > 0;
        const isPartial = selected > 0 && selected < total;
        const stateClass = isAll
          ? "is-all"
          : isPartial
          ? "is-partial"
          : "is-none";
        return (
          <button
            type="button"
            className={`snf-item ${stateClass}`}
            key={name}
            onClick={() => onSelect(name)}
          >
            <div className="snf-img-wrap">
              <SupermarketImage
                supermarketName={name}
                className="snf-img"
              />
              {isAll && (
                <span className="snf-img-check" aria-hidden="true">
                  <CheckIcon />
                </span>
              )}
            </div>

            <span className="snf-name">{name}</span>

            <div className="snf-bottom">
              <span className="snf-count-chip">
                {isAll && <CheckIcon className="snf-count-chip-icon" />}
                <span className="snf-count-chip-num">
                  {selected}/{total}
                </span>
              </span>
              <span className="snf-arrow" aria-hidden="true">
                <ChevronIcon />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SupermarketsNamesFillter;
