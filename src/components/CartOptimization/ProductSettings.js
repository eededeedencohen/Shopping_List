import React from "react";
import ProductDetails from "./ProductDetails";
import WeightAccuracy from "./WeightAccuracy";
import BrandsFilter from "./BrandsFilter/BrandsFilter";
import "./ProductSettings.css";
import { useSettingsOperations } from "../../hooks/optimizationHooks";

export default function ProductSettings({ product }) {
  /* ❱❱ מחלץ את הפונקציות החדשות ❰❰ */
  const { changeCanRoundUp, changeCanReplace } = useSettingsOperations();

  return (
    <div className="product-settings">
      <ProductDetails
        productDetails={product.productDetails}
        quantity={product.quantity}
      />

      {/* כפתור עיגול כמות */}
      <div className="can-round-up">
        <div className="explanation">לעגל כמות של המוצר במקרה שקיים מבצע</div>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={product.productSettings.canRoundUp}
            onChange={() => changeCanRoundUp(product.barcode)}
          />
        </div>
      </div>

      {/* כפתור החלפה */}
      <div className="can-replace">
        <div className="explanation">להחליף במקרה של מוצר חלופי משתלם יותר</div>
        <div className="checkbox">
          <input
            type="checkbox"
            checked={product.productSettings.canReplace}
            onChange={() => changeCanReplace(product.barcode)}
          />
        </div>
      </div>

      {/* רכיבי המשך מופיעים רק אם מותר להחליף */}
      {product.productSettings.canReplace && (
        <>
          <WeightAccuracy
            barcode={product.barcode}
            productWeight={product.productDetails.weight}
            productUnitWeight={product.productDetails.unitWeight}
            currentWeightGain={product.productSettings.maxWeightGain}
            currentWeightLoss={product.productSettings.maxWeightLoss}
          />
          <BrandsFilter
            generalName={product.productDetails.generalName}
            barcode={product.barcode}
          />
        </>
      )}
    </div>
  );
}
