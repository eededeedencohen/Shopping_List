// // // src/components/EditProducts.js

// // import React, { useEffect, useState, useRef } from "react";
// // import {
// //   getAllProducts,
// //   createProduct,
// //   updateProductById,
// //   updateProductsByBarcode,
// //   deleteProductById,
// // } from "../../network/editProductsService";

// // import CategoryNavigation from "./CategoryNavigation";
// // import SubCategoryNavigation from "./SubCategoryNavigation";
// // import Image from "./Images";

// // // // מודאלים
// // // import ModalAddProduct from "./modals/ModalAddProduct";
// // // import ModalSingleEdit from "./modals/ModalSingleEdit";
// // // import ModalBulkEdit from "./modals/ModalBulkEdit";

// // // ה־CSS
// // // import "./ManageProducts.css";

// // import {
// //   getAllAlternativeProductsGroups,
// //   getAlternativeProductsGroupsByBarcode,
// //   createAlternativeProductsGroups,
// //   updateAlternativeProductsGroupsByBarcode,
// // } from "../../network/alternativeProductsGroupsService";

// // import { useProducts } from "../../context/ProductContext";

// // import ModalAddProduct from "./modals/ModalAddProduct";
// // import ModalBulkEdit from "./modals/ModalBulkEdit";
// // import ModalGlobalEdit from "./modals/ModalGlobalEdit";
// // import ModalSingleEdit from "./modals/ModalSingleEdit";





// // // CSS
// // import "./ManageProducts.css";

// // /* -----------------------------------------------------------------
// //    פונקציות עזר
// // ------------------------------------------------------------------ */
// // function findApgByBarcode(apgData, barcode) {
// //   return apgData.find((item) => item.barcode === barcode);
// // }

// // function getGroupsForBarcode(apgData, barcode) {
// //   const apg = findApgByBarcode(apgData, barcode);
// //   return apg ? apg.groups : [];
// // }

// // function addNewGroup(apgData, barcodeA, newGroupName) {
// //   const newData = JSON.parse(JSON.stringify(apgData));
// //   let apg = newData.find((item) => item.barcode === barcodeA);
// //   if (!apg) {
// //     newData.push({
// //       barcode: barcodeA,
// //       groups: [{ groupName: newGroupName, barcodes: [] }],
// //     });
// //     return newData;
// //   }
// //   const exists = apg.groups.find((g) => g.groupName === newGroupName);
// //   if (!exists) {
// //     apg.groups.push({ groupName: newGroupName, barcodes: [] });
// //   }
// //   return newData;
// // }

// // function addProductToGroup(apgData, barcodeA, groupName, barcodeB) {
// //   const newData = JSON.parse(JSON.stringify(apgData));
// //   const apgA = newData.find((item) => item.barcode === barcodeA);
// //   if (!apgA) return newData;
// //   const group = apgA.groups.find((g) => g.groupName === groupName);
// //   if (!group) return newData;

// //   if (!group.barcodes.includes(barcodeB)) {
// //     group.barcodes.push(barcodeB);
// //   }
// //   return newData;
// // }

// // function removeProductFromGroup(apgData, barcodeA, groupName, barcodeB) {
// //   const newData = JSON.parse(JSON.stringify(apgData));
// //   const apgA = newData.find((item) => item.barcode === barcodeA);
// //   if (!apgA) return newData;
// //   const group = apgA.groups.find((g) => g.groupName === groupName);
// //   if (!group) return newData;

// //   group.barcodes = group.barcodes.filter((b) => b !== barcodeB);
// //   return newData;
// // }

// // // העתקת כל הקבוצות ממוצר B ל-A
// // function copyAllGroupsFromBtoA(apgData, barcodeB, barcodeA) {
// //   const newData = JSON.parse(JSON.stringify(apgData));
// //   const apgB = findApgByBarcode(newData, barcodeB);
// //   if (!apgB) return newData;

// //   let apgA = findApgByBarcode(newData, barcodeA);
// //   if (!apgA) {
// //     newData.push({ barcode: barcodeA, groups: [] });
// //     apgA = findApgByBarcode(newData, barcodeA);
// //   }

// //   apgB.groups.forEach((groupOfB) => {
// //     const existing = apgA.groups.find(
// //       (g) => g.groupName === groupOfB.groupName
// //     );
// //     if (!existing) {
// //       apgA.groups.push({
// //         groupName: groupOfB.groupName,
// //         barcodes: [...groupOfB.barcodes],
// //       });
// //     } else {
// //       const setBarcodes = new Set([...existing.barcodes, ...groupOfB.barcodes]);
// //       existing.barcodes = Array.from(setBarcodes);
// //     }
// //   });

// //   return newData;
// // }

// // // העתקת קבוצה יחידה
// // function copySingleGroupFromBtoA(apgData, barcodeB, groupName, barcodeA) {
// //   const newData = JSON.parse(JSON.stringify(apgData));
// //   const apgB = findApgByBarcode(newData, barcodeB);
// //   if (!apgB) return newData;

// //   const groupB = apgB.groups.find((g) => g.groupName === groupName);
// //   if (!groupB) return newData;

// //   let apgA = findApgByBarcode(newData, barcodeA);
// //   if (!apgA) {
// //     newData.push({ barcode: barcodeA, groups: [] });
// //     apgA = findApgByBarcode(newData, barcodeA);
// //   }

// //   const existingGroup = apgA.groups.find((g) => g.groupName === groupName);
// //   if (!existingGroup) {
// //     apgA.groups.push({
// //       groupName,
// //       barcodes: [...groupB.barcodes],
// //     });
// //   } else {
// //     const setBarcodes = new Set([
// //       ...existingGroup.barcodes,
// //       ...groupB.barcodes,
// //     ]);
// //     existingGroup.barcodes = Array.from(setBarcodes);
// //   }

// //   return newData;
// // }

// // // פונקציה עזר להמרת יחידת משקל (אם תרצה להציג)
// // function convertWeightUnit(unit) {
// //   if (!unit) return "";
// //   switch (unit.toLowerCase()) {
// //     case "g":
// //       return "גרם";
// //     case "kg":
// //       return 'ק"ג';
// //     case "ml":
// //       return 'מ"ל';
// //     case "l":
// //       return "ליטר";
// //     default:
// //       return unit;
// //   }
// // }

// // // -------------------------------------------------------------
// // // הקומפוננטה הראשית
// // // -------------------------------------------------------------
// // function ProductListManagerAlternativeProductsGroups() {
// //   const {
// //     products,
// //     allCategories,
// //     all_sub_categories,
// //     activeCategoryIndex,
// //     setActiveCategoryIndex,
// //     activeSubCategoryIndex,
// //     setActiveSubCategoryIndex,
// //   } = useProducts();

// //   // שמירת apgData מהשרת
// //   const [apgData, setApgData] = useState([]);

// //   // מצבי עבודה
// //   const [mode, setMode] = useState("initial"); // 'initial' | 'editGroup' | 'copyAPG'
// //   const [activeA, setActiveA] = useState(null);
// //   const [activeGroupName, setActiveGroupName] = useState(null);

// //   // מודאלים
// //   const [showAPGGroupsModal, setShowAPGGroupsModal] = useState(false);
// //   const [showShowGroupsModal, setShowShowGroupsModal] = useState(false);
// //   const [showCopyGroupsModal, setShowCopyGroupsModal] = useState(false);

// //   // מקור לעתקת קבוצה B->A
// //   const [copySourceBarcodeB, setCopySourceBarcodeB] = useState(null);

// //   // -------------------------------------------------------------
// //   // טוען מהשרת את כל ה-APG בעת טעינת הקומפוננטה
// //   // -------------------------------------------------------------
// //   useEffect(() => {
// //     const fetchAPG = async () => {
// //       try {
// //         const res = await getAllAlternativeProductsGroups();
// //         setApgData(res?.data?.allGroups || []);
// //       } catch (err) {
// //         console.error("Error loading APG data:", err);
// //       }
// //     };
// //     fetchAPG();
// //   }, []);

// //   // -------------------------------------------------------------
// //   // 1) יצירת / עריכת APG
// //   // -------------------------------------------------------------
// //   const handleCreateEditAPG = (barcodeA) => {
// //     setActiveA(barcodeA);
// //     setMode("initial");
// //     setShowAPGGroupsModal(true);
// //   };

// //   const handleGroupSelected = (groupName) => {
// //     setActiveGroupName(groupName);
// //     setShowAPGGroupsModal(false);
// //     setMode("editGroup");
// //   };

// //   // -------------------------------------------------------------
// //   // 2) מצב editGroup: הוספת / הסרת מוצרים
// //   // -------------------------------------------------------------
// //   const handleAddToGroup = (barcodeB) => {
// //     const newApg = addProductToGroup(
// //       apgData,
// //       activeA,
// //       activeGroupName,
// //       barcodeB
// //     );
// //     setApgData(newApg);
// //   };

// //   const handleRemoveFromGroup = (barcodeB) => {
// //     const newApg = removeProductFromGroup(
// //       apgData,
// //       activeA,
// //       activeGroupName,
// //       barcodeB
// //     );
// //     setApgData(newApg);
// //   };

// //   // -------------------------------------------------------------
// //   // 3) כפתור "שמירת שינויים" -> שליחת עדכון לשרת
// //   // -------------------------------------------------------------
// //   const handleSaveChanges = async () => {
// //     if (!activeA) return;

// //     const apgOfA = findApgByBarcode(apgData, activeA);
// //     if (!apgOfA) {
// //       setMode("initial");
// //       setActiveA(null);
// //       setActiveGroupName(null);
// //       return;
// //     }

// //     try {
// //       const resGet = await getAlternativeProductsGroupsByBarcode(activeA);
// //       if (resGet?.data?.groupsByBarcode) {
// //         // כבר קיים בשרת
// //         await updateAlternativeProductsGroupsByBarcode(activeA, {
// //           groups: apgOfA.groups,
// //         });
// //       } else {
// //         // לא קיים -> יצירה
// //         await createAlternativeProductsGroups({
// //           barcode: activeA,
// //           groups: apgOfA.groups,
// //         });
// //       }
// //     } catch (err) {
// //       console.error("Error saving changes:", err);
// //     }

// //     setMode("initial");
// //     setActiveA(null);
// //     setActiveGroupName(null);
// //   };

// //   // -------------------------------------------------------------
// //   // 4) הצגת קבוצות
// //   // -------------------------------------------------------------
// //   const handleShowGroups = (barcodeA) => {
// //     setActiveA(barcodeA);
// //     setShowShowGroupsModal(true);
// //   };

// //   // -------------------------------------------------------------
// //   // 5) העתקת APG
// //   // -------------------------------------------------------------
// //   const handleCopyAPG = (barcodeA) => {
// //     setActiveA(barcodeA);
// //     setMode("copyAPG");
// //   };

// //   const handleCopyEntireAPG = (barcodeB) => {
// //     const newApg = copyAllGroupsFromBtoA(apgData, barcodeB, activeA);
// //     setApgData(newApg);
// //   };

// //   const handleOpenCopyGroupModal = (barcodeB) => {
// //     setCopySourceBarcodeB(barcodeB);
// //     setShowCopyGroupsModal(true);
// //   };

// //   const handleConfirmCopySingleGroup = (groupName) => {
// //     const newApg = copySingleGroupFromBtoA(
// //       apgData,
// //       copySourceBarcodeB,
// //       groupName,
// //       activeA
// //     );
// //     setApgData(newApg);
// //     setShowCopyGroupsModal(false);
// //   };

// //   // -------------------------------------------------------------
// //   // אנימציות החלקה בין קטגוריות/תתי קטגוריות
// //   // -------------------------------------------------------------
// //   const [containerStyle, setContainerStyle] = useState({});
// //   const startTouch = useRef({ x: 0 });
// //   const swipeDirection = useRef(null);

// //   const handleTouchStart = (event) => {
// //     swipeDirection.current = null;
// //     setContainerStyle({});
// //     startTouch.current.x = event.touches[0].clientX;
// //   };

// //   const handleTouchMove = (event) => {
// //     const moveX = event.touches[0].clientX;
// //     const deltaX = moveX - startTouch.current.x;
// //     if (Math.abs(deltaX) > 150) {
// //       swipeDirection.current = deltaX > 0 ? "right" : "left";
// //     }
// //   };

// //   const animateLeft = () => {
// //     setContainerStyle({ animation: "middleToLeft 0.2s ease" });
// //     setTimeout(() => {
// //       setContainerStyle({ animation: "leftToRight 1ms steps(1) forwards" });
// //     }, 200);
// //     setTimeout(() => {
// //       setContainerStyle({ animation: "rightToMiddle 0.3s ease" });
// //     }, 201);
// //   };

// //   const animateRight = () => {
// //     setContainerStyle({ animation: "middleToRight 0.2s ease" });
// //     setTimeout(() => {
// //       setContainerStyle({ animation: "rightToLeft 1ms steps(1) forwards" });
// //     }, 200);
// //     setTimeout(() => {
// //       setContainerStyle({ animation: "leftToMiddle 0.3s ease" });
// //     }, 201);
// //   };

// //   const handleTouchEnd = () => {
// //     const totalCats = allCategories.length;
// //     const subCats = all_sub_categories[activeCategoryIndex] || [];
// //     const totalSub = subCats.length;

// //     if (swipeDirection.current === "right") {
// //       if (activeSubCategoryIndex > 0) {
// //         setActiveSubCategoryIndex(activeSubCategoryIndex - 1);
// //         animateRight();
// //       } else {
// //         const prevIndex = (activeCategoryIndex - 1 + totalCats) % totalCats;
// //         setActiveCategoryIndex(prevIndex);

// //         const prevSub = all_sub_categories[prevIndex] || [];
// //         setActiveSubCategoryIndex(prevSub.length ? prevSub.length - 1 : 0);
// //         animateRight();
// //       }
// //       window.scrollTo(0, 0);
// //     } else if (swipeDirection.current === "left") {
// //       if (activeSubCategoryIndex < totalSub - 1) {
// //         setActiveSubCategoryIndex(activeSubCategoryIndex + 1);
// //         animateLeft();
// //       } else {
// //         const nextIndex = (activeCategoryIndex + 1) % totalCats;
// //         setActiveCategoryIndex(nextIndex);
// //         setActiveSubCategoryIndex(0);
// //         animateLeft();
// //       }
// //       window.scrollTo(0, 0);
// //     } else {
// //       setContainerStyle({});
// //     }
// //   };

// //   // -------------------------------------------------------------
// //   // סינון מוצרים לפי קטגוריה ותת-קטגוריה
// //   // -------------------------------------------------------------
// //   const currentCategory = allCategories[activeCategoryIndex];
// //   const subCats = all_sub_categories[activeCategoryIndex] || [];
// //   const currentSubCategory = subCats[activeSubCategoryIndex];

// //   const filteredProducts = products.filter((p) => {
// //     if (p.category !== currentCategory) return false;
// //     if (currentSubCategory) {
// //       return p.subcategory === currentSubCategory;
// //     }
// //     return true;
// //   });

// //   // -------------------------------------------------------------
// //   // עזר לזיהוי אם למוצר (B) יש APG
// //   // -------------------------------------------------------------
// //   const hasAPG = (barcodeB) => {
// //     const apgB = findApgByBarcode(apgData, barcodeB);
// //     return apgB && apgB.groups && apgB.groups.length > 0;
// //   };

// //   // האם מוצר B נמצא בקבוצה activeGroupName של activeA?
// //   const isInActiveGroup = (barcodeB) => {
// //     const apgA = findApgByBarcode(apgData, activeA);
// //     if (!apgA) return false;
// //     const group = apgA.groups.find((g) => g.groupName === activeGroupName);
// //     return group ? group.barcodes.includes(barcodeB) : false;
// //   };

// //   // פונקציה אופציונלית
// //   const moveToPriceList = (barcode) => {
// //     console.log("moveToPriceList:", barcode);
// //     // nav(`/priceList/${barcode}`);
// //   };

// //   // -------------------------------------------------------------
// //   // רינדור
// //   // -------------------------------------------------------------
// //   return (
// //     <div className="mp_products-wrapper">
// //       <CategoryNavigation />
// //       <SubCategoryNavigation />

// //       <div
// //         className="mp_products-container"
// //         style={containerStyle}
// //         onTouchStart={handleTouchStart}
// //         onTouchMove={handleTouchMove}
// //         onTouchEnd={handleTouchEnd}
// //       >
// //         {filteredProducts.map((product) => {
// //           const barcode = product.barcode;

// //           // מצב initial + או copyAPG (אבל מדובר במוצר A עצמו)
// //           if (
// //             mode === "initial" ||
// //             (mode === "copyAPG" && barcode === activeA)
// //           ) {
// //             return (
// //               <div key={barcode} className="mp_product-card">
// //                 {/* <div className="apg_product-badge">מבצע</div> אם תרצה */}

// //                 {/* טקסט מימין */}
// //                 <div className="mp_product-data">
// //                   <h3 className="mp_product-name">{product.name}</h3>
// //                   <div className="mp_product-info">
// //                     <p>{product.weight}</p>
// //                     <p>{convertWeightUnit(product.unitWeight)}</p>
// //                     <p className="mp_separator">|</p>
// //                     <p>{product.brand}</p>
// //                   </div>

// //                   {/* רק במצב initial מציגים כפתורי "יצירת/עריכה", "הצג", "העתקת APG" */}
// //                   {mode === "initial" && (
// //                     <div style={{ marginTop: "0.5rem" }}>
// //                       {/* <button
// //                         onClick={() => handleCreateEditAPG(barcode)}
// //                         style={{
// //                           backgroundColor: "#008cba",
// //                           color: "#fff",
// //                           marginRight: "0.5rem",
// //                         }}
// //                       >
// //                         יצירת/עריכת APG
// //                       </button>
// //                       <button
// //                         onClick={() => handleShowGroups(barcode)}
// //                         style={{
// //                           backgroundColor: "#4caf50",
// //                           color: "#fff",
// //                           marginRight: "0.5rem",
// //                         }}
// //                       >
// //                         הצג קבוצות
// //                       </button>
// //                       <button
// //                         onClick={() => handleCopyAPG(barcode)}
// //                         style={{ backgroundColor: "#f0ad4e", color: "#fff" }}
// //                       >
// //                         העתקת APG
// //                       </button> */}
// //                     </div>
// //                   )}
// //                 </div>

// //                 {/* תמונה משמאל */}
// //                 <div
// //                   className="mp_product-image"
// //                   onClick={() => moveToPriceList(barcode)}
// //                 >
// //                   <Image barcode={barcode} />
// //                 </div>
// //               </div>
// //             );
// //           }

// //           // מצב editGroup -> כפתורי הוספה/הסרה
// //           if (mode === "editGroup" && barcode !== activeA) {
// //             const inGroup = isInActiveGroup(barcode);
// //             return (
// //               <div key={barcode} className="mp_product-card">
// //                 <div className="mp_product-data">
// //                   <h3 className="mp_product-name">{product.name}</h3>
// //                   <div className="mp_product-info">
// //                     <p>{product.weight}</p>
// //                     <p>{convertWeightUnit(product.unitWeight)}</p>
// //                     <p className="mp_separator">|</p>
// //                     <p>{product.brand}</p>
// //                   </div>
// //                   <div style={{ marginTop: "0.5rem" }}>
// //                     {inGroup ? (
// //                       <button
// //                         style={{ backgroundColor: "#f44336", color: "#fff" }}
// //                         onClick={() => handleRemoveFromGroup(barcode)}
// //                       >
// //                         הסר מהקבוצה
// //                       </button>
// //                     ) : (
// //                       <button
// //                         style={{ backgroundColor: "#4caf50", color: "#fff" }}
// //                         onClick={() => handleAddToGroup(barcode)}
// //                       >
// //                         הוסף לקבוצה
// //                       </button>
// //                     )}
// //                   </div>
// //                 </div>
// //                 <div className="mp_product-image">
// //                   <Image barcode={barcode} />
// //                 </div>
// //               </div>
// //             );
// //           }

// //           // מצב copyAPG -> למוצרים שאינם A ויש להם APG
// //           if (mode === "copyAPG" && barcode !== activeA && hasAPG(barcode)) {
// //             return (
// //               <div key={barcode} className="mp_product-card">
// //                 <div className="mp_product-data">
// //                   <h3 className="mp_product-name">{product.name}</h3>
// //                   <div className="mp_product-info">
// //                     <p>{product.weight}</p>
// //                     <p>{convertWeightUnit(product.unitWeight)}</p>
// //                     <p className="mp_separator">|</p>
// //                     <p>{product.brand}</p>
// //                   </div>
// //                   <div style={{ marginTop: "0.5rem" }}>
// //                     <button
// //                       style={{
// //                         backgroundColor: "#f0ad4e",
// //                         color: "#fff",
// //                         marginRight: "0.5rem",
// //                       }}
// //                       onClick={() => handleCopyEntireAPG(barcode)}
// //                     >
// //                       העתקת APG ממוצר זה
// //                     </button>
// //                     <button
// //                       style={{ backgroundColor: "#5bc0de", color: "#fff" }}
// //                       onClick={() => handleOpenCopyGroupModal(barcode)}
// //                     >
// //                       העתקת קבוצה
// //                     </button>
// //                   </div>
// //                 </div>
// //                 <div className="mp_product-image">
// //                   <Image barcode={barcode} />
// //                 </div>
// //               </div>
// //             );
// //           }

// //           // מצב copyAPG -> אין APG
// //           if (mode === "copyAPG" && !hasAPG(barcode)) {
// //             return (
// //               <div key={barcode} className="mp_product-card">
// //                 <div className="mp_product-data">
// //                   <h3 className="mp_product-name">{product.name}</h3>
// //                   <div className="mp_product-info">
// //                     <p>{product.weight}</p>
// //                     <p>{convertWeightUnit(product.unitWeight)}</p>
// //                     <p className="mp_separator">|</p>
// //                     <p>{product.brand}</p>
// //                   </div>
// //                   <p style={{ marginTop: "0.5rem", color: "#f00" }}>
// //                     אין APG למוצר זה
// //                   </p>
// //                 </div>
// //                 <div className="mp_product-image">
// //                   <Image barcode={barcode} />
// //                 </div>
// //               </div>
// //             );
// //           }

// //           return null;
// //         })}
// //       </div>

// //       {/* כפתור "שמירת שינויים" כאשר mode = editGroup או copyAPG */}
// //       {/* {(mode === "editGroup" || mode === "copyAPG") && activeA && (
// //         <button
// //           style={{
// //             marginTop: "1rem",
// //             backgroundColor: "#4caf50",
// //             color: "#fff",
// //             border: "none",
// //             padding: "0.6rem 1rem",
// //             borderRadius: "5px",
// //             cursor: "pointer",
// //           }}
// //           onClick={handleSaveChanges}
// //         >
// //           שמירת שינויים
// //         </button>
// //       )} */}

// //       {/* מודאל: יצירת/בחירת קבוצה */}
// //       {/* {showAPGGroupsModal && (
// //         <ModalAPGGroups
// //           isOpen={showAPGGroupsModal}
// //           onClose={() => setShowAPGGroupsModal(false)}
// //           groups={getGroupsForBarcode(apgData, activeA)}
// //           onGroupSelected={handleGroupSelected}
// //           onCreateNewGroup={(groupName) => {
// //             const newData = addNewGroup(apgData, activeA, groupName);
// //             setApgData(newData);
// //             handleGroupSelected(groupName);
// //           }}
// //         />
// //       )} */}

// //       {/* מודאל: הצגת קבוצות + מחיקה */}
// //       {/* {showShowGroupsModal && (
// //         <ModalShowGroups
// //           isOpen={showShowGroupsModal}
// //           apgData={apgData}
// //           setApgData={setApgData}
// //           barcodeA={activeA}
// //           // כשהמשתמש סוגר המודאל ללא אישור
// //           onCloseNoSave={() => {
// //             setShowShowGroupsModal(false);
// //             setMode("initial"); // חוזרים למצב התחלתי
// //           }}
// //           // כשהמשתמש אישר שמירת שינויים מקומי
// //           onApplyChanges={() => {
// //             setShowShowGroupsModal(false);
// //             setMode("editGroup"); // מציג כפתור שמירת שינויים
// //           }}
// //         />
// //       )} */}

// //       {/* מודאל: העתקת קבוצה ממוצר B */}
// //       {/* {showCopyGroupsModal && (
// //         <ModalCopyGroups
// //           isOpen={showCopyGroupsModal}
// //           onClose={() => setShowCopyGroupsModal(false)}
// //           barcodeB={copySourceBarcodeB}
// //           apgData={apgData}
// //           onConfirmCopySingleGroup={handleConfirmCopySingleGroup}
// //         />
// //       )} */}
// //     </div>
// //   );
// // }

// // export default ProductListManagerAlternativeProductsGroups;


// // src/components/EditProducts.js
// import React, { useEffect, useState, useRef } from "react";
// import {
//   getAllProducts,
//   createProduct,
//   updateProductById,
//   updateProductsByBarcode,
//   deleteProductById,
// } from "../../network/editProductsService";

// // ניווט קטגוריות (לדוגמה)
// import CategoryNavigation from "./CategoryNavigation";
// import SubCategoryNavigation from "./SubCategoryNavigation";
// import Image from "./Images"; // להצגת תמונות מוצרים

// // אם יש לך context מוצרים
// import { useProducts } from "../../context/ProductContext";

// // ה־CSS
// import "./ManageProducts.css";

// /** פונקציית עזר להמרת יחידת משקל */
// function convertWeightUnit(unit) {
//   if (!unit) return "";
//   switch ((unit || "").toLowerCase()) {
//     case "g":
//       return "גרם";
//     case "kg":
//       return 'ק"ג';
//     case "ml":
//       return 'מ"ל';
//     case "l":
//       return "ליטר";
//     default:
//       return unit;
//   }
// }

// export default function EditProducts() {
//   const {
//     products,                // בא מהקונטקסט useProducts
//     allCategories,
//     all_sub_categories,
//     activeCategoryIndex,
//     setActiveCategoryIndex,
//     activeSubCategoryIndex,
//     setActiveSubCategoryIndex
//   } = useProducts();

//   // מצבי עבודה בסיסיים
//   const [mode, setMode] = useState("initial"); 
//   // "initial" | "addProduct" | "bulkEdit" | "editSingle" | ...

//   // אנימציית החלקה לקטגוריות
//   const [containerStyle, setContainerStyle] = useState({});
//   const startTouch = useRef({ x: 0 });
//   const swipeDirection = useRef(null);

//   // -----------------------------------------------------------
//   // אנימציות החלקה (סוויפ) לקטגוריות
//   // -----------------------------------------------------------
//   const handleTouchStart = (evt) => {
//     swipeDirection.current = null;
//     setContainerStyle({});
//     startTouch.current.x = evt.touches[0].clientX;
//   };
//   const handleTouchMove = (evt) => {
//     const moveX = evt.touches[0].clientX;
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
//     const totalCats = allCategories.length;
//     const subCats = all_sub_categories[activeCategoryIndex] || [];
//     const totalSub = subCats.length;

//     if (swipeDirection.current === "right") {
//       if (activeSubCategoryIndex > 0) {
//         setActiveSubCategoryIndex(activeSubCategoryIndex - 1);
//         animateRight();
//       } else {
//         const prevIndex = (activeCategoryIndex - 1 + totalCats) % totalCats;
//         setActiveCategoryIndex(prevIndex);
//         const prevSub = all_sub_categories[prevIndex] || [];
//         setActiveSubCategoryIndex(prevSub.length ? prevSub.length - 1 : 0);
//         animateRight();
//       }
//       window.scrollTo(0, 0);
//     }
//     else if (swipeDirection.current === "left") {
//       if (activeSubCategoryIndex < totalSub - 1) {
//         setActiveSubCategoryIndex(activeSubCategoryIndex + 1);
//         animateLeft();
//       } else {
//         const nextIndex = (activeCategoryIndex + 1) % totalCats;
//         setActiveCategoryIndex(nextIndex);
//         setActiveSubCategoryIndex(0);
//         animateLeft();
//       }
//       window.scrollTo(0, 0);
//     } else {
//       // אין סוויפ משמעותי
//       setContainerStyle({});
//     }
//   };

//   // סינון המוצרים לפי קטגוריה ותת־קטגוריה
//   const currentCategory = allCategories[activeCategoryIndex];
//   const subCats = all_sub_categories[activeCategoryIndex] || [];
//   const currentSubCategory = subCats[activeSubCategoryIndex];

//   const filteredProducts = products.filter((prod) => {
//     if (prod.category !== currentCategory) return false;
//     if (currentSubCategory) {
//       return prod.subcategory === currentSubCategory;
//     }
//     return true;
//   });

//   // -----------------------------------------------------------
//   // כפתורי מצב (בדוגמה: "הוספת מוצר", "עריכה מרובה")
//   // -----------------------------------------------------------
//   const handleAddProduct = () => {
//     setMode("addProduct");
//     // כאן אפשר לפתוח מודאל או לשנות state
//   };
//   const handleBulkEdit = () => {
//     setMode("bulkEdit");
//     // מצב שבו רואים checkbox בכל מוצר
//   };

//   // -----------------------------------------------------------
//   // Render
//   // -----------------------------------------------------------
//   return (
//     <div className="mp_products-wrapper">
//       {/* ניווט קטגוריות */}
//       <CategoryNavigation />
//       <SubCategoryNavigation />

//       {/* כפתורים למעלה (בדוגמה - רק במצב initial) */}
//       {mode === "initial" && (
//         <div style={{ margin: "1rem" }}>
//           <button style={{ marginRight: "0.5rem" }} onClick={handleAddProduct}>
//             הוספת מוצר
//           </button>
//           <button onClick={handleBulkEdit}>
//             עריכה מרובה
//           </button>
//         </div>
//       )}

//       {/* אזור הצגת המוצרים */}
//       <div
//         className="mp_products-container"
//         style={containerStyle}
//         onTouchStart={handleTouchStart}
//         onTouchMove={handleTouchMove}
//         onTouchEnd={handleTouchEnd}
//       >
//         {filteredProducts.map((prod) => (
//           <div key={prod._id || prod.barcode} className="mp_product-card">
//             {/* עמודת טקסט (ימין) */}
//             <div className="mp_product-data">
//               <h3 className="mp_product-name">{prod.name}</h3>
//               <div className="mp_product-info">
//                 <p>{prod.weight}</p>
//                 <p>{convertWeightUnit(prod.unitWeight)}</p>
//                 <p className="mp_separator">|</p>
//                 <p>{prod.brand}</p>
//               </div>
//               {/* כפתורים או מצב נוסף */}
//             </div>

//             {/* עמודת תמונה (שמאל) */}
//             <div className="mp_product-image">
//               <Image barcode={prod.barcode} />
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// src/components/EditProducts.js

import React, { useEffect, useState, useRef } from "react";
import {
  getAllProducts,
  createProduct,
  updateProductById,
  updateProductsByBarcode,
  deleteProductById,
} from "../../network/editProductsService";

// ניווט קטגוריות (לדוגמה)
import CategoryNavigation from "./CategoryNavigation";
import SubCategoryNavigation from "./SubCategoryNavigation";
import Image from "./Images"; // להצגת תמונות מוצרים

// אם יש לך context מוצרים
import { useProducts } from "../../context/ProductContext";

// מודאלים
import ModalAddProduct from "./modals/ModalAddProduct";
import ModalSingleEdit from "./modals/ModalSingleEdit";
import ModalBulkEdit from "./modals/ModalBulkEdit";
import ModalGlobalEdit from "./modals/ModalGlobalEdit";

// ה־CSS (כולל עיצוב הכפתורים, הכרטיסים, והאנימציות)
import "./ManageProducts.css";

/** פונקציית עזר להמרת יחידת משקל */
function convertWeightUnit(unit) {
  if (!unit) return "";
  switch ((unit || "").toLowerCase()) {
    case "g":
      return "גרם";
    case "kg":
      return 'ק"ג';
    case "ml":
      return 'מ"ל';
    case "l":
      return "ליטר";
    default:
      return unit;
  }
}

export default function EditProducts() {
  const {
    products,                
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex
  } = useProducts();

  // מצב ראשי
  const [mode, setMode] = useState("initial"); 
  // 'initial' | 'addProduct' | 'bulkEdit' | 'editSingle' | 'globalEdit'

  // מוצר נבחר לעריכה יחידנית
  const [selectedProduct, setSelectedProduct] = useState(null);

  // מוצרים נבחרים (לעריכה מרובה)
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);

  // אנימציה לקטגוריות
  const [containerStyle, setContainerStyle] = useState({});
  const startTouch = useRef({ x: 0 });
  const swipeDirection = useRef(null);

  // נטען קודם (אם צריך) - כאן אני מניח שה־products כבר בקונטקסט
  
  // ============ אנימציות החלקה ============
  const handleTouchStart = (evt) => {
    swipeDirection.current = null;
    setContainerStyle({});
    startTouch.current.x = evt.touches[0].clientX;
  };
  const handleTouchMove = (evt) => {
    const moveX = evt.touches[0].clientX;
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
    const totalCats = allCategories.length;
    const subCats = all_sub_categories[activeCategoryIndex] || [];
    const totalSub = subCats.length;

    if (swipeDirection.current === "right") {
      // החלקה ימינה
      if (activeSubCategoryIndex > 0) {
        setActiveSubCategoryIndex(activeSubCategoryIndex - 1);
        animateRight();
      } else {
        const prevIndex = (activeCategoryIndex - 1 + totalCats) % totalCats;
        setActiveCategoryIndex(prevIndex);
        const prevSub = all_sub_categories[prevIndex] || [];
        setActiveSubCategoryIndex(prevSub.length ? prevSub.length - 1 : 0);
        animateRight();
      }
      window.scrollTo(0, 0);
    }
    else if (swipeDirection.current === "left") {
      // החלקה שמאלה
      if (activeSubCategoryIndex < totalSub - 1) {
        setActiveSubCategoryIndex(activeSubCategoryIndex + 1);
        animateLeft();
      } else {
        const nextIndex = (activeCategoryIndex + 1) % totalCats;
        setActiveCategoryIndex(nextIndex);
        setActiveSubCategoryIndex(0);
        animateLeft();
      }
      window.scrollTo(0, 0);
    }
    else {
      setContainerStyle({});
    }
  };

  // ============ סינון מוצרים ============
  const currentCategory = allCategories[activeCategoryIndex];
  const subCats = all_sub_categories[activeCategoryIndex] || [];
  const currentSubCategory = subCats[activeSubCategoryIndex];

  const filteredProducts = products.filter((prod) => {
    if (prod.category !== currentCategory) return false;
    if (currentSubCategory) {
      return prod.subcategory === currentSubCategory;
    }
    return true;
  });

  // ============ כפתורים למעלה ============
  const handleAddProduct = () => {
    setMode("addProduct");
  };
  const handleBulkEdit = () => {
    setMode("bulkEdit");
    setSelectedBarcodes([]);
  };
  const handleGlobalEdit = () => {
    setMode("globalEdit");
  };

  // ============ סגירת כל המצבים/מודאלים ============
  const handleCloseAll = () => {
    setMode("initial");
    setSelectedProduct(null);
    setSelectedBarcodes([]);
  };

  // ============ "ערוך" במוצר יחיד =========== 
  const handleEditSingle = (product) => {
    setSelectedProduct(product);
    setMode("editSingle");
  };

  // ============ מחיקה מוצר =========== 
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProductById(id);
      // כאן מומלץ להסירו גם מהסטייט (אם שמרת products כאן)
      // בקונטקסט useProducts אולי יש פונקציה לעדכן...
      // or if the context is read-only, you'd do something else
      // For simplicity:
      // setProducts(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // ============ Render ============
  return (
    <div className="mp_products-wrapper">
      {/* ניווט קטגוריות */}
      <CategoryNavigation />
      <SubCategoryNavigation />

      {/* כפתורי מצב בראש הדף */}
      {mode === "initial" && (
        <div className="mp_top-buttons">
          <button className="mp_btn" onClick={handleAddProduct}>
            הוספת מוצר
          </button>
          <button className="mp_btn" onClick={handleBulkEdit}>
            עריכה מרובה
          </button>
          <button className="mp_btn" onClick={handleGlobalEdit}>
            עריכה כללית
          </button>
        </div>
      )}

      <div
        className="mp_products-container"
        style={containerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {filteredProducts.map((prod) => (
          <div key={prod._id || prod.barcode} className="mp_product-card">
            {/* עמודת טקסט (ימין) */}
            <div className="mp_product-data">
              <h3 className="mp_product-name">{prod.name}</h3>
              <div className="mp_product-info">
                <p>{prod.weight}</p>
                <p>{convertWeightUnit(prod.unitWeight)}</p>
                <p className="mp_separator">|</p>
                <p>{prod.brand}</p>
              </div>

              {/* כפתור "ערוך" ו"מחק" (רק במצב initial) */}
              {mode === "initial" && (
                <div style={{ marginTop: "0.5rem", display: "flex", gap: "0.5rem" }}>
                  <button
                    style={{ backgroundColor: "#008cba", color: "#fff", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px" }}
                    onClick={() => handleEditSingle(prod)}
                  >
                    ערוך
                  </button>
                  <button
                    style={{ backgroundColor: "#f44336", color: "#fff", border: "none", padding: "0.3rem 0.6rem", borderRadius: "4px" }}
                    onClick={() => handleDeleteProduct(prod._id)}
                  >
                    מחק
                  </button>
                </div>
              )}

              {/* במצב bulkEdit => checkbox */}
              {mode === "bulkEdit" && (
                <div style={{ marginTop: "0.5rem" }}>
                  <input
                    type="checkbox"
                    checked={selectedBarcodes.includes(prod.barcode)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedBarcodes([...selectedBarcodes, prod.barcode]);
                      } else {
                        setSelectedBarcodes(
                          selectedBarcodes.filter((bc) => bc !== prod.barcode)
                        );
                      }
                    }}
                  />
                </div>
              )}
            </div>

            {/* עמודת תמונה (משמאל) */}
            <div className="mp_product-image">
              <Image barcode={prod.barcode} />
            </div>
          </div>
        ))}
      </div>

      {/* כאן נדגים הצגת המודאלים (מותנה ב-mode) */}
      <ModalAddProduct
        isOpen={mode === "addProduct"}
        onClose={handleCloseAll}
        onProductCreated={async (newProd) => {
          try {
            const res = await createProduct(newProd);
            // עדכן Products (אם אתה מחזיק אותם כאן, אחרת בקונטקסט)
            // setProducts(prev => [...prev, res.data.product]);
            handleCloseAll();
          } catch (err) {
            console.error("Error creating product:", err);
          }
        }}
      />

      <ModalSingleEdit
        isOpen={mode === "editSingle" && selectedProduct}
        onClose={handleCloseAll}
        product={selectedProduct}
        onSave={async (updates) => {
          try {
            if (!selectedProduct) return;
            const res = await updateProductById(selectedProduct._id, updates);
            // עדכן Products
            // setProducts(prev => prev.map(p => p._id === selectedProduct._id ? res.data.product : p));
            handleCloseAll();
          } catch (err) {
            console.error("Error updating product:", err);
          }
        }}
      />

      <ModalBulkEdit
        isOpen={mode === "bulkEdit"}
        onClose={handleCloseAll}
        selectedBarcodes={selectedBarcodes}
        onApply={async (commonUpdates) => {
          if (!selectedBarcodes || !selectedBarcodes.length) {
            handleCloseAll();
            return;
          }
          const arr = selectedBarcodes.map((bc) => ({
            barcode: bc,
            ...commonUpdates
          }));
          try {
            const res = await updateProductsByBarcode(arr);
            // עדכן products
            // const updatedList = res.data.products;
            // setProducts(...);
            handleCloseAll();
          } catch (err) {
            console.error("Error in bulk edit:", err);
          }
        }}
      />

      <ModalGlobalEdit
        isOpen={mode === "globalEdit"}
        onClose={handleCloseAll}
        onApplyChanges={(globalData) => {
          // כאן אפשר לממש לוגיקה משלך (אם יש נקודת קצה מתאימה בשרת)
          console.log("Global Data:", globalData);
          handleCloseAll();
        }}
      />
    </div>
  );
}
