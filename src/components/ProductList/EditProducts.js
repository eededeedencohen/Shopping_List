import React, { useState, useRef } from "react";
import {
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
    loadProducts,
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProducts();

  const UNCLASSIFIED_CATEGORY = "מוצרים ללא סיווג";
  const baseCategories = allCategories.filter(
    (cat) => cat !== UNCLASSIFIED_CATEGORY,
  );

  // מצב ראשי
  const [mode, setMode] = useState("initial");
  // 'initial' | 'addProduct' | 'bulkEdit' | 'editSingle' | 'globalEdit'

  // מוצר נבחר לעריכה יחידנית
  const [selectedProduct, setSelectedProduct] = useState(null);

  // מוצרים נבחרים (לעריכה מרובה)
  const [selectedBarcodes, setSelectedBarcodes] = useState([]);

  // פתיחת מודאל עריכה מרובה
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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
    } else if (swipeDirection.current === "left") {
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
    } else {
      setContainerStyle({});
    }
  };

  // ============ סינון מוצרים ============
  const currentCategory = allCategories[activeCategoryIndex];
  const subCats = all_sub_categories[activeCategoryIndex] || [];
  const currentSubCategory = subCats[activeSubCategoryIndex];

  const isUnclassifiedCategory = currentCategory === UNCLASSIFIED_CATEGORY;
  const isInBaseCategory = (category) => baseCategories.includes(category);

  const filteredProducts = products.filter((prod) => {
    if (isUnclassifiedCategory) {
      return !isInBaseCategory(prod.category);
    }
    if (prod.category !== currentCategory) return false;
    if (currentSubCategory) {
      return prod.subcategory === currentSubCategory;
    }
    return true;
  });

  const categoryProducts = products.filter((prod) => {
    if (isUnclassifiedCategory) {
      return !isInBaseCategory(prod.category);
    }
    return prod.category === currentCategory;
  });

  const subCategoryStats = subCats.map((sub) => {
    const count = categoryProducts.filter(
      (prod) => prod.subcategory === sub,
    ).length;
    return { sub, count };
  });

  const uncategorizedCount = categoryProducts.filter(
    (prod) => !prod.subcategory,
  ).length;

  const getBarcodes = (list) => list.map((p) => p.barcode).filter(Boolean);

  const selectBarcodes = (barcodes) => {
    setSelectedBarcodes(Array.from(new Set(barcodes)));
  };

  // ============ כפתורים למעלה ============
  const handleAddProduct = () => {
    setMode("addProduct");
  };
  const handleBulkEdit = () => {
    setMode("bulkEdit");
    setSelectedBarcodes([]);
    setIsBulkModalOpen(false);
  };
  const handleGlobalEdit = () => {
    setMode("globalEdit");
  };

  // ============ סגירת כל המצבים/מודאלים ============
  const handleCloseAll = () => {
    setMode("initial");
    setSelectedProduct(null);
    setSelectedBarcodes([]);
    setIsBulkModalOpen(false);
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
      await loadProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleOpenBulkModal = () => {
    if (!selectedBarcodes.length) return;
    setIsBulkModalOpen(true);
  };

  const handleSelectAllFiltered = () => {
    selectBarcodes(getBarcodes(filteredProducts));
  };

  const handleSelectAllCategory = () => {
    selectBarcodes(getBarcodes(categoryProducts));
  };

  const handleSelectSubCategory = (sub) => {
    const productsInSub = categoryProducts.filter(
      (prod) => prod.subcategory === sub,
    );
    selectBarcodes(getBarcodes(productsInSub));
  };

  // ============ Render ============
  return (
    <div className="mp_products-wrapper">
      {/* ניווט קטגוריות */}
      <CategoryNavigation
        allCategories={allCategories}
        activeCategoryIndex={activeCategoryIndex}
        setActiveCategoryIndex={setActiveCategoryIndex}
        setActiveSubCategoryIndex={setActiveSubCategoryIndex}
      />
      <SubCategoryNavigation
        all_sub_categories={all_sub_categories}
        activeCategoryIndex={activeCategoryIndex}
        activeSubCategoryIndex={activeSubCategoryIndex}
        setActiveSubCategoryIndex={setActiveSubCategoryIndex}
      />

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

      {mode === "bulkEdit" && (
        <div className="mp_bulk-toolbar">
          <div className="mp_bulk-actions">
            <button className="mp_btn" onClick={handleSelectAllFiltered}>
              בחר את כל המוצגים
            </button>
            <button className="mp_btn" onClick={handleSelectAllCategory}>
              בחר את כל הקטגוריה
            </button>
            <button className="mp_btn" onClick={() => setSelectedBarcodes([])}>
              נקה בחירה
            </button>
            <button
              className="mp_btn mp_btn-primary"
              onClick={handleOpenBulkModal}
              disabled={!selectedBarcodes.length}
            >
              עריכה למוצרים שנבחרו ({selectedBarcodes.length})
            </button>
            <button className="mp_btn" onClick={handleCloseAll}>
              סיום עריכה מרובה
            </button>
          </div>
        </div>
      )}

      <div className="mp_category-summary">
        <div className="mp_summary-header">
          <div className="mp_summary-title">
            תתי קטגוריות בקטגוריה: {currentCategory || "לא נבחר"}
          </div>
          <div className="mp_summary-count">
            סה"כ מוצרים: {categoryProducts.length}
          </div>
        </div>
        <div className="mp_summary-list">
          {subCategoryStats.map(({ sub, count }) => (
            <div key={sub} className="mp_summary-item">
              <span>
                {sub} ({count})
              </span>
              {mode === "bulkEdit" && count > 0 && (
                <button
                  className="mp_small-btn"
                  onClick={() => handleSelectSubCategory(sub)}
                >
                  בחר
                </button>
              )}
            </div>
          ))}
          {uncategorizedCount > 0 && (
            <div className="mp_summary-item">
              <span>ללא תת־קטגוריה ({uncategorizedCount})</span>
            </div>
          )}
        </div>
      </div>

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
                <div
                  style={{
                    marginTop: "0.5rem",
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    style={{
                      backgroundColor: "#008cba",
                      color: "#fff",
                      border: "none",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                    }}
                    onClick={() => handleEditSingle(prod)}
                  >
                    ערוך
                  </button>
                  <button
                    style={{
                      backgroundColor: "#f44336",
                      color: "#fff",
                      border: "none",
                      padding: "0.3rem 0.6rem",
                      borderRadius: "4px",
                    }}
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
                        setSelectedBarcodes([
                          ...new Set([...selectedBarcodes, prod.barcode]),
                        ]);
                      } else {
                        setSelectedBarcodes(
                          selectedBarcodes.filter((bc) => bc !== prod.barcode),
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
        allCategories={allCategories}
        allSubCategories={all_sub_categories}
        defaultCategory={isUnclassifiedCategory ? "" : currentCategory}
        defaultSubcategory={isUnclassifiedCategory ? "" : currentSubCategory}
        onProductCreated={async (newProd) => {
          try {
            await createProduct(newProd);
            await loadProducts();
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
        allCategories={allCategories}
        allSubCategories={all_sub_categories}
        onSave={async (updates) => {
          try {
            if (!selectedProduct) return;
            await updateProductById(selectedProduct._id, updates);
            await loadProducts();
            handleCloseAll();
          } catch (err) {
            console.error("Error updating product:", err);
          }
        }}
      />

      <ModalBulkEdit
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        selectedBarcodes={selectedBarcodes}
        allCategories={allCategories}
        allSubCategories={all_sub_categories}
        onApply={async (commonUpdates) => {
          if (!selectedBarcodes || !selectedBarcodes.length) {
            setIsBulkModalOpen(false);
            return;
          }

          try {
            const payload = selectedBarcodes.map((barcode) => ({
              barcode,
              ...commonUpdates,
            }));
            await updateProductsByBarcode(payload);
            await loadProducts();
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
