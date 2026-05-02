import { useEffect, useMemo, useRef, useState } from "react";
import { Spin } from "antd";
import {
  useCartState,
  useCartActions,
  useEnrichedProducts,
  useProductList,
  useUpdateActiveCart,
} from "../../hooks/appHooks";
import { useProductsLayout } from "../../context/ProductsLayoutContext";
import useVibrate from "../../hooks/useVibrate";

import listStyles from "./ProductsList.module.css";
import gridStyles from "./ProductsListGrid.module.css";
import "./ProductsListKeyframes.css";

import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import plusIcon from "./plus.svg";
import minusIcon from "./minus.svg";
import CategoryNavigation from "./CategoryNavigation";
import SubCategoryNavigation from "./SubCategoryNavigation";
import ProductComparisonModal from "../PriceList/productComparisonModal";
import ProductComparison from "../PriceList/productComparison";

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

const discountPriceFormat = ({ units, totalPrice }, styles) => (
  <div
    className={styles['list__discount-price']}
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

/* כפתורי הוספה/הורדה/אישור/מחיקה לסל
   ה-class `visible` קיים רק בתצוגת הרשימה — הכפתור לא מוצג ברשת,
   אז משתמשים תמיד ב-listStyles להצגה/הסתרה. */
const makeVisible = (button) => {
  if (button && listStyles.visible) button.classList.add(listStyles.visible);
};
const makeInvisible = (button) => {
  if (button && listStyles.visible) button.classList.remove(listStyles.visible);
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
  const { layout } = useProductsLayout();
  const vibrate = useVibrate();
  /* בתצוגת רשימה משתמשים ב-listStyles בלבד (התנהגות מקורית).
     בתצוגת רשת מצרפים את ה-classes משני המודולים, כך ש-listStyles
     מספק את הבסיס וה-gridStyles מבצע override רק על המקומות
     הספציפיים לפריסת הרשת. */
  const styles = useMemo(() => {
    if (layout !== "grid") return listStyles;
    const keys = new Set([
      ...Object.keys(listStyles),
      ...Object.keys(gridStyles),
    ]);
    const merged = {};
    keys.forEach((key) => {
      const a = listStyles[key] || "";
      const b = gridStyles[key] || "";
      merged[key] = `${a} ${b}`.trim();
    });
    return merged;
  }, [layout]);
  const {
    activeCategoryIndex,
    activeSubCategoryIndex,
    allCategories,
    all_sub_categories,
    setActiveCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProductList();

  const [productAmounts, setProductAmounts] = useState({});
  const [oldProductAmounts, setOldProductAmounts] = useState({});
  const [animatingProducts, setAnimatingProducts] = useState({}); // { barcode: 'up' | 'down' }

  useEffect(() => {
    sendActiveCart();
  }, [cart, sendActiveCart]); // ← מופעל רק כש-cart משתנה

  /* כאן נשמור את ה-inline style שנחיל על ה-container (כדי ליצור אנימציות) */
  const [containerStyle, setContainerStyle] = useState({});

  /* refs לזיהוי כיוון Swipe */
  const startTouch = useRef({ x: 0, y: 0 });
  const swipeDirection = useRef(null);

  const [selectedBarcode, setSelectedBarcode] = useState(null);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);

  const openComparisonModal = (barcode) => {
    setSelectedBarcode(barcode);
    setIsComparisonModalOpen(true);
  };
  const closeComparisonModal = () => {
    setIsComparisonModalOpen(false);
    setSelectedBarcode(null);
  };

  /* -------------------------------- */
  /* זיהוי תחילת נגיעה והחלקה         */
  /* -------------------------------- */
  const handleTouchStart = (event) => {
    swipeDirection.current = null;
    setContainerStyle({});
    const touch = event.touches[0];
    startTouch.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (event) => {
    const touch = event.touches[0];
    const moveX = touch.clientX;
    const moveY = touch.clientY;
    const deltaX = moveX - startTouch.current.x;
    const deltaY = moveY - startTouch.current.y;

    const SWIPE_THRESHOLD = 80; // כמה רחוק נחשב כהחלקה

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
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
  // const moveToPriceList = (barcode) => {
  //   nav(`/priceList/${barcode}`);
  // };

  const glassSquaresRef = useRef([]);

  /* הוספה לסל */
  const incrementAmount = (barcode) => {
    const newAmount = (productAmounts[barcode] || 0) + 1;
    const button = document.querySelector(`#add-to-cart-${barcode}`);
    setProductAmounts({ ...productAmounts, [barcode]: newAmount });

    // אנימציה למעלה
    setAnimatingProducts({ ...animatingProducts, [barcode]: "up" });
    setTimeout(() => {
      setAnimatingProducts((prev) => ({ ...prev, [barcode]: null }));
    }, 400);

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
    const currentAmount = productAmounts[barcode] || 0;
    if (currentAmount === 0) return; // לא מפחיתים מתחת ל-0

    const newAmount = currentAmount - 1;
    const button = document.querySelector(`#add-to-cart-${barcode}`);
    setProductAmounts({ ...productAmounts, [barcode]: newAmount });

    // אנימציה למטה
    setAnimatingProducts({ ...animatingProducts, [barcode]: "down" });
    setTimeout(() => {
      setAnimatingProducts((prev) => ({ ...prev, [barcode]: null }));
    }, 400);

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

  /* תצוגת רשת — +/- מעדכנים את העגלה ישירות, בלי כפתור אישור */
  const directIncrement = (product) => {
    const current = product.amountInCart || 0;
    vibrate(120);
    setAnimatingProducts((prev) => ({ ...prev, [product.barcode]: "up" }));
    setTimeout(() => {
      setAnimatingProducts((prev) => ({ ...prev, [product.barcode]: null }));
    }, 400);
    if (current === 0) add(product.barcode, 1);
    else update(product.barcode, current + 1);
  };

  const directDecrement = (product) => {
    const current = product.amountInCart || 0;
    if (current <= 0) return;
    vibrate(120);
    setAnimatingProducts((prev) => ({ ...prev, [product.barcode]: "down" }));
    setTimeout(() => {
      setAnimatingProducts((prev) => ({ ...prev, [product.barcode]: null }));
    }, 400);
    if (current === 1) remove(product.barcode);
    else update(product.barcode, current - 1);
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
      <div className={styles['spinner-container']}>
        <Spin size="large" />
        <p>טוען מוצרים...</p>
      </div>
    );
  }

  return (
    <>
      {/* Glass background squares - מחוץ לcontainer המונפש כדי שלא יושפע מדיפדוף */}
      <div className={styles['glass-bg']}>
        {(() => {
          if (!glassSquaresRef.current.length) {
            glassSquaresRef.current = Array.from({ length: 25 }, () => ({
              size: 40 + Math.random() * 60,
              left: Math.random() * 100,
              top: Math.random() * 100,
              duration: 20 + Math.random() * 20,
              delay: -Math.random() * 20,
            }));
          }
          return glassSquaresRef.current.map((sq, idx) => (
            <div
              key={idx}
              className={styles['glass-square']}
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

      <div className={styles['list__product-list']}>
        {/* ניווט הקטגוריות */}
        <CategoryNavigation />
        {/* ניווט תתי־קטגוריות */}
        <SubCategoryNavigation />

        <div className={styles['list__products-wrapper']}>
          <ProductComparisonModal
            isOpen={isComparisonModalOpen}
            onClose={closeComparisonModal}
          >
            <ProductComparison barcode={selectedBarcode} />
          </ProductComparisonModal>
          <div
            className={styles['list__products-container']}
            style={containerStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {filteredProducts.map((product) => (
              <div className={styles['list__product-card']} key={product.barcode}>
                {product.discount && (
                  <div className={styles['list__product-badge']}>מבצע</div>
                )}

                <div className={styles['list__product-details']}>
                  <div className={styles['list__product-data']}>
                    <div className={styles['list__product-name']}>
                      <p>{product.name}</p>
                    </div>
                    <div className={styles['list__product-info']}>
                      <div className={styles['list__product-weight']}>
                        <p>{product.weight}</p>
                        <p>{convertWeightUnit(product.unitWeight)}</p>
                      </div>
                      <div className={styles['list__separator']}>|</div>
                      <div className={styles['list__product-brand']}>
                        <p>{product.brand}</p>
                      </div>
                    </div>
                    <div className={styles['list__product-price']}>
                      {typeof product.unitPrice === "number" ? (
                        <>
                          <p>{priceFormat(product.unitPrice)}</p>
                          <p>₪</p>
                        </>
                      ) : (
                        <p>מחיר לא זמין בסופר</p>
                      )}
                    </div>
                    {product.discount && discountPriceFormat(product.discount, styles)}
                  </div>
                  <div
                    className={styles['list__product-image']}
                    onClick={() => openComparisonModal(product.barcode)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <ProductImageDisplay barcode={product.barcode} />
                  </div>
                </div>
                <div className={styles['list__product-operations']}>
                  <div
                    id={`add-to-cart-${product.barcode}`}
                    className={styles['list__product-operations__confirm']}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAmount(product.barcode);
                    }}
                  >
                    אין שינוי
                  </div>
                  <div
                    className={`${styles['list__product-operations__add']} ${
                      animatingProducts[product.barcode] === "up"
                        ? styles['animate-bounce-plus']
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (layout === "grid") directIncrement(product);
                      else incrementAmount(product.barcode);
                    }}
                  >
                    <img src={plusIcon} alt="+" />
                  </div>
                  <div
                    className={`${styles['list__product-operations__quantity']} ${
                      animatingProducts[product.barcode] === "up"
                        ? styles['quantity-glow-up']
                        : animatingProducts[product.barcode] === "down"
                        ? styles['quantity-glow-down']
                        : ""
                    }`}
                  >
                    <span
                      className={
                        animatingProducts[product.barcode] === "up"
                          ? styles['animate-up']
                          : animatingProducts[product.barcode] === "down"
                          ? styles['animate-down']
                          : ""
                      }
                    >
                      {layout === "grid"
                        ? product.amountInCart || 0
                        : productAmounts[product.barcode] || 0}
                    </span>
                  </div>
                  <div
                    className={`${styles['list__product-operations__reduce']} ${
                      animatingProducts[product.barcode] === "down"
                        ? styles['animate-bounce-minus']
                        : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (layout === "grid") directDecrement(product);
                      else decrementAmount(product.barcode);
                    }}
                  >
                    <img src={minusIcon} alt="-" />
                  </div>
                  <div></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductsList;