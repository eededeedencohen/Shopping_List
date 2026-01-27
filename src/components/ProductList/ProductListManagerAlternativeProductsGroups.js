import React, { useEffect, useState, useRef } from "react";
import {
  getAllAlternativeProductsGroups,
  getAlternativeProductsGroupsByBarcode,
  createAlternativeProductsGroups,
  updateAlternativeProductsGroupsByBarcode,
} from "../../network/alternativeProductsGroupsService";

import { useProducts } from "../../context/ProductContext";

// קומפוננטות ניווט
import CategoryNavigation from "./CategoryNavigation";
import SubCategoryNavigation from "./SubCategoryNavigation";

// תמונת מוצר
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";

// מודאלים
import ModalAPGGroups from "./ModalAPGGroups";
import ModalShowGroups from "./ModalShowGroups";
import ModalCopyGroups from "./ModalCopyGroups";

// CSS
import "./ProductListManagerAlternativeProductsGroups.css";

/* -----------------------------------------------------------------
   פונקציות עזר
------------------------------------------------------------------ */
function findApgByBarcode(apgData, barcode) {
  return apgData.find((item) => item.barcode === barcode);
}

function getGroupsForBarcode(apgData, barcode) {
  const apg = findApgByBarcode(apgData, barcode);
  return apg ? apg.groups : [];
}

function addNewGroup(apgData, barcodeA, newGroupName) {
  const newData = JSON.parse(JSON.stringify(apgData));
  let apg = newData.find((item) => item.barcode === barcodeA);
  if (!apg) {
    newData.push({
      barcode: barcodeA,
      groups: [{ groupName: newGroupName, barcodes: [] }],
    });
    return newData;
  }
  const exists = apg.groups.find((g) => g.groupName === newGroupName);
  if (!exists) {
    apg.groups.push({ groupName: newGroupName, barcodes: [] });
  }
  return newData;
}

function addProductToGroup(apgData, barcodeA, groupName, barcodeB) {
  const newData = JSON.parse(JSON.stringify(apgData));
  const apgA = newData.find((item) => item.barcode === barcodeA);
  if (!apgA) return newData;
  const group = apgA.groups.find((g) => g.groupName === groupName);
  if (!group) return newData;

  if (!group.barcodes.includes(barcodeB)) {
    group.barcodes.push(barcodeB);
  }
  return newData;
}

function removeProductFromGroup(apgData, barcodeA, groupName, barcodeB) {
  const newData = JSON.parse(JSON.stringify(apgData));
  const apgA = newData.find((item) => item.barcode === barcodeA);
  if (!apgA) return newData;
  const group = apgA.groups.find((g) => g.groupName === groupName);
  if (!group) return newData;

  group.barcodes = group.barcodes.filter((b) => b !== barcodeB);
  return newData;
}

// העתקת כל הקבוצות ממוצר B ל-A
function copyAllGroupsFromBtoA(apgData, barcodeB, barcodeA) {
  const newData = JSON.parse(JSON.stringify(apgData));
  const apgB = findApgByBarcode(newData, barcodeB);
  if (!apgB) return newData;

  let apgA = findApgByBarcode(newData, barcodeA);
  if (!apgA) {
    newData.push({ barcode: barcodeA, groups: [] });
    apgA = findApgByBarcode(newData, barcodeA);
  }

  apgB.groups.forEach((groupOfB) => {
    const existing = apgA.groups.find(
      (g) => g.groupName === groupOfB.groupName,
    );
    if (!existing) {
      apgA.groups.push({
        groupName: groupOfB.groupName,
        barcodes: [...groupOfB.barcodes],
      });
    } else {
      const setBarcodes = new Set([...existing.barcodes, ...groupOfB.barcodes]);
      existing.barcodes = Array.from(setBarcodes);
    }
  });

  return newData;
}

// העתקת קבוצה יחידה
function copySingleGroupFromBtoA(apgData, barcodeB, groupName, barcodeA) {
  const newData = JSON.parse(JSON.stringify(apgData));
  const apgB = findApgByBarcode(newData, barcodeB);
  if (!apgB) return newData;

  const groupB = apgB.groups.find((g) => g.groupName === groupName);
  if (!groupB) return newData;

  let apgA = findApgByBarcode(newData, barcodeA);
  if (!apgA) {
    newData.push({ barcode: barcodeA, groups: [] });
    apgA = findApgByBarcode(newData, barcodeA);
  }

  const existingGroup = apgA.groups.find((g) => g.groupName === groupName);
  if (!existingGroup) {
    apgA.groups.push({
      groupName,
      barcodes: [...groupB.barcodes],
    });
  } else {
    const setBarcodes = new Set([
      ...existingGroup.barcodes,
      ...groupB.barcodes,
    ]);
    existingGroup.barcodes = Array.from(setBarcodes);
  }

  return newData;
}

// פונקציה עזר להמרת יחידת משקל (אם תרצה להציג)
function convertWeightUnit(unit) {
  if (!unit) return "";
  switch (unit.toLowerCase()) {
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

// -------------------------------------------------------------
// הקומפוננטה הראשית
// -------------------------------------------------------------
function ProductListManagerAlternativeProductsGroups() {
  const {
    products,
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProducts();

  // שמירת apgData מהשרת
  const [apgData, setApgData] = useState([]);

  // מצבי עבודה
  const [mode, setMode] = useState("initial"); // 'initial' | 'editGroup' | 'copyAPG'
  const [activeA, setActiveA] = useState(null);
  const [activeGroupName, setActiveGroupName] = useState(null);

  // מודאלים
  const [showAPGGroupsModal, setShowAPGGroupsModal] = useState(false);
  const [showShowGroupsModal, setShowShowGroupsModal] = useState(false);
  const [showCopyGroupsModal, setShowCopyGroupsModal] = useState(false);

  // מקור לעתקת קבוצה B->A
  const [copySourceBarcodeB, setCopySourceBarcodeB] = useState(null);

  // -------------------------------------------------------------
  // טוען מהשרת את כל ה-APG בעת טעינת הקומפוננטה
  // -------------------------------------------------------------
  useEffect(() => {
    const fetchAPG = async () => {
      try {
        const res = await getAllAlternativeProductsGroups();
        setApgData(res?.data?.allGroups || []);
      } catch (err) {
        console.error("Error loading APG data:", err);
      }
    };
    fetchAPG();
  }, []);

  // -------------------------------------------------------------
  // 1) יצירת / עריכת APG
  // -------------------------------------------------------------
  const handleCreateEditAPG = (barcodeA) => {
    setActiveA(barcodeA);
    setMode("initial");
    setShowAPGGroupsModal(true);
  };

  const handleGroupSelected = (groupName) => {
    setActiveGroupName(groupName);
    setShowAPGGroupsModal(false);
    setMode("editGroup");
  };

  // -------------------------------------------------------------
  // 2) מצב editGroup: הוספת / הסרת מוצרים
  // -------------------------------------------------------------
  const handleAddToGroup = (barcodeB) => {
    const newApg = addProductToGroup(
      apgData,
      activeA,
      activeGroupName,
      barcodeB,
    );
    setApgData(newApg);
  };

  const handleRemoveFromGroup = (barcodeB) => {
    const newApg = removeProductFromGroup(
      apgData,
      activeA,
      activeGroupName,
      barcodeB,
    );
    setApgData(newApg);
  };

  // -------------------------------------------------------------
  // 3) כפתור "שמירת שינויים" -> שליחת עדכון לשרת
  // -------------------------------------------------------------
  const handleSaveChanges = async () => {
    if (!activeA) return;

    const apgOfA = findApgByBarcode(apgData, activeA);
    if (!apgOfA) {
      setMode("initial");
      setActiveA(null);
      setActiveGroupName(null);
      return;
    }

    try {
      const resGet = await getAlternativeProductsGroupsByBarcode(activeA);
      if (resGet?.data?.groupsByBarcode) {
        // כבר קיים בשרת
        await updateAlternativeProductsGroupsByBarcode(activeA, {
          groups: apgOfA.groups,
        });
      } else {
        // לא קיים -> יצירה
        await createAlternativeProductsGroups({
          barcode: activeA,
          groups: apgOfA.groups,
        });
      }
    } catch (err) {
      console.error("Error saving changes:", err);
    }

    setMode("initial");
    setActiveA(null);
    setActiveGroupName(null);
  };

  // -------------------------------------------------------------
  // 4) הצגת קבוצות
  // -------------------------------------------------------------
  const handleShowGroups = (barcodeA) => {
    setActiveA(barcodeA);
    setShowShowGroupsModal(true);
  };

  // -------------------------------------------------------------
  // 5) העתקת APG
  // -------------------------------------------------------------
  const handleCopyAPG = (barcodeA) => {
    setActiveA(barcodeA);
    setMode("copyAPG");
  };

  const handleCopyEntireAPG = (barcodeB) => {
    const newApg = copyAllGroupsFromBtoA(apgData, barcodeB, activeA);
    setApgData(newApg);
  };

  const handleOpenCopyGroupModal = (barcodeB) => {
    setCopySourceBarcodeB(barcodeB);
    setShowCopyGroupsModal(true);
  };

  const handleConfirmCopySingleGroup = (groupName) => {
    const newApg = copySingleGroupFromBtoA(
      apgData,
      copySourceBarcodeB,
      groupName,
      activeA,
    );
    setApgData(newApg);
    setShowCopyGroupsModal(false);
  };

  // -------------------------------------------------------------
  // אנימציות החלקה בין קטגוריות/תתי קטגוריות
  // -------------------------------------------------------------
  const [containerStyle, setContainerStyle] = useState({});
  const startTouch = useRef({ x: 0 });
  const swipeDirection = useRef(null);

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
    const totalCats = allCategories.length;
    const subCats = all_sub_categories[activeCategoryIndex] || [];
    const totalSub = subCats.length;

    if (swipeDirection.current === "right") {
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
    } else if (swipeDirection.current === "left") {
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
    } else {
      setContainerStyle({});
    }
  };

  // -------------------------------------------------------------
  // סינון מוצרים לפי קטגוריה ותת-קטגוריה
  // -------------------------------------------------------------
  const currentCategory = allCategories[activeCategoryIndex];
  const subCats = all_sub_categories[activeCategoryIndex] || [];
  const currentSubCategory = subCats[activeSubCategoryIndex];

  const filteredProducts = products.filter((p) => {
    if (p.category !== currentCategory) return false;
    if (currentSubCategory) {
      return p.subcategory === currentSubCategory;
    }
    return true;
  });

  // -------------------------------------------------------------
  // עזר לזיהוי אם למוצר (B) יש APG
  // -------------------------------------------------------------
  const hasAPG = (barcodeB) => {
    const apgB = findApgByBarcode(apgData, barcodeB);
    return apgB && apgB.groups && apgB.groups.length > 0;
  };

  // האם מוצר B נמצא בקבוצה activeGroupName של activeA?
  const isInActiveGroup = (barcodeB) => {
    const apgA = findApgByBarcode(apgData, activeA);
    if (!apgA) return false;
    const group = apgA.groups.find((g) => g.groupName === activeGroupName);
    return group ? group.barcodes.includes(barcodeB) : false;
  };

  // פונקציה אופציונלית
  const moveToPriceList = (barcode) => {
    console.log("moveToPriceList:", barcode);
    // nav(`/priceList/${barcode}`);
  };

  // -------------------------------------------------------------
  // רינדור
  // -------------------------------------------------------------
  return (
    <div className="apg_products-wrapper">
      <CategoryNavigation />
      <SubCategoryNavigation />

      <div
        className="apg_products-container"
        style={containerStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {filteredProducts.map((product) => {
          const barcode = product.barcode;

          // מצב initial + או copyAPG (אבל מדובר במוצר A עצמו)
          if (
            mode === "initial" ||
            (mode === "copyAPG" && barcode === activeA)
          ) {
            return (
              <div key={barcode} className="apg_product-card">
                {/* <div className="apg_product-badge">מבצע</div> אם תרצה */}

                {/* טקסט מימין */}
                <div className="apg_product-data">
                  <h3 className="apg_product-name">{product.name}</h3>
                  <div className="apg_product-info">
                    <p>{product.weight}</p>
                    <p>{convertWeightUnit(product.unitWeight)}</p>
                    <p className="apg_separator">|</p>
                    <p>{product.brand}</p>
                  </div>

                  {/* רק במצב initial מציגים כפתורי "יצירת/עריכה", "הצג", "העתקת APG" */}
                  {mode === "initial" && (
                    <div style={{ marginTop: "0.5rem" }}>
                      <button
                        onClick={() => handleCreateEditAPG(barcode)}
                        style={{
                          backgroundColor: "#008cba",
                          color: "#fff",
                          marginRight: "0.5rem",
                        }}
                      >
                        יצירת/עריכת APG
                      </button>
                      <button
                        onClick={() => handleShowGroups(barcode)}
                        style={{
                          backgroundColor: "#4caf50",
                          color: "#fff",
                          marginRight: "0.5rem",
                        }}
                      >
                        הצג קבוצות
                      </button>
                      <button
                        onClick={() => handleCopyAPG(barcode)}
                        style={{ backgroundColor: "#f0ad4e", color: "#fff" }}
                      >
                        העתקת APG
                      </button>
                    </div>
                  )}
                </div>

                {/* תמונה משמאל */}
                <div
                  className="apg_product-image"
                  onClick={() => moveToPriceList(barcode)}
                >
                  <Image barcode={barcode} />
                </div>
              </div>
            );
          }

          // מצב editGroup -> כפתורי הוספה/הסרה
          if (mode === "editGroup" && barcode !== activeA) {
            const inGroup = isInActiveGroup(barcode);
            return (
              <div key={barcode} className="apg_product-card">
                <div className="apg_product-data">
                  <h3 className="apg_product-name">{product.name}</h3>
                  <div className="apg_product-info">
                    <p>{product.weight}</p>
                    <p>{convertWeightUnit(product.unitWeight)}</p>
                    <p className="apg_separator">|</p>
                    <p>{product.brand}</p>
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    {inGroup ? (
                      <button
                        style={{ backgroundColor: "#f44336", color: "#fff" }}
                        onClick={() => handleRemoveFromGroup(barcode)}
                      >
                        הסר מהקבוצה
                      </button>
                    ) : (
                      <button
                        style={{ backgroundColor: "#4caf50", color: "#fff" }}
                        onClick={() => handleAddToGroup(barcode)}
                      >
                        הוסף לקבוצה
                      </button>
                    )}
                  </div>
                </div>
                <div className="apg_product-image">
                  <Image barcode={barcode} />
                </div>
              </div>
            );
          }

          // מצב copyAPG -> למוצרים שאינם A ויש להם APG
          if (mode === "copyAPG" && barcode !== activeA && hasAPG(barcode)) {
            return (
              <div key={barcode} className="apg_product-card">
                <div className="apg_product-data">
                  <h3 className="apg_product-name">{product.name}</h3>
                  <div className="apg_product-info">
                    <p>{product.weight}</p>
                    <p>{convertWeightUnit(product.unitWeight)}</p>
                    <p className="apg_separator">|</p>
                    <p>{product.brand}</p>
                  </div>
                  <div style={{ marginTop: "0.5rem" }}>
                    <button
                      style={{
                        backgroundColor: "#f0ad4e",
                        color: "#fff",
                        marginRight: "0.5rem",
                      }}
                      onClick={() => handleCopyEntireAPG(barcode)}
                    >
                      העתקת APG ממוצר זה
                    </button>
                    <button
                      style={{ backgroundColor: "#5bc0de", color: "#fff" }}
                      onClick={() => handleOpenCopyGroupModal(barcode)}
                    >
                      העתקת קבוצה
                    </button>
                  </div>
                </div>
                <div className="apg_product-image">
                  <Image barcode={barcode} />
                </div>
              </div>
            );
          }

          // מצב copyAPG -> אין APG
          if (mode === "copyAPG" && !hasAPG(barcode)) {
            return (
              <div key={barcode} className="apg_product-card">
                <div className="apg_product-data">
                  <h3 className="apg_product-name">{product.name}</h3>
                  <div className="apg_product-info">
                    <p>{product.weight}</p>
                    <p>{convertWeightUnit(product.unitWeight)}</p>
                    <p className="apg_separator">|</p>
                    <p>{product.brand}</p>
                  </div>
                  <p style={{ marginTop: "0.5rem", color: "#f00" }}>
                    אין APG למוצר זה
                  </p>
                </div>
                <div className="apg_product-image">
                  <Image barcode={barcode} />
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* כפתור "שמירת שינויים" כאשר mode = editGroup או copyAPG */}
      {(mode === "editGroup" || mode === "copyAPG") && activeA && (
        <button
          style={{
            marginTop: "1rem",
            backgroundColor: "#4caf50",
            color: "#fff",
            border: "none",
            padding: "0.6rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
          onClick={handleSaveChanges}
        >
          שמירת שינויים
        </button>
      )}

      {/* מודאל: יצירת/בחירת קבוצה */}
      {showAPGGroupsModal && (
        <ModalAPGGroups
          isOpen={showAPGGroupsModal}
          onClose={() => setShowAPGGroupsModal(false)}
          groups={getGroupsForBarcode(apgData, activeA)}
          onGroupSelected={handleGroupSelected}
          onCreateNewGroup={(groupName) => {
            const newData = addNewGroup(apgData, activeA, groupName);
            setApgData(newData);
            handleGroupSelected(groupName);
          }}
        />
      )}

      {/* מודאל: הצגת קבוצות + מחיקה */}
      {showShowGroupsModal && (
        <ModalShowGroups
          isOpen={showShowGroupsModal}
          apgData={apgData}
          setApgData={setApgData}
          barcodeA={activeA}
          // כשהמשתמש סוגר המודאל ללא אישור
          onCloseNoSave={() => {
            setShowShowGroupsModal(false);
            setMode("initial"); // חוזרים למצב התחלתי
          }}
          // כשהמשתמש אישר שמירת שינויים מקומי
          onApplyChanges={() => {
            setShowShowGroupsModal(false);
            setMode("editGroup"); // מציג כפתור שמירת שינויים
          }}
        />
      )}

      {/* מודאל: העתקת קבוצה ממוצר B */}
      {showCopyGroupsModal && (
        <ModalCopyGroups
          isOpen={showCopyGroupsModal}
          onClose={() => setShowCopyGroupsModal(false)}
          barcodeB={copySourceBarcodeB}
          apgData={apgData}
          onConfirmCopySingleGroup={handleConfirmCopySingleGroup}
        />
      )}
    </div>
  );
}

export default ProductListManagerAlternativeProductsGroups;
