import React from "react";
import ProductSettings from "./ProductSettings";
import "./ListProductsSettings.css";
import { useSettings } from "../../hooks/optimizationHooks";
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

export default function ListProductsSettings() {
  const { productsSettings, isProductsSettingsUploaded } = useSettings();
  const navigate = useNavigate();

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
          onClick={() => navigate("/optimal-carts-settings")}
        >
          <ChevronIcon />
          חזרה להגדרות כלליות
        </button>
        <h1 className="lps-title">הגדרות לפי מוצר</h1>
        <p className="lps-subtitle">
          {productsSettings.length} {productsSettings.length === 1 ? "מוצר" : "מוצרים"} בעגלה
        </p>
      </header>

      <div className="lps-list">
        {productsSettings.map((product) => (
          <ProductSettings key={product.barcode} product={product} />
        ))}
      </div>
    </div>
  );
}
