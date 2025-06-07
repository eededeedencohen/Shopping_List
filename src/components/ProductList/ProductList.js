import { useEffect, useRef, useState } from "react";
import { Spin } from "antd";
import {
  useCartState,
  useCartActions,
  useEnrichedProducts,
  useProductList,
  useUpdateActiveCart,
} from "../../hooks/appHooks";

import "./ProductsList.css";
import { useNavigate } from "react-router";

import Image from "./Images";
import CategoryNavigation from "./CategoryNavigation";
import SubCategoryNavigation from "./SubCategoryNavigation";

/* -------------------------------- */
/* פונקציות עזר (אינן משתנות)      */
/* -------------------------------- */
export const convertWeightUnit = (weightUnit) => {
  if (!weightUnit) return "";
  switch (weightUnit.toLowerCase()) {
    case "g":
      return "גרם";
    case "kg":
      return 'ק"ג';
    case "ml":
      return 'מ"ל';
    case "l":
      return "ליטר";
    case "u":
      return "יחידות";
    default:
      return weightUnit;
  }
};

// const priceFormat = (price) => price.toFixed(2);
const priceFormat = (price) => {
  if (typeof price !== "number") return "—";
  return price.toFixed(2);
};

const discountPriceFormat = ({ units, totalPrice }) => (
  <div
    className="list__discount-price"
    style={{
      display: "flex",
      flexDirection: "row-reverse",
      alignItems: "center",
      color: "#ff0000",
      fontWeight: "bold",
    }}
  >
    <p style={{ marginLeft: "0.3rem" }}>{units}</p>
    <p>{"יחידות ב"}</p>
    <p>{" - "}</p>
    <p>{priceFormat(totalPrice)}</p>
    <p style={{ fontWeight: "bold" }}>{"₪"}</p>
  </div>
);

/* כפתורי הוספה/הורדה/אישור/מחיקה לסל */
const makeVisible = (button) => {
  button.classList.add("visible");
};
const makeInvisible = (button) => {
  button.classList.remove("visible");
};
const changeButtonToAddProductButton = (button) => {
  button.style.backgroundColor = "#00c200";
  makeVisible(button);
  button.innerText = "הוסף לסל";
};
const changeButtonToNoChangeAmountButton = (button) => {
  makeInvisible(button);
};
const changeButtonToUpdateAmountButton = (button) => {
  button.style.backgroundColor = "#008cba";
  makeVisible(button);
  button.innerText = "עדכן כמות";
};
const changeButtonToDeleteProductButton = (button) => {
  button.style.backgroundColor = "#ff0000";
  makeVisible(button);
  button.innerText = "הסר מהסל";
};

/* -------------------------------- */
/*       ProductsList component     */
/* -------------------------------- */
function ProductsList() {
  const { add, remove, update } = useCartActions();
  const { productsWithDetails, isLoadingProducts } = useEnrichedProducts();
  const { cart } = useCartState();
  const { sendActiveCart } = useUpdateActiveCart();
  const {
    activeCategoryIndex,
    activeSubCategoryIndex,
    allCategories,
    all_sub_categories,
    setActiveCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProductList();

  const nav = useNavigate();

  const [productAmounts, setProductAmounts] = useState({});
  const [oldProductAmounts, setOldProductAmounts] = useState({});

  useEffect(() => {
    sendActiveCart();
  }, [cart, sendActiveCart]); // ← מופעל רק כש-cart משתנה

  /* כאן נשמור את ה-inline style שנחיל על ה-container (כדי ליצור אנימציות) */
  const [containerStyle, setContainerStyle] = useState({});

  /* refs לזיהוי כיוון Swipe */
  const startTouch = useRef({ x: 0 });
  const swipeDirection = useRef(null);

  /* -------------------------------- */
  /* זיהוי תחילת נגיעה והחלקה         */
  /* -------------------------------- */
  const handleTouchStart = (event) => {
    swipeDirection.current = null;
    setContainerStyle({});
    startTouch.current.x = event.touches[0].clientX;
  };

  const handleTouchMove = (event) => {
    const moveX = event.touches[0].clientX;
    const deltaX = moveX - startTouch.current.x;
    if (Math.abs(deltaX) > 150) {
      swipeDirection.current = deltaX > 0 ? "right" : "left";
    }
  };

  /**
   * פונקציות עזר להפעלת "המעבר המשולש" (3 שלבים) שהשתמשת בהם בקטגוריות:
   * 1) middleToX
   * 2) XToY ב-1ms
   * 3) YToMiddle
   */
  const animateLeft = () => {
    // הדף זז שמאלה
    setContainerStyle({ animation: "middleToLeft 0.2s ease" });
    setTimeout(() => {
      // קפיצה לימין
      setContainerStyle({
        animation: "leftToRight 1ms steps(1) forwards",
      });
    }, 200);
    setTimeout(() => {
      // כניסה מימין לאמצע
      setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
    }, 201);
  };

  const animateRight = () => {
    // הדף זז ימינה
    setContainerStyle({ animation: "middleToRight 0.2s ease" });
    setTimeout(() => {
      // קפיצה לשמאל
      setContainerStyle({
        animation: "rightToLeft 1ms steps(1) forwards",
      });
    }, 200);
    setTimeout(() => {
      // כניסה משמאל לאמצע
      setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
    }, 201);
  };

  /* -------------------------------- */
  /* כשמשחררים האצבע -> מעבר תתי־קטגוריה/קטגוריה */
  /* -------------------------------- */
  const handleTouchEnd = () => {
    const totalCategories = allCategories.length;
    const subCats = all_sub_categories[activeCategoryIndex] || [];
    const totalSubCats = subCats.length;

    if (swipeDirection.current === "right") {
      // החלקה ימינה
      if (activeSubCategoryIndex > 0) {
        // יש תתי־קטגוריה קודמת => פשוט מפחיתים באחד
        setActiveSubCategoryIndex(activeSubCategoryIndex - 1);
        // אנימציה משולשת (כמו בקטגוריות)
        animateRight();
      } else {
        // wrap-around לקטגוריה הקודמת
        const prevIndex =
          (activeCategoryIndex - 1 + totalCategories) % totalCategories;
        setActiveCategoryIndex(prevIndex);

        // קובעים את תת־הקטגוריה האחרונה של הקטגוריה הקודמת
        const prevSub = all_sub_categories[prevIndex] || [];
        setActiveSubCategoryIndex(prevSub.length ? prevSub.length - 1 : 0);

        // אנימציה משולשת
        animateRight();
      }
      window.scrollTo(0, 0);
    } else if (swipeDirection.current === "left") {
      // החלקה שמאלה
      if (activeSubCategoryIndex < totalSubCats - 1) {
        // יש עוד תתי־קטגוריות => מוסיפים 1
        setActiveSubCategoryIndex(activeSubCategoryIndex + 1);
        // אנימציה
        animateLeft();
      } else {
        // wrap-around לקטגוריה הבאה
        const nextIndex = (activeCategoryIndex + 1) % totalCategories;
        setActiveCategoryIndex(nextIndex);
        setActiveSubCategoryIndex(0);

        // אנימציה
        animateLeft();
      }
      window.scrollTo(0, 0);
    } else {
      // לא הייתה החלקה
      setContainerStyle({});
    }
  };

  /* מעבר לעמוד מחיר */
  const moveToPriceList = (barcode) => {
    nav(`/priceList/${barcode}`);
  };

  const glassSquaresRef = useRef([]);

  /* הוספה לסל */
  const incrementAmount = (barcode) => {
    const newAmount = (productAmounts[barcode] || 0) + 1;
    const button = document.querySelector(`#add-to-cart-${barcode}`);
    setProductAmounts({ ...productAmounts, [barcode]: newAmount });

    if (!oldProductAmounts[barcode]) {
      changeButtonToAddProductButton(button);
    } else {
      if (newAmount === 0) {
        changeButtonToDeleteProductButton(button);
      } else if (newAmount === oldProductAmounts[barcode]) {
        changeButtonToNoChangeAmountButton(button);
      } else {
        changeButtonToUpdateAmountButton(button);
      }
    }
  };

  /* הורדה מהסל */
  const decrementAmount = (barcode) => {
    const newAmount = Math.max(0, (productAmounts[barcode] || 0) - 1);
    const button = document.querySelector(`#add-to-cart-${barcode}`);
    setProductAmounts({ ...productAmounts, [barcode]: newAmount });

    if (!oldProductAmounts[barcode]) {
      if (newAmount === 0) {
        changeButtonToNoChangeAmountButton(button);
      } else {
        changeButtonToAddProductButton(button);
      }
    } else {
      if (newAmount === 0) {
        changeButtonToDeleteProductButton(button);
      } else if (newAmount === oldProductAmounts[barcode]) {
        changeButtonToNoChangeAmountButton(button);
      } else {
        changeButtonToUpdateAmountButton(button);
      }
    }
  };

  /* כשלוחצים על הכפתור (הוסף/עדכן/מחק) */
  const updateAmount = async (barcode) => {
    const amount = productAmounts[barcode] || 0;
    const button = document.querySelector(`#add-to-cart-${barcode}`);

    if (amount === 0) {
      // מחיקה
      remove(barcode);
      changeButtonToNoChangeAmountButton(button);
      // await deleteProductFromCart(userId, barcode);
      // await loadCart(userId);
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: 0 });
      return;
    }

    // אם לא היה בסל - הוספה
    if (!oldProductAmounts[barcode]) {
      changeButtonToNoChangeAmountButton(button);
      add(barcode, amount);
      // await addProductToCart(userId, barcode, amount);
      // await loadCart(userId);
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
      return;
    }

    // אחרת - עדכון
    changeButtonToNoChangeAmountButton(button);
    update(barcode, amount);
    // await updateProductInCart(userId, barcode, amount);
    // await loadCart(userId);
    setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
  };

  /* סינון מוצרים לפי קטגוריה ותת־קטגוריה פעילים */
  const currentCategory = allCategories[activeCategoryIndex];
  const subCats = all_sub_categories[activeCategoryIndex] || [];
  const currentSubCategory = subCats[activeSubCategoryIndex];

  // const filteredProducts = products.filter((product) => {
  const filteredProducts = productsWithDetails.filter((product) => {
    if (product.category !== currentCategory) return false;
    if (currentSubCategory) {
      return product.subcategory === currentSubCategory;
    }
    return true;
  });

  if (isLoadingProducts) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
        <p>טוען מוצרים...</p>
      </div>
    );
  }

  return (
    <div className="list__product-list">
      {/* ניווט הקטגוריות */}
      <CategoryNavigation />
      {/* ניווט תתי־קטגוריות */}
      <SubCategoryNavigation />

      <div className="list__products-wrapper">
        <div
          className="list__products-container"
          style={containerStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Glass background squares */}

          <div className="glass-bg">
            {(() => {
              // מאחסן נתונים קבועים ברינדרים הבאים
              if (!glassSquaresRef.current.length) {
                glassSquaresRef.current = Array.from({ length: 25 }, () => ({
                  size: 40 + Math.random() * 60, // 40-100px
                  left: Math.random() * 100, // %
                  top: Math.random() * 100, // %
                  duration: 20 + Math.random() * 20, // 20-40s
                  delay: -Math.random() * 20, // התחלה אקראית
                }));
              }
              return glassSquaresRef.current.map((sq, idx) => (
                <div
                  key={idx}
                  className="glass-square"
                  style={{
                    width: `${sq.size}px`,
                    height: `${sq.size}px`,
                    left: `${sq.left}%`,
                    top: `${sq.top}%`,
                    animationDuration: `${sq.duration}s`,
                    animationDelay: `${sq.delay}s`,
                  }}
                />
              ));
            })()}
          </div>
          {filteredProducts.map((product) => (
            <div className="list__product-card" key={product.barcode}>



              {product.discount && (
                <div className="list__product-badge">מבצע</div>
              )}

              <div className="list__product-details">
                <div className="list__product-data">
                  <div className="list__product-name">
                    <p>{product.name}</p>
                  </div>
                  <div className="list__product-info">
                    <div className="list__product-weight">
                      <p>{product.weight}</p>
                      <p>{convertWeightUnit(product.unitWeight)}</p>
                    </div>
                    <div className="list__separator">|</div>
                    <div className="list__product-brand">
                      <p>{product.brand}</p>
                    </div>
                  </div>
                  <div className="list__product-price">
                    {typeof product.unitPrice === "number" ? (
                      <>
                        <p>{priceFormat(product.unitPrice)}</p>
                        <p style={{ fontSize: "1.4rem" }}>₪</p>
                      </>
                    ) : (
                      <p>מחיר לא זמין בסופר</p>
                    )}
                  </div>
                  {product.discount && discountPriceFormat(product.discount)}
                </div>
                <div
                  className="list__product-image"
                  onClick={() => moveToPriceList(product.barcode)}
                >
                  <Image barcode={product.barcode} />
                </div>
              </div>
              <div className="list__product-operations">
                <div
                  id={`add-to-cart-${product.barcode}`}
                  className="list__product-operations__confirm"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateAmount(product.barcode);
                  }}
                >
                  אין שינוי
                </div>
                <div
                  className="list__product-operations__add"
                  onClick={(e) => {
                    e.stopPropagation();
                    incrementAmount(product.barcode);
                  }}
                >
                  +
                </div>
                <div className="list__product-operations__quantity">
                  <span>{productAmounts[product.barcode] || 0}</span>
                </div>
                <div
                  className="list__product-operations__reduce"
                  onClick={(e) => {
                    e.stopPropagation();
                    decrementAmount(product.barcode);
                  }}
                >
                  -
                </div>
                <div></div>
              </div>
            </div>
            
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsList;
