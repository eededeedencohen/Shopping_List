// ===============================
// optimizationHooks.js  – לפי שמות ההוקים בדיאגרמות
// ===============================
// מכיל **לוגיקה מקומית בלבד**; כל מה שמדבר עם ה‑API נשאר בקונטקסט.
// שמות‑alias ישנים עדיין מוחזרים כדי לא לשבור קוד קיים.
// ===============================

import { useMemo, useCallback } from "react";
import { useCartOptimizationCtx } from "../context/CartOptimizationContext";

/* ───────────────────────── 1) useSettings (STATE בלבד) ───────────────────────── */
export const useSettings = () => {
  const {
    productsSettings,
    isProductsSettingsUploaded,
    canReplaceSettings,
    canRoundUpSettings,
    supermarketIDs,
  } = useCartOptimizationCtx();

  const getBlackListBrands = useCallback(
    (barcode) =>
      productsSettings.find((p) => p.barcode === barcode)?.productSettings
        .blackListBrands ?? [],
    [productsSettings]
  );

  return {
    productsSettings,
    isProductsSettingsUploaded,
    canReplaceSettings,
    canRoundUpSettings,
    supermarketIDs,
    getBlackListBrands,
    /* alias */
    flags: { canReplaceSettings, canRoundUpSettings },
  };
};

/* ─────────────────────── 2) useSettingsOperations ─────────────────────── */
export const useSettingsOperations = () => {
  const {
    setCanReplaceSettings,
    setCanRoundUpSettings,
    setProductsSettings,
    setSupermarketIDs,
  } = useCartOptimizationCtx();

  /* flags (bulk) */
  const changeCanReplaceSettings = setCanReplaceSettings;
  const changeCanRoundUpSettings = setCanRoundUpSettings;

  const changeCanReplaceAll = (val) =>
    setProductsSettings((arr) =>
      arr.map((p) => ({
        ...p,
        productSettings: { ...p.productSettings, canReplace: val },
      }))
    );

  const changeCanRoundUpAll = (val) =>
    setProductsSettings((arr) =>
      arr.map((p) => ({
        ...p,
        productSettings: { ...p.productSettings, canRoundUp: val },
      }))
    );

  /* supermarkets list */
  const insertSupermarketID = (id) =>
    setSupermarketIDs((ids) => (ids.includes(id) ? ids : [...ids, id]));

  const removeSupermarketID = (id) =>
    setSupermarketIDs((ids) => ids.filter((x) => x !== id));

  /* black‑list brand ops */
  const insertBrandToBlackList = (code, brand) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === code && !p.productSettings.blackListBrands.includes(brand)
          ? {
              ...p,
              productSettings: {
                ...p.productSettings,
                blackListBrands: [...p.productSettings.blackListBrands, brand],
              },
            }
          : p
      )
    );

  const removeBrandFromBlackList = (code, brand) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === code
          ? {
              ...p,
              productSettings: {
                ...p.productSettings,
                blackListBrands: p.productSettings.blackListBrands.filter(
                  (b) => b !== brand
                ),
              },
            }
          : p
      )
    );
  /* ───────────── per‑product numeric limits ───────────── */
  const changeMaxWeightGain = (barcode, newMaxWeightGain) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === barcode
          ? {
              ...p,
              productSettings: {
                ...p.productSettings,
                maxWeightGain: newMaxWeightGain,
              },
            }
          : p
      )
    );

  const changeMaxWeightLoss = (barcode, newMaxWeightLoss) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === barcode
          ? {
              ...p,
              productSettings: {
                ...p.productSettings,
                maxWeightLoss: newMaxWeightLoss,
              },
            }
          : p
      )
    );

  /* ───────────── RETURN API ───────────── */
  return {
    changeCanReplaceSettings,
    changeCanRoundUpSettings,
    changeCanReplaceAll,
    changeCanRoundUpAll,

    insertSupermarketID,
    removeSupermarketID,

    insertBrandToBlackList,
    removeBrandFromBlackList,

    changeMaxWeightGain,
    changeMaxWeightLoss,
  };
};

/* ─────────────────────── 3) useSupermarkets (STATE) ─────────────────────── */
export const useSupermarkets = () => {
  const { allSupermarkets, isAllSupermarketsUploaded } =
    useCartOptimizationCtx();
  return { allSupermarkets, isAllSupermarketsUploaded };
};

/* ─────────────────────── 4) useBrands (STATE) ─────────────────────── */
export const useBrands = () => {
  const { allBrands, isAllBrandsUploaded } = useCartOptimizationCtx();
  return { allBrands, isAllBrandsUploaded };
};

/* ─────────────────────── 5) useCalculateOptimalCarts ─────────────────────── */
export const useCalculateOptimalCarts = () => {
  const { calculateOptimalCarts, fetchOptimalCartsOnce } =
    useCartOptimizationCtx();

  /* שמות שהופיעו בקוד הישן */
  const calculateOptimalsCarts = calculateOptimalCarts;
  const getOptimalsCarts = fetchOptimalCartsOnce;

  return { calculateOptimalCarts, calculateOptimalsCarts, getOptimalsCarts };
};

/* ─────────────────────── 6) useOptimalCarts (STATE) ─────────────────────── */
export const useOptimalCarts = () => {
  const { optimalCarts, isOptimalCartsCalculated, fullCart } =
    useCartOptimizationCtx();
  return { optimalCarts, isOptimalCartsCalculated, fullCart };
};

/* ─────────────────────── 7) useOptimalCartsOperation ─────────────────────── */
export const useOptimalCartsOperation = () => {
  const {
    /* state + setters */
    setOptimalCarts,
    productsSettings,

    /* פונקציות שימושיות קיימות */
    getPriceByProductBarcodeAndSupermarketID,
    getReplacementProductsByGeneralNameAndSupermarketID,
    getProductByBarcode,
  } = useCartOptimizationCtx();

  /* ───────────── שינוי כמות מוצר בעגלה ───────────── */
  const changeOptimalProductQuantity = (
    barcode,
    supermarketID,
    newQuantity,
    newTotalPrice
  ) => {
    setOptimalCarts((prev) => {
      const cartIdx = prev.findIndex((c) => c.supermarketID === supermarketID);
      if (cartIdx === -1) return prev;

      const cart = prev[cartIdx];
      const updatedExists = cart.existsProducts.map((p) =>
        p.oldBarcode === barcode
          ? { ...p, quantity: newQuantity, totalPrice: newTotalPrice }
          : p
      );

      const updatedCart = {
        ...cart,
        existsProducts: updatedExists,
        totalPrice: updatedExists.reduce((acc, p) => acc + p.totalPrice, 0),
      };

      const next = [...prev];
      next[cartIdx] = updatedCart;
      return next;
    });
  };

  /* ───────────── מחיקת מוצר מעגלה ───────────── */
  const deleteProductFromOptimalCart = (barcode, supermarketID) => {
    setOptimalCarts((prev) => {
      const cartIdx = prev.findIndex((c) => c.supermarketID === supermarketID);
      if (cartIdx === -1) return prev;

      const cart = prev[cartIdx];

      const updatedCart = {
        ...cart,
        deletedProducts: [...cart.deletedProducts, barcode],
        existsProducts: cart.existsProducts.filter(
          (p) => p.oldBarcode !== barcode
        ),
        nonExistsProducts: cart.nonExistsProducts.filter(
          (p) => p.oldBarcode !== barcode
        ),
      };

      updatedCart.totalPrice = updatedCart.existsProducts.reduce(
        (acc, p) => acc + p.totalPrice,
        0
      );

      const next = [...prev];
      next[cartIdx] = updatedCart;
      return next;
    });
  };

  /* ───────────── החלפת מוצר ───────────── */
  const replaceProductInOptimalCart = (
    oldBarcode,
    newBarcode,
    oldTotalPrice,
    newTotalPrice,
    supermarketID
  ) => {
    setOptimalCarts((prev) => {
      const cartIdx = prev.findIndex((c) => c.supermarketID === supermarketID);
      if (cartIdx === -1) return prev;

      const cart = prev[cartIdx];
      const newCartTotal = cart.totalPrice - oldTotalPrice + newTotalPrice;

      let updatedCart;

      if (oldTotalPrice !== 0) {
        /* המוצר כבר נמצא ב-existsProducts */
        const updatedExists = cart.existsProducts.map((p) =>
          p.barcode === oldBarcode
            ? { ...p, barcode: newBarcode, totalPrice: newTotalPrice }
            : p
        );
        updatedCart = {
          ...cart,
          existsProducts: updatedExists,
          totalPrice: newCartTotal,
        };
      } else {
        /* המוצר היה ב-nonExistsProducts */
        const prod = productsSettings.find((p) => p.barcode === oldBarcode);
        const qty = prod?.quantity ?? 1;

        const updatedNonExists = cart.nonExistsProducts.filter(
          (p) => p.oldBarcode !== oldBarcode
        );
        const updatedExists = [
          ...cart.existsProducts,
          {
            barcode: newBarcode,
            totalPrice: newTotalPrice,
            oldBarcode,
            quantity: qty,
            oldQuantity: qty,
          },
        ];
        updatedCart = {
          ...cart,
          existsProducts: updatedExists,
          nonExistsProducts: updatedNonExists,
          totalPrice: newCartTotal,
        };
      }

      const next = [...prev];
      next[cartIdx] = updatedCart;
      return next;
    });
  };

  /* ─────────────────────── exports ─────────────────────── */
  return {
    /* מידע ושירותי חוץ */
    getPriceByProductBarcodeAndSupermarketID,
    getReplacementProductsByGeneralNameAndSupermarketID,
    getProductByBarcode,

    /* פעולות עריכה */
    changeOptimalProductQuantity,
    deleteProductFromOptimalCart,
    replaceProductInOptimalCart,
  };
};

/* ─────────────────────── 8) useOptimalProductsOperation ─────────────────────── */
export const useOptimalProductsOperation = useOptimalCartsOperation;

/* ─────────────────────── 9) useOptimalCartsTotals ─────────────────────── */
export const useOptimalCartsTotals = () => {
  const { optimalCarts } = useCartOptimizationCtx();
  return useMemo(() => {
    const perCart = optimalCarts.map((c) => ({
      supermarketID: c.supermarketID,
      totalPrice: c.existsProducts.reduce((s, p) => s + p.totalPrice, 0),
    }));
    const grandTotal = perCart.reduce((s, c) => s + c.totalPrice, 0);
    return { perCart, grandTotal };
  }, [optimalCarts]);
};
