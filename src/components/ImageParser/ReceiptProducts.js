import React, { useState } from "react";
import "./ReceiptProducts.css";
import SupermarketImage from "../Images/SupermarketImage";
import ProductImageDisplay from "../Images/ProductImageService";
import { IconClose } from "../Icons/UiIcons";

const SUPERMARKET_NAMES = [
  "BE",
  "Carrefour city (קרפור סיטי)",
  "yellow",
  "אושר עד",
  "ברכל",
  "ויקטורי",
  "זול ובגדול",
  "יוחננוף",
  "יש בשכונה",
  "יש חסד",
  "מגה בעיר",
  "מחסני השוק בשבילך",
  "מחסני השוק מהדרין",
  "מיני סופר אלונית",
  "מעיין 2000",
  "סופר פארם",
  "קינג סטור",
  "רמי לוי",
  "שופרסל אקספרס",
  "שופרסל דיל",
  "שופרסל שלי",
  "שוק העיר",
  "שוק מהדרין",
  "שירה מרקט",
  "שערי רווחה",
  "שפע ברכת השם קרוב לבית",
  "good מרקט",
];

const formatPrice = (price) => {
  const num = Number(price || 0);
  const prefix = num < 0 ? "-" : "";
  return "\u2066" + prefix + "₪" + Math.abs(num).toFixed(2) + "\u2069";
};

function ReceiptProducts({
  supermarket,
  setSupermarket,
  date,
  setDate,
  products,
  setProducts,
  totalPrice,
  setTotalPrice,
  consistency,
  onConfirm,
  onCancel,
  error,
}) {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleProductChange = (index, field, value) => {
    const updated = [...products];
    updated[index] = { ...updated[index], [field]: value };
    setProducts(updated);
  };

  const removeProduct = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        barcode: "",
        name: "",
        amount: 1,
        price: 0,
        totalPrice: 0,
        brand: "",
        generalName: "",
        weight: 0,
        unit: "u",
        category: "Other",
        subcategory: "Other",
        foundInDB: false,
      },
    ]);
    setExpandedIndex(products.length);
  };

  const recalculateTotal = () => {
    const sum = products.reduce((acc, p) => acc + (Number(p.totalPrice) || 0), 0);
    setTotalPrice(Math.round(sum * 100) / 100);
  };

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const formatDateForInput = (dateStr) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };

  const validateAndConfirm = () => {
    const errors = [];
    if (!supermarket.name) errors.push("שם סופרמרקט חסר");
    if (!supermarket.address) errors.push("כתובת חסרה");
    if (!supermarket.city) errors.push("עיר חסרה");
    if (!date) errors.push("תאריך חסר");
    if (products.length === 0) errors.push("אין מוצרים");
    products.forEach((p, i) => {
      if (!p.name) errors.push(`מוצר ${i + 1}: שם חסר`);
    });

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    onConfirm();
  };

  return (
    <div className="receipt-edit-container">
      {/* ── Header: Supermarket Info ── */}
      <div className="receipt-edit-header">
        <div className="receipt-edit-logo">
          <SupermarketImage supermarketName={supermarket.name} />
        </div>

        <div className="receipt-edit-field">
          <label className="receipt-edit-label">שם סופרמרקט</label>
          <select
            value={SUPERMARKET_NAMES.includes(supermarket.name) ? supermarket.name : "__custom__"}
            onChange={(e) => {
              if (e.target.value === "__custom__") return;
              setSupermarket({ ...supermarket, name: e.target.value });
            }}
            className="receipt-edit-select"
          >
            <option value="">בחר סופרמרקט</option>
            {SUPERMARKET_NAMES.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
            {!SUPERMARKET_NAMES.includes(supermarket.name) && supermarket.name && (
              <option value="__custom__">{supermarket.name} (מהקבלה)</option>
            )}
          </select>
          {!SUPERMARKET_NAMES.includes(supermarket.name) && (
            <input
              type="text"
              value={supermarket.name}
              onChange={(e) =>
                setSupermarket({ ...supermarket, name: e.target.value })
              }
              placeholder="או הקלד שם ידני"
              className="receipt-edit-input receipt-edit-input--small"
            />
          )}
        </div>

        <div className="receipt-edit-row">
          <div className="receipt-edit-field receipt-edit-field--half">
            <label className="receipt-edit-label">כתובת</label>
            <input
              type="text"
              value={supermarket.address}
              onChange={(e) =>
                setSupermarket({ ...supermarket, address: e.target.value })
              }
              placeholder="כתובת"
              className="receipt-edit-input"
            />
          </div>
          <div className="receipt-edit-field receipt-edit-field--half">
            <label className="receipt-edit-label">עיר</label>
            <input
              type="text"
              value={supermarket.city}
              onChange={(e) =>
                setSupermarket({ ...supermarket, city: e.target.value })
              }
              placeholder="עיר"
              className="receipt-edit-input"
            />
          </div>
        </div>

        <div className="receipt-edit-row">
          <div className="receipt-edit-field receipt-edit-field--half">
            <label className="receipt-edit-label">תאריך</label>
            <input
              type="datetime-local"
              value={formatDateForInput(date)}
              onChange={(e) =>
                setDate(new Date(e.target.value).toISOString())
              }
              className="receipt-edit-input"
            />
          </div>
          <div className="receipt-edit-field receipt-edit-field--half">
            <label className="receipt-edit-label">סה"כ קבלה</label>
            <div className="receipt-edit-total-display" dir="ltr">
              {formatPrice(totalPrice)}
            </div>
          </div>
        </div>
      </div>

      {/* ── Consistency warnings: the extracted lines don't add up to the
             receipt's own summary — the user should review before saving ── */}
      {consistency && !consistency.ok && (
        <div className="receipt-consistency-warning">
          <b>⚠ הנתונים שחולצו לא מסתדרים עם סיכום הקבלה — בדוק לפני שמירה:</b>
          {consistency.notes.map((note, i) => (
            <div key={i}>• {note}</div>
          ))}
        </div>
      )}

      {/* ── Dashed separator ── */}
      <div className="receipt-edit-separator">
        ═══════ {products.length} פריטים ═══════
      </div>

      {/* ── Products List ── */}
      <div className="receipt-edit-products">
        {products.map((product, index) => (
          <div
            key={index}
            className={`receipt-product-card ${
              product.foundInDB
                ? "receipt-product-card--in-db"
                : "receipt-product-card--not-in-db"
            } ${expandedIndex === index ? "receipt-product-card--expanded" : ""}`}
            onClick={() => toggleExpand(index)}
          >
            {/* Collapsed view */}
            <div className="receipt-product-summary">
              <div className="receipt-product-summary-right">
                <div className="receipt-product-name">
                  {product.name || "מוצר ללא שם"}
                  {product.hasDiscount && (
                    <span className="receipt-product-promo-badge">מבצע</span>
                  )}
                </div>
                <div className="receipt-product-meta">
                  <span dir="ltr">{product.amount} × {formatPrice(product.price)}</span>
                  {product.foundInDB && (
                    <span className="receipt-product-db-badge">✓ נמצא</span>
                  )}
                  {!product.foundInDB && (
                    <span className="receipt-product-no-db-badge">? לא נמצא</span>
                  )}
                </div>
                {product.hasDiscount && product.discountDescription && (
                  <div className="receipt-product-discount-info">
                    {product.discountDescription}
                    {product.originalPrice > product.totalPrice && (
                      <span className="receipt-product-saving">
                        {" "}חסכת <span dir="ltr">{formatPrice(product.originalPrice - product.totalPrice)}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="receipt-product-summary-left">
                {product.hasDiscount && product.originalPrice > product.totalPrice && (
                  <div className="receipt-product-original-price" dir="ltr">
                    {formatPrice(product.originalPrice)}
                  </div>
                )}
                <div className="receipt-product-total" dir="ltr">
                  {formatPrice(product.totalPrice)}
                </div>
              </div>
              {product.foundInDB && product.barcode && (
                <div className="receipt-product-image">
                  <ProductImageDisplay
                    barcode={product.barcode}
                    className="receipt-product-img"
                  />
                </div>
              )}
              <button
                className="receipt-product-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  removeProduct(index);
                }}
              >
                <IconClose />
              </button>
            </div>

            {/* Expanded edit form */}
            {expandedIndex === index && (
              <div
                className="receipt-product-edit"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="receipt-product-edit-row">
                  <div className="receipt-product-edit-field">
                    <label>שם מוצר</label>
                    <input
                      type="text"
                      value={product.name}
                      onChange={(e) =>
                        handleProductChange(index, "name", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="receipt-product-edit-row">
                  <div className="receipt-product-edit-field">
                    <label>ברקוד</label>
                    <input
                      type="text"
                      value={product.barcode}
                      onChange={(e) =>
                        handleProductChange(index, "barcode", e.target.value)
                      }
                    />
                  </div>
                  <div className="receipt-product-edit-field">
                    <label>מותג</label>
                    <input
                      type="text"
                      value={product.brand}
                      onChange={(e) =>
                        handleProductChange(index, "brand", e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="receipt-product-edit-row">
                  <div className="receipt-product-edit-field">
                    <label>כמות</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={product.amount}
                      onChange={(e) =>
                        handleProductChange(index, "amount", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="receipt-product-edit-field">
                    <label>מחיר ליחידה</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={(e) =>
                        handleProductChange(index, "price", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="receipt-product-edit-field">
                    <label>סה"כ</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.totalPrice}
                      onChange={(e) =>
                        handleProductChange(index, "totalPrice", Number(e.target.value))
                      }
                    />
                  </div>
                </div>
                <div className="receipt-product-edit-row">
                  <div className="receipt-product-edit-field">
                    <label>משקל</label>
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={product.weight}
                      onChange={(e) =>
                        handleProductChange(index, "weight", Number(e.target.value))
                      }
                    />
                  </div>
                  <div className="receipt-product-edit-field">
                    <label>יחידה</label>
                    <select
                      value={product.unit}
                      onChange={(e) =>
                        handleProductChange(index, "unit", e.target.value)
                      }
                    >
                      <option value="u">יחידה</option>
                      <option value="g">גרם</option>
                      <option value="kg">ק"ג</option>
                      <option value="ml">מ"ל</option>
                      <option value="l">ליטר</option>
                    </select>
                  </div>
                  <div className="receipt-product-edit-field">
                    <label>קטגוריה</label>
                    <input
                      type="text"
                      value={product.category}
                      onChange={(e) =>
                        handleProductChange(index, "category", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Add product button */}
        <button className="receipt-add-product-btn" onClick={addProduct}>
          + הוסף מוצר
        </button>
      </div>

      {/* ── Total & Recalculate ── */}
      <div className="receipt-edit-total-section">
        <button className="receipt-recalculate-btn" onClick={recalculateTotal}>
          חשב מחדש סה"כ
        </button>
        <div className="receipt-edit-total-row">
          <span className="receipt-edit-total-label">סכום לתשלום:</span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={Number(totalPrice).toFixed(2)}
            onChange={(e) => setTotalPrice(Number(e.target.value))}
            className="receipt-edit-total-input"
          />
        </div>
      </div>

      {/* ── Validation Errors ── */}
      {validationErrors.length > 0 && (
        <div className="receipt-validation-errors">
          {validationErrors.map((err, i) => (
            <div key={i}>{err}</div>
          ))}
        </div>
      )}

      {/* ── Error from parent ── */}
      {error && <div className="receipt-validation-errors">{error}</div>}

      {/* ── Action Buttons ── */}
      <div className="receipt-edit-actions">
        <button className="receipt-confirm-btn" onClick={validateAndConfirm}>
          אשר ושמור להיסטוריה
        </button>
        <button className="receipt-cancel-btn" onClick={onCancel}>
          ביטול
        </button>
      </div>
    </div>
  );
}

export default ReceiptProducts;
