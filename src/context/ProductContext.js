// import { createContext, useContext, useEffect, useState } from "react";
// import {
//   getAllProducts,
//   getByBarcode,
//   getProductByQuery,
// } from "../network/productService";

// const ProductContext = createContext(null);

// export const ProductContextProvider = ({ children }) => {
//   const [products, setProducts] = useState([]);
//   const [error, setError] = useState(null);
//   const [productByBarcode, setProductByBarcode] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const allCategories = [
//     // "פירות וירקות",
//     // "בשר עוף, ודגים",
//     "מוצרי חלב וביצים",
//     // "לחמים ומאפים",
//     "משקאות, יין ואלכוהול",
//     "מוצרים קפואים",
//     "בישול ואפייה",
//     "שימורים",
//     "חטיפים, מתוקים ודגנים",
//     "ניקיון וחד פעמי",
//     "פארם ותינוקות",
//     // "אלכוהול וקוקטיילים",
//     // "בירות",
//     // "גבינות",
//     // "מוצרי תינוקות",
//     // "משקאות חמים",
//     // "משקאות קלים",
//     // "מתוקים ושוקולד",
//     // "חטיפים ודגנים",
//     // "ניקיון",
//     // "פירות קפואים",
//     // "שמנים, רטבים ותבלינים",
//     // "מוצרי בצק קפואים",
//     // "ירקות קפואים",
//     // "אפייה ביתית"
//   ];
//   const [activeCategory, setActiveCategory] = useState(allCategories[0]);

//   const all_sub_categories = {
//     // "פירות וירקות": ["פירות", "ירקות"],
//     // "בשר עוף, ודגים": ["בשר", "עוף", "דגים"],
//     "מוצרי חלב וביצים": ["חלב", "מעדנים", "גבינות"],
//     // "לחמים ומאפים": ["לחמים", "מאפים"],
//     "משקאות, יין ואלכוהול" : ["משקאות קלים", "משקאות חמים", "יינות", "קפה"],
//     "מוצרים קפואים": ["צ'יפס" , "המבורגר" , "שניצל" , "פיצה" , "טבעות בצל"],
//     "בישול ואפייה": ["אורז", "שמן", "פסטות ואטריות", "רטבים", "פסטות", "תבלינים", "קוסקוס", "רטבים / סירופים", "פתיתים"],
//     "שימורים" : ["תירס", "ירקות משומרים", "טונה", "מלפפון חמוץ", "זיתים", "פטריות"],
//     "חטיפים, מתוקים ודגנים" : ["חטיפים", "מתוקים", "קורנפלקס", "שוקולד", "עוגיות", "פרינגלס", "פרינגלס", "תפוצ'יפס", "חטיף אנרגיה"],
//     "ניקיון וחד פעמי": ["כפיות", "בושם", "סכינים", "כוסות", "מפיות", "סמרטוט", "מזלגות", "כפות", "אבקות כביסה", "מרכך כביסה", "צלחות", "אקונומיקה", "מטאטא", "סבון כלים"],
//     "פארם ותינוקות": ["חיתולים", "משחת שיניים", "מוצצים", "בקבוקים לתינוק", "דאודורנטים", "בושם"],
//     // "אלכוהול וקוקטיילים",
//     // "בירות",
//     // "גבינות",
//     // "מוצרי תינוקות",
//     // "משקאות חמים",
//     // "משקאות קלים",
//     // "מתוקים ושוקולד",
//     // "חטיפים ודגנים",
//     // "ניקיון",
//     // "פירות קפואים",
//     // "שמנים, רטבים ותבלינים",
//     // "מוצרי בצק קפואים",
//     // "ירקות קפואים",
//     // "אפייה ביתית"
//   }

//   useEffect(() => {
//     const getProducts = async () => {
//       setLoading(true);
//       try {
//         const response = await getAllProducts();
//         const productsAmount = response.productsAmount;
//         const products = JSON.parse(response.products.data).data.products;

//         const productsWithAmount = products.map((product) => {
//           // Find the product amount using the barcode
//           const amountInfo = productsAmount.find(
//             (p) => p.barcode === product.barcode
//           );
//           // Add the amount to the product object
//           return { ...product, amount: amountInfo ? amountInfo.amount : 0 };
//         });

//         // console.log(productsWithAmount);
//         setProducts(JSON.parse(response.products.data).data.products);
//       } catch (e) {
//         setError(e);
//       } finally {
//         setLoading(false);
//       }
//     };

//     getProducts();
//   }, []);

//   // get product by barcode from the products useState (asume that the products useState is already loaded):
//   const getProductDetailsByBarcode = (barcode) => {
//     return products.find((product) => product.barcode === barcode);
//   };

//   const loadProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await getAllProducts();
//       const productsAmount = response.productsAmount;
//       const products = JSON.parse(response.products.data).data.products;

//       const productsWithAmount = products.map((product) => {
//         // Find the product amount using the barcode
//         const amountInfo = productsAmount.find(
//           (p) => p.barcode === product.barcode
//         );
//         // Add the amount to the product object
//         return { ...product, amount: amountInfo ? amountInfo.amount : 0 };
//       });

//       // console.log(productsWithAmount);
//       setProducts(JSON.parse(response.products.data).data.products);
//     } catch (e) {
//       setError(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getProductByBarcode = async (barcode) => {
//     setLoading(true);
//     try {
//       const response = await getByBarcode(barcode);
//       setProductByBarcode(JSON.parse(response.data).data.product); // assuming the response contains a single product
//     } catch (e) {
//       setError(e);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const searchProducts = async (query, supermarketID) => {
//     try {
//       const response = await getProductByQuery(query, supermarketID);
//       // console.log(JSON.parse(response.data).data.products);
//       return JSON.parse(response.data).data.products;
//     } catch (e) {
//       // Do something with error
//       console.error(e);
//       return [];
//     }
//   };

//   return (
//     <ProductContext.Provider
//       value={{
//         products,
//         loadProducts,
//         error,
//         getProductByBarcode, // exposing the function
//         productByBarcode, // exposing the state
//         searchProducts,
//         loading, // exposing the loading state

//         // for category navigation
//         allCategories,
//         activeCategory,
//         setActiveCategory,

//         // get product fron the useState:
//         getProductDetailsByBarcode,
//       }}
//     >
//       {children}
//     </ProductContext.Provider>
//   );
// };

// export const useProducts = () => {
//   const context = useContext(ProductContext);
//   if (!context) throw Error("ProductContext was not provided correctly");
//   return context;
// };

//=================================================================================================
//=================================================================================================
import { createContext, useContext, useEffect, useState } from "react";
import {
  getAllProducts,
  getByBarcode,
  getProductByQuery,
} from "../network/productService";

const ProductContext = createContext(null);

/**
 * רשימת הקטגוריות הראשיות במערך, לפי הסדר הרצוי
 */
const allCategories = [
  "משקאות קלים",
  "המקפיא",
  "משקאות חמים",
  "מוצרי תינוקות",
  "שימורים",
  "פארם ותינוקות",
  "תבלינים, אבקות מרק ומרקי אינסטנט",
  "אפייה ביתית",
  "חלב ביצים ומעדנים",
  "מוצרי בסיס לבישול",
  "חטיפים ודגנים",
  "מתוקים ושוקולד",
  "בירות",
  "ניקיון וטואלטיקה",
  "חד פעמי",
  "אלכוהול וקוקטיילים",
  "גבינות",
  "יינות",
  "שמנים ורטבים"
]  

/**
 * מיפוי מחרוזת-קטגוריה -> מערך תתי-קטגוריות
 * חשוב שהשמות ב-keys יהיו זהים ל-names שב-allCategories.
 */
const all_sub_categories_map = {
  "משקאות קלים": [
    "משקאות מוגזים",
    "משקאות סויה ושקדים",
    "מים מינרליים וסודה",
    "משקאות אנרגיה",
    "מיצים טבעיים",
  ],
  "המקפיא": [
    "בשר ומנות מוכנות קפואות",
    "מוצרי בצק קפואים",
    "גלידות וארטיקים",
    "ירקות קפואים",
    "תוספות קפואות",
    "פירות קפואים",
  ],
  "משקאות חמים": [
    "קפסולות למכונת קפה",
    "תה וחליטות צמחים",
    "קפה טחון ושחור",
    "אייס קפה",
    "תחליף חלב בקפסולות",
    "קפה נמס",
  ],
  "מוצרי תינוקות": [
    "דייסות ודגנים לתינוקות",
    "חיתולים ומגבונים",
    "מוצצים",
    "בקבוקים",
    "קרמים ושמפו לתינוק",
    "תחליפי חלב אם",
    "טיפוח פה לילדים",
  ],
  "שימורים": [
    "מלפפון חמוץ",
    "תירס",
    "טונה",
    "פטריות",
    "זיתים",
  ],
  "פארם ותינוקות": ["משחת שיניים", "דאודורנטים", "בושם"],
  "תבלינים, אבקות מרק ומרקי אינסטנט": [
    "תבלינים בסיסיים",
    "נמס בכוס (מרקים מיידיים)",
    "אבקות מרק",
    "תערובות תיבול",
    "שמרים, אבקות וקורנפלור",
  ],
  "אפייה ביתית": [
    "תמציות וטעמים",
    "קישוטים",
    "תערובות מוכנות",
    "קמחים וסולת",
    "שמרים, אבקות וקורנפלור",
    "סוכרים וממתיקים",
  ],
  "חלב ביצים ומעדנים": [
    "עוגות וקינוחים מוכנים",
    "מעדני חלב",
    "חמאות ומרגרינות",
    "שמנת וקצפת",
    "קפה קר ובקבוקי קפה",
    "משקאות חלבון",
    "חלב ומשקאות חלב",
    "יוגורטים",
  ],
  "מוצרי בסיס לבישול": [
    "פתיתים",
    "פסטות ואטריות",
    "אורז",
    "קוסקוס",
  ],
  "חטיפים ודגנים": [
    "חטיפים מלוחים",
    "חטיפים מתוקים",
    "דגני בוקר",
    "קרקרים ופריכיות",
    "חטיפי אנרגיה",
  ],
  "מתוקים ושוקולד": [
    "חטיפי שוקולד",
    "סוכריות",
    "סוכריות ללא סוכר",
    "סוכריות גומי",
    "מארזי שוקולד",
    "מסטיקים",
    "וופלים וביסקוויטים",
    "עוגיות",
    "טבלאות שוקולד",
    "חטיפים מתוקים",
    "ממרח שוקולד",
  ],
  "בירות": [
    "בירות כהות",
    "בירות חיטה",
    "בירות אחרות",
    "בירות ללא אלכוהול",
    "בירות לאגר",
    "בירות בוטיק ישראליות",
  ],
  "ניקיון וטואלטיקה": [
    "אבקות ומרככי כביסה",
    "חומרי ניקוי למטבח",
    "חומרי ניקוי לבית",
    "חומרי ניקוי לאמבטיה",
  ],
  "חד פעמי": [
    "שקיות וניילונים",
    "מפיות ומגבות נייר",
    "ניירות ותבניות אפייה",
    "מפות חד-פעמיים",
    "צלחות וקערות",
    "נייר טואלט",
  ],
  "אלכוהול וקוקטיילים": [
    "וויסקי ורום",
    "וודקה וטקילה",
    "קוקטיילים ומשקאות מוכנים",
  ],
  "גבינות": [
    "גבינות עובש",
    "גבינות מלוחות",
    "גבינות צהובות",
    "לאבנה",
    "גבינות קשות",
    "גבינות לבנות",
    "גבינות עיזים",
    "גבינות שמנת וממרחים",
  ],
  "יינות": [
    "יינות ללא אלכוהול",
    "יינות לבנים",
    "יינות אדומים",
  ],
  "שמנים ורטבים": [
    "שמנים",
    "רטבי עגבניות",
    "חומץ ומיצים",
    "רטבים כלליים",
  ],
};

/**
 * נפיק מערך של תתי-קטגוריות לכל קטגוריה לפי האינדקס המתאים ב-allCategories.
 * כך ש-all_sub_categories[0] = תתי הקטגוריות של "מוצרי חלב וביצים", וכו'.
 */
const all_sub_categories = allCategories.map(
  (cat) => all_sub_categories_map[cat] || []
);

export const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [productByBarcode, setProductByBarcode] = useState(null);
  const [loading, setLoading] = useState(false);

  // במקום activeCategory (מחרוזת), נשמור אינדקסים:
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeSubCategoryIndex, setActiveSubCategoryIndex] = useState(0);

  // טוענים את המוצרים עם ה-Mount הראשוני
  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const response = await getAllProducts();
        const productsAmount = response.productsAmount;
        const productsData = JSON.parse(response.products.data).data.products;

        // כאן אפשר לחבר מידע על amount וכדומה, כרצונך
        const productsWithAmount = productsData.map((product) => {
          const amountInfo = productsAmount.find(
            (p) => p.barcode === product.barcode
          );
          return { ...product, amount: amountInfo ? amountInfo.amount : 0 };
        });

        setProducts(productsWithAmount);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // פונקציה לטעינת מוצרים (אם נרצה לרענן)
  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      const productsAmount = response.productsAmount;
      const productsData = JSON.parse(response.products.data).data.products;

      const productsWithAmount = productsData.map((product) => {
        const amountInfo = productsAmount.find(
          (p) => p.barcode === product.barcode
        );
        return { ...product, amount: amountInfo ? amountInfo.amount : 0 };
      });

      setProducts(productsWithAmount);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // הפונקציה הקיימת להוצאת מוצר לפי ברקוד (מהשרת)
  const getProductByBarcode = async (barcode) => {
    setLoading(true);
    try {
      const response = await getByBarcode(barcode);
      setProductByBarcode(JSON.parse(response.data).data.product);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  // חיפוש מוצרים בשרת
  const searchProducts = async (query, supermarketID) => {
    try {
      const response = await getProductByQuery(query, supermarketID);
      return JSON.parse(response.data).data.products;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  // להחזיר מוצר מתוך ה־useState המקומי (לא משרת) לפי ברקוד
  const getProductDetailsByBarcode = (barcode) => {
    return products.find((product) => product.barcode === barcode);
  };

  // פונקציות עזר להחזרת שמות של הקטגוריה/תת-קטגוריה הפעילה
  const getActiveCategory = () => allCategories[activeCategoryIndex];
  const getActiveSubCategory = () => {
    const subs = all_sub_categories[activeCategoryIndex];
    return subs && subs[activeSubCategoryIndex];
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loadProducts,
        error,
        getProductByBarcode,
        productByBarcode,
        searchProducts,
        loading,

        // קטגוריות ותתי קטגוריות
        allCategories,
        all_sub_categories,

        activeCategoryIndex,
        setActiveCategoryIndex,
        activeSubCategoryIndex,
        setActiveSubCategoryIndex,

        getActiveCategory,
        getActiveSubCategory,

        // פונקציה לשליפת מוצר מ-useState
        getProductDetailsByBarcode,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("ProductContext was not provided correctly");
  return context;
};



// "categoriesAndSubcategories": [
//   {
//       "_id": "משקאות קלים",
//       "subcategories": [
//           "משקאות מוגזים",
//           "משקאות סויה ושקדים",
//           "מים מינרליים וסודה",
//           "משקאות אנרגיה",
//           "מיצים טבעיים"
//       ]
//   },
//   {
//       "_id": "המקפיא",
//       "subcategories": [
//           "בשר ומנות מוכנות קפואות",
//           "מוצרי בצק קפואים",
//           "גלידות וארטיקים",
//           "ירקות קפואים",
//           "תוספות קפואות",
//           "פירות קפואים"
//       ]
//   },
//   {
//       "_id": "משקאות חמים",
//       "subcategories": [
//           "קפסולות למכונת קפה",
//           "תה וחליטות צמחים",
//           "קפה טחון ושחור",
//           "אייס קפה",
//           "תחליף חלב בקפסולות",
//           "קפה נמס"
//       ]
//   },
//   {
//       "_id": "מוצרי תינוקות",
//       "subcategories": [
//           "דייסות ודגנים לתינוקות",
//           "חיתולים ומגבונים",
//           "מוצצים",
//           "בקבוקים",
//           "קרמים ושמפו לתינוק",
//           "תחליפי חלב אם",
//           "טיפוח פה לילדים"
//       ]
//   },
//   {
//       "_id": "שימורים",
//       "subcategories": [
//           "מלפפון חמוץ",
//           "תירס",
//           "טונה",
//           "פטריות",
//           "זיתים"
//       ]
//   },
//   {
//       "_id": "פארם ותינוקות",
//       "subcategories": [
//           "משחת שיניים",
//           "דאודורנטים",
//           "בושם"
//       ]
//   },
//   {
//       "_id": "תבלינים, אבקות מרק ומרקי אינסטנט",
//       "subcategories": [
//           "תבלינים בסיסיים",
//           "נמס בכוס (מרקים מיידיים)",
//           "אבקות מרק",
//           "תערובות תיבול",
//           "שמרים, אבקות וקורנפלור"
//       ]
//   },
//   {
//       "_id": "אפייה ביתית",
//       "subcategories": [
//           "תמציות וטעמים",
//           "קישוטים",
//           "תערובות מוכנות",
//           "קמחים וסולת",
//           "שמרים, אבקות וקורנפלור",
//           "סוכרים וממתיקים"
//       ]
//   },
//   {
//       "_id": "חלב ביצים ומעדנים",
//       "subcategories": [
//           "עוגות וקינוחים מוכנים",
//           "מעדני חלב",
//           "חמאות ומרגרינות",
//           "שמנת וקצפת",
//           "קפה קר ובקבוקי קפה",
//           "משקאות חלבון",
//           "חלב ומשקאות חלב",
//           "יוגורטים"
//       ]
//   },
//   {
//       "_id": "מוצרי בסיס לבישול",
//       "subcategories": [
//           "פתיתים",
//           "פסטות ואטריות",
//           "אורז",
//           "קוסקוס"
//       ]
//   },
//   {
//       "_id": "חטיפים ודגנים",
//       "subcategories": [
//           "חטיפים מלוחים",
//           "חטיפים מתוקים",
//           "דגני בוקר",
//           "קרקרים ופריכיות",
//           "חטיפי אנרגיה"
//       ]
//   },
//   {
//       "_id": "מתוקים ושוקולד",
//       "subcategories": [
//           "חטיפי שוקולד",
//           "סוכריות",
//           "סוכריות ללא סוכר",
//           "סוכריות גומי",
//           "מארזי שוקולד",
//           "מסטיקים",
//           "וופלים וביסקוויטים",
//           "עוגיות",
//           "טבלאות שוקולד",
//           "חטיפים מתוקים",
//           "ממרח שוקולד"
//       ]
//   },
//   {
//       "_id": "בירות",
//       "subcategories": [
//           "בירות כהות",
//           "בירות חיטה",
//           "בירות אחרות",
//           "בירות ללא אלכוהול",
//           "בירות לאגר",
//           "בירות בוטיק ישראליות"
//       ]
//   },
//   {
//       "_id": "ניקיון וטואלטיקה",
//       "subcategories": [
//           "אבקות ומרככי כביסה",
//           "חומרי ניקוי למטבח",
//           "חומרי ניקוי לבית",
//           "חומרי ניקוי לאמבטיה"
//       ]
//   },
//   {
//       "_id": null,
//       "subcategories": []
//   },
//   {
//       "_id": "חד פעמי",
//       "subcategories": [
//           "שקיות וניילונים",
//           "מפיות ומגבות נייר",
//           "ניירות ותבניות אפייה",
//           "מפות חד-פעמיים",
//           "צלחות וקערות",
//           "נייר טואלט"
//       ]
//   },
//   {
//       "_id": "אלכוהול וקוקטיילים",
//       "subcategories": [
//           "וויסקי ורום",
//           "וודקה וטקילה",
//           "קוקטיילים ומשקאות מוכנים"
//       ]
//   },
//   {
//       "_id": "גבינות",
//       "subcategories": [
//           "גבינות עובש",
//           "גבינות מלוחות",
//           "גבינות צהובות",
//           "לאבנה",
//           "גבינות קשות",
//           "גבינות לבנות",
//           "גבינות עיזים",
//           "גבינות שמנת וממרחים"
//       ]
//   },
//   {
//       "_id": "יינות",
//       "subcategories": [
//           "יינות ללא אלכוהול",
//           "יינות לבנים",
//           "יינות אדומים"
//       ]
//   },
//   {
//       "_id": "שמנים ורטבים",
//       "subcategories": [
//           "שמנים",
//           "רטבי עגבניות",
//           "חומץ ומיצים",
//           "רטבים כלליים"
//       ]
//   }
// ]







