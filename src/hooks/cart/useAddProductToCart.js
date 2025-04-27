import { useCart } from "../../context/CartContext2";

export const useAddProductToCart = () => {
  const { cart, setCart } = useCart();

  return (barcode, amount = 1) => {
    if (!cart) return;

    const existingProduct = cart.products.find((p) => p.barcode === barcode);
    let updatedProducts;

    if (existingProduct) {
      updatedProducts = cart.products.map((p) =>
        p.barcode === barcode ? { ...p, amount: p.amount + amount } : p
      );
    } else {
      updatedProducts = [...cart.products, { barcode, amount }];
    }

    setCart({ ...cart, products: updatedProducts });
  };
};
