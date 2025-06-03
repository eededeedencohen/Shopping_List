/*********************************************************************
 * CartView – Luxury Glass + Swipe                                   *
 *********************************************************************/

import React, { useRef, useState } from "react";
import { Spin } from "antd";
import { useFullCart, useCartActions } from "../../../../../../hooks/appHooks";
import ProductsImages from "../../../../../Images/ProductsImages";
import "./CartView.css";

const money = (n) => Number(n).toFixed(2);

// δ = מרחק האצבע בפועל  (יכול להיות שלילי כשגולשים שמאלה)
// מחזיר כמה להזיז את הכרטיס.
const spring = (δ, limit) => {
  if (δ <= 0) return δ; // שמאלה → תזוזה רגילה לחלוטין
  // נוסחת דעיכה אקספוננציאלית: מתחילה כמעט 1-ל-1 ומתקפלת בהדרגה
  return limit * (1 - Math.exp(-δ / limit));
};

/* ───────────── כרטיס יחיד ───────────── */
const CartItem = ({ data, remove, update }) => {
  const { product, amount, totalPrice } = data;
  const [dx, setDx] = useState(0);
  const [anim, setAnim] = useState("");
  const startX = useRef(0);
  const fingerDelta = useRef(0); // שומרים את תנועת האצבע האמיתית
  const threshold = window.innerWidth * 0.25;

  const onStart = (e) => {
    startX.current = e.touches[0].clientX;
    setAnim("");
  };

  const onMove = (e) => {
    const δ = e.touches[0].clientX - startX.current;
    fingerDelta.current = δ; // נשמור להמשך
    setDx(spring(δ, threshold)); // כאן הקסם
  };

  /* סיום */
  const onEnd = () => {
    const δ = fingerDelta.current; // זה “כמה האצבע זזה באמת”
    if (δ < -threshold) {
      // שמאלה למחיקה
      setAnim("delete");
      setTimeout(() => remove(product.barcode), 400);
    } else if (δ > threshold) {
      // ימינה להוספת כמות
      setDx(0); // איפוס מיידי של המיקום
      setAnim("bounce");
      update(product.barcode, amount + 1);
    } else {
      setDx(0); // החזרה למקום
    }
  };

  return (
    <article
      className={`cv_item ${anim}`}
      /*  bounce ← CSS שולט לגמרי          *
       *  delete/רגיל ← נשמור translateX   */
      style={anim === "bounce" ? {} : { transform: `translateX(${dx}px)` }}
      onTouchStart={onStart}
      onTouchMove={onMove}
      onTouchEnd={onEnd}
    >
      <div className="cv_pic">
        <ProductsImages barcode={product.barcode} />
        <span className="cv_badge">{amount}</span>
      </div>

      <div className="cv_info">
        <h4 className="cv_name">{product.name}</h4>
        <p className="cv_line">
          {product.weight} {product.unitWeight} • {product.brand}
        </p>
      </div>

      <div className="cv_priceBox">
        <span className="cv_price">₪{money(totalPrice)}</span>
      </div>
    </article>
  );
};

/* ───────────── CartView ───────────── */
const CartView = () => {
  const { fullCart } = useFullCart();
  const { remove, update } = useCartActions();

  if (!fullCart)
    return (
      <div className="cv_root cv_loading">
        <Spin size="large" />
        <p>טוען עגלה…</p>
      </div>
    );

  const { supermarket, totalPrice, productsWithPrices } = fullCart;

  return (
    <div className="cv_root">
      <header className="cv_header">
        <h3 className="cv_supName">{supermarket.name || "סופר"}</h3>
        <p className="cv_supAddr">
          {supermarket.city}, {supermarket.address}
        </p>
      </header>

      <div className="cv_scroll">
        <div className="cv_list">
          {productsWithPrices.map((p) => (
            <CartItem
              key={p.product.barcode}
              data={p}
              remove={remove}
              update={update}
            />
          ))}
        </div>
      </div>

      <footer className="cv_total">
        <span>סה״כ:</span>
        <strong>₪&nbsp;{money(totalPrice)}</strong>
      </footer>
    </div>
  );
};

export default CartView;
