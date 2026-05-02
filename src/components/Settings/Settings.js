import React from "react";
import "./Settings.css";
import { useProductsLayout } from "../../context/ProductsLayoutContext";
import { useCartCardLayout } from "../../context/CartCardLayoutContext";

const PRODUCTS_LAYOUT_OPTIONS = [
  {
    value: "list",
    label: "רשימה",
    description: "מוצר אחד בכל שורה — תצוגה מורחבת",
  },
  {
    value: "grid",
    label: "רשת",
    description: "שני מוצרים בכל שורה — תצוגה קומפקטית",
  },
];

const CART_CARD_LAYOUT_OPTIONS = [
  {
    value: "default",
    label: "מורחבת",
    description: "כפתורי +/- ועדכון בשורה נפרדת מתחת",
  },
  {
    value: "compact",
    label: "קומפקטית",
    description: "ללא שורת כפתורים — שינוי כמות בהחלקה",
  },
];

function ProductsLayoutPreview({ value }) {
  if (value === "list") {
    return (
      <div className="layout-preview layout-preview--list">
        <span /><span /><span />
      </div>
    );
  }
  return (
    <div className="layout-preview layout-preview--grid">
      <span /><span /><span /><span />
    </div>
  );
}

function CartCardPreview({ value }) {
  if (value === "default") {
    return (
      <div className="cart-card-preview cart-card-preview--default">
        <div className="cart-card-preview__top">
          <span className="cart-card-preview__line" />
          <span className="cart-card-preview__img" />
        </div>
        <div className="cart-card-preview__bottom">
          <span className="cart-card-preview__btn cart-card-preview__btn--minus" />
          <span className="cart-card-preview__btn cart-card-preview__btn--plus" />
          <span className="cart-card-preview__btn cart-card-preview__btn--cancel" />
        </div>
      </div>
    );
  }
  return (
    <div className="cart-card-preview cart-card-preview--compact">
      <div className="cart-card-preview__top">
        <span className="cart-card-preview__line" />
        <span className="cart-card-preview__img" />
      </div>
      <div className="cart-card-preview__inline">
        <span className="cart-card-preview__chip" />
        <span className="cart-card-preview__chip cart-card-preview__chip--accent" />
      </div>
    </div>
  );
}

export default function Settings() {
  const { layout: productsLayout, setLayout: setProductsLayout } =
    useProductsLayout();
  const { layout: cartCardLayout, setLayout: setCartCardLayout } =
    useCartCardLayout();

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">הגדרות</h1>
        <p className="settings-page__subtitle">
          כאן תוכל לנהל את ההעדפות של האפליקציה
        </p>
      </div>

      <div className="settings-page__content">
        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">תצוגת רשימת המוצרים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר כיצד יוצגו המוצרים בעמוד המוצרים
            </p>
            <div className="layout-options">
              {PRODUCTS_LAYOUT_OPTIONS.map((opt) => {
                const active = productsLayout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setProductsLayout(opt.value)}
                    aria-pressed={active}
                  >
                    <ProductsLayoutPreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">תצוגת כרטיסיית מוצר בעגלה</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר את צורת הכרטיסייה של מוצרי העגלה
            </p>
            <div className="layout-options">
              {CART_CARD_LAYOUT_OPTIONS.map((opt) => {
                const active = cartCardLayout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setCartCardLayout(opt.value)}
                    aria-pressed={active}
                  >
                    <CartCardPreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">אודות</span>
          </header>
          <div className="settings-card__body">
            <div className="settings-row">
              <span className="settings-row__label">גרסה</span>
              <span className="settings-row__value">1.0.0</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
