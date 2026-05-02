import React, { useMemo, useState } from "react";
import SupermarketImage from "../../Images/SupermarketImage";
import styles from "./SupermarketsBranches.module.css";

const SORT_OPTIONS = [
  { value: "city", label: "לפי עיר" },
  { value: "alphabetical", label: "א-ב כתובת" },
];

const SupermarketsBranches = ({
  selectedSupermarket,
  onSelectBranch,
  onBack,
}) => {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("city");
  const [activeCity, setActiveCity] = useState(null); // null = all cities

  const branchesByCity = useMemo(() => {
    if (!selectedSupermarket) return [];
    const map = new Map();
    selectedSupermarket.branches.forEach((b) => {
      const city = b.city || "—";
      if (!map.has(city)) map.set(city, []);
      map.get(city).push(b);
    });
    return Array.from(map.entries())
      .map(([city, branches]) => ({ city, branches }))
      .sort((a, b) => b.branches.length - a.branches.length);
  }, [selectedSupermarket]);

  const cityChips = useMemo(
    () => branchesByCity.map((g) => ({ city: g.city, count: g.branches.length })),
    [branchesByCity]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    // First: filter by active city
    let groups = branchesByCity;
    if (activeCity) {
      groups = groups.filter((g) => g.city === activeCity);
    }

    // Then: filter by search query
    if (q) {
      groups = groups
        .map(({ city, branches }) => ({
          city,
          branches: branches.filter(
            (b) =>
              (b.address || "").toLowerCase().includes(q) ||
              (b.city || "").toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.branches.length > 0);
    }

    // Then: sort
    if (sortBy === "alphabetical") {
      // Flatten and re-sort everything by address
      const flat = groups.flatMap((g) =>
        g.branches.map((b) => ({ ...b, city: g.city }))
      );
      flat.sort((a, b) =>
        (a.address || "").localeCompare(b.address || "", "he")
      );
      // Return as a single "synthetic" group so the renderer can flatten
      return flat.length
        ? [{ city: null, branches: flat, _flat: true }]
        : [];
    }

    // Default city sort — already by city count desc; keep that
    return groups;
  }, [branchesByCity, query, sortBy, activeCity]);

  const totalShown = useMemo(
    () => filtered.reduce((acc, g) => acc + g.branches.length, 0),
    [filtered]
  );

  if (!selectedSupermarket) return null;
  const { name, branches } = selectedSupermarket;

  return (
    <div className={styles.container}>
      {/* Sticky header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoWrap}>
            <SupermarketImage supermarketName={name} className={styles.logo} />
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>{name}</h3>
            <span className={styles.subtitle}>
              {branches.length} {branches.length === 1 ? "סניף זמין" : "סניפים זמינים"}
            </span>
          </div>
        </div>

        {branches.length > 6 && (
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
              placeholder="חפש עיר או כתובת"
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
        )}

        {cityChips.length > 1 && (
          <div className={styles.cityChips}>
            <button
              type="button"
              className={`${styles.cityChip} ${
                activeCity === null ? styles.cityChipActive : ""
              }`}
              onClick={() => setActiveCity(null)}
            >
              הכל
              <span className={styles.cityChipCount}>{branches.length}</span>
            </button>
            {cityChips.map((c) => (
              <button
                key={c.city}
                type="button"
                className={`${styles.cityChip} ${
                  activeCity === c.city ? styles.cityChipActive : ""
                }`}
                onClick={() =>
                  setActiveCity(activeCity === c.city ? null : c.city)
                }
              >
                {c.city}
                <span className={styles.cityChipCount}>{c.count}</span>
              </button>
            ))}
          </div>
        )}

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
            {totalShown} {totalShown === 1 ? "סניף" : "סניפים"}
          </span>
        </div>
      </div>

      {/* Grouped branch list */}
      <div className={styles.list}>
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
            <span>לא נמצאו סניפים</span>
          </div>
        ) : (
          filtered.map(({ city, branches: cityBranches, _flat }, gi) => (
            <section key={city ?? `flat-${gi}`} className={styles.cityGroup}>
              {!_flat && (
                <header className={styles.cityHeader}>
                  <span className={styles.cityName}>{city}</span>
                  <span className={styles.cityCount}>{cityBranches.length}</span>
                </header>
              )}
              <div className={styles.cityBranches}>
                {cityBranches.map((branch, idx) => (
                  <button
                    key={branch.supermarketID}
                    type="button"
                    className={styles.branchCard}
                    onClick={() => onSelectBranch({ ...branch, name })}
                    style={{ animationDelay: `${Math.min(idx, 8) * 0.03}s` }}
                  >
                    <div className={styles.branchInfo}>
                      <span className={styles.branchAddress}>
                        {branch.address || "כתובת לא זמינה"}
                      </span>
                      {_flat && branch.city && (
                        <span className={styles.branchCity}>{branch.city}</span>
                      )}
                    </div>
                    <div className={styles.branchArrow}>
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button type="button" className={styles.backBtn} onClick={onBack}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          חזרה לרשתות
        </button>
      </div>
    </div>
  );
};

export default SupermarketsBranches;
