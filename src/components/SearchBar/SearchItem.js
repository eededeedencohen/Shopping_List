import React, { useEffect, useRef, useState } from "react";
import "./SearchItem.css";
import { ProductImageDisplay } from "../Images/ProductImageService";

export const convertWeightUnit = (weightUnit) => {
  const u = (weightUnit || "").toString().toLowerCase();
  if (u === "g") return "גרם";
  if (u === "kg") return 'ק"ג';
  if (u === "ml") return 'מ"ל';
  if (u === "l") return "ליטר";
  if (u === "u") return "יחידות";
  return weightUnit || "";
};

const priceFormat = (n) => (typeof n === "number" ? n.toFixed(2) : "-");

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/* wrap every typed word found in `text` in a <mark> */
const highlight = (text, words) => {
  const str = text == null ? "" : String(text);
  if (!words || !words.length || !str) return str;
  const re = new RegExp(`(${words.map(escapeRe).join("|")})`, "gi");
  const parts = str.split(re); // capturing group → matches land at the ODD indices
  if (parts.length === 1) return str;
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark className="sr__mark" key={i}>{part}</mark>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    )
  );
};

const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const IconPlus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);

const BUMP_MS = 440;

/* ── the quantity control: a blue "הוסף" pill that springs open into a
   −/n/+ stepper on the first tap; the tapped button bounces, the number
   slides in from below (+) or above (−), the pill glows for a beat ── */
function QtyControl({ amount, onIncrement, onDecrement }) {
  const [bump, setBump] = useState(null); // "add" | "up" | "down" | null
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const kick = (kind) => {
    clearTimeout(timer.current);
    setBump(null); // drop the class first so a repeated tap re-triggers the animation
    requestAnimationFrame(() => {
      setBump(kind);
      timer.current = setTimeout(() => setBump(null), BUMP_MS);
    });
  };

  const inc = (e) => {
    e.stopPropagation();
    kick(amount === 0 ? "add" : "up");
    onIncrement();
  };
  const dec = (e) => {
    e.stopPropagation();
    if (amount <= 0) return;
    kick("down");
    onDecrement();
  };

  return (
    <div
      className={`sr-qty${amount > 0 ? " is-on" : ""}${bump ? ` is-${bump}` : ""}`}
      onClick={(e) => e.stopPropagation()}
      aria-label="כמות בעגלה"
    >
      {amount === 0 ? (
        <button type="button" className="sr-qty__add" onClick={inc} aria-label="הוסף לעגלה">
          <IconPlus />
          <span>הוסף</span>
        </button>
      ) : (
        <>
          <button type="button" className="sr-qty__btn sr-qty__btn--plus" onClick={inc} aria-label="הוסף יחידה">
            <IconPlus />
          </button>
          <span className="sr-qty__n">
            {/* keyed by the amount → re-mounts → the slide animation runs on every change */}
            <span className="sr-qty__num" key={amount}>{amount}</span>
          </span>
          <button type="button" className="sr-qty__btn sr-qty__btn--minus" onClick={dec} aria-label="הורד יחידה">
            <IconMinus />
          </button>
        </>
      )}
    </div>
  );
}

const SearchItem = ({ product, words, index = 0, onOpen, onIncrement, onDecrement }) => {
  if (!product) return null;
  const amount = product.amountInCart || 0;
  const hasWeight = product.weight !== "" && product.weight !== undefined && product.weight !== null && product.weight !== 0;
  const priced = typeof product.price === "number";

  return (
    <li
      className={`sr-item${amount > 0 ? " in-cart" : ""}${priced ? "" : " is-na"}`}
      style={{ "--i": Math.min(index, 9) }}
    >
      <div
        className="sr-item__main"
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onOpen();
          }
        }}
        aria-label={`${product.name} - השוואת מחירים`}
      >
        <span className="sr-item__img">
          <ProductImageDisplay barcode={product.barcode} eager={index < 8} />
        </span>
        <span className="sr-item__text">
          <span className="sr-item__name">{highlight(product.name, words)}</span>
          {(product.brand || hasWeight) && (
            <span className="sr-item__meta">
              {product.brand && <span>{highlight(product.brand, words)}</span>}
              {product.brand && hasWeight && <span className="sr-item__dot" aria-hidden="true">·</span>}
              {hasWeight && (
                <span>
                  {product.weight} {convertWeightUnit(product.unitWeight)}
                </span>
              )}
            </span>
          )}
          <span className="sr-item__bottom">
            <span className="sr-item__pricebox">
              {priced ? (
                <span className="sr-item__price">
                  <span className="sr-item__cur">₪</span>
                  {priceFormat(product.price)}
                </span>
              ) : (
                <span className="sr-item__na">לא זמין בסופר הנוכחי</span>
              )}
              {product.discount && (
                <span className="sr-item__deal">
                  <IconTag />
                  {product.discount.units} ב-₪{priceFormat(product.discount.totalPrice)}
                </span>
              )}
            </span>
            <QtyControl amount={amount} onIncrement={onIncrement} onDecrement={onDecrement} />
          </span>
        </span>
      </div>
    </li>
  );
};

export default SearchItem;
