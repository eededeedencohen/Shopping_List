import React, { useState, useRef, useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { DOMAIN } from "../../constants";
import { useProductList } from "../../hooks/appHooks";
import { useAddProductDefaults } from "../../context/AddProductDefaultsContext";
import ImageCropModal from "../AddProduct/ImageCropModal";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import "./AddFromScraperModal.css";

const UNIT_OPTIONS = [
  { value: "g", label: "גרם" },
  { value: "kg", label: 'ק"ג' },
  { value: "ml", label: 'מ"ל' },
  { value: "l", label: "ליטר" },
  { value: "u", label: "יחידות" },
  { value: "t", label: "טון" },
];

function AddFromScraperModal({ isOpen, onClose, barcode, scrapedPrices, onSaved, initialName = "", initialImageDataUri = null }) {
  useBodyScrollLock(isOpen);
  const { allCategories, all_sub_categories } = useProductList();
  const { defaults, updateDefault, loaded } = useAddProductDefaults();

  const [name, setName] = useState(initialName || "");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState("");
  const [unitWeight, setUnitWeight] = useState("g");
  const [generalName, setGeneralName] = useState("");
  const [categoryIndex, setCategoryIndex] = useState(0);
  const [subCategoryIndex, setSubCategoryIndex] = useState(0);

  // Load saved defaults
  useEffect(() => {
    if (loaded) {
      setGeneralName(defaults.generalName || "");
      setCategoryIndex(defaults.categoryIndex || 0);
      setSubCategoryIndex(defaults.subCategoryIndex || 0);
    }
  }, [loaded, defaults.generalName, defaults.categoryIndex, defaults.subCategoryIndex]);

  // Convert prefilled scraped image (data URI) into a real File so it can be submitted.
  useEffect(() => {
    if (!isOpen || !initialImageDataUri) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(initialImageDataUri);
        const blob = await res.blob();
        if (cancelled) return;
        const file = new File([blob], `${barcode || "scraped"}.jpg`, {
          type: blob.type || "image/jpeg",
        });
        setImageFile(file);
        setImagePreview(initialImageDataUri);
      } catch {
        /* ignore — user can still upload manually */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, initialImageDataUri, barcode]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const subCategories = all_sub_categories[categoryIndex] || [];

  const handleImageFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  }, []);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageFile(e.dataTransfer.files[0]);
  };

  const handlePaste = useCallback((e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        handleImageFile(item.getAsFile());
        break;
      }
    }
  }, [handleImageFile]);

  const removeImage = () => { setImageFile(null); setImagePreview(null); };

  // Long press to paste from clipboard (mobile)
  const longPressTimer = useRef(null);
  const pasteTargetRef = useRef(null);

  const handleLongPressStart = () => {
    longPressTimer.current = setTimeout(() => {
      if (navigator.clipboard && navigator.clipboard.read) {
        navigator.clipboard.read().then((clipboardItems) => {
          for (const item of clipboardItems) {
            const imageType = item.types.find((t) => t.startsWith("image/"));
            if (imageType) {
              item.getType(imageType).then((blob) => {
                const file = new File([blob], "pasted-image.png", { type: imageType });
                handleImageFile(file);
              });
              return;
            }
          }
        }).catch(() => {
          const el = pasteTargetRef.current;
          if (el) { el.innerHTML = ""; el.focus(); document.execCommand("paste"); }
        });
      } else {
        const el = pasteTargetRef.current;
        if (el) { el.innerHTML = ""; el.focus(); document.execCommand("paste"); }
      }
    }, 600);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  };

  const [showCrop, setShowCrop] = useState(false);
  const handleCropDone = (croppedFile, croppedPreview) => {
    setImageFile(croppedFile);
    setImagePreview(croppedPreview);
    setShowCrop(false);
  };

  const isFormValid = name.trim().length >= 2 && generalName.trim().length >= 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    setErrorMsg("");

    try {
      const productData = {
        barcode,
        name: name.trim(),
        brand: brand.trim(),
        weight: Number(weight) || 0,
        unitWeight,
        generalName: generalName.trim(),
        category: allCategories[categoryIndex],
        subcategory: subCategories[subCategoryIndex] || "",
      };

      const formData = new FormData();
      formData.append("product", JSON.stringify(productData));
      formData.append("prices", JSON.stringify(scrapedPrices));
      if (imageFile) formData.append("image", imageFile);

      const res = await fetch(`${DOMAIN}/api/v1/scraper/save-product`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.status !== "success") {
        throw new Error(data.message || "שגיאה בשמירה");
      }

      onSaved(data);
      onClose();
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="afs-overlay" onClick={onClose}>
      <div className="afs-modal" onClick={(e) => e.stopPropagation()} onPaste={handlePaste}>
        <div className="afs-header">
          <h2>הוספת מוצר חדש</h2>
          <button className="afs-close" onClick={onClose}>&times;</button>
        </div>

        <div className="afs-barcode-badge">{barcode}</div>
        <div className="afs-prices-count">
          {scrapedPrices.length} מחירים יישמרו
        </div>

        <form className="afs-form" onSubmit={handleSubmit}>
          <div className="afs-group">
            <label>שם המוצר</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: דוריטוס חריף אש 70 גרם" />
          </div>

          <div className="afs-group">
            <label>מותג</label>
            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)}
              placeholder="לדוגמה: דוריטוס" />
          </div>

          <div className="afs-group">
            <label>שם כללי</label>
            <input type="text" value={generalName} onChange={(e) => { setGeneralName(e.target.value); updateDefault("generalName", e.target.value); }}
              placeholder="לדוגמה: חטיפים" />
          </div>

          <div className="afs-row">
            <div className="afs-group afs-flex2">
              <label>משקל</label>
              <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="afs-group afs-flex1">
              <label>יחידה</label>
              <select value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)}>
                {UNIT_OPTIONS.map((u) => (
                  <option key={u.value} value={u.value}>{u.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="afs-group">
            <label>קטגוריה</label>
            <select value={categoryIndex} onChange={(e) => { const val = Number(e.target.value); setCategoryIndex(val); setSubCategoryIndex(0); updateDefault("categoryIndex", val); updateDefault("subCategoryIndex", 0); }}>
              {allCategories.map((cat, i) => (
                <option key={cat} value={i}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="afs-group">
            <label>תת-קטגוריה</label>
            <select value={subCategoryIndex} onChange={(e) => { const val = Number(e.target.value); setSubCategoryIndex(val); updateDefault("subCategoryIndex", val); }}>
              {subCategories.length === 0 ? (
                <option value={0}>אין תת-קטגוריות</option>
              ) : (
                subCategories.map((sub, i) => (
                  <option key={sub} value={i}>{sub}</option>
                ))
              )}
            </select>
          </div>

          <div className="afs-group">
            <label>תמונה (אופציונלי)</label>
            <div
              className={`afs-dropzone ${isDragging ? "dragging" : ""} ${imagePreview ? "has-image" : ""}`}
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
                <div className="afs-preview-wrap">
                  <img src={imagePreview} alt="Preview" className="afs-preview" />
                  <div className="afs-img-actions">
                    <button type="button" className="afs-img-crop" onClick={(e) => { e.stopPropagation(); setShowCrop(true); }}>חתוך</button>
                    <button type="button" className="afs-img-remove" onClick={(e) => { e.stopPropagation(); removeImage(); }}>&times;</button>
                  </div>
                </div>
              ) : (
                <div className="afs-dropzone-text">
                  <span>+</span>
                  <p>גרור, הדבק (Ctrl+V),</p>
                  <p>לחיצה ארוכה להדבקה</p>
                  <p>או לחץ לבחירה</p>
                </div>
              )}
              <div
                ref={pasteTargetRef}
                contentEditable
                onPaste={(e) => {
                  e.preventDefault();
                  const items = e.clipboardData?.items;
                  if (!items) return;
                  for (const item of items) {
                    if (item.type.startsWith("image/")) {
                      handleImageFile(item.getAsFile());
                      break;
                    }
                  }
                }}
                style={{ position: "absolute", opacity: 0, width: 0, height: 0, overflow: "hidden" }}
              />
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleImageFile(e.target.files[0])} />
            <div className="afs-img-btns">
              <button type="button" onClick={() => fileInputRef.current?.click()}>בחר קובץ</button>
              <button type="button" onClick={() => cameraInputRef.current?.click()}>צלם</button>
            </div>
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => handleImageFile(e.target.files[0])} />
          </div>

          {errorMsg && <div className="afs-error">{errorMsg}</div>}

          <div className="afs-actions">
            <button type="button" className="afs-btn cancel" onClick={onClose}>ביטול</button>
            <button type="submit" className={`afs-btn save ${isFormValid && !submitting ? "active" : ""}`} disabled={!isFormValid || submitting}>
              {submitting ? "שומר..." : `שמור מוצר + ${scrapedPrices.length} מחירים`}
            </button>
          </div>
        </form>

        {showCrop && imagePreview && (
          <ImageCropModal
            imageSrc={imagePreview}
            onDone={handleCropDone}
            onClose={() => setShowCrop(false)}
          />
        )}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default AddFromScraperModal;
