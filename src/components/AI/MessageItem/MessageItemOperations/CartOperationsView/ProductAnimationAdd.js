import { useEffect, useState } from "react";
import { ProductImageDisplay } from "../../../../Images/ProductImageService";
import "./ProductAnimationAdd.css";
import CartImage from "./cart.png";

/* The beloved add-to-cart show, polished:
   the cart rolls in onto a glowing stage, the product tile falls with a wobble
   and squashes into the basket; on the catch — impact ring, confetti burst,
   a green check pops on the cart, "+×N" floats up and the title appears; then
   the cart happily rolls away with the product inside. Pure CSS keyframes. */

const CONFETTI = ["#34d399", "#22d3ee", "#fbbf24", "#ff6584", "#a78bfa", "#6ee7b7", "#93c5fd", "#f9a8d4"];

const ProductAnimationAdd = ({ barcode, amount }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="ppa_product-animation-add" dir="rtl">
      <div className="ppa_scene">
        {/* glowing stage under the cart */}
        <span className="ppa_glow" />
        <span className="ppa_floor" />

        {/* the falling product tile */}
        <div className="ppa_product-track">
          <div className="ppa_product-tile">
            <ProductImageDisplay barcode={barcode} className="ppa_product-image" />
            <span className="ppa_product-amount-badge">×{amount}</span>
          </div>
        </div>

        {/* the cart (rolls in → catch bounce → rolls out) */}
        <div className="ppa_cart">
          <img src={CartImage} alt="" className="ppa_cart-image" />
          <span className="ppa_check">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
        </div>

        {/* impact effects at the catch */}
        <span className="ppa_ring" />
        <span className="ppa_confetti">
          {CONFETTI.map((c, i) => (
            <i
              key={i}
              style={{
                "--a": `${i * 45}deg`,
                "--c": c,
                "--d": `${1.68 + (i % 3) * 0.04}s`,
              }}
            />
          ))}
        </span>
        <b className="ppa_float">+{amount}</b>

        <span className="ppa_title">נוסף לעגלה!</span>
      </div>
    </div>
  );
};

export default ProductAnimationAdd;
