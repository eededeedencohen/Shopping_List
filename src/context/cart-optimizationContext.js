import React, { createContext, useState, useContext, useEffect } from "react";
import {
  getOptimalSupermarketCarts,
  getFullActiveCart,
  getAllBrands,
  getAllSupermarkets,
  getPriceObjectByProductBarcodeAndSupermarketID,
  getListReplecementProductsByGeneralNameAndSupermarketID,
} from "../network/cart-optimizationService";

import { getByBarcode } from "../network/productService";

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

  const [supermarketIDs, setSupermarketIDs] = useState([]);

  const [productsSettings, setProductsSettings] = useState([]);
  const [isProductsSettingsUploaded, setIsProductsSettingsUploaded] =
    useState(false);

  const [isOptimalCartsUploaded, setIsOptimalCartsUploaded] = useState(false);
  const getOptimalsCarts = async () => {
    try {
      const response = await getOptimalSupermarketCarts(
        supermarketIDs,
        productsSettings
      );
      if (response && response.data && response.data.optimalCarts) {
        setIsOptimalCartsUploaded(true);
        return response.data.optimalCarts;
      }
    } catch (error) {
      console.error("Error in fetching data: ", error);
      setIsOptimalCartsUploaded(false);
    }
  };

  //-----------------------------------------------------------------------------
  const [optimalCarts, setOptimalCarts] = useState([]);
  const [isOptimalCartsCalculated, setIsOptimalCartsCalculated] =
    useState(false);
  /**
   * @summary - Update the useStates of the optimal carts
   */
  const calculateOptimalsCarts = async () => {
    setOptimalCarts([]); // Clear the optimal carts
    // step 1: using getOptimalSupermarketCarts to get the optimal carts. ofcourse using try and catch:
    try {
      const response = await getOptimalSupermarketCarts(
        supermarketIDs,
        productsSettings
      );
      if (response && response.data && response.data.optimalCarts) {
        const listOfOptimalCarts = response.data.optimalCarts;
        listOfOptimalCarts.forEach((cart) => {
          cart.deletedProducts = [];
        });
        setOptimalCarts(listOfOptimalCarts);
        setIsOptimalCartsCalculated(true);
      }
    } catch (error) {
      console.error("Error in fetching data: ", error);
      setIsOptimalCartsCalculated(false);
    }
  };

  // useEffect to fetch full active cart and then set product settings
  const [fullCart, setFullCart] = useState([]);
  useEffect(() => {
    const fetchFullActiveCart = async () => {
      try {
        const response = await getFullActiveCart("1"); // Assuming "1" is a placeholder
        if (response && response.data && response.data.productsWithPrices) {
          setFullCart(response.data);
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
        if (response && response.data && response.data.supermarkets) {
          // remove duplicates by the supermarketID field:
          const supermarketsNoDuplicated = response.data.supermarkets.reduce(
            (acc, current) => {
              const x = acc.find(
                (item) => item.supermarketID === current.supermarketID
              );
              if (!x) {
                return acc.concat([current]);
              } else {
                return acc;
              }
            },
            []
          );
          setAllSupermarkets(supermarketsNoDuplicated);
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

  /**
   * ===============================================
   * Supermarkets management methods:
   * ===============================================
   */
  const insertSupermarketID = (supermarketID) => {
    if (!supermarketIDs.includes(supermarketID)) {
      setSupermarketIDs([...supermarketIDs, supermarketID]);
    }
  };

  const removeSupermarketID = (supermarketID) => {
    if (supermarketIDs.includes(supermarketID)) {
      setSupermarketIDs(supermarketIDs.filter((id) => id !== supermarketID));
    }
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

  const changeCanRoundUpAll = (canRoundUp) => {
    const newProductsSettings = productsSettings.map((product) => ({
      ...product,
      productSettings: { ...product.productSettings, canRoundUp },
    }));
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

  /**
   * get the price of the product in the specific supermarket
   */
  const getPriceByProductBarcodeAndSupermarketID = async (
    barcode,
    supermarketID
  ) => {
    try {
      const response = await getPriceObjectByProductBarcodeAndSupermarketID(
        barcode,
        supermarketID
      );
      if (response && response.data && response.data.price) {
        return response.data.price;
      }
    } catch (error) {
      console.error(
        "Error in fetching price by product barcode and supermarket ID: ",
        error
      );
    }
  };

  /**
   * get the list of recommended products by general name and supermarket ID
   */
  const getReplacementProductsByGeneralNameAndSupermarketID = async (
    generalName,
    supermarketID
  ) => {
    try {
      const response =
        await getListReplecementProductsByGeneralNameAndSupermarketID(
          generalName,
          supermarketID
        );
      if (response && response.data && response.data.products) {
        return response.data.products;
      }
    } catch (error) {
      console.error(
        "Error in fetching list of recommended products by general name and supermarket ID: ",
        error
      );
    }
  };

  /**
   * Get the product by barcode
   */
  const getProductByBarcode = async (barcode) => {
    try {
      const response = await getByBarcode(barcode);
      const products = JSON.parse(response.data).data.products;
      if (products && products.length > 0) {
        const product = products[0];
        return product;
      }
    } catch (error) {
      console.error("Error in fetching product by barcode: ", error);
    }
  };

  /**
   * change the optimal product quantity and the total price. also update the optimal cart Total price
   */
  const changeOptimalProductQuantity = (
    barcode,
    supermarketID,
    newQuantity,
    newTotalPrice
  ) => {
    const optimalCartIndex = optimalCarts.findIndex(
      (cart) => cart.supermarketID === supermarketID
    );
    const optimalCart = optimalCarts[optimalCartIndex];
    const newOptimalCart = { ...optimalCart };
    newOptimalCart.existsProducts = newOptimalCart.existsProducts.map(
      (product) => {
        if (product.oldBarcode === barcode) {
          return {
            ...product,
            quantity: newQuantity,
            totalPrice: newTotalPrice,
          };
        }
        return product;
      }
    );
    newOptimalCart.totalPrice = newOptimalCart.existsProducts.reduce(
      (acc, product) => acc + product.totalPrice,
      0
    );
    const newOptimalCarts = [...optimalCarts];
    newOptimalCarts[optimalCartIndex] = newOptimalCart;
    setOptimalCarts(newOptimalCarts);
  };

  /**=========================
   *  OPPERATIONS ON THE CART:
   ===========================*/

  // Update amount of the product in the optimal cart:

  // // Delete the product form the optimal cart:
  // const deleteProductFromOptimalCart = (barcode, supermarketID) => {

  //   console.log("optimalCartsTest: ", optimalCarts);

  //   // step 1:
  //   const optimalCartIndex = optimalCarts.findIndex(
  //     (cart) => cart.supermarketID === supermarketID
  //   );
  //   const optimalCart = optimalCarts[optimalCartIndex];

  //   // step 2:
  //   const newOptimalCart = { ...optimalCart };
  //   newOptimalCart.deletedProducts = [
  //     ...newOptimalCart.deletedProducts,
  //     barcode,
  //   ];

  //   // step 3:
  //   newOptimalCart.existsProducts = newOptimalCart.existsProducts.filter(
  //     (product) => product.oldBarcode !== barcode
  //   );
  //   newOptimalCart.nonExistsProducts = newOptimalCart.nonExistsProducts.filter(
  //     (product) => product.oldBarcode !== barcode
  //   );

  //   // step 4:
  //   const newOptimalCarts = [...optimalCarts];

  //   newOptimalCarts[optimalCartIndex] = newOptimalCart;

  //   setOptimalCarts(newOptimalCarts);

  //   console.log("optimalCartsTest: ", optimalCarts);
  // };
  const deleteProductFromOptimalCart = (barcode, supermarketID) => {
    // Step 1: Find the optimal cart
    const cartIndex = optimalCarts.findIndex(
      (cart) => cart.supermarketID === supermarketID
    );
    if (cartIndex === -1) return; // If no cart found, exit early

    // Step 2: Deep clone the optimalCarts to ensure we're not mutating the state directly
    const newOptimalCarts = [...optimalCarts].map((cart) => ({
      ...cart,
      existsProducts: [...cart.existsProducts],
      nonExistsProducts: [...cart.nonExistsProducts],
      deletedProducts: [...cart.deletedProducts],
    }));

    // Step 3: Update the deletedProducts list and filter out the deleted product from existsProducts and nonExistsProducts
    const cartToUpdate = newOptimalCarts[cartIndex];
    cartToUpdate.deletedProducts = [...cartToUpdate.deletedProducts, barcode];
    cartToUpdate.existsProducts = cartToUpdate.existsProducts.filter(
      (product) => product.oldBarcode !== barcode
    );
    cartToUpdate.nonExistsProducts = cartToUpdate.nonExistsProducts.filter(
      (product) => product.oldBarcode !== barcode
    );

    // step 4: Update the optimal cart total price:
    cartToUpdate.totalPrice = cartToUpdate.existsProducts.reduce(
      (acc, product) => acc + product.totalPrice,
      0
    );

    // Step 5: Update the state with the new array to trigger a re-render
    setOptimalCarts(newOptimalCarts);
  };

  // const replaceProductInOptimalCart = (
  //   supermarketID, // The supermarket ID
  //   oldOptimalProductBarcode, // the old product barcode that we want to replace
  //   newProductBarcode, // The new product barcode that we want to replace with
  //   productQuantity, // The quantity of the product
  //   totalPriceOldOptimalProduct, // The total price of the old product
  //   newTotalPrice, // The total price of the new product
  //   isExistsInOptimalCart // A boolean that indicates if the product exists in the optimal cart
  // ) =>{
  //   // step 1: get the optimal cart index by the supermarket ID:
  //   const optimalCartIndex = optimalCarts.findIndex(
  //     (cart) => cart.supermarketID === supermarketID
  //   );

  //   // step 2: get the optimal cart by the index:
  //   const optimalCart = optimalCarts[optimalCartIndex];

  //   // step 3: create a new optimal cart:
  //   const newOptimalCart = { ...optimalCart };
  //   const barcode = newProductBarcode;
  //   const quantity = productQuantity;
  //   const totalPrice = newTotalPrice;
  //   const oldBarcode = oldOptimalProductBarcode;
  //   const oldQuantity = productQuantity;

  //   // step 4: create a new product:
  //   const newProduct = {
  //     barcode,
  //     quantity,
  //     totalPrice,
  //     oldBarcode,
  //     oldQuantity,
  //   };

  //   // step 5: update the existsProducts array:
  //   newOptimalCart.existsProducts = newOptimalCart.existsProducts.map(
  //     (product) => {
  //       if (product.oldBarcode === oldOptimalProductBarcode) {
  //         return newProduct;
  //       }
  //       return product;
  //     }
  //   );

  //   // step 6: update the total price of the optimal cart:
  //   newOptimalCart.totalPrice = newOptimalCart.existsProducts.reduce(
  //     (acc, product) => acc + product.totalPrice,
  //     0
  //   );

  //   // step 7: update the optimal carts array:
  //   const newOptimalCarts = [...optimalCarts];
  //   newOptimalCarts[optimalCartIndex] = newOptimalCart;
  //   setOptimalCarts(newOptimalCarts);

  // };
  //--------------------------------------------------------------------------------
  // const replaceProductInOptimalCart = (
  //   oldBarcode,
  //   newBarcode,
  //   price,
  //   quantity,
  //   oldTotalPrice,
  //   newTotalPrice,
  //   supermarketID,
  //   isExistsInOptimalCart
  // ) => {
  //   const optimalCartIndex = optimalCarts.findIndex(
  //     (cart) => cart.supermarketID === supermarketID
  //   );

  //   if (optimalCartIndex === -1) return;

  //   const optimalCart = optimalCarts[optimalCartIndex];
  //   const newOptimalCart = { ...optimalCart };

  //   const updatedExistsProducts = (optimalCart.existsProducts || []).map(
  //     (product) => {
  //       if (product.oldBarcode === oldBarcode) {
  //         return {
  //           ...product,
  //           barcode: newBarcode,
  //           price,
  //           quantity,
  //           totalPrice: newTotalPrice,
  //         };
  //       }
  //       return product;
  //     }
  //   );

  //   newOptimalCart.existsProducts = updatedExistsProducts;

  //   const newOptimalCarts = [...optimalCarts];
  //   newOptimalCarts[optimalCartIndex] = newOptimalCart;
  //   setOptimalCarts(newOptimalCarts);
  // };
  //================================================================================================
  const replaceProductInOptimalCart = (
    oldBarcode, // the barcode of the product that we want to replace
    newBarcode, // the barcode of the new product that we want to replace with
    oldTotalPrice, // the total price of the old product
    newTotalPrice, // the total price of the new product
    supermarketID // the supermarket ID
  ) => {
    const optimalCartIndex = optimalCarts.findIndex(
      (cart) => cart.supermarketID === supermarketID
    );

    if (optimalCartIndex === -1) return;

    const optimalCart = optimalCarts[optimalCartIndex];
    console.log("optimalCart: ", optimalCart);

    // calculate the new total price:
    const oldTotalPriceOfCart = optimalCart.totalPrice;
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");
    console.log("oldTotalPriceOfCart: ", oldTotalPriceOfCart);
    const newTotalPriceOfCart =
      oldTotalPriceOfCart - oldTotalPrice + newTotalPrice;
    console.log("newTotalPriceOfCart: ", newTotalPriceOfCart);
    console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++");

    //==================================
    // saving the new optimal cart:
    //==================================
    let newOptimalCart;
    // case the product exists in the optimal cart:
    if (oldTotalPrice !== 0) {
      newOptimalCart = {
        ...optimalCart,
        totalPrice: newTotalPriceOfCart,
        existsProducts: optimalCart.existsProducts.map((product) => {
          if (product.barcode === oldBarcode) {
            return {
              ...product,
              barcode: newBarcode,
              totalPrice: newTotalPrice,
            };
          }
          return product;
        }),
      };
    }
    // case the product does not exist in the optimal cart:
    else {
      // get thge quantity of the product and the old quantity:
      const product = productsSettings.find(
        (product) => product.barcode === oldBarcode
      );
      const quantity = product.quantity;
      const oldQuantity = product.quantity;


      // delete the product fron the nonExistsProducts array and add it to the existsProducts array:
      const newNonExistsProducts = optimalCart.nonExistsProducts.filter(
        (product) => product.oldBarcode !== oldBarcode
      );
      const productToAdd = {
        barcode: newBarcode,
        totalPrice: newTotalPrice,
        oldBarcode,
        quantity,
        oldQuantity,
      };
      const newExistsProducts = [...optimalCart.existsProducts, productToAdd];
      newOptimalCart = {
        ...optimalCart,
        totalPrice: newTotalPriceOfCart,
        existsProducts: newExistsProducts,
        nonExistsProducts: newNonExistsProducts,
        
      };
    }

    console.log("newOptimalCart: ", newOptimalCart);

    // create a new array with the updated cart:
    const newOptimalCarts = optimalCarts.map((cart, index) =>
      index === optimalCartIndex ? newOptimalCart : cart
    );

    // save it in the useState:
    setOptimalCarts(newOptimalCarts);
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
        insertSupermarketID,
        removeSupermarketID,

        // Oprtimal Carts:
        getOptimalsCarts,
        isOptimalCartsUploaded,
        fullCart,
        optimalCarts, // A new useState
        setOptimalCarts, // A new useState
        isOptimalCartsCalculated, // A new useState
        calculateOptimalsCarts, // A new Function

        // main page of settings:
        canReplaceSettings,
        canRoundUpSettings,
        changeCanReplaceSettings,
        changeCanRoundUpSettings,
        changeCanReplaceAll,
        changeCanRoundUpAll,

        // optimal cart operations:
        getPriceByProductBarcodeAndSupermarketID,
        getReplacementProductsByGeneralNameAndSupermarketID,
        getProductByBarcode,
        changeOptimalProductQuantity,
        deleteProductFromOptimalCart,
        replaceProductInOptimalCart,
      }}
    >
      {children}
    </CartOptimizationContext.Provider>
  );
};

export const useCartOptimizationContext = () =>
  useContext(CartOptimizationContext);
