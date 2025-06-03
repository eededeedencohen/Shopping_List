// ===============================
// CartOptimizationContext.js  (lean – server‑side ops only)
// ===============================

import React, {
  createContext,
  useState,
  useEffect,
  useRef,
  useContext,
} from "react";
import {
  getOptimalSupermarketCarts,
  getAllBrands,
  getAllSupermarkets,
  getPriceObjectByProductBarcodeAndSupermarketID,
  getListReplecementProductsByGeneralNameAndSupermarketID,
} from "../network/cart-optimizationService";
import { getByBarcode } from "../network/productService";
import { useFullCart } from "../hooks/appHooks";

export const CartOptimizationContext = createContext(null);

export const CartOptimizationProvider = ({ children }) => {
  /* ───────────────────────── STATE ───────────────────────── */
  const [canReplaceSettings, setCanReplaceSettings] = useState("bySelect");
  const [canRoundUpSettings, setCanRoundUpSettings] = useState("bySelect");

  const [supermarketIDs, setSupermarketIDs] = useState([]);

  const [productsSettings, setProductsSettings] = useState([]);
  const [isProductsSettingsUploaded, setIsProductsSettingsUploaded] =
    useState(false);

  const [allSupermarkets, setAllSupermarkets] = useState([]);
  const [isAllSupermarketsUploaded, setIsAllSupermarketsUploaded] =
    useState(false);

  const [allBrands, setAllBrands] = useState([]);
  const [isAllBrandsUploaded, setIsAllBrandsUploaded] = useState(false);

  const [optimalCarts, setOptimalCarts] = useState([]);
  const [isOptimalCartsCalculated, setIsOptimalCartsCalculated] =
    useState(false);
  const [isOptimalCartsUploaded, setIsOptimalCartsUploaded] = useState(false);

  /* snapshot של fullCart מכלל הקונטקסטים */
  const { fullCart } = useFullCart();
  const fullCartRef = useRef(null);

  /* ──────────────── INIT: טבלאות כלליות ──────────────── */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getAllSupermarkets();
        setAllSupermarkets(
          [...new Map(data.supermarkets.map((s) => [s.supermarketID, s])).values()],
        );
        setIsAllSupermarketsUploaded(true);
      } catch (err) {
        console.error("getAllSupermarkets failed", err);
      }
    })();

    (async () => {
      try {
        const { data } = await getAllBrands();
        setAllBrands(data.brands);
        setIsAllBrandsUploaded(true);
      } catch (err) {
        console.error("getAllBrands failed", err);
      }
    })();
  }, []);

  /* ─────────────── fullCart → productsSettings ─────────────── */
  useEffect(() => {
    if (!fullCart?.productsWithPrices) return;

    fullCartRef.current = fullCart;
    setProductsSettings(
      fullCart.productsWithPrices.map(({ product, amount }) => ({
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
      }))
    );
    setIsProductsSettingsUploaded(true);
  }, [fullCart]);

  /* ─────────────────────── SERVER‑SIDE ACTIONS ─────────────────────── */
  const calculateOptimalCarts = async () => {
    setOptimalCarts([]);
    try {
      const { data } = await getOptimalSupermarketCarts(
        supermarketIDs,
        productsSettings,
      );
      if (data?.optimalCarts) {
        setOptimalCarts(
          data.optimalCarts.map((c) => ({ ...c, deletedProducts: [] })),
        );
        setIsOptimalCartsCalculated(true);
      }
    } catch (err) {
      console.error("calculateOptimalCarts failed", err);
      setIsOptimalCartsCalculated(false);
    }
  };

  const fetchOptimalCartsOnce = async () => {
    try {
      const { data } = await getOptimalSupermarketCarts(
        supermarketIDs,
        productsSettings,
      );
      if (data?.optimalCarts) {
        setIsOptimalCartsUploaded(true);
        return data.optimalCarts;
      }
    } catch (err) {
      console.error("getOptimalSupermarketCarts failed", err);
      setIsOptimalCartsUploaded(false);
    }
  };

  const getPriceByProductBarcodeAndSupermarketID = (bc, id) =>
    getPriceObjectByProductBarcodeAndSupermarketID(bc, id).then((r) => r.data?.price);

  const getReplacementProductsByGeneralNameAndSupermarketID = (gn, id) =>
    getListReplecementProductsByGeneralNameAndSupermarketID(gn, id).then(
      (r) => r.data?.products ?? [],
    );

  const getProductByBarcode = async (barcode) => {
    try {
      const res = await getByBarcode(barcode);
      return JSON.parse(res.data).data.products?.[0] ?? null;
    } catch (err) {
      console.error("getProductByBarcode failed", err);
      return null;
    }
  };

  /* ───────────────────────── PROVIDER VALUE ───────────────────────── */
  const value = {
    /* — STATE (blue nodes) — */
    canReplaceSettings,
    setCanReplaceSettings,
    canRoundUpSettings,
    setCanRoundUpSettings,

    supermarketIDs,
    setSupermarketIDs,

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
    isOptimalCartsUploaded,

    /* — SERVER actions (green nodes) — */
    calculateOptimalCarts,
    fetchOptimalCartsOnce,
    getPriceByProductBarcodeAndSupermarketID,
    getReplacementProductsByGeneralNameAndSupermarketID,
    getProductByBarcode,

    /* snapshot */
    fullCart: fullCartRef.current,
  };

  return (
    <CartOptimizationContext.Provider value={value}>
      {children}
    </CartOptimizationContext.Provider>
  );
};

export const useCartOptimizationCtx = () => {
  const ctx = useContext(CartOptimizationContext);
  if (!ctx) throw new Error("CartOptimizationContext missing");
  return ctx;
};
