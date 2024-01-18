import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getOptimalSupermarketCarts,
  getFullActiveCart,
  getAllBrands,
  getAllSupermarkets,
} from "../network/cart-optimizationService";

export const CartOptimizationContext = createContext();

export const CartOptimizationContextProvider = ({ children }) => {
  const [canReplaceSettings, setCanReplaceSettings] = useState("bySelect"); // bySelect, all, none
  const [canRoundUpSettings, setCanRoundUpSettings] = useState("bySelect"); // bySelect, all, none

  const changeCanReplaceSettings = (newCanReplaceSettings) => {
    setCanReplaceSettings(newCanReplaceSettings);
  };

  const changeCanRoundUpSettings = (newCanRoundUpSettings) => {
    setCanRoundUpSettings(newCanRoundUpSettings);
  };

  const [supermarketIDs, setSupermarketIDs] = useState(
    [...Array(3).keys()].map((num) => num + 1)
  );

  const [productsSettings, setProductsSettings] = useState([]);
  const [isProductsSettingsUploaded, setIsProductsSettingsUploaded] =
    useState(false);

  const getOptimalsCarts = async () => {
    try {
      const response = await getOptimalSupermarketCarts(
        supermarketIDs,
        productsSettings
      );
      if (response && response.data && response.data.optimalCarts) {
        return response.data.optimalCarts;
      }
    } catch (error) {
      console.error("Error in fetching data: ", error);
    }
  };

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
            blackListBrands: [
              ...product.productSettings.blackListBrands,
              brand,
            ],
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
  // wrapp with callback:
  // const changeCanReplaceAll = useCallback(
  //   (canReplace) => {
  //     const newProductsSettings = productsSettings.map((product) => ({
  //       ...product,
  //       productSettings: { ...product.productSettings, canReplace },
  //     }));
  //     setProductsSettings(newProductsSettings);
  //   },
  //   [productsSettings]
  // );

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

  const changeCanRoundUpAll = (canRoundUp) => {
    const newProductsSettings = productsSettings.map((product) => ({
      ...product,
      productSettings: { ...product.productSettings, canRoundUp },
    }));
    setProductsSettings(newProductsSettings);
  };
  // wrapp with callback:
  // const changeCanRoundUpAll = useCallback(
  //   (canRoundUp) => {
  //     const newProductsSettings = productsSettings.map((product) => ({
  //       ...product,
  //       productSettings: { ...product.productSettings, canRoundUp },
  //     }));
  //     setProductsSettings(newProductsSettings);
  //   },
  //   [productsSettings]
  // );


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

  return (
    <CartOptimizationContext.Provider
      value={{
        supermarketIDs,
        setSupermarketIDs,
        productsSettings,
        isProductsSettingsUploaded,
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

        // Oprtimal Carts:
        getOptimalsCarts,

        // main page of settings:
        canReplaceSettings,
        canRoundUpSettings,
        changeCanReplaceSettings,
        changeCanRoundUpSettings,
        changeCanReplaceAll,
        changeCanRoundUpAll,
      }}
    >
      {children}
    </CartOptimizationContext.Provider>
  );
};

export const useCartOptimizationContext = () =>
  useContext(CartOptimizationContext);
