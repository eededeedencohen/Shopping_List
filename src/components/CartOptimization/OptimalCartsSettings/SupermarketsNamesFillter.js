import React, { useMemo } from "react";
import "./SupermarketsNamesFillter.css";
import { useSettings, useSupermarkets } from "../../../hooks/optimizationHooks";
import SupermarketImage from "../../Images/SupermarketImage";

/**
 * Grid of chains. Each chain card shows its logo, name, branch count
 * (selected/total) and a progress bar of how much of the chain the user
 * has opted into. Tapping the card drills into the branches list.
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
    return Object.entries(map);
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
        const pct = total ? (selected / total) * 100 : 0;
        const allSelected = selected === total && total > 0;
        const noneSelected = selected === 0;
        return (
          <button
            type="button"
            className={`snf-item ${allSelected ? "is-all" : ""} ${
              noneSelected ? "is-none" : ""
            }`}
            key={name}
            onClick={() => onSelect(name)}
          >
            <div className="snf-img-wrap">
              <SupermarketImage supermarketName={name} className="snf-img" />
            </div>
            <span className="snf-name">{name}</span>
            <div className="snf-progress">
              <div
                className="snf-progress-fill"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="snf-count">
              {selected}
              <span className="snf-count-sep">/</span>
              {total}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SupermarketsNamesFillter;
