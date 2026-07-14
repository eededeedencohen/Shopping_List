import React, { useMemo, useState } from "react";
import "./ProductPriceComparison.css";
import SupermarketImage from "../../../../../Images/SupermarketImage";
import { ProductImageDisplay } from "../../../../../Images/ProductImageService";
import { unitPrice } from "../../../../../../utils/optimizeCart";

/* B1 — interactive price board. Two views over the same data:
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
const SERIES_COLORS = ["#22d3ee", "#34d399", "#fbbf24", "#ff6584", "#a78bfa", "#f472b6"];
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

  const [view, setView] = useState("chart"); // "chart" | "list"
  const [barcode, setBarcode] = useState(null);
  const [priceMode, setPriceMode] = useState("deal"); // "deal" | "base"
  const [pinnedKey, setPinnedKey] = useState(null);
  const [showAll, setShowAll] = useState(false);
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

  return (
    <div className="ppc" dir="rtl">
      {/* ── view switch ── */}
      <div className="ppc__mode ppc__mode--views" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={view === "chart"}
          className={`ppc__mode-btn${view === "chart" ? " is-active" : ""}`}
          onClick={() => setView("chart")}
        >
          📈 גרף
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === "list"}
          className={`ppc__mode-btn${view === "list" ? " is-active" : ""}`}
          onClick={() => setView("list")}
        >
          ☰ רשימה
        </button>
      </div>

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
                  style={{ "--clr": SERIES_COLORS[pi % SERIES_COLORS.length] }}
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
                  const pi = products.indexOf(c.s.product);
                  const clr = SERIES_COLORS[pi % SERIES_COLORS.length];
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
                const pi = products.indexOf(c.s.product);
                const clr = SERIES_COLORS[pi % SERIES_COLORS.length];
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
                  const pi = products.indexOf(s.product);
                  const clr = SERIES_COLORS[pi % SERIES_COLORS.length];
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
