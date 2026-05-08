import React, { useMemo } from "react";
import "./SupermarketsBranches.css";
import {
  useSettings,
  useSupermarkets,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";

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

const SupermarketsBranches = ({ supermarketName }) => {
  const { allSupermarkets = [], isAllSupermarketsUploaded } = useSupermarkets();
  const { supermarketIDs = [] } = useSettings();
  const { insertSupermarketID, removeSupermarketID } = useSettingsOperations();

  const branches = useMemo(
    () => allSupermarkets.filter((s) => s.name === supermarketName) ?? [],
    [allSupermarkets, supermarketName]
  );

  const selectedCount = branches.filter((b) =>
    supermarketIDs.includes(b.supermarketID)
  ).length;

  const allChecked = selectedCount === branches.length && branches.length > 0;

  const toggleAll = () => {
    if (allChecked) {
      branches.forEach((b) => removeSupermarketID(b.supermarketID));
    } else {
      branches.forEach((b) => {
        if (!supermarketIDs.includes(b.supermarketID)) {
          insertSupermarketID(b.supermarketID);
        }
      });
    }
  };

  if (!isAllSupermarketsUploaded) {
    return (
      <div className="sb-loading">
        <div className="sb-spinner" />
        <p>טוען…</p>
      </div>
    );
  }
  if (branches.length === 0) {
    return <div className="sb-empty">אין סניפים להצגה</div>;
  }

  return (
    <div className="sb-wrapper">
      <div className="sb-toolbar">
        <span className="sb-counter">
          <span className="sb-counter-num">{selectedCount}</span>
          <span className="sb-counter-sep">/</span>
          <span className="sb-counter-num">{branches.length}</span>
          <span className="sb-counter-text">סניפים נבחרו</span>
        </span>
        <button
          type="button"
          className={`sb-toggle-all ${allChecked ? "is-on" : ""}`}
          onClick={toggleAll}
        >
          {allChecked ? "בטל סימון" : "סמן הכל"}
        </button>
      </div>

      <ul className="sb-list">
        {branches.map(({ supermarketID, address, city }) => {
          const checked = supermarketIDs.includes(supermarketID);
          return (
            <li key={supermarketID}>
              <label className={`sb-item ${checked ? "is-checked" : ""}`}>
                <input
                  type="checkbox"
                  className="sb-checkbox"
                  checked={checked}
                  onChange={(e) =>
                    e.target.checked
                      ? insertSupermarketID(supermarketID)
                      : removeSupermarketID(supermarketID)
                  }
                />
                <span className="sb-checkmark" aria-hidden="true">
                  <CheckIcon />
                </span>
                <div className="sb-info">
                  {address && <span className="sb-address">{address}</span>}
                  {city && <span className="sb-city">{city}</span>}
                </div>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default SupermarketsBranches;
