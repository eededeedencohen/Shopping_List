import React from "react";
import "./SearchItem.css"; // You can create a separate CSS file for styling
import ProductsImages from "../Images/ProductsImages";

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
    <div 
    className="search-item"
    >
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
              {product.unitWeight}
            </div>

            <div className="search__procuct-weight">{product.weight}</div>
          </div>
          <div className="search__procuct-price">4.00</div>
          <div className="search__procuct-discount">8.00</div>
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
