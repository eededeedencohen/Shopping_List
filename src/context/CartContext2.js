import { createContext, useContext, useEffect, useState } from "react";
import { getActiveCart, updateCartData } from "../services/cartService";

const CartContext2 = createContext(null);

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const [isLoadingCartData, setIsLoadingCartData] = useState(false);

  useEffect(() => {
    const loadCart = async () => {
      setIsLoadingCartData(true);
      try {
        const cartData = await getActiveCart();
        setCart(cartData);
      } catch (error) {
        console.error("Failed to load cart", error);
      } finally {
        setIsLoadingCartData(false);
      }
    };

    loadCart();
  }, []);

  /**
   * Syncs the current cart state with the server.
   */
  const syncCartToServer = async () => {
    try {
      if (!cart || !cart._id) throw new Error("No cart or ID found");
      await updateCartData(cart._id, cart);
    } catch (err) {
      console.error("Failed to sync cart", err);
    }
  };

  return (
    <CartContext2.Provider
      value={{
        cart,
        setCart,
        isLoadingCartData,
        syncCartToServer,
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
