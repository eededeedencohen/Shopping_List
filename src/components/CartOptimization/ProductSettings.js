import React from "react";
import ProductDetails from "./ProductDetails";
import WeightAccuracy from "./WeightAccuracy";
import BrandsFilter from "./BrandsFilter/BrandsFilter";
import "./ProductSettings.css";
import { useSettingsOperations } from "../../hooks/optimizationHooks";
import { useProductGroups } from "../../hooks/appHooks";

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className={`ps-toggle ${checked ? "is-on" : ""}`}>
      <span className="ps-toggle-text">
        <span className="ps-toggle-label">{label}</span>
        {hint && <span className="ps-toggle-hint">{hint}</span>}
      </span>
      <input
        type="checkbox"
        className="ps-toggle-input"
        checked={checked}
        onChange={onChange}
      />
      <span className="ps-toggle-track" aria-hidden="true">
        <span className="ps-toggle-thumb" />
      </span>
    </label>
  );
}

export default function ProductSettings({ product }) {
  const { changeCanRoundUp, changeCanReplace } = useSettingsOperations();
  const { groups, isLoading } = useProductGroups(product.barcode);

  return (
    <article className="ps-card">
      <ProductDetails
        productDetails={product.productDetails}
        quantity={product.quantity}
      />

      <div className="ps-options">
        <ToggleRow
          label="עיגול כמות במבצע"
          hint="הוסף יחידות אם המבצע משתלם יותר"
          checked={product.productSettings.canRoundUp}
          onChange={() => changeCanRoundUp(product.barcode)}
        />
        <ToggleRow
          label="החלפה במוצר חלופי"
          hint="החלף במוצר זול ובמשקל דומה אם זמין"
          checked={product.productSettings.canReplace}
          onChange={() => changeCanReplace(product.barcode)}
        />
      </div>

      {product.productSettings.canReplace && (
        <div className="ps-replace-options">
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
          <div className="ps-tags">
            {isLoading ? (
              <span className="ps-tags-state">טוען תגיות…</span>
            ) : groups.length ? (
              groups.map((g) => (
                <span key={g.groupName} className="ps-tag">
                  {g.groupName}
                </span>
              ))
            ) : (
              <span className="ps-tags-state">אין תגיות</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
