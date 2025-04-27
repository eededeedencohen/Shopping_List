import { useCart } from "../../context/CartContext2";

export const useCartState = () => {
  const { cart, setCart, isLoadingCartData } = useCart();
  return { cart, setCart, isLoadingCartData };
};
