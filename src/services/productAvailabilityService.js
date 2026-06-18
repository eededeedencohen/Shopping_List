import httpClient from "../network/index";

const normalize = (data) =>
  typeof data === "string" ? JSON.parse(data) : data;

/**
 * Triggers the backend job that rebuilds the per-product
 * availability index from the prices collection.
 *
 * @returns {Promise<{ productCount: number, updatedAt: string }>}
 */
export const rebuildAvailabilityIndex = async () => {
  const res = await httpClient.post(
    "/product-availability/rebuild",
    JSON.stringify({}),
    { headers: { "Content-Type": "application/json" } }
  );
  const payload = normalize(res.data);
  return payload?.data || {};
};

/**
 * Given a list of barcodes, returns the supermarket IDs that carry
 * ALL of them. If any barcode is missing from the index, the array
 * is empty and `missingBarcodes` lists the offenders.
 *
 * @param {string[]} barcodes
 * @returns {Promise<{ supermarketIDs: string[], missingBarcodes: string[] }>}
 */
export const getSupermarketsForBarcodes = async (barcodes) => {
  const res = await httpClient.post(
    "/product-availability/supermarkets-for-barcodes",
    JSON.stringify({ barcodes: Array.isArray(barcodes) ? barcodes : [] }),
    { headers: { "Content-Type": "application/json" } }
  );
  const payload = normalize(res.data);
  return {
    supermarketIDs: payload?.data?.supermarketIDs || [],
    missingBarcodes: payload?.data?.missingBarcodes || [],
  };
};

/**
 * Per-barcode availability. Returns a map keyed by barcode with the
 * full list of supermarket IDs that carry each one — caller can
 * intersect with the user's selected supermarkets to get per-product
 * "available in N of your stores" counts.
 *
 * @param {string[]} barcodes
 * @returns {Promise<{ availability: Record<string, string[]> }>}
 */
export const getAvailabilityPerBarcode = async (barcodes) => {
  const res = await httpClient.post(
    "/product-availability/per-barcode",
    JSON.stringify({ barcodes: Array.isArray(barcodes) ? barcodes : [] }),
    { headers: { "Content-Type": "application/json" } }
  );
  const payload = normalize(res.data);
  return {
    availability: payload?.data?.availability || {},
  };
};

/**
 * Summary metadata for the Settings rebuild card —
 * how many barcodes are indexed, when it was last rebuilt.
 *
 * @returns {Promise<{ productCount: number, updatedAt: string|null }>}
 */
export const getAvailabilityMeta = async () => {
  const res = await httpClient.get("/product-availability/meta");
  const payload = normalize(res.data);
  return {
    productCount: payload?.data?.productCount ?? 0,
    updatedAt: payload?.data?.updatedAt || null,
  };
};
