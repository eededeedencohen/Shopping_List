import { calculateTotalPrice } from "./priceCalculations";

/* Canonical math for the optimal-carts screens.
   EVERY savings figure in the flow comes from these formulas, computed over
   the products the store actually offers — never a partial cart compared
   against the full original total. */

/* fullCart.productsWithPrices → Map keyed by String(barcode):
   { product, amount, totalPrice } */
export const buildOriginalPriceMap = (fullCart) => {
  const map = new Map();
  (fullCart?.productsWithPrices || []).forEach((p) => {
    if (p?.product?.barcode != null) map.set(String(p.product.barcode), p);
  });
  return map;
};

/* Honest per-cart stats.
     total           — Σ existsProducts (always a re-sum, one formula)
     coveredOriginal — the ORIGINAL price of only the items this store has
     savings         — coveredOriginal − total (negative = pricier, shown, not hidden)
     coveredCount / missingCount / denominator — coverage figures; committed
       deletions shrink the denominator for THIS cart only. */
export const computeCartStats = (cart, originalMap, totalProducts) => {
  const exists = cart?.existsProducts || [];
  const missing = cart?.nonExistsProducts || [];
  const deletedCount = (cart?.deletedProducts || []).length;

  let total = 0;
  let coveredOriginal = 0;
  for (const p of exists) {
    total += p.totalPrice || 0;
    const orig = originalMap.get(String(p.oldBarcode));
    if (orig) coveredOriginal += orig.totalPrice || 0;
  }

  const coveredCount = exists.length;
  const missingCount = missing.length;
  const denominator = Math.max(0, (totalProducts || 0) - deletedCount);

  return {
    total,
    coveredOriginal,
    savings: coveredOriginal - total,
    coveredCount,
    missingCount,
    denominator,
    isFull: missingCount === 0,
  };
};

/* Deal-aware line total for a quantity at a store price object. */
export const computeRowTotal = (quantity, priceObj) =>
  calculateTotalPrice(quantity, priceObj);

/* Price per 100 base-units (g/ml) — null when it cannot be computed. */
export const pricePer100 = (totalPrice, quantity, weight, unitWeight) => {
  const w = unitWeight === "kg" || unitWeight === "l" ? weight * 1000 : weight;
  if (!w || !quantity) return null;
  return (100 * totalPrice) / (w * quantity);
};

export const per100UnitLabel = (unitWeight) => {
  if (unitWeight === "g" || unitWeight === "kg") return "גרם";
  if (unitWeight === "ml" || unitWeight === "l") return 'מ"ל';
  return "יח׳";
};

/* Display weight in base units (kg→גרם, l→מ"ל), e.g. 0.2 kg → "200 גרם". */
export const displayWeight = (weight, unitWeight) => {
  if (weight === undefined || weight === null || weight === "" || weight === 0)
    return null;
  const w = unitWeight === "kg" || unitWeight === "l" ? weight * 1000 : weight;
  return `${w} ${per100UnitLabel(unitWeight)}`;
};
