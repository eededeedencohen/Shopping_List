import React, { useState } from "react";
import ProductSettings from "./ProductSettings";
import "./ListProductsSettings.css";
import { useCartOptimizationContext } from "../../context/cart-optimizationContext";
import { useNavigate } from "react-router-dom";


export default function ListProductsSettings() {
  const {
    productsSettings,
    isProductsSettingsUploaded,
    optimalSupermarkets,
    isDataUploaded,
    getOptimalsCarts,
  } = useCartOptimizationContext();

  const navigate = useNavigate();

  const [calculationOptimalCarts, setCalculationOptimalCarts] = useState();
  const [isCalculationOptimalCarts, setIsCalculationOptimalCarts] =
    useState(false);

  const handleCalculateOptimalSupermarketCarts = async () => {
    try {
      const optimalCarts = await getOptimalsCarts();
      setCalculationOptimalCarts(optimalCarts);
      setIsCalculationOptimalCarts(true);
    } catch (error) {
      console.error("Error in fetching data: ", error);
      setIsCalculationOptimalCarts(false);
    }
  };

  const handlePringOPtimalSupermarketCarts = () => {
    if (!isCalculationOptimalCarts) {
      console.log("No data uploaded yet");
    } else {
      console.log(calculationOptimalCarts);
    }
  };

  const printOptimalSupermarketCarts = () => {
    if (!isDataUploaded) {
      console.log("No data uploaded yet");
    } else {
      console.log(optimalSupermarkets);
    }
  };

  if (!isProductsSettingsUploaded) {
    return (
      <div>
        <h1>Loading Data...</h1>
      </div>
    );
  }

  return (
    <div className="list-products-settings">
      <button onClick={() => navigate("/optimal-carts-settings")}> General Settings</button>
      <div>
        {productsSettings.map((product) => (
          <ProductSettings key={product.barcode} product={product} />
        ))}
      </div>
      <button onClick={printOptimalSupermarketCarts}>
        Print Optimal Supermarket Carts
      </button>
      <button onClick={handleCalculateOptimalSupermarketCarts}>
        Calculate Optimal Supermarket Carts
      </button>
      <button onClick={handlePringOPtimalSupermarketCarts}> Print</button>
      {console.log("xxx:")}
    </div>
  );
}
