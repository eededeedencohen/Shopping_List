import { useCart } from "../../context/CartContext2";

const useUpdateProductAmount = () => {
  const { cart, setCart } = useCart();

  return (barcode, newAmount) => {
    if (!cart) return;

    const updated = cart.products.map((p) =>
      p.barcode === barcode ? { ...p, amount: newAmount } : p
    );

    setCart({ ...cart, products: updated });
  };
};

export { useUpdateProductAmount };
export default useUpdateProductAmount;
