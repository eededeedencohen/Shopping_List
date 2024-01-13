// import React, {
//   createContext,
//   useState,
//   useContext,
//   useEffect,
//   useCallback,
// } from "react";
// import { getOptimalSupermarketCarts } from "../network/cart-optimizationService"; // Import the service function

// export const CartOptimizationContext = createContext();

// export const CartOptimizationContextProvider = ({ children }) => {
//   const [isDataUploaded, setIsDataUploaded] = useState(false);
//   const [supermarketIDs, setSupermarketIDs] = useState(
//     [...Array(3).keys()].map((num) => num + 1)
//   );
//   const [products, setProducts] = useState([
//     {
//       barcode: "7290100850916", // Doritos Spicy Sour 70g
//       quantity: 2,
//       generalName: "Doritos",
//       weight: 70,
//       productSettings: {
//         maxWeightLoss: 0,
//         maxWeightGain: 0,
//         blackListBrands: [""],
//         canRoundUp: true,
//         canReplace: true,
//       },
//     },
//   ]);
//   const [optimalSupermarkets, setOptimalSupermarkets] = useState([]);

//   useEffect(() => {
//     console.log("first useEffect");
//     const uploadData = async () => {
//       try {
//         const response = await getOptimalSupermarketCarts(
//           supermarketIDs,
//           products
//         );
//         if (response && response.data && response.data.optimalCarts) {
//           setOptimalSupermarkets(response.data.optimalCarts);
//           setIsDataUploaded(true);
//         }
//       } catch (error) {
//         console.error("Error in uploading data: ", error);
//       }
//     };
//     uploadData();
//   }, [supermarketIDs, products]);

//   //   const handleOptimize = useCallback(async () => {
//   //     try {
//   //       // Update state and wait for the next render to call the API
//   //     //   setSupermarketIDs([...Array(2).keys()].map((num) => num + 1));
//   //       setIsDataUploaded(false);
//   //     } catch (error) {
//   //       console.error("Error in uploading data: ", error);
//   //     }
//   //   }, []); // Only depend on setSupermarketIDs

//   useEffect(() => {
//     console.log("second useEffect");
//     const fetchData = async () => {
//       try {
//         const response = await getOptimalSupermarketCarts(
//           supermarketIDs,
//           products
//         );
//         if (response && response.optimalCarts) {
//           // Check response structure
//           setOptimalSupermarkets(response.optimalCarts);
//           setIsDataUploaded(true);
//         }
//       } catch (error) {
//         console.error("Error in fetching data: ", error);
//       }
//     };

//     if (!isDataUploaded) {
//       fetchData();
//     }
//   }, [isDataUploaded, supermarketIDs, products]);

//   return (
//     <CartOptimizationContext.Provider
//       value={{
//         optimalSupermarkets,
//         // handleOptimize,
//         isDataUploaded,
//         supermarketIDs,
//         setIsDataUploaded,
//         setSupermarketIDs,
//         setProducts,
//       }}
//     >
//       {children}
//     </CartOptimizationContext.Provider>
//   );
// };

// export const useCartOptimizationContext = () =>
//   useContext(CartOptimizationContext);

import React, { createContext, useState, useContext, useEffect } from "react";
import { getOptimalSupermarketCarts } from "../network/cart-optimizationService";

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

  useEffect(() => {
    console.log("first useEffect");
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

  return (
    <CartOptimizationContext.Provider
      value={{
        optimalSupermarkets,
        isDataUploaded,
        supermarketIDs,
        setSupermarketIDs,
        products,
        setProducts,
      }}
    >
      {children}
    </CartOptimizationContext.Provider>
  );
};

export const useCartOptimizationContext = () =>
  useContext(CartOptimizationContext);
