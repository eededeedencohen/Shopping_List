// CategoryExpensesChart.css:
// .donut-chart {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     gap: 10px;
//     background-color: #fff;
//     border: 1px solid #ddd;
//     border-radius: 10px;
//     padding: 20px;
//   }
  
//   .donut-chart h2 {
//     color: #333;
//   }
  
//   .donut-chart ul {
//     display: flex;
//     flex-direction: column;
//     gap: 8px;
//     padding: 0;
//     list-style: none;
//     width: 100%;
//     max-width: 400px;
//   }
  
//   .donut-chart li {
//     display: flex;
//     justify-content: space-between;
//     padding: 10px;
//     background-color: #f0f8ff;
//     border-radius: 5px;
//     cursor: pointer;
//     transition: background-color 0.3s ease-in-out;
//   }
  
//   .donut-chart li:hover {
//     background-color: #b0e0e6;
//   }
  
//   .donut-chart li.selected {
//     background-color: #008080;
//     color: #fff;
//     font-weight: bold;
//   }
  
//   button {
//     margin-top: 10px;
//     padding: 8px 15px;
//     border: none;
//     border-radius: 5px;
//     background-color: #008080;
//     color: #fff;
//     cursor: pointer;
//     transition: background-color 0.3s ease;
//   }
  
//   button:hover {
//     background-color: #006666;
//   }
  

//   CategoryExpensesChart.js:
//   import React from 'react';
//   import './CategoryExpensesChart.css';
  
//   const CategoryExpensesChart = ({
//     data,
//     selectedCategory,
//     onCategorySelect,
//   }) => {
//     // חישוב הסכום לפי קטגוריה
//     const categoryTotals = data.flatMap((item) => item.products).reduce((acc, product) => {
//       acc[product.category] = (acc[product.category] || 0) + product.totalPrice;
//       return acc;
//     }, {});
  
//     return (
//       <div className="donut-chart">
//         <h2>הוצאות לפי קטגוריות</h2>
//         <ul>
//           {Object.entries(categoryTotals).map(([category, total]) => (
//             <li
//               key={category}
//               className={category === selectedCategory ? 'selected' : ''}
//               onClick={() => onCategorySelect(category)}
//             >
//               {category}: ₪{total.toFixed(2)}
//             </li>
//           ))}
//         </ul>
//         <button onClick={() => onCategorySelect('All Categories')}>
//           הצג את הכל
//         </button>
//       </div>
//     );
//   };
  
//   export default CategoryExpensesChart;
  

//   ExpenseBreakdownList.css:
//   .expense-breakdown-list {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     background-color: #fff;
//     border: 1px solid #ddd;
//     border-radius: 10px;
//     padding: 20px;
//   }
  
//   .expense-breakdown-list h2 {
//     color: #333;
//   }
  
//   .expense-breakdown-list ul {
//     display: flex;
//     flex-direction: column;
//     gap: 10px;
//     width: 100%;
//     max-width: 400px;
//     list-style: none;
//     padding: 0;
//   }
  
//   .expense-breakdown-list li {
//     display: flex;
//     justify-content: space-between;
//     padding: 10px;
//     background-color: #f0f8ff;
//     border-radius: 5px;
//     transition: background-color 0.3s ease-in-out;
//   }
  
//   .expense-breakdown-list li:hover {
//     background-color: #b0e0e6;
//   }
  
//   ExpenseBreakdownList.js:
//   import React from 'react';
//   import './ExpenseBreakdownList.css';
  
//   const ExpenseBreakdownList = ({ data, selectedCategory }) => {
//     const products = data.flatMap((item) =>
//       item.products.filter(
//         (product) =>
//           selectedCategory === 'All Categories' ||
//           product.category === selectedCategory
//       )
//     );
  
//     return (
//       <div className="expense-breakdown-list">
//         <h2>פירוט מוצרים</h2>
//         <ul>
//           {products.map((product, index) => (
//             <li key={index}>
//               {product.name} - ₪{product.totalPrice.toFixed(2)} ({product.category})
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   };
  
//   export default ExpenseBreakdownList;
  
// ExpenseOverview.css:
// .expense-overview {
//     display: flex;
//     flex-direction: column;
//     gap: 20px;
//     padding: 20px;
//     background-color: #f5f5f5;
//     font-family: Arial, sans-serif;
//   }
  
//   .expense-overview h1 {
//     text-align: center;
//     font-size: 2rem;
//     color: #333;
//   }
  
// ExpenseOverview.js:
// import React, { useState } from 'react';
// import MonthlyExpensesBarChart from './MonthlyExpensesBarChart';
// import CategoryExpensesChart from './CategoryExpensesChart';
// import ExpenseBreakdownList from './ExpenseBreakdownList';
// import './ExpenseOverview.css';

// // היסטוריית ההוצאות
// const data = [
//     {
//         "_id": "648e5c2aa7026e658979d2c5",
//         "products": [
//             {
//                 "barcode": "7290110328627",
//                 "amount": 2,
//                 "name": "יוגורט גו בננה קרמל",
//                 "brand": "יופלה גו",
//                 "totalPrice": 9.4,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "648e5c2aa7026e658979d2c6",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "3029815",
//                 "amount": 4,
//                 "name": "חלב מועשר 3% בקבוק",
//                 "brand": "no brand",
//                 "totalPrice": 47.6,
//                 "generalName": "Milk",
//                 "weight": 2,
//                 "unit": "l",
//                 "_id": "648e5c2aa7026e658979d2c7",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "57088",
//                 "amount": 4,
//                 "name": "גבינה צהובה עמק דק דק 28%",
//                 "brand": "no brand",
//                 "totalPrice": 55.6,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "648e5c2aa7026e658979d2c8",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "7290102398065",
//                 "amount": 3,
//                 "name": "חלב 3% קרטון",
//                 "brand": "no brand",
//                 "totalPrice": 32.7,
//                 "generalName": "Milk",
//                 "weight": 2,
//                 "unit": "l",
//                 "_id": "648e5c2aa7026e658979d2c9",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-06-18T01:21:46.248Z",
//         "supermarketName": "שערי רווחה",
//         "supermarketAddress": "25 ירמיהו",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 145.3
//     },
//     {
//         "_id": "648e0eb19125bfc7d32ab984",
//         "products": [
//             {
//                 "barcode": "7290110328764",
//                 "amount": 2,
//                 "name": "יוגורט גו תות",
//                 "brand": "Go",
//                 "totalPrice": 9.4,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "648e0eb19125bfc7d32ab985",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290100850916",
//                 "amount": 3,
//                 "name": "דוריטוס חמוץ חריף",
//                 "brand": "דוריטוס",
//                 "totalPrice": 8.7,
//                 "generalName": "Doritos",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "648e0eb19125bfc7d32ab986",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             },
//             {
//                 "barcode": "4131074",
//                 "amount": 5,
//                 "name": "חלב בקרטון 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 31,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "648e0eb19125bfc7d32ab987",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290014760912",
//                 "amount": 4,
//                 "name": "גבינה גוש חלב פרוס 28%",
//                 "brand": "no brand",
//                 "totalPrice": 103.6,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "648e0eb19125bfc7d32ab988",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-06-17T19:51:13.241Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "בית הדפוס 29",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 152.7
//     },
//     {
//         "_id": "648e16e06f6e7b4421d13518",
//         "products": [
//             {
//                 "barcode": "42435",
//                 "amount": 4,
//                 "name": "חלב בקרטון 1%",
//                 "brand": "תנובה",
//                 "totalPrice": 19.6,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "648e16e06f6e7b4421d13519",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "4131074",
//                 "amount": 3,
//                 "name": "חלב בקרטון 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 17.700000000000003,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "648e16e06f6e7b4421d1351a",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290010117864",
//                 "amount": 2,
//                 "name": "דוריטוס חריף אש",
//                 "brand": "דוריטוס",
//                 "totalPrice": 5.6,
//                 "generalName": "Doritos",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "648e16e06f6e7b4421d1351b",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-06-17T20:26:08.559Z",
//         "supermarketName": "שערי רווחה",
//         "supermarketAddress": "לואיס ברנדס 3",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 42.9
//     },
//     {
//         "_id": "652b2d756d716685f14aed11",
//         "products": [
//             {
//                 "barcode": "7290014760912",
//                 "amount": 50,
//                 "name": "גבינה גוש חלב פרוס 28%",
//                 "brand": "no brand",
//                 "totalPrice": 1370,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "652b2d756d716685f14aed12",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "42435",
//                 "amount": 3,
//                 "name": "חלב בקרטון 1%",
//                 "brand": "תנובה",
//                 "totalPrice": 17.580000000000002,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "652b2d756d716685f14aed13",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290100850909",
//                 "amount": 17,
//                 "name": "דוריטוס נאצ'ו",
//                 "brand": "דוריטוס",
//                 "totalPrice": 68,
//                 "generalName": "Doritos",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "652b2d756d716685f14aed14",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             },
//             {
//                 "barcode": "40974",
//                 "amount": 1,
//                 "name": "חלב דל לקטוז 2% קרטון",
//                 "brand": "no brand",
//                 "totalPrice": 7.2,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "652b2d756d716685f14aed15",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290010259977",
//                 "amount": 22,
//                 "name": "שמן קנולה",
//                 "brand": "וילי פוד",
//                 "totalPrice": 217.8,
//                 "generalName": "Canola oil",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "652b2d756d716685f14aed16",
//                 "category": "Other",
//                 "subcategory": "Other"
//             },
//             {
//                 "barcode": "72940761",
//                 "amount": 0,
//                 "name": "מילקי בטעם שוקולד",
//                 "brand": "no brand",
//                 "totalPrice": 0,
//                 "generalName": "Milky",
//                 "weight": 0.17,
//                 "unit": "l",
//                 "_id": "652b2d756d716685f14aed17",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-10-15T00:08:21.329Z",
//         "supermarketName": "Carrefour city (קרפור סיטי)",
//         "supermarketAddress": "אבי זהר",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 1680.58
//     },
//     {
//         "_id": "652b2e146d716685f14af0fd",
//         "products": [
//             {
//                 "barcode": "40974",
//                 "amount": 4,
//                 "name": "חלב דל לקטוז 2% קרטון",
//                 "brand": "no brand",
//                 "totalPrice": 27.2,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "652b2e146d716685f14af0fe",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-10-15T00:11:00.080Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "פייר קניג 26",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 27.2
//     },
//     {
//         "_id": "655b60b0b385bde4619bcbd6",
//         "products": [
//             {
//                 "barcode": "7290110328627",
//                 "amount": 26,
//                 "name": "יוגורט גו בננה קרמל",
//                 "brand": "יופלה גו",
//                 "totalPrice": 130,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "655b60b0b385bde4619bcbd7",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "66172",
//                 "amount": 7,
//                 "name": "ביסלי פיצה",
//                 "brand": "ביסלי",
//                 "totalPrice": 24.58,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "655b60b0b385bde4619bcbd8",
//                 "category": "Other",
//                 "subcategory": "Other"
//             },
//             {
//                 "barcode": "7290014760448",
//                 "amount": 7,
//                 "name": "גבינת גלבוע 22%",
//                 "brand": "no brand",
//                 "totalPrice": 182,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "655b60b0b385bde4619bcbd9",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "40974",
//                 "amount": 4,
//                 "name": "חלב דל לקטוז 2% קרטון",
//                 "brand": "no brand",
//                 "totalPrice": 31.2,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "655b60b0b385bde4619bcbda",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "8693134",
//                 "amount": 5,
//                 "name": "דניאלה תות מוקצף 5%",
//                 "brand": "דניאלה",
//                 "totalPrice": 20.5,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "655b60b0b385bde4619bcbdb",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290112339171",
//                 "amount": 3,
//                 "name": "מילקי מוס שוקולד",
//                 "brand": "no brand",
//                 "totalPrice": 11.100000000000001,
//                 "generalName": "Milky",
//                 "weight": 0.17,
//                 "unit": "l",
//                 "_id": "655b60b0b385bde4619bcbdc",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290112343499",
//                 "amount": 2,
//                 "name": "puffs צ'יטוס גבינה",
//                 "brand": "צ'יטוס",
//                 "totalPrice": 7.2,
//                 "generalName": "Cheetos",
//                 "weight": 55,
//                 "unit": "g",
//                 "_id": "655b60b0b385bde4619bcbdd",
//                 "category": "Other",
//                 "subcategory": "Other"
//             },
//             {
//                 "barcode": "307220",
//                 "amount": 2,
//                 "name": "גרעיני תירס מתוק",
//                 "brand": "פרי הגליל",
//                 "totalPrice": 12,
//                 "generalName": "Olives",
//                 "weight": 285,
//                 "unit": "g",
//                 "_id": "655b60b0b385bde4619bcbde",
//                 "category": "שימורים",
//                 "subcategory": "זיתים"
//             },
//             {
//                 "barcode": "42435",
//                 "amount": 2,
//                 "name": "חלב בקרטון 1%",
//                 "brand": "תנובה",
//                 "totalPrice": 12.7,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "655b60b0b385bde4619bcbdf",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "72940761",
//                 "amount": 1,
//                 "name": "מילקי בטעם שוקולד",
//                 "brand": "no brand",
//                 "totalPrice": 3.1,
//                 "generalName": "Milky",
//                 "weight": 0.17,
//                 "unit": "l",
//                 "_id": "655b60b0b385bde4619bcbe0",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290100850923",
//                 "amount": 13,
//                 "name": "דוריטוס גריל",
//                 "brand": "דוריטוס",
//                 "totalPrice": 48.04,
//                 "generalName": "Doritos",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "655b60b0b385bde4619bcbe1",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T13:35:44.739Z",
//         "supermarketName": "שופרסל דיל",
//         "supermarketAddress": "האומן 17",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 482.42
//     },
//     {
//         "_id": "655b641bb385bde4619bd237",
//         "products": [
//             {
//                 "barcode": "7290100850923",
//                 "amount": 18,
//                 "name": "דוריטוס גריל",
//                 "brand": "דוריטוס",
//                 "totalPrice": 142.20000000000002,
//                 "generalName": "Doritos",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "655b641bb385bde4619bd238",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T13:50:19.153Z",
//         "supermarketName": "מיני סופר אלונית",
//         "supermarketAddress": "היצירה 1",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 142.2
//     },
//     {
//         "_id": "655b644bb385bde4619bd4c1",
//         "products": [
//             {
//                 "barcode": "42435",
//                 "amount": 5,
//                 "name": "חלב בקרטון 1%",
//                 "brand": "תנובה",
//                 "totalPrice": 24.5,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "655b644bb385bde4619bd4c2",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T13:51:07.061Z",
//         "supermarketName": "שערי רווחה",
//         "supermarketAddress": "לואיס ברנדס 3",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 24.5
//     },
//     {
//         "_id": "655b6555b385bde4619bdb9d",
//         "products": [
//             {
//                 "barcode": "4122195",
//                 "amount": 8,
//                 "name": "פרוסות גבינה חצי קשה 28%",
//                 "brand": "no brand",
//                 "totalPrice": 103.2,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "655b6555b385bde4619bdb9e",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "4131074",
//                 "amount": 6,
//                 "name": "חלב בקרטון 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 35.400000000000006,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "655b6555b385bde4619bdb9f",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T13:55:33.838Z",
//         "supermarketName": "שערי רווחה",
//         "supermarketAddress": "לואיס ברנדס 3",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 138.6
//     },
//     {
//         "_id": "655b6af3b385bde4619be053",
//         "products": [
//             {
//                 "barcode": "4122195",
//                 "amount": 4,
//                 "name": "פרוסות גבינה חצי קשה 28%",
//                 "brand": "no brand",
//                 "totalPrice": 51.6,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "655b6af3b385bde4619be054",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "72940761",
//                 "amount": 2,
//                 "name": "מילקי בטעם שוקולד",
//                 "brand": "no brand",
//                 "totalPrice": 5,
//                 "generalName": "Milky",
//                 "weight": 0.17,
//                 "unit": "l",
//                 "_id": "655b6af3b385bde4619be055",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T14:19:31.575Z",
//         "supermarketName": "יש חסד",
//         "supermarketAddress": "כנפי נשרים 24",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 56.6
//     },
//     {
//         "_id": "655b6ce5b385bde4619beded",
//         "products": [
//             {
//                 "barcode": "72940761",
//                 "amount": 9,
//                 "name": "מילקי בטעם שוקולד",
//                 "brand": "no brand",
//                 "totalPrice": 22.5,
//                 "generalName": "Milky",
//                 "weight": 0.17,
//                 "unit": "l",
//                 "_id": "655b6ce5b385bde4619bedee",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T14:27:49.417Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "שמגר 16",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 22.5
//     },
//     {
//         "_id": "655b6d36b385bde4619bf074",
//         "products": [
//             {
//                 "barcode": "66141",
//                 "amount": 9,
//                 "name": "ביסלי גריל",
//                 "brand": "ביסלי",
//                 "totalPrice": 17.099999999999998,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "655b6d36b385bde4619bf075",
//                 "category": "Other",
//                 "subcategory": "Other"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T14:29:10.498Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "בית הדפוס 29",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 17.1
//     },
//     {
//         "_id": "655b6e4ab385bde4619bf2d9",
//         "products": [
//             {
//                 "barcode": "8693134",
//                 "amount": 7,
//                 "name": "דניאלה תות מוקצף 5%",
//                 "brand": "דניאלה",
//                 "totalPrice": 27.3,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "655b6e4ab385bde4619bf2da",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T14:33:46.879Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "פייר קניג 26",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 27.3
//     },
//     {
//         "_id": "655b6e97b385bde4619bf7de",
//         "products": [
//             {
//                 "barcode": "8693134",
//                 "amount": 6,
//                 "name": "דניאלה תות מוקצף 5%",
//                 "brand": "דניאלה",
//                 "totalPrice": 23.4,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "655b6e97b385bde4619bf7df",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "111360",
//                 "amount": 6,
//                 "name": "חרדל אמיתי",
//                 "brand": "תלמה",
//                 "totalPrice": 35.400000000000006,
//                 "generalName": "Mustard",
//                 "weight": 250,
//                 "unit": "g",
//                 "_id": "655b6e97b385bde4619bf7e0",
//                 "category": "בישול ואפייה",
//                 "subcategory": "רטבים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-20T14:35:03.673Z",
//         "supermarketName": "יוחננוף",
//         "supermarketAddress": "האומן 10",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 58.8
//     },
//     {
//         "_id": "656012266e6c1c3bb4d1a841",
//         "products": [
//             {
//                 "barcode": "72940761",
//                 "amount": 11,
//                 "name": "מילקי בטעם שוקולד",
//                 "brand": "no brand",
//                 "totalPrice": 34.1,
//                 "generalName": "Milky",
//                 "weight": 0.17,
//                 "unit": "l",
//                 "_id": "656012266e6c1c3bb4d1a842",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290014760912",
//                 "amount": 12,
//                 "name": "גבינה גוש חלב פרוס 28%",
//                 "brand": "no brand",
//                 "totalPrice": 340.79999999999995,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "656012266e6c1c3bb4d1a843",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "7290106528567",
//                 "amount": 9,
//                 "name": "דוריטוס גריל",
//                 "brand": "דוריטוס",
//                 "totalPrice": 82.8,
//                 "generalName": "Doritos",
//                 "weight": 185,
//                 "unit": "g",
//                 "_id": "656012266e6c1c3bb4d1a844",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             },
//             {
//                 "barcode": "8714599513866",
//                 "amount": 8,
//                 "name": "קפה נמס קרוננג ירוק",
//                 "brand": "גקובס",
//                 "totalPrice": 247.2,
//                 "generalName": "Instant Coffee",
//                 "weight": 200,
//                 "unit": "g",
//                 "_id": "656012266e6c1c3bb4d1a845",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "קפה"
//             },
//             {
//                 "barcode": "7296073484059",
//                 "amount": 5,
//                 "name": "שמן סויה שופרסל",
//                 "brand": "שופרסל",
//                 "totalPrice": 59.5,
//                 "generalName": "Soya oil",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "656012266e6c1c3bb4d1a846",
//                 "category": "בישול ואפייה",
//                 "subcategory": "שמן"
//             },
//             {
//                 "barcode": "7290013268990",
//                 "amount": 7,
//                 "name": "מרכך כביסה מרוכז ביו",
//                 "brand": "מקסימה",
//                 "totalPrice": 139.29999999999998,
//                 "generalName": "Fabric softener",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "656012266e6c1c3bb4d1a847",
//                 "category": "ניקיון וחד פעמי",
//                 "subcategory": "מרכך כביסה"
//             },
//             {
//                 "barcode": "7290107932080",
//                 "amount": 3,
//                 "name": "חלב מועשר 3% בקבוק",
//                 "brand": "no brand",
//                 "totalPrice": 24.900000000000002,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "656012266e6c1c3bb4d1a848",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "42015",
//                 "amount": 8,
//                 "name": "חלב בשקית 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 47.12,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "656012266e6c1c3bb4d1a849",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290110328627",
//                 "amount": 8,
//                 "name": "יוגורט גו בננה קרמל",
//                 "brand": "יופלה גו",
//                 "totalPrice": 40,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "656012266e6c1c3bb4d1a84a",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "66141",
//                 "amount": 3,
//                 "name": "ביסלי גריל",
//                 "brand": "ביסלי",
//                 "totalPrice": 14.399999999999999,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "656012266e6c1c3bb4d1a84b",
//                 "category": "Other",
//                 "subcategory": "Other"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-24T03:01:58.435Z",
//         "supermarketName": "שופרסל שלי",
//         "supermarketAddress": "בורלא 1 ",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 1030.12
//     },
//     {
//         "_id": "6560ccd5e48a0bbe0d278757",
//         "products": [
//             {
//                 "barcode": "66141",
//                 "amount": 13,
//                 "name": "ביסלי גריל",
//                 "brand": "ביסלי",
//                 "totalPrice": 24.7,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "6560ccd5e48a0bbe0d278758",
//                 "category": "Other",
//                 "subcategory": "Other"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-24T16:18:29.187Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "בית הדפוס 29",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 24.7
//     },
//     {
//         "_id": "6560d6f816f1c9a636195b74",
//         "products": [
//             {
//                 "barcode": "72940761",
//                 "amount": 2,
//                 "name": "מילקי בטעם שוקולד",
//                 "brand": "no brand",
//                 "totalPrice": 5,
//                 "generalName": "Milky",
//                 "weight": 0.17,
//                 "unit": "l",
//                 "_id": "6560d6f816f1c9a636195b75",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-24T17:01:44.147Z",
//         "supermarketName": "שערי רווחה",
//         "supermarketAddress": "לואיס ברנדס 3",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 5
//     },
//     {
//         "_id": "6560d85c16f1c9a636195d27",
//         "products": [
//             {
//                 "barcode": "66141",
//                 "amount": 6,
//                 "name": "ביסלי גריל",
//                 "brand": "ביסלי",
//                 "totalPrice": 18,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "6560d85c16f1c9a636195d28",
//                 "category": "Other",
//                 "subcategory": "Other"
//             },
//             {
//                 "barcode": "42435",
//                 "amount": 2,
//                 "name": "חלב בקרטון 1%",
//                 "brand": "תנובה",
//                 "totalPrice": 9.8,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6560d85c16f1c9a636195d29",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-24T17:07:40.963Z",
//         "supermarketName": "שערי רווחה",
//         "supermarketAddress": "לואיס ברנדס 3",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 27.8
//     },
//     {
//         "_id": "6560d86d16f1c9a636195d45",
//         "products": [
//             {
//                 "barcode": "40974",
//                 "amount": 3,
//                 "name": "חלב דל לקטוז 2% קרטון",
//                 "brand": "no brand",
//                 "totalPrice": 20.700000000000003,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6560d86d16f1c9a636195d46",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-24T17:07:57.488Z",
//         "supermarketName": "שערי רווחה",
//         "supermarketAddress": "לואיס ברנדס 3",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 20.700000000000003
//     },
//     {
//         "_id": "6560e3e216f1c9a636195de4",
//         "products": [],
//         "userID": "1",
//         "date": "2023-11-24T17:56:50.194Z",
//         "supermarketName": "שירה מרקט",
//         "supermarketAddress": "אבא אבן 14",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 0
//     },
//     {
//         "_id": "6560e3e216f1c9a636195de6",
//         "products": [],
//         "userID": "1",
//         "date": "2023-11-24T17:56:50.234Z",
//         "supermarketName": "שירה מרקט",
//         "supermarketAddress": "אבא אבן 14",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 0
//     },
//     {
//         "_id": "6560e72e16f1c9a636195f28",
//         "products": [
//             {
//                 "barcode": "66141",
//                 "amount": 2,
//                 "name": "ביסלי גריל",
//                 "brand": "ביסלי",
//                 "totalPrice": 3.8,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "6560e72e16f1c9a636195f29",
//                 "category": "Other",
//                 "subcategory": "Other"
//             },
//             {
//                 "barcode": "42015",
//                 "amount": 2,
//                 "name": "חלב בשקית 3%",
//                 "brand": "תנובה",
//                 "totalPrice": -1,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6560e72e16f1c9a636195f2a",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-24T18:10:54.216Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "בית הדפוס 29",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 2.8
//     },
//     {
//         "_id": "65612fa3c157e0715efbdc5b",
//         "products": [
//             {
//                 "barcode": "4131074",
//                 "amount": 5,
//                 "name": "חלב בקרטון 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 31,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "65612fa3c157e0715efbdc5c",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "57118",
//                 "amount": 3,
//                 "name": "גבינת עמק פרוסה 28%",
//                 "brand": "no brand",
//                 "totalPrice": 49.9,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "65612fa3c157e0715efbdc5d",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "307220",
//                 "amount": 3,
//                 "name": "גרעיני תירס מתוק",
//                 "brand": "פרי הגליל",
//                 "totalPrice": -1,
//                 "generalName": "Olives",
//                 "weight": 285,
//                 "unit": "g",
//                 "_id": "65612fa3c157e0715efbdc5e",
//                 "category": "שימורים",
//                 "subcategory": "זיתים"
//             },
//             {
//                 "barcode": "7290010259977",
//                 "amount": 3,
//                 "name": "שמן קנולה",
//                 "brand": "וילי פוד",
//                 "totalPrice": -1,
//                 "generalName": "Canola oil",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "65612fa3c157e0715efbdc5f",
//                 "category": "Other",
//                 "subcategory": "Other"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-24T23:20:03.068Z",
//         "supermarketName": "אושר עד",
//         "supermarketAddress": "בית הדפוס 29",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 78.9
//     },
//     {
//         "_id": "656233f224ae3991a6296c26",
//         "products": [
//             {
//                 "barcode": "42015",
//                 "amount": 5,
//                 "name": "חלב בשקית 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 29.45,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "656233f224ae3991a6296c27",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290100850923",
//                 "amount": 8,
//                 "name": "דוריטוס גריל",
//                 "brand": "דוריטוס",
//                 "totalPrice": 28.98,
//                 "generalName": "Doritos",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "656233f224ae3991a6296c28",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             },
//             {
//                 "barcode": "211169",
//                 "amount": 5,
//                 "name": "אורז תאילנדי קלאסי",
//                 "brand": "סוגת",
//                 "totalPrice": 34.5,
//                 "generalName": "Rice",
//                 "weight": 1,
//                 "unit": "kg",
//                 "_id": "656233f224ae3991a6296c29",
//                 "category": "בישול ואפייה",
//                 "subcategory": "אורז"
//             },
//             {
//                 "barcode": "5413149655522",
//                 "amount": 2,
//                 "name": "אבקת כביסה שושן צחור",
//                 "brand": "אריאל",
//                 "totalPrice": 29.8,
//                 "generalName": "Washing Powder",
//                 "weight": 1,
//                 "unit": "kg",
//                 "_id": "656233f224ae3991a6296c2a",
//                 "category": "ניקיון וחד פעמי",
//                 "subcategory": "אבקות כביסה"
//             },
//             {
//                 "barcode": "66141",
//                 "amount": 7,
//                 "name": "ביסלי גריל",
//                 "brand": "ביסלי",
//                 "totalPrice": 24.48,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "656233f224ae3991a6296c2b",
//                 "category": "Other",
//                 "subcategory": "Other"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-25T17:50:42.555Z",
//         "supermarketName": "ויקטורי",
//         "supermarketAddress": "דרך אגודת הספורט מכבי 1",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 147.21
//     },
//     {
//         "_id": "6562391c5ec2b074323993c3",
//         "products": [
//             {
//                 "barcode": "7290014760912",
//                 "amount": 5,
//                 "name": "גבינה גוש חלב פרוס 28%",
//                 "brand": "no brand",
//                 "totalPrice": 141.5,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "6562391c5ec2b074323993c4",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "7290115201727",
//                 "amount": 3,
//                 "name": "ביסלי בצל",
//                 "brand": "ביסלי",
//                 "totalPrice": 21.9,
//                 "generalName": "Bissli",
//                 "weight": 200,
//                 "unit": "g",
//                 "_id": "6562391c5ec2b074323993c5",
//                 "category": "Other",
//                 "subcategory": "Other"
//             },
//             {
//                 "barcode": "42015",
//                 "amount": 2,
//                 "name": "חלב בשקית 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 11.78,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6562391c5ec2b074323993c6",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7296073484059",
//                 "amount": 2,
//                 "name": "שמן סויה שופרסל",
//                 "brand": "שופרסל",
//                 "totalPrice": 21.8,
//                 "generalName": "Soya oil",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6562391c5ec2b074323993c7",
//                 "category": "בישול ואפייה",
//                 "subcategory": "שמן"
//             },
//             {
//                 "barcode": "7290106576513",
//                 "amount": 5,
//                 "name": "סלט חומוס",
//                 "brand": "צבר",
//                 "totalPrice": 52,
//                 "generalName": "Hummus",
//                 "weight": 400,
//                 "unit": "g",
//                 "_id": "6562391c5ec2b074323993c8",
//                 "category": "Other",
//                 "subcategory": "Other"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-25T18:12:44.358Z",
//         "supermarketName": "שופרסל דיל",
//         "supermarketAddress": "שח\"ל 79",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 248.98000000000002
//     },
//     {
//         "_id": "65636591c8c97cb9a90d17f6",
//         "products": [
//             {
//                 "barcode": "66172",
//                 "amount": 7,
//                 "name": "ביסלי פיצה",
//                 "brand": "ביסלי",
//                 "totalPrice": 27.3,
//                 "generalName": "Bissli",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "65636591c8c97cb9a90d17f7",
//                 "category": "Other",
//                 "subcategory": "Other"
//             },
//             {
//                 "barcode": "7290103401429",
//                 "amount": 5,
//                 "name": "קפה ברזילאי עלית",
//                 "brand": "קפה עלית",
//                 "totalPrice": 98.5,
//                 "generalName": "Instant Coffee",
//                 "weight": 200,
//                 "unit": "g",
//                 "_id": "65636591c8c97cb9a90d17f8",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "קפה"
//             },
//             {
//                 "barcode": "1817377",
//                 "amount": 4,
//                 "name": "צ'יטוס איקס עיגול פיצה",
//                 "brand": "צ'יטוס",
//                 "totalPrice": 12.4,
//                 "generalName": "Cheetos",
//                 "weight": 80,
//                 "unit": "g",
//                 "_id": "65636591c8c97cb9a90d17f9",
//                 "category": "Other",
//                 "subcategory": "Other"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-11-26T15:34:41.195Z",
//         "supermarketName": "רמי לוי",
//         "supermarketAddress": "איזור תעשיה עטרות",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 138.2
//     },
//     {
//         "_id": "6587568130046d3609100ced",
//         "products": [
//             {
//                 "barcode": "7290105500151",
//                 "amount": 1,
//                 "name": "וודקה פינלנדיה",
//                 "brand": "פינלנדיה",
//                 "totalPrice": 64.9,
//                 "generalName": "Vodka",
//                 "weight": 700,
//                 "unit": "ml",
//                 "_id": "6587568130046d3609100cee",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "משקאות חריפים"
//             },
//             {
//                 "barcode": "5838002",
//                 "amount": 8,
//                 "name": "דניאלה וניל מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 31.2,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "6587568130046d3609100cef",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290002929642",
//                 "amount": 1,
//                 "name": "טונה ויליגר בשמן",
//                 "brand": "ויליגר",
//                 "totalPrice": 21.8,
//                 "generalName": "tuna",
//                 "weight": 560,
//                 "unit": "g",
//                 "_id": "6587568130046d3609100cf0",
//                 "category": "שימורים",
//                 "subcategory": "טונה"
//             },
//             {
//                 "barcode": "7290015366670",
//                 "amount": 3,
//                 "name": "משחת שיניים מנטה מרענן",
//                 "brand": "אקווה פרש",
//                 "totalPrice": 23.700000000000003,
//                 "generalName": "toothpaste",
//                 "weight": 100,
//                 "unit": "ml",
//                 "_id": "6587568130046d3609100cf1",
//                 "category": "פארם ותינוקות",
//                 "subcategory": "משחת שיניים"
//             },
//             {
//                 "barcode": "4122195",
//                 "amount": 2,
//                 "name": "פרוסות גבינה חצי קשה 28%",
//                 "brand": "no brand",
//                 "totalPrice": 29.2,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "6587568130046d3609100cf2",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "7290110328788",
//                 "amount": 1,
//                 "name": "יוגורט גו אפקסק",
//                 "brand": "Go",
//                 "totalPrice": 4.7,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "6587568130046d3609100cf3",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "57088",
//                 "amount": 4,
//                 "name": "גבינה צהובה עמק דק דק 28%",
//                 "brand": "no brand",
//                 "totalPrice": 66.8,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "6587568130046d3609100cf4",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "40974",
//                 "amount": 3,
//                 "name": "חלב דל לקטוז 2% קרטון",
//                 "brand": "no brand",
//                 "totalPrice": 20.700000000000003,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6587568130046d3609100cf5",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290014760912",
//                 "amount": 3,
//                 "name": "גבינה גוש חלב פרוס 28%",
//                 "brand": "no brand",
//                 "totalPrice": 82.19999999999999,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "6587568130046d3609100cf6",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "72940952",
//                 "amount": 3,
//                 "name": "מילקי אקסטרה קצפת",
//                 "brand": "no brand",
//                 "totalPrice": 10.5,
//                 "generalName": "Milky",
//                 "weight": 170,
//                 "unit": "ml",
//                 "_id": "6587568130046d3609100cf7",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "8693134",
//                 "amount": 1,
//                 "name": "דניאלה תות מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 3.9,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "6587568130046d3609100cf8",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "3029815",
//                 "amount": 13,
//                 "name": "חלב מועשר 3% בקבוק",
//                 "brand": "no brand",
//                 "totalPrice": 179.4,
//                 "generalName": "Milk",
//                 "weight": 2,
//                 "unit": "l",
//                 "_id": "6587568130046d3609100cf9",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-12-23T21:52:01.263Z",
//         "supermarketName": "רמי לוי",
//         "supermarketAddress": "בית הדפוס 13",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 539
//     },
//     {
//         "_id": "6589cd821c1dddd516fe95ca",
//         "products": [
//             {
//                 "barcode": "5838002",
//                 "amount": 22,
//                 "name": "דניאלה וניל מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 85.8,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "6589cd821c1dddd516fe95cb",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "72940952",
//                 "amount": 5,
//                 "name": "מילקי אקסטרה קצפת",
//                 "brand": "no brand",
//                 "totalPrice": 17.5,
//                 "generalName": "Milky",
//                 "weight": 170,
//                 "unit": "ml",
//                 "_id": "6589cd821c1dddd516fe95cc",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290110328788",
//                 "amount": 4,
//                 "name": "יוגורט גו אפקסק",
//                 "brand": "Go",
//                 "totalPrice": 18.8,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "6589cd821c1dddd516fe95cd",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "57118",
//                 "amount": 4,
//                 "name": "גבינת עמק פרוסה 28%",
//                 "brand": "no brand",
//                 "totalPrice": 94,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.4,
//                 "unit": "kg",
//                 "_id": "6589cd821c1dddd516fe95ce",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "8693134",
//                 "amount": 3,
//                 "name": "דניאלה תות מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 11.7,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "6589cd821c1dddd516fe95cf",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "4131074",
//                 "amount": 4,
//                 "name": "חלב בקרטון 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 26.88,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6589cd821c1dddd516fe95d0",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "4122195",
//                 "amount": 1,
//                 "name": "פרוסות גבינה חצי קשה 28%",
//                 "brand": "no brand",
//                 "totalPrice": 14.6,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "6589cd821c1dddd516fe95d1",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "7290107932080",
//                 "amount": 3,
//                 "name": "חלב מועשר 3% בקבוק",
//                 "brand": "no brand",
//                 "totalPrice": 23.700000000000003,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6589cd821c1dddd516fe95d2",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "42435",
//                 "amount": 4,
//                 "name": "חלב בקרטון 1%",
//                 "brand": "תנובה",
//                 "totalPrice": 25.2,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "6589cd821c1dddd516fe95d3",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             },
//             {
//                 "barcode": "7290019056058",
//                 "amount": 2,
//                 "name": "מוגז עדין בטעם תפוח ליים",
//                 "brand": "שוופס",
//                 "totalPrice": 12,
//                 "generalName": "Schweppes",
//                 "weight": 1.5,
//                 "unit": "l",
//                 "_id": "6589cd821c1dddd516fe95d4",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "משקאות קלים"
//             },
//             {
//                 "barcode": "7290019056065",
//                 "amount": 2,
//                 "name": "מוגז עדין בטעם פירות יער",
//                 "brand": "שוופס",
//                 "totalPrice": 12,
//                 "generalName": "Schweppes",
//                 "weight": 1.5,
//                 "unit": "l",
//                 "_id": "6589cd821c1dddd516fe95d5",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "משקאות קלים"
//             },
//             {
//                 "barcode": "7290110115296",
//                 "amount": 1,
//                 "name": "'פאנטה אורנג",
//                 "brand": "פאנטה",
//                 "totalPrice": 7.3,
//                 "generalName": "Fanta",
//                 "weight": 1.5,
//                 "unit": "l",
//                 "_id": "6589cd821c1dddd516fe95d6",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "משקאות קלים"
//             },
//             {
//                 "barcode": "7290000176079",
//                 "amount": 5,
//                 "name": "קפה טורקי עם הל",
//                 "brand": "קפה עלית",
//                 "totalPrice": 44.5,
//                 "generalName": "Instant Coffee",
//                 "weight": 100,
//                 "unit": "g",
//                 "_id": "6589cd821c1dddd516fe95d7",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "קפה"
//             },
//             {
//                 "barcode": "46327",
//                 "amount": 2,
//                 "name": "גבינת גלבוע 22%",
//                 "brand": "no brand",
//                 "totalPrice": 27.8,
//                 "generalName": "Yellow cheese",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "6589cd821c1dddd516fe95d8",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "גבינות"
//             },
//             {
//                 "barcode": "7290100850916",
//                 "amount": 2,
//                 "name": "דוריטוס חמוץ חריף",
//                 "brand": "דוריטוס",
//                 "totalPrice": 7.2,
//                 "generalName": "Doritos",
//                 "weight": 70,
//                 "unit": "g",
//                 "_id": "6589cd821c1dddd516fe95d9",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים"
//             },
//             {
//                 "barcode": "7290002627098",
//                 "amount": 2,
//                 "name": "פיצה ביס",
//                 "brand": "שלושת האופים",
//                 "totalPrice": 29.8,
//                 "generalName": "Pizza",
//                 "weight": 350,
//                 "unit": "g",
//                 "_id": "6589cd821c1dddd516fe95da",
//                 "category": "מוצרים קפואים",
//                 "subcategory": "פיצה"
//             },
//             {
//                 "barcode": "7290015350150",
//                 "amount": 1,
//                 "name": "יין אדום סגל חצי יבש",
//                 "brand": "של סגל",
//                 "totalPrice": 21.4,
//                 "generalName": "Wine",
//                 "weight": 750,
//                 "unit": "ml",
//                 "_id": "6589cd821c1dddd516fe95db",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "יינות"
//             }
//         ],
//         "userID": "1",
//         "date": "2023-12-25T18:44:18.920Z",
//         "supermarketName": "רמי לוי",
//         "supermarketAddress": "הפרסה 3",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 480.17999999999995
//     },
//     {
//         "_id": "65abba598e751f1b6cdfae26",
//         "products": [
//             {
//                 "barcode": "5838002",
//                 "amount": 1,
//                 "name": "דניאלה וניל מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 3.9,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "65abba598e751f1b6cdfae27",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290109580838",
//                 "amount": 1,
//                 "name": "שניצל דק צ'ילי מן הצומח",
//                 "brand": "זוגלובק",
//                 "totalPrice": 29.9,
//                 "generalName": "Schnitzel",
//                 "weight": 620,
//                 "unit": "g",
//                 "_id": "65abba598e751f1b6cdfae28",
//                 "category": "מוצרים קפואים",
//                 "subcategory": "שניצל"
//             }
//         ],
//         "userID": "1",
//         "date": "2024-01-20T12:19:37.850Z",
//         "supermarketName": "יוחננוף",
//         "supermarketAddress": "האומן 10",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 33.8
//     },
//     {
//         "_id": "65c52c5a34cb1bac867b8229",
//         "products": [
//             {
//                 "barcode": "5838002",
//                 "amount": 2,
//                 "name": "דניאלה וניל מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 7.8,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "65c52c5a34cb1bac867b822a",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290110328764",
//                 "amount": 2,
//                 "name": "יוגורט גו תות",
//                 "brand": "Go",
//                 "totalPrice": 11,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "65c52c5a34cb1bac867b822b",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290019056058",
//                 "amount": 2,
//                 "name": "מוגז עדין בטעם תפוח ליים",
//                 "brand": "שוופס",
//                 "totalPrice": 12,
//                 "generalName": "Schweppes",
//                 "weight": 1.5,
//                 "unit": "l",
//                 "_id": "65c52c5a34cb1bac867b822c",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "משקאות קלים"
//             },
//             {
//                 "barcode": "7290109580838",
//                 "amount": 1,
//                 "name": "שניצל דק צ'ילי מן הצומח",
//                 "brand": "זוגלובק",
//                 "totalPrice": 29.9,
//                 "generalName": "Schnitzel",
//                 "weight": 620,
//                 "unit": "g",
//                 "_id": "65c52c5a34cb1bac867b822d",
//                 "category": "מוצרים קפואים",
//                 "subcategory": "שניצל"
//             },
//             {
//                 "barcode": "4131074",
//                 "amount": 1,
//                 "name": "חלב בקרטון 3%",
//                 "brand": "תנובה",
//                 "totalPrice": 6.8,
//                 "generalName": "Milk",
//                 "weight": 1,
//                 "unit": "l",
//                 "_id": "65c52c5a34cb1bac867b822e",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "חלב"
//             }
//         ],
//         "userID": "1",
//         "date": "2024-02-08T19:32:42.608Z",
//         "supermarketName": "יוחננוף",
//         "supermarketAddress": "האומן 10",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 67.5
//     },
//     {
//         "_id": "65cb538afb1f628fc9ab8f81",
//         "products": [
//             {
//                 "barcode": "7290110328788",
//                 "amount": 1,
//                 "name": "יוגורט גו אפקסק",
//                 "brand": "Go",
//                 "totalPrice": 4.7,
//                 "generalName": "Yogurt Go",
//                 "weight": 0.2,
//                 "unit": "kg",
//                 "_id": "65cb538afb1f628fc9ab8f82",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "8693134",
//                 "amount": 1,
//                 "name": "דניאלה תות מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 3.9,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "65cb538afb1f628fc9ab8f83",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             },
//             {
//                 "barcode": "7290000176420",
//                 "amount": 1,
//                 "name": "קפה נמס",
//                 "brand": "קפה עלית",
//                 "totalPrice": 18.9,
//                 "generalName": "Instant Coffee",
//                 "weight": 200,
//                 "unit": "g",
//                 "_id": "65cb538afb1f628fc9ab8f84",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "קפה"
//             },
//             {
//                 "barcode": "5838002",
//                 "amount": 2,
//                 "name": "דניאלה וניל מוקצף 5%",
//                 "brand": "שטראוס",
//                 "totalPrice": 7.8,
//                 "generalName": "Daniela",
//                 "weight": 88,
//                 "unit": "g",
//                 "_id": "65cb538afb1f628fc9ab8f85",
//                 "category": "מוצרי חלב וביצים",
//                 "subcategory": "מעדנים"
//             }
//         ],
//         "userID": "1",
//         "date": "2024-02-13T11:33:30.454Z",
//         "supermarketName": "רמי לוי",
//         "supermarketAddress": "איזור תעשיה עטרות",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 35.3
//     },
//     {
//         "_id": "6762522b7e34a73d0935e208",
//         "products": [
//             {
//                 "barcode": "7290000136172",
//                 "amount": 2,
//                 "name": "סבן אפ",
//                 "brand": "סבן אפ",
//                 "totalPrice": 11.2,
//                 "generalName": "Sprite",
//                 "weight": 1.5,
//                 "unit": "l",
//                 "category": "משקאות, יין ואלכוהול",
//                 "subcategory": "משקאות קלים",
//                 "_id": "6762522b7e34a73d0935e209"
//             },
//             {
//                 "barcode": "80773429",
//                 "amount": 2,
//                 "name": "מסטיק ללא סוכר בטעם תות",
//                 "brand": "מנטוס",
//                 "totalPrice": 15,
//                 "generalName": "Bubble gum",
//                 "weight": 60,
//                 "unit": "g",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "מתוקים",
//                 "_id": "6762522b7e34a73d0935e20a"
//             },
//             {
//                 "barcode": "7290106667266",
//                 "amount": 4,
//                 "name": "דוריטוס חמוץ חריף",
//                 "brand": "דוריטוס",
//                 "totalPrice": 31.6,
//                 "generalName": "Doritos",
//                 "weight": 185,
//                 "unit": "g",
//                 "category": "חטיפים, מתוקים ודגנים",
//                 "subcategory": "חטיפים",
//                 "_id": "6762522b7e34a73d0935e20b"
//             }
//         ],
//         "userID": "1",
//         "date": "2024-12-18T04:40:11.659Z",
//         "supermarketName": "רמי לוי",
//         "supermarketAddress": "כנפי נשרים 26",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 57.8
//     },
//     {
//         "_id": "67625b8c5cedc8573f4db95d",
//         "products": [
//             {
//                 "barcode": "7290000144474",
//                 "amount": 1,
//                 "name": "שמן קנולה מזוכך",
//                 "brand": "עץ הזית",
//                 "totalPrice": 14.8,
//                 "generalName": "oil",
//                 "weight": 1,
//                 "unit": "l",
//                 "category": "בישול ואפייה",
//                 "subcategory": "שמן",
//                 "_id": "67625b8c5cedc8573f4db95e"
//             }
//         ],
//         "userID": "1",
//         "date": "2024-12-18T05:20:12.143Z",
//         "supermarketName": "רמי לוי",
//         "supermarketAddress": "איזור תעשיה עטרות",
//         "supermarketCity": "ירושלים",
//         "totalPrice": 14.8
//     }
// ];

// const ExpenseOverview = () => {
//   const [selectedMonthYear, setSelectedMonthYear] = useState('2023-11');
//   const [selectedCategory, setSelectedCategory] = useState('All Categories');

//   // פילטור נתונים לפי חודש ושנה
//   const filteredDataByMonth = data.filter((item) =>
//     item.date.includes(selectedMonthYear)
//   );

//   // שינוי הקטגוריה לפי הקליק בגרף
//   const handleCategorySelect = (category) => {
//     setSelectedCategory(category);
//   };

//   // שינוי חודש+שנה לפי הקליק בגרף המקלות
//   const handleMonthSelect = (monthYear) => {
//     setSelectedMonthYear(monthYear);
//     setSelectedCategory('All Categories'); // מאפס את הקטגוריה
//   };

//   return (
//     <div className="expense-overview">
//       <h1>סקירת הוצאות חודשיות</h1>
//       {/* תרשים מקלות */}
//       <MonthlyExpensesBarChart
//         data={data}
//         selectedMonthYear={selectedMonthYear}
//         onMonthSelect={handleMonthSelect}
//       />

//       {/* תרשים דונאט */}
//       <CategoryExpensesChart
//         data={filteredDataByMonth}
//         selectedCategory={selectedCategory}
//         onCategorySelect={handleCategorySelect}
//       />

//       {/* פירוט הוצאות */}
//       <ExpenseBreakdownList
//         data={filteredDataByMonth}
//         selectedCategory={selectedCategory}
//       />
//     </div>
//   );
// };

// export default ExpenseOverview;

// MonthlyExpensesBarChart.css:
// /* .bar-chart {
//     display: flex;
//     justify-content: center;
//     gap: 15px;
//     flex-wrap: wrap;
//     background-color: #fff;
//     border: 1px solid #ddd;
//     border-radius: 10px;
//     padding: 20px;
//   }
  
//   .bar {
//     display: flex;
//     flex-direction: column;
//     justify-content: flex-end;
//     align-items: center;
//     width: 60px;
//     height: 150px;
//     background-color: #87ceeb;
//     border-radius: 5px;
//     cursor: pointer;
//     transition: all 0.3s ease-in-out;
//   }
  
//   .bar:hover {
//     background-color: #5fa7d7;
//     transform: translateY(-5px);
//   }
  
//   .bar.selected {
//     background-color: #008080;
//     color: #fff;
//   }
  
//   .bar-value {
//     margin-bottom: 5px;
//     font-size: 0.9rem;
//     font-weight: bold;
//   }
  
//   .bar-label {
//     font-size: 0.8rem;
//     color: #555;
//   }
//    */

//   .bar-chart-container {
//     display: flex;
//     overflow-x: auto; /* גלילה אופקית */
//     gap: 20px; /* רווחים בין המקלות */
//     padding: 10px;
//     white-space: nowrap;
//     background-color: #f9f9f9;
//   }
  
//   .bar-chart {
//     display: flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: flex-end;
//     height: 200px;
//     min-width: 80px;
//     position: relative;
//     background-color: #b3e8e9;
//     border-radius: 5px 5px 0 0;
//     transition: transform 0.3s ease-in-out;
//   }
  
//   .bar-chart:hover {
//     transform: scale(1.05);
//   }
  
//   .bar-value {
//     position: absolute;
//     top: -25px;
//     font-weight: bold;
//     font-size: 14px;
//     color: #333;
//   }
  
//   .bar-date {
//     margin-top: 5px;
//     font-size: 12px;
//     color: #666;
//     text-align: center;
//   }
  
//   .bar-chart-wrapper {
//     display: inline-flex;
//     flex-direction: column;
//     align-items: center;
//     justify-content: flex-end;
//   }
  
//   @media (max-width: 768px) {
//     .bar-chart-container {
//       gap: 15px; /* מרווח קטן יותר לניידים */
//     }
//     .bar-chart {
//       min-width: 60px; /* מקל צר יותר בנייד */
//       height: 150px; /* גובה מותאם */
//     }
//   }
  
// MonthlyExpensesBarChart.js:
// // import React from 'react';
// // import './MonthlyExpensesBarChart.css';

// // const MonthlyExpensesBarChart = ({ data, selectedMonthYear, onMonthSelect }) => {
// //   // חישוב הסכומים לפי חודש ושנה
// //   const monthlyTotals = data.reduce((acc, item) => {
// //     const monthYear = item.date.slice(0, 7);
// //     acc[monthYear] = (acc[monthYear] || 0) + item.totalPrice;
// //     return acc;
// //   }, {});

// //   return (
// //     <div className="bar-chart">
// //       {Object.entries(monthlyTotals).map(([monthYear, total]) => (
// //         <div
// //           key={monthYear}
// //           className={`bar ${monthYear === selectedMonthYear ? 'selected' : ''}`}
// //           onClick={() => onMonthSelect(monthYear)}
// //         >
// //           <div className="bar-value">₪{total.toFixed(2)}</div>
// //           <div className="bar-label">{monthYear}</div>
// //         </div>
// //       ))}
// //     </div>
// //   );
// // };

// // export default MonthlyExpensesBarChart;

// import React from "react";
// import "./MonthlyExpensesBarChart.css";

// const MonthlyExpensesBarChart = ({ expenses }) => {
//   return (
//     <div className="bar-chart-container">
//       {expenses
//         .sort((a, b) => new Date(b.date) - new Date(a.date)) // מיון מההכי מאוחר
//         .map((expense) => (
//           <div key={expense.id} className="bar-chart-wrapper">
//             <div
//               className="bar-chart"
//               style={{ height: `${(expense.amount / 10000) * 200}px` }} // התאמת הגובה
//             >
//               <div className="bar-value">₪{expense.amount}</div>
//             </div>
//             <div className="bar-date">
//               {expense.month}/{expense.year}
//             </div>
//           </div>
//         ))}
//     </div>
//   );
// };

// export default MonthlyExpensesBarChart;


