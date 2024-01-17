import React from "react";
import "./BrandItem.css";
import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";

const BrandItem = ({ brand, barcode }) => {
  const {
    getBlackListBrands,
    insertBrandToBlackList,
    removeBrandFromBlackList,
  } = useCartOptimizationContext();

  return (
    <div className="brand-item">
      <div className="brand-item__brand-name">{brand}</div>
      <div className="brand-item__checkbox">
        <input
          type="checkbox"
          checked={!getBlackListBrands(barcode).includes(brand)}
          onChange={() =>
            getBlackListBrands(barcode).includes(brand)
              ? removeBrandFromBlackList(barcode, brand)
              : insertBrandToBlackList(barcode, brand)
          }
        ></input>
      </div>
    </div>
  );
};
export default BrandItem;
