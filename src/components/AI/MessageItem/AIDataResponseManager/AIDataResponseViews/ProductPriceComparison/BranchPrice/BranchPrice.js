import React from "react";
import "./BranchPrice.css";

/**
 *  priceObj  = { price: number, hasDiscount: boolean, discount: { units, priceForUnit, totalPrice } | null }
 *  branches  = [ "יד חרוצים 18", … ]
 */
export default function BranchPrice({ priceObj, branches = [] }) {
  if (!priceObj) return null; // שמירה מפני null-ים

  return (
    <div className="test_bp__wrapper" dir="rtl">
      {/* מחיר ראשי */}
      <div className="test_bp__price">
        {priceObj.price}
        <span className="test_bp__currency"> ₪</span>
      </div>

      {/* קלף-מבצע (מופיע רק אם יש) */}
      {priceObj.hasDiscount && priceObj.discount && (
        <div className="test_bp__dealCard">
          <strong className="test_bp__dealLabel">מבצע&nbsp;•&nbsp;</strong>
          {priceObj.discount.units}-ב-{priceObj.discount.totalPrice}
          &nbsp;({priceObj.discount.priceForUnit}₪ ליח')
        </div>
      )}

      {/* מפריד דק */}
      <div className="test_bp__separator" />

      {/* רשימת סניפים */}
      <div className="test_bp__branches">
        {branches.map((b) => (
          <span key={b} className="test_bp__chip">
            {b}
          </span>
        ))}
      </div>
    </div>
  );
}
