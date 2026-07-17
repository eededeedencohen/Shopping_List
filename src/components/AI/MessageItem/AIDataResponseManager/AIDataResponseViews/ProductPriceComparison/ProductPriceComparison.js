import React, { useMemo, useState } from "react";
import "./ProductPriceComparison.css";
import SupermarketImage from "../../../../../Images/SupermarketImage";
import { ProductImageDisplay } from "../../../../../Images/ProductImageService";
import { unitPrice } from "../../../../../../utils/optimizeCart";
import { IconClose } from "../../../../../Icons/UiIcons";

/* B1 — interactive price board. Three views over the same data:
   • "סניפים" — the branch bar-board (default): Y axis = branches, X axis =
              price; every product is a horizontal bar in its own color whose
              LENGTH is the price. A deal splits the bar in two tones — bright
              up to the per-unit deal price, darker continuing to the regular
              price. Legend above maps color → product (+ its price), so the
              whole picture reads at a glance.
   • "גרף"  — a true DISTRIBUTION chart (the expenses-chart aesthetic): the X
              axis is the PRICE (₪), and each product is a smooth gradient hill
              whose height says how many branches sell at that price. Products
              that share a price literally pile on top of each other — the
              overlap IS the picture. Deals add a dashed hill of the regular
              prices (graph-on-graph). Branch dots sit on the baseline; tapping
              one reveals the branch (with its supermarket logo).
   • "רשימה" — the ranked list with proportional bars, pin-to-compare deltas,
              deal badges and unit prices. */

const UNIT_HE = { g: "גרם", kg: 'ק"ג', ml: 'מ"ל', l: "ליטר", u: "יח'", t: "יח'" };
const money = (n) => "₪" + (Number(n) || 0).toFixed(2);
const COLLAPSED_COUNT = 6;
/* six well-separated hues — the pairs (teal/green, red/magenta) of the old
   set were confusable at bar size */
const SERIES_COLORS = ["#22d3ee", "#4ade80", "#fbbf24", "#fb7185", "#818cf8", "#e879f9"];
const PLOT_W = 360; // viewBox units — rendered responsively at 100% width
const PLOT_H = 168;
const AXIS_H = 22; // extra room for the ₪ tick labels
const KDE_SAMPLES = 90;

export default function ProductPriceComparison({ data }) {
  /* ── normalize: chain → branches → products  ⇒  flat rows + product map ── */
  const { products, rowsByBarcode } = useMemo(() => {
    const productMap = {};
    const rows = {};
    Object.entries(data || {}).forEach(([chain, branches]) => {
      (branches || []).forEach((b) => {
        (b.products || []).forEach(({ product, price }) => {
          if (!product || !product.barcode || !price) return;
          const bc = String(product.barcode);
          if (!productMap[bc]) productMap[bc] = product;
          (rows[bc] = rows[bc] || []).push({
            key: `${chain}|${b.branchName}|${b.branchAddress}`,
            chain,
            branchName: b.branchName,
            branchAddress: b.branchAddress,
            price,
          });
        });
      });
    });
    // richest board first: order products by how many branches carry them
    const list = Object.values(productMap).sort(
      (a, b) =>
        (rows[String(b.barcode)] || []).length -
        (rows[String(a.barcode)] || []).length
    );
    return { products: list, rowsByBarcode: rows };
  }, [data]);

  const [view, setView] = useState("bars"); // "bars" | "chart" | "list"
  const [barcode, setBarcode] = useState(null);
  const [priceMode, setPriceMode] = useState("deal"); // "deal" | "base"
  const [pinnedKey, setPinnedKey] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const [showAllBranches, setShowAllBranches] = useState(false);
  const [hiddenSeries, setHiddenSeries] = useState(() => new Set());
  const [focusPoint, setFocusPoint] = useState(null); // {row, product, base, deal}

  const product =
    (barcode && products.find((p) => String(p.barcode) === String(barcode))) ||
    products[0];

  /* effective prices per product (chart) */
  const seriesData = useMemo(() => {
    return products.map((p) => {
      const pts = (rowsByBarcode[String(p.barcode)] || []).map((r) => {
        const base = Number(r.price.price) || 0;
        const deal =
          r.price.hasDiscount && r.price.discount
            ? Number(r.price.discount.priceForUnit) || base
            : base;
        return { row: r, base, deal, hasDeal: deal < base - 0.001 };
      });
      return { product: p, points: pts };
    });
  }, [products, rowsByBarcode]);

  /* ── branches flattened for the bar-board: one entry per branch ── */
  const branchBoard = useMemo(() => {
    const map = {};
    Object.entries(data || {}).forEach(([chain, branches]) => {
      (branches || []).forEach((b) => {
        const key = `${chain}|${b.branchName}|${b.branchAddress}`;
        const entry = (map[key] = map[key] || {
          key,
          chain,
          branchName: b.branchName,
          branchAddress: b.branchAddress,
          items: {},
        });
        (b.products || []).forEach(({ product, price }) => {
          if (!product || !product.barcode || !price) return;
          const base = Number(price.price) || 0;
          const deal =
            price.hasDiscount && price.discount
              ? Number(price.discount.priceForUnit) || base
              : base;
          entry.items[String(product.barcode)] = {
            price,
            base,
            deal,
            hasDeal: deal < base - 0.001,
          };
        });
      });
    });
    const list = Object.values(map);
    /* merge branches of the SAME chain whose whole price picture is identical
       (same products, same regular AND deal prices) into one group — no point
       repeating identical bar sections (user request) */
    const fullSig = (br) =>
      br.chain +
      "||" +
      Object.keys(br.items)
        .sort()
        .map((bc) => {
          const it = br.items[bc];
          return `${bc}:${it.base.toFixed(2)}:${it.deal.toFixed(2)}`;
        })
        .join("|");
    const bySig = {};
    list.forEach((br) => {
      const s = fullSig(br);
      (bySig[s] = bySig[s] || []).push(br);
    });
    const groups = Object.values(bySig).map((arr) => ({
      key: arr.map((b) => b.key).join("~"),
      chain: arr[0].chain,
      items: arr[0].items,
      branches: arr.map((b) => ({
        name: b.branchName,
        address: b.branchAddress,
      })),
      branchCount: arr.length,
    }));
    const count = (g) => Object.keys(g.items).length;
    const sum = (g) => Object.values(g.items).reduce((s, it) => s + it.deal, 0);
    groups.sort(
      (a, b) =>
        b.branchCount - a.branchCount ||
        count(b) - count(a) ||
        sum(a) - sum(b) ||
        String(a.branches[0].address).localeCompare(
          String(b.branches[0].address),
          "he"
        )
    );
    return groups;
  }, [data]);

  /* stable product→color: keyed to the barcode (hash into the palette with a
     deterministic collision bump), so the same product keeps its color across
     messages and across the three views — not tied to display order */
  const colorByBarcode = useMemo(() => {
    const map = {};
    products
      .map((p) => String(p.barcode))
      .sort()
      .forEach((bc) => {
        let idx = 0;
        for (let i = 0; i < bc.length; i++)
          idx = (idx * 31 + bc.charCodeAt(i)) % SERIES_COLORS.length;
        const used = new Set(Object.values(map));
        let tries = 0;
        while (used.has(SERIES_COLORS[idx]) && tries < SERIES_COLORS.length) {
          idx = (idx + 1) % SERIES_COLORS.length;
          tries++;
        }
        map[bc] = SERIES_COLORS[idx];
      });
    return map;
  }, [products]);
  const colorOf = (bc) => colorByBarcode[String(bc)] || SERIES_COLORS[0];

  /* ── ranked rows for the selected product (list view) ── */
  const board = useMemo(() => {
    if (!product) return null;
    const raw = rowsByBarcode[String(product.barcode)] || [];
    const entries = raw.map((r) => {
      const base = Number(r.price.price) || 0;
      const deal =
        r.price.hasDiscount && r.price.discount
          ? Number(r.price.discount.priceForUnit) || base
          : base;
      return { ...r, base, deal, value: priceMode === "deal" ? deal : base };
    });
    entries.sort((a, b) => a.value - b.value);
    const min = entries.length ? entries[0].value : 0;
    const max = entries.length ? entries[entries.length - 1].value : 0;
    return { entries, min, max };
  }, [product, rowsByBarcode, priceMode]);

  if (!product || !board || !board.entries.length) {
    return (
      <div className="ppc" dir="rtl">
        <div className="ppc__empty">לא נמצאו נתוני מחירים להצגה</div>
      </div>
    );
  }

  const { entries, min, max } = board;
  const spreadPct = min > 0 ? Math.round(((max - min) / min) * 100) : 0;
  const anyDealList = entries.some(
    (e) => e.price.hasDiscount && e.price.discount
  );
  const pinned = entries.find((e) => e.key === pinnedKey) || null;
  const visibleRows = showAll ? entries : entries.slice(0, COLLAPSED_COUNT);

  const up = unitPrice(entries[0].value, 1, product.unitWeight, product.weight);
  const weightLabel =
    product.weight && product.unitWeight
      ? `${product.weight} ${UNIT_HE[product.unitWeight] || product.unitWeight}`
      : null;

  const togglePin = (key) => setPinnedKey((p) => (p === key ? null : key));
  const toggleSeries = (bc) =>
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      const k = String(bc);
      if (next.has(k)) next.delete(k);
      else if (next.size < products.length - 1) next.add(k); // keep ≥1 visible
      return next;
    });

  /* ═══════════ distribution-chart geometry (price → density) ═══════════ */
  const visibleSeries = seriesData.filter(
    (s) => !hiddenSeries.has(String(s.product.barcode))
  );
  const allVals = [];
  visibleSeries.forEach((s) =>
    s.points.forEach((pt) => {
      allVals.push(pt.deal);
      if (pt.hasDeal) allVals.push(pt.base);
    })
  );
  let lo = allVals.length ? Math.min(...allVals) : 0;
  let hi = allVals.length ? Math.max(...allVals) : 1;
  if (hi - lo < 0.001) {
    lo -= 1;
    hi += 1;
  } else {
    const pad = (hi - lo) * 0.22;
    lo = Math.max(0, lo - pad);
    hi = hi + pad;
  }
  /* SVG is LTR; RTL reading → cheap prices on the RIGHT */
  const xOfPrice = (v) => PLOT_W - ((v - lo) / (hi - lo)) * PLOT_W;
  const bandwidth = Math.max((hi - lo) * 0.045, 0.08);
  const sampleXs = Array.from(
    { length: KDE_SAMPLES },
    (_, k) => lo + (k / (KDE_SAMPLES - 1)) * (hi - lo)
  );
  const kde = (values) =>
    sampleXs.map((sx) =>
      values.reduce(
        (s, v) => s + Math.exp(-0.5 * Math.pow((sx - v) / bandwidth, 2)),
        0
      )
    );

  const curves = visibleSeries.map((s) => {
    const dealVals = s.points.map((pt) => pt.deal);
    const baseVals = s.points.map((pt) => pt.base);
    const hasAnyDeal = s.points.some((pt) => pt.hasDeal);
    return {
      s,
      dens: kde(dealVals),
      densBase: hasAnyDeal ? kde(baseVals) : null,
      hasAnyDeal,
      count: dealVals.length,
    };
  });
  const maxD = Math.max(
    0.001,
    ...curves.flatMap((c) => [...c.dens, ...(c.densBase || [])])
  );
  const yOfD = (d) => PLOT_H - 6 - (d / maxD) * (PLOT_H - 34);
  const curvePath = (dens) => {
    let d = "";
    sampleXs.forEach((sx, k) => {
      const X = xOfPrice(sx).toFixed(1);
      const Y = yOfD(dens[k]).toFixed(1);
      d += k === 0 ? `M${X},${Y}` : ` L${X},${Y}`;
    });
    return d;
  };
  const areaPath = (dens) =>
    `${curvePath(dens)} L${xOfPrice(sampleXs[KDE_SAMPLES - 1]).toFixed(1)},${
      PLOT_H - 6
    } L${xOfPrice(sampleXs[0]).toFixed(1)},${PLOT_H - 6} Z`;

  /* peak label per curve: the most common price (mode) */
  const modeOf = (c) => {
    const counts = {};
    c.s.points.forEach((pt) => {
      const k = pt.deal.toFixed(2);
      counts[k] = (counts[k] || 0) + 1;
    });
    const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return best ? Number(best[0]) : null;
  };

  /* baseline branch dots — clusters fan upward so coincident prices stack */
  const rugClusters = {};
  visibleSeries.forEach((s) =>
    s.points.forEach((pt) => {
      const k = pt.deal.toFixed(2);
      (rugClusters[k] = rugClusters[k] || []).push({ s, pt });
    })
  );
  const priceTicks = [0, 1 / 3, 2 / 3, 1].map((t) => lo + t * (hi - lo));

  /* ═══════════ branch bar-board geometry (Y = branches, X = price) ═══════════ */
  const barsProducts = products.filter(
    (p) => !hiddenSeries.has(String(p.barcode))
  );
  const totalBranches = branchBoard.reduce((s, g) => s + g.branchCount, 0);
  const carriedCount = (bc) => (rowsByBarcode[String(bc)] || []).length;
  let barsTop = 0;
  branchBoard.forEach((br) =>
    barsProducts.forEach((p) => {
      const it = br.items[String(p.barcode)];
      if (it) barsTop = Math.max(barsTop, it.base);
    })
  );
  const scaleMax = barsTop > 0 ? barsTop * 1.22 : 1; // headroom so the longest bar's cap and label breathe
  const tickStep =
    [0.5, 1, 2, 5, 10, 20, 50].find((s) => scaleMax / s <= 5.5) || 50;
  const barTicks = [];
  for (let t = 0; t <= scaleMax - tickStep * 0.3; t += tickStep) barTicks.push(t);
  const tickLabel = (t) =>
    "₪" + (Number.isInteger(t) ? t : t.toFixed(2).replace(/0+$/, ""));
  /* display helpers: strip the shared brand word so bars/legend read short,
     fold the weight in when two products share a display name, and clean
     raw DB addresses ("האומן,15") */
  const firstWord = (products[0] && (products[0].name || "").split(" ")[0]) || "";
  const allShareFirstWord =
    firstWord.length > 1 &&
    products.every((q) => (q.name || "").startsWith(firstWord + " "));
  const shortName = (p) => {
    let n = p.name || "";
    if (allShareFirstWord) n = n.slice(firstWord.length + 1);
    const dup = products.some((q) => q !== p && q.name === p.name);
    if (dup && p.weight && p.unitWeight)
      n += ` ${p.weight} ${UNIT_HE[p.unitWeight] || p.unitWeight}`;
    return n;
  };
  const addrNorm = (s) =>
    String(s || "")
      .replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const multiChain =
    new Set(branchBoard.map((br) => br.chain)).size > 1;
  /* per-product price picture for the legend chips */
  const rangeOf = (bc) => {
    const s = seriesData.find(
      (sd) => String(sd.product.barcode) === String(bc)
    );
    if (!s || !s.points.length) return null;
    const vals = s.points.map((pt) => pt.deal);
    const bases = s.points.map((pt) => pt.base);
    return {
      min: Math.min(...vals),
      max: Math.max(...vals),
      n: vals.length,
      baseMin: Math.min(...bases),
      baseMax: Math.max(...bases),
      dealN: s.points.filter((pt) => pt.hasDeal).length,
    };
  };
  const allUniform =
    totalBranches > 1 &&
    barsProducts.every((p) => {
      const r = rangeOf(p.barcode);
      return r && r.max - r.min < 0.005;
    });
  /* honest "cheapest basket" tag: only when every group carries the same set */
  const setSig = (g) =>
    barsProducts
      .filter((p) => g.items[String(p.barcode)])
      .map((p) => p.barcode)
      .join(",");
  const comparableBaskets =
    branchBoard.length > 1 &&
    branchBoard.every((g) => setSig(g) === setSig(branchBoard[0]));
  const basketSum = (g) =>
    barsProducts.reduce(
      (s, p) => s + (g.items[String(p.barcode)] ? g.items[String(p.barcode)].deal : 0),
      0
    );
  const sortedBySum = comparableBaskets
    ? [...branchBoard].sort((a, b) => basketSum(a) - basketSum(b))
    : [];
  const cheapestGroup =
    comparableBaskets &&
    !allUniform &&
    sortedBySum.length > 1 &&
    basketSum(sortedBySum[0]) < basketSum(sortedBySum[1]) - 0.004
      ? sortedBySum[0]
      : null;
  const dealBranches = branchBoard.reduce(
    (s, g) =>
      s +
      (Object.values(g.items).some((it) => it.hasDeal) ? g.branchCount : 0),
    0
  );
  const anyDealBars = dealBranches > 0;
  const COLLAPSED_BRANCHES = 5;
  const visibleGroups = showAllBranches
    ? branchBoard
    : branchBoard.slice(0, COLLAPSED_BRANCHES);
  const groupLabel = (g) =>
    g.branchCount > 1
      ? `${g.branchCount} סניפים`
      : addrNorm(g.branches[0].address);
  const noDealGroups = branchBoard.filter(
    (g) => !Object.values(g.items).some((it) => it.hasDeal)
  );
  const barsInsight = allUniform
    ? `לכל מוצר אותו מחיר בכל הסניפים שבהם הוא נמכר — אין סניף זול יותר`
    : cheapestGroup
    ? `הסל הזול ביותר: ${groupLabel(cheapestGroup)} (${money(basketSum(cheapestGroup))} לכל המוצרים)`
    : anyDealBars && dealBranches < totalBranches
    ? `מבצעים פעילים ב־${dealBranches} מתוך ${totalBranches} סניפים${
        noDealGroups.length === 1
          ? ` — ב${groupLabel(noDealGroups[0])} המחיר מלא`
          : " — בשאר המחיר מלא"
      }`
    : null;

  return (
    <div className="ppc" dir="rtl">
      {/* ── view switch ── */}
      <div className="ppc__mode ppc__mode--views" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "bars"}
          className={`ppc__mode-btn${view === "bars" ? " is-active" : ""}`}
          onClick={() => {
            setView("bars");
            setFocusPoint(null);
          }}
        >
          📊 סניפים
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "chart"}
          className={`ppc__mode-btn${view === "chart" ? " is-active" : ""}`}
          onClick={() => {
            setView("chart");
            setFocusPoint(null);
          }}
        >
          📈 גרף
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          className={`ppc__mode-btn${view === "list" ? " is-active" : ""}`}
          onClick={() => {
            setView("list");
            setFocusPoint(null);
          }}
        >
          ☰ רשימה
        </button>
      </div>

      {/* ════════════════ BRANCH BAR-BOARD (סניפים) ════════════════ */}
      {view === "bars" && (
        <>
          <div className="ppc__chart-caption">
            מחיר לכל מוצר בכל סניף · אורך הפס = המחיר
          </div>

          {/* legend: color → product (+ its price at a glance) */}
          <div className="ppcb__key">
            {products.map((p, pi) => {
              const off = hiddenSeries.has(String(p.barcode));
              const r = rangeOf(p.barcode);
              const uniform = r && r.max - r.min < 0.005;
              /* price varies ONLY because some branches run a deal (the
                 regular price is identical everywhere) — say THAT, not
                 "לפי סניף" */
              const dealDriven =
                r &&
                !uniform &&
                r.baseMax - r.baseMin < 0.005 &&
                r.min < r.baseMin - 0.001;
              return (
                <button
                  key={p.barcode}
                  type="button"
                  className={`ppcb__key-item${off ? " is-off" : ""}`}
                  style={{ "--clr": colorOf(p.barcode) }}
                  onClick={() => toggleSeries(p.barcode)}
                  title={p.name}
                >
                  <span className="ppc__legend-img">
                    <ProductImageDisplay barcode={p.barcode} alt={p.name} />
                  </span>
                  <span className="ppcb__key-text">
                    <span className="ppcb__key-name">
                      <i className="ppcb__key-dot" />
                      {shortName(p)}
                    </span>
                    <span className="ppcb__key-sub">
                      {[
                        r
                          ? r.n === 1
                            ? "רק בסניף אחד"
                            : `ב־${r.n} סניפים`
                          : null,
                        r && r.n > 1 && uniform ? "אותו מחיר בכולם" : null,
                        dealDriven ? `מבצע ב־${r.dealN} מהם` : null,
                        r && !uniform && !dealDriven ? "לפי סניף" : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                  {r && (
                    <span className="ppcb__key-price">
                      {uniform ? (
                        <b>{money(r.min)}</b>
                      ) : dealDriven ? (
                        <>
                          <b>{money(r.baseMin)}</b>
                          <i className="ppcb__key-deal">
                            במבצע {money(r.min)}
                          </i>
                        </>
                      ) : (
                        <b dir="ltr">{`${money(r.min)}–${r.max.toFixed(2)}`}</b>
                      )}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {anyDealBars && (
            <div className="ppcb__key-deals">
              <span className="ppcb__key-sample">
                <i className="is-light" />
                <i className="is-dark" />
              </span>
              בהיר = מחיר ליחידה במבצע · כהה = ההפרש עד המחיר הרגיל
            </div>
          )}

          {barsInsight && <div className="ppcb__insight">{barsInsight}</div>}

          {/* slim color key that stays pinned while the tall board scrolls */}
          <div className="ppcb__rail" aria-hidden="true">
            {barsProducts.map((p) => (
              <span
                key={p.barcode}
                className="ppcb__rail-chip"
                style={{
                  "--clr":
                    colorOf(p.barcode),
                }}
              >
                <i />
                {shortName(p)}
              </span>
            ))}
          </div>

          {/* focused bar details */}
          {focusPoint && (
            <div className="ppc__focus">
              <button
                type="button"
                className="ppc__focus-close"
                aria-label="סגירה"
                onClick={() => setFocusPoint(null)}
              >
                <IconClose />
              </button>
              <span className="ppc__focus-img">
                <ProductImageDisplay
                  barcode={focusPoint.product.barcode}
                  alt={focusPoint.product.name}
                />
              </span>
              <span className="ppc__focus-text">
                <b>{focusPoint.product.name}</b>
                <i>
                  {focusPoint.row.chain} · {addrNorm(focusPoint.row.branchAddress)}
                </i>
                {focusPoint.deal < focusPoint.base - 0.001 &&
                  focusPoint.price &&
                  focusPoint.price.discount && (
                    <em className="ppc__focus-deal">
                      מבצע: {focusPoint.price.discount.units} ב־
                      {money(focusPoint.price.discount.totalPrice)} (
                      {money(focusPoint.deal)} ליחידה)
                    </em>
                  )}
              </span>
              <span className="ppc__focus-logo">
                <SupermarketImage supermarketName={focusPoint.row.chain} />
              </span>
              <span className="ppc__focus-price">
                <b>{money(focusPoint.deal)}</b>
                {focusPoint.deal < focusPoint.base - 0.001 && (
                  <s>{money(focusPoint.base)}</s>
                )}
              </span>
            </div>
          )}

          {/* the board: branch sections, shared price axis */}
          <div className={`ppcb__plot${focusPoint ? " has-focus" : ""}`}>
            <div className="ppcb__grid" aria-hidden="true">
              {barTicks.map((t) => (
                <i
                  key={t}
                  className={t === 0 ? "is-axis" : ""}
                  style={{ right: `${(t / scaleMax) * 100}%` }}
                />
              ))}
            </div>

            {visibleGroups.map((br, bi) => (
              <div className="ppcb__branch" key={br.key}>
                {/* the BRANCH (address) is the differentiator — it leads; the
                    chain lives in the logo. Same-chain branches with an
                    identical price picture are MERGED into one section. */}
                <div className="ppcb__bhead">
                  <span className="ppcb__blogo">
                    <SupermarketImage supermarketName={br.chain} />
                  </span>
                  <b className="ppcb__bname">{groupLabel(br)}</b>
                  {br.branchCount > 1 && (
                    <span className="ppcb__btag ppcb__btag--same">
                      אותם מחירים
                    </span>
                  )}
                  {anyDealBars &&
                    !Object.values(br.items).some((it) => it.hasDeal) && (
                      <span className="ppcb__btag ppcb__btag--nodeal">
                        ללא מבצע
                      </span>
                    )}
                  {multiChain && (
                    <span className="ppcb__baddr">{br.chain}</span>
                  )}
                  {cheapestGroup && cheapestGroup.key === br.key && (
                    <span className="ppcb__btag">הסל הזול ביותר</span>
                  )}
                </div>
                {br.branchCount > 1 && (
                  <div className="ppcb__bsub">
                    {br.branches.map((b) => addrNorm(b.address)).join(" · ")}
                  </div>
                )}

                {barsProducts.map((p, pi) => {
                  const it = br.items[String(p.barcode)];
                  const clr =
                    colorOf(p.barcode);
                  if (!it) return null; /* gaps summarized in one line below */
                  const w = (it.base / scaleMax) * 100;
                  const lightPct = it.hasDeal
                    ? (it.deal / it.base) * 100
                    : 100;
                  const focused =
                    focusPoint &&
                    focusPoint.row.key === br.key &&
                    String(focusPoint.product.barcode) === String(p.barcode);
                  return (
                    <button
                      key={p.barcode}
                      type="button"
                      className={`ppcb__barrow${focused ? " is-focused" : ""}`}
                      style={{
                        "--clr": clr,
                        /* stagger inside the branch + a small branch offset,
                           capped so late branches never feel stuck */
                        "--d": `${(pi * 0.045 + Math.min(bi, 4) * 0.05).toFixed(3)}s`,
                      }}
                      onClick={() =>
                        setFocusPoint(
                          focused
                            ? null
                            : {
                                row: {
                                  key: br.key,
                                  chain: br.chain,
                                  branchName: br.chain,
                                  branchAddress:
                                    br.branchCount > 1
                                      ? `${br.branchCount} סניפים באותו מחיר`
                                      : addrNorm(br.branches[0].address),
                                },
                                product: p,
                                base: it.base,
                                deal: it.deal,
                                price: it.price,
                              }
                        )
                      }
                    >
                      <span
                        className="ppcb__bar"
                        style={{ width: `${w}%` }}
                        aria-hidden="true"
                      >
                        <i
                          className="ppcb__seg is-light"
                          style={{ width: `${lightPct}%` }}
                        />
                        {it.hasDeal && (
                          <i
                            className="ppcb__seg is-dark"
                            style={{ width: `${100 - lightPct}%` }}
                          />
                        )}
                      </span>
                      <span className="ppcb__barlabel">
                        <b>{money(it.deal)}</b>
                        {it.hasDeal && it.price.discount && (
                          <em className="ppcb__cond">
                            ליח׳ בקניית {it.price.discount.units}
                          </em>
                        )}
                        {totalBranches > 1 &&
                          carriedCount(p.barcode) === 1 && (
                            <em className="ppcb__cond ppcb__cond--rare">
                              רק בסניף זה
                            </em>
                          )}
                      </span>
                    </button>
                  );
                })}

                {/* one compact line for products this branch doesn't carry
                    (only products that ARE common elsewhere) */}
                {(() => {
                  const gaps = barsProducts.filter(
                    (p) =>
                      !br.items[String(p.barcode)] &&
                      carriedCount(p.barcode) >= totalBranches / 2
                  );
                  if (!gaps.length) return null;
                  return (
                    <div className="ppcb__gaps">
                      {gaps.length === 1
                        ? "לא נמכר בסניף זה:"
                        : "לא נמכרים בסניף זה:"}
                      {gaps.map((p) => (
                        <span
                          key={p.barcode}
                          className="ppcb__gap"
                          style={{
                            "--clr":
                              colorOf(p.barcode),
                          }}
                        >
                          <i />
                          {shortName(p)}
                        </span>
                      ))}
                    </div>
                  );
                })()}
              </div>
            ))}

            <div className="ppcb__axis" aria-hidden="true">
              {barTicks.map((t) => (
                <span key={t} style={{ right: `${(t / scaleMax) * 100}%` }}>
                  {tickLabel(t)}
                </span>
              ))}
            </div>
          </div>

          {branchBoard.length > COLLAPSED_BRANCHES && (
            <button
              type="button"
              className="ppc__more"
              onClick={() => setShowAllBranches((v) => !v)}
            >
              {showAllBranches
                ? "הצג פחות"
                : `הצג את כל ${totalBranches} הסניפים`}
            </button>
          )}

          <div className="ppc__hint">
            הקש על פס לפרטי המוצר והמבצע · הקש על מוצר במקרא כדי להסתירו
          </div>
        </>
      )}

      {/* ════════════════ CHART VIEW ════════════════ */}
      {view === "chart" && (
        <>
          <div className="ppc__chart-caption">
            התפלגות מחירים · גובה הגבעה = כמה סניפים באותו מחיר
          </div>

          {/* legend — product images; tap to show/hide a series */}
          <div className="ppc__legend">
            {products.map((p, pi) => {
              const off = hiddenSeries.has(String(p.barcode));
              return (
                <button
                  key={p.barcode}
                  type="button"
                  className={`ppc__legend-item${off ? " is-off" : ""}`}
                  style={{ "--clr": colorOf(p.barcode) }}
                  onClick={() => toggleSeries(p.barcode)}
                  title={p.name}
                >
                  <span className="ppc__legend-img">
                    <ProductImageDisplay barcode={p.barcode} alt={p.name} />
                  </span>
                  <span className="ppc__legend-dot" />
                  <span className="ppc__legend-name">{p.name}</span>
                </button>
              );
            })}
          </div>
          {curves.some((c) => c.hasAnyDeal) && (
            <div className="ppc__legend-deals">
              <span className="ppc__legend-line" /> מחיר בפועל (מבצע)
              <span className="ppc__legend-dash" /> מחיר רגיל
            </div>
          )}

          {/* focused branch details */}
          {focusPoint && (
            <div className="ppc__focus">
              <button
                type="button"
                className="ppc__focus-close"
                aria-label="סגירה"
                onClick={() => setFocusPoint(null)}
              >
                <IconClose />
              </button>
              <span className="ppc__focus-img">
                <ProductImageDisplay
                  barcode={focusPoint.product.barcode}
                  alt={focusPoint.product.name}
                />
              </span>
              <span className="ppc__focus-text">
                <b>{focusPoint.product.name}</b>
                <i>
                  {focusPoint.row.branchName} · {focusPoint.row.branchAddress}
                </i>
              </span>
              <span className="ppc__focus-logo">
                <SupermarketImage supermarketName={focusPoint.row.chain} />
              </span>
              <span className="ppc__focus-price">
                <b>{money(focusPoint.deal)}</b>
                {focusPoint.deal < focusPoint.base - 0.001 && (
                  <s>{money(focusPoint.base)}</s>
                )}
              </span>
            </div>
          )}

          {/* the distribution */}
          <div className="ppc__dist">
            <svg
              className="ppc__chart-svg"
              viewBox={`0 0 ${PLOT_W} ${PLOT_H + AXIS_H}`}
            >
              <defs>
                {curves.map((c) => {
                  const clr = colorOf(c.s.product.barcode);
                  return (
                    <linearGradient
                      key={c.s.product.barcode}
                      id={`ppcg-${c.s.product.barcode}`}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor={clr} stopOpacity="0.5" />
                      <stop offset="100%" stopColor={clr} stopOpacity="0.03" />
                    </linearGradient>
                  );
                })}
              </defs>

              {/* price gridlines + ₪ ticks */}
              {priceTicks.map((t, i) => (
                <g key={i}>
                  <line
                    x1={xOfPrice(t)}
                    x2={xOfPrice(t)}
                    y1="6"
                    y2={PLOT_H - 6}
                    className="ppc__grid-guide"
                  />
                  <text
                    x={xOfPrice(t)}
                    y={PLOT_H + 14}
                    textAnchor="middle"
                    className="ppc__axis-label"
                  >
                    {money(t)}
                  </text>
                </g>
              ))}
              {/* baseline */}
              <line
                x1="0"
                x2={PLOT_W}
                y1={PLOT_H - 6}
                y2={PLOT_H - 6}
                className="ppc__grid-line"
              />

              {/* the hills — regular (dashed) behind, effective in front */}
              {curves.map((c) => {
                const clr = colorOf(c.s.product.barcode);
                const mode = modeOf(c);
                const peakK = c.dens.indexOf(Math.max(...c.dens));
                return (
                  <g key={c.s.product.barcode}>
                    {c.densBase && (
                      <path
                        d={curvePath(c.densBase)}
                        className="ppc__line ppc__line--dash"
                        style={{ stroke: clr }}
                      />
                    )}
                    <path
                      d={areaPath(c.dens)}
                      className="ppc__area"
                      fill={`url(#ppcg-${c.s.product.barcode})`}
                    />
                    <path
                      d={curvePath(c.dens)}
                      className="ppc__line"
                      style={{ stroke: clr }}
                    />
                    {mode != null && (
                      <text
                        x={xOfPrice(sampleXs[peakK])}
                        y={Math.max(12, yOfD(c.dens[peakK]) - 7)}
                        textAnchor="middle"
                        className="ppc__minlabel"
                        style={{ fill: clr }}
                      >
                        {money(mode)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* baseline branch dots (tap → details); coincident prices stack */}
              {Object.entries(rugClusters).map(([k, arr]) =>
                arr.map(({ s, pt }, j) => {
                  const clr = colorOf(s.product.barcode);
                  const focused =
                    focusPoint &&
                    focusPoint.row.key === pt.row.key &&
                    String(focusPoint.product.barcode) ===
                      String(s.product.barcode);
                  return (
                    <circle
                      key={`${k}-${s.product.barcode}-${pt.row.key}`}
                      cx={xOfPrice(Number(k))}
                      cy={PLOT_H - 12 - j * 7}
                      r={focused ? 5.5 : 3.4}
                      className={`ppc__dot${focused ? " is-focused" : ""}`}
                      style={{ fill: clr }}
                      onClick={() =>
                        setFocusPoint(
                          focused
                            ? null
                            : { row: pt.row, product: s.product, ...pt }
                        )
                      }
                    />
                  );
                })
              )}
            </svg>
          </div>
          <div className="ppc__hint">
            גבעות חופפות = מוצרים באותו מחיר · כל נקודה = סניף (הקש לפרטים) ·
            הקש על מוצר במקרא להסתרה
          </div>
        </>
      )}

      {/* ════════════════ LIST VIEW ════════════════ */}
      {view === "list" && (
        <>
          {products.length > 1 && (
            <div className="ppc__tabs">
              {products.map((p) => (
                <button
                  key={p.barcode}
                  type="button"
                  className={`ppc__tab${
                    String(p.barcode) === String(product.barcode)
                      ? " is-active"
                      : ""
                  }`}
                  onClick={() => {
                    setBarcode(String(p.barcode));
                    setPinnedKey(null);
                    setShowAll(false);
                  }}
                >
                  <span className="ppc__tab-img">
                    <ProductImageDisplay barcode={p.barcode} alt={p.name} />
                  </span>
                  <span className="ppc__tab-name">{p.name}</span>
                </button>
              ))}
            </div>
          )}

          <div className="ppc__head">
            <span className="ppc__prod-img">
              <ProductImageDisplay barcode={product.barcode} alt={product.name} />
            </span>
            <div className="ppc__prod-text">
              <span className="ppc__prod-name">{product.name}</span>
              <div className="ppc__prod-meta">
                {product.brand && (
                  <span className="ppc__chip">{product.brand}</span>
                )}
                {weightLabel && <span className="ppc__chip">{weightLabel}</span>}
                <span className="ppc__chip ppc__chip--dim" dir="ltr">
                  {product.barcode}
                </span>
              </div>
            </div>
          </div>

          <div className="ppc__stats">
            <div className="ppc__stat ppc__stat--best">
              <span className="ppc__stat-label">הכי זול</span>
              <span className="ppc__stat-value">{money(min)}</span>
              {up && up.value > 0 && (
                <span className="ppc__stat-sub">
                  {money(up.value)} {up.label}
                </span>
              )}
            </div>
            <div className="ppc__stat">
              <span className="ppc__stat-label">הכי יקר</span>
              <span className="ppc__stat-value">{money(max)}</span>
              <span className="ppc__stat-sub">{entries.length} סניפים</span>
            </div>
            <div className="ppc__stat">
              <span className="ppc__stat-label">פער מחירים</span>
              <span className="ppc__stat-value ppc__stat-value--spread">
                {spreadPct}%
              </span>
              <span className="ppc__stat-sub">{money(max - min)} הפרש</span>
            </div>
          </div>

          {anyDealList && (
            <div className="ppc__mode" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={priceMode === "deal"}
                className={`ppc__mode-btn${
                  priceMode === "deal" ? " is-active" : ""
                }`}
                onClick={() => setPriceMode("deal")}
              >
                כולל מבצעים
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={priceMode === "base"}
                className={`ppc__mode-btn${
                  priceMode === "base" ? " is-active" : ""
                }`}
                onClick={() => setPriceMode("base")}
              >
                מחיר רגיל
              </button>
            </div>
          )}

          <div className="ppc__board">
            {visibleRows.map((e, idx) => {
              const pct = max > 0 ? Math.max(10, (e.value / max) * 100) : 100;
              const cheapest = idx === 0 && entries.length > 1;
              const priciest =
                idx === entries.length - 1 && entries.length > 1;
              const isPinned = pinnedKey === e.key;
              const delta = pinned && !isPinned ? e.value - pinned.value : null;
              const hasDeal = e.price.hasDiscount && e.price.discount;
              return (
                <button
                  key={e.key}
                  type="button"
                  className={`ppc__row${cheapest ? " is-best" : ""}${
                    priciest ? " is-worst" : ""
                  }${isPinned ? " is-pinned" : ""}`}
                  style={{
                    "--pct": `${pct}%`,
                    "--d": `${Math.min(idx, 10) * 0.05}s`,
                  }}
                  onClick={() => togglePin(e.key)}
                  aria-pressed={isPinned}
                >
                  <span className="ppc__row-fill" aria-hidden="true" />
                  <span className="ppc__rank">{idx + 1}</span>
                  <span className="ppc__logo">
                    <SupermarketImage supermarketName={e.chain} />
                  </span>
                  <span className="ppc__branch">
                    <span className="ppc__branch-name">
                      {e.branchName}
                      {cheapest && <i className="ppc__best-tag">הכי זול</i>}
                      {isPinned && <i className="ppc__pin-tag">מקובע ⚖</i>}
                    </span>
                    <span className="ppc__branch-addr">{e.branchAddress}</span>
                    {hasDeal && (
                      <span className="ppc__deal">
                        מבצע: {e.price.discount.units} ב־
                        {money(e.price.discount.totalPrice)}
                      </span>
                    )}
                  </span>
                  <span className="ppc__price">
                    <b className="ppc__price-num">{money(e.value)}</b>
                    {priceMode === "deal" && hasDeal && e.base !== e.deal && (
                      <s className="ppc__price-was">{money(e.base)}</s>
                    )}
                    {delta != null && Math.abs(delta) > 0.004 && (
                      <span
                        className={`ppc__delta${
                          delta > 0 ? " is-up" : " is-down"
                        }`}
                      >
                        {delta > 0 ? "+" : "−"}
                        {money(Math.abs(delta)).slice(1)} ₪
                      </span>
                    )}
                    {delta != null && Math.abs(delta) <= 0.004 && (
                      <span className="ppc__delta is-same">מחיר זהה</span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {entries.length > COLLAPSED_COUNT && (
            <button
              type="button"
              className="ppc__more"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? "הצג פחות" : `הצג את כל ${entries.length} הסניפים`}
            </button>
          )}

          <div className="ppc__hint">
            {pinned
              ? `משווה מול ${pinned.branchName} · ${pinned.branchAddress} — הקש שוב לביטול`
              : "הקש על סניף כדי להשוות את כולם מולו"}
          </div>
        </>
      )}
    </div>
  );
}
