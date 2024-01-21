import React, { useState, useEffect } from "react";
import LoadingCart from "./LoadingCart";
import CartsFilter from "./CartsFilter";
import SupermarketOptimalCartItem from "./SupermarketOptimalCartItem";
import "./OptimalsSupermarketCarts.css";
import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";

const OptimalsSupermarketCarts = () => {
  const { getOptimalsCarts } = useCartOptimizationContext();

  const [calculationOptimalCarts, setCalculationOptimalCarts] = useState([]);
  const [isCalculationOptimalCarts, setIsCalculationOptimalCarts] =
    useState(false);

  useEffect(() => {
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
    handleCalculateOptimalSupermarketCarts();
  }, [getOptimalsCarts]);

  if (!isCalculationOptimalCarts) {
    return <LoadingCart />;
  }

  return (
    <div>
      <CartsFilter />
      {console.log(calculationOptimalCarts)}
      {calculationOptimalCarts.map((cart) => {
        return (
          <SupermarketOptimalCartItem key={cart.supermarketID} cart={cart} />
        );
      })}
    </div>
  );
};

export default OptimalsSupermarketCarts;
// 