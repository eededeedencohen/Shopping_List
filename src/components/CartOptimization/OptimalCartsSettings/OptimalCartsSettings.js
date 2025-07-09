import React from "react";
import ProductsGeneralSettings from "./ProductsGeneralSettings";
import CalculationOptimalCarts from "./CalculationOptimalCarts";
import SupermarketsFilterModal from "./SupermarketsFilterModal";
import SettingsIcon from "./settings.svg";
import { ReactComponent as FilterIcon } from "../BrandsFilter/filter.svg";

// Correct import for useNavigate
import { useNavigate } from "react-router-dom";

import "./OptimalCartsSettings.css";
import { useState } from "react";

const OptimalCartsSettings = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleIconClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate("/products-settings");
    }, 800);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="optimal-carts-settings">
      <div className="products-settings-button" onClick={handleIconClick}>
        <div
          className={`products-settings-icon ${isAnimating ? "rotate" : ""}`}
        >
          <img src={SettingsIcon} alt="settings" />
        </div>
        <div className="products-settings-label">מעבר להגדרות מוצרים</div>
      </div>
      <ProductsGeneralSettings />
      <div
        className="supermarkets-filter-button"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="supermarkets-filter-icon">
          <FilterIcon />
        </div>
        <div className="supermarkets-filter-label">סינון סופרמרקטים</div>
      </div>
      <SupermarketsFilterModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
      ></SupermarketsFilterModal>
      <CalculationOptimalCarts />
    </div>
  );
};

export default OptimalCartsSettings;
