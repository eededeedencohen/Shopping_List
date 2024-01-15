import React from "react";
import ProductsImages from "../Images/ProductsImages";
import "./ProductDetails.css";
import { convertWeightUnit } from "./ProductDetailsHelpers";
// import { useCartOptimizationContext } from "../../context/cart-optimizationContext";

export default function productDetails({ productDetails, quantity }) {
  return (
    <div className="optimal-settings__product-details">
      <div className="image">
        <ProductsImages barcode={productDetails.barcode} />
      </div>
      <div className="details">
        <div className="name">{productDetails.name}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "row-reverse",
            marginBottom: "0.5rem",
          }}
        >
          <div className="weight">
            {" "}
            <p>{productDetails.weight}</p>{" "}
          </div>
          <div className="unitsWeight">{convertWeightUnit(productDetails.unitWeight)}</div>
          <div className="separating-line">|</div>
          <div className="brand">{productDetails.brand}</div>
        </div>
        <div className="quantity">
          <p>כמות בעגלה</p>
          <p>:</p>
          <p style={{ marginRight: "4px" }}>{quantity}</p>
        </div>
      </div>
    </div>
  );
}
