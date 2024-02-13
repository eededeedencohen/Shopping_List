import React from "react";
import { useLocation } from "react-router-dom";

import SupermarketDetails from "./SupermarketDetails";
import OptimalProductsList from "./OptimalProductsList";

const OptimalCart = () => {
  const { state } = useLocation();
  const { optimalCart, supermarketDetails, originalCart } = state;

  return (
    <div className="full-optimal-cart">
      <SupermarketDetails supermarketDetails={supermarketDetails} />
      <OptimalProductsList
        optimalCart={optimalCart}
        originalCart={originalCart}
      />
    </div>
  );
};

export default OptimalCart;
