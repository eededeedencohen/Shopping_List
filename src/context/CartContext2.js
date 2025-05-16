import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  getActiveCart,
  updateCartData,
  updateActiveCart as apiUpdateActiveCart,
  confirmCart,
} from "../services/cartService";

const CartContext2 = createContext(null);

export const CartContextProvider2 = ({ children }) => {
  const [cart, setCart] = useState(null);
  // const [supermarketID, setSupermarketID] = useState(null);
  const [isLoadingCartData, setIsLoadingCartData] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoadingCartData(true);
      try {
        const cartData = await getActiveCart();
        console.log(cartData);
        setCart(cartData);
        // setSupermarketID(cartData.supermarketID);
      } catch (error) {
        console.error("Failed to load cart", error);
      } finally {
        setIsLoadingCartData(false);
      }
    };

    loadCart();
  }, []);

  const supermarketID = cart?.supermarketID ?? null; // ← כאן אין שגיאת scope

  /**
   * Syncs the current cart state with the server.
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

  /** שולח עדכון מלא לעגלה הפעילה – בלי לעדכן את ה‑state */
  const sendActiveCart = useCallback(async () => {
    if (!cart) return;

    const supermarketID = cart.supermarketID;
    const products = cart.products.map(({ barcode, amount }) => ({
      barcode,
      amount,
    }));

    try {
      await apiUpdateActiveCart(supermarketID, products);
    } catch (err) {
      console.error("sendActiveCart failed:", err);
    }
  }, [cart]);

  return (
    <CartContext2.Provider
      value={{
        cart,
        setCart,
        isLoadingCartData,
        supermarketID,
        syncCartToServer,
        sendActiveCart,
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
