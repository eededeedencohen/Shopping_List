import React from "react";
import ProductsGeneralSettings from "./ProductsGeneralSettings";
import CalculationOptimalCarts from "./CalculationOptimalCarts";
import SupermarketsFilter from "./SupermarketsFilter";
import SettingsIcon from "./settings.svg";

// Correct import for useNavigate
import { useNavigate } from "react-router-dom";

import "./OptimalCartsSettings.css";
import { useState } from "react";

const OptimalCartsSettings = () => {
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  const handleIconClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      navigate("/products-settings");
    }, 800); // Navigate after 3 seconds
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
      <SupermarketsFilter />
      <CalculationOptimalCarts />
    </div>
  );
};

export default OptimalCartsSettings;
