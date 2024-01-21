import React from "react";

const SupermarketOptimalCartItem = ({cart}) => {
  return (
    <div>
      <h1>{cart.supermarketID}</h1>
      {console.log(cart)}
    </div>
  );
};

export default SupermarketOptimalCartItem;
