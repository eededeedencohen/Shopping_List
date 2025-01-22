import React, { useRef, useEffect } from "react";
import "./MonthlyExpensesBarChart.css";
import BarChartWrapper from "./BarChartWrapper";

const MonthlyExpensesBarChart = ({
  data,
  selectedMonthYear,
  onMonthSelect,
}) => {
  const monthlyTotals = data.reduce((acc, item) => {
    const monthYear = item.date.slice(0, 7);
    acc[monthYear] = (acc[monthYear] || 0) + item.totalPrice;
    return acc;
  }, {});

  const reversedMonthlyTotals = Object.entries(monthlyTotals).reverse();

  const containerRef = useRef(null);
  const barRefs = useRef({}); // אובייקט לשמירת ref לכל מקל

  useEffect(() => {
    if (containerRef.current && barRefs.current[selectedMonthYear]) {
      const container = containerRef.current;
      const selectedBar = barRefs.current[selectedMonthYear];

      // רוחב בר בודד + הרווח ביניהם
      const barWidth = selectedBar.offsetWidth + 20; // כאן נניח שהרווח הוא 20px
      const offsetLeft = selectedBar.offsetLeft - container.offsetLeft;

      // החישוב מבטיח שהבר הנבחר יהיה השני משמאל
      const targetScrollPosition = offsetLeft - barWidth;

      // גלילה בצורה חלקה
      container.scrollTo({
        left: targetScrollPosition >= 0 ? targetScrollPosition : 0,
        behavior: "smooth",
      });
    }
  }, [selectedMonthYear]);

  return (
    <div className="bar-chart-container" ref={containerRef}>
      {reversedMonthlyTotals.map(([monthYear, total]) => (
        <div
          key={monthYear}
          ref={(el) => (barRefs.current[monthYear] = el)} // שמירת ref לכל מקל
        >
          <BarChartWrapper
            monthYear={monthYear}
            total={total}
            isSelected={monthYear === selectedMonthYear}
            onMonthSelect={onMonthSelect}
          />
        </div>
      ))}
    </div>
  );
};

export default MonthlyExpensesBarChart;
