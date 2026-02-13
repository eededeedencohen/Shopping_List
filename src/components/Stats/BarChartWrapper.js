import React from "react";
import styles from "./BarChartWrapper.module.css";

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
      className={`${styles['bar-chart-wrapper']} ${isSelected ? styles.selected : ""}`}
      onClick={() => onMonthSelect(monthYear)}
    >
      <div className={styles['bar-value']}>₪{total.toFixed(2)}</div>
      <div
        className={styles['bar-chart']}
        style={{ height: `${(total / 2000) * 200}px` }}
      ></div>
      <div className={styles['bar-date']}>{ConvertMonthYearToHebrew(monthYear)}</div>
    </div>
  );
};

export default BarChartWrapper;
