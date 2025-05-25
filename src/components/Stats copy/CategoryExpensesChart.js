import React, { useRef } from "react";
import "./CategoryExpensesChart.css";
import { PieChart, Pie, Cell, Tooltip } from "recharts";
import CategoryExpensesChartCategory from "./CategoryExpensesChartCategory";

const CategoryExpensesChart = ({ data, selectedCategory, onCategorySelect }) => {
  // חישוב סך המחירים לפי קטגוריה
  const categoryTotals = data
    .flatMap((item) => item.products)
    .reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + product.totalPrice;
      return acc;
    }, {});

  // הגדרת צבעים לסירוגין
  const COLORS = ["#FF8042", "#FFBB28", "#0088FE", "#00C49F", "#FF6666"];

  // הכנת המערך לתרשים הפאי
  const chartData = Object.entries(categoryTotals).map(([category, total], index) => ({
    name: category,
    value: total,
    color: COLORS[index % COLORS.length],
  }));

  // חישוב סך כל ההוצאות
  const totalExpenses = chartData
    .reduce((sum, item) => sum + item.value, 0)
    .toFixed(2);

  // נגדיר רפרנס לקונטיינר של הרשימה
  const containerRef = useRef(null);

  return (
    <div className="category-chart-container">
      {/* תרשים הפאי */}
      <div className="chart-section">
        <PieChart width={150} height={150}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            style={{ fontSize: "16px", fontWeight: "bold" }}
          >
            ₪{totalExpenses}
          </text>
        </PieChart>
        <Tooltip />
      </div>

      {/* הרשימה של הקטגוריות */}
      <div className="category-list-container" ref={containerRef}>
        {chartData.map(({ name, value, color }) => (
          <CategoryExpensesChartCategory
            key={name}
            name={name}
            value={value}
            color={color}
            isSelected={name === selectedCategory}
            onClick={() => onCategorySelect(name)}
            containerRef={containerRef}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryExpensesChart;
