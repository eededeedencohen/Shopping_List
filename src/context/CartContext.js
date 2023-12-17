import { createContext, useCallback, useContext, useState } from "react";
import {
  getActiveCartByUserID,
  getProductsAmountInCartByUserID,
  updateProductInCart,
  deleteProductFromCart,
} from "../network/cartService";
// import confirmCart from "../network/confirmCart";
import confirmSupermarketCart from "../network/confirmSupermarketCart";
import updateSupermarketID from "../network/updateSupermarketID";
import getCheapestSupermarket from "../network/cheapestSupermarket";

export const CartContext = createContext();

export const CartContextProvider = ({ children }) => {
  const [cart, setCart] = useState(null);

  const loadCart = useCallback(async (id) => {
    const { data } = await getActiveCartByUserID(id);
    setCart(data);
  }, []);

  const getProductsAmountInCart = useCallback(async (id) => {
    const { data } = await getProductsAmountInCartByUserID(id);
    return data;
  }, []);

  const updateProductAmount = async (userId, barcode) => {
    const cartItem = cart.productsWithPrices.find(
      (cartItem) => cartItem.product.barcode === barcode
    );
    await updateProductInCart(userId, barcode, cartItem.amount);
  };

  const removeProductFromCart = async (userId, barcode) => {
    await deleteProductFromCart(userId, barcode);
  };

  const handleConfirmCart = async (userId) => {
    // const confirmedCart = await confirmCart(userId);
    const confirmedCart = await confirmSupermarketCart(userId);
    setCart(confirmedCart);
  };

  const updateAmount = (productBarcode, type) => {
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

  const handleSupermarketUpdate = async (userId, supermarketID) => {
    await updateSupermarketID(userId, supermarketID);
  };

  const handleCheapestSupermarket = async (userId) => {
    const cheapestSupermarket = await getCheapestSupermarket(userId);
    return cheapestSupermarket;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loadCart,
        getProductsAmountInCart,
        updateAmount,
        updateProductAmount,
        removeProductFromCart,
        confirmCart: handleConfirmCart,
        updateSupermarketID: handleSupermarketUpdate,
        getCheapestSupermarketCart: handleCheapestSupermarket,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
