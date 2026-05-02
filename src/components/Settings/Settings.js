import React from "react";
import "./Settings.css";
import { useProductsLayout } from "../../context/ProductsLayoutContext";

const LAYOUT_OPTIONS = [
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

function LayoutPreview({ value }) {
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

export default function Settings() {
  const { layout, setLayout } = useProductsLayout();

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
              {LAYOUT_OPTIONS.map((opt) => {
                const active = layout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setLayout(opt.value)}
                    aria-pressed={active}
                  >
                    <LayoutPreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">{opt.description}</span>
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
