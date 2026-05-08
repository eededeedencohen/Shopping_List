import React from "react";
import {
  useSettings,
  useSettingsOperations,
} from "../../../hooks/optimizationHooks";
import "./ProductsGeneralSettings.css";

const REPLACE_OPTIONS = [
  { value: "all", label: "כל המוצרים" },
  { value: "bySelect", label: "מוצרים שנבחרו" },
  { value: "none", label: "ללא" },
];

const ROUND_UP_OPTIONS = [
  { value: "all", label: "כל המוצרים" },
  { value: "bySelect", label: "מוצרים שנבחרו" },
  { value: "none", label: "ללא" },
];

const ReplaceIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const PackageIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
  </svg>
);

function RuleSection({ icon, iconColor, title, hint, options, value, onChange, ariaLabel }) {
  return (
    <div className="optx-rule-section">
      <div className="optx-rule-row">
        <div className={`optx-rule-icon optx-rule-icon--${iconColor}`}>{icon}</div>
        <div className="optx-rule-text">
          <h3 className="optx-rule-title">{title}</h3>
          <p className="optx-rule-hint">{hint}</p>
        </div>
      </div>
      <div className="optx-segmented" role="tablist" aria-label={ariaLabel}>
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`optx-seg ${active ? "is-active" : ""}`}
              onClick={() => onChange(opt.value)}
              role="tab"
              aria-selected={active}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const ProductsGeneralSettings = () => {
  const { canReplaceSettings, canRoundUpSettings } = useSettings();
  const {
    changeCanReplaceSettings,
    changeCanRoundUpSettings,
    changeCanReplaceAll,
    changeCanRoundUpAll,
  } = useSettingsOperations();

  const handleReplace = (value) => {
    changeCanReplaceSettings(value);
    if (value === "all") changeCanReplaceAll(true);
    if (value === "none") changeCanReplaceAll(false);
  };

  const handleRoundUp = (value) => {
    changeCanRoundUpSettings(value);
    if (value === "all") changeCanRoundUpAll(true);
    if (value === "none") changeCanRoundUpAll(false);
  };

  return (
    <section className="optx-rules-card">
      <RuleSection
        icon={<ReplaceIcon />}
        iconColor="green"
        title="החלפת מוצרים"
        hint="מצא חלופה משתלמת — גם אם המוצר זמין"
        options={REPLACE_OPTIONS}
        value={canReplaceSettings}
        onChange={handleReplace}
        ariaLabel="החלפת מוצרים"
      />

      <div className="optx-rules-divider" />

      <RuleSection
        icon={<PackageIcon />}
        iconColor="amber"
        title="עיגול כמות במבצע"
        hint='הוסף יחידות אם משתלם (3 ב-25 ₪)'
        options={ROUND_UP_OPTIONS}
        value={canRoundUpSettings}
        onChange={handleRoundUp}
        ariaLabel="עיגול כמות במבצע"
      />
    </section>
  );
};

export default ProductsGeneralSettings;
