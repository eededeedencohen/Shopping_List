import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DOMAIN } from "../constants";
import { useProductList, usePriceMap } from "./appHooks";
import {
  useClassificationsCtx,
  barcodePassesClassificationRules,
} from "../context/classificationsContext";
import { formatProductWeight } from "../components/CartOptimization/WeightAccuracyHelpers";

/* The alternative-products matching logic, extracted from
   AlternativeProductsModal so the SAME computation drives the live match
   counter on the settings card, the sheet footers and the modal list —
   one source of truth, no drift. */

/* Explicit AlternativeProducts mapping for a barcode.
   null = still loading · [] = no entry · [...] = the explicit list. */
export const useExplicitAlternatives = (barcode) => {
  const [list, setList] = useState(null);

  useEffect(() => {
    if (!barcode) {
      setList([]);
      return undefined;
    }
    let cancelled = false;
    setList(null);
    (async () => {
      try {
        const res = await axios.get(
          `${DOMAIN}/api/v1/alternative-products/${encodeURIComponent(barcode)}`
        );
        if (cancelled) return;
        const doc = res?.data?.data?.alternativeProduct;
        if (doc && Array.isArray(doc.alternatives) && doc.alternatives.length) {
          setList(doc.alternatives.map(String));
        } else {
          setList([]);
        }
      } catch {
        if (!cancelled) setList([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [barcode]);

  return list;
};

/* Products that currently satisfy the product's replacement settings —
   candidate group (explicit list or generalName), classification rules,
   brand blacklist and weight window — sorted by unit price ascending.
   Mirrors the backend resolveAlternativeBarcodes + filter pipeline. */
export const useMatchingAlternatives = (barcode, productDetails, productSettings) => {
  const { products } = useProductList();
  const { pricesMap } = usePriceMap();
  const { byBarcode: classificationsByBarcode } = useClassificationsCtx();
  const explicitAlternatives = useExplicitAlternatives(barcode);

  const matches = useMemo(() => {
    if (!products?.length || !productDetails) return [];

    const hasExplicit =
      Array.isArray(explicitAlternatives) && explicitAlternatives.length > 0;
    const explicitSet = hasExplicit ? new Set(explicitAlternatives) : null;
    const targetGeneral = (productDetails.generalName || "").trim();
    if (!hasExplicit && !targetGeneral) return [];

    const baseWeight = formatProductWeight(
      productDetails.weight,
      productDetails.unitWeight
    );
    const maxGain = productSettings?.maxWeightGain ?? 0;
    const maxLoss = productSettings?.maxWeightLoss ?? 0;
    const minAllowed =
      baseWeight - formatProductWeight(maxLoss, productDetails.unitWeight);
    const maxAllowed =
      baseWeight + formatProductWeight(maxGain, productDetails.unitWeight);

    const blackList = new Set(productSettings?.blackListBrands || []);
    const classificationRules = productSettings?.classificationRules || null;

    const out = [];
    for (const p of products) {
      if (p.barcode === barcode) continue;
      if (hasExplicit) {
        if (!explicitSet.has(String(p.barcode))) continue;
      } else if ((p.generalName || "").trim() !== targetGeneral) {
        continue;
      }
      if (
        !barcodePassesClassificationRules(
          p.barcode,
          classificationRules,
          classificationsByBarcode
        )
      )
        continue;
      if (blackList.has(p.brand)) continue;
      const pWeight = formatProductWeight(p.weight, p.unitWeight);
      if (pWeight < minAllowed - 0.0001 || pWeight > maxAllowed + 0.0001) continue;
      out.push({
        ...p,
        unitPrice: pricesMap?.[p.barcode]?.price ?? null,
      });
    }

    out.sort((a, b) => {
      if (a.unitPrice == null && b.unitPrice == null) return 0;
      if (a.unitPrice == null) return 1;
      if (b.unitPrice == null) return -1;
      return a.unitPrice - b.unitPrice;
    });
    return out;
  }, [
    products,
    productDetails,
    productSettings,
    barcode,
    pricesMap,
    explicitAlternatives,
    classificationsByBarcode,
  ]);

  return {
    matches,
    explicitAlternatives,
    isReady: explicitAlternatives !== null,
  };
};
