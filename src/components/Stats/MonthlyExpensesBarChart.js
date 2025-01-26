import React, { useRef, useEffect } from "react";
import "./MonthlyExpensesBarChart.css";
import BarChartWrapper from "./BarChartWrapper";

const MonthlyExpensesBarChart = ({ data, selectedMonthYear, onMonthSelect }) => {
  const monthlyTotals = data.reduce((acc, item) => {
    const monthYear = item.date.slice(0, 7);
    acc[monthYear] = (acc[monthYear] || 0) + item.totalPrice;
    return acc;
  }, {});

  const reversedMonthlyTotals = Object.entries(monthlyTotals).reverse();

  const containerRef = useRef(null);
  const barRefs = useRef({});

  useEffect(() => {
    if (containerRef.current && barRefs.current[selectedMonthYear]) {
      const container = containerRef.current;
      const selectedBar = barRefs.current[selectedMonthYear];

      const barWidth = selectedBar.offsetWidth + 20;
      const offsetLeft = selectedBar.offsetLeft - container.offsetLeft;

      const targetScrollPosition = offsetLeft - barWidth;

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
          ref={(el) => (barRefs.current[monthYear] = el)}
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
