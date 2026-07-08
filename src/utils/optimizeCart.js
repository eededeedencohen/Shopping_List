import { getOptimalSupermarketCartsV2 } from "../network/cart-optimizationService";

/**
 * Honest normalized unit price so a round-up-for-a-deal swap (a higher LINE
 * total but a lower price per 100g / per unit) — or an alternative with a
 * different package size — is compared fairly.
 *
 *   • g / kg  → price "ל-100 גרם"  (kg normalized to grams)
 *   • ml / l  → price 'ל-100 מ"ל'  (l normalized to ml)
 *   • u / t   → price "ליחידה"      (per single package)
 *
 * @returns {{ value:number, label:string, family:string }}
 */
function unitPrice(lineTotal, quantity, unitWeight, weight) {
  const q = Number(quantity) > 0 ? Number(quantity) : 1;
  const perPack = (Number(lineTotal) || 0) / q;
  const uw = String(unitWeight || "");
  const w = Number(weight) || 0;
  if (uw === "u" || uw === "t" || !w) {
    return { value: perPack, label: "ליחידה", family: "u" };
  }
  const perBase = uw === "kg" || uw === "l" ? perPack / 1000 : perPack; // → per g/ml
  const per100 = (perBase * 100) / w;
  const family = uw === "ml" || uw === "l" ? "ml" : "g";
  return {
    value: per100,
    label: family === "ml" ? 'ל-100 מ"ל' : "ל-100 גרם",
    family,
  };
}

/** grams/ml basis for the normalized-savings weighting. */
/**
 * Runs the SAME cart-optimization algorithm the optimization page uses, for the
 * CURRENT cart + CURRENT supermarket, with FIXED settings:
 *   • all brands            → blackListBrands: []
 *   • weight/units ×1.5      → maxWeightGain = maxWeightLoss = 0.5 × weight
 *                              (acceptance window [0.5×weight, 1.5×weight])
 *   • replace allowed        → canReplace: true
 *   • round deals            → canRoundUp: true (the page's default)
 *
 * A swap is only shown/applied when it is genuinely cheaper PER UNIT (per 100g /
 * per 100ml / per package) than the original — so we never present a bigger pack
 * or a round-up as "more expensive". Products that aren't beaten on unit price
 * (and products the store can't optimize) are KEPT as their originals and marked
 * "already optimal", so the user never loses cart items and sees the truth for
 * every single product.
 *
 * @param {object} fullCart  from useFullCart(): { supermarket, totalPrice, productsWithPrices }
 */
export async function runCartOptimization(fullCart) {
  const originals = (fullCart && fullCart.productsWithPrices) || [];
  const supermarketID =
    fullCart && fullCart.supermarket && fullCart.supermarket.supermarketID;

  if (!originals.length || supermarketID == null) {
    return { empty: true };
  }

  const products = originals.map(({ product, amount }) => {
    const w = Number(product.weight) || 0;
    return {
      barcode: product.barcode,
      quantity: amount,
      generalName: product.generalName,
      weight: product.weight,
      productSettings: {
        maxWeightGain: 0.5 * w,
        maxWeightLoss: 0.5 * w,
        blackListBrands: [],
        canRoundUp: true,
        canReplace: true,
      },
    };
  });

  const res = await getOptimalSupermarketCartsV2([supermarketID], products);
  const cart =
    res && res.data && res.data.optimalCarts && res.data.optimalCarts[0];
  if (!cart) throw new Error("no optimal cart returned");

  // barcode → full product doc (for the chosen alternatives' name/weight/unit)
  const details = {};
  (cart.productsDetails || []).forEach((p) => {
    if (p && p.barcode != null) details[String(p.barcode)] = p;
  });
  // original barcode → { product, amount, totalPrice }
  const origBy = {};
  originals.forEach((o) => {
    origBy[String(o.product.barcode)] = o;
  });

  const items = [];
  const optimizedProducts = [];
  let afterActual = 0; // real ₪ of the applied cart → matches the cart page total

  const keepOriginal = (orig, unit) => {
    afterActual += Number(orig.totalPrice) || 0;
    optimizedProducts.push({
      barcode: orig.product.barcode,
      amount: orig.amount,
    });
    items.push({
      changed: false,
      alreadyOptimal: true,
      unitPct: 0,
      original: {
        barcode: orig.product.barcode,
        name: orig.product.name,
        lineTotal: orig.totalPrice,
        amount: orig.amount,
        unitValue: unit.value,
        unitLabel: unit.label,
      },
      optimized: null,
    });
  };

  (cart.existsProducts || []).forEach((ep) => {
    const orig = origBy[String(ep.oldBarcode)];
    if (!orig) return;

    const oProduct = orig.product;
    const origQty = ep.oldQuantity != null ? ep.oldQuantity : orig.amount;
    const origLine = orig.totalPrice || 0;
    const oUP = unitPrice(origLine, origQty, oProduct.unitWeight, oProduct.weight);

    const changedBarcode = String(ep.barcode) !== String(ep.oldBarcode);
    const optDetail = details[String(ep.barcode)];

    // No real swap, or we can't measure the alternative → keep original as-is.
    if (!changedBarcode || !optDetail) {
      keepOriginal(orig, oUP);
      return;
    }

    const optLine = Number(ep.totalPrice) || 0;
    const nUP = unitPrice(
      optLine,
      ep.quantity,
      optDetail.unitWeight,
      optDetail.weight
    );

    // Only accept the swap if it's honestly cheaper per unit AND comparable.
    const comparable = oUP.family === nUP.family;
    const improved = comparable && nUP.value < oUP.value - 0.001;
    if (!improved) {
      keepOriginal(orig, oUP);
      return;
    }

    const unitPct =
      oUP.value > 0
        ? Math.round(((oUP.value - nUP.value) / oUP.value) * 100)
        : 0;

    optimizedProducts.push({ barcode: ep.barcode, amount: ep.quantity });
    afterActual += optLine;
    items.push({
      changed: true,
      alreadyOptimal: false,
      unitPct,
      original: {
        barcode: ep.oldBarcode,
        name: oProduct.name,
        lineTotal: origLine,
        amount: origQty,
        unitValue: oUP.value,
        unitLabel: oUP.label,
      },
      optimized: {
        barcode: ep.barcode,
        name: optDetail.name || String(ep.barcode),
        lineTotal: optLine,
        amount: ep.quantity,
        unitValue: nUP.value,
        unitLabel: nUP.label,
      },
    });
  });

  // Products the store can't optimize → keep as originals (already optimal here).
  (cart.nonExistsProducts || []).forEach((np) => {
    const oldBc = np.oldBarcode != null ? np.oldBarcode : np.barcode;
    const orig = origBy[String(oldBc)];
    if (!orig) return;
    const oUP = unitPrice(
      orig.totalPrice || 0,
      orig.amount,
      orig.product.unitWeight,
      orig.product.weight
    );
    keepOriginal(orig, oUP);
  });

  const beforeTotal = Number(fullCart.totalPrice) || 0;
  let afterTotal = Number(afterActual.toFixed(2));
  let savings = Number((beforeTotal - afterTotal).toFixed(2));

  // If the swap set isn't actually cheaper overall (bigger packs / round-ups can
  // outweigh the per-unit wins), don't change the cart — present it as optimal so
  // the reveal totals always match the real cart the user lands on.
  if (savings <= 0.005) {
    items.length = 0;
    optimizedProducts.length = 0;
    originals.forEach((o) => {
      const u = unitPrice(
        o.totalPrice || 0,
        o.amount,
        o.product.unitWeight,
        o.product.weight
      );
      optimizedProducts.push({ barcode: o.product.barcode, amount: o.amount });
      items.push({
        changed: false,
        alreadyOptimal: true,
        unitPct: 0,
        original: {
          barcode: o.product.barcode,
          name: o.product.name,
          lineTotal: o.totalPrice,
          amount: o.amount,
          unitValue: u.value,
          unitLabel: u.label,
        },
        optimized: null,
      });
    });
    afterTotal = beforeTotal;
    savings = 0;
  }

  const savingsPct =
    beforeTotal > 0 ? Number(((savings / beforeTotal) * 100).toFixed(1)) : 0;

  // improved first (biggest per-unit win), then the already-optimal products
  items.sort((a, b) => {
    if (a.changed !== b.changed) return a.changed ? -1 : 1;
    return (b.unitPct || 0) - (a.unitPct || 0);
  });

  return {
    empty: false,
    beforeTotal,
    afterTotal,
    savings,
    savingsPct,
    changedCount: items.filter((i) => i.changed).length,
    items,
    optimizedProducts,
    supermarket: fullCart.supermarket,
  };
}
