import React from "react";
import "./CategoryExpensesChart.css";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

const CategoryExpensesChart = ({ data, selectedCategory, onCategorySelect }) => {
  const categoryTotals = data.flatMap((item) => item.products).reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.totalPrice;
    console.log(data);
    console.log(selectedCategory);
    return acc;
  }, {});

  const COLORS = ["#FF8042", "#FFBB28", "#0088FE", "#00C49F", "#FF6666"];

  const chartData = Object.entries(categoryTotals).map(([category, total], index) => ({
    name: category,
    value: total,
    color: COLORS[index % COLORS.length],
  }));



  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2);

  return (
    <div className="category-chart-container">

      {/* ההתחלה של החלק שעוטף את התרשים פאי */} 
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
      {/* הסוף של החלק שעוטף את התרשים פאי */} 
      

      <div className="category-list-container">
      <ul className="category-list">
        {chartData.map(({ name, value, color }) => (
          <li
            key={name}
            className={name === selectedCategory ? "selected" : ""}
            onClick={() => onCategorySelect(name)}
            style={{ borderColor: color }}
          >
            <div>{name}</div>
            <div>₪{value.toFixed(2)}</div>
          </li>
        ))}
      </ul>
      </div>

    </div>
  );
};

export default CategoryExpensesChart;
