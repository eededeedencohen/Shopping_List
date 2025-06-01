import React from "react";
import { useState } from "react";
import "./SupermarketOptimalCartItem.css";
import SupermarketImage from "../../Images/SupermarketImage";
import { useProducts } from "../../../context/ProductContext";
import OptimalCartV2 from "./OptimalSupermarketCart/OptimalCartV2";

const SupermarketOptimalCartItem = ({
  optimalCart,
  supermarketDetails,
  originalCart,
  onSelectedSupermarket, // Ensure this prop is used correctly.
}) => {
  const [isShowFullOptimalCart, setIsShowFullOptimalCart] = useState(false);
  const { getProductDetailsByBarcode } = useProducts();
  let nonExistsProductsNames = [];

  optimalCart.nonExistsProducts.forEach((product) => {
    nonExistsProductsNames.push(
      getProductDetailsByBarcode(product.barcode).name
    );
  });

  const handleNavigateToOptimalCart = () => {
    setIsShowFullOptimalCart(true);
    onSelectedSupermarket(optimalCart.supermarketID); // Ensure this function is called correctly.
  };

  if (isShowFullOptimalCart) {
    return (
      <OptimalCartV2
        optimalCart={optimalCart}
        supermarketDetails={supermarketDetails}
        originalCart={originalCart}
        onClickBack={() => {
          setIsShowFullOptimalCart(false);
          onSelectedSupermarket(0); // Ensure this function is called correctly.
          console.log("Back to supermarket selection");
        }}
      />
    );
  }

  return (
    <div
      className="supermarket-optimal-cart-item"
      onClick={handleNavigateToOptimalCart}
    >
      <div className="optimal-cart-details">
        {console.log("originalCart: ", originalCart)}
        <div className="supermarket-details">
          <div className="supermarket-name">
            <SupermarketImage supermarketName={supermarketDetails.name} />
          </div>
          <div className="supermarket-address">
            ,{supermarketDetails.address}
          </div>
          <div className="supermarket-city">{supermarketDetails.city}</div>
        </div>
        <div className="total-price-details">
          <div className="total-price-text">:מחיר כולל</div>
          <div className="total-price-number">
            ₪{optimalCart.totalPrice.toFixed(2)}
          </div>
        </div>
      </div>
      {optimalCart.nonExistsProducts.length > 0 && (
        <div className="non-exists-products">
          <div className="non-exists-products-text">:מוצרים חסרים</div>
          <div className="non-exists-products-names">
            {nonExistsProductsNames.map((productName, index) => (
              <div className="non-exists-product" key={index}>
                ,{productName}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupermarketOptimalCartItem;
