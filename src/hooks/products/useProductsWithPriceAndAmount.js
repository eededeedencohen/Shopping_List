// products/useProductsWithPriceAndAmount.js

import useProducts from "./useProducts";
import { useCart } from "../../context/CartContext2";
import { usePrices } from "../../context/PriceContext2";  // ✅ שינוי נכון
import { calculateTotalPrice } from "../../utils/priceCalculations";

const useProductsWithPriceAndAmount = () => {
  const { products } = useProducts();
  const { cart } = useCart();
  const { pricesBySupermarket } = usePrices();  // ✅ שינוי נכון

  const activeSupermarketID = cart?.supermarketID;
  const priceList = pricesBySupermarket?.[activeSupermarketID] || [];

  let cartTotalAmount = 0;
  let cartTotalPrice = 0;

  const mergedProducts = products.map((product) => {
    const priceData = priceList.find((p) => p.barcode === product.barcode);
    const amountInCart =
      cart?.products?.find((item) => item.barcode === product.barcode)?.amount || 0;

    const totalPrice = calculateTotalPrice(amountInCart, priceData);

    cartTotalAmount += amountInCart;
    cartTotalPrice += totalPrice;

    return {
      ...product,
      price: priceData?.price || null,
      hasDiscount: priceData?.hasDiscount || false,
      discount: priceData?.discount || null,
      amountInCart,
      totalPrice,
    };
  });

  return {
    productsWithDetails: mergedProducts,
    cartTotalAmount,
    cartTotalPrice,
  };
};

export default useProductsWithPriceAndAmount;
