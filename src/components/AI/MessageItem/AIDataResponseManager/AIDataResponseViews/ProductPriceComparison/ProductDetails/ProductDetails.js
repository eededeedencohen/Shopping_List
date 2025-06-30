// ./ProductDetails/ProductDetails.jsx
import React from "react";
import "./ProductDetails.css";
import ProductsImages from "../../../../../../Images/ProductsImages";

export default function ProductDetails({ product }) {
  if (!product) {
    return (
      <div className="test_pd__wrapper" dir="rtl">
        <p className="test_pd__missing">¯\_(ツ)_/¯ לא נמצאו פרטי מוצר</p>
      </div>
    );
  }

  const {
    barcode,
    name,
    weight,
    unitWeight,
    category,
    subcategory,
    generalName,
  } = product;

  const weightStr = weight && unitWeight ? `${weight}${unitWeight}` : undefined;

  return (
    <div className="test_pd__wrapper" dir="rtl">
      {/* תמונה */}
      <ProductsImages barcode={barcode} alt={name} className="test_pd__image" />

      {/* טקסטים */}
      <div className="test_pd__info">
        <h3 className="test_pd__name">{name}</h3>
        <p className="test_pd__barcode">{barcode}</p>

        <ul className="test_pd__meta">
          {weightStr && <li>{weightStr}</li>}
          {category && subcategory && (
            <li>
              {category} / {subcategory}
            </li>
          )}
          {generalName && <li>{generalName}</li>}
        </ul>
      </div>
    </div>
  );
}
