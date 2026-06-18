/**
 * שירות מרכזי לתמונות מוצרים
 * במקום להשתמש ב-import עצום, משתמש בטעינה דינמית
 */

import React, { useState } from "react";
import { DOMAIN } from "../../constants";

// Cache לשמירת תמונות שכבר טענו
const imageCache = {};

/**
 * פונקציה להשגת תמונה עם caching
 * @param {string} barcode - barcode של המוצר
 * @returns {string|null} - path של התמונה או null אם לא קיימת
 */
export const getProductImage = (barcode) => {
  // בדוק ב-cache קודם
  if (barcode in imageCache) {
    return imageCache[barcode];
  }

  try {
    // נסה לטעון את התמונה
    const image = require(`./images/${barcode}.png`);
    imageCache[barcode] = image;
    return image;
  } catch (error) {
    // אם התמונה לא קיימת, אחסן null ב-cache
    imageCache[barcode] = null;
    return null;
  }
};

/**
 * פונקציה לקבלת תמונה ללא caching (עבור use-cases ספציפיים)
 */
export const getProductImageDirect = (barcode) => {
  try {
    return require(`./images/${barcode}.png`);
  } catch (error) {
    return null;
  }
};

/**
 * רכיב React לתצוגת תמונת מוצר
 */

function ProductImageDisplay({
  barcode,
  alt = "",
  className = "",
  style = {},
}) {
  const imagePath = getProductImage(barcode);
  /* When the local bundled image is missing, fall back to the backend's
     Mongo-backed image endpoint. If that 404s too, render the placeholder. */
  const [serverFailed, setServerFailed] = useState(false);

  if (!imagePath && (serverFailed || !barcode)) {
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

  const src = imagePath || `${DOMAIN}/api/v1/product-images/${barcode}`;

  return (
    <img
      src={src}
      alt={alt || `Product ${barcode}`}
      className={className}
      style={style}
      loading="lazy"
      onError={(e) => {
        if (imagePath) {
          /* Local image asset is broken — hide and move on. */
          e.target.style.display = "none";
        } else {
          /* Server fetch failed — switch to the placeholder. */
          setServerFailed(true);
        }
      }}
    />
  );
}

export { ProductImageDisplay };

export default ProductImageDisplay;
