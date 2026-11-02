/**
 * שירות מרכזי לתמונות מוצרים
 *
 * כל התמונות מגיעות מנקודת קצה אחת בשרת (`/api/v1/product-images/:barcode`)
 * שמחזירה תמונה ממוזערת (WebP, ~5KB) עם cache של 30 יום בדפדפן.
 * שום תמונה כבר לא נארזת לתוך ה-bundle של React.
 *
 * ProductImageDisplay מציג skeleton עד שהתמונה מגיעה, מרכך את הכניסה שלה,
 * ומדלג על שניהם לתמונות שכבר נטענו פעם ב-session הזה (מגיעות מה-cache).
 */

import React, { useLayoutEffect, useRef, useState } from "react";
import {
  productImageUrl,
  isImageLoaded,
  markImageLoaded,
} from "../../utils/productImages";
import "./ProductImage.css";

/**
 * URL של תמונת מוצר (תמיד מחזיר URL — הדפדפן מטפל ב-404 דרך onError).
 * נשמר לתאימות עם קוד שייבא את הפונקציה בעבר.
 */
export const getProductImage = (barcode) =>
  barcode ? productImageUrl(barcode) : null;

export const getProductImageDirect = getProductImage;

function NoImage({ className, style }) {
  return (
    <div
      className={className}
      style={{
        ...style,
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100px",
        color: "#999",
      }}
    >
      <span>אין תמונה</span>
    </div>
  );
}

/**
 * רכיב React לתצוגת תמונת מוצר
 * @param {string}  barcode
 * @param {boolean} eager  - true = לטעון מיד (עגלה); ברירת מחדל lazy (רשימות ארוכות)
 */
function ProductImageDisplay({
  barcode,
  alt = "",
  className = "",
  style = {},
  eager = false,
}) {
  const key = barcode != null && barcode !== "" ? String(barcode) : "";
  const imgRef = useRef(null);
  const [failed, setFailed] = useState(false);
  /* Images that already loaded once this session (or are sitting in the
     browser cache) render as "loaded" from the very first paint — no
     skeleton flash, no fade. */
  const [loaded, setLoaded] = useState(() => isImageLoaded(key));
  const [reveal, setReveal] = useState(false);

  /* Barcode changed under the same mounted component → reset states
     (React's documented "adjust state on prop change" pattern). */
  const [prevKey, setPrevKey] = useState(key);
  if (prevKey !== key) {
    setPrevKey(key);
    setFailed(false);
    setLoaded(isImageLoaded(key));
    setReveal(false);
  }

  /* Before paint: if the browser already has the bytes (memory cache),
     `complete` is true right away — mark loaded without any animation. */
  useLayoutEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0 && !isImageLoaded(key)) {
      markImageLoaded(key);
      setLoaded(true);
    }
  }, [key]);

  if (!key || failed) return <NoImage className={className} style={style} />;

  const stateClass = loaded ? (reveal ? "pimg--reveal" : "") : "pimg--loading";

  return (
    <img
      ref={imgRef}
      src={productImageUrl(key)}
      alt={alt || `Product ${key}`}
      className={`pimg ${stateClass} ${className}`.replace(/\s+/g, " ").trim()}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      onLoad={() => {
        if (!isImageLoaded(key)) {
          markImageLoaded(key);
          setReveal(true); // it was really loading on screen → soft reveal
        }
        setLoaded(true);
      }}
      /* one-shot: drop the reveal class as soon as it has played so it can
         never sit on top of a page's own <img> animation */
      onAnimationEnd={() => reveal && setReveal(false)}
      onError={() => setFailed(true)}
    />
  );
}

export { ProductImageDisplay };

export default ProductImageDisplay;
