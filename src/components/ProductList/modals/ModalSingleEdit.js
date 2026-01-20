// src/components/modals/ModalSingleEdit.js
import React, { useState, useEffect } from "react";
import Modal from "../../Cart/Modal";

export default function ModalSingleEdit({
  isOpen,
  onClose,
  product,
  onSave,
  allCategories = [],
  allSubCategories = [],
}) {
  const UNCLASSIFIED_CATEGORY = "מוצרים ללא סיווג";
  const selectableCategories = allCategories.filter(
    (cat) => cat !== UNCLASSIFIED_CATEGORY,
  );
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState(0);
  const [unitWeight, setUnitWeight] = useState("g");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [generalName, setGeneralName] = useState("");

  useEffect(() => {
    if (product && isOpen) {
      setBarcode(product.barcode || "");
      setName(product.name || "");
      setBrand(product.brand || "");
      setWeight(product.weight || 0);
      setUnitWeight(product.unitWeight || "g");
      setCategory(product.category || "");
      setSubcategory(product.subcategory || "");
      setGeneralName(product.generalName || "");
    }
  }, [product, isOpen]);

  const categoryIndex = selectableCategories.indexOf(category);
  const subOptions =
    categoryIndex >= 0 ? allSubCategories[categoryIndex] || [] : [];

  if (!isOpen || !product) return null;

  const handleSave = () => {
    const updates = {
      barcode,
      name,
      brand,
      weight: Number(weight),
      unitWeight,
      category,
      subcategory,
      generalName,
    };
    onSave(updates);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>עריכת מוצר</h2>

      <div>
        <label>ברקוד:</label>
        <input value={barcode} onChange={(e) => setBarcode(e.target.value)} />
      </div>
      <div>
        <label>שם מוצר:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>מותג:</label>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} />
      </div>
      <div>
        <label>משקל:</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <div>
        <label>יחידת משקל:</label>
        <select
          value={unitWeight}
          onChange={(e) => setUnitWeight(e.target.value)}
        >
          <option value="g">גרם</option>
          <option value="kg">ק"ג</option>
          <option value="ml">מ"ל</option>
          <option value="l">ליטר</option>
          <option value="u">יחידות</option>
          <option value="t">אחר</option>
        </select>
      </div>
      <div>
        <label>קטגוריה:</label>
        <select
          value={category}
          onChange={(e) => {
            const nextCategory = e.target.value;
            setCategory(nextCategory);
            const nextIndex = selectableCategories.indexOf(nextCategory);
            const nextSubOptions =
              nextIndex >= 0 ? allSubCategories[nextIndex] || [] : [];
            if (!nextSubOptions.includes(subcategory)) {
              setSubcategory("");
            }
          }}
        >
          <option value="">בחר קטגוריה</option>
          {selectableCategories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>תת־קטגוריה:</label>
        <select
          value={subcategory}
          onChange={(e) => setSubcategory(e.target.value)}
          disabled={!category}
        >
          <option value="">בחר תת־קטגוריה</option>
          {subOptions.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>שם כללי:</label>
        <input
          value={generalName}
          onChange={(e) => setGeneralName(e.target.value)}
        />
      </div>

      <button onClick={onClose}>בטל</button>
      <button onClick={handleSave}>שמור</button>
    </Modal>
  );
}
