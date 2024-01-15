import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getOptimalSupermarketCarts,
  getFullActiveCart,
} from "../network/cart-optimizationService";

export const CartOptimizationContext = createContext();

export const CartOptimizationContextProvider = ({ children }) => {
  const [isDataUploaded, setIsDataUploaded] = useState(false);
  const [supermarketIDs, setSupermarketIDs] = useState(
    [...Array(3).keys()].map((num) => num + 1)
  );
  const [products, setProducts] = useState([
    {
      barcode: "7290100850916", // Doritos Spicy Sour 70g
      quantity: 2,
      generalName: "Doritos",
      weight: 70,
      productSettings: {
        maxWeightLoss: 0,
        maxWeightGain: 0,
        blackListBrands: [""],
        canRoundUp: true,
        canReplace: true,
      },
    },
  ]);
  const [optimalSupermarkets, setOptimalSupermarkets] = useState([]);

  const [productsSettings, setProductsSettings] = useState([]);
  const [isProductsSettingsUploaded, setIsProductsSettingsUploaded] =
    useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getOptimalSupermarketCarts(
          supermarketIDs,
          products
        );
        if (response && response.data && response.data.optimalCarts) {
          setOptimalSupermarkets(response.data.optimalCarts);
          setIsDataUploaded(true);
        }
      } catch (error) {
        console.error("Error in fetching data: ", error);
        setIsDataUploaded(false);
      }
    };

    fetchData();
  }, [supermarketIDs, products]);

  // useEffect to fetch full active cart and then set product settings
  useEffect(() => {
    const fetchFullActiveCart = async () => {
      try {
        const response = await getFullActiveCart("1"); // Assuming "1" is a placeholder
        if (response && response.data && response.data.productsWithPrices) {
          const newProductSettings = response.data.productsWithPrices.map(
            (product) => ({
              barcode: product.product.barcode,
              quantity: product.amount,
              generalName: product.product.generalName,
              weight: product.product.weight,
              productDetails: product.product,
              productSettings: {
                maxWeightLoss: 0,
                maxWeightGain: 0,
                blackListBrands: [""],
                canRoundUp: true,
                canReplace: true,
              },
            })
          );
          setProductsSettings(newProductSettings);
          setIsProductsSettingsUploaded(true);
        }
      } catch (error) {
        console.error("Error fetching full active cart:", error);
      }
    };
    fetchFullActiveCart();
  }, []); // Empty array ensures this runs once after initial render

  const changeCanReplaceAll = (canReplace) => {
    const newProductsSettings = productsSettings.map((product) => ({
      ...product,
      productSettings: { ...product.productSettings, canReplace },
    }));
    setProductsSettings(newProductsSettings);
  };

  return (
    <CartOptimizationContext.Provider
      value={{
        optimalSupermarkets,
        isDataUploaded,
        supermarketIDs,
        setSupermarketIDs,
        products,
        setProducts,
        productsSettings,
        isProductsSettingsUploaded,
        changeCanReplaceAll,
      }}
    >
      {children}
    </CartOptimizationContext.Provider>
  );
};

export const useCartOptimizationContext = () =>
  useContext(CartOptimizationContext);
