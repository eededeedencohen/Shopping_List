import { useCart } from "../../context/CartContext2";

export const useUpdateProductAmount = () => {
  const { cart, setCart } = useCart();

  return (barcode, newAmount) => {
    if (!cart) return;

    const updatedProducts = cart.products.map((p) =>
      p.barcode === barcode ? { ...p, amount: newAmount } : p
    );

    setCart({ ...cart, products: updatedProducts });
  };
};
