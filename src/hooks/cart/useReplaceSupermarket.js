import { useCart } from "../../context/CartContext2";
import { usePrices } from "../../context/PriceContext2";

export const useReplaceSupermarket = () => {
  const { cart, setCart } = useCart();
  const { loadPricesForSupermarket } = usePrices();

  return async (newSupermarketID) => {
    if (!cart) return;

    // עדכון הסופרמרקט בעגלה
    setCart({ ...cart, supermarketID: newSupermarketID });

    // טעינת מחירים מחדש עבור הסופרמרקט החדש
    await loadPricesForSupermarket(newSupermarketID);
  };
};
