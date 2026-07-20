// ===============================
// CartOptimizationContext.js  (lean – server‑side ops only)
// ===============================

import React, {
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
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
  /* set when a calculation fails — the results page shows a retry state
     instead of an eternal spinner */
  const [optimalCartsError, setOptimalCartsError] = useState(false);
  /* true only while a calculation is in flight — lets the results page tell
     "loading" apart from "never calculated" (refresh / direct URL) */
  const [isCalculatingOptimalCarts, setIsCalculatingOptimalCarts] =
    useState(false);

  /* the live cart from the app context (reactive — no stale-ref snapshot) */
  const { fullCart } = useFullCart();

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
  const calculateOptimalCarts = useCallback(async () => {
    /* Critical: reset the "calculated" flag before kicking off so the
       LoadingCart shows on EVERY calculation, not just the first one. */
    setIsOptimalCartsCalculated(false);
    setOptimalCartsError(false);
    setIsCalculatingOptimalCarts(true);
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
      } else {
        setOptimalCartsError(true);
      }
    } catch (err) {
      console.error("calculateOptimalCarts failed", err);
      setOptimalCartsError(true);
    } finally {
      setIsCalculatingOptimalCarts(false);
    }
  }, [supermarketIDs, productsSettings]);

  const fetchOptimalCartsOnce = useCallback(async () => {
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
  }, [supermarketIDs, productsSettings]);

  const getPriceByProductBarcodeAndSupermarketID = useCallback(
    (bc, id) =>
      getPriceObjectByProductBarcodeAndSupermarketID(bc, id).then(
        (r) => r.data?.price,
      ),
    [],
  );

  const getReplacementProductsByGeneralNameAndSupermarketID = useCallback(
    (gn, id) =>
      getListReplecementProductsByGeneralNameAndSupermarketID(gn, id).then(
        (r) => r.data?.products ?? [],
      ),
    [],
  );

  const getProductByBarcode = useCallback(async (barcode) => {
    try {
      const res = await getByBarcode(barcode);
      const body = typeof res.data === "string" ? JSON.parse(res.data) : res.data;
      return body?.data?.products?.[0] ?? null;
    } catch (err) {
      console.error("getProductByBarcode failed", err);
      return null;
    }
  }, []);

  /* ───────────────────────── PROVIDER VALUE ─────────────────────────
     Memoized — per-row live controls (steppers, sheets) re-render on every
     context change, so an unstable value object would be felt jank. */
  const value = useMemo(
    () => ({
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
      optimalCartsError,
      isCalculatingOptimalCarts,

      /* — SERVER actions (green nodes) — */
      calculateOptimalCarts,
      fetchOptimalCartsOnce,
      getPriceByProductBarcodeAndSupermarketID,
      getReplacementProductsByGeneralNameAndSupermarketID,
      getProductByBarcode,

      fullCart,
    }),
    [
      canReplaceSettings,
      canRoundUpSettings,
      supermarketIDs,
      productsSettings,
      isProductsSettingsUploaded,
      allSupermarkets,
      isAllSupermarketsUploaded,
      allBrands,
      isAllBrandsUploaded,
      optimalCarts,
      isOptimalCartsCalculated,
      isOptimalCartsUploaded,
      optimalCartsError,
      isCalculatingOptimalCarts,
      calculateOptimalCarts,
      fetchOptimalCartsOnce,
      getPriceByProductBarcodeAndSupermarketID,
      getReplacementProductsByGeneralNameAndSupermarketID,
      getProductByBarcode,
      fullCart,
    ],
  );

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
