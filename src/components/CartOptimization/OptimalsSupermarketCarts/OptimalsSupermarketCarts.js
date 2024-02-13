import React from "react";
// import {useEffect } from "react";
import LoadingCart from "./LoadingCart";
import CartsFilter from "./CartsFilter";
import SupermarketOptimalCartItem from "./SupermarketOptimalCartItem";
import "./OptimalsSupermarketCarts.css";
import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";

const OptimalsSupermarketCarts = () => {
  const {
    allSupermarkets,
    fullCart,
    optimalCarts,
    isOptimalCartsCalculated,
    // calculateOptimalsCarts,
  } = useCartOptimizationContext();

  // useEffect(() => {
  //   const handleCalculateOptimalSupermarketCarts = async () => {
  //     try {
  //       await calculateOptimalsCarts();
  //     } catch (error) {
  //       console.error("Error in fetching data: ", error);
  //     }
  //   };
  //   handleCalculateOptimalSupermarketCarts();
  // }, [allSupermarkets]);

  // if (!isCalculationOptimalCarts || !isOptimalCartsCalculated) {
  if (!isOptimalCartsCalculated) {
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
      {console.log("optimalCartNew: ", optimalCarts)}
      <CartsFilter />
      {optimalCarts.map((cart) => (
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
