import React, { useState } from "react";
import WeightAccuracy from "./WeightAccuracy";
import BottomSheet from "./BottomSheet/BottomSheet";
import BrandsSheet from "./BrandsFilter/BrandsSheet";
import ClassificationsSheet from "./ClassificationsFilter/ClassificationsSheet";
import AlternativeProductsModal from "./AlternativeProductsModal/AlternativeProductsModal";
import "./ProductSettings.css";
import {
  useSettingsOperations,
  useProductClassifications,
} from "../../hooks/optimizationHooks";
import { useMatchingAlternatives } from "../../hooks/alternativesHooks";
import { ProductImageDisplay } from "../Images/ProductImageService";
import { formatProductWeight } from "./WeightAccuracyHelpers";

/* One product = one accordion row.
   Collapsed — identity + status badges that answer "מה כבר הגדרתי?".
   Expanded — two toggles, three uniform summary rows (weight / tags /
   brands, each opening a bottom sheet) and a CTA with the live match count.
   All operations ride the exact same hooks as before — display layer only. */

const Chevron = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const unitLabel = (unit) => {
  if (unit === "g" || unit === "kg") return "גרם";
  if (unit === "ml" || unit === "l") return 'מ"ל';
  return unit || "";
};

function ToggleRow({ label, hint, checked, onChange }) {
  return (
    <label className={`ps-toggle ${checked ? "is-on" : ""}`}>
      <span className="ps-toggle-text">
        <span className="ps-toggle-label">{label}</span>
        {hint && <span className="ps-toggle-hint">{hint}</span>}
      </span>
      <input
        type="checkbox"
        className="ps-toggle-input"
        checked={checked}
        onChange={onChange}
      />
      <span className="ps-toggle-track" aria-hidden="true">
        <span className="ps-toggle-thumb" />
      </span>
    </label>
  );
}

function SummaryRow({ icon, iconClass, label, value, isActive, onClick }) {
  return (
    <button type="button" className="ps-srow" onClick={onClick}>
      <span className={`ps-srow-ico ${iconClass}`}>{icon}</span>
      <span className="ps-srow-txt">
        <span className="ps-srow-label">{label}</span>
        <span className={`ps-srow-val${isActive ? " is-active" : ""}`}>{value}</span>
      </span>
      <span className="ps-srow-chev">
        <Chevron />
      </span>
    </button>
  );
}

/* summary text of the active classification rules, e.g.
   "אחוז שומן: 16–24 · סוג: רק בולגרית" */
function tagsSummary(rows, rules) {
  if (!rules || !rules.rows) return null;
  const parts = [];
  for (const row of rows) {
    const rule = rules.rows[row.name];
    if (!rule) continue;
    const greens = rule.green || [];
    const reds = rule.red || [];
    if (!greens.length && !reds.length) continue;
    if (row.kind === "מספרי" && greens.length) {
      const nums = greens.map(parseFloat).filter((x) => !Number.isNaN(x));
      if (nums.length) {
        const lo = Math.min(...nums);
        const hi = Math.max(...nums);
        parts.push(`${row.name}: ${lo}–${hi}`);
        continue;
      }
    }
    if (greens.length) parts.push(`${row.name}: רק ${greens.join(", ")}`);
    else parts.push(`${row.name}: בלי ${reds.join(", ")}`);
  }
  return parts.length ? parts.join(" · ") : null;
}

export default function ProductSettings({ product, isOpen, onToggle }) {
  const { changeCanRoundUp, changeCanReplace } = useSettingsOperations();
  const [openSheet, setOpenSheet] = useState(null); // 'weight' | 'tags' | 'brands'
  const [isAltModalOpen, setIsAltModalOpen] = useState(false);

  const { barcode, quantity, productDetails, productSettings } = product;
  const { family, familyDef } = useProductClassifications(barcode);
  const { matches, explicitAlternatives, isReady } = useMatchingAlternatives(
    barcode,
    productDetails,
    productSettings
  );

  const canReplace = productSettings.canReplace;
  const unit = unitLabel(productDetails.unitWeight);

  /* weight summary */
  const baseWeight = formatProductWeight(
    productDetails.weight,
    productDetails.unitWeight
  );
  const minW =
    baseWeight -
    formatProductWeight(productSettings.maxWeightLoss || 0, productDetails.unitWeight);
  const maxW =
    baseWeight +
    formatProductWeight(productSettings.maxWeightGain || 0, productDetails.unitWeight);
  const weightIsDefault = minW === baseWeight && maxW === baseWeight;
  const weightValue = weightIsDefault
    ? `משקל זהה בלבד · ${baseWeight} ${unit}`
    : `בין ${minW} ל־${maxW} ${unit}`;

  /* tags summary */
  const tagRows = ((familyDef && familyDef.types) || []).filter(
    (t) => t.name !== "מותג"
  );
  const hasTagRows = tagRows.length > 0;
  const tagsText = hasTagRows
    ? tagsSummary(tagRows, productSettings.classificationRules)
    : null;

  /* brands summary */
  const blackCount = (productSettings.blackListBrands || []).length;
  const brandsValue =
    blackCount > 0
      ? `${blackCount} ${blackCount === 1 ? "מותג מוחרג" : "מותגים מוחרגים"}`
      : "כל המותגים מותרים";

  /* status badges (collapsed head) */
  const filtersCount =
    (tagsText ? 1 : 0) + (blackCount > 0 ? 1 : 0) + (weightIsDefault ? 0 : 1);

  const hasWeightMeta =
    productDetails.weight !== undefined &&
    productDetails.weight !== "" &&
    productDetails.weight !== 0;

  return (
    <article className={`ps-card${isOpen ? " is-open" : ""}${canReplace ? "" : " is-muted"}`}>
      <div
        className="ps-head"
        onClick={onToggle}
        role="button"
        aria-expanded={isOpen}
      >
        <div className="ps-thumb">
          <ProductImageDisplay
            barcode={barcode}
            className="ps-thumb-img"
            alt={productDetails.name}
          />
          <span className="ps-thumb-qty">×{quantity}</span>
        </div>
        <div className="ps-head-info">
          <h3 className="ps-head-name">{productDetails.name}</h3>
          <p className="ps-head-meta">
            {hasWeightMeta && (
              <span>
                {baseWeight} {unit}
              </span>
            )}
            {productDetails.brand && <span>{productDetails.brand}</span>}
          </p>
          <div className="ps-badges">
            {canReplace ? (
              <>
                <span className="ps-badge ps-badge--on">החלפה</span>
                <span
                  className={`ps-badge ${filtersCount ? "ps-badge--filters" : "ps-badge--off"}`}
                >
                  {filtersCount === 0
                    ? "ללא סינון"
                    : filtersCount === 1
                    ? "סינון אחד"
                    : `${filtersCount} סינונים`}
                </span>
                {isReady && (
                  <span
                    className={`ps-badge ${matches.length ? "ps-badge--match" : "ps-badge--none"}`}
                  >
                    {matches.length} תואמים
                  </span>
                )}
              </>
            ) : (
              <span className="ps-badge ps-badge--off">ללא החלפה</span>
            )}
          </div>
        </div>
        <span className="ps-head-chev">
          <Chevron />
        </span>
      </div>

      {isOpen && (
        <div className="ps-body">
          <div className="ps-options">
            <ToggleRow
              label="עיגול כמות במבצע"
              hint="הוסף יחידות אם המבצע משתלם יותר"
              checked={productSettings.canRoundUp}
              onChange={() => changeCanRoundUp(barcode)}
            />
            <ToggleRow
              label="החלפה במוצר חלופי"
              hint="החלף במוצר זול ובמשקל דומה אם זמין"
              checked={canReplace}
              onChange={() => changeCanReplace(barcode)}
            />
          </div>

          {canReplace && (
            <>
              <div className="ps-srows">
                <SummaryRow
                  icon="⚖️"
                  iconClass="ps-srow-ico--w"
                  label="טווח משקל"
                  value={weightValue}
                  isActive={!weightIsDefault}
                  onClick={() => setOpenSheet("weight")}
                />
                {hasTagRows && (
                  <SummaryRow
                    icon="🏷️"
                    iconClass="ps-srow-ico--t"
                    label="סינון לפי תיוגים"
                    value={tagsText || "ללא סינון"}
                    isActive={!!tagsText}
                    onClick={() => setOpenSheet("tags")}
                  />
                )}
                <SummaryRow
                  icon="🔖"
                  iconClass="ps-srow-ico--b"
                  label="מותגים"
                  value={brandsValue}
                  isActive={blackCount > 0}
                  onClick={() => setOpenSheet("brands")}
                />
              </div>

              <button
                type="button"
                className="ps-cta"
                onClick={() => setIsAltModalOpen(true)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>הצג מוצרים תואמים</span>
                {isReady && <span className="ps-cta-count">{matches.length}</span>}
              </button>

              {/* ─── the three editing sheets ─── */}
              <BottomSheet
                isOpen={openSheet === "weight"}
                onClose={() => setOpenSheet(null)}
                title="טווח משקל למוצר חלופי"
                footer={
                  <>
                    <span
                      className={`bsheet-match${matches.length === 0 ? " is-zero" : ""}`}
                    >
                      <b>{matches.length}</b> מוצרים תואמים
                    </span>
                    <button
                      type="button"
                      className="bsheet-btn bsheet-btn--done"
                      onClick={() => setOpenSheet(null)}
                    >
                      סיום
                    </button>
                  </>
                }
              >
                <div className="ps-weight-sheet">
                  <WeightAccuracy
                    barcode={barcode}
                    productWeight={productDetails.weight}
                    productUnitWeight={productDetails.unitWeight}
                    currentWeightGain={productSettings.maxWeightGain}
                    currentWeightLoss={productSettings.maxWeightLoss}
                  />
                </div>
              </BottomSheet>

              {hasTagRows && (
                <ClassificationsSheet
                  isOpen={openSheet === "tags"}
                  onClose={() => setOpenSheet(null)}
                  barcode={barcode}
                  family={family}
                  familyDef={familyDef}
                  rules={productSettings.classificationRules}
                  matchCount={matches.length}
                />
              )}

              <BrandsSheet
                isOpen={openSheet === "brands"}
                onClose={() => setOpenSheet(null)}
                barcode={barcode}
                generalName={productDetails.generalName}
                explicitAlternatives={explicitAlternatives}
                matchCount={matches.length}
              />

              <AlternativeProductsModal
                isOpen={isAltModalOpen}
                onClose={() => setIsAltModalOpen(false)}
                barcode={barcode}
                productDetails={productDetails}
                matches={matches}
                explicitAlternatives={explicitAlternatives}
              />
            </>
          )}
        </div>
      )}
    </article>
  );
}
