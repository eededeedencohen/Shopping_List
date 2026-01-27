// src/components/ProductList/AlternativeProductsModal.js

import React, { useState, useEffect } from "react";
import Modal from "../Cart/Modal";
import { getAlternativeProductsDetails } from "../../network/alternative-productsService";
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
// ^ אם Images.js נמצא באותה תיקייה.
// אם הוא במקום אחר, למשל "../Images", שנה בהתאם.

/**
 * קומפוננטת מודאל המציגה מידע על מוצרים חלופיים
 * @param {boolean} isOpen - האם המודאל פתוח
 * @param {function} onClose - פונקציית סגירת המודאל
 * @param {string[]} barcodes - מערך ברקודים של המוצרים החלופיים
 */
const AlternativeProductsModal = ({ isOpen, onClose, barcodes }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        // אם אין ברקודים => ננקה את המערך
        if (!barcodes || barcodes.length === 0) {
          setProducts([]);
          return;
        }

        // שליחה ל-API (ב-POST) כדי לקבל את המוצרים
        const response = await getAlternativeProductsDetails(barcodes);

        // לפי המבנה שאתה מקבל:
        // {
        //   "status": "success",
        //   "results": 3,
        //   "data": {
        //     "products": [...]
        //   }
        // }
        // שים לב: המוצרים נמצאים ב- response.data.products
        setProducts(response.data.products || []);
      } catch (error) {
        console.error("Error fetching alternative products details:", error);
        setProducts([]);
      }
    };

    // נקרא לפונקציה רק אם המודאל פתוח
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen, barcodes]);

  // אם המודאל לא פתוח, לא מציגים כלום (ליתר ביטחון)
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>מוצרים חלופיים</h2>

      {products.length === 0 ? (
        <p>אין מוצרים חלופיים להציג.</p>
      ) : (
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {products.map((prod) => (
            <div
              key={prod._id}
              style={{
                border: "1px solid #ccc",
                margin: "0.5rem 0",
                padding: "0.5rem",
              }}
            >
              {/* תמונת המוצר - בהתבסס על הברקוד */}
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  position: "relative",
                  marginBottom: "0.5rem",
                }}
              >
                <Image barcode={prod.barcode} />
              </div>

              {/* שדות נוספים לפי הנתונים שלך */}
              <h3>{prod.name}</h3>
              <p>ברקוד: {prod.barcode}</p>
              <p>מותג: {prod.brand}</p>
              <p>
                משקל: {prod.weight} {prod.unitWeight}
              </p>
              <p>
                קטגוריה: {prod.category} / {prod.subcategory}
              </p>
              {/* אם יש מחיר, אפשר להוסיף כאן */}
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};

export default AlternativeProductsModal;
