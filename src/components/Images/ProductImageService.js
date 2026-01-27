/**
 * שירות מרכזי לתמונות מוצרים
 * במקום להשתמש ב-import עצום, משתמש בטעינה דינמית
 */

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
import React from "react";

export const ProductImageDisplay = ({
  barcode,
  alt = "",
  className = "",
  style = {},
}) => {
  const imagePath = getProductImage(barcode);

  if (!imagePath) {
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

  return (
    <img
      src={imagePath}
      alt={alt || `Product ${barcode}`}
      className={className}
      style={style}
      loading="lazy"
      onError={(e) => {
        e.target.style.display = "none";
      }}
    />
  );
};

export default {
  getProductImage,
  getProductImageDirect,
  ProductImageDisplay,
};
