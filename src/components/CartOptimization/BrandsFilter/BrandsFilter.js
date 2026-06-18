import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import ModalV1 from "../../Modal/ModalV1";
import "./BrandsFilter.css";
import { useBrands } from "../../../hooks/optimizationHooks";
import { useProductList } from "../../../hooks/appHooks";
import { DOMAIN } from "../../../constants";
import BrandItem from "./BrandItem";
import filterIcon from "./filter.svg";

const BrandsFilter = ({ generalName, barcode }) => {
  const { allBrands, isAllBrandsUploaded } = useBrands();
  const { products } = useProductList();
  const [isBrandsFilterOpen, setIsBrandsFilterOpen] = useState(false);

  /* Explicit AlternativeProducts mapping — when populated for this barcode,
     the brand list should reflect the brands of THOSE products, not the
     generalName cluster. Matches the rule used by the rest of the app. */
  const [explicitAlternatives, setExplicitAlternatives] = useState(null);

  useEffect(() => {
    if (!barcode) {
      setExplicitAlternatives(null);
      return undefined;
    }
    let cancelled = false;
    setExplicitAlternatives(null);
    (async () => {
      try {
        const res = await axios.get(
          `${DOMAIN}/api/v1/alternative-products/${encodeURIComponent(barcode)}`,
        );
        if (cancelled) return;
        const doc = res?.data?.data?.alternativeProduct;
        if (doc && Array.isArray(doc.alternatives) && doc.alternatives.length) {
          setExplicitAlternatives(doc.alternatives.map(String));
        } else {
          setExplicitAlternatives([]);
        }
      } catch {
        if (!cancelled) setExplicitAlternatives([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [barcode]);

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

  const toggleBrandsFilter = () => setIsBrandsFilterOpen(!isBrandsFilterOpen);

  if (!isAllBrandsUploaded) {
    return (
      <div className="brands-filters">
        <button onClick={toggleBrandsFilter}>Filter Brands</button>
        <ModalV1 isOpen={isBrandsFilterOpen} onClose={toggleBrandsFilter}>
          <div>
            <h1>Loading Data...</h1>
          </div>
        </ModalV1>
      </div>
    );
  }

  return (
    <div className="brands-filters">
      <div className="open-brands-filters-modal" onClick={toggleBrandsFilter}>
        <div className="brands-filters-icon">
          <img src={filterIcon} alt="filter" />
        </div>
        <div className="brands-filters-label">סינון מותגים</div>
      </div>
      <ModalV1 isOpen={isBrandsFilterOpen} onClose={toggleBrandsFilter}>
        <div className="brand-filter">
          {brandsToShow.length === 0 ? (
            <div className="brand-filter__empty">אין מותגים זמינים</div>
          ) : (
            brandsToShow.map((brand) => (
              <BrandItem brand={brand} barcode={barcode} key={brand} />
            ))
          )}
        </div>
      </ModalV1>
    </div>
  );
};

export default BrandsFilter;
