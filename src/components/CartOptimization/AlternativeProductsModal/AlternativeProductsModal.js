import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import axios from "axios";
import { useProductList, usePriceMap } from "../../../hooks/appHooks";
import { useSettings, useSupermarkets } from "../../../hooks/optimizationHooks";
import { getAvailabilityPerBarcode } from "../../../services/productAvailabilityService";
import { ProductImageDisplay } from "../../Images/ProductImageService";
import { DOMAIN } from "../../../constants";
import {
  formatProductWeight,
} from "../WeightAccuracyHelpers";
import useBodyScrollLock from "../../../hooks/useBodyScrollLock";
import "./AlternativeProductsModal.css";

/**
 * Modal that lists the products that currently satisfy the product's
 * "alternative product" settings — same group(s), weight in range,
 * brand not blacklisted.
 *
 * Props:
 *   isOpen          : bool
 *   onClose         : fn
 *   barcode         : string  — the source product whose settings drive the filter
 *   productDetails  : { name, brand, weight, unitWeight, generalName }
 *   productSettings : { maxWeightGain, maxWeightLoss, blackListBrands }
 */
export default function AlternativeProductsModal({
  isOpen,
  onClose,
  barcode,
  productDetails,
  productSettings,
}) {
  useBodyScrollLock(isOpen);
  const { products } = useProductList();
  const { pricesMap } = usePriceMap();
  const { supermarketIDs: selectedSupermarketIDs } = useSettings();
  const { allSupermarkets } = useSupermarkets();
  /* breakdown sub-modal: clicking the X/N "סופרים" chip drills into the
     per-store yes/no list. */
  const [isStoresBreakdownOpen, setIsStoresBreakdownOpen] = useState(false);

  /* per-barcode "available in N of your stores" — fetched lazily for the
     barcodes currently visible in the modal. */
  const [availabilityCounts, setAvailabilityCounts] = useState({});
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  /* set of selected-supermarket IDs that carry AT LEAST one match. */
  const [supermarketsWithAnyMatch, setSupermarketsWithAnyMatch] = useState(
    () => new Set()
  );

  /* Explicit AlternativeProducts mapping for the source barcode. When the
     map has an entry, those barcodes win over generalName matching. */
  const [explicitAlternatives, setExplicitAlternatives] = useState(null);
  /* null = not loaded yet, undefined = no entry, array = the alternatives list */

  useEffect(() => {
    if (!isOpen || !barcode) return undefined;
    let cancelled = false;
    setExplicitAlternatives(null);
    (async () => {
      try {
        const res = await axios.get(
          `${DOMAIN}/api/v1/alternative-products/${encodeURIComponent(barcode)}`
        );
        if (cancelled) return;
        const doc = res?.data?.data?.alternativeProduct;
        if (doc && Array.isArray(doc.alternatives) && doc.alternatives.length) {
          setExplicitAlternatives(doc.alternatives.map(String));
        } else {
          setExplicitAlternatives(undefined); // explicit "no entry"
        }
      } catch {
        if (!cancelled) setExplicitAlternatives(undefined);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, barcode]);

  const matches = useMemo(() => {
    if (!products?.length || !productDetails) return [];

    /* Two-tier candidate selection:
       1) AlternativeProducts mapping for the source barcode — wins when set.
       2) Fallback — products with the same generalName as the source.
       This mirrors the backend resolveAlternativeBarcodes rule so what you
       see here matches what the optimizer would pick. */
    const hasExplicit =
      Array.isArray(explicitAlternatives) && explicitAlternatives.length > 0;
    const explicitSet = hasExplicit
      ? new Set(explicitAlternatives)
      : null;
    const targetGeneral = (productDetails.generalName || "").trim();
    if (!hasExplicit && !targetGeneral) return [];

    /* Source product weight, normalized to base unit (g / ml). */
    const baseWeight = formatProductWeight(
      productDetails.weight,
      productDetails.unitWeight,
    );
    const maxGain = productSettings?.maxWeightGain ?? 0;
    const maxLoss = productSettings?.maxWeightLoss ?? 0;
    const minAllowed = baseWeight - formatProductWeight(maxLoss, productDetails.unitWeight);
    const maxAllowed = baseWeight + formatProductWeight(maxGain, productDetails.unitWeight);

    const blackList = new Set(productSettings?.blackListBrands || []);

    const out = [];
    for (const p of products) {
      if (p.barcode === barcode) continue;
      if (hasExplicit) {
        if (!explicitSet.has(String(p.barcode))) continue;
      } else if ((p.generalName || "").trim() !== targetGeneral) {
        continue;
      }
      if (blackList.has(p.brand)) continue;
      const pWeight = formatProductWeight(p.weight, p.unitWeight);
      if (pWeight < minAllowed - 0.0001 || pWeight > maxAllowed + 0.0001) continue;
      out.push({
        ...p,
        unitPrice: pricesMap?.[p.barcode]?.price ?? null,
      });
    }

    /* sort by price ascending (unknown prices to the bottom) */
    out.sort((a, b) => {
      if (a.unitPrice == null && b.unitPrice == null) return 0;
      if (a.unitPrice == null) return 1;
      if (b.unitPrice == null) return -1;
      return a.unitPrice - b.unitPrice;
    });
    return out;
  }, [products, productDetails, productSettings, barcode, pricesMap, explicitAlternatives]);

  /* Fetch per-barcode availability once the modal is open and we know the
     matched candidates. Re-runs if the matched set changes. */
  useEffect(() => {
    if (!isOpen) return;
    const barcodes = matches.map((m) => m.barcode);
    if (!barcodes.length) {
      setAvailabilityCounts({});
      setSupermarketsWithAnyMatch(new Set());
      return;
    }
    let cancelled = false;
    setIsLoadingAvailability(true);
    const selectedSet = new Set(
      (selectedSupermarketIDs || []).map((id) => String(id))
    );
    (async () => {
      try {
        const { availability } = await getAvailabilityPerBarcode(barcodes);
        if (cancelled) return;
        const counts = {};
        /* Union of supermarkets (filtered by user's selection) that carry
           AT LEAST one of the matched alternatives. */
        const unionStores = new Set();
        for (const bc of barcodes) {
          const list = availability[bc] || [];
          if (!selectedSet.size) {
            counts[bc] = list.length; // no filter selected → show total
            for (const sid of list) unionStores.add(String(sid));
          } else {
            let n = 0;
            for (const sid of list) {
              const s = String(sid);
              if (selectedSet.has(s)) {
                n += 1;
                unionStores.add(s);
              }
            }
            counts[bc] = n;
          }
        }
        setAvailabilityCounts(counts);
        setSupermarketsWithAnyMatch(unionStores);
      } catch {
        if (!cancelled) {
          setAvailabilityCounts({});
          setSupermarketsWithAnyMatch(new Set());
        }
      } finally {
        if (!cancelled) setIsLoadingAvailability(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isOpen, matches, selectedSupermarketIDs]);

  const totalSelectedSupermarkets = (selectedSupermarketIDs || []).length;

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("apm-overlay")) onClose();
  };

  const unitLabel = (u) => {
    if (u === "g") return "גרם";
    if (u === "kg") return 'ק"ג';
    if (u === "ml") return 'מ"ל';
    if (u === "l") return "ליטר";
    return u || "";
  };

  const portal = (
    <div className="apm-overlay" onClick={handleOverlayClick}>
      <div className="apm-window" role="dialog" aria-labelledby="apm-title">
        <header className="apm-header">
          <div>
            <h2 id="apm-title" className="apm-title">מוצרים חלופיים תואמים</h2>
            <p className="apm-subtitle">
              לפי ההגדרות של <strong>{productDetails?.name || barcode}</strong>
            </p>
          </div>
          <button
            type="button"
            className="apm-close"
            onClick={onClose}
            aria-label="סגור"
          >
            ×
          </button>
        </header>

        <div className="apm-summary">
          <span className="apm-summary-stat">
            <span className="apm-summary-num">{matches.length}</span>
            <span className="apm-summary-label">תואמים</span>
          </span>

          {totalSelectedSupermarkets > 0 && (
            <button
              type="button"
              className="apm-summary-stat apm-summary-stat--stores"
              title="בכמה מהסופרים שבחרת קיים לפחות מוצר חלופי אחד — לחץ לפירוט"
              onClick={() => setIsStoresBreakdownOpen(true)}
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
                <path d="M3 9h18l-2 11H5L3 9z" />
                <path d="M8 9V5a4 4 0 0 1 8 0v4" />
              </svg>
              <span className="apm-summary-num">
                {supermarketsWithAnyMatch.size}
              </span>
              <span className="apm-summary-divider">/</span>
              <span className="apm-summary-num apm-summary-num--total">
                {totalSelectedSupermarkets}
              </span>
              <span className="apm-summary-label">סופרים</span>
              <svg
                className="apm-summary-stat__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          )}

          <span className="apm-summary-tags">
            {Array.isArray(explicitAlternatives) && explicitAlternatives.length > 0 ? (
              <span
                className="apm-tag apm-tag--explicit"
                title={`רשימת חלופות מפורשת עבור הברקוד (${explicitAlternatives.length} ברקודים)`}
              >
                חלופות מפורשות · {explicitAlternatives.length}
              </span>
            ) : productDetails?.generalName ? (
              <span className="apm-tag" title="שם כללי — מוצרים עם שם כללי זהה ייחשבו כחלופיים">
                {productDetails.generalName}
              </span>
            ) : null}
          </span>
        </div>

        <div className="apm-body">
          {matches.length === 0 ? (
            <div className="apm-empty">
              <div className="apm-empty-icon">¯\_(ツ)_/¯</div>
              <p>
                לא נמצאו מוצרים שעומדים בהגדרות הנוכחיות.
                <br />
                נסה להרחיב את טווח המשקל או לבטל סינון מותגים.
              </p>
            </div>
          ) : (
            <ul className="apm-list">
              {matches.map((p) => {
                const count = availabilityCounts[p.barcode];
                const showAvail = !isLoadingAvailability && count != null;
                const cls =
                  count === 0
                    ? "apm-avail apm-avail--zero"
                    : count >= Math.max(1, Math.ceil(totalSelectedSupermarkets / 2))
                    ? "apm-avail apm-avail--high"
                    : "apm-avail apm-avail--low";
                return (
                  <li key={p.barcode} className="apm-item">
                    <div className="apm-img">
                      <ProductImageDisplay barcode={p.barcode} alt={p.name} />
                    </div>
                    <div className="apm-meta">
                      <div className="apm-name">{p.name}</div>
                      <div className="apm-row-small">
                        <span className="apm-brand">{p.brand || "—"}</span>
                        <span className="apm-sep">·</span>
                        <span className="apm-weight">
                          {p.weight} {unitLabel(p.unitWeight)}
                        </span>
                      </div>
                      {showAvail && (
                        <span
                          className={cls}
                          title={
                            totalSelectedSupermarkets
                              ? `קיים ב-${count} מתוך ${totalSelectedSupermarkets} סופרים שבחרת`
                              : `קיים ב-${count} סופרים`
                          }
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
                            <path d="M3 9h18l-2 11H5L3 9z" />
                            <path d="M8 9V5a4 4 0 0 1 8 0v4" />
                          </svg>
                          <span className="apm-avail-num">{count}</span>
                          {totalSelectedSupermarkets > 0 && (
                            <span className="apm-avail-total">
                              / {totalSelectedSupermarkets}
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                    <div className="apm-price">
                      {p.unitPrice != null ? (
                        <>
                          <span className="apm-price-num">{p.unitPrice.toFixed(2)}</span>
                          <span className="apm-price-cur">₪</span>
                        </>
                      ) : (
                        <span className="apm-price-missing">—</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {isStoresBreakdownOpen && (
        <StoresBreakdownModal
          allSupermarkets={allSupermarkets}
          selectedSupermarketIDs={selectedSupermarketIDs}
          supermarketsWithAnyMatch={supermarketsWithAnyMatch}
          onClose={() => setIsStoresBreakdownOpen(false)}
        />
      )}
    </div>
  );

  const root = document.getElementById("modal-root") || document.body;
  return ReactDOM.createPortal(portal, root);
}

/* ─────────  Sub-modal — per-store yes/no breakdown  ───────── */

function StoresBreakdownModal({
  allSupermarkets,
  selectedSupermarketIDs,
  supermarketsWithAnyMatch,
  onClose,
}) {
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains("apm-stores-overlay")) onClose();
  };

  const selectedSet = new Set(
    (selectedSupermarketIDs || []).map((id) => String(id))
  );
  const matchSet = supermarketsWithAnyMatch || new Set();

  const selectedStores = (allSupermarkets || []).filter((s) =>
    selectedSet.has(String(s.supermarketID))
  );

  const withMatch = [];
  const withoutMatch = [];
  for (const s of selectedStores) {
    if (matchSet.has(String(s.supermarketID))) withMatch.push(s);
    else withoutMatch.push(s);
  }
  /* If user has selected stores that aren't even in `allSupermarkets`,
     show their raw IDs in the "without" list so they aren't invisible. */
  const knownIDs = new Set(
    (allSupermarkets || []).map((s) => String(s.supermarketID))
  );
  for (const sid of selectedSet) {
    if (!knownIDs.has(sid)) {
      withoutMatch.push({ supermarketID: sid, name: `סופר #${sid}`, address: "", city: "" });
    }
  }

  withMatch.sort((a, b) => a.name.localeCompare(b.name, "he"));
  withoutMatch.sort((a, b) => a.name.localeCompare(b.name, "he"));

  return (
    <div
      className="apm-stores-overlay"
      role="dialog"
      aria-label="פירוט סופרים — קיים / לא קיים"
      onClick={handleOverlayClick}
    >
      <div className="apm-stores-window">
        <header className="apm-stores-header">
          <div>
            <h3 className="apm-stores-title">פירוט סופרים</h3>
            <p className="apm-stores-subtitle">
              {withMatch.length} מתוך {withMatch.length + withoutMatch.length} סופרים שבחרת מחזיקים לפחות מוצר חלופי אחד
            </p>
          </div>
          <button
            type="button"
            className="apm-stores-close"
            onClick={onClose}
            aria-label="סגור"
          >
            ×
          </button>
        </header>

        <section className="apm-stores-section apm-stores-section--yes">
          <header className="apm-stores-section-head">
            <span className="apm-stores-section-icon">✓</span>
            <span className="apm-stores-section-title">קיים בהם חלופי</span>
            <span className="apm-stores-section-count">{withMatch.length}</span>
          </header>
          {withMatch.length === 0 ? (
            <p className="apm-stores-empty">אין סופרים מהבחירה שלך שמחזיקים חלופי</p>
          ) : (
            <ul className="apm-stores-list">
              {withMatch.map((s) => (
                <li key={s.supermarketID} className="apm-stores-row apm-stores-row--yes">
                  <span className="apm-stores-row-name">{s.name}</span>
                  {(s.address || s.city) && (
                    <span className="apm-stores-row-addr">
                      {[s.address, s.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="apm-stores-section apm-stores-section--no">
          <header className="apm-stores-section-head">
            <span className="apm-stores-section-icon">✕</span>
            <span className="apm-stores-section-title">אין בהם חלופי</span>
            <span className="apm-stores-section-count">{withoutMatch.length}</span>
          </header>
          {withoutMatch.length === 0 ? (
            <p className="apm-stores-empty">כל הסופרים שבחרת מחזיקים לפחות חלופי אחד 🎉</p>
          ) : (
            <ul className="apm-stores-list">
              {withoutMatch.map((s) => (
                <li key={s.supermarketID} className="apm-stores-row apm-stores-row--no">
                  <span className="apm-stores-row-name">{s.name}</span>
                  {(s.address || s.city) && (
                    <span className="apm-stores-row-addr">
                      {[s.address, s.city].filter(Boolean).join(", ")}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
