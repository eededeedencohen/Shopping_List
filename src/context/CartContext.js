import { createContext, useContext, useState } from "react";
import {
  getActiveCartByUserID,
  updateProductInCart,
} from "../network/cartService";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState(null);

  const loadCart = async (id) => {
    const data = await getActiveCartByUserID(id);
    setCart(data);
  };

  const updateProductAmount = async (userId, barcode, newAmount) => {
    const updatedCart = await updateProductInCart(userId, barcode, newAmount);
    setCart(updatedCart);
  };

  return (
    <CartContext.Provider value={{ cart, loadCart, updateProductAmount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
