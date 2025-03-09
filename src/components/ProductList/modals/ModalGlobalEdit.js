// src/components/ManageProducts/ModalGlobalEdit.js
import React, { useState } from "react";
import Modal from "../../Cart/Modal";

export default function ModalGlobalEdit({ isOpen, onClose, onApplyChanges }) {
  const [newCategory, setNewCategory] = useState("");
  const [newSubcategory, setNewSubcategory] = useState("");
  // ... אולי שינוי מותג לכלל המוצרים

  if (!isOpen) return null;

  const handleApply = () => {
    // קוראים ל-onApplyChanges עם הנתונים
    onApplyChanges({ newCategory, newSubcategory /* ... */ });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>עריכה כללית</h2>
      <div>
        <label>קטגוריה חדשה:</label>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
        />
      </div>
      <div>
        <label>תת־קטגוריה חדשה:</label>
        <input
          value={newSubcategory}
          onChange={(e) => setNewSubcategory(e.target.value)}
        />
      </div>
      {/* ... */}
      <button onClick={onClose}>בטל</button>
      <button onClick={handleApply}>אישור</button>
    </Modal>
  );
}
