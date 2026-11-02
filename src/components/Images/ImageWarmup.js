/**
 * Warms the browser image cache for the products in the active cart as soon
 * as the cart arrives from the server (typically while the splash screen is
 * still up), so the cart page opens with its pictures already there.
 * Renders nothing.
 */
import { useEffect } from "react";
import { useCart } from "../../context/CartContext2";
import { prefetchProductImages, whenIdle } from "../../utils/productImages";

export default function ImageWarmup() {
  const { cart } = useCart();
  const barcodesKey = (cart?.products || [])
    .map((p) => String(p.barcode))
    .join(",");

  useEffect(() => {
    if (!barcodesKey) return undefined;
    const barcodes = barcodesKey.split(",");
    return whenIdle(() => prefetchProductImages(barcodes, { limit: 80 }), {
      timeout: 2500,
    });
  }, [barcodesKey]);

  return null;
}
