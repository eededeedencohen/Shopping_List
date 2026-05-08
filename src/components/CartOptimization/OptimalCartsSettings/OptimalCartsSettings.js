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
    strokeWidth="2"
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
    strokeWidth="2"
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

const OptimalCartsSettings = () => {
  const navigate = useNavigate();
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const { supermarketIDs = [] } = useSettings();
  const { allSupermarkets = [] } = useSupermarkets();
  const selectedCount = supermarketIDs.length;
  const totalCount = allSupermarkets.length;

  const filterSubtitle =
    totalCount === 0
      ? "טוען רשתות…"
      : selectedCount === 0
      ? `כל ${totalCount} הסניפים יושוו`
      : `${selectedCount} מתוך ${totalCount} סניפים נבחרו`;

  return (
    <div className="optx-page">
      <header className="optx-header">
        <h1 className="optx-title">אופטימיזציית עגלות</h1>
        <p className="optx-subtitle">
          בחר את כללי החישוב והחנויות לפני שנמצא את העגלה הזולה ביותר
        </p>
      </header>

      <button
        type="button"
        className="optx-action-card"
        onClick={() => navigate("/products-settings")}
      >
        <span className="optx-action-icon optx-action-icon--blue">
          <ProductIcon />
        </span>
        <span className="optx-action-text">
          <span className="optx-action-title">הגדרות לפי מוצר</span>
          <span className="optx-action-subtitle">
            לעגל / להחליף בנפרד עבור כל מוצר
          </span>
        </span>
        <ChevronIcon className="optx-action-chevron" />
      </button>

      <ProductsGeneralSettings />

      <button
        type="button"
        className="optx-action-card"
        onClick={() => setIsFilterModalOpen(true)}
      >
        <span className="optx-action-icon optx-action-icon--purple">
          <FilterIcon />
        </span>
        <span className="optx-action-text">
          <span className="optx-action-title">סינון סופרמרקטים</span>
          <span className="optx-action-subtitle">{filterSubtitle}</span>
        </span>
        <ChevronIcon className="optx-action-chevron" />
      </button>

      <SupermarketsFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
      />

      <CalculationOptimalCarts />
    </div>
  );
};

export default OptimalCartsSettings;
