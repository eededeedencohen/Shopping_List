import React, { useMemo } from "react";
import "./SupermarketsBranches.css";
import {
  useSettings,
  useSupermarkets,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";

const SupermarketsBranches = ({ supermarketName, onBack }) => {
  const { allSupermarkets = [], isAllSupermarketsUploaded } = useSupermarkets();
  const { supermarketIDs = [] } = useSettings();
  const { insertSupermarketID, removeSupermarketID } = useSettingsOperations();

  const branches = useMemo(
    () => allSupermarkets.filter((s) => s.name === supermarketName) ?? [],
    [allSupermarkets, supermarketName]
  );

  if (!isAllSupermarketsUploaded)
    return <div className="sb-loading">טוען…</div>;
  if (branches.length === 0)
    return <div className="sb-empty">אין סניפים להצגה</div>;

  const toggle = (id, checked) =>
    checked ? insertSupermarketID(id) : removeSupermarketID(id);

  return (
    <div className="sb-wrapper">
      <div className="sb-header">
        <button className="sb-back" onClick={onBack}>
          ← חזרה
        </button>
        <h3 className="sb-title">{supermarketName}</h3>
      </div>

      <div className="sb-list">
        {branches.map(({ supermarketID, address, city }) => {
          const checked = supermarketIDs.includes(supermarketID);
          return (
            <label className="sb-item" key={supermarketID}>
              <input
                type="checkbox"
                className="sb-checkbox"
                checked={checked}
                onChange={(e) => toggle(supermarketID, e.target.checked)}
              />
              <div className="sb-info">
                <span className="sb-address">{address}</span>
                <span className="sb-city">{city}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default SupermarketsBranches;
