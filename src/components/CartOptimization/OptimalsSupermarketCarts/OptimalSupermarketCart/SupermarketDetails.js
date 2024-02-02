import React from "react";

const SupermarketDetails = ({ supermarketDetails }) => {
  const supermarketName = supermarketDetails.name;
  const supermarketAddress = supermarketDetails.address;
  const supermarketCity = supermarketDetails.city;

  return (
    <div className="optimal-cart">
        {console.log("supermarketName: ", supermarketName)}
      <div className="optimal-cart__supermarket-name">{supermarketName}</div>
      <div className="optimal-cart__supermarket-address">
        {supermarketAddress}
      </div>
      <div className="optimal-cart__supermarket-city">{supermarketCity}</div>
    </div>
  );
};

export default SupermarketDetails;
