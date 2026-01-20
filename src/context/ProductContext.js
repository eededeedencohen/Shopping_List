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
  "שמנים ורטבים",
  "מוצרים ללא סיווג",
];

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
  המקפיא: [
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
  שימורים: ["מלפפון חמוץ", "תירס", "טונה", "פטריות", "זיתים"],
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
  "מוצרי בסיס לבישול": ["פתיתים", "פסטות ואטריות", "אורז", "קוסקוס"],
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
  בירות: [
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
  גבינות: [
    "גבינות עובש",
    "גבינות מלוחות",
    "גבינות צהובות",
    "לאבנה",
    "גבינות קשות",
    "גבינות לבנות",
    "גבינות עיזים",
    "גבינות שמנת וממרחים",
  ],
  יינות: ["יינות ללא אלכוהול", "יינות לבנים", "יינות אדומים"],
  "שמנים ורטבים": ["שמנים", "רטבי עגבניות", "חומץ ומיצים", "רטבים כלליים"],
};

const all_sub_categories = allCategories.map(
  (cat) => all_sub_categories_map[cat] || [],
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
            (p) => p.barcode === product.barcode,
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
          (p) => p.barcode === product.barcode,
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
