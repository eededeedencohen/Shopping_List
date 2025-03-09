// src/components/modals/ModalBulkEdit.js
import React, { useState } from "react";
import Modal from "../../Cart/Modal";

/** לשנות brand/weight/unitWeight/category/subcategory/generalName לכל המוצרים שנבחרו */
export default function ModalBulkEdit({
  isOpen,
  onClose,
  selectedBarcodes,
  onApply
}) {
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState("");
  const [unitWeight, setUnitWeight] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [generalName, setGeneralName] = useState("");

  if (!isOpen) return null;

  const handleApply = () => {
    // נניח שהמשתמש לא חייב למלא את כל השדות
    // אנו שולחים רק את מה שמילא:
    const updates = {};
    if (brand.trim()) updates.brand = brand;
    if (weight.trim()) updates.weight = Number(weight);
    if (unitWeight.trim()) updates.unitWeight = unitWeight;
    if (category.trim()) updates.category = category;
    if (subcategory.trim()) updates.subcategory = subcategory;
    if (generalName.trim()) updates.generalName = generalName;

    onApply(updates);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>עריכה מרובה</h2>
      <p>מוצרים שנבחרו: {selectedBarcodes.join(", ")}</p>

      <div>
        <label>מותג חדש:</label>
        <input value={brand} onChange={(e) => setBrand(e.target.value)} />
      </div>
      <div>
        <label>משקל חדש:</label>
        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      <div>
        <label>יחידת משקל:</label>
        <select value={unitWeight} onChange={(e) => setUnitWeight(e.target.value)}>
          <option value="">(לא לשנות)</option>
          <option value="g">גרם</option>
          <option value="kg">ק"ג</option>
          <option value="ml">מ"ל</option>
          <option value="l">ליטר</option>
          <option value="u">יחידות</option>
          <option value="t">אחר</option>
        </select>
      </div>
      <div>
        <label>קטגוריה חדשה:</label>
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </div>
      <div>
        <label>תת־קטגוריה חדשה:</label>
        <input value={subcategory} onChange={(e) => setSubcategory(e.target.value)} />
      </div>
      <div>
        <label>שם כללי חדש:</label>
        <input value={generalName} onChange={(e) => setGeneralName(e.target.value)} />
      </div>

      <div style={{ marginTop: "1rem" }}>
        <button onClick={onClose}>בטל</button>
        <button onClick={handleApply}>בצע עדכון</button>
      </div>
    </Modal>
  );
}
