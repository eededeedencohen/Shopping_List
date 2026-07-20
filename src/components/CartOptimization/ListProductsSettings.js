import React, { useMemo, useState } from "react";
import ProductSettings from "./ProductSettings";
import "./ListProductsSettings.css";
import { useSettings } from "../../hooks/optimizationHooks";
import { classificationRulesActive } from "../../context/classificationsContext";
import { useNavigate } from "react-router-dom";

const ChevronIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* Overview list — one compact accordion row per cart product. The header
   strip answers the page's core question ("מה מוגדר?") before any scrolling;
   a single row is open at a time. */

export default function ListProductsSettings() {
  const { productsSettings, isProductsSettingsUploaded } = useSettings();
  const navigate = useNavigate();
  const [openBarcode, setOpenBarcode] = useState(null);

  const counts = useMemo(() => {
    const total = productsSettings.length;
    let replaceable = 0;
    let withFilters = 0;
    for (const p of productsSettings) {
      const s = p.productSettings;
      if (!s.canReplace) continue;
      replaceable += 1;
      const hasWeight = (s.maxWeightGain || 0) > 0 || (s.maxWeightLoss || 0) > 0;
      const hasBrands = (s.blackListBrands || []).length > 0;
      const hasTags = classificationRulesActive(s.classificationRules);
      if (hasWeight || hasBrands || hasTags) withFilters += 1;
    }
    return { total, replaceable, withFilters };
  }, [productsSettings]);

  if (!isProductsSettingsUploaded) {
    return (
      <div className="lps-page">
        <div className="lps-loading">
          <div className="lps-spinner" />
          <p>טוען מוצרים…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lps-page">
      <header className="lps-header">
        <button
          type="button"
          className="lps-back"
          aria-label="חזרה להגדרות כלליות"
          onClick={() => navigate("/optimal-carts-settings")}
        >
          <ChevronIcon />
        </button>
        <div className="lps-titles">
          <h1 className="lps-title">הגדרות לפי מוצר</h1>
          <p className="lps-subtitle">
            {counts.total} {counts.total === 1 ? "מוצר" : "מוצרים"}
            {counts.replaceable > 0 && (
              <>
                {" · "}
                <b>{counts.replaceable} עם החלפה פעילה</b>
              </>
            )}
          </p>
        </div>
      </header>

      <div className="lps-strip">
        <div className="lps-strip-chip">
          <b>{counts.total}</b>
          <span>מוצרים</span>
        </div>
        <div className="lps-strip-chip">
          <b>{counts.replaceable}</b>
          <span>ניתנים להחלפה</span>
        </div>
        <div className="lps-strip-chip">
          <b>{counts.withFilters}</b>
          <span>עם סינונים</span>
        </div>
      </div>

      <div className="lps-list">
        {productsSettings.map((product) => (
          <ProductSettings
            key={product.barcode}
            product={product}
            isOpen={openBarcode === product.barcode}
            onToggle={() =>
              setOpenBarcode((cur) =>
                cur === product.barcode ? null : product.barcode
              )
            }
          />
        ))}
      </div>
    </div>
  );
}
