// src/components/modals/ModalSingleEdit.js
import React, { useState, useEffect } from "react";
import Modal from "../../Cart/Modal";

export default function ModalSingleEdit({ isOpen, onClose, product, onSave }) {
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
      generalName
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
        <select value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)}>
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
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <label>תת־קטגוריה:</label>
        <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
      </div>
      <div>
        <label>שם כללי:</label>
        <input value={generalName} onChange={(e) => setGeneralName(e.target.value)} />
      </div>

      <button onClick={onClose}>בטל</button>
      <button onClick={handleSave}>שמור</button>
    </Modal>
  );
}
