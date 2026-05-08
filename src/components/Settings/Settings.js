import React, { useState } from "react";
import "./Settings.css";
import { useProductsLayout } from "../../context/ProductsLayoutContext";
import { useCartCardLayout } from "../../context/CartCardLayoutContext";
import { usePriceCompareLayout } from "../../context/PriceCompareLayoutContext";
import { useAvailabilityMeta } from "../../hooks/useProductAvailability";
import { rebuildAvailabilityIndex } from "../../services/productAvailabilityService";

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

const PRICE_COMPARE_LAYOUT_OPTIONS = [
  {
    value: "expanded",
    label: "כל הסניפים",
    description: "כל סניף מוצג כשורה נפרדת — תמיד",
  },
  {
    value: "grouped",
    label: "מקובצים לפי רשת",
    description: "סניפים זהים באותה רשת מתאחדים לשורה אחת",
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

function PriceComparePreview({ value }) {
  if (value === "expanded") {
    return (
      <div className="price-compare-preview">
        <div className="price-compare-preview__row">
          <span className="price-compare-preview__logo" />
          <span className="price-compare-preview__line" />
          <span className="price-compare-preview__price" />
        </div>
        <div className="price-compare-preview__row">
          <span className="price-compare-preview__logo" />
          <span className="price-compare-preview__line" />
          <span className="price-compare-preview__price" />
        </div>
        <div className="price-compare-preview__row">
          <span className="price-compare-preview__logo" />
          <span className="price-compare-preview__line" />
          <span className="price-compare-preview__price" />
        </div>
      </div>
    );
  }
  return (
    <div className="price-compare-preview price-compare-preview--grouped">
      <div className="price-compare-preview__row">
        <span className="price-compare-preview__logo" />
        <span className="price-compare-preview__line" />
        <span className="price-compare-preview__badge">3</span>
        <span className="price-compare-preview__price" />
      </div>
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

function formatRelativeTime(iso) {
  if (!iso) return "טרם עודכן";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "טרם עודכן";
  const diffMs = Date.now() - ts;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "לפני רגע";
  if (diffMin < 60) return `לפני ${diffMin} ${diffMin === 1 ? "דקה" : "דקות"}`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `לפני ${diffHr} ${diffHr === 1 ? "שעה" : "שעות"}`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `לפני ${diffDay} ${diffDay === 1 ? "יום" : "ימים"}`;
  const d = new Date(iso);
  return d.toLocaleDateString("he-IL");
}

export default function Settings() {
  const { layout: productsLayout, setLayout: setProductsLayout } =
    useProductsLayout();
  const { layout: cartCardLayout, setLayout: setCartCardLayout } =
    useCartCardLayout();
  const { layout: priceCompareLayout, setLayout: setPriceCompareLayout } =
    usePriceCompareLayout();

  const { meta, isLoading: isMetaLoading, refetch: refetchMeta } =
    useAvailabilityMeta();
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState(null); // { kind, message }

  const handleRebuild = async () => {
    if (isRebuilding) return;
    setIsRebuilding(true);
    setRebuildStatus(null);
    try {
      const result = await rebuildAvailabilityIndex();
      await refetchMeta();
      setRebuildStatus({
        kind: "success",
        message: `עודכנו ${result.productCount || 0} מוצרים`,
      });
    } catch (err) {
      setRebuildStatus({
        kind: "error",
        message: "העדכון נכשל. נסה שוב.",
      });
    } finally {
      setIsRebuilding(false);
    }
  };

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
            <span className="settings-card__title">תצוגת השוואת מחירים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר כיצד יוצגו מחירים של אותה רשת באותו מוצר
            </p>
            <div className="layout-options">
              {PRICE_COMPARE_LAYOUT_OPTIONS.map((opt) => {
                const active = priceCompareLayout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setPriceCompareLayout(opt.value)}
                    aria-pressed={active}
                  >
                    <PriceComparePreview value={opt.value} />
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
            <span className="settings-card__title">עדכון נתונים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              עדכון אינדקס הזמינות של המוצרים בסופרים — משמש להצגה רק של
              סופרים שמכילים את כל מוצרי העגלה.
            </p>

            <div className="settings-row">
              <span className="settings-row__label">עודכן לאחרונה</span>
              <span className="settings-row__value">
                {isMetaLoading
                  ? "טוען…"
                  : formatRelativeTime(meta && meta.updatedAt)}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-row__label">מוצרים באינדקס</span>
              <span className="settings-row__value">
                {isMetaLoading ? "—" : (meta && meta.productCount) || 0}
              </span>
            </div>

            <button
              type="button"
              className={`settings-rebuild-btn ${
                isRebuilding ? "is-loading" : ""
              }`}
              onClick={handleRebuild}
              disabled={isRebuilding}
            >
              {isRebuilding ? (
                <span className="settings-rebuild-spinner" aria-hidden />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              )}
              {isRebuilding ? "מעדכן…" : "עדכן עכשיו"}
            </button>

            {rebuildStatus && (
              <div
                className={`settings-rebuild-status settings-rebuild-status--${rebuildStatus.kind}`}
                role="status"
              >
                {rebuildStatus.message}
              </div>
            )}
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
