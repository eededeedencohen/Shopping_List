// // import React, { useState, useEffect } from "react";
// import React from "react";
// // import { useCart } from "../../../context/CartContext";
// import SupermarketImage from "../supermarketImage";
// import "./SupermarketsNames.css";

// const SupermarketsNames = ({ onSelectSupermarket }) => {
//   const supermarkets = [
//     { name: "BE", branches: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
//     {
//       name: "Carrefour city (קרפור סיטי)",
//       branches: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
//     },
//     { name: "yellow", branches: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
//     { name: "אושר עד", branches: [31, 32, 33, 34, 35, 36, 37, 38, 39, 40] },
//     { name: "ויקטורי", branches: [41, 42, 43, 44, 45, 46, 47, 48, 49, 50] },
//     { name: "יוחננוף", branches: [51, 52, 53, 54, 55, 56, 57, 58, 59, 60] },
//     { name: "יש בשכונה", branches: [61, 62, 63, 64, 65, 66, 67, 68, 69, 70] },
//     { name: "יש חסד", branches: [71, 72, 73, 74, 75, 76, 77, 78, 79, 80] },
//     { name: "מגה בעיר", branches: [81, 82, 83, 84, 85, 86, 87, 88, 89, 90] },
//     { name: "רמי לוי", branches: [91, 92, 93, 94, 95, 96, 97, 98, 99, 100] },
//   ];

//   const supermarkets2 = {
//     BE: [
//       {
//         address: "זית שמן 2",
//         city: "אפרת",
//         supermarketID: 182,
//       },
//       {
//         address: "הרכס 31",
//         city: "מעלה אדומים",
//         supermarketID: 181,
//       },
//       {
//         address: "בית חולים שערי צדק",
//         city: "ירושלים",
//         supermarketID: 180,
//       },
//     ],

//     "Carrefour city (קרפור סיטי)": [
//       {
//         address: "אבי זהר",
//         city: "ירושלים",
//         supermarketID: 69,
//       },
//     ],
//     yellow: [
//       {
//         address: "99 דרך חברון",
//         city: "ירושלים",
//         supermarketID: 139,
//       },
//       {
//         address: "שד משה דיין- גבעת זאב",
//         city: "ירושלים",
//         supermarketID: 138,
//       },
//       {
//         address: "עקיבא אזולאי 1את גבעת שאול",
//         city: "ירושלים",
//         supermarketID: 137,
//       },
//       {
//         address: "שכונת נוף הריםמבשרת ציון",
//         city: "ירושלים",
//         supermarketID: 136,
//       },
//       {
//         address: "איזור תעשיה תלפיות",
//         city: "ירושלים",
//         supermarketID: 133,
//       },
//       {
//         address: "שד ויצמן ביציאה מהעיר לתא",
//         city: "ירושלים",
//         supermarketID: 123,
//       },
//       {
//         address: "מחלף שער הגיא כביש ים תא",
//         city: "ירושלים",
//         supermarketID: 127,
//       },
//       {
//         address: "אונטרמן שכונת גילה",
//         city: "ירושלים",
//         supermarketID: 135,
//       },
//       {
//         address: "1 פיקוד מרכז",
//         city: "ירושלים",
//         supermarketID: 131,
//       },
//       {
//         address: "חניון מוזיאון ישראל",
//         city: "ירושלים",
//         supermarketID: 140,
//       },
//       {
//         address: "כביש בית שמש - ים",
//         city: "ירושלים",
//         supermarketID: 134,
//       },
//       {
//         address: "כביש 60 ביציאה הדרומית מירושלים",
//         city: "ירושלים",
//         supermarketID: 142,
//       },
//       {
//         address: "44 שבטי ישראל",
//         city: "ירושלים",
//         supermarketID: 126,
//       },
//       {
//         address: "5 פארן",
//         city: "ירושלים",
//         supermarketID: 130,
//       },
//       {
//         address: "מישור אדומים",
//         city: "ירושלים",
//         supermarketID: 141,
//       },
//       {
//         address: "דרך הנרייטה סאלד",
//         city: "ירושלים",
//         supermarketID: 132,
//       },
//       {
//         address: "11 דרך בית לחם",
//         city: "ירושלים",
//         supermarketID: 124,
//       },
//       {
//         address: "שד בן-צבי",
//         city: "ירושלים",
//         supermarketID: 128,
//       },
//       {
//         address: "גולומב",
//         city: "ירושלים",
//         supermarketID: 129,
//       },
//       {
//         address: "19 המלך דוד",
//         city: "ירושלים",
//         supermarketID: 125,
//       },
//     ],
//     "אושר עד": [
//       {
//         address: "פייר קניג 26",
//         city: "ירושלים",
//         supermarketID: 16,
//       },
//       {
//         address: "בית הדפוס 29",
//         city: "ירושלים",
//         supermarketID: 15,
//       },
//       {
//         address: "שמגר 16",
//         city: "ירושלים",
//         supermarketID: 17,
//       },
//     ],
//     ויקטורי: [
//       {
//         address: "דרך אגודת הספורט מכבי 1",
//         city: "ירושלים",
//         supermarketID: 37,
//       },
//       {
//         address: "הראל 1",
//         city: "מבשרת ציון",
//         supermarketID: 192,
//       },
//     ],
//     יוחננוף: [
//       {
//         address: "האומן 10",
//         city: "ירושלים",
//         supermarketID: 19,
//       },
//     ],
//     "יש בשכונה": [
//       {
//         address: "פארן 7 רמת אשכול",
//         city: "ירושלים",
//         supermarketID: 25,
//       },
//       {
//         address: "שאולזון 56",
//         city: "ירושלים",
//         supermarketID: 27,
//       },
//     ],
//     "מגה בעיר": [
//       {
//         address: 'בית"ר פינת ינובסקי',
//         city: "ירושלים",
//         supermarketID: 52,
//       },
//     ],
//     "רמי לוי": [
//       {
//         address: "בית הדפוס 13",
//         city: "ירושלים",
//         supermarketID: 12,
//       },
//       {
//         address: "איזור תעשיה עטרות",
//         city: "ירושלים",
//         supermarketID: 14,
//       },
//       {
//         address: "החוצבים 5",
//         city: "מבשרת ציון",
//         supermarketID: 189,
//       },
//       {
//         address: "יד חרוצים 18",
//         city: "ירושלים",
//         supermarketID: 8,
//       },
//       {
//         address: "הפרסה 3",
//         city: "ירושלים",
//         supermarketID: 10,
//       },
//       {
//         address: "דרך החורש 90",
//         city: "ירושלים",
//         supermarketID: 9,
//       },
//       {
//         address: "האומן,15",
//         city: "ירושלים",
//         supermarketID: 7,
//       },
//       {
//         address: "איזור התעשיה שער בנימין",
//         city: "ירושלים",
//         supermarketID: 11,
//       },
//       {
//         address: "כנפי נשרים 26",
//         city: "ירושלים",
//         supermarketID: 13,
//       },
//     ],
//   };

//   // const [supermarkets2, setSupermarkets2] = useState([]);

//   // const { getAllSupermarkets } = useCart();

//   // useEffect(() => {
//   //   async function fetchData() {
//   //     try {
//   //       const data = await getAllSupermarkets();
//   //       console.log("Data received:", data);
//   //       // בדוק אם data.supermarkets קיים
//   //       setSupermarkets2(data.supermarkets);
//   //     } catch (error) {
//   //       console.error("Error fetching supermarkets", error);
//   //     }
//   //   }
//   //   fetchData();
//   // }, [getAllSupermarkets]);

//   return (
//     <div className="smn_container">
//       {supermarkets.map((supermarket) => (
//         <div
//           key={supermarket.name}
//           className="smn_item"
//           onClick={() => onSelectSupermarket(supermarket)}
//         >
//           <div className="smn_circle">
//             <SupermarketImage
//               supermarketName={supermarket.name}
//               className="smn_image"
//             />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default SupermarketsNames;
import React from "react";
import SupermarketImage from "../supermarketImage";
import "./SupermarketsNames.css";

const SupermarketsNames = ({ onSelectSupermarket }) => {
  // dummy data: רשימת הסניפים המדומה עבור כל סופרמרקט
  const supermarkets2 = {
    BE: [
      {
        address: "זית שמן 2",
        city: "אפרת",
        supermarketID: 182,
      },
      {
        address: "הרכס 31",
        city: "מעלה אדומים",
        supermarketID: 181,
      },
      {
        address: "בית חולים שערי צדק",
        city: "ירושלים",
        supermarketID: 180,
      },
    ],
    "Carrefour city (קרפור סיטי)": [
      {
        address: "אבי זהר",
        city: "ירושלים",
        supermarketID: 69,
      },
    ],
    yellow: [
      {
        address: "99 דרך חברון",
        city: "ירושלים",
        supermarketID: 139,
      },
      {
        address: "שד משה דיין- גבעת זאב",
        city: "ירושלים",
        supermarketID: 138,
      },
      {
        address: "עקיבא אזולאי 1את גבעת שאול",
        city: "ירושלים",
        supermarketID: 137,
      },
      // שאר הפריטים...
    ],
    "אושר עד": [
      {
        address: "פייר קניג 26",
        city: "ירושלים",
        supermarketID: 16,
      },
      {
        address: "בית הדפוס 29",
        city: "ירושלים",
        supermarketID: 15,
      },
      {
        address: "שמגר 16",
        city: "ירושלים",
        supermarketID: 17,
      },
    ],
    ויקטורי: [
      {
        address: "דרך אגודת הספורט מכבי 1",
        city: "ירושלים",
        supermarketID: 37,
      },
      {
        address: "הראל 1",
        city: "מבשרת ציון",
        supermarketID: 192,
      },
    ],
    יוחננוף: [
      {
        address: "האומן 10",
        city: "ירושלים",
        supermarketID: 19,
      },
    ],
    "יש בשכונה": [
      {
        address: "פארן 7 רמת אשכול",
        city: "ירושלים",
        supermarketID: 25,
      },
      {
        address: "שאולזון 56",
        city: "ירושלים",
        supermarketID: 27,
      },
    ],
    "מגה בעיר": [
      {
        address: 'בית"ר פינת ינובסקי',
        city: "ירושלים",
        supermarketID: 52,
      },
    ],
    "רמי לוי": [
      {
        address: "בית הדפוס 13",
        city: "ירושלים",
        supermarketID: 12,
      },
      {
        address: "איזור תעשיה עטרות",
        city: "ירושלים",
        supermarketID: 14,
      },
      {
        address: "החוצבים 5",
        city: "מבשרת ציון",
        supermarketID: 189,
      },
      {
        address: "יד חרוצים 18",
        city: "ירושלים",
        supermarketID: 8,
      },
      {
        address: "הפרסה 3",
        city: "ירושלים",
        supermarketID: 10,
      },
      {
        address: "דרך החורש 90",
        city: "ירושלים",
        supermarketID: 9,
      },
      {
        address: "האומן,15",
        city: "ירושלים",
        supermarketID: 7,
      },
      {
        address: "איזור התעשיה שער בנימין",
        city: "ירושלים",
        supermarketID: 11,
      },
      {
        address: "כנפי נשרים 26",
        city: "ירושלים",
        supermarketID: 13,
      },
    ],
    // ניתן להוסיף שאר הסופרמרקטים בהתאם
  };

  // המרת האובייקט למערך: כל פריט יהיה אובייקט עם name ו-branches.
  const supermarketsArray = Object.keys(supermarkets2).map((name) => ({
    name,
    branches: supermarkets2[name],
  }));

  return (
    <div className="smn_container">
      {supermarketsArray.map((supermarket) => (
        <div
          key={supermarket.name}
          className="smn_item"
          onClick={() => onSelectSupermarket(supermarket)}
        >
          <div className="smn_circle">
            <SupermarketImage
              supermarketName={supermarket.name}
              className="smn_image"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default SupermarketsNames;
