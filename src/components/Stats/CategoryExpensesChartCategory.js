import React, { useRef, useEffect } from "react";
import "./CategoryExpensesChartCategory.css";
import Dairy from "./Dairy.png";

const CategoryExpensesChartCategory = ({
  name,
  value,
  color,
  isSelected,
  onClick,
  containerRef, // מקבל את הרפרנס לקונטיינר מהרכיב האב
}) => {
  // רפרנס לאלמנט של האייטם עצמו
  const itemRef = useRef(null);

  useEffect(() => {
    if (isSelected && containerRef.current && itemRef.current) {
      const containerEl = containerRef.current;
      const itemEl = itemRef.current;

      // נקבל את "מלבן" הקונטיינר והאייטם
      const containerRect = containerEl.getBoundingClientRect();
      const itemRect = itemEl.getBoundingClientRect();

      // מחשבים את המיקום האנכי של האייטם ביחס לראש הקונטיינר
      // offsetTopWithinContainer = מיקום רלוונטי לגלילה
      let offsetTopWithinContainer =
        itemRect.top - containerRect.top + containerEl.scrollTop;

      // נניח שאתה רוצה שהאייטם יהיה קצת מתחת לשוליים העליונים (למשל 5 פיקסלים רווח):
      offsetTopWithinContainer -= 5;

      // כדי למנוע גלילה "מעבר" לתחתית:
      const maxScroll = containerEl.scrollHeight - containerEl.clientHeight;
      if (offsetTopWithinContainer > maxScroll) {
        offsetTopWithinContainer = maxScroll;
      }
      // וכדי למנוע גלילה שלילית, אם זה קורה איכשהו:
      if (offsetTopWithinContainer < 0) {
        offsetTopWithinContainer = 0;
      }

      // מבצעים את הגלילה
      containerEl.scrollTo({
        top: offsetTopWithinContainer,
        behavior: "smooth",
      });
    }
  },  [isSelected, containerRef]);

  return (
    <div
      ref={itemRef} // מצמידים את הרפרנס
      className={`category-list-item ${isSelected ? "selected" : ""}`}
      onClick={onClick}
      style={{ borderColor: color }}
    >
      <div className="category-list-item-content">
        <div className="category-list-item-content_name">{name}</div>
        <div className="category-list-item-content_value">
          ₪{value.toFixed(2)}
        </div>
      </div>
      <div className="category-list-item-image">
        <img src={Dairy} alt={name} />
      </div>
    </div>
  );
};

export default CategoryExpensesChartCategory;
