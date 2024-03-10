import React from "react";
import ProductsImages from "../../../../Images/ProductsImages";
import "./EditOptimalProduct.css";
import PointerIcon from "./pointer.svg";

const EditOptimalProduct = ({
  productDetails,
  optimalProductDetails,
  supermarketID,
}) => {
  console.log("productDetails", productDetails);
  console.log("optimalProductDetails", optimalProductDetails);
  console.log("supermarketID", supermarketID);
  return (
    <div className="edit-optimal-product">
      <div className="edit-optimal-product__edit-amount">
        <div className="edit-amount__product-details">
          <div className="product-image">
            <ProductsImages barcode="3029815" />
          </div>
          <div className="product-details">
            <div className="product-name">חלב 3 אחוז</div>
            <div className="product-unique-details">
              <div className="weight">500</div>
              <div className="unit-weight">ליטר</div>
              <div className="separating-line">|</div>
              <div className="brand">תנובה</div>
            </div>
            <div className="priduct-unit-price">
              <div className="label">:מחיר</div>
              <div className="price">₪5.90</div>
            </div>
            <div className="product-discount-price">
              מבצע: {1 + 2} יחידות ב-₪{(5.9).toFixed(2)}
            </div>
          </div>
        </div>
        <div className="edit-amount__alternative-products-guide">
          <div className="pointer-icon">
            <img src={PointerIcon} alt="pointer" />
          </div>
          <div className="guide">
            <b>לחץ כאן</b> להצגת מוצרים חלופיים
          </div>
        </div>
        <div className="edit-amount__product-details-optimal-cart">
          <div className="edit-amount__current-amount">
            כמות נוכחית: <b>{1 + 2} יחידות</b>
          </div>
          <div className="edit-amount__current-total-price">
            מחיר נוכחי: <b>₪{(5.9).toFixed(2)}</b>
          </div>
        </div>
        <div className="edit-amount__operations">
          <div className="quantity-reduction-button">-</div>
          <div className="display-editing-quantity">4</div>
          <div className="quantity-unit-label">'יח</div>
          <div className="quantity-increase-button">+</div>
          <div className="confirm-button">עדכן</div>
        </div>
      </div>
      <div className="edit-optimal-product__replace-product"></div>
      <div></div>
    </div>
  );
};

export default EditOptimalProduct;
