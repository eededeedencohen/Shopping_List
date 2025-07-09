import React, { useMemo } from "react";
import "./SupermarketsNamesFillter.css";
import { useSettings, useSupermarkets } from "../../../hooks/optimizationHooks";
import SupermarketImage from "../../Images/SupermarketImage";

const SupermarketsNamesFillter = () => {
  const { allSupermarkets = [], isAllSupermarketsUploaded } = useSupermarkets();
  const { supermarketIDs = [] } = useSettings();

  /* חישוב מידע: total / selected לכל שם רשת */
  const supermarketsInfo = useMemo(() => {
    const map = {};
    allSupermarkets.forEach(({ name, supermarketID }) => {
      map[name] ??= { total: 0, selected: 0 };
      map[name].total += 1;
      if (supermarketIDs.includes(supermarketID)) map[name].selected += 1;
    });
    return Object.entries(map); // [['יש חסד', {…}], …]
  }, [allSupermarkets, supermarketIDs]);

  if (!isAllSupermarketsUploaded)
    return <div className="snf-loading">טוען סניפים…</div>;

  return (
    <div className="snf-container">
      {supermarketsInfo.map(([name, { total, selected }]) => {
        const pct = total ? (selected / total) * 100 : 0;
        return (
          <div className="snf-item" key={name}>
            <SupermarketImage supermarketName={name} className="snf-img" />
            <div className="snf-progress">
              <div className="snf-progress-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="snf-count">
              {selected}/{total}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default SupermarketsNamesFillter;
