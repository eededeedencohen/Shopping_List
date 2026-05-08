import React, { useMemo, useState } from "react";
import SupermarketImage from "../../Images/SupermarketImage";
import { useSupermarkets } from "../../../hooks/optimizationHooks";
import { useCartItems } from "../../../hooks/appHooks";
import { useEligibleSupermarkets } from "../../../hooks/useProductAvailability";
import styles from "./SupermarketsNames.module.css";

const SORT_OPTIONS = [
  { value: "popular", label: "פופולרי" },
  { value: "alphabetical", label: "א-ב" },
];

const SupermarketsNames = ({ onSelectSupermarket }) => {
  const { allSupermarkets, isAllSupermarketsUploaded } = useSupermarkets();
  const cartItems = useCartItems();
  const cartBarcodes = useMemo(
    () => (cartItems || []).map((item) => item.barcode).filter(Boolean),
    [cartItems]
  );
  const hasCart = cartBarcodes.length > 0;

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [onlyAvailable, setOnlyAvailable] = useState(true);

  const {
    eligibleIDs,
    missingBarcodes,
    isLoading: isAvailLoading,
  } = useEligibleSupermarkets(hasCart ? cartBarcodes : []);
  const eligibleSet = useMemo(
    () => (eligibleIDs ? new Set(eligibleIDs) : null),
    [eligibleIDs]
  );

  /* `missingBarcodes` lists cart products with no price docs anywhere
     in the DB — those are real data gaps, not an index issue. The
     filter is computed live from prices, so a non-empty list here
     genuinely means those products aren't sold by any supermarket
     we know about. Surface a friendly notice in that case. */
  const missingCount = missingBarcodes ? missingBarcodes.length : 0;
  const allMissing = missingCount > 0 && missingCount === cartBarcodes.length;
  const someMissing = missingCount > 0 && missingCount < cartBarcodes.length;

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

    /* Availability filter — only show chains/branches that carry every
       cart product. Computed live against priceModel on the backend, so
       no rebuild prerequisite. */
    if (hasCart && onlyAvailable && eligibleSet) {
      list = list
        .map((chain) => ({
          ...chain,
          branches: chain.branches.filter((b) =>
            eligibleSet.has(b.supermarketID)
          ),
        }))
        .filter((chain) => chain.branches.length > 0);
    }

    if (q) list = list.filter((s) => s.name.toLowerCase().includes(q));

    const sorted = [...list];
    if (sortBy === "alphabetical") {
      sorted.sort((a, b) => a.name.localeCompare(b.name, "he"));
    } else {
      // popular — most branches first
      sorted.sort((a, b) => b.branches.length - a.branches.length);
    }
    return sorted;
  }, [supermarketsArray, query, sortBy, hasCart, onlyAvailable, eligibleSet]);

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

        {hasCart && (
          <label className={styles.availabilityFilter}>
            <span className={styles.availabilityFilterText}>
              רק סופרים שמכילים את כל המוצרים בעגלה
              {isAvailLoading && (
                <span
                  className={styles.availabilitySpinner}
                  aria-hidden="true"
                />
              )}
            </span>
            <span
              className={`${styles.availabilitySwitch} ${
                onlyAvailable ? styles.availabilitySwitchOn : ""
              }`}
              role="switch"
              aria-checked={onlyAvailable}
            >
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              <span className={styles.availabilityKnob} />
            </span>
          </label>
        )}

        {hasCart && onlyAvailable && missingCount > 0 && !isAvailLoading && (
          <div className={styles.indexNotice}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="13" />
              <circle cx="12" cy="16" r="0.6" fill="currentColor" />
            </svg>
            <span>
              {allMissing
                ? "המוצרים בעגלה אינם נמכרים באף סופר במאגר."
                : `${missingCount} ${missingCount === 1 ? "מוצר" : "מוצרים"} בעגלה לא נמכרים בשום סופר במאגר ולכן הסינון לא נאכף.`}
            </span>
          </div>
        )}
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
          {query ? (
            <span>לא נמצאו תוצאות עבור "{query}"</span>
          ) : hasCart && onlyAvailable && missingCount === 0 ? (
            <span>
              אף סופר במאגר לא מכיל את כל המוצרים שבעגלה. כבה את הסינון
              לראות את כל הרשתות.
            </span>
          ) : (
            <span>לא נמצאו תוצאות</span>
          )}
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
