/* Shelf-navigation handoff: action #8 (מצא מוצר במדף) sets a target here,
   then navigates to /products with the right category+subcategory active.
   ProductsList picks the target up after render and scrolls to the first
   matching product card. A module-level store — no context re-render churn,
   and the target survives the route transition. */

let target = null; // { barcodes: Set<string>, ts: number }
const listeners = new Set();

const MAX_AGE_MS = 15000;

export const setShelfTarget = (barcodes) => {
  target = { barcodes: new Set((barcodes || []).map(String)), ts: Date.now() };
  /* notify a mounted ProductsList — covers the case where the user is
     ALREADY on the right subcategory, so no re-render would occur */
  listeners.forEach((fn) => fn());
};

export const onShelfTarget = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const peekShelfTarget = () => {
  if (target && Date.now() - target.ts > MAX_AGE_MS) target = null;
  return target;
};

export const consumeShelfTarget = () => {
  const t = peekShelfTarget();
  target = null;
  return t;
};
