import React from "react";
import "./BarChartWrapper.css";

const ConvertMonthYearToHebrew = (monthYear) => {
    const [year, month] = monthYear.split("-"); // פיצול לפי "-" - קודם השנה ואז החודש
    const months = [
      "ינואר",
      "פברואר",
      "מרץ",
      "אפריל",
      "מאי",
      "יוני",
      "יולי",
      "אוגוסט",
      "ספטמבר",
      "אוקטובר",
      "נובמבר",
      "דצמבר",
    ];
  
    const monthIndex = parseInt(month, 10) - 1; // החודש מתחיל מ-1, ולכן צריך להוריד 1 כדי להתאים למערך
    return `${months[monthIndex]} ${year}`; // החזרת שם החודש והשנה
  };
  

const BarChartWrapper = ({ monthYear, total, isSelected, onMonthSelect }) => {
  return (
    <div
      className={`bar-chart-wrapper ${isSelected ? "selected" : ""}`}
      // Choose a month
      onClick={() => onMonthSelect(monthYear)}
    >
      <div className="bar-value">₪{total.toFixed(2)}</div>

      <div
        className="bar-chart"
        style={{ height: `${(total / 2000) * 200}px` }} // גובה יחסי להוצאה
      ></div>
      <div className="bar-date">{ConvertMonthYearToHebrew(monthYear)}</div>
    </div>
  );
};

export default BarChartWrapper;
