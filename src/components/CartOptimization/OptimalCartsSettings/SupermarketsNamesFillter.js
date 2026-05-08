import React, { useMemo } from "react";
import "./SupermarketsNamesFillter.css";
import {
  useSettings,
  useSupermarkets,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";
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

const PlusIcon = (props) => (
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
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
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

const ClearIcon = (props) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SupermarketsNamesFillter = ({ onSelect }) => {
  const { allSupermarkets = [], isAllSupermarketsUploaded } = useSupermarkets();
  const { supermarketIDs = [] } = useSettings();
  const { insertSupermarketIDs, removeSupermarketIDs, setSupermarketIDsBulk } =
    useSettingsOperations();

  const chains = useMemo(() => {
    const map = new Map();
    allSupermarkets.forEach(({ name, supermarketID }) => {
      if (!map.has(name)) map.set(name, { name, ids: [], selected: 0 });
      const entry = map.get(name);
      entry.ids.push(supermarketID);
      if (supermarketIDs.includes(supermarketID)) entry.selected += 1;
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name, "he")
    );
  }, [allSupermarkets, supermarketIDs]);

  const totalSelected = supermarketIDs.length;
  const totalBranches = allSupermarkets.length;
  const allSelected = totalSelected === totalBranches && totalBranches > 0;
  const noneSelected = totalSelected === 0;

  const handleSelectAll = () => {
    setSupermarketIDsBulk(allSupermarkets.map((s) => s.supermarketID));
  };

  const handleClearAll = () => {
    setSupermarketIDsBulk([]);
  };

  const handleToggleChain = (chain) => {
    if (chain.selected === chain.ids.length && chain.ids.length > 0) {
      removeSupermarketIDs(chain.ids);
    } else {
      insertSupermarketIDs(chain.ids);
    }
  };

  if (!isAllSupermarketsUploaded) {
    return (
      <div className="snf-loading">
        <div className="snf-spinner" />
        <p>טוען רשתות…</p>
      </div>
    );
  }

  if (chains.length === 0) {
    return <div className="snf-empty">אין רשתות להצגה</div>;
  }

  return (
    <div className="snf-wrapper">
      {/* Global summary + bulk actions */}
      <div className="snf-toolbar">
        <div className="snf-summary">
          <div className="snf-summary-num">
            <span className="snf-summary-num-selected">{totalSelected}</span>
            <span className="snf-summary-num-sep">/</span>
            <span className="snf-summary-num-total">{totalBranches}</span>
          </div>
          <span className="snf-summary-label">סניפים נבחרו</span>
        </div>

        <div className="snf-toolbar-actions">
          <button
            type="button"
            className="snf-toolbar-btn snf-toolbar-btn--primary"
            onClick={handleSelectAll}
            disabled={allSelected}
          >
            <CheckIcon />
            סמן הכל
          </button>
          <button
            type="button"
            className="snf-toolbar-btn snf-toolbar-btn--ghost"
            onClick={handleClearAll}
            disabled={noneSelected}
          >
            <ClearIcon />
            נקה
          </button>
        </div>
      </div>

      {/* Chains grid */}
      <div className="snf-grid">
        {chains.map((chain) => {
          const { name, selected, ids } = chain;
          const total = ids.length;
          const isAll = selected === total && total > 0;
          const isPartial = selected > 0 && selected < total;
          const stateClass = isAll
            ? "is-all"
            : isPartial
            ? "is-partial"
            : "is-none";
          return (
            <div className={`snf-card ${stateClass}`} key={name}>
              <button
                type="button"
                className="snf-card-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleChain(chain);
                }}
                aria-label={isAll ? "בטל סימון של הרשת" : "סמן את כל הרשת"}
                aria-pressed={isAll}
              >
                {isAll ? <CheckIcon /> : <PlusIcon />}
              </button>

              <button
                type="button"
                className="snf-card-body"
                onClick={() => onSelect(name)}
              >
                <div className="snf-img-wrap">
                  <SupermarketImage
                    supermarketName={name}
                    className="snf-img"
                  />
                </div>
                <span className="snf-name">{name}</span>
              </button>

              <div className="snf-card-bottom">
                <span className="snf-count-chip">
                  <span className="snf-count-chip-num">
                    {selected}/{total}
                  </span>
                </span>
                <button
                  type="button"
                  className="snf-card-detail"
                  onClick={() => onSelect(name)}
                >
                  פרטים
                  <ChevronIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SupermarketsNamesFillter;
