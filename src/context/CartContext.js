import { createContext, useContext, useState } from "react";
import { getActiveCartByUserID } from "../network/cartService";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState(null);

  const loadCart = async (id) => {
    const data = await getActiveCartByUserID(id);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
