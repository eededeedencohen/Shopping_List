import React, { useMemo, useState } from "react";
import SupermarketImage from "../../Images/SupermarketImage";
import { useSupermarkets } from "../../../hooks/optimizationHooks";
import styles from "./SupermarketsNames.module.css";

const SORT_OPTIONS = [
  { value: "popular", label: "פופולרי" },
  { value: "alphabetical", label: "א-ב" },
];

const SupermarketsNames = ({ onSelectSupermarket }) => {
  const { allSupermarkets, isAllSupermarketsUploaded } = useSupermarkets();
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");

  const supermarketsArray = useMemo(() => {
    if (!allSupermarkets || !allSupermarkets.length) return [];

    const grouped = {};
    allSupermarkets.forEach((s) => {
      const name = s.name;
      if (!grouped[name]) grouped[name] = [];
      if (!grouped[name].some((b) => b.supermarketID === s.supermarketID)) {
        grouped[name].push({
          address: s.address,
          city: s.city,
          supermarketID: s.supermarketID,
        });
      }
    });

    return Object.keys(grouped).map((name) => ({
      name,
      branches: grouped[name],
    }));
  }, [allSupermarkets]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = supermarketsArray;
    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q));

    const sorted = [...list];
    if (sortBy === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "he"));
    } else {
      // popular — most branches first
      sorted.sort((a, b) => b.branches.length - a.branches.length);
    }
    return sorted;
  }, [supermarketsArray, query, sortBy]);

  if (!isAllSupermarketsUploaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingDot} />
        <div className={styles.loadingDot} />
        <div className={styles.loadingDot} />
      </div>
    );
  }

  if (!supermarketsArray.length) {
    return (
      <div className={styles.empty}>
        <span>לא נמצאו סופרמרקטים</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>בחר רשת סופרמרקט</h3>
        <span className={styles.subtitle}>
          {supermarketsArray.length} רשתות זמינות
        </span>

        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            inputMode="search"
            className={styles.searchInput}
            placeholder="חפש רשת"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className={styles.searchClear}
              onClick={() => setQuery("")}
              aria-label="נקה חיפוש"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className={styles.sortRow}>
          <span className={styles.sortLabel}>מיון:</span>
          <div className={styles.segmented} role="tablist">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="tab"
                aria-selected={sortBy === opt.value}
                className={`${styles.segment} ${
                  sortBy === opt.value ? styles.segmentActive : ""
                }`}
                onClick={() => setSortBy(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <span className={styles.resultsCount}>
            {filtered.length} {filtered.length === 1 ? "רשת" : "רשתות"}
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.emptySearch}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>לא נמצאו תוצאות עבור "{query}"</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((supermarket, idx) => (
            <button
              type="button"
              key={supermarket.name}
              className={styles.card}
              onClick={() => onSelectSupermarket(supermarket)}
              style={{ animationDelay: `${Math.min(idx, 12) * 0.035}s` }}
            >
              <div className={styles.logoWrap}>
                <SupermarketImage
                  supermarketName={supermarket.name}
                  className={styles.logo}
                />
              </div>
              <div className={styles.cardInfo}>
                <span className={styles.name}>{supermarket.name}</span>
                <span className={styles.branchCount}>
                  {supermarket.branches.length}{" "}
                  {supermarket.branches.length === 1 ? "סניף" : "סניפים"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SupermarketsNames;
