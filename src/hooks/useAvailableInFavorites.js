import { useEffect, useMemo, useRef, useState } from "react";
import { getAvailabilityPerBarcode } from "../services/productAvailabilityService";
import { useSupermarketPreferences } from "../context/SupermarketPreferencesContext";

/**
 * "הצג רק מוצרים הקיימים בכל הסניפים המועדפים" mode.
 *
 * When the preferences mode is ON *and* the user picked favorites, this filters
 * `products` down to only those carried by EVERY favorite supermarket. Otherwise
 * it returns `products` unchanged.
 *
 * Reuses the existing availability mechanism (the same the cart's
 * "switch supermarket" uses): `getAvailabilityPerBarcode(barcodes)` returns, per
 * barcode, the supermarket IDs that carry it. A product qualifies when that list
 * contains ALL of the favorite IDs.
 *
 * Availability is fetched only for barcodes not requested yet and merged into a
 * cumulative map, so browsing categories fetches each product at most once and
 * revisits are instant. The fetch is keyed ONLY on the visible barcode set (not
 * on in-flight/loaded state) so it can never cancel itself mid-request.
 *
 * @param {Array} products  the already category/subcategory-filtered products
 * @returns {{ products: Array, isLoading: boolean, active: boolean }}
 */
export default function useAvailableInFavorites(products) {
  const { preferredSupermarketIDs, availableInAllMode } =
    useSupermarketPreferences();

  const favIds = useMemo(
    () => (preferredSupermarketIDs || []).map(String),
    [preferredSupermarketIDs]
  );
  const active = availableInAllMode && favIds.length > 0;

  // cumulative map: barcode(str) → string[] of supermarket IDs carrying it
  const [availMap, setAvailMap] = useState({});
  const availMapRef = useRef(availMap);
  availMapRef.current = availMap;
  const requestedRef = useRef(new Set()); // barcodes already requested (in-flight or done)
  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);

  const [pending, setPending] = useState(0); // # of in-flight requests

  // Stable string of the CURRENTLY VISIBLE barcodes. Depends only on the product
  // set — NOT on availMap/in-flight — so it stays constant while a fetch runs.
  const barcodesKey = useMemo(() => {
    if (!active) return "";
    const set = new Set();
    for (const p of products || []) {
      const bc = p && p.barcode != null ? String(p.barcode) : null;
      if (bc) set.add(bc);
    }
    return Array.from(set).sort().join(",");
  }, [active, products]);

  useEffect(() => {
    if (!active || !barcodesKey) return;
    const missing = barcodesKey
      .split(",")
      .filter((b) => !requestedRef.current.has(b));
    if (!missing.length) return;
    missing.forEach((b) => requestedRef.current.add(b));
    setPending((c) => c + 1);

    getAvailabilityPerBarcode(missing)
      .then((res) => {
        if (!mountedRef.current) return;
        const avail = (res && res.availability) || {};
        setAvailMap((prev) => {
          const next = { ...prev };
          for (const b of missing) next[b] = (avail[b] || []).map(String);
          return next;
        });
      })
      .catch(() => {
        if (!mountedRef.current) return;
        // Record as "none" so we neither retry-loop nor keep them hidden as
        // "unknown". A page reload re-attempts.
        setAvailMap((prev) => {
          const next = { ...prev };
          for (const b of missing) if (!(b in next)) next[b] = [];
          return next;
        });
      })
      .finally(() => {
        if (mountedRef.current) setPending((c) => Math.max(0, c - 1));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, barcodesKey]);

  const filtered = useMemo(() => {
    if (!active) return products || [];
    return (products || []).filter((p) => {
      const bc = p && p.barcode != null ? String(p.barcode) : null;
      if (!bc) return false;
      const stores = availMap[bc];
      if (!stores || !stores.length) return false; // unknown/none → hide
      const set = new Set(stores);
      return favIds.every((id) => set.has(id));
    });
  }, [active, products, availMap, favIds]);

  return { products: filtered, isLoading: pending > 0, active };
}
