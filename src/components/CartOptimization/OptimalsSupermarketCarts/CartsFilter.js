import React from "react";
import "./CartsFilter.css";

const SORT_OPTIONS = [
  { value: "price", label: "מחיר נמוך" },
  { value: "completeness", label: "מוצרים זמינים" },
];

const CartsFilter = ({ sortBy, setSortBy }) => {
  return (
    <div className="cf-wrapper">
      <span className="cf-label">מיון:</span>
      <div className="cf-segmented" role="tablist" aria-label="מיון העגלות">
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`cf-seg ${active ? "is-active" : ""}`}
              onClick={() => setSortBy(opt.value)}
              role="tab"
              aria-selected={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CartsFilter;
