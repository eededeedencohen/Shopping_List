import React, { useState } from "react";
import ModalV1 from "../../Modal/ModalV1";
import "./SupermarketsFilter.css";
import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";
import SupermarketItem from "./SupermarketItem";
import filterIcon from "../BrandsFilter/filter.svg";

const SupermarketsFilter = () => {
  const { allSupermarkets, isAllSupermarketsUploaded, supermarketIDs } =
    useCartOptimizationContext();
  const [isSupermarketsFilterOpen, setIsSupermarketsFilterOpen] =
    useState(false);

  const toggleSupermarketsFilter = () =>
    setIsSupermarketsFilterOpen(!isSupermarketsFilterOpen);

  if (!isAllSupermarketsUploaded) {
    return (
      <div className="supermarkets-filters">
        {console.log("supermarketIDs: ", supermarketIDs)}

        <div
          className="open-supermarkets-filters-modal"
          onClick={toggleSupermarketsFilter}
        >
          <div className="supermarkets-filters-icon">
            <img src={filterIcon} alt="filter" />
          </div>
          <div className="supermarkets-filters-label">סינון סופרים</div>
        </div>
        <ModalV1
          isOpen={isSupermarketsFilterOpen}
          onClose={toggleSupermarketsFilter}
        >
          <div>
            <h1>Loading Data...</h1>
          </div>
        </ModalV1>
      </div>
    );
  }

  return (
    <div className="supermarkets-filters">
      {console.log("allSupermarkets: ", allSupermarkets)}
      <div
        className="open-supermarkets-filters-modal"
        onClick={toggleSupermarketsFilter}
      >
        <div className="supermarkets-filters-icon">
          <img src={filterIcon} alt="filter" />
        </div>
        <div className="supermarkets-filters-label">סינון סופרים</div>
      </div>
      <ModalV1
        isOpen={isSupermarketsFilterOpen}
        onClose={toggleSupermarketsFilter}
      >
        {isAllSupermarketsUploaded && (
          <div className="supermarket-filter">
            {allSupermarkets.map((supermarket) => (
              <SupermarketItem
                supermarketObject={supermarket}
                key={supermarket.supermarketID}
              />
            ))}
          </div>
        )}
      </ModalV1>
    </div>
  );
};

export default SupermarketsFilter;
