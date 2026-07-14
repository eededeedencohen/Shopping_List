import { useEffect, useState } from "react";
import { ProductImageDisplay } from "../../../../Images/ProductImageService";
import "./ProductAnimationDelete.css";
import CartImage from "./cart.png";
import GarbageImage from "./garbage.png";

/* The remove-from-cart show, polished to match the add show:
   the cart rolls in from the left and the bin from the right onto a glowing
   red stage; the product pops OUT of the cart, arcs through the air with a
   wobble and drops into the bin; on impact — the bin bounces, a red ring and
   shards burst and the title appears; then everything fades out.
   Pure CSS keyframes, RTL-safe, frameless product image. */

const SHARDS = ["#fb7185", "#fbbf24", "#f472b6", "#fca5a5", "#fdba74", "#e11d48"];

const IconX = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.2"
    strokeLinecap="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

const ProductAnimationDelete = ({ barcode, amount }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="ppd_product-animation-delete" dir="rtl">
      <div className="ppd_scene">
        {/* glowing danger stage */}
        <span className="ppd_glow" />
        <span className="ppd_floor" />

        {/* the cart (origin) — left side */}
        <div className="ppd_cart">
          <img src={CartImage} alt="" className="ppd_cart-image" />
        </div>

        {/* the bin (destination) — right side */}
        <div className="ppd_bin">
          <img src={GarbageImage} alt="" className="ppd_bin-image" />
        </div>

        {/* the flying product: emerge = reveal window whose bottom edge sits on
            the basket rim, so the product rises OUT of the cart gradually
            (and later sinks INTO the bin); outer = horizontal arc, inner =
            vertical + spin */}
        <div className="ppd_emerge">
          <div className="ppd_arc-x">
            <div className="ppd_arc-y">
              <div className="ppd_product-tile">
                <ProductImageDisplay
                  barcode={barcode}
                  className="ppd_product-image"
                />
                <b className="ppd_badge">
                  <IconX />
                </b>
              </div>
            </div>
          </div>
        </div>

        {/* fall-in ring over the bin, then the CRASH burst when the cart hits */}
        <span className="ppd_ring" />
        <span className="ppd_ring ppd_ring--crash" />
        <span className="ppd_shards">
          {SHARDS.map((c, i) => (
            <i
              key={i}
              style={{
                "--a": `${i * 60}deg`,
                "--c": c,
                "--d": `${2.42 + (i % 3) * 0.04}s`,
              }}
            />
          ))}
        </span>

        <span className="ppd_title">הוסר מהעגלה</span>
      </div>
    </div>
  );
};

export default ProductAnimationDelete;
