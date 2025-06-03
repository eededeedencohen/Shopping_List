import { useEffect, useState } from "react";
import ProductsImages from "../../../../Images/ProductsImages";
import "./ProductAnimationAdd.css";
import CartImage from "./cart.png";

const ProductAnimationAdd = ({ barcode, amount }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="ppa_product-animation-add">
      <div className="ppa_product-animation-sequence">
        <div className="ppa_product-image-container">
          <div className="ppa_product-image-wrapper">
            <ProductsImages barcode={barcode} className="ppa_product-image" />
            <div className="ppa_product-amount-badge">x{amount}</div>
          </div>
        </div>

        <img src={CartImage} alt="Cart" className="ppa_cart-image" />
      </div>
    </div>
  );
};

export default ProductAnimationAdd;
