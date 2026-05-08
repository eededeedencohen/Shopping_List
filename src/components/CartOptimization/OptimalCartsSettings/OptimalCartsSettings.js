import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductsGeneralSettings from "./ProductsGeneralSettings";
import CalculationOptimalCarts from "./CalculationOptimalCarts";
import SupermarketsFilterModal from "./SupermarketsFilterModal";
import {
  useSettings,
  useSupermarkets,
} from "../../../hooks/optimizationHooks";
import "./OptimalCartsSettings.css";

const ProductIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
  </svg>
);

const FilterIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

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
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const SparkleIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    {...props}
  >
    <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" />
  </svg>
);

const OptimalCartsSettings = () => {
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const { supermarketIDs = [] } = useSettings();
  const { allSupermarkets = [] } = useSupermarkets();
  const selectedCount = supermarketIDs.length;
  const totalCount = allSupermarkets.length;

  const filterHint =
    totalCount === 0
      ? "טוען רשתות…"
      : selectedCount === 0
      ? `כל ${totalCount} הסניפים`
      : `${selectedCount}/${totalCount} סניפים`;

  return (
    <div className="optx-page">
      {/* Animated aurora background */}
      <div className="optx-bg" aria-hidden="true">
        <div className="optx-blob optx-blob-1" />
        <div className="optx-blob optx-blob-2" />
        <div className="optx-blob optx-blob-3" />
        <div className="optx-mesh" />
      </div>

      {/* Hero */}
      <header className="optx-hero">
        <span className="optx-hero-eyebrow">
          <SparkleIcon className="optx-hero-eyebrow-icon" />
          אופטימיזציה חכמה
        </span>
        <h1 className="optx-hero-title">
          מצא את העגלה{" "}
          <span className="optx-hero-accent">הזולה ביותר</span>
        </h1>
      </header>

      {/* Top action pills */}
      <div className="optx-pills-row">
        <button
          type="button"
          className="optx-pill optx-pill--blue"
          onClick={() => navigate("/products-settings")}
        >
          <span className="optx-pill-icon">
            <ProductIcon />
          </span>
          <span className="optx-pill-text">
            <span className="optx-pill-title">לפי מוצר</span>
            <span className="optx-pill-hint">הגדרות פרטניות</span>
          </span>
          <ChevronIcon className="optx-pill-arrow" />
        </button>

        <button
          type="button"
          className="optx-pill optx-pill--purple"
          onClick={() => setIsFilterModalOpen(true)}
        >
          <span className="optx-pill-icon">
            <FilterIcon />
          </span>
          <span className="optx-pill-text">
            <span className="optx-pill-title">סופרמרקטים</span>
            <span className="optx-pill-hint">{filterHint}</span>
          </span>
          <ChevronIcon className="optx-pill-arrow" />
        </button>
      </div>

      {/* Combined rules card */}
      <ProductsGeneralSettings />

      <SupermarketsFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      <CalculationOptimalCarts />
    </div>
  );
};

export default OptimalCartsSettings;
