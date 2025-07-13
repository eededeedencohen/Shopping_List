import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Spin } from "antd";
import {
  useCartState,
  useCartActions,
  useEnrichedProducts,
  useProductList,
  useUpdateActiveCart,
  useGroupState,
  useGroupActions,
  useProductSearch,
} from "../../hooks/appHooks";
import ProductsListGroup from "./ProductsListGroup"; // ← הוסף

import "./ProductsList.css";
import "./ProductListGroups.css";
import "./ProductSearch.css";
import { useNavigate } from "react-router";

import Image from "./Images";
import CategoryNavigation from "./CategoryNavigation";
import SubCategoryNavigation from "./SubCategoryNavigation";
import ModalShowProductGroups from "./ModalShowProductGroups";
import ModalShowAllGroups from "./ModalShowAllGroups";

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
function ProductsListGroups() {
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

  const { groups } = useGroupState(); // אם יש צורך במצב קבוצות, ניתן להוסיף כאן
  const { updateGroup, addBarcodeToGroup, removeBarcodeFromGroup } =
    useGroupActions();

  const nav = useNavigate();

  const [productAmounts, setProductAmounts] = useState({});
  const [oldProductAmounts, setOldProductAmounts] = useState({});
  const [isModalGroupsOpen, setIsModalGroupsOpen] = useState(false);
  const [isModalAllGroupsOpen, setIsModalAllGroupsOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);
  const [EditedGroup, setEditedGroup] = useState(null);
  const [viewGroupName, setViewGroupName] = useState(null); // ← הוסף
  const [isModalGroupOpen, setIsModalGroupOpen] = useState(false); // ← הוסף
  const [searchQuery, setSearchQuery] = useState(""); // ← הוסף
  const [sortByGroupCount, setSortByGroupCount] = useState(false); // מיון לפי קבוצות
  const [showAllProducts, setShowAllProducts] = useState(false); // הצג הכל

  const productSearch = useProductSearch(); // ← הוסף

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
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: 0 });
      return;
    }

    // אם לא היה בסל - הוספה
    if (!oldProductAmounts[barcode]) {
      changeButtonToNoChangeAmountButton(button);
      add(barcode, amount);
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
      return;
    }

    // אחרת - עדכון
    changeButtonToNoChangeAmountButton(button);
    update(barcode, amount);
    setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
  };

  /* ────────────────────────────────────────────── */
  /*   סינון + חיפוש + “הצג הכול” + מיון יעיל      */
  /* ────────────────────────────────────────────── */

  /* 1) קטגוריה / תת־קטגוריה נוכחית */
  const currentCategory = allCategories[activeCategoryIndex];
  const subCats = all_sub_categories[activeCategoryIndex] || [];
  const currentSubCategory = subCats[activeSubCategoryIndex];

  /* 2) סינון לפי קטגוריה */
  const filteredProducts = productsWithDetails.filter((p) => {
    if (p.category !== currentCategory) return false;
    if (currentSubCategory) return p.subcategory === currentSubCategory;
    return true;
  });

  /* 3) מפה: ברקוד → כמות קבוצות (מחושב פעם אחת) */
  const groupCountMap = useMemo(() => {
    const map = {};
    groups.forEach(({ barcodes }) =>
      barcodes.forEach((bc) => (map[bc] = (map[bc] || 0) + 1))
    );
    return map;
  }, [groups]);

  /* 4) פונקציה נוחה לשימוש */
  const getGroupCount = useCallback(
    (barcode) => groupCountMap[barcode] || 0,
    [groupCountMap] // ← מתעדכן רק כש-groups משתנה
  );

  /* 5) בניית productsToRender – ממואיז */
  const productsToRender = useMemo(() => {
    /* בסיס הרשימה */
    let base;
    if (searchQuery.trim()) {
      base = productSearch(searchQuery)
        .map((p) => productsWithDetails.find((e) => e.barcode === p.barcode))
        .filter(Boolean);
    } else if (showAllProducts) {
      base = productsWithDetails;
    } else {
      base = filteredProducts;
    }

    /* מיון לפי כמות הקבוצות (קטן→גדול) */
    if (sortByGroupCount) {
      base = [...base].sort(
        (a, b) => getGroupCount(a.barcode) - getGroupCount(b.barcode)
      );
    }

    return base;
  }, [
    productsWithDetails,
    filteredProducts,
    searchQuery,
    showAllProducts,
    sortByGroupCount,
    productSearch,
    getGroupCount,
  ]);

  const handleSelectGroup = (groupName) => {
    setEditedGroup(groupName);
  };

  /* ===== פונקציות-עזר לקבוצות ===== */
  /* 4-bis) בדיקה אם מוצר שייך לקבוצה (ממואיז) */
  const isProductInGroup = useCallback(
    (barcode, groupName) => {
      const group = groups.find((g) => g.groupName === groupName);
      return group ? group.barcodes.includes(barcode) : false;
    },
    [groups]
  );

  const handleUpdateGroup = async (groupName) => {
    const currentBarcodes = groups.find(
      (g) => g.groupName === groupName
    ).barcodes;
    // update in the server by using the updateGroup function
    try {
      await updateGroup(groupName, { barcodes: currentBarcodes });
      setEditedGroup(null); // Reset the edited group after updating
    } catch (error) {
      console.error("Error updating group:", error);
    }
  };

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
      <button onClick={() => setIsModalAllGroupsOpen(true)}>
        הצג קבוצות מוצרים
      </button>
      {EditedGroup && (
        <button
          onClick={() => {
            handleUpdateGroup(EditedGroup);
          }}
        >
          {EditedGroup} :סיום עריכת:
        </button>
      )}
      <input
        type="text"
        className="product-search-input" /* עיצוב ב-CSS המצורף */
        placeholder="חיפוש מוצר..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <div className="list__controls">
        <label className="list__checkbox">
          <input
            type="checkbox"
            checked={sortByGroupCount}
            onChange={(e) => setSortByGroupCount(e.target.checked)}
          />
          מיין לפי כמות קבוצות
        </label>

        <label className="list__checkbox">
          <input
            type="checkbox"
            checked={showAllProducts}
            onChange={(e) => setShowAllProducts(e.target.checked)}
          />
          הצג הכל
        </label>
      </div>

      <ModalShowProductGroups
        isOpen={isModalGroupsOpen}
        onClose={() => setIsModalGroupsOpen(false)}
        barcode={selectedBarcode} // כאן תעביר את הברקוד המתאים אם יש צורך
        onSelectGroup={handleSelectGroup}
      />
      <ModalShowAllGroups
        isOpen={isModalAllGroupsOpen}
        onClose={() => setIsModalAllGroupsOpen(false)}
        onSelectGroup={handleSelectGroup}
      />
      <ProductsListGroup /* ← הוסף בלוק חדש */
        isOpen={isModalGroupOpen}
        groupName={viewGroupName}
        onClose={() => setIsModalGroupOpen(false)}
      />

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
          {productsToRender.map((product) => (
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
                  <div className="list__product-tags">
                    {groups
                      .filter((g) => g.barcodes.includes(product.barcode))
                      .map((g) => (
                        <span
                          key={g.groupName}
                          className="tag"
                          onClick={() => {
                            // ← הוסף
                            setViewGroupName(g.groupName);
                            setIsModalGroupOpen(true);
                          }} // ← עד כאן
                        >
                          {g.groupName}
                        </span>
                      ))}
                  </div>
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
                <div>
                  {!EditedGroup && (
                    <button
                      className="show-groups-button"
                      onClick={() => {
                        setSelectedBarcode(product.barcode);
                        setIsModalGroupsOpen(true);
                      }}
                    >
                      הצג קבוצות
                    </button>
                  )}
                  {
                    // case EditedGroup is not null and the product is in the group -> remove from the group state
                    EditedGroup &&
                      isProductInGroup(product.barcode, EditedGroup) && (
                        <button
                          className="remove-from-group-button"
                          onClick={() => {
                            removeBarcodeFromGroup(
                              EditedGroup,
                              product.barcode
                            );
                          }}
                        >
                          הסר מקבוצה
                        </button>
                      )
                  }
                  {
                    // case EditedGroup is not null and the product is not in the group -> remove from the group state
                    EditedGroup &&
                      !isProductInGroup(product.barcode, EditedGroup) && (
                        <button
                          className="add-to-group-button"
                          onClick={() => {
                            addBarcodeToGroup(EditedGroup, product.barcode);
                          }}
                        >
                          הוסף לקבוצה
                        </button>
                      )
                  }
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsListGroups;
