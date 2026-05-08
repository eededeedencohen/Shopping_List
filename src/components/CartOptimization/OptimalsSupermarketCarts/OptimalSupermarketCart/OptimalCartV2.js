import React, { useMemo } from "react";
import SupermarketDetails from "./SupermarketDetails";
import OptimalProductsList from "./OptimalProductsList";
import "./OptimalCartV2.css";

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

const OptimalCartV2 = ({
  optimalCart,
  supermarketDetails,
  originalCart,
  onClickBack,
}) => {
  const totals = useMemo(() => {
    const optimalTotal = optimalCart?.totalPrice ?? 0;
    const originalTotal =
      originalCart?.productsWithPrices?.reduce(
        (s, p) => s + (p.totalPrice || 0),
        0
      ) || 0;
    const savings = originalTotal - optimalTotal;
    const itemCount = (optimalCart?.existsProducts || []).length;
    const missingCount = (optimalCart?.nonExistsProducts || []).length;
    return { optimalTotal, originalTotal, savings, itemCount, missingCount };
  }, [optimalCart, originalCart]);

  return (
    <div className="ocv-page">
      <button type="button" className="ocv-back" onClick={onClickBack}>
        <ChevronIcon />
        חזרה לרשימת הסופרים
      </button>

      <SupermarketDetails
        supermarketDetails={supermarketDetails}
        totals={totals}
      />

      <OptimalProductsList
        optimalCart={optimalCart}
        originalCart={originalCart}
      />
    </div>
  );
};

export default OptimalCartV2;
