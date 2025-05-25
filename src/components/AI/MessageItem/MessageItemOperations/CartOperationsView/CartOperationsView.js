import React, { useEffect, useState, useCallback } from "react";
import {
  useCartState,
  useCartActions,
  useUpdateActiveCart,
} from "../../../../../hooks/appHooks";
import ProductsImages from "../../../../Images/ProductsImages";
import "./CartOperationsView.css";

const CartOperationsView = () => {
  const { cart } = useCartState();
  const { update, add, remove } = useCartActions();
  const { sendActiveCart } = useUpdateActiveCart();
  const [visibleOperations, setVisibleOperations] = useState([]);

  const handleOperations = useCallback(() => {
    const operations = [
      // { barcode: "7290008344272", operationType: "remove" },
      // { barcode: "7290002587293", operationType: "add", quantity: 2 },
      // {
      //   barcode: "7290010117864",
      //   operationType: "update",
      //   newQuantity: 5,
      //   oldQuantity: 3,
      // },
    ];
    operations.forEach((operation, index) => {
      setTimeout(() => {
        switch (operation.operationType) {
          case "update":
            update(operation.barcode, operation.newQuantity);
            break;
          case "add":
            for (let i = 0; i < operation.quantity; i++) add(operation.barcode);
            break;
          case "remove":
            remove(operation.barcode);
            break;
          default:
            console.error("Unknown operation type");
        }

        setVisibleOperations((prev) => [...prev, operation]);
      }, index * 600);
    });
  }, [update, add, remove]);

  useEffect(() => {
    handleOperations();
  }, [handleOperations]);

  useEffect(() => {
    sendActiveCart();
  }, [cart, sendActiveCart]);

  return (
    <div className="cart-operations-view">
      <div className="cart-operations-message">
        <p>הפעולות שבוצעו בעגלה שלך:</p>
      </div>
      <div className="cart-operations-container">
        {visibleOperations.map((op, index) => (
          <div key={index} className="operation-box animated">
            <div className="image-wrapper">
              <ProductsImages
                barcode={op.barcode}
                className="operation-image"
              />
              {op.operationType === "remove" && (
                <div className="cross-mark">✖</div>
              )}
            </div>
            <div className="operation-text">
              {op.operationType === "add" && (
                <span className="plus">+ {op.quantity}</span>
              )}
              {op.operationType === "update" && (
                <span className="multiply">X {op.newQuantity}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartOperationsView;