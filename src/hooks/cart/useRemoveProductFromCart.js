import { useCart } from "../../context/CartContext2";

export const useRemoveProductFromCart = () => {
  const { cart, setCart } = useCart();

  return (barcode) => {
    if (!cart) return;

    const updatedProducts = cart.products.filter((p) => p.barcode !== barcode);
    setCart({ ...cart, products: updatedProducts });
  };
};
