import React from "react";
import "./SupermarketItem.css";
import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";

const SupermarketItem = ({ supermarketObject }) => {
  const { supermarketIDs, insertSupermarketID, removeSupermarketID } =
    useCartOptimizationContext();

  const toggleSupermarket = () => {
    if (supermarketIDs.includes(supermarketObject.supermarketID)) {
      removeSupermarketID(supermarketObject.supermarketID);
    } else {
      insertSupermarketID(supermarketObject.supermarketID);
    }
  };

  return (
    <div className="supermarket-item">
      <div className="supermarket-item-name">{supermarketObject.name}</div>
      <div className="supermarket-item-address">
        ,{supermarketObject.address}
      </div>
      <div className="supermarket-item-city">{supermarketObject.city}</div>
      <div className="supermarket-item-checkbox">
        <input
          type="checkbox"
          checked={supermarketIDs.includes(supermarketObject.supermarketID)}
          onChange={toggleSupermarket}
        />
      </div>
    </div>
  );
};

export default SupermarketItem;
