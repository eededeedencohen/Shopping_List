import { createContext, useContext, useEffect, useState } from "react";
import { getAllProducts } from "../services/productService"

const ProductContext2 = createContext(null);

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
  "תבלינים, אבקות ומרקי אינסטנט",
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
  (cat) => all_sub_categories_map[cat] || []
);

export const ProductContextProvider2 = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [activeSubCategoryIndex, setActiveSubCategoryIndex] = useState(0);

  /* ■■■ שינוי עיקרי – הסרה של JSON.parse מיותר ■■■ */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        /* getAllProducts כבר מחזיר מערך של מוצרים */
        const productsData = await getAllProducts();
        console.log("Products loaded:", productsData);
        setProducts(productsData);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Removed products from dependencies

  return (
    <ProductContext2.Provider
      value={{
        products,
        loading,
        error,
        allCategories,
        all_sub_categories,
        activeCategoryIndex,
        setActiveCategoryIndex,
        activeSubCategoryIndex,
        setActiveSubCategoryIndex,
      }}
    >
      {children}
    </ProductContext2.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext2);
  if (!ctx) throw new Error("ProductContext was not provided correctly");
  return ctx;
};
