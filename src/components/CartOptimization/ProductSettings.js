import React, { useState } from "react";
import ProductDetails from "./ProductDetails";
import WeightAccuracy from "./WeightAccuracy";
import BrandsFilter from "./BrandsFilter/BrandsFilter";
import AlternativeProductsModal from "./AlternativeProductsModal/AlternativeProductsModal";
import "./ProductSettings.css";
import { useSettingsOperations } from "../../hooks/optimizationHooks";
import { IconChevronLeft } from "../Icons/UiIcons";

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
  const [isAltModalOpen, setIsAltModalOpen] = useState(false);

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

          <button
            type="button"
            className="ps-view-alts-btn"
            onClick={() => setIsAltModalOpen(true)}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span>הצג מוצרים תואמים</span>
            <span className="ps-view-alts-btn__chevron" aria-hidden="true"><IconChevronLeft /></span>
          </button>

          <AlternativeProductsModal
            isOpen={isAltModalOpen}
            onClose={() => setIsAltModalOpen(false)}
            barcode={product.barcode}
            productDetails={product.productDetails}
            productSettings={product.productSettings}
          />
        </div>
      )}
    </article>
  );
}
