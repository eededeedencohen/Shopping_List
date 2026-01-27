import React, { useState } from "react";
import Modal from "../Cart/Modal";
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import "./ModalProductsMobile.css";
import { getAlternativeProductsGroupsDetails } from "../../network/alternativeProductsGroupsService";

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

function ModalShowGroups({
  isOpen,
  onCloseNoSave, // <--- שינוי: פונקציה לסגירה ללא שמירה
  onApplyChanges, // <--- שינוי: פונקציה להפעלת מצב editGroup בקומפוננטה האב
  apgData,
  setApgData,
  barcodeA,
}) {
  const [selectedGroupToShow, setSelectedGroupToShow] = useState(null);
  const [productsInGroup, setProductsInGroup] = useState([]);

  const [localData, setLocalData] = useState(
    JSON.parse(JSON.stringify(apgData)),
  );
  const [isDirty, setIsDirty] = useState(false);

  if (!isOpen) return null;

  const apgA = localData.find((item) => item.barcode === barcodeA);
  const groupsA = apgA ? apgA.groups : [];

  const handleShowProductsInGroup = async (groupName) => {
    setSelectedGroupToShow(groupName);
    const groupObj = apgA?.groups.find((g) => g.groupName === groupName);
    if (!groupObj) {
      setProductsInGroup([]);
      return;
    }
    const barcodes = groupObj.barcodes || [];
    if (barcodes.length === 0) {
      setProductsInGroup([]);
      return;
    }

    try {
      const res = await getAlternativeProductsGroupsDetails(barcodes);
      const detailedProducts = res.data.products || [];
      setProductsInGroup(detailedProducts);
    } catch (err) {
      console.error("Error fetching product details:", err);
      setProductsInGroup([]);
    }
  };

  const handleDeleteGroup = (groupName) => {
    if (!apgA) return;
    apgA.groups = apgA.groups.filter((g) => g.groupName !== groupName);
    setLocalData([...localData]);
    setIsDirty(true);
  };

  const handleDeleteProductInGroup = (groupName, barcodeToDelete) => {
    if (!apgA) return;
    const groupObj = apgA.groups.find((g) => g.groupName === groupName);
    if (!groupObj) return;

    groupObj.barcodes = groupObj.barcodes.filter((b) => b !== barcodeToDelete);
    setLocalData([...localData]);
    setIsDirty(true);

    setProductsInGroup((prev) =>
      prev.filter((p) => p.barcode !== barcodeToDelete),
    );
  };

  // המשתמש לוחץ "אישור (שמירת שינויים מקומי)"
  const handleApplyChangesLocal = () => {
    // 1. מעדכנים apgData בהורה
    setApgData(localData);

    // 2. אפס דגל
    setIsDirty(false);

    // 3. קוראים לפונקציית ההורה שתפעיל mode="editGroup"
    if (onApplyChanges) {
      onApplyChanges();
    }
  };

  if (selectedGroupToShow) {
    // מציגים מוצרים בקבוצה
    return (
      <Modal isOpen={isOpen} onClose={onCloseNoSave /* סגירה ללא שמירה */}>
        <h3 style={{ textAlign: "center" }}>
          מוצרים בקבוצה {selectedGroupToShow}
        </h3>
        <div className="modal-products-container" style={{ direction: "rtl" }}>
          {productsInGroup.length === 0 && <p>אין מוצרים בקבוצה.</p>}
          {productsInGroup.map((product, idx) => (
            <div key={product.barcode}>
              <div className="modal-product" style={{ cursor: "default" }}>
                <div className="modal-product-image">
                  <Image barcode={product.barcode} />
                </div>
                <div
                  className="modal-product-details"
                  style={{ textAlign: "right" }}
                >
                  <p className="modal-product-details__name">
                    {product.name || product.barcode}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#666" }}>
                    ברקוד: {product.barcode}
                  </p>
                  <p style={{ marginTop: "0.3rem" }}>
                    {product.brand || "מותג?"} | {product.weight || "?"}{" "}
                    {convertWeightUnit(product.unitWeight)}
                  </p>
                  <button
                    className="danger-button"
                    onClick={() =>
                      handleDeleteProductInGroup(
                        selectedGroupToShow,
                        product.barcode,
                      )
                    }
                    style={{ marginTop: "0.5rem" }}
                  >
                    מחק מהמוצרים
                  </button>
                </div>
              </div>
              {idx < productsInGroup.length - 1 && (
                <div className="modal-product-separator"></div>
              )}
            </div>
          ))}
        </div>

        {/* כפתורי סגירה/שמירה */}
        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => setSelectedGroupToShow(null)}>חזרה</button>
          {isDirty && (
            <button
              onClick={handleApplyChangesLocal}
              style={{
                backgroundColor: "green",
                color: "#fff",
                marginLeft: "1rem",
              }}
            >
              אישור (שמירת שינויים מקומי)
            </button>
          )}
        </div>
      </Modal>
    );
  }

  // אם לא בחרנו קבוצה => מציגים את רשימת הקבוצות
  return (
    <Modal isOpen={isOpen} onClose={onCloseNoSave /* סגירה ללא שמירה */}>
      <h2 style={{ textAlign: "center" }}>קבוצות למוצר {barcodeA}</h2>
      <div className="modal-products-container" style={{ direction: "rtl" }}>
        {groupsA.length === 0 && <p>אין קבוצות.</p>}
        {groupsA.map((g, idx) => (
          <div key={g.groupName}>
            <div className="modal-product">
              <div
                className="modal-product-details"
                style={{ textAlign: "right", alignItems: "flex-end" }}
              >
                <p className="modal-product-details__name">{g.groupName}</p>
                <div style={{ marginTop: "0.3rem" }}>
                  <button
                    className="nice-button"
                    onClick={() => handleShowProductsInGroup(g.groupName)}
                  >
                    הצג מוצרים
                  </button>
                  <button
                    className="danger-button"
                    onClick={() => {
                      handleDeleteGroup(g.groupName);
                    }}
                  >
                    מחיקת קבוצה
                  </button>
                </div>
              </div>
            </div>
            {idx < groupsA.length - 1 && (
              <div className="modal-product-separator" />
            )}
          </div>
        ))}
      </div>

      {/* כפתורי סגירה/שמירת שינויים */}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={onCloseNoSave}>סגור</button>
        {isDirty && (
          <button
            onClick={handleApplyChangesLocal}
            style={{
              backgroundColor: "green",
              color: "#fff",
              marginLeft: "1rem",
            }}
          >
            אישור (שמירת שינויים מקומי)
          </button>
        )}
      </div>
    </Modal>
  );
}

export default ModalShowGroups;
