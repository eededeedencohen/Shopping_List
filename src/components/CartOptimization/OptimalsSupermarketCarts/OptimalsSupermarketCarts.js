import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import LoadingCart from "./LoadingCart";
import CartsFilter from "./CartsFilter";
import SupermarketOptimalCartItem from "./SupermarketOptimalCartItem";
import "./OptimalsSupermarketCarts.css";
import {
  useSupermarkets,
  useOptimalCarts,
} from "../../../hooks/optimizationHooks";
import { useFullCart } from "../../../hooks/appHooks";

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

const OptimalsSupermarketCarts = () => {
  const navigate = useNavigate();
  const { allSupermarkets } = useSupermarkets();
  const { optimalCarts, isOptimalCartsCalculated } = useOptimalCarts();
  const { fullCart } = useFullCart();
  const [selectedSupermarketID, setSelectedSupermarketID] = useState(0);
  const [sortBy, setSortBy] = useState("price"); // "price" | "completeness"

  const totalProducts = fullCart?.productsWithPrices?.length || 0;
  const originalTotalPrice =
    fullCart?.productsWithPrices?.reduce(
      (sum, p) => sum + (p.totalPrice || 0),
      0
    ) || 0;

  const sortedCarts = useMemo(() => {
    if (!Array.isArray(optimalCarts)) return [];
    const list = [...optimalCarts];
    if (sortBy === "price") {
      list.sort((a, b) => (a.totalPrice ?? Infinity) - (b.totalPrice ?? Infinity));
    } else {
      list.sort(
        (a, b) =>
          (a.nonExistsProducts?.length ?? 0) -
          (b.nonExistsProducts?.length ?? 0)
      );
    }
    return list;
  }, [optimalCarts, sortBy]);

  const cheapestPrice = sortedCarts[0]?.totalPrice;

  if (!isOptimalCartsCalculated) {
    return <LoadingCart />;
  }

  // Detail view: when a supermarket is selected, defer to the item itself
  // (it renders <OptimalCartV2/> internally when isShowFullOptimalCart=true).
  // We just narrow the list to the selected one so only its detail shows.
  const visible =
    selectedSupermarketID === 0
      ? sortedCarts
      : sortedCarts.filter((c) => c.supermarketID === selectedSupermarketID);

  return (
    <div className="osc-page">
      {selectedSupermarketID === 0 && (
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
            השוונו {sortedCarts.length} סופרים עבור {totalProducts}{" "}
            {totalProducts === 1 ? "מוצר" : "מוצרים"} בעגלה
          </p>

          {originalTotalPrice > 0 &&
            typeof cheapestPrice === "number" &&
            cheapestPrice < originalTotalPrice && (
              <div className="osc-savings-banner">
                <div className="osc-savings-banner-icon">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div className="osc-savings-banner-text">
                  <span className="osc-savings-banner-line">
                    ניתן לחסוך עד
                  </span>
                  <span className="osc-savings-banner-amount">
                    ₪{(originalTotalPrice - cheapestPrice).toFixed(2)}
                  </span>
                  <span className="osc-savings-banner-percent">
                    (
                    {(
                      ((originalTotalPrice - cheapestPrice) /
                        originalTotalPrice) *
                      100
                    ).toFixed(1)}
                    %)
                  </span>
                </div>
              </div>
            )}

          <CartsFilter sortBy={sortBy} setSortBy={setSortBy} />
        </header>
      )}

      <div className="osc-list">
        {visible.map((cart, idx) => {
          const supermarketDetails = allSupermarkets.find(
            (s) => s.supermarketID === cart.supermarketID
          );
          const isCheapest =
            selectedSupermarketID === 0 &&
            sortBy === "price" &&
            typeof cart.totalPrice === "number" &&
            cart.totalPrice === cheapestPrice;
          const savings =
            originalTotalPrice > 0
              ? originalTotalPrice - (cart.totalPrice ?? 0)
              : 0;
          return (
            <SupermarketOptimalCartItem
              key={cart.supermarketID}
              optimalCart={cart}
              originalCart={fullCart}
              supermarketDetails={supermarketDetails}
              onSelectedSupermarket={setSelectedSupermarketID}
              isCheapest={isCheapest}
              rank={selectedSupermarketID === 0 ? idx + 1 : null}
              savings={savings}
              totalProducts={totalProducts}
            />
          );
        })}
      </div>
    </div>
  );
};

export default OptimalsSupermarketCarts;
