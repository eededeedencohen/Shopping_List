import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  getActiveCart,
  updateCartData,
  updateActiveCart as apiUpdateActiveCart,
  confirmCart,
} from "../services/cartService";
import { DOMAIN } from "../constants";

const CartContext2 = createContext(null);

/* How long to wait after the last cart change before sending the update
   to the server. Resets on every new change. */
const ACTIVE_CART_DEBOUNCE_MS = 2000;

const buildPayload = (cart) => {
  if (!cart) return null;
  return {
    supermarketID: cart.supermarketID,
    products: (cart.products || []).map(({ barcode, amount }) => ({
      barcode,
      amount,
    })),
  };
};

export const CartContextProvider2 = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoadingCartData, setIsLoadingCartData] = useState(false);

  /* Refs used by the debouncer */
  const cartRef = useRef(cart);
  const debounceTimerRef = useRef(null);
  const pendingFlushRef = useRef(false);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoadingCartData(true);
      try {
        const cartData = await getActiveCart();
        console.log(cartData);
        setCart(cartData);
      } catch (error) {
        console.error("Failed to load cart", error);
      } finally {
        setIsLoadingCartData(false);
      }
    };

    loadCart();
  }, []);

  const supermarketID = cart?.supermarketID ?? null;

  /**
   * ===============================
   * Syncs the current cart state with the server.
   * ===============================
   */
  const syncCartToServer = async (updatedCart) => {
    try {
      if (!updatedCart || !updatedCart._id)
        throw new Error("No cart or ID found");
      await updateCartData(updatedCart._id, updatedCart);
    } catch (err) {
      console.error("Failed to sync cart", err);
    }
  };

  /**
   * Sends the LATEST cart snapshot to the server immediately. Called
   * either by the debounce timer firing, or by an explicit flush
   * (e.g. on tab close).
   */
  const flushActiveCart = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (!pendingFlushRef.current) return;
    pendingFlushRef.current = false;

    const payload = buildPayload(cartRef.current);
    if (!payload) return;

    try {
      await apiUpdateActiveCart(payload.supermarketID, payload.products);
    } catch (err) {
      console.error("sendActiveCart failed:", err);
    }
  }, []);

  /**
   * Public API: schedule (debounced) sending of the current active cart
   * to the server. Each call resets the timer; only one request fires
   * after ACTIVE_CART_DEBOUNCE_MS of quiet, with the latest cart snapshot.
   */
  const sendActiveCart = useCallback(() => {
    if (!cartRef.current) return;

    pendingFlushRef.current = true;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      debounceTimerRef.current = null;
      flushActiveCart();
    }, ACTIVE_CART_DEBOUNCE_MS);
  }, [flushActiveCart]);

  /* Flush any pending update when the tab is closed/refreshed/hidden,
     using sendBeacon so the request actually leaves the browser. */
  useEffect(() => {
    const flushBeacon = () => {
      if (!pendingFlushRef.current) return;
      const payload = buildPayload(cartRef.current);
      if (!payload) return;

      const url = `${DOMAIN}/api/v1/carts/update-active-cart`;
      try {
        if (typeof navigator !== "undefined" && navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(payload)], {
            type: "application/json",
          });
          navigator.sendBeacon(url, blob);
        } else {
          // Fallback — fire-and-forget POST
          apiUpdateActiveCart(payload.supermarketID, payload.products).catch(
            () => {}
          );
        }
      } catch {
        /* ignore */
      }

      pendingFlushRef.current = false;
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") flushBeacon();
    };

    window.addEventListener("beforeunload", flushBeacon);
    window.addEventListener("pagehide", flushBeacon);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", flushBeacon);
      window.removeEventListener("pagehide", flushBeacon);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  /* Cleanup: if the provider unmounts with a pending flush, send it. */
  useEffect(() => {
    return () => {
      if (pendingFlushRef.current) {
        flushActiveCart();
      }
    };
  }, [flushActiveCart]);

  return (
    <CartContext2.Provider
      value={{
        cart,
        setCart,
        isLoadingCartData,
        supermarketID,
        syncCartToServer,
        sendActiveCart,
        flushActiveCart,
        confirmCart,
      }}
    >
      {children}
    </CartContext2.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext2);
  if (!context) throw new Error("CartContext was not provided correctly");
  return context;
};
