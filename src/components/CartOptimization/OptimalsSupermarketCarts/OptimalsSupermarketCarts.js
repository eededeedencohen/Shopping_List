import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LoadingCart from "./LoadingCart";
import CartsFilter from "./CartsFilter";
import SupermarketOptimalCartItem from "./SupermarketOptimalCartItem";
import "./OptimalsSupermarketCarts.css";
import {
  useSupermarkets,
  useOptimalCarts,
  useCalculateOptimalCarts,
} from "../../../hooks/optimizationHooks";
import {
  buildOriginalPriceMap,
  computeCartStats,
} from "../../../utils/optimalCartMath";

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

/* Results list — honest numbers only:
     • savings are computed over the products each store actually offers
       (computeCartStats), a partial cart states its scope, a pricier store
       shows a red delta instead of hiding it.
     • the banner references the cheapest FULL cart by name and never moves
       when the user changes the sort.
     • default sort "מומלץ" = completeness, then price — a one-item cart can
       no longer outrank a full one. */
const OptimalsSupermarketCarts = () => {
  const navigate = useNavigate();
  const { allSupermarkets } = useSupermarkets();
  const {
    optimalCarts,
    isOptimalCartsCalculated,
    fullCart,
    optimalCartsError,
    isCalculatingOptimalCarts,
  } = useOptimalCarts();
  const { calculateOptimalCarts } = useCalculateOptimalCarts();
  const [sortBy, setSortBy] = useState("recommended"); // "recommended" | "price"

  const totalProducts = fullCart?.productsWithPrices?.length || 0;
  const originalTotalPrice =
    fullCart?.productsWithPrices?.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    ) || 0;

  const originalMap = useMemo(() => buildOriginalPriceMap(fullCart), [fullCart]);

  const enriched = useMemo(() => {
    if (!Array.isArray(optimalCarts)) return [];
    return optimalCarts.map((cart) => ({
      cart,
      stats: computeCartStats(cart, originalMap, totalProducts),
    }));
  }, [optimalCarts, originalMap, totalProducts]);

  /* the banner's anchor: cheapest cart that offers EVERYTHING — data-driven,
     independent of the current sort */
  const bestFull = useMemo(() => {
    const fulls = enriched.filter((e) => e.stats.isFull);
    if (!fulls.length) return null;
    return fulls.reduce((a, b) => (b.stats.total < a.stats.total ? b : a));
  }, [enriched]);

  const sorted = useMemo(() => {
    const list = [...enriched];
    if (sortBy === "price") {
      list.sort((a, b) => a.stats.total - b.stats.total);
    } else {
      list.sort(
        (a, b) =>
          a.stats.missingCount - b.stats.missingCount ||
          a.stats.total - b.stats.total
      );
    }
    return list;
  }, [enriched, sortBy]);

  if (optimalCartsError) {
    return (
      <div className="osc-page">
        <div className="osc-state">
          <div className="osc-state-icon">⚠️</div>
          <h2>החישוב נכשל</h2>
          <p>לא הצלחנו לחשב את העגלות. בדקו את החיבור ונסו שוב.</p>
          <div className="osc-state-actions">
            <button type="button" className="osc-state-btn osc-state-btn--primary" onClick={calculateOptimalCarts}>
              נסו שוב
            </button>
            <button type="button" className="osc-state-btn" onClick={() => navigate("/optimal-carts-settings")}>
              חזרה להגדרות
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isOptimalCartsCalculated && isCalculatingOptimalCarts) {
    return <LoadingCart />;
  }

  if (!isOptimalCartsCalculated || !sorted.length) {
    /* refresh / direct URL (state is in-memory) or an empty result —
       an actionable state instead of an eternal spinner */
    return (
      <div className="osc-page">
        <div className="osc-state">
          <div className="osc-state-icon">🛒</div>
          <h2>אין תוצאות להצגה</h2>
          <p>
            {!isOptimalCartsCalculated
              ? "כדי לראות עגלות אופטימליות, הריצו חישוב מעמוד ההגדרות."
              : "לא נבחרו סופרים להשוואה, או שהעגלה ריקה."}
          </p>
          <div className="osc-state-actions">
            <button type="button" className="osc-state-btn osc-state-btn--primary" onClick={() => navigate("/optimal-carts-settings")}>
              חזרה להגדרות
            </button>
          </div>
        </div>
      </div>
    );
  }

  const bannerSavings = bestFull ? originalTotalPrice - bestFull.stats.total : 0;
  const bestFullName = bestFull
    ? allSupermarkets.find(
        (s) => s.supermarketID === bestFull.cart.supermarketID
      )?.name || "הסופר הזול"
    : null;

  const grouped =
    sortBy === "recommended"
      ? {
          full: sorted.filter((e) => e.stats.isFull),
          partial: sorted.filter((e) => !e.stats.isFull),
        }
      : null;

  const renderCard = (entry, rank) => {
    const supermarketDetails = allSupermarkets.find(
      (s) => s.supermarketID === entry.cart.supermarketID
    );
    return (
      <SupermarketOptimalCartItem
        key={entry.cart.supermarketID}
        optimalCart={entry.cart}
        stats={entry.stats}
        supermarketDetails={supermarketDetails}
        rank={rank}
        isBestFull={
          !!bestFull && entry.cart.supermarketID === bestFull.cart.supermarketID
        }
        onOpen={() =>
          navigate(`/optimal-supermarket-carts/${entry.cart.supermarketID}`)
        }
      />
    );
  };

  let rank = 0;

  return (
    <div className="osc-page">
      <header className="osc-header">
        <button
          type="button"
          className="osc-back"
          onClick={() => navigate("/optimal-carts-settings")}
        >
          <ChevronIcon />
          חזרה להגדרות
        </button>
        <h1 className="osc-title">העגלות האופטימליות</h1>
        <p className="osc-subtitle">
          השוונו {sorted.length} סופרים עבור {totalProducts}{" "}
          {totalProducts === 1 ? "מוצר" : "מוצרים"} בעגלה
        </p>

        {/* the banner never changes with the sort — it anchors to a named,
            auditable fact about the cheapest FULL cart */}
        {bestFull && bannerSavings > 0.005 && (
          <div className="osc-savings-banner">
            <div className="osc-savings-banner-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="osc-savings-banner-text">
              <span className="osc-savings-banner-line">
                ניתן לחסוך <b className="osc-savings-banner-amount">₪{bannerSavings.toFixed(2)}</b>{" "}
                <span className="osc-savings-banner-percent">
                  ({((bannerSavings / originalTotalPrice) * 100).toFixed(1)}%)
                </span>{" "}
                ב{bestFullName}
              </span>
              <span className="osc-savings-banner-sub">
                כל {totalProducts} המוצרים זמינים · לעומת ₪{originalTotalPrice.toFixed(2)} בעגלה שלך
              </span>
            </div>
          </div>
        )}
        {bestFull && bannerSavings <= 0.005 && (
          <div className="osc-savings-banner osc-savings-banner--neutral">
            <div className="osc-savings-banner-text">
              <span className="osc-savings-banner-line">
                העגלה שלך כבר זולה — הסופר המלא הזול ביותר יקר ב־
                <b>₪{Math.abs(bannerSavings).toFixed(2)}</b>
              </span>
            </div>
          </div>
        )}
        {!bestFull && (
          <div className="osc-savings-banner osc-savings-banner--info">
            <div className="osc-savings-banner-text">
              <span className="osc-savings-banner-line">
                אף סופר לא מציע את כל {totalProducts} המוצרים
              </span>
              <span className="osc-savings-banner-sub">
                ההשוואות מחושבות לפי המוצרים הזמינים בכל סופר בלבד
              </span>
            </div>
          </div>
        )}

        <CartsFilter sortBy={sortBy} setSortBy={setSortBy} />
      </header>

      <div className="osc-list">
        {grouped ? (
          <>
            {grouped.full.length > 0 && (
              <div className="osc-group">עגלות מלאות ({grouped.full.length})</div>
            )}
            {grouped.full.map((e) => renderCard(e, ++rank))}
            {grouped.partial.length > 0 && (
              <div className="osc-group">
                עגלות חלקיות ({grouped.partial.length}) · ההשוואה לפי המוצרים הזמינים בלבד
              </div>
            )}
            {grouped.partial.map((e) => renderCard(e, ++rank))}
          </>
        ) : (
          sorted.map((e) => renderCard(e, ++rank))
        )}
      </div>
    </div>
  );
};

export default OptimalsSupermarketCarts;
