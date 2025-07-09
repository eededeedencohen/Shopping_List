import React, { useMemo } from "react";
import "./SupermarketsNamesFillter.css";
import { useSettings, useSupermarkets } from "../../../hooks/optimizationHooks";
import SupermarketImage from "../../Images/SupermarketImage";

/**
 * props:
 *  onSelect(name) — מחזיר שם רשת שנבחרה
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

  if (!isAllSupermarketsUploaded)
    return <div className="snf-loading">טוען…</div>;

  return (
    <div className="snf-container">
      {info.map(([name, { total, selected }]) => {
        const pct = total ? (selected / total) * 100 : 0;
        return (
          <button
            type="button"
            className="snf-item"
            key={name}
            onClick={() => onSelect(name)}
          >
            <SupermarketImage supermarketName={name} className="snf-img" />
            <div className="snf-progress">
              <div className="snf-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="snf-count">
              {selected}/{total}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default SupermarketsNamesFillter;
