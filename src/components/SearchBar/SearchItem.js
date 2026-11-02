import React from "react";
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

const priceFormat = (n) => (typeof n === "number" ? n.toFixed(2) : "—");

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
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconMinus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
    <path d="M5 12h14" />
  </svg>
);

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
      <button type="button" className="sr-item__main" onClick={onOpen} aria-label={`${product.name} — השוואת מחירים`}>
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
        </span>
      </button>

      <div className="sr-item__qty" aria-label="כמות בעגלה">
        <button
          type="button"
          className="sr-item__step sr-item__step--plus"
          onClick={onIncrement}
          aria-label="הוסף יחידה"
        >
          <IconPlus />
        </button>
        <span className="sr-item__n">{amount}</span>
        <button
          type="button"
          className="sr-item__step sr-item__step--minus"
          onClick={onDecrement}
          disabled={amount === 0}
          aria-label="הורד יחידה"
        >
          <IconMinus />
        </button>
      </div>
    </li>
  );
};

export default SearchItem;
