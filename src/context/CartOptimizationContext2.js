import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  getAllBrands,
  getAllSupermarkets,
  getOptimalSupermarketCarts,
  getPriceObjectByProductBarcodeAndSupermarketID,
  getListReplecementProductsByGeneralNameAndSupermarketID,
} from "../network/cart-optimizationService";
import { getByBarcode } from "../network/productService";
import { useFullCart } from "../hooks/appHooks";

const CartOptimizationContext2 = createContext(null);

export const CartOptimizationProvider2 = ({ children }) => {
  const [canReplaceSettings, setCanReplaceSettings] = useState("bySelect");
  const [canRoundUpSettings, setCanRoundUpSettings] = useState("bySelect");

  const [supermarketIDs, setSupermarketIDs] = useState([]);
  const insertSupermarketID = (id) => {
    if (!supermarketIDs.includes(id)) setSupermarketIDs((prev) => [...prev, id]);
  };
  const removeSupermarketID = (id) => {
    setSupermarketIDs((prev) => prev.filter((x) => x !== id));
  };

  const [productsSettings, setProductsSettings] = useState([]);
  const [isProductsSettingsUploaded, setIsProductsSettingsUploaded] = useState(false);

  const { fullCart } = useFullCart();
  const fullCartRef = useRef(null);

  useEffect(() => {
    if (!fullCart?.productsWithPrices) return;
    const newSettings = fullCart.productsWithPrices.map(({ product, amount }) => ({
      barcode: product.barcode,
      quantity: amount,
      generalName: product.generalName,
      weight: product.weight,
      productDetails: product,
      productSettings: {
        maxWeightLoss: 0,
        maxWeightGain: 0,
        blackListBrands: [],
        canRoundUp: true,
        canReplace: true,
      },
    }));
    setProductsSettings(newSettings);
    setIsProductsSettingsUploaded(true);
  }, [fullCart]);

  const [allSupermarkets, setAllSupermarkets] = useState([]);
  const [isAllSupermarketsUploaded, setIsAllSupermarketsUploaded] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllSupermarkets();
        const uniques = res.data.supermarkets.filter(
          (s, i, arr) => arr.findIndex((x) => x.supermarketID === s.supermarketID) === i
        );
        setAllSupermarkets(uniques);
        setIsAllSupermarketsUploaded(true);
      } catch (e) {
        console.error("Failed to fetch supermarkets", e);
      }
    })();
  }, []);

  const [allBrands, setAllBrands] = useState([]);
  const [isAllBrandsUploaded, setIsAllBrandsUploaded] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const res = await getAllBrands();
        setAllBrands(res.data.brands);
        setIsAllBrandsUploaded(true);
      } catch (e) {
        console.error("Failed to fetch brands", e);
      }
    })();
  }, []);

  const [optimalCarts, setOptimalCarts] = useState([]);
  const [isOptimalCartsCalculated, setIsOptimalCartsCalculated] = useState(false);
  const calculateOptimalsCarts = async () => {
    try {
      const res = await getOptimalSupermarketCarts(supermarketIDs, productsSettings);
      const carts = res.data.optimalCarts.map((c) => ({ ...c, deletedProducts: [] }));
      setOptimalCarts(carts);
      setIsOptimalCartsCalculated(true);
    } catch (e) {
      console.error("Failed to calculate optimal carts", e);
    }
  };

  const getPriceByProductBarcodeAndSupermarketID = async (barcode, supermarketID) => {
    try {
      const res = await getPriceObjectByProductBarcodeAndSupermarketID(barcode, supermarketID);
      return res.data.price;
    } catch (e) {
      console.error("Failed to get price", e);
    }
  };

  const getReplacementProductsByGeneralNameAndSupermarketID = async (generalName, supermarketID) => {
    try {
      const res = await getListReplecementProductsByGeneralNameAndSupermarketID(generalName, supermarketID);
      return res.data.products;
    } catch (e) {
      console.error("Failed to get replacements", e);
    }
  };

  const getProductByBarcode = async (barcode) => {
    try {
      const res = await getByBarcode(barcode);
      return JSON.parse(res.data)?.data?.products?.[0] ?? null;
    } catch (e) {
      console.error("Failed to fetch product by barcode", e);
    }
  };

  return (
    <CartOptimizationContext2.Provider
      value={{
        canReplaceSettings,
        setCanReplaceSettings,
        canRoundUpSettings,
        setCanRoundUpSettings,
        supermarketIDs,
        setSupermarketIDs,
        insertSupermarketID,
        removeSupermarketID,
        productsSettings,
        setProductsSettings,
        isProductsSettingsUploaded,
        allSupermarkets,
        isAllSupermarketsUploaded,
        allBrands,
        isAllBrandsUploaded,
        optimalCarts,
        setOptimalCarts,
        isOptimalCartsCalculated,
        calculateOptimalsCarts,
        getPriceByProductBarcodeAndSupermarketID,
        getReplacementProductsByGeneralNameAndSupermarketID,
        getProductByBarcode,
      }}
    >
      {children}
    </CartOptimizationContext2.Provider>
  );
};

export const useCartOptimization = () => {
  const ctx = useContext(CartOptimizationContext2);
  if (!ctx) throw new Error("CartOptimizationContext was not provided correctly");
  return ctx;
};