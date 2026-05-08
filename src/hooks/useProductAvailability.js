import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  getAvailabilityMeta,
  getSupermarketsForBarcodes,
} from "../services/productAvailabilityService";

/**
 * Fetches the supermarket IDs that carry ALL the given barcodes.
 * Memoises by the sorted+joined barcode key so re-renders that
 * hand in the same set don't refetch.
 *
 * @param {string[]} barcodes
 */
export const useEligibleSupermarkets = (barcodes) => {
  const key = useMemo(
    () =>
      Array.isArray(barcodes) && barcodes.length
        ? [...barcodes].sort().join("|")
        : "",
    [barcodes]
  );

  const [state, setState] = useState({
    eligibleIDs: null,
    missingBarcodes: [],
    isLoading: false,
    error: null,
  });

  const lastFetchedKeyRef = useRef("");

  const refetch = useCallback(async () => {
    if (!key) {
      setState({
        eligibleIDs: null,
        missingBarcodes: [],
        isLoading: false,
        error: null,
      });
      return;
    }
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const { supermarketIDs, missingBarcodes } =
        await getSupermarketsForBarcodes(key.split("|"));
      lastFetchedKeyRef.current = key;
      setState({
        eligibleIDs: supermarketIDs,
        missingBarcodes,
        isLoading: false,
        error: null,
      });
    } catch (err) {
      setState({
        eligibleIDs: null,
        missingBarcodes: [],
        isLoading: false,
        error: err,
      });
    }
  }, [key]);

  useEffect(() => {
    if (key && lastFetchedKeyRef.current !== key) refetch();
    if (!key) {
      lastFetchedKeyRef.current = "";
      setState({
        eligibleIDs: null,
        missingBarcodes: [],
        isLoading: false,
        error: null,
      });
    }
  }, [key, refetch]);

  return { ...state, refetch };
};

/**
 * Returns the index meta (last updated, total indexed barcodes) and a
 * refetch helper for use after the rebuild button finishes.
 */
export const useAvailabilityMeta = () => {
  const [meta, setMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const m = await getAvailabilityMeta();
      setMeta(m);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { meta, isLoading, error, refetch };
};
