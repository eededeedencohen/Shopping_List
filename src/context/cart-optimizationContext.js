import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getOptimalSupermarketCarts,
  getFullActiveCart,
  getAllBrands,
  getAllSupermarkets,
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
                maxWeightLoss: 0, //product.product.weight,
                maxWeightGain: 0, //product.product.weight,
                blackListBrands: [],
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

  // all supermarkets - will be uploaded with useEffect:  without dependency - will be uploaded once
  const [allSupermarkets, setAllSupermarkets] = useState([]);
  const [isAllSupermarketsUploaded, setIsAllSupermarketsUploaded] =
    useState(false);

  useEffect(() => {
    const fetchAllSupermarkets = async () => {
      try {
        const response = await getAllSupermarkets();
        if (response && response.data && response.data.allSupermarkets) {
          setAllSupermarkets(response.data.allSupermarkets);
          setIsAllSupermarketsUploaded(true);
        }
      } catch (error) {
        console.error("Error in fetching all supermarkets: ", error);
        setIsAllSupermarketsUploaded(false);
      }
    };
    fetchAllSupermarkets();
  }, []);

  /**
   * ===============================================
   * Brands black list management methods:
   * ===============================================
   */
  const [allBrands, setAllBrands] = useState([]);
  const [isAllBrandsUploaded, setIsAllBrandsUploaded] = useState(false);
  useEffect(() => {
    const fetchAllBrands = async () => {
      try {
        const response = await getAllBrands();
        if (response) {
          setAllBrands(response.data.brands);
          setIsAllBrandsUploaded(true);
        }
      } catch (error) {
        console.error("Error in fetching all brands: ", error);
        setIsAllBrandsUploaded(false);
      }
    };
    fetchAllBrands();
  }, []);

  const getBlackListBrands = (barcode) => {
    const product = productsSettings.find(
      (product) => product.barcode === barcode
    );
    return product.productSettings.blackListBrands;
  };

  const insertBrandToBlackList = (barcode, brand) => {
    const newProductsSettings = productsSettings.map((product) => {
      if (product.barcode === barcode) {
        return {
          ...product,
          productSettings: {
            ...product.productSettings,
            blackListBrands: [...product.productSettings.blackListBrands, brand],
          },
        };
      }
      return product;
    });
    setProductsSettings(newProductsSettings);
  };

  const removeBrandFromBlackList = (barcode, brand) => {
    const newProductsSettings = productsSettings.map((product) => {
      if (product.barcode === barcode) {
        return {
          ...product,
          productSettings: {
            ...product.productSettings,
            blackListBrands: product.productSettings.blackListBrands.filter(
              (b) => b !== brand
            ),
          },
        };
      }
      return product;
    });
    setProductsSettings(newProductsSettings);
  };

  const changeCanReplace = (barcode) => {
    const newProductsSettings = productsSettings.map((product) => {
      if (product.barcode === barcode) {
        return {
          ...product,
          productSettings: {
            ...product.productSettings,
            canReplace: !product.productSettings.canReplace,
          },
        };
      }
      return product;
    });
    setProductsSettings(newProductsSettings);
  };

  const changeCanReplaceAll = (canReplace) => {
    const newProductsSettings = productsSettings.map((product) => ({
      ...product,
      productSettings: { ...product.productSettings, canReplace },
    }));
    setProductsSettings(newProductsSettings);
  };

  const changeCanRoundUp = (barcode) => {
    const newProductsSettings = productsSettings.map((product) => {
      if (product.barcode === barcode) {
        return {
          ...product,
          productSettings: {
            ...product.productSettings,
            canRoundUp: !product.productSettings.canRoundUp,
          },
        };
      }
      return product;
    });
    setProductsSettings(newProductsSettings);
  };

  const changeMaxWeightGain = (barcode, newMaxWeightGain) => {
    const newProductsSettings = productsSettings.map((product) => {
      if (product.barcode === barcode) {
        return {
          ...product,
          productSettings: {
            ...product.productSettings,
            maxWeightGain: newMaxWeightGain,
          },
        };
      }
      return product;
    });
    setProductsSettings(newProductsSettings);
  };

  const changeMaxWeightLoss = (barcode, newMaxWeightLoss) => {
    const newProductsSettings = productsSettings.map((product) => {
      if (product.barcode === barcode) {
        return {
          ...product,
          productSettings: {
            ...product.productSettings,
            maxWeightLoss: newMaxWeightLoss,
          },
        };
      }
      return product;
    });
    setProductsSettings(newProductsSettings);
  };

  const changeCanRoundUpAll = (canRoundUp) => {
    const newProductsSettings = productsSettings.map((product) => ({
      ...product,
      productSettings: { ...product.productSettings, canRoundUp },
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
        changeCanRoundUpAll,
        changeCanReplace,
        changeCanRoundUp,
        changeMaxWeightGain,
        changeMaxWeightLoss,

        // brands:
        allBrands,
        isAllBrandsUploaded,
        getBlackListBrands,
        insertBrandToBlackList,
        removeBrandFromBlackList,

        // supermarkets:
        allSupermarkets,
        isAllSupermarketsUploaded,
      }}
    >
      {children}
    </CartOptimizationContext.Provider>
  );
};

export const useCartOptimizationContext = () =>
  useContext(CartOptimizationContext);
