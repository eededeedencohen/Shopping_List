import React from "react";
import "./CartsFilter.css";

/* "מומלץ" = completeness first, then price — the honest default.
   "מחיר נמוך" = raw price, with coverage chips keeping hollow carts visible. */
const SORT_OPTIONS = [
  { value: "recommended", label: "מומלץ" },
  { value: "price", label: "מחיר נמוך" },
];

const CartsFilter = ({ sortBy, setSortBy }) => {
  return (
    <div className="cf-wrapper">
      <span className="cf-label" id="cf-sort-label">מיון:</span>
      <div className="cf-segmented" role="radiogroup" aria-labelledby="cf-sort-label">
        {SORT_OPTIONS.map((opt) => {
          const active = sortBy === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`cf-seg ${active ? "is-active" : ""}`}
              onClick={() => setSortBy(opt.value)}
              role="radio"
              aria-checked={active}
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
