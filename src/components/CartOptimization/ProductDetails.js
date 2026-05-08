import React from "react";
import { ProductImageDisplay } from "../Images/ProductImageService";
import { convertWeightUnit } from "./ProductDetailsHelpers";
import "./ProductDetails.css";

export default function ProductDetails({ productDetails, quantity }) {
  const hasWeight =
    productDetails.weight !== undefined &&
    productDetails.weight !== "" &&
    productDetails.weight !== 0;

  return (
    <div className="ps-product">
      <div className="ps-product-img">
        <ProductImageDisplay
          barcode={productDetails.barcode}
          className="ps-product-img-el"
        />
      </div>
      <div className="ps-product-info">
        <h3 className="ps-product-name">{productDetails.name}</h3>
        <p className="ps-product-meta">
          {hasWeight && (
            <span>
              {productDetails.weight} {convertWeightUnit(productDetails.unitWeight)}
            </span>
          )}
          {productDetails.brand && <span>{productDetails.brand}</span>}
        </p>
        <div className="ps-product-qty">
          <span className="ps-product-qty-label">בעגלה</span>
          <span className="ps-product-qty-val">{quantity}</span>
        </div>
      </div>
    </div>
  );
}
