import React, { useEffect, useRef, useState } from "react";
import "./CartOperationsAddAnimation.css";
import OperationModal from "./OperationModal";
import ProductAnimationAdd from "./ProductAnimationAdd";
import ProductAnimationDelete from "./ProductAnimationDelete";
import { ProductImageDisplay } from "../../../../Images/ProductImageService";
import { ReactComponent as CartIcon } from "../../../../Cart/Icons/shopping-cart.svg";
import {
  useCartActions,
  useUpdateActiveCart,
} from "../../../../../hooks/appHooks";

/* A single cart operation performed by the AI (add / delete / update):
   1. The fullscreen MODAL animation plays first (the product dropping into the
      cart / flying to the trash), auto-closing after a few seconds.
   2. A polished inline card stays in the chat as the record — product tile,
      dotted trail into the cart, success check and status chip.
   The CART MUTATION below is unchanged: it runs once on mount and persists. */

const IconCheck = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconMinus = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const META = {
  add: {
    title: "נוסף לעגלה",
    sub: "המוצר נוסף לעגלת הקניות שלך",
  },
  delete: {
    title: "הוסר מהעגלה",
    sub: "המוצר הוסר מעגלת הקניות שלך",
  },
  update: {
    title: "הכמות עודכנה",
    sub: "כמות המוצר בעגלה עודכנה",
  },
};

const CartOperationsAnimation = ({ barcode, amount = 1, action }) => {
  const { add, remove, update } = useCartActions();
  const { sendActiveCart } = useUpdateActiveCart();
  const hasRunRef = useRef(false); // ← דגל להרצה יחידה

  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);

  /* ---------- modal helpers ---------- */
  const closeModal = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    setIsOpen(false);
  };
  const openModal = () => {
    clearTimeout(timeoutRef.current);
    setIsOpen(true);
    timeoutRef.current = setTimeout(closeModal, 3500);
  };

  /* ---------- run once (unchanged mutation logic) ---------- */
  useEffect(() => {
    // ב-dev עם StrictMode, האפקט ייקרא פעמיים → חוסמים את השנייה
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!barcode || !action) return; // guard בסיסי

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

    /* המודל עם האנימציה המלאה — נפתח מיד, נסגר לבד */
    if (action === "add" || action === "delete") openModal();

    return () => clearTimeout(timeoutRef.current);
  }, []); // ← אפקט עם [] תלוי-ריק, ירוץ פעם אחת בלבד (עם חסימת StrictMode)

  /* ---------- render ---------- */
  if (!barcode || !action || !META[action]) return null;
  const meta = META[action];
  const isDelete = action === "delete";

  return (
    <div className={`cop cop--${action}`} dir="rtl">
      <OperationModal isOpen={isOpen} onClose={closeModal}>
        {action === "add" && (
          <ProductAnimationAdd barcode={barcode} amount={amount} />
        )}
        {action === "delete" && (
          <ProductAnimationDelete barcode={barcode} amount={amount} />
        )}
      </OperationModal>

      <div className="cop__stage" aria-hidden="true">
        <span className="cop__tile">
          <ProductImageDisplay barcode={barcode} className="cop__tile-img" />
          {action === "add" && amount > 1 && (
            <b className="cop__tile-qty">×{amount}</b>
          )}
          {action === "update" && <b className="cop__tile-qty">×{amount}</b>}
          {isDelete && (
            <b className="cop__tile-qty cop__tile-qty--minus">
              <IconMinus />
            </b>
          )}
        </span>
        <span className="cop__trail">
          <i />
          <i />
          <i />
          <i />
        </span>
        <span className="cop__cart">
          <CartIcon className="cop__cart-icon" />
          <span className="cop__check">
            <IconCheck />
          </span>
        </span>
      </div>

      <div className="cop__text">
        <b className="cop__title">
          {meta.title}
          {action === "add" && amount > 1 ? ` ×${amount}` : ""}
          {action === "update" ? ` ל־×${amount}` : ""}
        </b>
        <span className="cop__sub">{meta.sub}</span>
        <span className="cop__barcode" dir="ltr">
          {barcode}
        </span>
      </div>

      <div className="cop__done">
        <IconCheck />
        העגלה עודכנה ונשמרה
      </div>
    </div>
  );
};

export default CartOperationsAnimation;
