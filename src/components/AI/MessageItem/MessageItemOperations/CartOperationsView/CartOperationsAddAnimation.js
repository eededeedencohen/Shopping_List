import React, { useState, useEffect, useRef } from "react";
import OperationModal from "./OperationModal";
import "./CartOperationsAddAnimation.css";
import ProductAnimationAdd from "./ProductAnimationAdd";
import ProductAnimationDelete from "./ProductAnimationDelete";
import {
  useCartActions,
  useUpdateActiveCart,
} from "../../../../../hooks/appHooks";

const CartOperationsAnimation = ({ barcode, amount = 1, action }) => {
  const { add, remove, update } = useCartActions();
  const { sendActiveCart } = useUpdateActiveCart();

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const hasRunRef = useRef(false); // ← דגל להרצה יחידה

  /* ---------- modal helpers ---------- */
  const openModal = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
    timeoutRef.current = setTimeout(closeModal, 3500);
  };

  const closeModal = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setIsOpen(false);
  };

  /* ---------- run once ---------- */
  useEffect(() => {
    // ב-dev עם StrictMode, האפקט ייקרא פעמיים → חוסמים את השנייה
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!barcode || !action) return; // guard בסיסי

    /* 1. פעולה בלוגיקת הסל */
    switch (action) {
      case "add":
        add(barcode, amount);
        break;
      case "delete":
        remove(barcode, amount);
        break;
      case "update":
        update(barcode, amount);
        break;
      default:
        console.error("Unknown cart action:", action);
    }
    sendActiveCart();

    /* 2. פתיחת מודל + סגירה אוטומטית */
    openModal();

    /* 3. ניקוי טיימר ביציאה אמיתית (unmount האמיתי) */
    return () => clearTimeout(timeoutRef.current);
  }, []); // ← אפקט עם [] תלוי-ריק, ירוץ פעם אחת בלבד (עם חסימת StrictMode)

  /* ---------- render ---------- */
  return (
    <div className="cart-operations-add-animation">
      <OperationModal isOpen={isOpen} onClose={closeModal}>
        {action === "add" && (
          <ProductAnimationAdd barcode={barcode} amount={amount} />
        )}
        {action === "delete" && (
          <ProductAnimationDelete barcode={barcode} amount={amount} />
        )}
      </OperationModal>
    </div>
  );
};

export default CartOperationsAnimation;
