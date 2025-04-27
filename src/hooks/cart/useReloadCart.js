import { useCart } from "../../context/CartContext2";
import { getActiveCart } from "../../services/cartService";

export const useReloadCart = () => {
  const { setCart } = useCart();

  return async () => {
    try {
      const cartData = await getActiveCart();
      setCart(cartData);
    } catch (err) {
      console.error("Failed to reload cart from server", err);
    }
  };
};
