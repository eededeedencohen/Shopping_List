import React, { useEffect, useRef, useState } from "react";
import { ProductImageDisplay } from "../../../../Images/ProductImageService";
import { ReactComponent as CartIcon } from "../../../../Cart/Icons/shopping-cart.svg";
import { useUpdateActiveCart } from "../../../../../hooks/appHooks";
import { useCart } from "../../../../../context/CartContext2";
import "./CartBatchAdd.css";

/* Batch add performed by the AI — a polished inline receipt-style card: header
   with a bouncing cart, product rows that slide in one after another (each
   getting its ✓ as it "lands"), and a summary footer. The CART MUTATION below
   is unchanged: one add() per item, then a single persisted sendActiveCart(). */

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

const CartBatchAdd = ({ items }) => {
  const { cart, setCart } = useCart();
  const { sendActiveCart } = useUpdateActiveCart();
  const hasRunRef = useRef(false);
  const [addedCount, setAddedCount] = useState(0);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!Array.isArray(items) || items.length === 0 || !cart) return;

    /* Merge ALL items in ONE setCart. Calling add() per item in a loop reads the
       same stale cart closure each time, so only the LAST item survives — a real
       data-loss bug. Building the merged products array once fixes it. */
    let count = 0;
    const merged = [...(cart.products || [])];
    for (const item of items) {
      if (item.barcode && item.amount > 0) {
        const ex = merged.find((p) => p.barcode === item.barcode);
        if (ex) ex.amount += Number(item.amount);
        else merged.push({ barcode: item.barcode, amount: Number(item.amount) });
        count++;
      }
    }
    setCart({ ...cart, products: merged });
    setAddedCount(count);
    sendActiveCart();
  }, []);

  if (!Array.isArray(items) || items.length === 0) return null;

  const totalUnits = items.reduce(
    (s, it) => s + (it.barcode && it.amount > 0 ? Number(it.amount) : 0),
    0
  );

  return (
    <div className="cba" dir="rtl">
      <div className="cba__head">
        <span className="cba__cart">
          <CartIcon className="cba__cart-icon" />
          <b className="cba__cart-count">+{addedCount}</b>
        </span>
        <span className="cba__head-text">
          <b className="cba__title">
            {addedCount === 1
              ? "מוצר אחד נוסף לעגלה"
              : `${addedCount} מוצרים נוספו לעגלה`}
          </b>
          <i className="cba__subtitle">העגלה עודכנה ונשמרה</i>
        </span>
      </div>

      <div className="cba__list">
        {items.map((item, i) => (
          <div
            key={item.barcode || i}
            className="cba__row"
            style={{ "--d": `${0.15 + i * 0.14}s` }}
          >
            <span className="cba__row-img">
              <ProductImageDisplay barcode={item.barcode} alt={item.productName} />
            </span>
            <span className="cba__row-name">
              {item.productName || item.barcode}
            </span>
            <span className="cba__row-qty">×{item.amount}</span>
            <span className="cba__row-check">
              <IconCheck />
            </span>
          </div>
        ))}
      </div>

      <div
        className="cba__foot"
        style={{ "--d": `${0.25 + items.length * 0.14}s` }}
      >
        <IconCheck />
        סה״כ {totalUnits} יחידות נוספו לעגלה
      </div>
    </div>
  );
};

export default CartBatchAdd;
