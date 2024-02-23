import React from "react";
import SupermarketDetails from "./SupermarketDetails";
import OptimalProductsList from "./OptimalProductsList";

const OptimalCartV2 = ({
  optimalCart,
  supermarketDetails,
  originalCart,
  onClickBack, // This prop is used to handle the back button click.
}) => {
  return (
    <div className="full-optimal-cart">
      {/* Supermarket details and products list components remain unchanged */}
      <SupermarketDetails supermarketDetails={supermarketDetails} />
      <OptimalProductsList optimalCart={optimalCart} originalCart={originalCart} />
      
      {/* Back button added */}
      <button className="back-button" onClick={onClickBack}>
        Back
      </button>
    </div>
  );
};

export default OptimalCartV2;
