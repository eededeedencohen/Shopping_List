import { createContext, useCallback, useContext, useState } from "react";
import {
  getActiveCartByUserID,
  updateProductInCart,
} from "../network/cartService";
import confirmCart from "../network/confirmCart";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState(null);

  const loadCart = useCallback(async (id) => {
    const { data } = await getActiveCartByUserID(id);
    console.log({ data });
    setCart(data);
  }, []);

  const updateProductAmount = async (userId, barcode) => {
    const cartItem = cart.productsWithPrices.find(
      (cartItem) => cartItem.product.barcode === barcode
    );
    await updateProductInCart(userId, barcode, cartItem.amount);
  };

  const handleConfirmCart = async (userId) => {
    const confirmedCart = await confirmCart(userId);
    setCart(confirmedCart);
  };

  const updateAmount = (productBarcode, type) => {
    console.log({ cart });
    const productsWithPrices = cart.productsWithPrices.map((cartItem) => {
      if (cartItem.product.barcode === productBarcode) {
        if (type === "increment") {
          return { ...cartItem, amount: cartItem.amount + 1 };
        } else if (type === "decrement" && cartItem.amount > 0) {
          return { ...cartItem, amount: cartItem.amount - 1 };
        }
      }
      return cartItem;
    });
    setCart((prevCart) => ({ ...prevCart, productsWithPrices }));
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loadCart,
        updateAmount,
        updateProductAmount,
        confirmCart: handleConfirmCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
