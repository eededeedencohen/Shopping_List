// import React, { useEffect, useRef, useState } from "react";
// import { useProducts } from "../../context/ProductContext";
// import { useCart } from "../../context/CartContext";
// import "./ProductsListManager.css";
// import { useNavigate } from "react-router";
// import {
//   updateProductInCart,
//   addProductToCart,
//   deleteProductFromCart,
// } from "../../network/cartService";
// import {
//   getAllAlternativeProducts,
//   getAlternativeProductByBarcode,
//   createAlternativeProduct,
//   updateAlternativeProductByBarcode,
// } from "../../network/alternative-productsService";

// import AlternativeProductsModal from "./AlternativeProductsModal"; // הרכיב החדש

// import Image from "./Images";
// import CategoryNavigation from "./CategoryNavigation";
// import SubCategoryNavigation from "./SubCategoryNavigation";

// /* -------------------------------- */
// /* פונקציות עזר (אינן משתנות)      */
// /* -------------------------------- */
// export const convertWeightUnit = (weightUnit) => {
//   if (!weightUnit) return "";
//   switch (weightUnit.toLowerCase()) {
//     case "g":
//       return "גרם";
//     case "kg":
//       return 'ק"ג';
//     case "ml":
//       return 'מ"ל';
//     case "l":
//       return "ליטר";
//     case "u":
//       return "יחידות";
//     default:
//       return weightUnit;
//   }
// };

// const maxCharacters = (str, maxLen) => {
//   if (!str) return "";
//   return str.length > maxLen ? "..." + str.substring(0, maxLen - 3) : str;
// };

// const priceFormat = (price) => price.toFixed(2);

// const discountPriceFormat = (price) => {
//   const { units, totalPrice } = price.discount;
//   return (
//     <div
//       className="list__discount-price"
//       style={{
//         display: "flex",
//         flexDirection: "row-reverse",
//         alignItems: "center",
//         color: "#ff0000",
//         fontWeight: "bold",
//       }}
//     >
//       <p style={{ marginLeft: "0.3rem" }}>{units}</p>
//       <p>{"יחידות ב"}</p>
//       <p>{" - "}</p>
//       <p>{priceFormat(totalPrice)}</p>
//       <p style={{ fontWeight: "bold" }}>{"₪"}</p>
//     </div>
//   );
// };

// const makeInvisible = (button) => {
//   button.classList.remove("visible");
// };

// const changeButtonToNoChangeAmountButton = (button) => {
//   makeInvisible(button);
// };

// function ProductListManager() {
//   const {
//     products,
//     allCategories,
//     all_sub_categories,
//     activeCategoryIndex,
//     setActiveCategoryIndex,
//     activeSubCategoryIndex,
//     setActiveSubCategoryIndex,
//   } = useProducts();

//   const { getProductsAmountInCart, loadCart } = useCart();
//   const nav = useNavigate();

//   const [productAmounts, setProductAmounts] = useState({});
//   const [oldProductAmounts, setOldProductAmounts] = useState({});
//   const [isLoadData, setIsLoadData] = useState(false);

//   //=================================================================================
//   //               ניהול מוצרים חלופיים
//   //=================================================================================
//   const [allAlternativeProducts, setAllAlternativeProducts] = useState([]);
//   const [selectedBarcode, setSelectedBarcode] = useState(null); // ברקוד שבעריכה
//   const [groupData, setGroupData] = useState({}); // מילון: barcode ראשי -> מערך ברקודים חלופיים

//   useEffect(() => {
//     const loadAlternativeProducts = async () => {
//       const allAlternatives = await getAllAlternativeProducts();
//       setAllAlternativeProducts(allAlternatives);
//     };
//     loadAlternativeProducts();
//   }, []);

//   const hasAlternativeProducts = (barcode) => {
//     // return true if barcode has alternative products and its list is not empty:
//     const alternativeProduct = allAlternativeProducts.find(
//       (item) => item.barcode === barcode
//     );
//     return alternativeProduct && alternativeProduct.alternativesS.length > 0;
//   };

//   // פונקציה להעתקה ושמירה:
// const handleCopyAndSave = async (sourceBarcode) => {
//   try {
//     // 1) נטען מהשרת את רשימת החלופות של sourceBarcode
//     const response = await getAlternativeProductByBarcode(sourceBarcode);
//     // 2) בהנחה שכבר הבטחת שיש לו רשימת חלופות
//     const fromAlternatives = response.data.alternativeProduct.alternatives;

//     // 3) מעדכן את groupData עבור ה-barcode שבעריכה
//     setGroupData((prev) => ({
//       ...prev,
//       [selectedBarcode]: fromAlternatives
//     }));

//     // 4) שומר בשרת עבור selectedBarcode
//     await handleCloseBarcode(selectedBarcode);

//   } catch (error) {
//     console.error("Error copying from source barcode:", error);
//   }
// };

//   // פותח עריכת קבוצה לברקוד מסוים
//   const handleOpenBarcode = async (barcode) => {
//     if (selectedBarcode === null) {
//       setSelectedBarcode(barcode);

//       try {
//         const response = await getAlternativeProductByBarcode(barcode);
//         if (response?.data?.alternativeProduct) {
//           setGroupData({
//             [barcode]: response.data.alternativeProduct.alternatives,
//           });
//         } else {
//           setGroupData({ [barcode]: [] });
//         }
//       } catch (error) {
//         console.error("Error fetching alternative product:", error);
//         setGroupData({ [barcode]: [] });
//       }
//     }
//   };

//   // סוגר עריכת קבוצה ושומר
//   const handleCloseBarcode = async (barcode) => {
//     if (selectedBarcode === barcode) {
//       try {
//         const existingAlternative = await getAlternativeProductByBarcode(barcode);
//         if (existingAlternative?.data?.alternativeProduct) {
//           await updateAlternativeProductByBarcode(barcode, groupData[barcode]);
//         } else {
//           await createAlternativeProduct(barcode, groupData[barcode]);
//         }
//       } catch (error) {
//         console.error("Error updating alternative product:", error);
//       }
//       // יציאה ממצב עריכה
//       setSelectedBarcode(null);
//       setGroupData({});
//     }
//   };

//   // טוגגל - הוספה/הסרה של מוצר לרשימה של ברקוד נבחר
//   const handleToggleAlternative = (barcode) => {
//     if (!selectedBarcode) return;
//     setGroupData((prevData) => {
//       const currentAlternatives = prevData[selectedBarcode] || [];
//       if (currentAlternatives.includes(barcode)) {
//         // הסר
//         return {
//           ...prevData,
//           [selectedBarcode]: currentAlternatives.filter(
//             (item) => item !== barcode
//           ),
//         };
//       } else {
//         // הוסף
//         return {
//           ...prevData,
//           [selectedBarcode]: [...currentAlternatives, barcode],
//         };
//       }
//     });
//   };

//   //=================================================================================
//   // סטייטים לניהול המודאל החדש
//   //=================================================================================
//   const [showModal, setShowModal] = useState(false);
//   const [alternativesToShow, setAlternativesToShow] = useState([]);

//   const handleShowAlternatives = (barcode) => {
//     const altBarcodes = groupData[barcode] || [];
//     setAlternativesToShow(altBarcodes);
//     setShowModal(true);
//   };

//   //=================================================================================
//   const userId = "1"; // מזהה משתמש לדוגמה
//   const [containerStyle, setContainerStyle] = useState({});

//   const startTouch = useRef({ x: 0 });
//   const swipeDirection = useRef(null);

//   // טעינת כמות מוצרים מהסל
//   useEffect(() => {
//     const loadAmounts = async () => {
//       setIsLoadData(true);
//       const amounts = await getProductsAmountInCart(userId);
//       const amountsObject = {};
//       amounts.cart.products.forEach((p) => {
//         amountsObject[p.barcode] = p.amount;
//       });
//       setProductAmounts(amountsObject);
//       setOldProductAmounts(amountsObject);
//       setIsLoadData(false);
//     };
//     loadAmounts();
//   }, [getProductsAmountInCart, userId]);

//   if (isLoadData) {
//     return <div>Loading Amounts...</div>;
//   }

//   // זיהוי החלקה (Swipe) ימין/שמאל
//   const handleTouchStart = (event) => {
//     swipeDirection.current = null;
//     setContainerStyle({});
//     startTouch.current.x = event.touches[0].clientX;
//   };

//   const handleTouchMove = (event) => {
//     const moveX = event.touches[0].clientX;
//     const deltaX = moveX - startTouch.current.x;
//     if (Math.abs(deltaX) > 150) {
//       swipeDirection.current = deltaX > 0 ? "right" : "left";
//     }
//   };

//   const animateLeft = () => {
//     setContainerStyle({ animation: "middleToLeft 0.2s ease" });
//     setTimeout(() => {
//       setContainerStyle({ animation: "leftToRight 1ms steps(1) forwards" });
//     }, 200);
//     setTimeout(() => {
//       setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
//     }, 201);
//   };

//   const animateRight = () => {
//     setContainerStyle({ animation: "middleToRight 0.2s ease" });
//     setTimeout(() => {
//       setContainerStyle({ animation: "rightToLeft 1ms steps(1) forwards" });
//     }, 200);
//     setTimeout(() => {
//       setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
//     }, 201);
//   };

//   const handleTouchEnd = () => {
//     const totalCategories = allCategories.length;
//     const subCats = all_sub_categories[activeCategoryIndex] || [];
//     const totalSubCats = subCats.length;

//     if (swipeDirection.current === "right") {
//       if (activeSubCategoryIndex > 0) {
//         setActiveSubCategoryIndex(activeSubCategoryIndex - 1);
//         animateRight();
//       } else {
//         const prevIndex =
//           (activeCategoryIndex - 1 + totalCategories) % totalCategories;
//         setActiveCategoryIndex(prevIndex);
//         const prevSub = all_sub_categories[prevIndex] || [];
//         setActiveSubCategoryIndex(prevSub.length ? prevSub.length - 1 : 0);
//         animateRight();
//       }
//       window.scrollTo(0, 0);
//     } else if (swipeDirection.current === "left") {
//       if (activeSubCategoryIndex < totalSubCats - 1) {
//         setActiveSubCategoryIndex(activeSubCategoryIndex + 1);
//         animateLeft();
//       } else {
//         const nextIndex = (activeCategoryIndex + 1) % totalCategories;
//         setActiveCategoryIndex(nextIndex);
//         setActiveSubCategoryIndex(0);
//         animateLeft();
//       }
//       window.scrollTo(0, 0);
//     } else {
//       setContainerStyle({});
//     }
//   };

//   // מעבר לעמוד מחיר
//   const moveToPriceList = (barcode) => {
//     nav(`/priceList/${barcode}`);
//   };

//   // עדכון/מחיקה/הוספה לסל
//   const updateAmount = async (barcode) => {
//     const amount = productAmounts[barcode] || 0;
//     const button = document.querySelector(`#add-to-cart-${barcode}`);

//     if (amount === 0) {
//       changeButtonToNoChangeAmountButton(button);
//       await deleteProductFromCart(userId, barcode);
//       await loadCart(userId);
//       setOldProductAmounts({ ...oldProductAmounts, [barcode]: 0 });
//       return;
//     }

//     if (!oldProductAmounts[barcode]) {
//       changeButtonToNoChangeAmountButton(button);
//       await addProductToCart(userId, barcode, amount);
//       await loadCart(userId);
//       setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
//       return;
//     }

//     changeButtonToNoChangeAmountButton(button);
//     await updateProductInCart(userId, barcode, amount);
//     await loadCart(userId);
//     setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
//   };

//   const currentCategory = allCategories[activeCategoryIndex];
//   const subCats = all_sub_categories[activeCategoryIndex] || [];
//   const currentSubCategory = subCats[activeSubCategoryIndex];

//   const filteredProducts = products.filter((product) => {
//     if (product.category !== currentCategory) return false;
//     if (currentSubCategory) {
//       return product.subcategory === currentSubCategory;
//     }
//     return true;
//   });

//   return (
//     <div className="list__product-list">
//       <CategoryNavigation />
//       <SubCategoryNavigation />

//       <div className="list__products-wrapper">
//         <div
//           className="list__products-container"
//           style={containerStyle}
//           onTouchStart={handleTouchStart}
//           onTouchMove={handleTouchMove}
//           onTouchEnd={handleTouchEnd}
//         >
//           {filteredProducts.map((product) => (
//             <div className="list__product-card" key={product.barcode}>
//               {product.price && product.price.discount && (
//                 <div className="list__product-badge">מבצע</div>
//               )}

//               <div className="list__product-details">
//                 <div className="list__product-data">
//                   <div className="list__product-name">
//                     <p>{maxCharacters(product.name, 23)}</p>
//                   </div>
//                   <div className="list__product-info">
//                     <div className="list__product-weight">
//                       <p>{product.weight}</p>
//                       <p>{convertWeightUnit(product.unitWeight)}</p>
//                     </div>
//                     <div className="list__separator">|</div>
//                     <div className="list__product-brand">
//                       <p>{product.brand}</p>
//                     </div>
//                   </div>
//                   <div className="discount-price">
//                     {product.price && product.price.discount && (
//                       <>{discountPriceFormat(product.price)}</>
//                     )}
//                   </div>
//                 </div>
//                 <div
//                   className="list__product-image"
//                   onClick={() => moveToPriceList(product.barcode)}
//                 >
//                   <Image barcode={product.barcode} />
//                 </div>
//               </div>

//               <div className="list__product-operations">
//                 <div
//                   id={`add-to-cart-${product.barcode}`}
//                   className="list__product-operations__confirm"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     updateAmount(product.barcode);
//                   }}
//                 >
//                   אישור
//                 </div>

//                 <div style={{ display: "flex", gap: "0.5rem" }}>
//                   {/* 1. פתיחת עריכה */}
//                   {selectedBarcode === null && (
//                     <button
//                       onClick={() => handleOpenBarcode(product.barcode)}
//                       style={{ backgroundColor: "green", color: "white" }}
//                     >
//                       צור/עדכן קבוצה
//                     </button>
//                   )}

//                   {/* 2. שמירה */}
//                   {selectedBarcode === product.barcode && (
//                     <button
//                       onClick={() => handleCloseBarcode(product.barcode)}
//                       style={{ backgroundColor: "blue", color: "white" }}
//                     >
//                       שמור שינויים
//                     </button>
//                   )}

//                   {/* 3. הוספה לרשימה */}
//                   {selectedBarcode !== null &&
//                     selectedBarcode !== product.barcode &&
//                     !groupData[selectedBarcode]?.includes(product.barcode) && (
//                       <button
//                         onClick={() => handleToggleAlternative(product.barcode)}
//                         style={{ backgroundColor: "green", color: "white" }}
//                       >
//                         הוסף לרשימה
//                       </button>
//                     )}

//                   {/* 4. הסרה מהרשימה */}
//                   {selectedBarcode !== null &&
//                     selectedBarcode !== product.barcode &&
//                     groupData[selectedBarcode]?.includes(product.barcode) && (
//                       <button
//                         onClick={() => handleToggleAlternative(product.barcode)}
//                         style={{ backgroundColor: "red", color: "white" }}
//                       >
//                         הסר מהרשימה
//                       </button>
//                     )}

//                                       {/* 6. כפתור "העתק רשימה" החדש */}
//                   {hasAlternativeProducts(product.barcode) &&
//                     selectedBarcode !== null &&
//                     selectedBarcode !== product.barcode && (
//                       <button
//                         onClick={() => handleCopyAndSave(product.barcode)}
//                         style={{ backgroundColor: "purple", color: "white" }}
//                       >
//                         העתק רשימה
//                       </button>
//                     )}

//                   {/* 5. הצג מוצרים חלופיים */}
//                   {selectedBarcode === product.barcode && (
//                     <button
//                       onClick={() => handleShowAlternatives(product.barcode)}
//                       style={{ backgroundColor: "orange", color: "white" }}
//                     >
//                       הצג מוצרים חלופיים
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* כאן אנו שותלים את המודאל */}
//       <AlternativeProductsModal
//         isOpen={showModal}
//         onClose={() => setShowModal(false)}
//         barcodes={alternativesToShow}
//       />
//     </div>
//   );
// }

// export default ProductListManager;

import React, { useEffect, useRef, useState } from "react";
import { useProducts } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
// import "./ProductsListManager.css";
import { useNavigate } from "react-router";
import {
  updateProductInCart,
  addProductToCart,
  deleteProductFromCart,
} from "../../network/cartService";
import {
  getAllAlternativeProducts,
  getAlternativeProductByBarcode,
  createAlternativeProduct,
  updateAlternativeProductByBarcode,
} from "../../network/alternative-productsService";

import AlternativeProductsModal from "./AlternativeProductsModal";
import Image from "./Images";
import CategoryNavigation from "./CategoryNavigation";
import SubCategoryNavigation from "./SubCategoryNavigation";

/* -------------------------------- */
/* פונקציות עזר */
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

const maxCharacters = (str, maxLen) => {
  if (!str) return "";
  return str.length > maxLen ? "..." + str.substring(0, maxLen - 3) : str;
};

const priceFormat = (price) => price.toFixed(2);

const discountPriceFormat = (price) => {
  const { units, totalPrice } = price.discount;
  return (
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
};

const makeInvisible = (button) => {
  button.classList.remove("visible");
};

const changeButtonToNoChangeAmountButton = (button) => {
  makeInvisible(button);
};

/* -------------------------------- */
/*          ProductListManager      */
/* -------------------------------- */
function ProductListManager() {
  const {
    products,
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProducts();

  const { getProductsAmountInCart, loadCart } = useCart();
  const nav = useNavigate();

  const [productAmounts, setProductAmounts] = useState({});
  const [oldProductAmounts, setOldProductAmounts] = useState({});
  const [isLoadData, setIsLoadData] = useState(false);

  //=================================================================================
  //               ניהול מוצרים חלופיים
  //=================================================================================
  // כאן נשמור את רשימת ה"alternativeProducts" שהגיעה מהשרת
  const [allAlternativeProducts, setAllAlternativeProducts] = useState([]);

  // הברקוד שנמצא במצב עריכה
  const [selectedBarcode, setSelectedBarcode] = useState(null);

  // מילון: { barcode -> arrayOfBarcodes[] }
  // כשבוחרים מוצר לעריכה, נטען/נעדכן אותו כאן
  const [groupData, setGroupData] = useState({});

  //-------------------------------------------------------------------------
  // טוען את כל נתוני ה־Alternative Products מהשרת:
  useEffect(() => {
    const loadAlternativeProducts = async () => {
      const result = await getAllAlternativeProducts();
      // לפי מה שהצגת בפוסטמן, המבנה הוא:
      // {
      //   "status": "success",
      //   "results": 17,
      //   "data": {
      //     "alternativeProducts": [ {barcode:..., alternatives: [...]}, ... ]
      //   }
      // }
      setAllAlternativeProducts(result.data.alternativeProducts || []);
    };
    loadAlternativeProducts();
  }, []);

  // פונקציה שבודקת אם למוצר יש רשימת חלופות ב- allAlternativeProducts
  const hasAlternativeProducts = (barcode) => {
    const alternativeProduct = allAlternativeProducts.find(
      (item) => item.barcode === barcode
    );
    return alternativeProduct && alternativeProduct.alternatives.length > 0;
  };

  // פונקציה שמעתיקה את רשימת החלופות מברקוד מסוים, ושומרת בשרת עבור selectedBarcode
  const handleCopyAndSave = async (sourceBarcode) => {
    try {
      const response = await getAlternativeProductByBarcode(sourceBarcode);
      // מניחים שבאמת יש פה איזה array
      const fromAlternatives = response.data.alternativeProduct.alternatives;

      // מעדכנים ב-state
      setGroupData((prev) => ({
        ...prev,
        [selectedBarcode]: fromAlternatives,
      }));

      // שומרים => יציאה ממצב עריכה
      // await handleCloseBarcode(selectedBarcode);
    } catch (error) {
      console.error("Error copying from source barcode:", error);
    }
  };

  // פותח עריכה למוצר מסוים
  const handleOpenBarcode = async (barcode) => {
    if (selectedBarcode === null) {
      setSelectedBarcode(barcode);
      try {
        const response = await getAlternativeProductByBarcode(barcode);
        if (response?.data?.alternativeProduct) {
          setGroupData({
            [barcode]: response.data.alternativeProduct.alternatives,
          });
        } else {
          setGroupData({ [barcode]: [] });
        }
      } catch (error) {
        console.error("Error fetching alternative product:", error);
        setGroupData({ [barcode]: [] });
      }
    }
  };

  // סגירת עריכה ושמירה
  const handleCloseBarcode = async (barcode) => {
    if (selectedBarcode === barcode) {
      try {
        const existingAlternative = await getAlternativeProductByBarcode(
          barcode
        );
        if (existingAlternative?.data?.alternativeProduct) {
          await updateAlternativeProductByBarcode(barcode, groupData[barcode]);
        } else {
          await createAlternativeProduct(barcode, groupData[barcode]);
        }
      } catch (error) {
        console.error("Error updating alternative product:", error);
      }
      // אפס מצב
      setSelectedBarcode(null);
      setGroupData({});
    }
  };

  // טוגגל הוספה/הסרה של ברקוד אל רשימת החלופות עבור selectedBarcode
  const handleToggleAlternative = (barcode) => {
    if (!selectedBarcode) return;
    setGroupData((prevData) => {
      const currentAlternatives = prevData[selectedBarcode] || [];
      if (currentAlternatives.includes(barcode)) {
        // הסר
        return {
          ...prevData,
          [selectedBarcode]: currentAlternatives.filter(
            (item) => item !== barcode
          ),
        };
      } else {
        // הוסף
        return {
          ...prevData,
          [selectedBarcode]: [...currentAlternatives, barcode],
        };
      }
    });
  };

  //=================================================================================
  //             ניהול המודאל של הצגת המוצרים החלופיים
  //=================================================================================
  const [showModal, setShowModal] = useState(false);
  const [alternativesToShow, setAlternativesToShow] = useState([]);

  const handleShowAlternatives = (barcode) => {
    const altBarcodes = groupData[barcode] || [];
    setAlternativesToShow(altBarcodes);
    setShowModal(true);
  };

  //=================================================================================
  //               ניהול כמות בסל והאנימציה של החלקה
  //=================================================================================
  const userId = "1";
  const [containerStyle, setContainerStyle] = useState({});

  const startTouch = useRef({ x: 0 });
  const swipeDirection = useRef(null);

  useEffect(() => {
    const loadAmounts = async () => {
      setIsLoadData(true);
      const amounts = await getProductsAmountInCart(userId);
      const amountsObject = {};
      amounts.cart.products.forEach((p) => {
        amountsObject[p.barcode] = p.amount;
      });
      setProductAmounts(amountsObject);
      setOldProductAmounts(amountsObject);
      setIsLoadData(false);
    };
    loadAmounts();
  }, [getProductsAmountInCart, userId]);

  if (isLoadData) {
    return <div>Loading Amounts...</div>;
  }

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

  const animateLeft = () => {
    setContainerStyle({ animation: "middleToLeft 0.2s ease" });
    setTimeout(() => {
      setContainerStyle({ animation: "leftToRight 1ms steps(1) forwards" });
    }, 200);
    setTimeout(() => {
      setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
    }, 201);
  };

  const animateRight = () => {
    setContainerStyle({ animation: "middleToRight 0.2s ease" });
    setTimeout(() => {
      setContainerStyle({ animation: "rightToLeft 1ms steps(1) forwards" });
    }, 200);
    setTimeout(() => {
      setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
    }, 201);
  };

  const handleTouchEnd = () => {
    const totalCategories = allCategories.length;
    const subCats = all_sub_categories[activeCategoryIndex] || [];
    const totalSubCats = subCats.length;

    if (swipeDirection.current === "right") {
      if (activeSubCategoryIndex > 0) {
        setActiveSubCategoryIndex(activeSubCategoryIndex - 1);
        animateRight();
      } else {
        const prevIndex =
          (activeCategoryIndex - 1 + totalCategories) % totalCategories;
        setActiveCategoryIndex(prevIndex);
        const prevSub = all_sub_categories[prevIndex] || [];
        setActiveSubCategoryIndex(prevSub.length ? prevSub.length - 1 : 0);
        animateRight();
      }
      window.scrollTo(0, 0);
    } else if (swipeDirection.current === "left") {
      if (activeSubCategoryIndex < totalSubCats - 1) {
        setActiveSubCategoryIndex(activeSubCategoryIndex + 1);
        animateLeft();
      } else {
        const nextIndex = (activeCategoryIndex + 1) % totalCategories;
        setActiveCategoryIndex(nextIndex);
        setActiveSubCategoryIndex(0);
        animateLeft();
      }
      window.scrollTo(0, 0);
    } else {
      setContainerStyle({});
    }
  };

  const moveToPriceList = (barcode) => {
    nav(`/priceList/${barcode}`);
  };

  const updateAmount = async (barcode) => {
    const amount = productAmounts[barcode] || 0;
    const button = document.querySelector(`#add-to-cart-${barcode}`);

    if (amount === 0) {
      changeButtonToNoChangeAmountButton(button);
      await deleteProductFromCart(userId, barcode);
      await loadCart(userId);
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: 0 });
      return;
    }

    if (!oldProductAmounts[barcode]) {
      changeButtonToNoChangeAmountButton(button);
      await addProductToCart(userId, barcode, amount);
      await loadCart(userId);
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
      return;
    }

    changeButtonToNoChangeAmountButton(button);
    await updateProductInCart(userId, barcode, amount);
    await loadCart(userId);
    setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
  };

  // סינון מוצרים לפי הקטגוריה ותת־הקטגוריה הפעילות
  const currentCategory = allCategories[activeCategoryIndex];
  const subCats = all_sub_categories[activeCategoryIndex] || [];
  const currentSubCategory = subCats[activeSubCategoryIndex];

  const filteredProducts = products.filter((product) => {
    if (product.category !== currentCategory) return false;
    if (currentSubCategory) {
      return product.subcategory === currentSubCategory;
    }
    return true;
  });

  return (
    <div className="list__product-list">
      <CategoryNavigation />
      <SubCategoryNavigation />

      <div className="list__products-wrapper">
        <div
          className="list__products-container"
          style={containerStyle}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {filteredProducts.map((product) => (
            <div className="list__product-card" key={product.barcode}>
              {product.price && product.price.discount && (
                <div className="list__product-badge">מבצע</div>
              )}

              <div className="list__product-details">
                <div className="list__product-data">
                  <div className="list__product-name">
                    <p>{maxCharacters(product.name, 23)}</p>
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
                  <div className="discount-price">
                    {product.price && product.price.discount && (
                      <>{discountPriceFormat(product.price)}</>
                    )}
                  </div>
                </div>
                <div
                  className="list__product-image"
                  onClick={() => moveToPriceList(product.barcode)}
                >
                  <ProductImageDisplay barcode={product.barcode} />
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
                  אישור
                </div>

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {/* 1. פתיחת עריכה (צור/עדכן קבוצה) */}
                  {selectedBarcode === null && (
                    <button
                      onClick={() => handleOpenBarcode(product.barcode)}
                      style={{ backgroundColor: "green", color: "white" }}
                    >
                      צור/עדכן קבוצה
                    </button>
                  )}

                  {/* 2. שמירה */}
                  {selectedBarcode === product.barcode && (
                    <button
                      onClick={() => handleCloseBarcode(product.barcode)}
                      style={{ backgroundColor: "blue", color: "white" }}
                    >
                      שמור שינויים
                    </button>
                  )}

                  {/* 3. הוספה לרשימה */}
                  {selectedBarcode !== null &&
                    selectedBarcode !== product.barcode &&
                    !groupData[selectedBarcode]?.includes(product.barcode) && (
                      <button
                        onClick={() => handleToggleAlternative(product.barcode)}
                        style={{ backgroundColor: "green", color: "white" }}
                      >
                        הוסף לרשימה
                      </button>
                    )}

                  {/* 4. הסרה מהרשימה */}
                  {selectedBarcode !== null &&
                    selectedBarcode !== product.barcode &&
                    groupData[selectedBarcode]?.includes(product.barcode) && (
                      <button
                        onClick={() => handleToggleAlternative(product.barcode)}
                        style={{ backgroundColor: "red", color: "white" }}
                      >
                        הסר מהרשימה
                      </button>
                    )}

                  {/* 6. כפתור "העתק רשימה" - יופיע רק אם יש חלופות + אנו בעריכה של מוצר אחר */}
                  {hasAlternativeProducts(product.barcode) &&
                    selectedBarcode !== null &&
                    selectedBarcode !== product.barcode && (
                      <button
                        onClick={() => handleCopyAndSave(product.barcode)}
                        style={{ backgroundColor: "purple", color: "white" }}
                      >
                        העתק רשימה
                      </button>
                    )}

                  {/* 5. הצג מוצרים חלופיים */}
                  {selectedBarcode === product.barcode && (
                    <button
                      onClick={() => handleShowAlternatives(product.barcode)}
                      style={{ backgroundColor: "orange", color: "white" }}
                    >
                      הצג מוצרים חלופיים
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* מודאל להצגת רשימת מוצרים חלופיים */}
      <AlternativeProductsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        barcodes={alternativesToShow}
      />
    </div>
  );
}

export default ProductListManager;
