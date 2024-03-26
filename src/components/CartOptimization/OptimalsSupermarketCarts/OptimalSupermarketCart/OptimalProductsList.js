import React from "react";

import OptimalProductItem from "./OptimalProductItem";
import OptimalReplaceProductItem from "./OptimalReplaceProductItem";
import "./OptimalProductsList.css";

const OptimalProductsList = ({ optimalCart, originalCart }) => {
  const hasReplacedProducts = (product) => {
    return product.barcode !== product.oldBarcode;
  };

  let optimalCartProducts = {};
  let originalCartProducts = {};

  optimalCart.existsProducts.forEach((product) => {
    optimalCartProducts[product.oldBarcode] = {
      detailsOptimalProduct: product,
      isExistsInOptimalCart: true,
    };
  });
  optimalCart.nonExistsProducts.forEach((product) => {
    optimalCartProducts[product.oldBarcode] = {
      detailsOptimalProduct: product,
      isExistsnOpItimalCart: false,
    };
  });

  originalCart.productsWithPrices.forEach((product) => {
    originalCartProducts[product.product.barcode] = {
      detailsOriginProduct: product,
    };
  });

  return (
    <div className="optimal-products-list">
      {Object.keys(optimalCartProducts).map((key) => {
        if (
          optimalCartProducts[key].isExistsInOptimalCart &&
          hasReplacedProducts(optimalCartProducts[key].detailsOptimalProduct)
        ) {
          const barcodeOldProduct =
            optimalCartProducts[key].detailsOptimalProduct.oldBarcode;
          return (
            <OptimalReplaceProductItem
              key={key}
              detailsOriginProduct={
                originalCartProducts[barcodeOldProduct].detailsOriginProduct
              }
              DetailsOptimalProduct={
                optimalCartProducts[key].detailsOptimalProduct
              }
              isExistsInOptimalCart={
                optimalCartProducts[key].isExistsInOptimalCart
              }
              supermarketID={optimalCart.supermarketID}
            />
          );
        } else {
          return (
            <OptimalProductItem
              key={key}
              detailsOriginProduct={
                originalCartProducts[key].detailsOriginProduct
              }
              DetailsOptimalProduct={
                optimalCartProducts[key].detailsOptimalProduct
              }
              isExistsInOptimalCart={
                optimalCartProducts[key].isExistsInOptimalCart
              }
              supermarketID={optimalCart.supermarketID}
            />
          );
        }
      })}
    </div>
  );
};

export default OptimalProductsList;
