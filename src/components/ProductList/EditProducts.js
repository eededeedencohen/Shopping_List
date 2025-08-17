import React, {useState, useRef } from "react";
import {
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

          try {
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
