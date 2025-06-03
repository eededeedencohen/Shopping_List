import React from "react";
import { useState } from "react";
import LoadingCart from "./LoadingCart";
import CartsFilter from "./CartsFilter";
import SupermarketOptimalCartItem from "./SupermarketOptimalCartItem";
import "./OptimalsSupermarketCarts.css";
// import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";
import {
  useSupermarkets,
  useOptimalCarts,
} from "../../../hooks/optimizationHooks";
import { useFullCart } from "../../../hooks/appHooks";

const OptimalsSupermarketCarts = () => {
  // const { allSupermarkets, fullCart, optimalCarts, isOptimalCartsCalculated } = useCartOptimizationContext();
  // const { allSupermarkets, optimalCarts, isOptimalCartsCalculated } = useCartOptimizationContext();
  const { allSupermarkets } = useSupermarkets();
  const { optimalCarts, isOptimalCartsCalculated } = useOptimalCarts();

  const { fullCart } = useFullCart();
  const [selectedSupermarketID, setSelectedSupermarketID] = useState(0);

  if (!isOptimalCartsCalculated) {
    return <LoadingCart />;
  }

  // If no supermarket is selected, display all optimal carts.
  if (selectedSupermarketID === 0) {
    return (
      <div>
        <CartsFilter />
        {console.log("fullCart: ", fullCart)}
        {optimalCarts.map((cart) => (
          <SupermarketOptimalCartItem
            key={cart.supermarketID}
            optimalCart={cart}
            originalCart={fullCart}
            supermarketDetails={allSupermarkets.find(
              (supermarket) => supermarket.supermarketID === cart.supermarketID
            )}
            onSelectedSupermarket={setSelectedSupermarketID} // Correctly passing the setter function.
          />
        ))}
      </div>
    );
  } else {
    // Display only the selected supermarket's cart.
    return (
      <div>
        <CartsFilter />
        {optimalCarts
          .filter((cart) => cart.supermarketID === selectedSupermarketID)
          .map((cart) => (
            <SupermarketOptimalCartItem
              key={cart.supermarketID}
              optimalCart={cart}
              originalCart={fullCart}
              supermarketDetails={allSupermarkets.find(
                (supermarket) =>
                  supermarket.supermarketID === cart.supermarketID
              )}
              onSelectedSupermarket={setSelectedSupermarketID} // Ensure this prop is consistently passed.
            />
          ))}
      </div>
    );
  }
};

export default OptimalsSupermarketCarts;
