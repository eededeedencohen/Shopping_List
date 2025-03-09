// // import React, { useEffect, useRef, useState } from "react";
// // import { useProducts } from "../../context/ProductContext";
// // import { useCart } from "../../context/CartContext";
// // import "./ProductsList.css";
// // import { useNavigate } from "react-router";
// // import {
// //   updateProductInCart,
// //   addProductToCart,
// //   deleteProductFromCart,
// // } from "../../network/cartService";
// // import Image from "./Images";
// // import CategoryNavigation from "./CategoryNavigation";

// // export const convertWeightUnit = (weightUnit) => {
// //   weightUnit = weightUnit.toLowerCase();
// //   if (weightUnit === "g") {
// //     return "גרם";
// //   }
// //   if (weightUnit === "kg") {
// //     return 'ק"ג';
// //   }
// //   if (weightUnit === "ml") {
// //     return 'מ"ל';
// //   }
// //   if (weightUnit === "l") {
// //     return "ליטר";
// //   }
// //   if (weightUnit === "u") {
// //     return "יחידות";
// //   }
// //   return weightUnit;
// // };

// // const max18Characters = (str) => {
// //   if (str.length > 23) {
// //     return "..." + str.substring(0, 21);
// //   }
// //   return str;
// // };

// // const priceFormat = (price) => {
// //   return price.toFixed(2);
// // };

// // const discountPriceFormat = (price) => {
// //   const units = price.discount.units;
// //   const totalPrice = price.discount.totalPrice;
// //   return (
// //     <div
// //       className="list__discount-price"
// //       style={{
// //         display: "flex",
// //         flexDirection: "row-reverse",
// //         alignItems: "center",
// //         color: "#ff0000",
// //         fontWeight: "bold",
// //       }}
// //     >
// //       <p style={{ marginLeft: "0.3rem" }}>{units}</p>
// //       <p>{"יחידות ב"}</p>
// //       <p>{" - "}</p>
// //       <p>{priceFormat(totalPrice)}</p>
// //       <p style={{ fontWeight: "bold" }}>{"₪"}</p>
// //     </div>
// //   );
// // };

// // const makeVisible = (button) => {
// //   button.classList.add("visible");
// // };

// // const makeInvisible = (button) => {
// //   button.classList.remove("visible");
// // };

// // const changeButtonToAddProductButton = (button) => {
// //   button.style.backgroundColor = "#00c200";
// //   makeVisible(button);
// //   button.innerText = "הוסף לסל";
// // };

// // const changeButtonToNoChangeAmountButton = (button) => {
// //   makeInvisible(button);
// // };

// // const changeButtonToUpdateAmountButton = (button) => {
// //   button.style.backgroundColor = "#008cba";
// //   makeVisible(button);
// //   button.innerText = "עדכן כמות";
// // };

// // const changeButtonToDeleteProductButton = (button) => {
// //   button.style.backgroundColor = "#ff0000";
// //   makeVisible(button);
// //   button.innerText = "הסר מהסל";
// // };

// // function ProductsList() {
// //   const { products } = useProducts();
// //   const { allCategories, activeCategory, setActiveCategory } = useProducts();
// //   const { getProductsAmountInCart, loadCart } = useCart();
// //   const [productAmounts, setProductAmounts] = useState({});
// //   const [oldProductAmounts, setOldProductAmounts] = useState({});
// //   const userId = "1"; // Replace with actual user ID

// //   const [isLoadData, setIsLoadData] = useState(false);

// //   const nav = useNavigate();

// //   const [containerStyle, setContainerStyle] = useState({});
// //   const startTouch = useRef({ x: 0 });
// //   const swipeDirection = useRef(null); // To store the swipe direction

// //   // Load the product-amount in the cart
// //   useEffect(() => {
// //     const loadAmounts = async () => {
// //       setIsLoadData(true);
// //       const amounts = await getProductsAmountInCart(userId);
// //       const amountsObject = {};
// //       amounts.cart.products.forEach((product) => {
// //         amountsObject[product.barcode] = product.amount;
// //       });
// //       setProductAmounts(amountsObject);
// //       setOldProductAmounts(amountsObject);
// //       setIsLoadData(false);
// //     };
// //     loadAmounts();
// //   }, [getProductsAmountInCart]);

// //   if (isLoadData) {
// //     console.log("loading amounts");
// //     return <div>Loading Amounts...</div>;
// //   }

// //   const handleTouchStart = (event) => {
// //     const x = event.touches[0].clientX;
// //     startTouch.current = { x };
// //     swipeDirection.current = null; // Reset swipe direction on new touch
// //     setContainerStyle({});
// //   };

// //   const handleTouchMove = (event) => {
// //     const moveX = event.touches[0].clientX;
// //     const deltaX = moveX - startTouch.current.x;

// //     if (Math.abs(deltaX) > 150) {
// //       // Threshold for swipe recognition
// //       swipeDirection.current = deltaX > 0 ? "right" : "left";
// //     }
// //   };

// //   const handleTouchEnd = () => {
// //     if (swipeDirection.current === "right") {
// //       // Swipe right - previous category
// //       const currentIndex = allCategories.indexOf(activeCategory);
// //       const prevIndex =
// //         (currentIndex - 1 + allCategories.length) % allCategories.length;
// //       setActiveCategory(allCategories[prevIndex]);

// //       // Apply the middleToRight animation for 1 second
// //       setContainerStyle({ animation: "middleToRight 0.2s ease" });

// //       // After 1 second, apply the RightToLeft animation for 1 millisecond (in one step)
// //       setTimeout(() => {
// //         setContainerStyle({ animation: "rightToLeft 1ms steps(1) forwards" });
// //       }, 200);

// //       // After RightToLeft animation, apply the RightToMiddle animation for 1 second
// //       setTimeout(() => {
// //         setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
// //       }, 201);

// //       // up to the top of the page:
// //       window.scrollTo(0, 0);
// //     } else if (swipeDirection.current === "left") {
// //       // Swipe left - next category
// //       const currentIndex = allCategories.indexOf(activeCategory);
// //       const nextIndex = (currentIndex + 1) % allCategories.length;
// //       setActiveCategory(allCategories[nextIndex]);

// //       // Apply the middleToLeft animation for 1 second
// //       setContainerStyle({ animation: "middleToLeft 0.2s ease" });

// //       // After 1 second, apply the LeftToRight animation for 1 millisecond (in one step)
// //       setTimeout(() => {
// //         setContainerStyle({ animation: "leftToRight 1ms steps(1) forwards" });
// //       }, 200);

// //       // After LeftToRight animation, apply the LeftToMiddle animation for 1 second
// //       setTimeout(() => {
// //         setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
// //       }, 201);

// //       // up to the top of the page:
// //       window.scrollTo(0, 0);
// //     } else {
// //       setContainerStyle({}); // Reset the container's position after the swipe
// //     }
// //   };

// //   const moveToPriceList = (productBarcode) => {
// //     nav(`/priceList/${productBarcode}`);
// //   };

// //   const incrementAmount = (barcode) => {
// //     const newAmount = (productAmounts[barcode] || 0) + 1;
// //     const button = document.querySelector(`#add-to-cart-${barcode}`);
// //     setProductAmounts({
// //       ...productAmounts,
// //       [barcode]: newAmount,
// //     });
// //     // case !old:
// //     if (!oldProductAmounts[barcode]) {
// //       console.log("green button -> is the old = active");
// //       changeButtonToAddProductButton(button);
// //     } else {
// //       // case old:
// //       // case new === 0: -> red and remove from the object:
// //       if (newAmount === 0) {
// //         console.log("red button -> is the old = active");
// //         changeButtonToDeleteProductButton(button);
// //       }
// //       // case new = old:
// //       else if (newAmount === oldProductAmounts[barcode]) {
// //         console.log("gray button -> is the old = active");
// //         changeButtonToNoChangeAmountButton(button);
// //       }
// //       // else (new > 0 && new != old):
// //       else {
// //         console.log(
// //           "blue button -> old != active and old != 0 and active != 0"
// //         );
// //         changeButtonToUpdateAmountButton(button);
// //       }
// //     }
// //   };

// //   const decrementAmount = (barcode) => {
// //     const newAmount = Math.max(0, (productAmounts[barcode] || 0) - 1);
// //     const button = document.querySelector(`#add-to-cart-${barcode}`);
// //     setProductAmounts({
// //       ...productAmounts,
// //       [barcode]: newAmount,
// //     });

// //     // case !old:
// //     if (!oldProductAmounts[barcode]) {
// //       // case new === 0:
// //       if (newAmount === 0) {
// //         console.log("gray button -> is the old = active");
// //         changeButtonToNoChangeAmountButton(button);
// //       }
// //       // case new > 0:
// //       else {
// //         // new > 0
// //         console.log("green button -> is the old = active");
// //         changeButtonToAddProductButton(button);
// //       }
// //     }
// //     // case old:
// //     else {
// //       // case new === 0:
// //       if (newAmount === 0) {
// //         console.log("red button -> is the old = active");
// //         changeButtonToDeleteProductButton(button);
// //       }
// //       // case new === old:
// //       else if (newAmount === oldProductAmounts[barcode]) {
// //         console.log("gray button -> is the old = active");
// //         changeButtonToNoChangeAmountButton(button);
// //       }
// //       // else (new > 0 && new != old):
// //       else {
// //         console.log(
// //           "blue button -> old != active and old != 0 and active != 0"
// //         );
// //         changeButtonToUpdateAmountButton(button);
// //       }
// //     }
// //   };

// //   const updateAmount = async (barcode) => {
// //     // if the new amount is 0 -> alert "delete from cart" and return:

// //     if (productAmounts[barcode] === 0 || !productAmounts[barcode]) {
// //       const button = document.querySelector(`#add-to-cart-${barcode}`);
// //       // gray button:
// //       console.log("gray button");
// //       changeButtonToNoChangeAmountButton(button);
// //       const response = await deleteProductFromCart(userId, barcode);
// //       console.log(response);
// //       await loadCart(userId);

// //       // update the oldProductAmounts:
// //       setOldProductAmounts({
// //         ...oldProductAmounts,
// //         [barcode]: productAmounts[barcode] || 0,
// //       });
// //       console.log("updated oldProductAmounts");
// //       return;
// //     }

// //     // case the old amount is 0 -> add to cart:

// //     if (!oldProductAmounts[barcode]) {
// //       // add to cart:
// //       const button = document.querySelector(`#add-to-cart-${barcode}`);
// //       // gray button:
// //       console.log("gray button");
// //       changeButtonToNoChangeAmountButton(button);
// //       const response = await addProductToCart(
// //         userId,
// //         barcode,
// //         productAmounts[barcode] || 0
// //       );
// //       console.log(response);
// //       await loadCart(userId);

// //       // update the oldProductAmounts:
// //       setOldProductAmounts({
// //         ...oldProductAmounts,
// //         [barcode]: productAmounts[barcode] || 0,
// //       });
// //       console.log("updated oldProductAmounts");
// //       return;
// //     }

// //     const button = document.querySelector(`#add-to-cart-${barcode}`);
// //     // gray button:
// //     console.log("gray button");
// //     changeButtonToNoChangeAmountButton(button);
// //     const response = await updateProductInCart(
// //       userId,
// //       barcode,
// //       productAmounts[barcode] || 0
// //     );
// //     console.log(response);
// //     await loadCart(userId);

// //     // update the oldProductAmounts:
// //     setOldProductAmounts({
// //       ...oldProductAmounts,
// //       [barcode]: productAmounts[barcode] || 0,
// //     });
// //     console.log("updated oldProductAmounts");
// //   };

// //   const filteredProducts = products.filter(
// //     (product) => product.category === activeCategory
// //   );
// //   return (
// //     <div className="list__product-list">
// //       <CategoryNavigation />
// //       <div className="list__products-wrapper">
// //         <div
// //           className="list__products-container"
// //           style={containerStyle}
// //           onTouchStart={handleTouchStart}
// //           onTouchMove={handleTouchMove}
// //           onTouchEnd={handleTouchEnd} // Added onTouchEnd event
// //         >
// //           {filteredProducts.map((product) => (
// //             <div className="list__product-card" key={product.barcode}>
// //               {product.price && product.price.discount && (
// //                 <div className="list__product-badge">מבצע</div>
// //               )}
// //               <div className="list__product-details">
// //                 <div className="list__product-data">
// //                   <div className="list__product-name">
// //                     <p>{max18Characters(product.name)}</p>
// //                   </div>
// //                   <div className="list__product-info">
// //                     <div className="list__product-weight">
// //                       <p>{product.weight}</p>
// //                       <p>{convertWeightUnit(product.unitWeight)}</p>
// //                     </div>
// //                     <div className="list__separator">|</div>
// //                     <div className="list__product-brand">
// //                       <p>{product.brand}</p>
// //                     </div>
// //                   </div>
// //                   <div className="list__product-price">
// //                     <p>{product.price && priceFormat(product.price.price)}</p>
// //                     {product.price && <p style={{ fontSize: "1.4rem" }}>₪</p>}
// //                     {!product.hasPrice && <p>מחיר לא זמין בסופר</p>}
// //                   </div>
// //                   <div className="discount-price">
// //                     {product.price && product.price.discount && (
// //                       <>{discountPriceFormat(product.price)}</>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <div
// //                   className="list__product-image"
// //                   onClick={() => moveToPriceList(product.barcode)}
// //                 >
// //                   <Image barcode={product.barcode} />
// //                 </div>
// //               </div>
// //               <div className="list__product-operations">
// //                 <div
// //                   id={`add-to-cart-${product.barcode}`}
// //                   className="list__product-operations__confirm"
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     updateAmount(product.barcode);
// //                   }}
// //                 >
// //                   אין שינוי
// //                 </div>
// //                 <div
// //                   className="list__product-operations__add"
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     incrementAmount(product.barcode);
// //                   }}
// //                 >
// //                   +
// //                 </div>
// //                 <div className="list__product-operations__quantity">
// //                   <span>{productAmounts[product.barcode] || 0}</span>
// //                 </div>
// //                 <div
// //                   className="list__product-operations__reduce"
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     decrementAmount(product.barcode);
// //                   }}
// //                 >
// //                   -
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ProductsList;

// //===========================================================================
// //===========================================================================

// // import React, { useEffect, useRef, useState } from "react";
// // import { useProducts } from "../../context/ProductContext";
// // import { useCart } from "../../context/CartContext";
// // import "./ProductsList.css";
// // import { useNavigate } from "react-router";
// // import {
// //   updateProductInCart,
// //   addProductToCart,
// //   deleteProductFromCart,
// // } from "../../network/cartService";
// // import Image from "./Images";
// // import CategoryNavigation from "./CategoryNavigation";
// // import SubCategoryNavigation from "./SubCategoryNavigation"; // חדש

// // // פונקציות עזר כבעבר
// // export const convertWeightUnit = (weightUnit) => {
// //   weightUnit = weightUnit.toLowerCase();
// //   if (weightUnit === "g") {
// //     return "גרם";
// //   }
// //   if (weightUnit === "kg") {
// //     return 'ק"ג';
// //   }
// //   if (weightUnit === "ml") {
// //     return 'מ"ל';
// //   }
// //   if (weightUnit === "l") {
// //     return "ליטר";
// //   }
// //   if (weightUnit === "u") {
// //     return "יחידות";
// //   }
// //   return weightUnit;
// // };

// // const max18Characters = (str) => {
// //   if (!str) return "";
// //   if (str.length > 23) {
// //     return "..." + str.substring(0, 21);
// //   }
// //   return str;
// // };

// // const priceFormat = (price) => {
// //   return price.toFixed(2);
// // };

// // const discountPriceFormat = (price) => {
// //   const units = price.discount.units;
// //   const totalPrice = price.discount.totalPrice;
// //   return (
// //     <div
// //       className="list__discount-price"
// //       style={{
// //         display: "flex",
// //         flexDirection: "row-reverse",
// //         alignItems: "center",
// //         color: "#ff0000",
// //         fontWeight: "bold",
// //       }}
// //     >
// //       <p style={{ marginLeft: "0.3rem" }}>{units}</p>
// //       <p>{"יחידות ב"}</p>
// //       <p>{" - "}</p>
// //       <p>{priceFormat(totalPrice)}</p>
// //       <p style={{ fontWeight: "bold" }}>{"₪"}</p>
// //     </div>
// //   );
// // };

// // // שינוי מצב הכפתור (CSS) בהתאם
// // const makeVisible = (button) => {
// //   button.classList.add("visible");
// // };

// // const makeInvisible = (button) => {
// //   button.classList.remove("visible");
// // };

// // const changeButtonToAddProductButton = (button) => {
// //   button.style.backgroundColor = "#00c200";
// //   makeVisible(button);
// //   button.innerText = "הוסף לסל";
// // };

// // const changeButtonToNoChangeAmountButton = (button) => {
// //   makeInvisible(button);
// // };

// // const changeButtonToUpdateAmountButton = (button) => {
// //   button.style.backgroundColor = "#008cba";
// //   makeVisible(button);
// //   button.innerText = "עדכן כמות";
// // };

// // const changeButtonToDeleteProductButton = (button) => {
// //   button.style.backgroundColor = "#ff0000";
// //   makeVisible(button);
// //   button.innerText = "הסר מהסל";
// // };

// // function ProductsList() {
// //   const {
// //     products,
// //     allCategories,
// //     all_sub_categories,
// //     activeCategoryIndex,
// //     setActiveCategoryIndex,
// //     activeSubCategoryIndex,
// //     setActiveSubCategoryIndex,
// //     // ...
// //   } = useProducts();

// //   const { getProductsAmountInCart, loadCart } = useCart();

// //   const [productAmounts, setProductAmounts] = useState({});
// //   const [oldProductAmounts, setOldProductAmounts] = useState({});
// //   const [isLoadData, setIsLoadData] = useState(false);
// //   const userId = "1"; // החלף למזהה משתמש אמיתי

// //   const nav = useNavigate();

// //   const [containerStyle, setContainerStyle] = useState({});
// //   const startTouch = useRef({ x: 0 });
// //   const swipeDirection = useRef(null);

// //   // טעינת כמויות מהמיני-DB של הסל (כמו שהיה אצלך)
// //   useEffect(() => {
// //     const loadAmounts = async () => {
// //       setIsLoadData(true);
// //       const amounts = await getProductsAmountInCart(userId);
// //       const amountsObject = {};
// //       amounts.cart.products.forEach((p) => {
// //         amountsObject[p.barcode] = p.amount;
// //       });
// //       setProductAmounts(amountsObject);
// //       setOldProductAmounts(amountsObject);
// //       setIsLoadData(false);
// //     };
// //     loadAmounts();
// //   }, [getProductsAmountInCart, userId]);

// //   if (isLoadData) {
// //     return <div>Loading Amounts...</div>;
// //   }

// //   // Events של הנגיעה (Swipe):
// //   const handleTouchStart = (event) => {
// //     const x = event.touches[0].clientX;
// //     startTouch.current = { x };
// //     swipeDirection.current = null;
// //     setContainerStyle({});
// //   };

// //   const handleTouchMove = (event) => {
// //     const moveX = event.touches[0].clientX;
// //     const deltaX = moveX - startTouch.current.x;

// //     if (Math.abs(deltaX) > 150) {
// //       swipeDirection.current = deltaX > 0 ? "right" : "left";
// //     }
// //   };

// //   /**
// //    * כאן מממשים את לוגיקת ההחלקה:
// //    * - אם swiped left: עוברים לתת־קטגוריה הבאה (אם יש), או לקטגוריה הבאה.
// //    * - אם swiped right: עוברים לתת־קטגוריה הקודמת (אם יש), או לקטגוריה הקודמת.
// //    */
// //   const handleTouchEnd = () => {
// //     // כמה קטגוריות יש בסה"כ
// //     const totalCategories = allCategories.length;
// //     // תתי־קטגוריות של הקטגוריה הנוכחית
// //     const subCats = all_sub_categories[activeCategoryIndex] || [];
// //     const totalSubCats = subCats.length;

// //     if (swipeDirection.current === "right") {
// //       // swipe right -> הולכים לתת־קטגוריה קודמת אם אפשר
// //       if (activeSubCategoryIndex > 0) {
// //         // יש עוד תתי־קטגוריה אחורה
// //         setActiveSubCategoryIndex(activeSubCategoryIndex - 1);

// //         // אנימציית המעבר (לדוגמה) - אתה יכול להתאים
// //         setContainerStyle({ animation: "middleToRight 0.2s ease" });
// //         setTimeout(() => {
// //           setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
// //         }, 200);
// //       } else {
// //         // הגענו להתחלת התתי־קטגוריות, עוברים לקטגוריה הקודמת (wrap around אם צריך)
// //         const prevIndex =
// //           (activeCategoryIndex - 1 + totalCategories) % totalCategories;
// //         setActiveCategoryIndex(prevIndex);
// //         // נעבור לתת־קטגוריה האחרונה של הקטגוריה הקודמת
// //         const prevSub = all_sub_categories[prevIndex] || [];
// //         setActiveSubCategoryIndex(prevSub.length > 0 ? prevSub.length - 1 : 0);

// //         // אנימציות
// //         setContainerStyle({ animation: "middleToRight 0.2s ease" });
// //         // ואז קפיצה
// //         setTimeout(() => {
// //           setContainerStyle({ animation: "rightToLeft 1ms steps(1) forwards" });
// //         }, 200);
// //         // ואז חזרה
// //         setTimeout(() => {
// //           setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
// //         }, 201);
// //       }

// //       // גלילה מעלה
// //       window.scrollTo(0, 0);
// //     } else if (swipeDirection.current === "left") {
// //       // swipe left -> הולכים לתת־קטגוריה הבאה אם אפשר
// //       if (activeSubCategoryIndex < totalSubCats - 1) {
// //         setActiveSubCategoryIndex(activeSubCategoryIndex + 1);

// //         // אנימציה
// //         setContainerStyle({ animation: "middleToLeft 0.2s ease" });
// //         setTimeout(() => {
// //           setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
// //         }, 200);
// //       } else {
// //         // אין עוד תתי־קטגוריות, נעבור לקטגוריה הבאה (wrap-around)
// //         const nextIndex = (activeCategoryIndex + 1) % totalCategories;
// //         setActiveCategoryIndex(nextIndex);
// //         setActiveSubCategoryIndex(0);

// //         // אנימציות
// //         setContainerStyle({ animation: "middleToLeft 0.2s ease" });
// //         setTimeout(() => {
// //           setContainerStyle({ animation: "leftToRight 1ms steps(1) forwards" });
// //         }, 200);
// //         setTimeout(() => {
// //           setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
// //         }, 201);
// //       }

// //       window.scrollTo(0, 0);
// //     } else {
// //       // אין שינוי בכיוון
// //       setContainerStyle({});
// //     }
// //   };

// //   // מעבר לעמוד של מחיר לפי ברקוד
// //   const moveToPriceList = (productBarcode) => {
// //     nav(`/priceList/${productBarcode}`);
// //   };

// //   // הוספה/הורדה של כמות בסל
// //   const incrementAmount = (barcode) => {
// //     const newAmount = (productAmounts[barcode] || 0) + 1;
// //     const button = document.querySelector(`#add-to-cart-${barcode}`);
// //     setProductAmounts({
// //       ...productAmounts,
// //       [barcode]: newAmount,
// //     });

// //     if (!oldProductAmounts[barcode]) {
// //       // בעבר לא היה בסל
// //       changeButtonToAddProductButton(button);
// //     } else {
// //       // כבר היה בסל
// //       if (newAmount === 0) {
// //         changeButtonToDeleteProductButton(button);
// //       } else if (newAmount === oldProductAmounts[barcode]) {
// //         changeButtonToNoChangeAmountButton(button);
// //       } else {
// //         changeButtonToUpdateAmountButton(button);
// //       }
// //     }
// //   };

// //   const decrementAmount = (barcode) => {
// //     const newAmount = Math.max(0, (productAmounts[barcode] || 0) - 1);
// //     const button = document.querySelector(`#add-to-cart-${barcode}`);
// //     setProductAmounts({
// //       ...productAmounts,
// //       [barcode]: newAmount,
// //     });

// //     if (!oldProductAmounts[barcode]) {
// //       // לא היה בסל
// //       if (newAmount === 0) {
// //         changeButtonToNoChangeAmountButton(button);
// //       } else {
// //         changeButtonToAddProductButton(button);
// //       }
// //     } else {
// //       // כבר היה בסל
// //       if (newAmount === 0) {
// //         changeButtonToDeleteProductButton(button);
// //       } else if (newAmount === oldProductAmounts[barcode]) {
// //         changeButtonToNoChangeAmountButton(button);
// //       } else {
// //         changeButtonToUpdateAmountButton(button);
// //       }
// //     }
// //   };

// //   // כשלוחצים על כפתור "הוסף לסל"/"עדכן כמות"/"הסר מהסל" בפועל
// //   const updateAmount = async (barcode) => {
// //     const amount = productAmounts[barcode] || 0;
// //     const button = document.querySelector(`#add-to-cart-${barcode}`);

// //     // אם הכמות החדשה 0 => הסרה מהסל
// //     if (amount === 0) {
// //       changeButtonToNoChangeAmountButton(button);
// //       const response = await deleteProductFromCart(userId, barcode);
// //       console.log(response);
// //       await loadCart(userId);
// //       // עדכון הכמות הישנה
// //       setOldProductAmounts({ ...oldProductAmounts, [barcode]: 0 });
// //       return;
// //     }

// //     // אם בעבר לא היה (old=0) => הוספה
// //     if (!oldProductAmounts[barcode]) {
// //       changeButtonToNoChangeAmountButton(button);
// //       const response = await addProductToCart(userId, barcode, amount);
// //       console.log(response);
// //       await loadCart(userId);
// //       setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
// //       return;
// //     }

// //     // אחרת => עדכון כמות
// //     changeButtonToNoChangeAmountButton(button);
// //     const response = await updateProductInCart(userId, barcode, amount);
// //     console.log(response);
// //     await loadCart(userId);
// //     setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
// //   };

// //   // קובעים את הקטגוריה ותת־הקטגוריה הנוכחית
// //   const currentCategory = allCategories[activeCategoryIndex];
// //   const subCats = all_sub_categories[activeCategoryIndex] || [];
// //   const currentSubCategory = subCats[activeSubCategoryIndex];

// //   // סינון לפי הקטגוריה ותת־הקטגוריה הנוכחית
// //   const filteredProducts = products.filter((product) => {
// //     if (product.category !== currentCategory) return false;
// //     // במידה והמוצר מכיל subCategory, משווים:
// //     if (currentSubCategory) {
// //       return product.subcategory === currentSubCategory;
// //     }
// //     return true;
// //   });

// //   return (
// //     <div className="list__product-list">
// //       {/* ניווט ראשי בקטגוריות */}
// //       <CategoryNavigation />
// //       {/* ניווט בתתי־קטגוריות */}
// //       <SubCategoryNavigation />

// //       <div className="list__products-wrapper">
// //         <div
// //           className="list__products-container"
// //           style={containerStyle}
// //           onTouchStart={handleTouchStart}
// //           onTouchMove={handleTouchMove}
// //           onTouchEnd={handleTouchEnd}
// //         >
// //           {filteredProducts.map((product) => (
// //             <div className="list__product-card" key={product.barcode}>
// //               {product.price && product.price.discount && (
// //                 <div className="list__product-badge">מבצע</div>
// //               )}
// //               <div className="list__product-details">
// //                 <div className="list__product-data">
// //                   <div className="list__product-name">
// //                     <p>{max18Characters(product.name)}</p>
// //                   </div>
// //                   <div className="list__product-info">
// //                     <div className="list__product-weight">
// //                       <p>{product.weight}</p>
// //                       <p>{convertWeightUnit(product.unitWeight)}</p>
// //                     </div>
// //                     <div className="list__separator">|</div>
// //                     <div className="list__product-brand">
// //                       <p>{product.brand}</p>
// //                     </div>
// //                   </div>
// //                   <div className="list__product-price">
// //                     {product.price ? (
// //                       <>
// //                         <p>{priceFormat(product.price.price)}</p>
// //                         <p style={{ fontSize: "1.4rem" }}>₪</p>
// //                       </>
// //                     ) : (
// //                       <p>מחיר לא זמין בסופר</p>
// //                     )}
// //                   </div>
// //                   <div className="discount-price">
// //                     {product.price && product.price.discount && (
// //                       <>{discountPriceFormat(product.price)}</>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <div
// //                   className="list__product-image"
// //                   onClick={() => moveToPriceList(product.barcode)}
// //                 >
// //                   <Image barcode={product.barcode} />
// //                 </div>
// //               </div>
// //               <div className="list__product-operations">
// //                 <div
// //                   id={`add-to-cart-${product.barcode}`}
// //                   className="list__product-operations__confirm"
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     updateAmount(product.barcode);
// //                   }}
// //                 >
// //                   אין שינוי
// //                 </div>
// //                 <div
// //                   className="list__product-operations__add"
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     incrementAmount(product.barcode);
// //                   }}
// //                 >
// //                   +
// //                 </div>
// //                 <div className="list__product-operations__quantity">
// //                   <span>{productAmounts[product.barcode] || 0}</span>
// //                 </div>
// //                 <div
// //                   className="list__product-operations__reduce"
// //                   onClick={(e) => {
// //                     e.stopPropagation();
// //                     decrementAmount(product.barcode);
// //                   }}
// //                 >
// //                   -
// //                 </div>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// // export default ProductsList;

// //===========================================================================
// //===========================================================================

// import React, { useEffect, useRef, useState } from "react";
// import { useProducts } from "../../context/ProductContext";
// import { useCart } from "../../context/CartContext";
// import "./ProductsList.css";
// import { useNavigate } from "react-router";
// import {
//   updateProductInCart,
//   addProductToCart,
//   deleteProductFromCart,
// } from "../../network/cartService";

// import Image from "./Images";
// import CategoryNavigation from "./CategoryNavigation";
// import SubCategoryNavigation from "./SubCategoryNavigation"; // מציג תתי־קטגוריות

// // פונקציות עזר
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

// /* שליטה על הכפתור: "הוסף לסל" / "עדכן כמות" / "הסר מהסל" */
// const makeVisible = (button) => {
//   button.classList.add("visible");
// };
// const makeInvisible = (button) => {
//   button.classList.remove("visible");
// };
// const changeButtonToAddProductButton = (button) => {
//   button.style.backgroundColor = "#00c200";
//   makeVisible(button);
//   button.innerText = "הוסף לסל";
// };
// const changeButtonToNoChangeAmountButton = (button) => {
//   makeInvisible(button);
// };
// const changeButtonToUpdateAmountButton = (button) => {
//   button.style.backgroundColor = "#008cba";
//   makeVisible(button);
//   button.innerText = "עדכן כמות";
// };
// const changeButtonToDeleteProductButton = (button) => {
//   button.style.backgroundColor = "#ff0000";
//   makeVisible(button);
//   button.innerText = "הסר מהסל";
// };

// function ProductsList() {
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

//   // state לניהול כמויות בסל
//   const [productAmounts, setProductAmounts] = useState({});
//   const [oldProductAmounts, setOldProductAmounts] = useState({});
//   const [isLoadData, setIsLoadData] = useState(false);
//   const userId = "1"; // מזהה משתמש לדוגמה

//   // state לשליטה באנימציה (style inline)
//   const [containerStyle, setContainerStyle] = useState({});

//   // כדי לזהות כיוון Swipe
//   const startTouch = useRef({ x: 0 });
//   const swipeDirection = useRef(null);

//   /* טוענים את כמויות המוצרים מהסל (מה-DB שלך) */
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

//   if (isLoadData) return <div>Loading Amounts...</div>;

//   /* זיהוי תחילת מגע */
//   const handleTouchStart = (event) => {
//     swipeDirection.current = null;
//     setContainerStyle({});
//     startTouch.current.x = event.touches[0].clientX;
//   };

//   /* זיהוי החלקה (קביעת כיוון) */
//   const handleTouchMove = (event) => {
//     const moveX = event.touches[0].clientX;
//     const deltaX = moveX - startTouch.current.x;
//     if (Math.abs(deltaX) > 150) {
//       swipeDirection.current = deltaX > 0 ? "right" : "left";
//     }
//   };

//   /**
//    * כשמשחררים את האצבע -> מחליטים האם עוברים לתת-קטגוריה הבאה/קודמת
//    * או (אם אנחנו בסוף/התחלה) -> עוברים לקטגוריה הבאה/קודמת עם אותה אנימציית מעבר
//    * זה בדיוק אותו טריק של האנימציות שעשינו לקטגוריות, פשוט גם מופעל על תתי־קטגוריות.
//    */
//   const handleTouchEnd = () => {
//     const totalCategories = allCategories.length;
//     const subCats = all_sub_categories[activeCategoryIndex] || [];
//     const totalSubCats = subCats.length;

//     if (swipeDirection.current === "right") {
//       /* החלקה ימינה – קודם ננסה ללכת לתת־קטגוריה קודמת */
//       if (activeSubCategoryIndex > 0) {
//         // רק תתי־קטגוריה קודמת
//         setActiveSubCategoryIndex(activeSubCategoryIndex - 1);

//         // אנימציה שגורמת להחלקת הדף הנוכחי לימין והחזרת הדף הבא מהשמאל?
//         // כפי שהיה אצלך למעבר ימינה:
//         setContainerStyle({ animation: "middleToRight 0.2s ease" });
//         setTimeout(() => {
//           setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
//         }, 200);
//       } else {
//         // אין יותר תתי־קטגוריות מאחורינו -> עוברים לקטגוריה הקודמת
//         const prevCatIndex =
//           (activeCategoryIndex - 1 + totalCategories) % totalCategories;
//         setActiveCategoryIndex(prevCatIndex);

//         // תת־קטגוריה אחרונה של הקטגוריה הקודמת
//         const prevSub = all_sub_categories[prevCatIndex] || [];
//         setActiveSubCategoryIndex(prevSub.length > 0 ? prevSub.length - 1 : 0);

//         // הרצף "הישן": middleToRight -> (אחרי 0.2s) rightToLeft -> (אחרי 1ms) leftToMiddle
//         setContainerStyle({ animation: "middleToRight 0.2s ease" });
//         setTimeout(() => {
//           setContainerStyle({ animation: "rightToLeft 1ms steps(1) forwards" });
//         }, 200);
//         setTimeout(() => {
//           setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
//         }, 201);
//       }
//       window.scrollTo(0, 0);
//     } else if (swipeDirection.current === "left") {
//       /* החלקה שמאלה – קודם ננסה ללכת לתת־קטגוריה הבאה */
//       if (activeSubCategoryIndex < totalSubCats - 1) {
//         setActiveSubCategoryIndex(activeSubCategoryIndex + 1);

//         // הרצף "הישן": middleToLeft -> (אחרי 0.2s) leftToMiddle
//         setContainerStyle({ animation: "middleToLeft 0.2s ease" });
//         setTimeout(() => {
//           setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
//         }, 200);
//       } else {
//         // אין עוד תתי־קטגוריות -> קטגוריה הבאה
//         const nextCatIndex = (activeCategoryIndex + 1) % totalCategories;
//         setActiveCategoryIndex(nextCatIndex);
//         setActiveSubCategoryIndex(0);

//         // הרצף "הישן": middleToLeft -> leftToRight -> rightToMiddle
//         setContainerStyle({ animation: "middleToLeft 0.2s ease" });
//         setTimeout(() => {
//           setContainerStyle({ animation: "leftToRight 1ms steps(1) forwards" });
//         }, 200);
//         setTimeout(() => {
//           setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
//         }, 201);
//       }
//       window.scrollTo(0, 0);
//     } else {
//       // לא זוהתה החלקה משמעותית
//       setContainerStyle({});
//     }
//   };

//   // ניווט לעמוד "priceList/:barcode"
//   const moveToPriceList = (barcode) => {
//     nav(`/priceList/${barcode}`);
//   };

//   // הגדלת כמות בסל
//   const incrementAmount = (barcode) => {
//     const newAmount = (productAmounts[barcode] || 0) + 1;
//     const button = document.querySelector(`#add-to-cart-${barcode}`);
//     setProductAmounts({ ...productAmounts, [barcode]: newAmount });

//     if (!oldProductAmounts[barcode]) {
//       changeButtonToAddProductButton(button);
//     } else {
//       if (newAmount === 0) {
//         changeButtonToDeleteProductButton(button);
//       } else if (newAmount === oldProductAmounts[barcode]) {
//         changeButtonToNoChangeAmountButton(button);
//       } else {
//         changeButtonToUpdateAmountButton(button);
//       }
//     }
//   };

//   // הקטנת כמות בסל
//   const decrementAmount = (barcode) => {
//     const newAmount = Math.max(0, (productAmounts[barcode] || 0) - 1);
//     const button = document.querySelector(`#add-to-cart-${barcode}`);
//     setProductAmounts({ ...productAmounts, [barcode]: newAmount });

//     if (!oldProductAmounts[barcode]) {
//       if (newAmount === 0) {
//         changeButtonToNoChangeAmountButton(button);
//       } else {
//         changeButtonToAddProductButton(button);
//       }
//     } else {
//       if (newAmount === 0) {
//         changeButtonToDeleteProductButton(button);
//       } else if (newAmount === oldProductAmounts[barcode]) {
//         changeButtonToNoChangeAmountButton(button);
//       } else {
//         changeButtonToUpdateAmountButton(button);
//       }
//     }
//   };

//   // כשלוחצים "הוסף לסל"/"עדכן כמות"/"הסר מהסל"
//   const updateAmount = async (barcode) => {
//     const amount = productAmounts[barcode] || 0;
//     const button = document.querySelector(`#add-to-cart-${barcode}`);

//     if (amount === 0) {
//       // הסרה
//       changeButtonToNoChangeAmountButton(button);
//       const response = await deleteProductFromCart(userId, barcode);
//       console.log(response);
//       await loadCart(userId);
//       setOldProductAmounts({ ...oldProductAmounts, [barcode]: 0 });
//       return;
//     }
//     // אם לא היה בסל
//     if (!oldProductAmounts[barcode]) {
//       changeButtonToNoChangeAmountButton(button);
//       const response = await addProductToCart(userId, barcode, amount);
//       console.log(response);
//       await loadCart(userId);
//       setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
//       return;
//     }
//     // אחרת, עדכון
//     changeButtonToNoChangeAmountButton(button);
//     const response = await updateProductInCart(userId, barcode, amount);
//     console.log(response);
//     await loadCart(userId);
//     setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
//   };

//   // המחרוזת של הקטגוריה הפעילה
//   const currentCategory = allCategories[activeCategoryIndex];
//   // מערך התתי־קטגוריות של הקטגוריה הזו
//   const subCats = all_sub_categories[activeCategoryIndex] || [];
//   // תת־הקטגוריה הנוכחית (כמחרוזת)
//   const currentSubCategory = subCats[activeSubCategoryIndex];

//   // סינון מוצרים
//   const filteredProducts = products.filter((product) => {
//     if (product.category !== currentCategory) return false;
//     if (currentSubCategory) {
//       return product.subcategory === currentSubCategory;
//     }
//     return true;
//   });

//   return (
//     <div className="list__product-list">
//       {/* ניווט הקטגוריות הראשיות */}
//       <CategoryNavigation />
//       {/* ניווט תתי־קטגוריות */}
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
//               {/* תגית מבצע אם יש */}
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
//                   <div className="list__product-price">
//                     {product.price ? (
//                       <>
//                         <p>{priceFormat(product.price.price)}</p>
//                         <p style={{ fontSize: "1.4rem" }}>₪</p>
//                       </>
//                     ) : (
//                       <p>מחיר לא זמין בסופר</p>
//                     )}
//                   </div>
//                   <div className="discount-price">
//                     {product.price && product.price.discount && (
//                       <>{discountPriceFormat(product.price)}</>
//                     )}
//                   </div>
//                 </div>
//                 {/* התמונה */}
//                 <div
//                   className="list__product-image"
//                   onClick={() => moveToPriceList(product.barcode)}
//                 >
//                   <Image barcode={product.barcode} />
//                 </div>
//               </div>

//               {/* כפתורי הוספה/הסרה/אישור */}
//               <div className="list__product-operations">
//                 <div
//                   id={`add-to-cart-${product.barcode}`}
//                   className="list__product-operations__confirm"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     updateAmount(product.barcode);
//                   }}
//                 >
//                   אין שינוי
//                 </div>
//                 <div
//                   className="list__product-operations__add"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     incrementAmount(product.barcode);
//                   }}
//                 >
//                   +
//                 </div>
//                 <div className="list__product-operations__quantity">
//                   <span>{productAmounts[product.barcode] || 0}</span>
//                 </div>
//                 <div
//                   className="list__product-operations__reduce"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     decrementAmount(product.barcode);
//                   }}
//                 >
//                   -
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ProductsList;

//=====================================================================================
//=====================================================================================
//=====================================================================================

import React, { useEffect, useRef, useState } from "react";
import { useProducts } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import "./ProductsList.css";
import { useNavigate } from "react-router";
import {
  updateProductInCart,
  addProductToCart,
  deleteProductFromCart,
} from "../../network/cartService";
import {
  // getAllAlternativeProducts,
  getAlternativeProductByBarcode,
  createAlternativeProduct,
  // updateAllAlternativeProducts,
  updateAlternativeProductByBarcode,
} from "../../network/alternative-productsService";
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

// const OpenBarcode = (barcode) => {
//   console.log("Open " + barcode);
// };

// const CloseBarcode = (barcode) => {
//   console.log("Close" + barcode);
// };

/* -------------------------------- */
/*       ProductsList component     */
/* -------------------------------- */
function ProductsList() {
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

  // =================================================================================
  const [selectedBarcode, setSelectedBarcode] = useState(null); // הברקוד הנבחר
  const [groupData, setGroupData] = useState({}); // אובייקט הברקודים לקבוצה
  // =================================================================================

  const handleOpenBarcode = async (barcode) => {
    if (selectedBarcode === null) {
      // אם אין ברקוד נבחר -> מעבר למצב עריכה
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

  const handleToggleAlternative = (barcode) => {
    if (!selectedBarcode) return;

    setGroupData((prevData) => {
      const currentAlternatives = prevData[selectedBarcode] || [];

      if (currentAlternatives.includes(barcode)) {
        // אם הברקוד כבר קיים -> הסרה מהרשימה
        return {
          ...prevData,
          [selectedBarcode]: currentAlternatives.filter(
            (item) => item !== barcode
          ),
        };
      } else {
        // אם הברקוד לא קיים -> הוספה לרשימה
        return {
          ...prevData,
          [selectedBarcode]: [...currentAlternatives, barcode],
        };
      }
    });
  };

  const handleCloseBarcode = async (barcode) => {
    if (selectedBarcode === barcode) {
      console.log("Saving group:", groupData);

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

      // יציאה ממצב עריכה
      setSelectedBarcode(null);
      setGroupData({});
    }
  };

  const userId = "1"; // מזהה משתמש (דוגמה)

  /* כאן נשמור את ה-inline style שנחיל על ה-container (כדי ליצור אנימציות) */
  const [containerStyle, setContainerStyle] = useState({});

  /* refs לזיהוי כיוון Swipe */
  const startTouch = useRef({ x: 0 });
  const swipeDirection = useRef(null);

  /* -------------------------------- */
  /* טעינת כמות מוצרים מהסל          */
  /* -------------------------------- */
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
      changeButtonToNoChangeAmountButton(button);
      await deleteProductFromCart(userId, barcode);
      await loadCart(userId);
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: 0 });
      return;
    }

    // אם לא היה בסל - הוספה
    if (!oldProductAmounts[barcode]) {
      changeButtonToNoChangeAmountButton(button);
      await addProductToCart(userId, barcode, amount);
      await loadCart(userId);
      setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
      return;
    }

    // אחרת - עדכון
    changeButtonToNoChangeAmountButton(button);
    await updateProductInCart(userId, barcode, amount);
    await loadCart(userId);
    setOldProductAmounts({ ...oldProductAmounts, [barcode]: amount });
  };

  /* סינון מוצרים לפי קטגוריה ותת־קטגוריה פעילים */
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
                  <div className="list__product-price">
                    {product.price ? (
                      <>
                        <p>{priceFormat(product.price.price)}</p>
                        <p style={{ fontSize: "1.4rem" }}>₪</p>
                      </>
                    ) : (
                      <p>מחיר לא זמין בסופר</p>
                    )}
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
                  <div>
                    {selectedBarcode === product.barcode ? (
                      <button
                        onClick={() => handleCloseBarcode(product.barcode)}
                        style={{ backgroundColor: "blue", color: "white" }}
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenBarcode(product.barcode)}
                        style={{ backgroundColor: "green", color: "white" }}
                      >
                        Open
                      </button>
                    )}

                    {selectedBarcode && selectedBarcode !== product.barcode && (
                      <button
                        onClick={() => handleToggleAlternative(product.barcode)}
                        style={{
                          backgroundColor: groupData[selectedBarcode]?.includes(
                            product.barcode
                          )
                            ? "red"
                            : "green",
                          color: "white",
                        }}
                      >
                        {groupData[selectedBarcode]?.includes(product.barcode)
                          ? "Remove"
                          : "Add"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductsList;
//=====================================================================================
//=====================================================================================
//=====================================================================================
