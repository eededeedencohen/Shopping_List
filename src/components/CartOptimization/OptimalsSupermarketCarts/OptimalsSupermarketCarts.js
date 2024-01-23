import React, { useState, useEffect } from "react";
import LoadingCart from "./LoadingCart";
import CartsFilter from "./CartsFilter";
import SupermarketOptimalCartItem from "./SupermarketOptimalCartItem";
import "./OptimalsSupermarketCarts.css";
import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";

const OptimalsSupermarketCarts = () => {
  const { getOptimalsCarts, allSupermarkets, fullCart } = useCartOptimizationContext();

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

  // let cartsWithAllProducts = [];

  if (!isCalculationOptimalCarts) {
    return <LoadingCart />;
  } else {
    // filter carts with all products and sort by total price
    // cartsWithAllProducts = calculationOptimalCarts
    //   .filter((cart) => cart.nonExistsProducts.length === 0)
    //   .sort((a, b) => a.totalPrice - b.totalPrice);
  }

  return (
    <div>
      {console.log("fullCart: ", fullCart)}
      <CartsFilter />
      {calculationOptimalCarts.map((cart) => (
        // {cartsWithAllProducts.map((cart) => (
        // cart.nonExistsProducts.length === 0 &&
        <SupermarketOptimalCartItem
          key={cart.supermarketID}
          optimalCart={cart}
          originalCart={fullCart}
          supermarketDetails={allSupermarkets.find(
            (supermarket) => supermarket.supermarketID === cart.supermarketID
          )}
        />
      ))}
    </div>
  );
};

export default OptimalsSupermarketCarts;
//
