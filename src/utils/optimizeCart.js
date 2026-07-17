import { getOptimalSupermarketCartsV2 } from "../network/cart-optimizationService";
import { getPurchaseHistory } from "../services/historyService";
import { calculateTotalPrice } from "./priceCalculations";

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
export function unitPrice(lineTotal, quantity, unitWeight, weight) {
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

/** The fixed optimization settings both flows use (all brands, ×1.5 weight,
 *  replace + round-up allowed) — mirrors the optimization page defaults. */
function buildProductsPayload(originals) {
  return originals.map(({ product, amount }) => {
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
}

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

  const products = buildProductsPayload(originals);

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

/**
 * Action #5 — compare the current cart across a CHOSEN SET of supermarkets and
 * build the optimized cart for the CHEAPEST one among them. Same fixed settings
 * as action #4, but the target store is the cheapest in the set (not the current
 * store), and applying also SWITCHES the cart to that store.
 *
 * Only supermarkets that can fulfil the WHOLE cart (possibly via replacements)
 * are ranked, so the totals are apples-to-apples. The result reuses the exact
 * shape action #4 renders (before→after items with honest per-unit prices) plus
 * `targetSupermarket` (the chosen store) and `compare: true`.
 *
 * @param {object} fullCart  from useFullCart()
 * @param {Array<{supermarketID,name,address,city}>} candidateSupermarkets
 */
export async function runCompareOptimization(fullCart, candidateSupermarkets) {
  const originals = (fullCart && fullCart.productsWithPrices) || [];
  const candidates = (candidateSupermarkets || []).filter(
    (s) => s && s.supermarketID != null
  );
  if (!originals.length) return { empty: true };
  if (!candidates.length) return { empty: true, reason: "no-candidates" };

  const products = buildProductsPayload(originals);

  // Dedupe by chain: branches of the same chain are essentially chain-priced, so
  // a whole-chain custom selection (dozens of branches) collapses to one store
  // per chain. This keeps the comparison correct (we still fully optimize every
  // distinct chain — a pre-rank by direct price would wrongly drop house-brand
  // stores that are pricey per barcode but cheapest after optimization) while
  // bounding how many stores we optimize.
  const seenChain = new Set();
  const deduped = candidates.filter((s) => {
    const key = s.name || String(s.supermarketID);
    if (seenChain.has(key)) return false;
    seenChain.add(key);
    return true;
  });
  const ids = deduped.map((s) => s.supermarketID);

  const res = await getOptimalSupermarketCartsV2(ids, products);
  const carts = (res && res.data && res.data.optimalCarts) || [];
  if (!carts.length) throw new Error("no optimal carts returned");

  const smById = {};
  candidates.forEach((s) => {
    smById[String(s.supermarketID)] = s;
  });

  const origBy = {};
  originals.forEach((o) => {
    origBy[String(o.product.barcode)] = o;
  });

  // Rank by FEWEST missing items, then cheapest. A data-quirk item that even the
  // current store can't place must not block finding a cheaper store for the
  // rest — such items are simply kept unchanged from the current cart (`kept`).
  const withExists = carts.filter((c) => (c.existsProducts || []).length > 0);
  if (!withExists.length) return { empty: true, reason: "no-carrier" };
  const minMiss = Math.min(
    ...withExists.map((c) => (c.nonExistsProducts || []).length)
  );
  const pool = withExists.filter(
    (c) => (c.nonExistsProducts || []).length === minMiss
  );
  pool.sort(
    (a, b) =>
      (Number(a.totalPrice) || Infinity) - (Number(b.totalPrice) || Infinity)
  );
  const chosen = pool[0];
  const chosenSM = smById[String(chosen.supermarketID)] || {
    supermarketID: chosen.supermarketID,
  };

  /* Honest ranking of ALL evaluated stores (for the on-screen ranking strip and
     the spoken voice summary): a store's total = its optimized cart + the items
     it can't place, kept at the current store's prices. Same ordering rule as
     the winner pick — fewest misses first, then cheapest. */
  const ranked = withExists
    .map((c) => {
      const missing = (c.nonExistsProducts || []).length;
      const keptSum = (c.nonExistsProducts || [])
        .map(
          (np) =>
            origBy[String(np.oldBarcode != null ? np.oldBarcode : np.barcode)]
        )
        .filter(Boolean)
        .reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);
      const sm = smById[String(c.supermarketID)] || {
        supermarketID: c.supermarketID,
      };
      return {
        supermarketID: c.supermarketID,
        name: sm.name || `#${c.supermarketID}`,
        address: sm.address || "",
        city: sm.city || "",
        missing,
        total: Number(((Number(c.totalPrice) || 0) + keptSum).toFixed(2)),
      };
    })
    .sort((a, b) => a.missing - b.missing || a.total - b.total);

  // items the chosen store can't place → keep them from the current cart
  const kept = (chosen.nonExistsProducts || [])
    .map(
      (np) => origBy[String(np.oldBarcode != null ? np.oldBarcode : np.barcode)]
    )
    .filter(Boolean);
  const keptTotal = kept.reduce((s, o) => s + (Number(o.totalPrice) || 0), 0);

  const beforeTotal = Number(fullCart.totalPrice) || 0;
  const afterTotal = Number(
    ((Number(chosen.totalPrice) || 0) + keptTotal).toFixed(2)
  );
  const savings = Number((beforeTotal - afterTotal).toFixed(2));

  // The chosen store isn't actually cheaper than the current one → no win.
  if (savings <= 0.005) {
    return {
      empty: false,
      compare: true,
      compareNoWin: true,
      beforeTotal,
      afterTotal: beforeTotal,
      savings: 0,
      savingsPct: 0,
      changedCount: 0,
      items: originals.map((o) => {
        const u = unitPrice(
          o.totalPrice || 0,
          o.amount,
          o.product.unitWeight,
          o.product.weight
        );
        return {
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
        };
      }),
      optimizedProducts: null,
      targetSupermarket: chosenSM,
      supermarket: fullCart.supermarket,
      ranked,
    };
  }

  // cheaper store found → before (current store) → after (chosen store) per item
  const details = {};
  (chosen.productsDetails || []).forEach((p) => {
    if (p && p.barcode != null) details[String(p.barcode)] = p;
  });

  const items = [];
  const optimizedProducts = [];
  (chosen.existsProducts || []).forEach((ep) => {
    optimizedProducts.push({ barcode: ep.barcode, amount: ep.quantity });
    const optDetail = details[String(ep.barcode)] || {};
    const optLine = Number(ep.totalPrice) || 0;
    const nUP = unitPrice(
      optLine,
      ep.quantity,
      optDetail.unitWeight,
      optDetail.weight
    );
    const orig = origBy[String(ep.oldBarcode)];
    const oProduct = orig && orig.product;
    const origQty = ep.oldQuantity != null ? ep.oldQuantity : orig && orig.amount;
    const origLine = (orig && orig.totalPrice) || 0;
    const oUP = oProduct
      ? unitPrice(origLine, origQty, oProduct.unitWeight, oProduct.weight)
      : nUP;
    const comparable = oUP.family === nUP.family;
    const unitPct =
      comparable && oUP.value > 0 && nUP.value < oUP.value
        ? Math.round(((oUP.value - nUP.value) / oUP.value) * 100)
        : 0;
    items.push({
      changed: true,
      unitPct,
      original: {
        barcode: ep.oldBarcode,
        name: (oProduct && oProduct.name) || optDetail.name || String(ep.oldBarcode),
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

  // un-placeable items → keep them as-is so nothing is dropped from the cart
  kept.forEach((o) => {
    optimizedProducts.push({ barcode: o.product.barcode, amount: o.amount });
    const u = unitPrice(
      o.totalPrice || 0,
      o.amount,
      o.product.unitWeight,
      o.product.weight
    );
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

  const savingsPct =
    beforeTotal > 0 ? Number(((savings / beforeTotal) * 100).toFixed(1)) : 0;
  items.sort((a, b) => {
    if (a.changed !== b.changed) return a.changed ? -1 : 1;
    return (b.unitPct || 0) - (a.unitPct || 0);
  });

  return {
    empty: false,
    compare: true,
    compareNoWin: false,
    beforeTotal,
    afterTotal,
    savings,
    savingsPct,
    changedCount: items.length,
    items,
    optimizedProducts,
    targetSupermarket: chosenSM,
    supermarket: fullCart.supermarket,
    ranked,
  };
}

/** Cheapest product (per unit-weight) for a generalName at the current store,
 *  picked within the dominant unit family so g / ml / package don't cross-compare. */
function cheapestForGeneral(name, byGeneral, pricesMap) {
  const cands = byGeneral[name] || [];
  if (!cands.length) return null;
  const withUP = cands.map((p) => ({
    p,
    up: unitPrice(pricesMap[p.barcode].price, 1, p.unitWeight, p.weight),
  }));
  const famCount = {};
  withUP.forEach((x) => {
    famCount[x.up.family] = (famCount[x.up.family] || 0) + 1;
  });
  const domFamily = Object.keys(famCount).sort(
    (a, b) => famCount[b] - famCount[a]
  )[0];
  const pool = withUP.filter((x) => x.up.family === domFamily);
  pool.sort((a, b) => a.up.value - b.up.value);
  return pool[0] || null;
}

/**
 * Action #6 — "complete the cart". For each generalName in the user's defined
 * list that is NOT already in the cart, pick a product to add:
 *   • strategy "cheapest"     → the cheapest product per unit-weight at the
 *                               CURRENT supermarket.
 *   • strategy "lastPurchased"→ the most recently PURCHASED product of that
 *                               generalName (history newest→oldest) that is sold
 *                               at the current store; falls back to "cheapest"
 *                               when there's no usable history.
 * Products with no option at the current store are skipped. The reveal shape
 * mirrors the other overlays (light theme), with per-unit prices.
 *
 * @param {object} fullCart  from useFullCart()
 * @param {{products:Array, pricesMap:object, names:string[], strategy:string}} opts
 */
export async function runCompleteCart(fullCart, opts) {
  const {
    products = [],
    pricesMap = {},
    names = [],
    strategy = "cheapest",
  } = opts || {};

  const cartGenerals = new Set(
    ((fullCart && fullCart.productsWithPrices) || [])
      .map((x) => x.product && x.product.generalName)
      .filter(Boolean)
  );
  const wanted = [...new Set(names.filter(Boolean))];
  const missing = wanted.filter((n) => !cartGenerals.has(n));

  if (!wanted.length) {
    return { empty: true, reason: "no-names" };
  }
  if (!missing.length) {
    return {
      empty: false,
      complete: true,
      addedCount: 0,
      wantedCount: wanted.length,
      items: [],
      addedProducts: [],
      supermarket: fullCart && fullCart.supermarket,
    };
  }

  // products of each generalName that are actually sold at the current store
  const byGeneral = {};
  products.forEach((p) => {
    if (!p || !p.generalName || !pricesMap[p.barcode]) return;
    (byGeneral[p.generalName] = byGeneral[p.generalName] || []).push(p);
  });

  let history = null;
  if (strategy === "lastPurchased") {
    try {
      const h = await getPurchaseHistory();
      history = (Array.isArray(h) ? h : [])
        .slice()
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    } catch (e) {
      history = [];
    }
  }

  const lastPurchasedForGeneral = (name) => {
    if (!history) return null;
    for (const rec of history) {
      for (const prod of rec.products || []) {
        if (prod.generalName === name && pricesMap[prod.barcode]) {
          const catalog = products.find((p) => p.barcode === prod.barcode);
          const weight = catalog ? catalog.weight : prod.weight;
          const unitWeight = catalog ? catalog.unitWeight : prod.unit;
          return {
            p: catalog || {
              barcode: prod.barcode,
              name: prod.name,
              generalName: name,
              weight,
              unitWeight,
            },
            up: unitPrice(pricesMap[prod.barcode].price, 1, unitWeight, weight),
            amount: Number(prod.amount) > 0 ? Number(prod.amount) : 1,
          };
        }
      }
    }
    return null;
  };

  const items = [];
  const addedProducts = [];
  missing.forEach((name) => {
    let pick = null;
    let via = "cheapest";
    if (strategy === "lastPurchased") {
      pick = lastPurchasedForGeneral(name);
      if (pick) via = "history";
    }
    if (!pick) {
      pick = cheapestForGeneral(name, byGeneral, pricesMap);
      via = "cheapest";
    }
    if (!pick) return; // nothing for this generalName at the current store → skip
    const amount = pick.amount || 1;
    addedProducts.push({ barcode: pick.p.barcode, amount });
    items.push({
      added: true,
      via,
      generalName: name,
      barcode: pick.p.barcode,
      name: pick.p.name || name,
      amount,
      unitValue: pick.up.value,
      unitLabel: pick.up.label,
    });
  });

  return {
    empty: false,
    complete: true,
    addedCount: items.length,
    wantedCount: wanted.length,
    missingCount: missing.length,
    items,
    addedProducts,
    supermarket: fullCart && fullCart.supermarket,
  };
}

/** Build a virtual "completed" fullCart = the current cart + the added products,
 *  priced at the CURRENT store, so the compare step can run on the full cart. */
function buildCompletedFullCart(fullCart, added, products, pricesMap) {
  const base = fullCart || { productsWithPrices: [], totalPrice: 0 };
  if (!added || !added.length) return base;
  const byBarcode = {};
  (products || []).forEach((p) => {
    if (p && p.barcode) byBarcode[p.barcode] = p;
  });
  const extra = [];
  let extraTotal = 0;
  added.forEach((ap) => {
    const p = byBarcode[ap.barcode];
    const pd = pricesMap[ap.barcode];
    if (!p || !pd) return;
    const totalPrice = Number(calculateTotalPrice(ap.amount, pd)) || 0;
    extraTotal += totalPrice;
    extra.push({
      product: {
        barcode: p.barcode,
        name: p.name,
        generalName: p.generalName,
        category: p.category,
        subcategory: p.subcategory,
        weight: p.weight,
        unitWeight: p.unitWeight,
      },
      amount: ap.amount,
      totalPrice: Number(totalPrice.toFixed(2)),
    });
  });
  return {
    ...base,
    productsWithPrices: [...(base.productsWithPrices || []), ...extra],
    totalPrice: Number(((base.totalPrice || 0) + extraTotal).toFixed(2)),
  };
}

/**
 * Action #7 — "complete + switch to the cheapest". First completes the cart
 * (action #6), then compares the COMPLETED cart across a chosen set of
 * supermarkets (action #5) and, if one is cheaper, switches to it. One combined,
 * polished reveal. Returns a self-describing result:
 *   revealAs: "compare"  → a cheaper store exists (or the set was priced) — show
 *                          the before→after switch, with completed items flagged.
 *   revealAs: "complete" → no store could price the whole completed cart — show
 *                          just what was completed (apply at the current store).
 * `applyProducts` / `applySupermarketID` say exactly what to apply.
 *
 * @param {object} fullCart
 * @param {{products,pricesMap,names,strategy,candidateSupermarkets}} opts
 */
export async function runCompleteAndCompare(fullCart, opts) {
  const {
    products = [],
    pricesMap = {},
    names = [],
    strategy = "cheapest",
    candidateSupermarkets = [],
  } = opts || {};

  // 1) complete
  const comp = await runCompleteCart(fullCart, {
    products,
    pricesMap,
    names,
    strategy,
  });
  if (comp && comp.empty) return comp; // e.g. "no-names"
  const added = (comp && comp.addedProducts) || [];
  const addedBarcodes = new Set(added.map((a) => String(a.barcode)));
  const completedCount = (comp && comp.addedCount) || 0;

  const completedProducts = [
    ...((fullCart && fullCart.productsWithPrices) || []).map((x) => ({
      barcode: x.product.barcode,
      amount: x.amount,
    })),
    ...added,
  ];

  const base = {
    empty: false,
    completeCompare: true,
    completedCount,
    completedProducts,
    strategy,
    supermarket: fullCart && fullCart.supermarket,
  };

  // 2) + 3) build the completed cart and compare it across the set
  const completedCart = buildCompletedFullCart(
    fullCart,
    added,
    products,
    pricesMap
  );
  const cmp = await runCompareOptimization(completedCart, candidateSupermarkets);

  // no store could price the whole completed cart → show completion only
  if (!cmp || cmp.empty) {
    return {
      ...base,
      revealAs: "complete",
      compareWin: false,
      addedCount: completedCount,
      items: (comp && comp.items) || [],
      applyProducts: completedProducts,
      applySupermarketID: null,
      reason: cmp && cmp.reason,
    };
  }

  const win =
    !cmp.compareNoWin && cmp.savings > 0.005 && !!cmp.targetSupermarket;
  const items = (cmp.items || []).map((it) => ({
    ...it,
    completed: !!(it.original && addedBarcodes.has(String(it.original.barcode))),
  }));

  return {
    ...base,
    revealAs: "compare",
    compareWin: win,
    beforeTotal: cmp.beforeTotal,
    afterTotal: cmp.afterTotal,
    savings: cmp.savings,
    savingsPct: cmp.savingsPct,
    changedCount: cmp.changedCount,
    targetSupermarket: cmp.targetSupermarket,
    items,
    applyProducts: win ? cmp.optimizedProducts : completedProducts,
    applySupermarketID: win ? cmp.targetSupermarket.supermarketID : null,
  };
}
