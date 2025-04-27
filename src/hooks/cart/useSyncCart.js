import { useCart } from "../../context/CartContext2";

export const useSyncCart = () => {
  const { syncCartToServer } = useCart();
  return syncCartToServer;
};
