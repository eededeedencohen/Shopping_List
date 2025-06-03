// import React, { useEffect, useState, useCallback } from "react";
// import {
//   useCartState,
//   useCartActions,
//   useUpdateActiveCart,
// } from "../../../../../hooks/appHooks";
import React from "react";
import { useState, useEffect, useRef } from "react";
import OperationModal from "./OperationModal";
import "./CartOperationsAddAnimation.css";
import ProductAnimationAdd from "./ProductAnimationAdd";
import ProductAnimationDelete from "./ProductAnimationDelete";

const CartOperationsAddAnimation = ({ barcode, amount }) => {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  // פתיחה אוטומטית ברגע שהקומפוננט עולה
  useEffect(() => {
    handleOpenModal();
    // ניקוי טיימר כאשר הקומפוננטה נעלמת
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleOpenModal = () => {
    clearTimeout(timeoutRef.current); // ביטול טיימר קודם אם קיים
    setIsOpen(true);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
      timeoutRef.current = null;
    }, 3500);
  };

  const handleCloseModal = () => {
    clearTimeout(timeoutRef.current); // ביטול סגירה מתוזמנת אם קיימת
    timeoutRef.current = null;
    setIsOpen(false);
  };

  return (
    <div className="cart-operations-add-animation">
      <OperationModal isOpen={isOpen} onClose={handleCloseModal}>
        <ProductAnimationDelete barcode={barcode} amount={amount} />
        <ProductAnimationAdd barcode={barcode} amount={amount} />
      </OperationModal>

      <div className="coaa_open-modal">
        <button onClick={handleOpenModal}>פתח מודל</button>
      </div>
    </div>
  );
};

export default CartOperationsAddAnimation;
