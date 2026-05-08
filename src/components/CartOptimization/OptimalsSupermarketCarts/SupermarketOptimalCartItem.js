import React, { useState } from "react";
import "./SupermarketOptimalCartItem.css";
import SupermarketImage from "../../Images/SupermarketImage";
import { useProducts } from "../../../context/ProductContext";
import OptimalCartV2 from "./OptimalSupermarketCart/OptimalCartV2";

const SupermarketOptimalCartItem = ({
  optimalCart,
  supermarketDetails,
  originalCart,
  onSelectedSupermarket,
  isCheapest,
  rank,
  savings,
  totalProducts,
}) => {
  const [isShowFullOptimalCart, setIsShowFullOptimalCart] = useState(false);
  const { getProductDetailsByBarcode } = useProducts();

  const handleNavigateToOptimalCart = () => {
    setIsShowFullOptimalCart(true);
    onSelectedSupermarket(optimalCart.supermarketID);
  };

  if (isShowFullOptimalCart) {
    return (
      <OptimalCartV2
        optimalCart={optimalCart}
        supermarketDetails={supermarketDetails}
        originalCart={originalCart}
        onClickBack={() => {
          setIsShowFullOptimalCart(false);
          onSelectedSupermarket(0);
        }}
      />
    );
  }

  const missingNames = (optimalCart.nonExistsProducts || []).map(
    (p) => getProductDetailsByBarcode(p.barcode)?.name || ""
  );
  const missingCount = missingNames.length;
  const includedCount =
    typeof totalProducts === "number" ? totalProducts - missingCount : null;

  const showSavings = typeof savings === "number" && savings > 0;

  return (
    <article
      className={`socc-card ${isCheapest ? "is-cheapest" : ""}`}
      onClick={handleNavigateToOptimalCart}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleNavigateToOptimalCart();
        }
      }}
    >
      {isCheapest && (
        <span className="socc-best-badge">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 2l2.39 4.84L20 7.5l-3.95 3.85L17 17l-5-2.62L7 17l.95-5.65L4 7.5l5.61-.66L12 2z" />
          </svg>
          הזולה ביותר
        </span>
      )}

      <div className="socc-main">
        <div className="socc-logo-wrap">
          <SupermarketImage
            supermarketName={supermarketDetails?.name}
            className="socc-logo"
          />
          {rank != null && !isCheapest && (
            <span className="socc-rank">{rank}</span>
          )}
        </div>

        <div className="socc-info">
          <h3 className="socc-name">{supermarketDetails?.name}</h3>
          {(supermarketDetails?.address || supermarketDetails?.city) && (
            <p className="socc-address">
              {supermarketDetails?.address}
              {supermarketDetails?.city
                ? `, ${supermarketDetails.city}`
                : ""}
            </p>
          )}
          {includedCount != null && (
            <p className="socc-stock">
              {includedCount} {includedCount === 1 ? "מוצר זמין" : "מוצרים זמינים"}
              {totalProducts ? ` מתוך ${totalProducts}` : ""}
              {missingCount > 0 && (
                <span className="socc-stock-missing">
                  {" · "}
                  חסרים {missingCount}
                </span>
              )}
            </p>
          )}
        </div>

        <div className="socc-price-block">
          <span className="socc-price">
            <span className="socc-price-currency">₪</span>
            {(optimalCart.totalPrice ?? 0).toFixed(2)}
          </span>
          {showSavings && (
            <span className="socc-savings">
              חוסכים ₪{savings.toFixed(2)}
            </span>
          )}
        </div>
      </div>

      {missingCount > 0 && (
        <div className="socc-missing">
          <span className="socc-missing-label">חסרים בסופר זה:</span>
          <div className="socc-missing-tags">
            {missingNames.slice(0, 4).map((name, i) => (
              <span key={i} className="socc-missing-tag">
                {name}
              </span>
            ))}
            {missingNames.length > 4 && (
              <span className="socc-missing-tag socc-missing-tag--more">
                +{missingNames.length - 4}
              </span>
            )}
          </div>
        </div>
      )}
    </article>
  );
};

export default SupermarketOptimalCartItem;
