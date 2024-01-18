import React from "react";
import ProductsGeneralSettings from "./ProductsGeneralSettings";
import CalculationOptimalCarts from "./CalculationOptimalCarts";
import SupermarketsFilter from "./SupermarketsFilter";

// Correct import for useNavigate
import { useNavigate } from "react-router-dom";

import "./OptimalCartsSettings.css";

const OptimalCartsSettings = () => {
  // Correctly initialized navigate function
  const navigate = useNavigate();

  return (
    <div className="optimal-carts-settings">
      <div 
        className="products-settings-button"
        // Correct usage of navigate function
        onClick={() => navigate("/products-settings")}
      >
        Products Settings
      </div>
      <ProductsGeneralSettings />
      <CalculationOptimalCarts />
      <SupermarketsFilter />
    </div>
  );
};

export default OptimalCartsSettings;
