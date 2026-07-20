import React, { useMemo } from "react";
import "./BrandsSheet.css";
import BottomSheet from "../BottomSheet/BottomSheet";
import BrandItem from "./BrandItem";
import { useBrands } from "../../../hooks/optimizationHooks";
import { useProductList } from "../../../hooks/appHooks";

/* Brand allow/deny editor inside the shared bottom sheet. The brand list
   mirrors the candidate rule used everywhere else: when the product has an
   explicit AlternativeProducts list — the brands of THOSE products; otherwise
   the brands of its generalName cluster. */

export default function BrandsSheet({
  isOpen,
  onClose,
  barcode,
  generalName,
  explicitAlternatives,
  matchCount,
}) {
  const { allBrands, isAllBrandsUploaded } = useBrands();
  const { products } = useProductList();

  const brandsToShow = useMemo(() => {
    if (
      Array.isArray(explicitAlternatives) &&
      explicitAlternatives.length > 0 &&
      Array.isArray(products) &&
      products.length
    ) {
      const set = new Set(explicitAlternatives);
      const seen = new Set();
      for (const p of products) {
        if (set.has(String(p.barcode)) && p.brand) seen.add(p.brand);
      }
      return [...seen].sort((a, b) => a.localeCompare(b, "he"));
    }
    if (isAllBrandsUploaded && generalName && allBrands?.[generalName]) {
      return allBrands[generalName];
    }
    return [];
  }, [explicitAlternatives, products, allBrands, generalName, isAllBrandsUploaded]);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="סינון מותגים"
      footer={
        <>
          <span className={`bsheet-match${matchCount === 0 ? " is-zero" : ""}`}>
            <b>{matchCount}</b> מוצרים תואמים
          </span>
          <button type="button" className="bsheet-btn bsheet-btn--done" onClick={onClose}>
            סיום
          </button>
        </>
      }
    >
      {!isAllBrandsUploaded ? (
        <p className="brsheet-empty">טוען מותגים…</p>
      ) : brandsToShow.length === 0 ? (
        <p className="brsheet-empty">אין מותגים זמינים למוצר הזה</p>
      ) : (
        <div className="brsheet-list">
          {brandsToShow.map((brand) => (
            <BrandItem brand={brand} barcode={barcode} key={brand} />
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
