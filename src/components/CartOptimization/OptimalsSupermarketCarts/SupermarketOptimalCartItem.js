import React from "react";
import "./SupermarketOptimalCartItem.css";
import SupermarketImage from "../../Images/SupermarketImage";
import { useProducts } from "../../../context/ProductContext";

/* One store card in the results list. Pure presentation — navigation happens
   via onOpen (a real route push), stats arrive pre-computed from the honest
   formulas so this card can never disagree with the detail page. */
const SupermarketOptimalCartItem = ({
  optimalCart,
  stats,
  supermarketDetails,
  rank,
  isBestFull,
  onOpen,
}) => {
  const { getProductDetailsByBarcode } = useProducts();

  const missingNames = (optimalCart.nonExistsProducts || []).map(
    (p) => getProductDetailsByBarcode(p.barcode)?.name || `ברקוד ${p.barcode}`
  );

  const scopeSuffix =
    stats.isFull || stats.coveredCount === 0
      ? ""
      : stats.coveredCount === 1
      ? " על מוצר אחד"
      : ` על ${stats.coveredCount} מוצרים`;

  return (
    <article
      className={`socc-card${isBestFull ? " is-cheapest" : ""}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      {isBestFull && (
        <span className="socc-best-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 2l2.39 4.84L20 7.5l-3.95 3.85L17 17l-5-2.62L7 17l.95-5.65L4 7.5l5.61-.66L12 2z" />
          </svg>
          הזולה עם כל המוצרים
        </span>
      )}

      <div className="socc-main">
        <div className="socc-logo-wrap">
          <SupermarketImage
            supermarketName={supermarketDetails?.name}
            className="socc-logo"
          />
          {rank != null && <span className="socc-rank">{rank}</span>}
        </div>

        <div className="socc-info">
          <h3 className="socc-name">
            <span className="socc-name-text">{supermarketDetails?.name}</span>
            <span
              className={`socc-cov ${stats.isFull ? "socc-cov--full" : "socc-cov--part"}`}
              title={
                stats.isFull
                  ? "כל המוצרים זמינים בסופר זה"
                  : `${stats.coveredCount} מתוך ${stats.denominator} מוצרים זמינים`
              }
            >
              {stats.coveredCount}/{stats.denominator}
            </span>
          </h3>
          {(supermarketDetails?.address || supermarketDetails?.city) && (
            <p className="socc-address">
              {supermarketDetails?.address}
              {supermarketDetails?.city ? `, ${supermarketDetails.city}` : ""}
            </p>
          )}
          {stats.missingCount > 0 && (
            <p className="socc-missing-line">
              חסרים: {missingNames.join(", ")}
            </p>
          )}
        </div>

        <div className="socc-price-block">
          <span className="socc-price">
            <span className="socc-price-currency">₪</span>
            {stats.total.toFixed(2)}
          </span>
          {stats.savings > 0.005 && (
            <span className="socc-delta socc-delta--save">
              חוסכים ₪{stats.savings.toFixed(2)}
              {scopeSuffix}
            </span>
          )}
          {stats.savings < -0.005 && (
            <span className="socc-delta socc-delta--cost">
              יקר ב־₪{Math.abs(stats.savings).toFixed(2)}
            </span>
          )}
        </div>

        <span className="socc-chev" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </span>
      </div>
    </article>
  );
};

export default SupermarketOptimalCartItem;
