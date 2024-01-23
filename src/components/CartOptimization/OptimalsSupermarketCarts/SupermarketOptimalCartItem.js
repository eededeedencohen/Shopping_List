import React from "react";
import "./SupermarketOptimalCartItem.css";
import SupermarketImage from "../../Images/SupermarketImage";
import { useProducts } from "../../../context/ProductContext";

const SupermarketOptimalCartItem = ({
  optimalCart,
  supermarketDetails,
  originalCart,
}) => {
  // const originalCartRelativeTotalPrice = getRelativeTotalPrice(
  //   originalCart,
  //   optimalCart.existsProducts.map((product) => product.oldBarcode)
  // );
  const { getProductDetailsByBarcode } = useProducts();
  let nonExistsProductsNames = [];
  // foreach product in existsProducts, get the product details and insert to productsDetails:
  optimalCart.nonExistsProducts.forEach((product) => {
    nonExistsProductsNames.push(
      getProductDetailsByBarcode(product.barcode).name
    );
  });

  return (
    <div className="supermarket-optimal-cart-item">
      {console.log("optimalCart: ", optimalCart)}
      <div className="optimal-cart-details">
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
            {nonExistsProductsNames.map((productName, index) => {
              return (
                <div className="non-exists-product" key={index}>
                  ,{productName}{" "}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SupermarketOptimalCartItem;
