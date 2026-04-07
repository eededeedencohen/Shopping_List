import React, { useState, useMemo, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProductList } from "../../hooks/appHooks";
import { createProduct } from "../../services/productService";
import { DOMAIN } from "../../constants";
import ImageCropModal from "./ImageCropModal";
import "./AddProduct.css";

const UNIT_OPTIONS = [
  { value: "g", label: 'גרם' },
  { value: "kg", label: 'ק"ג' },
  { value: "ml", label: 'מ"ל' },
  { value: "l", label: "ליטר" },
  { value: "u", label: "יחידות" },
  { value: "t", label: "טון" },
];

function AddProduct() {
  const navigate = useNavigate();
  const { products, allCategories, all_sub_categories } = useProductList();

  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState("");
  const [unitWeight, setUnitWeight] = useState("g");
  const [generalName, setGeneralName] = useState("");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [subCategoryIndex, setSubCategoryIndex] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Build barcode set for O(1) lookup
  const barcodeSet = useMemo(() => {
    const set = new Set();
    if (products) products.forEach((p) => set.add(p.barcode));
    return set;
  }, [products]);

  // Barcode validation
  const barcodeExists = barcode.length > 0 && barcodeSet.has(barcode);
  const barcodeValid = barcode.length >= 2 && !barcodeExists;

  // Subcategories for selected category
  const subCategories = all_sub_categories[categoryIndex] || [];

  // Handle image from any source
  const handleImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  // Drag & drop
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageFile(file);
  };

  // Paste (Ctrl+V / screenshot)
  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        handleImageFile(file);
        break;
      }
    }
  }, [handleImageFile]);

  // Long press to paste from clipboard
  const longPressTimer = useRef(null);
  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(async () => {
      try {
        const clipboardItems = await navigator.clipboard.read();
        for (const item of clipboardItems) {
          const imageType = item.types.find((t) => t.startsWith("image/"));
          if (imageType) {
            const blob = await item.getType(imageType);
            const file = new File([blob], "pasted-image.png", { type: imageType });
            handleImageFile(file);
            break;
          }
        }
      } catch (err) {
        console.log("Clipboard paste not available:", err.message);
      }
    }, 600);
  };
  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  // Image crop
  const [showCrop, setShowCrop] = useState(false);

  const handleCropDone = (croppedFile, croppedPreview) => {
    setImageFile(croppedFile);
    setImagePreview(croppedPreview);
    setShowCrop(false);
  };

  // Remove image
  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Form validation
  const isFormValid =
    barcodeValid &&
    name.trim().length >= 2 &&
    generalName.trim().length >= 1 &&
    imageFile;

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // 1. Create product
      const productData = {
        barcode: barcode.trim(),
        name: name.trim(),
        brand: brand.trim(),
        weight: Number(weight) || 0,
        unitWeight,
        generalName: generalName.trim(),
        category: allCategories[categoryIndex],
        subcategory: subCategories[subCategoryIndex] || "",
      };

      await createProduct(productData);

      // 2. Upload image
      const formData = new FormData();
      formData.append("barcode", barcode.trim());
      formData.append("image", imageFile);

      await fetch(`${DOMAIN}/api/v1/product-images`, {
        method: "POST",
        body: formData,
      });

      setSuccessMsg(`"${name}" (${barcode}) נוסף בהצלחה!`);

      // Reset form
      setBarcode("");
      setName("");
      setBrand("");
      setWeight("");
      setUnitWeight("g");
      setGeneralName("");
      setCategoryIndex(0);
      setSubCategoryIndex(0);
      removeImage();
    } catch (err) {
      setErrorMsg(err.message || "אירעה שגיאה");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="add-product-page" onPaste={handlePaste}>
      <div className="add-product-header">
        <button className="add-product-back" onClick={() => navigate("/products-server")}>
          &larr;
        </button>
        <h1>הוספת מוצר חדש</h1>
      </div>

      <form className="add-product-form" onSubmit={handleSubmit}>
        {/* Barcode */}
        <div className="form-group">
          <label>ברקוד</label>
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="הזן ברקוד..."
            className={
              barcode.length === 0
                ? ""
                : barcodeExists
                ? "input-error"
                : "input-success"
            }
          />
          {barcodeExists && (
            <span className="validation-msg error">ברקוד כבר קיים במערכת!</span>
          )}
          {barcode.length >= 2 && !barcodeExists && (
            <span className="validation-msg success">ברקוד פנוי</span>
          )}
        </div>

        {/* Name */}
        <div className="form-group">
          <label>שם המוצר</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="לדוגמה: דוריטוס חריף אש 70 גרם"
          />
        </div>

        {/* Brand */}
        <div className="form-group">
          <label>מותג</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="לדוגמה: דוריטוס"
          />
        </div>

        {/* General Name */}
        <div className="form-group">
          <label>שם כללי</label>
          <input
            type="text"
            value={generalName}
            onChange={(e) => setGeneralName(e.target.value)}
            placeholder="לדוגמה: חטיפים"
          />
        </div>

        {/* Weight + Unit */}
        <div className="form-row">
          <div className="form-group flex-2">
            <label>משקל</label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="0"
              min="0"
            />
          </div>
          <div className="form-group flex-1">
            <label>יחידה</label>
            <select value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)}>
              {UNIT_OPTIONS.map((u) => (
                <option key={u.value} value={u.value}>{u.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category */}
        <div className="form-group">
          <label>קטגוריה</label>
          <select
            value={categoryIndex}
            onChange={(e) => {
              setCategoryIndex(Number(e.target.value));
              setSubCategoryIndex(0);
            }}
          >
            {allCategories.map((cat, i) => (
              <option key={cat} value={i}>{cat}</option>
            ))}
          </select>
        </div>

        {/* Subcategory */}
        <div className="form-group">
          <label>תת-קטגוריה</label>
          <select
            value={subCategoryIndex}
            onChange={(e) => setSubCategoryIndex(Number(e.target.value))}
          >
            {subCategories.length === 0 ? (
              <option value={0}>אין תת-קטגוריות</option>
            ) : (
              subCategories.map((sub, i) => (
                <option key={sub} value={i}>{sub}</option>
              ))
            )}
          </select>
        </div>

        {/* Image Upload */}
        <div className="form-group">
          <label>תמונת מוצר</label>
          <div
            className={`image-dropzone ${isDragging ? "dragging" : ""} ${imagePreview ? "has-image" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            onTouchStart={handleLongPressStart}
            onTouchEnd={handleLongPressEnd}
            onTouchCancel={handleLongPressEnd}
            onContextMenu={(e) => e.preventDefault()}
          >
            {imagePreview ? (
              <div className="image-preview-wrap">
                <img src={imagePreview} alt="תצוגה מקדימה" className="image-preview" />
                <div className="image-actions">
                  <button type="button" className="image-edit" onClick={(e) => { e.stopPropagation(); setShowCrop(true); }}>
                    חתוך
                  </button>
                  <button type="button" className="image-remove" onClick={(e) => { e.stopPropagation(); removeImage(); }}>
                    &times;
                  </button>
                </div>
              </div>
            ) : (
              <div className="dropzone-content">
                <span className="dropzone-icon">+</span>
                <p>גרור תמונה לכאן, הדבק (Ctrl+V),</p>
                <p>לחיצה ארוכה להדבקה מהזיכרון</p>
                <p>או לחץ לבחירה</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => handleImageFile(e.target.files[0])}
          />

          <div className="image-buttons">
            <button type="button" className="img-btn" onClick={() => fileInputRef.current?.click()}>
              בחר מקבצים
            </button>
            <button type="button" className="img-btn" onClick={() => cameraInputRef.current?.click()}>
              צלם תמונה
            </button>
          </div>

          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => handleImageFile(e.target.files[0])}
          />
        </div>

        {/* Messages */}
        {successMsg && <div className="msg success-msg">{successMsg}</div>}
        {errorMsg && <div className="msg error-msg">{errorMsg}</div>}

        {/* Submit */}
        <button
          type="submit"
          className={`submit-btn ${isFormValid && !submitting ? "active" : ""}`}
          disabled={!isFormValid || submitting}
        >
          {submitting ? "שומר..." : "הוסף מוצר"}
        </button>
      </form>

      {showCrop && imagePreview && (
        <ImageCropModal
          imageSrc={imagePreview}
          onDone={handleCropDone}
          onClose={() => setShowCrop(false)}
        />
      )}
    </div>
  );
}

export default AddProduct;
