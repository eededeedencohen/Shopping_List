// src/components/modals/ModalAddProduct.js
import React, { useState } from "react";
import Modal from "../../Cart/Modal"; // בהנחה שיש לך Modal מוכן (או כל ספריית מודאל)

export default function ModalAddProduct({ isOpen, onClose, onProductCreated }) {
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [weight, setWeight] = useState(0);
  const [unitWeight, setUnitWeight] = useState("g");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [generalName, setGeneralName] = useState("");

  if (!isOpen) return null;

  const handleCreate = () => {
    const newProd = {
      barcode,
      name,
      brand,
      weight: Number(weight),
      unitWeight,
      category,
      subcategory,
      generalName
    };
    onProductCreated(newProd);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>הוספת מוצר חדש</h2>

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
        <label>שם כללי (generalName):</label>
        <input value={generalName} onChange={(e) => setGeneralName(e.target.value)} />
      </div>

      <button onClick={onClose}>בטל</button>
      <button onClick={handleCreate}>אישור</button>
    </Modal>
  );
}
