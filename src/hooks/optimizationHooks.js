// ===============================
// optimizationHooks.js  – לפי שמות ההוקים בדיאגרמות
// ===============================
// מכיל **לוגיקה מקומית בלבד**; כל מה שמדבר עם ה‑API נשאר בקונטקסט.
// שמות‑alias ישנים עדיין מוחזרים כדי לא לשבור קוד קיים.
// ===============================

import { useMemo, useCallback } from "react";
import { useCartOptimizationCtx } from "../context/CartOptimizationContext";
import { useClassificationsCtx } from "../context/classificationsContext";

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
/* ─────────────────────── 2) useSettingsOperations ─────────────────────── */
export const useSettingsOperations = () => {
  const {
    /* setters גלובליים */
    setCanReplaceSettings,
    setCanRoundUpSettings,
    setProductsSettings,
    setSupermarketIDs,
  } = useCartOptimizationCtx();

  /* ─────────────  ⬤  FLAGS – “bySelect” / “all / none”  ⬤  ───────────── */
  const changeCanReplaceSettings = setCanReplaceSettings; // bulk flag
  const changeCanRoundUpSettings = setCanRoundUpSettings; // bulk flag

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

  /* ─────────────  ⬤  NEW: TOGGLE PER-PRODUCT  ⬤  ───────────── */
  const changeCanRoundUp = (barcode) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === barcode
          ? {
              ...p,
              productSettings: {
                ...p.productSettings,
                canRoundUp: !p.productSettings.canRoundUp,
              },
            }
          : p
      )
    );

  const changeCanReplace = (barcode) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === barcode
          ? {
              ...p,
              productSettings: {
                ...p.productSettings,
                canReplace: !p.productSettings.canReplace,
              },
            }
          : p
      )
    );

  /* ─────────────  ⬤  SUPERMARKETS, BRANDS, LIMITS  ⬤  ───────────── */
  const insertSupermarketID = (id) =>
    setSupermarketIDs((ids) => (ids.includes(id) ? ids : [...ids, id]));

  const removeSupermarketID = (id) =>
    setSupermarketIDs((ids) => ids.filter((x) => x !== id));

  /* Bulk: replace the entire selection with a list of IDs (deduped). */
  const setSupermarketIDsBulk = (idList) =>
    setSupermarketIDs(() => {
      const seen = new Set();
      const out = [];
      for (const id of idList || []) {
        if (id == null || seen.has(id)) continue;
        seen.add(id);
        out.push(id);
      }
      return out;
    });

  /* Bulk: add many IDs at once (idempotent). */
  const insertSupermarketIDs = (idList) =>
    setSupermarketIDs((ids) => {
      const seen = new Set(ids);
      const out = [...ids];
      for (const id of idList || []) {
        if (id != null && !seen.has(id)) {
          seen.add(id);
          out.push(id);
        }
      }
      return out;
    });

  /* Bulk: remove many IDs at once. */
  const removeSupermarketIDs = (idList) => {
    const drop = new Set(idList || []);
    setSupermarketIDs((ids) => ids.filter((x) => !drop.has(x)));
  };

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

  const changeMaxWeightGain = (barcode, val) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === barcode
          ? {
              ...p,
              productSettings: { ...p.productSettings, maxWeightGain: val },
            }
          : p
      )
    );

  const changeMaxWeightLoss = (barcode, val) =>
    setProductsSettings((arr) =>
      arr.map((p) =>
        p.barcode === barcode
          ? {
              ...p,
              productSettings: { ...p.productSettings, maxWeightLoss: val },
            }
          : p
      )
    );

  /* ─────────────  ⬤  CLASSIFICATION-TAG RULES  ⬤  ─────────────
     productSettings.classificationRules = { family, rows: { row: {green, red} } }
     none→green→red→none per tap; the rules ride the existing V2 payload. */
  const updateClassificationRules = (barcode, family, updater) =>
    setProductsSettings((arr) =>
      arr.map((p) => {
        if (p.barcode !== barcode) return p;
        const prev = p.productSettings.classificationRules || {
          family,
          rows: {},
        };
        const rows = updater({ ...prev.rows });
        return {
          ...p,
          productSettings: {
            ...p.productSettings,
            classificationRules: { family, rows },
          },
        };
      })
    );

  const cycleClassificationTag = (barcode, family, rowName, tag) =>
    updateClassificationRules(barcode, family, (rows) => {
      const row = {
        green: [...((rows[rowName] || {}).green || [])],
        red: [...((rows[rowName] || {}).red || [])],
      };
      if (row.green.includes(tag)) {
        row.green = row.green.filter((t) => t !== tag);
        row.red.push(tag); // green → red
      } else if (row.red.includes(tag)) {
        row.red = row.red.filter((t) => t !== tag); // red → none
      } else {
        row.green.push(tag); // none → green
      }
      rows[rowName] = row;
      return rows;
    });

  const resetClassificationRow = (barcode, family, rowName) =>
    updateClassificationRules(barcode, family, (rows) => {
      delete rows[rowName];
      return rows;
    });

  const classificationBlankToRed = (barcode, family, rowName, allTags) =>
    updateClassificationRules(barcode, family, (rows) => {
      const row = {
        green: [...((rows[rowName] || {}).green || [])],
        red: [...((rows[rowName] || {}).red || [])],
      };
      const colored = new Set([...row.green, ...row.red]);
      (allTags || []).forEach((t) => {
        if (!colored.has(t)) row.red.push(t);
      });
      rows[rowName] = row;
      return rows;
    });

  const setClassificationRangeGreen = (barcode, family, rowName, tags) =>
    updateClassificationRules(barcode, family, (rows) => {
      const row = {
        green: [...((rows[rowName] || {}).green || [])],
        red: [...((rows[rowName] || {}).red || [])],
      };
      (tags || []).forEach((t) => {
        if (!row.green.includes(t)) row.green.push(t);
        row.red = row.red.filter((x) => x !== t);
      });
      rows[rowName] = row;
      return rows;
    });

  /* The range slider owns the green set of a numeric row: green becomes
     EXACTLY the selected values (reds inside the range are cleared, reds
     outside survive). Full span = no whitelist at all — green stays empty so
     family products missing this row keep passing, like all-white. */
  const setClassificationRowGreenExact = (barcode, family, rowName, tags, allTags) =>
    updateClassificationRules(barcode, family, (rows) => {
      const selected = [...(tags || [])];
      const isFullSpan =
        Array.isArray(allTags) && selected.length >= allTags.length;
      const green = isFullSpan ? [] : selected;
      const red = ((rows[rowName] || {}).red || []).filter(
        (t) => !selected.includes(t)
      );
      if (!green.length && !red.length) delete rows[rowName];
      else rows[rowName] = { green, red };
      return rows;
    });

  const clearClassificationRules = (barcode, family) =>
    updateClassificationRules(barcode, family, () => ({}));

  /* ─────────────  ⬤  RETURN API  ⬤  ───────────── */
  return {
    /* per-product toggles – מה שהרכיב צריך */
    changeCanRoundUp,
    changeCanReplace,

    /* bulk flags & helpers */
    changeCanReplaceSettings,
    changeCanRoundUpSettings,
    changeCanReplaceAll,
    changeCanRoundUpAll,

    insertSupermarketID,
    removeSupermarketID,
    insertSupermarketIDs,
    removeSupermarketIDs,
    setSupermarketIDsBulk,
    insertBrandToBlackList,
    removeBrandFromBlackList,
    changeMaxWeightGain,
    changeMaxWeightLoss,

    /* classification-tag rules */
    cycleClassificationTag,
    resetClassificationRow,
    classificationBlankToRed,
    setClassificationRangeGreen,
    setClassificationRowGreenExact,
    clearClassificationRules,
  };
};

/* ───────────── useProductClassifications — the tag rows of one product ──
   Returns the product's classification family (rows + all tag values) and
   its own tags, or nulls when the product carries no classifications. */
export const useProductClassifications = (barcode) => {
  const { byBarcode, byFamily, isLoaded } = useClassificationsCtx();
  const info = byBarcode[String(barcode)];
  return {
    isLoaded,
    family: info ? info.family : null,
    familyDef: info ? byFamily[info.family] || null : null,
    tags: info ? info.tags : null,
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
