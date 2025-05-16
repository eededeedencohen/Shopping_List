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
// cart structure:
// {
//   products: [ { barcode, amount }, ... ], // רשימת מוצרים בעגלה
//   supermarketID: "supermarketID" // סופרמרקט נוכחי
//   userID: "1"
// }
// -----------------------------------------------------------------------------
export const useCartState = () => {
  const { cart, isLoadingCartData } = useCart();
  return { cart, isLoading: isLoadingCartData };
};

// -----------------------------------------------------------------------------
// 2) Cart – פעולות (CRUD החלפת סופר )
// -----------------------------------------------------------------------------
export const useCartActions = () => {
  const { cart, setCart, supermarketID, confirmCart } = useCart();
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

  // replace old barcode with new barcode:
  const replaceProduct = useCallback(
    (oldBarcode, newBarcode) => {
      if (!cart) return;
      const updated = cart.products.map((p) =>
        p.barcode === oldBarcode ? { ...p, barcode: newBarcode } : p
      );
      setCart({ ...cart, products: updated });
    },
    [cart, setCart]
  );

  const clearCart = useCallback(() => {
    if (!cart) return;
    setCart({ ...cart, products: [] });
  }, [cart, setCart]);

  const confirmAndClearCart = useCallback(() => {
    if (!cart) return;

    try {
      // שלח אישור לשרת (לא מחכה לתשובה)
      confirmCart();

      // רוקן את העגלה מקומית
      setCart({ ...cart, products: [] });
    } catch (err) {
      console.error("Failed to confirm and clear cart:", err);
    }
  }, [cart, setCart, confirmCart]);

  return {
    add,
    update,
    remove,
    replaceSupermarket,
    replaceProduct,
    isLoadingPrices,
    clearCart,
    confirmAndClearCart,
  };
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
    return { totalAmount: amount, totalPrice: price.toFixed(2) };
  }, [cart, pricesMap]);
};


//----------------------------------------------------------------------------
// 
//----------------------------------------------------------------------------
export const useCartItems = () => {
  const { productsWithDetails } = useEnrichedProducts();
  return productsWithDetails.filter((p) => p.amountInCart > 0);
};

// -----------------------------------------------------------------------------
// 8) useFullCart – יוצר FullCart מתוך הקונטקסטים (לפי הדיאגרמה השנייה)
// -----------------------------------------------------------------------------
export const useFullCart = () => {
  const { cart } = useCart();
  const { products } = useProductList();
  const { pricesBySupermarket } = usePrices();

  const fullCart = useMemo(() => {
    if (!cart || !cart.products || pricesBySupermarket.length === 0)
      return null;

    const priceMap = Object.fromEntries(
      pricesBySupermarket.map((p) => [p.barcode, p])
    );

    const productMap = Object.fromEntries(products.map((p) => [p.barcode, p]));

    let totalPrice = 0;

    const productsWithPrices = cart.products
      .map(({ barcode, amount }) => {
        const product = productMap[barcode];
        if (!product) return null;

        const priceData = priceMap[barcode];
        const itemTotal = calculateTotalPrice(amount, priceData);
        totalPrice += itemTotal;

        return {
          product: {
            barcode: product.barcode,
            name: product.name,
            category: product.category,
            generalName: product.generalName,
            subcategory: product.subcategory,
            unitWeight: product.unitWeight ?? null,
            weight: product.weight ?? null,
          },
          amount,
          totalPrice: Number(itemTotal.toFixed(2)),
        };
      })
      .filter(Boolean); // סינון מוצרים שלא נמצאו

    const supermarket = pricesBySupermarket[0]?.supermarket ?? {
      supermarketID: cart.supermarketID,
      name: "",
      address: "",
      city: "",
    };

    return {
      supermarket,
      totalPrice: Number(totalPrice.toFixed(2)),
      productsWithPrices,
    };
  }, [cart, products, pricesBySupermarket]);

  return { fullCart };
};

// -----------------------------------------------------------------------------
// 9) useCurrentSupermarket – מחזיר את פרטי הסופרמרקט הנוכחי
// -----------------------------------------------------------------------------
export const useCurrentSupermarket = () => {
  const { cart } = useCart();
  const { pricesBySupermarket, isLoadingPrices } = usePrices();

  const currentSupermarket = pricesBySupermarket[0]?.supermarket ?? {
    supermarketID: cart?.supermarketID ?? "",
    name: "",
    address: "",
    city: "",
  };

  return { currentSupermarket, isLoadingPrices };
};

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export const useCheapestSupermarketIDs = () => {
  const { cart } = useCart();
  const { findCheapestSupermarketIDs } = usePrices();

  const getCheapestSupermarketIDs = useCallback(async () => {
    // if (!cart || !cart.products?.length) return [];
    const cheapestSupermarketIDs = await findCheapestSupermarketIDs(
      cart.products
    );
    console.log("cheapestSupermarketIDs", cheapestSupermarketIDs); // מחזיר רשימה ריקה - לא תקין
    console.log("cart.products", cart.products); // תקין
    return cheapestSupermarketIDs;
  }, [cart, findCheapestSupermarketIDs]);

  return { getCheapestSupermarketIDs };
};

// -----------------------------------------------------------------------------
//
// -----------------------------------------------------------------------------
export const useRandomSupermarketReplacer = () => {
  const { getCheapestSupermarketIDs } = useCheapestSupermarketIDs();
  const { replaceSupermarket } = useCartActions();

  const replaceRandomCheapest = async () => {
    const ids = await getCheapestSupermarketIDs();
    if (!ids.length) return false; // ← נחזיר false במקרה שאין תוצאה

    const randomID = ids[Math.floor(Math.random() * ids.length)];
    replaceSupermarket(randomID);
    return true; // ← הצלחה
  };

  return { replaceRandomCheapest };
};


// -----------------------------------------------------------------------------
// 10) useSync – סנכרון עגלה לשרת בצורה עצמאית
// -----------------------------------------------------------------------------
export const useSync = () => {
  const { syncCartToServer } = useCart();

  const sync = (cartToSync) => {
    // if (!cartToSync) return;
    syncCartToServer(cartToSync);
  };

  return { sync };
};

export const useUpdateActiveCart = () => {
  const { sendActiveCart } = useCart();

  return { sendActiveCart };
};

// -----------------------------------------------------------------------------
// useAlternativeProducts – מחזיר את כל המוצרים עם אותו generalName (למעט המוצר עצמו)
// כולל פרטי מחיר ונתונים מהעגלה (amountInCart וכו')
// -----------------------------------------------------------------------------
export const useAlternativeProducts = (barcode) => {
  const { productsWithDetails } = useEnrichedProducts();

  return useMemo(() => {
    if (!productsWithDetails || !barcode) return [];

    // מציאת המוצר לפי הברקוד
    const target = productsWithDetails.find((p) => p.barcode === barcode);
    if (!target?.generalName) return [];

    // החזרת כל המוצרים עם אותו generalName למעט המוצר עצמו
    return productsWithDetails.filter(
      (p) => p.generalName && p.generalName === target.generalName
    );
  }, [productsWithDetails, barcode]);
};

export default useCartItems;
