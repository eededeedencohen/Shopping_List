import { useEffect, useState } from "react";
import { ProductImageDisplay } from "../../../../Images/ProductImageService";
import "./ProductAnimationDelete.css";
import CartImage from "./cart.png";
import GarbageImage from "./garbage.png";

const ProductAnimationDelete = ({ barcode, amount }) => {
  const [show, setShow] = useState(true);
  const [showProduct, setShowProduct] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowProduct(true), 1000); // מוצר יוצא אחרי שהעגלה נעצרת
    const t2 = setTimeout(() => setShow(false), 5000); // כל הסצנה נגמרת

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="ppd_wrapper">
      <img src={CartImage} alt="Cart" className="ppd_cart" />
      <img src={GarbageImage} alt="Garbage" className="ppd_garbage" />

      {showProduct && (
        <div className="ppd_product">
          <div className="ppd_product-wrapper">
            <ProductImageDisplay
              barcode={barcode}
              className="ppd_product-image"
            />
            <div className="ppd_badge">x{amount}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductAnimationDelete;
