import React from "react";
import "./ExpenseBreakdownList.css";

import dairyLogo from "./Dairy.png";
import frozenLogo from "./Frozen.png";
import snacksLogo from "./Snacks.png";
import beveragesLogo from "./Beverages.png";
import cannedLogo from "./Canned.png";
import cleaningLogo from "./Cleaning.png";
import pharmacyLogo from "./Pharmacy.png";
import otherLogo from "./Other.png";
import bakingLogo from "./Baking.png";

const categoryIcons = {
  "מוצרי חלב וביצים": dairyLogo,
  "מוצרים קפואים": frozenLogo,
  "חטיפים, מתוקים ודגנים": snacksLogo,
  "משקאות, יין ואלכוהול": beveragesLogo,
  "שימורים": cannedLogo,
  "ניקיון וחד פעמי": cleaningLogo,
  "פארם ותינוקות": pharmacyLogo,
  "בישול ואפייה": bakingLogo,
  Other: otherLogo,
};

const ExpenseBreakdownList = ({ data, selectedCategory }) => {
  const products = data.flatMap((item) =>
    item.products.filter(
      (product) =>
        selectedCategory === "All Categories" ||
        product.category === selectedCategory
    )
  );

  return (
    <div className="expense-breakdown-list">
      <h2>פירוט מוצרים</h2>
      <ul>
        {products.map((product, index) => (
          <div key={index} className="ebl_product_details">
            <div className="ebl_total_price">₪{product.totalPrice.toFixed(2)}</div>
            <div className="ebl_supermarket">רמי לוי שיווק השקמה</div>
            <div className="ebl_amount">{product.amount}X</div>
            <div className="ebl_product">
              <div className="ebl_product_name">{product.name}</div>
              <div className="ebl_product_brand">{product.brand}</div>
            </div>
            <div className="ebl_category_logo">
              <img
                src={categoryIcons[product.category] || otherLogo}
                alt={`${product.category} Logo`}
                className="ebl_logo_image"
              />
            </div>
          </div>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseBreakdownList;
