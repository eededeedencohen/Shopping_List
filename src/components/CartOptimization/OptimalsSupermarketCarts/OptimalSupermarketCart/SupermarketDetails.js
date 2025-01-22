import React from "react";
import "./SupermarketDetails.css";
// Import the logo component:
import SupermarketLogo from "../../../../components/Images/SupermarketImage";

const SupermarketDetails = ({ supermarketDetails }) => {
  const { name: supermarketName, address: supermarketAddress, city: supermarketCity } = supermarketDetails;

  return (
    <div className="optimal-cart">
      {console.log("supermarketName: ", supermarketName)}
      <div className="optimal-cart__supermarket-logo">
        <SupermarketLogo supermarketName={supermarketName} />
        {console.log("supermarketDetails: ", supermarketDetails)}
      </div>
      <div className="optimal-cart__supermarket-info">
        <div className="optimal-cart__supermarket-address">
          {supermarketAddress}
        </div>
        <div className="optimal-cart__supermarket-city">
          {supermarketCity}
        </div>
      </div>
    </div>
  );
};

export default SupermarketDetails;
