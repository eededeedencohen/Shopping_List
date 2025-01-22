// import React from 'react';
// import './CategoryExpensesChart.css';
// import { PieChart, Pie, Cell, Tooltip } from 'recharts';

// // Importing images from the same folder
// import Beverages from './Beverages.png';
// import Dairy from './Dairy.png';
// import Canned from './Canned.png';
// import Snacks from './Snacks.png';
// import Frozen from './Frozen.png';
// import Cleaning from './Cleaning.png';
// import Baking from './Baking.png';
// import Other from './Other.png';

// const CategoryExpensesChart = ({ data, selectedCategory, onCategorySelect }) => {
//   const categoryTotals = data.flatMap((item) => item.products).reduce((acc, product) => {
//     acc[product.category] = (acc[product.category] || 0) + product.totalPrice;
//     return acc;
//   }, {});

//   const COLORS = ['#FF8042', '#FFBB28', '#0088FE', '#00C49F', '#FF6666', '#AA66CC', '#33B5E5', '#FFEB3B'];

//   const chartData = Object.entries(categoryTotals).map(([category, total], index) => ({
//     name: category,
//     value: total,
//     color: COLORS[index % COLORS.length],
//   }));

//   const categoryImages = {
//     'משקאות, יין ואלכוהול': Beverages,
//     'מוצרי חלב וביצים': Dairy,
//     'שימורים': Canned,
//     'פירות וירקות': Snacks,
//     'חטיפים, מתוקים ודגים': Snacks,
//     'מוצרים קפואים': Frozen,
//     'ניקיון ותפנוקים': Cleaning,
//     'בישול ואפייה': Baking,
//     'אחר': Other,
//   };

//   const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2);

//   return (
//     <div className="category-chart-container">
//       <div className="chart-section">
//         <PieChart width={250} height={250}>
//           <Pie
//             data={chartData}
//             dataKey="value"
//             nameKey="name"
//             cx="50%"
//             cy="50%"
//             innerRadius={50}
//             outerRadius={100}
//             fill="#8884d8"
//             stroke="none"
//           >
//             {chartData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <text
//             x="50%"
//             y="50%"
//             textAnchor="middle"
//             dominantBaseline="middle"
//             style={{ fontSize: '16px', fontWeight: 'bold', fill: '#333' }}
//           >
//             ₪{totalExpenses}
//           </text>
//           <Tooltip />
//         </PieChart>
//       </div>
//       <div className="category-list-wrapper">
//         <ul className="category-list">
//           {chartData.map(({ name, value, color }, index) => (
//             <li
//               key={name}
//               className={name === selectedCategory ? 'selected' : ''}
//               onClick={() => onCategorySelect(name)}
//               style={{ borderColor: color }}
//             >
//               <img src={categoryImages[name]} alt={name} className="category-icon" />
//               <div className="category-info">
//                 <span className="category-name">{name}</span>
//                 <span className="category-value">₪{value.toFixed(2)}</span>
//               </div>
//             </li>
//           ))}
//         </ul>
//       </div>
//     </div>
//   );
// };

// export default CategoryExpensesChart;


import React from 'react';
import './CategoryExpensesChart.css';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

import Beverages from './Beverages.png';
import Dairy from './Dairy.png';
import Canned from './Canned.png';
import Snacks from './Snacks.png';
import Frozen from './Frozen.png';
import Cleaning from './Cleaning.png';
import Baking from './Baking.png';
import Other from './Other.png';

const CategoryExpensesChart = ({ data, selectedCategory, onCategorySelect }) => {
  const categoryTotals = data.flatMap((item) => item.products).reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + product.totalPrice;
    return acc;
  }, {});

  const COLORS = ['#FF8042', '#FFBB28', '#0088FE', '#00C49F', '#FF6666', '#AA66CC', '#33B5E5', '#FFEB3B'];

  const chartData = Object.entries(categoryTotals).map(([category, total], index) => ({
    name: category,
    value: total,
    color: COLORS[index % COLORS.length],
  }));

  const categoryImages = {
    'משקאות, יין ואלכוהול': Beverages,
    'מוצרי חלב וביצים': Dairy,
    'שימורים': Canned,
    'פירות וירקות': Snacks,
    'חטיפים, מתוקים ודגים': Snacks,
    'מוצרים קפואים': Frozen,
    'ניקיון ותפנוקים': Cleaning,
    'בישול ואפייה': Baking,
    'אחר': Other,
  };

  const totalExpenses = chartData.reduce((sum, item) => sum + item.value, 0).toFixed(2);

  return (
    <div className="category-chart-container">
      <div className="chart-section">
        <PieChart width={250} height={250}>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={100}
            fill="#8884d8"
            stroke="none"
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
            style={{ fontSize: '16px', fontWeight: 'bold', fill: '#333' }}
          >
            ₪{totalExpenses}
          </text>
          <Tooltip />
        </PieChart>
      </div>
      <div className="category-list-wrapper">
        <ul className="category-list">
          {chartData.map(({ name, value, color }, index) => (
            <li
              key={name}
              className={name === selectedCategory ? 'selected' : ''}
              onClick={() => onCategorySelect(name)}
              style={{ borderColor: color }}
            >
              <img src={categoryImages[name]} alt={name} className="category-icon" />
              <div className="category-info">
                <span className="category-name">{name}</span>
                <span className="category-value">₪{value.toFixed(2)}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CategoryExpensesChart;
