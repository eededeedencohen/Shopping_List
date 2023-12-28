import React from "react";
import "./SearchItem.css"; // You can create a separate CSS file for styling
import ProductsImages from "../Images/ProductsImages";

export const convertWeightUnit = (weightUnit) => {
  weightUnit = weightUnit.toLowerCase();
  if (weightUnit === "g") {
    return "גרם";
  }
  if (weightUnit === "kg") {
    return 'ק"ג';
  }
  if (weightUnit === "ml") {
    return 'מ"ל';
  }
  if (weightUnit === "l") {
    return "ליטר";
  }
  if (weightUnit === "u") {
    return "יחידות";
  }
  return weightUnit;
};


const getDiscountFormat = (discount) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: " flex-start",
        justifyContent: "center",
      }}
    >
      {" "}
      {/* Flex container */}
      <div style={{ marginLeft: "6px" }}>{discount.units}</div> {/* Units */}
      <div>{"יחידות ב"}</div> {/* Text */}
      <div style={{ marginLeft: "3px", marginRight: "3px" }}>{"-"}</div>{" "}
      {/* Hyphen */}
      <div>{discount.totalPrice.toFixed(2)}</div>{" "}
      {/* Total price formatted to two decimal places */}
      <div
        style={{ fontSize: "1.1rem", fontWeight: "bold",  marginTop: "-0.3rem"}}
      >
        ₪
      </div>
      {/* Currency symbol */}
    </div>
  );
};




const SearchItem = ({
  product,
  amount,
  oldAmount,
  onClick,
  onIncreaseAmount,
  onDecreaseAmount,
  onConfirmChanges,
}) => {
  if (!product) return null;
  return (
    <div className="search-item">
      <div className="search__product-card" onClick={onClick}>
        <div className="search__product-image">
          <ProductsImages barcode={product.barcode} />
        </div>
        <div className="search__product-details">
          <div className="search__product-name">{product.name}</div>
          <div className="search__procuct-unique-detail">
            <div className="search__procuct-brand">{product.brand}</div>
            <div
              style={{
                marginLeft: "0.2rem",
                marginRight: "0.2rem",
                paddingBottom: "0.2rem",
              }}
            >
              |
            </div>
            <div className="search__procuct-unitWeight">
              {convertWeightUnit(product.unitWeight)}
            </div>

            <div className="search__procuct-weight">{product.weight}</div>
          </div>
          {product.price ? (
            <div className="search__procuct-price exist">
              <div>{product.price.price}</div>
              <div>₪</div>
            </div>
          ) : (
            <div className="search__procuct-price not-exist">
              מוצר לא קיים בסופר
            </div>
          )}
          {product.price && product.price.discount ? (
            <div className="search__procuct-discount">
              {getDiscountFormat(product.price.discount)}
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
      <div className="search__product-amount">
        <div className="search__product-update-amount">
          <div
            className="search__product-increase-amount"
            onClick={onIncreaseAmount}
          >
            +
          </div>
          <div className="search__product-amount-number">{amount}</div>
          <div
            className="search__product-decrease-amount"
            onClick={onDecreaseAmount}
          >
            -
          </div>
        </div>
        <div
          id={`confirm-${product.barcode}`}
          className="search__product-confirm-button"
          onClick={onConfirmChanges}
        >
          אין שינוי
        </div>
      </div>
      <div className="search__line" />
    </div>
  );
};

export default SearchItem;
