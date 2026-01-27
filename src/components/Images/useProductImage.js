/**
 * Hook לטעינה דינמית של תמונות מוצרים
 * משתמש ב-dynamic import כדי להימנע מ-import עצום
 */
export const useProductImage = (barcode) => {
  try {
    // ניסיון לטעין את התמונה באופן דינמי
    const image = require(`./images/${barcode}.png`);
    return image;
  } catch (error) {
    // אם התמונה לא קיימת, החזר undefined
    return null;
  }
};

/**
 * פונקציה לקבלת URL של תמונה דרך require
 */
export const getProductImageUrl = (barcode) => {
  try {
    return require(`./images/${barcode}.png`);
  } catch (error) {
    return null;
  }
};

/**
 * רכיב React לתצוגת תמונת מוצר
 */
export const ProductImage = ({ barcode, alt, className, style }) => {
  const image = useProductImage(barcode);

  if (!image) {
    return (
      <div
        className={className}
        style={{
          ...style,
          backgroundColor: "#f0f0f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#999" }}>No Image</span>
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={alt || `Product ${barcode}`}
      className={className}
      style={style}
    />
  );
};
