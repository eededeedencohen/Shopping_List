import React from "react";
import "./BarChartWrapper.css";

const ConvertMonthYearToHebrew = (monthYear) => {
  const [year, month] = monthYear.split("-");
  const months = [
    "ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני",
    "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
};

const BarChartWrapper = ({ monthYear, total, isSelected, onMonthSelect }) => {
  return (
    <div
      className={`bar-chart-wrapper ${isSelected ? "selected" : ""}`}
      onClick={() => onMonthSelect(monthYear)}
    >
      <div className="bar-value">₪{total.toFixed(2)}</div>
      <div
        className="bar-chart"
        style={{ height: `${(total / 2000) * 200}px` }}
      ></div>
      <div className="bar-date">{ConvertMonthYearToHebrew(monthYear)}</div>
    </div>
  );
};

export default BarChartWrapper;
