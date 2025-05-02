// src/hooks/appHooks.js
// =============================================
// אוסף הוקים ברמת‑אפליקציה שמסתירים את ה‑Contexts
// (לא חובה לשמור את כולם בקובץ אחד; פוצל במידת הצורך)
// =============================================

import { useMemo, useCallback } from "react";
import { useCart } from "../context/CartContext2";
import { usePrices } from "../context/PriceContext2";
import { useProducts as useProductsCtx } from "../context/ProductContext2";
import { calculateTotalPrice } from "../utils/priceCalculations";

// -----------------------------------------------------------------------------
// 1) Cart – State בלבד
// -----------------------------------------------------------------------------
export const useCartState = () => {
  const { cart, isLoadingCartData } = useCart();
  return { cart, isLoading: isLoadingCartData };
};

// -----------------------------------------------------------------------------
// 2) Cart – פעולות (CRUD + החלפת סופר + סנכרון לשרת)
// -----------------------------------------------------------------------------
export const useCartActions = () => {
  const { cart, setCart, syncCartToServer, supermarketID } = useCart();
  const { isLoadingPrices } = usePrices();

  // הוספה / הגדלת כמות
  const add = useCallback(
    (barcode, amount = 1) => {
      if (!cart) return;
      const existing = cart.products.find((p) => p.barcode === barcode);
      const updated = existing
        ? cart.products.map((p) =>
            p.barcode === barcode ? { ...p, amount: p.amount + amount } : p
          )
        : [...cart.products, { barcode, amount }];
      setCart({ ...cart, products: updated });
    },
    [cart, setCart]
  );

  // עדכון כמות
  const update = useCallback(
    (barcode, newAmount) => {
      if (!cart) return;
      const updated = cart.products.map((p) =>
        p.barcode === barcode ? { ...p, amount: newAmount } : p
      );
      setCart({ ...cart, products: updated });
    },
    [cart, setCart]
  );

  // מחיקה
  const remove = useCallback(
    (barcode) => {
      if (!cart) return;
      const updated = cart.products.filter((p) => p.barcode !== barcode);
      setCart({ ...cart, products: updated });
    },
    [cart, setCart]
  );

  // החלפת סופרמרקט → cart + טעינת מחירים חדשה (PriceContext כבר מאזין ל-id)
  const replaceSupermarket = useCallback(
    (newSupermarketID) => {
      if (!cart || supermarketID === newSupermarketID) return;
      setCart({ ...cart, supermarketID: newSupermarketID });
    },
    [cart, setCart, supermarketID]
  );

  // סנכרון שרת
  const sync = useCallback(() => {
    syncCartToServer();
  }, [syncCartToServer]);

  return { add, update, remove, replaceSupermarket, sync, isLoadingPrices };
};

// -----------------------------------------------------------------------------
// 3) Price‑map (barcode -> priceData)
// -----------------------------------------------------------------------------
export const usePriceMap = () => {
  const { pricesBySupermarket, isLoadingPrices } = usePrices();

  const pricesMap = useMemo(() => {
    return Object.fromEntries(pricesBySupermarket.map((p) => [p.barcode, p]));
  }, [pricesBySupermarket]);

  return { pricesMap, isLoadingPrices };
};

// -----------------------------------------------------------------------------
// 4) Product list + search
// -----------------------------------------------------------------------------
export const useProductList = () => {
  const {
    products,
    loading,
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProductsCtx();

  return {
    products,
    isLoadingProducts: loading,
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  };
};

export const useProductSearch = () => {
  const { products } = useProductsCtx();
  return useCallback(
    (query) => {
      const q = query.toLowerCase();
      return products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.generalName?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q)
      );
    },
    [products]
  );
};

// -----------------------------------------------------------------------------
// 5) Enriched products (מוצרים + מחיר + כמות + totals) – יעיל עם Maps
// -----------------------------------------------------------------------------
export const useEnrichedProducts = () => {
  const { products, isLoadingProducts } = useProductList();
  const { cart } = useCart();
  const { pricesMap } = usePriceMap();

  const { enriched, totals } = useMemo(() => {
    // הגנות מרינדור ראשון
    const safeProducts = products ?? [];
    const cartArr = cart?.products ?? [];

    // מפה מהירה של כמות בעגלה
    const cartMap = Object.fromEntries(
      cartArr.map((p) => [p.barcode, p.amount])
    );

    let totalAmount = 0;
    let totalPrice = 0;

    const list = safeProducts.map((prod) => {
      const priceData = pricesMap[prod.barcode];
      const amount = cartMap[prod.barcode] ?? 0;

      const lineTotal = calculateTotalPrice(amount, priceData);
      totalAmount += amount;
      totalPrice += lineTotal;

      return {
        ...prod,
        price: priceData?.price ?? null,
        unitPrice: priceData?.price ?? null,
        hasDiscount: priceData?.hasDiscount ?? false,
        discount: priceData?.discount ?? null,
        promoText:
          priceData?.hasDiscount && priceData.discount
            ? `${priceData.discount.units} יח׳ – ${priceData.discount.totalPrice}₪`
            : null,
        amountInCart: amount,
        totalPrice: Number(lineTotal.toFixed(2)),
      };
    });

    return {
      enriched: list,
      totals: {
        totalAmount,
        totalPrice: Number(totalPrice.toFixed(2)),
      },
    };
  }, [products, cart?.products, pricesMap]);

  return {
    productsWithDetails: enriched,
    cartTotalAmount: totals.totalAmount,
    cartTotalPrice: totals.totalPrice,
    isLoadingProducts,
  };
};

// -----------------------------------------------------------------------------
// 6) Product line hook – נתונים + פעולות לליין בודד
// -----------------------------------------------------------------------------
export const useProductLine = (barcode) => {
  const { productsWithDetails } = useEnrichedProducts();
  const actions = useCartActions();

  const data = useMemo(
    () => productsWithDetails.find((p) => p.barcode === barcode) ?? null,
    [productsWithDetails, barcode]
  );

  return { data, ...actions };
};

// -----------------------------------------------------------------------------
// 7) Cart totals – אם מישהו רוצה רק totals בלי products
// -----------------------------------------------------------------------------
export const useCartTotals = () => {
  const { cart } = useCart();
  const { pricesMap } = usePriceMap();

  //   return useMemo(() => {
  //     let amount = 0,
  //       price = 0;
  //     cart.products.forEach((pr) => {
  //       amount += pr.amount;
  //       price += calculateTotalPrice(pr.amount, pricesMap[pr.barcode]);
  //     });
  //     return { totalAmount: amount, totalPrice: price };
  //   }, [cart.products, pricesMap]);

  return useMemo(() => {
    if (!cart || !cart.products) {
      return { totalAmount: 0, totalPrice: 0 };
    }

    let amount = 0,
      price = 0;

    cart.products.forEach((pr) => {
      amount += pr.amount;
      price += calculateTotalPrice(pr.amount, pricesMap[pr.barcode]);
    });
    return { totalAmount: amount, totalPrice: price };
  }, [cart?.products, pricesMap]);
};


export const useCartItems = () => {
    const { productsWithDetails } = useEnrichedProducts();
    return productsWithDetails.filter((p) => p.amountInCart > 0);
  };
  
  export default useCartItems;