import React, { useState } from "react";

const ProductQuantityEditorWithPrice = ({
  originalQuantity,
  originalTotalPrice,
  onUpdate,
}) => {
  const [editedQuantity, setEditedQuantity] = useState(originalQuantity);

  const handleIncrement = () => setEditedQuantity(editedQuantity + 1);
  const handleDecrement = () => {
    if (editedQuantity > 0) {
      setEditedQuantity(editedQuantity - 1);
    }
  };

  const handleCancel = () => {
    setEditedQuantity(originalQuantity);
  };

  // חישוב מחיר ליחידה ומחיר כולל חדש
  const unitPrice =
    originalQuantity > 0 ? originalTotalPrice / originalQuantity : 0;
  const newTotalPrice = editedQuantity * unitPrice;

  return (
    <div className="product-quantity-editor">
      <div className="quantity-controls">
        <button onClick={handleDecrement}>-</button>
        <span style={{ margin: "0 10px" }}>{editedQuantity}</span>
        <button onClick={handleIncrement}>+</button>
      </div>
      {editedQuantity !== originalQuantity && (
        <div className="new-price-info" style={{ marginTop: "5px" }}>
          <span style={{ textDecoration: "line-through" }}>
            {originalTotalPrice.toFixed(2)}₪
          </span>
          <span style={{ color: "red", marginLeft: "10px" }}>
            {newTotalPrice.toFixed(2)}₪
          </span>
        </div>
      )}
      {editedQuantity !== originalQuantity && (
        <div className="update-cancel-buttons" style={{ marginTop: "5px" }}>
          <button onClick={() => onUpdate(editedQuantity)}>עדכן</button>
          <button onClick={handleCancel}>בטל</button>
        </div>
      )}
    </div>
  );
};
export default ProductQuantityEditorWithPrice;