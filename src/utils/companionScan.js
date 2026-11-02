/**
 * The store companion's scan engine (pure functions, no React).
 *
 * Every product that enters the cart while "ליווי בסופר" is on passes
 * through `scanLine`, which answers three questions against the prices of
 * the CURRENT store (all of them are already in memory):
 *
 *   1. missing  - the product is not sold here at all. The cheapest
 *                 alternative that IS sold here is offered instead.
 *   2. swap     - a cheaper product of the same generalName exists here
 *                 (same unit family, weight within ±50%, like the optimizer).
 *                 Compared PER UNIT (per 100g / 100ml / per item) on the
 *                 quantity that is in the basket, deals included.
 *   3. roundup  - the product has an "N for ₪X" deal and the quantity is not
 *                 a multiple of N: a few more units complete the deal and
 *                 cost less than their regular price.
 *
 * Nothing here is clever on purpose: the numbers it reports are the ones
 * the cart will really show afterwards (calculateTotalPrice is the same
 * function the cart uses).
 */
import { calculateTotalPrice } from "./priceCalculations";
import { unitPrice } from "./optimizeCart";

/* never ask the shopper to take more than this many extra units */
export const ROUNDUP_MAX_EXTRA = 3;
/* a swap is worth a nudge only when it saves at least this much, on the
   quantity in the cart, AND at least this share of the unit price */
export const SWAP_MIN_SAVING = 1;
export const SWAP_MIN_RATIO = 0.08;
/* alternatives may be this much lighter/heavier than the original */
export const WEIGHT_WINDOW = 0.5;

const r2 = (n) => Math.round(n * 100) / 100;
const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

/* base quantity of goods a cart line holds: items, or grams / millilitres */
const baseQuantity = (product, amount) => {
  const uw = String(product.unitWeight || "");
  const w = num(product.weight);
  if (uw === "u" || uw === "t" || !w) return amount;
  const inBase = uw === "kg" || uw === "l" ? w * 1000 : w;
  return amount * inBase;
};

/** Suggestion id - stable per (kind, product, target) so repeats dedupe. */
export const suggestionId = (s) =>
  `${s.kind}:${s.barcode}:${s.kind === "roundup" ? s.target : s.alt ? s.alt.barcode : "-"}`;

/**
 * "N for ₪X" completion. Returns null when the line already sits on a
 * multiple of N, when the deal is not actually cheaper, or when completing
 * it would take more than ROUNDUP_MAX_EXTRA extra units.
 */
export function buildRoundUp(product, amount, priceDoc) {
  if (!product || !priceDoc || !priceDoc.hasDiscount || !priceDoc.discount) return null;
  const units = Math.round(num(priceDoc.discount.units));
  if (units < 2 || amount <= 0) return null;
  if (amount % units === 0) return null;
  const target = Math.ceil(amount / units) * units;
  const extra = target - amount;
  if (extra > ROUNDUP_MAX_EXTRA) return null;
  const lineNow = calculateTotalPrice(amount, priceDoc);
  const lineTarget = calculateTotalPrice(target, priceDoc);
  const marginal = lineTarget - lineNow; // what the extra units really cost
  const regularExtra = extra * num(priceDoc.price);
  const saving = regularExtra - marginal;
  if (saving < 0.05) return null;
  return {
    kind: "roundup",
    barcode: product.barcode,
    product,
    amount,
    target,
    extra,
    units,
    dealTotal: num(priceDoc.discount.totalPrice),
    perUnitInDeal: num(priceDoc.discount.priceForUnit),
    regularPrice: num(priceDoc.price),
    marginal: r2(marginal),
    regularExtra: r2(regularExtra),
    lineNow: r2(lineNow),
    lineTarget: r2(lineTarget),
    saving: r2(saving),
  };
}

/**
 * The cheapest comparable product (same generalName) sold at this store.
 * `priceDoc` may be null (the original is not sold here) - then every
 * candidate qualifies and the saving is reported as null.
 */
export function findAlternative(product, amount, priceDoc, products, pricesMap) {
  if (!product || !products || !pricesMap) return null;
  const general = String(product.generalName || "").trim();
  if (!general) return null;
  const qty = amount > 0 ? amount : 1;
  const myWeight = num(product.weight);
  const family = unitPrice(1, 1, product.unitWeight, product.weight).family;
  const myLine = priceDoc ? calculateTotalPrice(qty, priceDoc) : null;
  const myUnit = priceDoc ? unitPrice(myLine, qty, product.unitWeight, product.weight) : null;
  const minW = myWeight * (1 - WEIGHT_WINDOW);
  const maxW = myWeight * (1 + WEIGHT_WINDOW);

  let best = null;
  for (const p of products) {
    if (!p || p.barcode === product.barcode) continue;
    if (String(p.generalName || "").trim() !== general) continue;
    const pd = pricesMap[p.barcode];
    if (!pd || !(num(pd.price) > 0)) continue;
    const pw = num(p.weight);
    if (family !== "u" && myWeight > 0 && (pw < minW - 1e-6 || pw > maxW + 1e-6)) continue;
    const line = calculateTotalPrice(qty, pd);
    const unit = unitPrice(line, qty, p.unitWeight, p.weight);
    if (unit.family !== family) continue;
    const cand = {
      alt: p,
      altPrice: pd,
      altLine: r2(line),
      altUnit: unit,
      sameBrand: !!product.brand && p.brand === product.brand,
      weightGap: Math.abs(pw - myWeight),
    };
    if (
      !best ||
      unit.value < best.altUnit.value - 1e-9 ||
      (Math.abs(unit.value - best.altUnit.value) < 1e-9 &&
        (cand.sameBrand > best.sameBrand || (cand.sameBrand === best.sameBrand && cand.weightGap < best.weightGap)))
    ) {
      best = cand;
    }
  }
  if (!best) return null;

  let saving = null;
  let ratio = null;
  if (myUnit) {
    ratio = myUnit.value > 0 ? (myUnit.value - best.altUnit.value) / myUnit.value : 0;
    // what the SAME quantity of goods would cost less (per item when the
    // family is "u", per 100g/100ml otherwise - so a 500g vs 400g pack is
    // compared fairly)
    const base = baseQuantity(product, qty);
    saving = family === "u" ? myLine - best.altLine : ((myUnit.value - best.altUnit.value) * base) / 100;
    saving = r2(saving);
  }
  return {
    ...best,
    myPrice: priceDoc || null,
    myLine: myLine == null ? null : r2(myLine),
    myUnit,
    saving,
    ratio,
    sameWeight: Math.abs(num(best.alt.weight) - myWeight) < 1e-6 && best.alt.unitWeight === product.unitWeight,
  };
}

/**
 * Scan one cart line. Returns the suggestions for it, best saving first
 * (an empty array = "good price, nothing to do").
 *   prefs: { swaps?: boolean, roundups?: boolean }
 */
export function scanLine({ product, amount, priceDoc, products, pricesMap, prefs = {} }) {
  if (!product || !(amount > 0)) return [];
  const swapsOn = prefs.swaps !== false;
  const roundupsOn = prefs.roundups !== false;

  if (!priceDoc) {
    const alt = swapsOn ? findAlternative(product, amount, null, products, pricesMap) : null;
    return [
      {
        kind: "missing",
        barcode: product.barcode,
        product,
        amount,
        alt: alt ? alt.alt : null,
        altPrice: alt ? alt.altPrice : null,
        altLine: alt ? alt.altLine : null,
        altUnit: alt ? alt.altUnit : null,
        saving: null,
      },
    ];
  }

  const out = [];
  if (swapsOn) {
    const a = findAlternative(product, amount, priceDoc, products, pricesMap);
    if (a && a.saving != null && a.saving >= SWAP_MIN_SAVING && a.ratio >= SWAP_MIN_RATIO) {
      out.push({ kind: "swap", barcode: product.barcode, product, amount, ...a });
    }
  }
  if (roundupsOn) {
    const r = buildRoundUp(product, amount, priceDoc);
    if (r) out.push(r);
  }
  out.sort((x, y) => (y.saving || 0) - (x.saving || 0));
  return out;
}

/** Scan every line of the cart (used when the companion starts and for the
 *  "open suggestions" list in the companion sheet). */
export function scanCart({ cartProducts, productMap, pricesMap, products, prefs }) {
  const out = [];
  for (const line of cartProducts || []) {
    const product = productMap[line.barcode];
    if (!product) continue;
    const found = scanLine({
      product,
      amount: line.amount,
      priceDoc: pricesMap[line.barcode] || null,
      products,
      pricesMap,
      prefs,
    });
    out.push(...found);
  }
  out.sort((x, y) => (y.saving || 0) - (x.saving || 0));
  return out;
}

/** The lines whose quantity grew between two cart snapshots (new lines
 *  included) - the ones the companion scans. */
export function diffIncreases(prevLines, nextLines) {
  const prev = new Map((prevLines || []).map((p) => [p.barcode, num(p.amount)]));
  const out = [];
  for (const line of nextLines || []) {
    const before = prev.get(line.barcode) || 0;
    const after = num(line.amount);
    if (after > before) out.push({ barcode: line.barcode, amount: after, before });
  }
  return out;
}

export const formatNis = (n) => `₪${(Math.round(num(n) * 100) / 100).toFixed(2)}`;
