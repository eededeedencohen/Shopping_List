import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useFullCart, useProductList, usePriceMap } from "../../hooks/appHooks";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import {
  runCartOptimization,
  runCompareOptimization,
  runCompleteCart,
  runCompleteAndCompare,
} from "../../utils/optimizeCart";
import ProductImageDisplay from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import { ReactComponent as CartIcon } from "../Cart/Icons/shopping-cart.svg";
import "./CartOptimizeOverlay.css";

const MIN_COMPUTE_MS = 2600; // let the animation breathe even if the API is fast
const COUNTUP_MS = 1100;
const REVEAL_LEAD_MS = 900; // pause on the payoff before the list auto-scrolls
const SCROLL_PER_ITEM_MS = 230; // snappy glide through the products
const SCROLL_MIN_MS = 1100;
const SCROLL_MAX_MS = 3200;
const REVEAL_TAIL_MS = 1500; // pause on the summary before continuing to the cart

const SCAN_LINES = [
  "סורק חלופות זולות…",
  "משווה מחיר ל-100 גרם ומבצעים…",
  "בונה את העגלה המשתלמת…",
];
const COMPARE_SCAN_LINES = [
  "בודק את הסופרים שבחרת…",
  "מתמחר את העגלה בכל סופר…",
  "מוצא את הסופר הזול ביותר…",
];
const COMPLETE_SCAN_LINES = [
  "עובר על רשימת העגלה השלמה…",
  "בודק מה חסר בעגלה…",
  "בוחר את המוצרים המשתלמים…",
];
const COMPLETE_COMPARE_SCAN_LINES = [
  "משלים את המוצרים החסרים…",
  "בונה עגלה מלאה…",
  "משווה מחירים בין הסופרים…",
  "מוצא את הסופר הזול ביותר…",
];

/* Clean vector icons (no text glyphs). */
const IconClose = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);
const IconArrow = (props) => (
  // points LEFT — the RTL "forward" / original → optimized direction
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 5 5 12 12 19" />
  </svg>
);
const IconCheck = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconPlus = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
    strokeLinecap="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

/* Rising sparkle particles for the light result field. */
function makeParticles(n) {
  return Array.from({ length: n }, (_, i) => ({
    left: Math.round(Math.random() * 100),
    top: Math.round(Math.random() * 100),
    size: 4 + Math.round(Math.random() * 7),
    delay: (Math.random() * 2.4).toFixed(2),
    dur: (2.4 + Math.random() * 2.6).toFixed(2),
    key: i,
  }));
}

const money = (n) => "₪" + (Number(n) || 0).toFixed(2);
const unit = (n) => (Number(n) || 0).toFixed(2);

/**
 * Full-screen "optimize my cart" experience (LIGHT theme, mirroring the
 * cheapest-supermarket flow): an animated compute phase, then a full-height
 * reveal of the savings (₪ and %) with a per-100g / per-unit before→after list
 * that auto-scrolls and then continues to the cart on its own.
 */
export default function CartOptimizeOverlay({
  open,
  onClose,
  onApply,
  onResult,
  mode = "current",
  candidateSupermarkets,
  completeNames,
  completeStrategy = "cheapest",
  /* voice flow: don't auto-continue at the end of the reveal — stay on the
     summary and wait for an explicit apply/close (spoken or tapped) */
  holdOpen = false,
}) {
  const completeCompare = mode === "completeCompare";
  const compare = mode === "compare" || completeCompare;
  const complete = mode === "complete";
  const { fullCart } = useFullCart();
  const { products } = useProductList();
  const { pricesMap } = usePriceMap();
  const fullCartRef = useRef(fullCart);
  fullCartRef.current = fullCart;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const candidatesRef = useRef(candidateSupermarkets);
  candidatesRef.current = candidateSupermarkets;
  const completeRef = useRef(null);
  completeRef.current = {
    products,
    pricesMap,
    names: completeNames,
    strategy: completeStrategy,
    candidateSupermarkets,
  };
  const scanLines = complete
    ? COMPLETE_SCAN_LINES
    : completeCompare
    ? COMPLETE_COMPARE_SCAN_LINES
    : compare
    ? COMPARE_SCAN_LINES
    : SCAN_LINES;

  const [phase, setPhase] = useState("computing"); // computing | done | empty | error
  const [result, setResult] = useState(null);
  const [displaySavings, setDisplaySavings] = useState(0);
  const [line, setLine] = useState(0);

  const itemsRef = useRef(null);
  const finishedRef = useRef(false);
  const onApplyRef = useRef(onApply);
  onApplyRef.current = onApply;
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;
  const holdOpenRef = useRef(holdOpen);
  holdOpenRef.current = holdOpen;
  const resultRef = useRef(result);
  resultRef.current = result;

  useBodyScrollLock(open);

  const particles = useMemo(() => makeParticles(20), []);
  const smName =
    (!compare &&
      !complete &&
      fullCartRef.current &&
      fullCartRef.current.supermarket &&
      fullCartRef.current.supermarket.name) ||
    "";
  const chips = useMemo(() => {
    const list =
      (fullCartRef.current && fullCartRef.current.productsWithPrices) || [];
    return list
      .slice(0, 6)
      .map((p) => (p.product && p.product.name) || "")
      .filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  /* Run the optimization when the overlay opens. */
  useEffect(() => {
    if (!open) return undefined;
    setPhase("computing");
    setResult(null);
    setDisplaySavings(0);
    finishedRef.current = false;
    const fc = fullCartRef.current;
    const products = (fc && fc.productsWithPrices) || [];
    /* An EMPTY cart is a valid start for the complete flows (#6/#7) — they fill
       the whole defined list from scratch. Only the optimize/compare flows need
       existing products to work on. */
    const emptyOk =
      modeRef.current === "complete" || modeRef.current === "completeCompare";
    if (!products.length && !emptyOk) {
      setPhase("empty");
      return undefined;
    }
    let cancelled = false;
    const started = Date.now();
    const run =
      modeRef.current === "completeCompare"
        ? runCompleteAndCompare(fc, completeRef.current)
        : modeRef.current === "complete"
        ? runCompleteCart(fc, completeRef.current)
        : modeRef.current === "compare"
        ? runCompareOptimization(fc, candidatesRef.current)
        : runCartOptimization(fc);
    run
      .then((r) => {
        if (cancelled) return;
        const wait = Math.max(0, MIN_COMPUTE_MS - (Date.now() - started));
        setTimeout(() => {
          if (cancelled) return;
          setResult(r);
          setPhase(r && r.empty ? "empty" : "done");
        }, wait);
      })
      .catch(() => {
        if (cancelled) return;
        const wait = Math.max(0, MIN_COMPUTE_MS - (Date.now() - started));
        setTimeout(() => {
          if (!cancelled) setPhase("error");
        }, wait);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  /* Cycle the "scanning…" status lines while computing. */
  useEffect(() => {
    if (!open || phase !== "computing") return undefined;
    const t = setInterval(
      () => setLine((l) => (l + 1) % scanLines.length),
      1100
    );
    return () => clearInterval(t);
  }, [open, phase]);

  /* Count the savings up on reveal. */
  useEffect(() => {
    if (phase !== "done" || !result) return undefined;
    const target = Math.max(0, result.savings || 0);
    const t0 = Date.now();
    let raf;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / COUNTUP_MS);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplaySavings(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase, result]);

  /* Auto-scroll the before/after list, then continue to the cart on its own. */
  useEffect(() => {
    if (phase !== "done" || !result) return undefined;
    let raf;
    let leadT;
    let tailT;
    const shown = result.items ? result.items.length : 0;
    const scrollDur = Math.min(
      SCROLL_MAX_MS,
      Math.max(SCROLL_MIN_MS, shown * SCROLL_PER_ITEM_MS)
    );

    const finish = () => {
      if (holdOpenRef.current) return; // voice decides — no auto-continue
      if (finishedRef.current) return;
      finishedRef.current = true;
      const r = resultRef.current;
      if (r && r.completeCompare) {
        onApplyRef.current(null, r);
        return;
      }
      const ok = r && r.complete ? r.addedCount > 0 : r && r.changedCount > 0 && r.savings > 0.005;
      const payload = r && r.complete ? r.addedProducts : r && r.optimizedProducts;
      onApplyRef.current(ok ? payload : null, r);
    };

    leadT = setTimeout(() => {
      const el = itemsRef.current;
      const dist = el ? el.scrollHeight - el.clientHeight : 0;
      if (el && dist > 4) {
        const t0 = Date.now();
        const step = () => {
          const p = Math.min(1, (Date.now() - t0) / scrollDur);
          const eased =
            p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2; // easeInOut
          el.scrollTop = dist * eased;
          if (p < 1) raf = requestAnimationFrame(step);
          else tailT = setTimeout(finish, REVEAL_TAIL_MS);
        };
        raf = requestAnimationFrame(step);
      } else {
        tailT = setTimeout(finish, REVEAL_TAIL_MS);
      }
    }, REVEAL_LEAD_MS);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(leadT);
      clearTimeout(tailT);
    };
  }, [phase, result]);

  /* Report the result once it's revealed (so a voice-triggered optimize can
     speak a short summary of what was worthwhile). */
  useEffect(() => {
    if (phase === "done" && result && typeof onResultRef.current === "function") {
      onResultRef.current(result);
    }
  }, [phase, result]);

  if (!open) return null;

  const saved = complete
    ? !!result && result.addedCount > 0
    : !!result && result.changedCount > 0 && result.savings > 0.005;
  const items = result ? result.items || [] : [];
  const keptCount = items.filter((i) => !i.changed).length;
  const totalMs =
    REVEAL_LEAD_MS +
    Math.min(
      SCROLL_MAX_MS,
      Math.max(SCROLL_MIN_MS, items.length * SCROLL_PER_ITEM_MS)
    ) +
    REVEAL_TAIL_MS;

  const applyNow = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (completeCompare) {
      onApply(null, result);
      return;
    }
    const payload = complete ? result.addedProducts : result.optimizedProducts;
    onApply(saved ? payload : null, result);
  };

  const overlay = (
    <div className="copt" dir="rtl">
      <div className="copt__bg" aria-hidden="true" />
      <button
        type="button"
        className="copt__close"
        onClick={onClose}
        aria-label="סגור"
      >
        <IconClose />
      </button>

      {/* ── COMPUTING ── */}
      {phase === "computing" && (
        <div className="copt__stage copt__stage--computing">
          <div className="copt__reactor" aria-hidden="true">
            <span className="copt__glow" />
            <span className="copt__ring copt__ring--1" />
            <span className="copt__ring copt__ring--2" />
            <span className="copt__ring copt__ring--3" />
            <span className="copt__logocard">
              {smName ? (
                <SupermarketImage
                  supermarketName={smName}
                  className="copt__logo"
                />
              ) : (
                <CartIcon className="copt__logo-cart" />
              )}
              <span className="copt__scanline" />
            </span>
            {chips.map((c, i) => (
              <span
                key={c + i}
                className="copt__chip"
                style={{ "--i": i, "--n": chips.length || 1 }}
              >
                {c}
              </span>
            ))}
          </div>
          <div className="copt__status">
            <span className="copt__status-title">
              {completeCompare
                ? "משלים ומוצא את הזול ביותר"
                : complete
                ? "משלים את העגלה שלך"
                : compare
                ? "משווה מחירים בין הסופרים"
                : "מייעל את העגלה שלך"}
              <span className="copt__dots">
                <i />
                <i />
                <i />
              </span>
            </span>
            <span className="copt__status-sub">{scanLines[line]}</span>
          </div>
        </div>
      )}

      {/* ── DONE / REVEAL ── */}
      {phase === "done" && result && (
        <div className="copt__stage copt__stage--done">
          <div className="copt__sparkles" aria-hidden="true">
            {particles.map((p) => (
              <span
                key={p.key}
                className="copt__sparkle"
                style={{
                  left: `${p.left}%`,
                  top: `${p.top}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  animationDelay: `${p.delay}s`,
                  animationDuration: `${p.dur}s`,
                }}
              />
            ))}
          </div>

          <div className="copt__head">
            {completeCompare && result.completedCount > 0 && (
              <div className="copt__ccbadge">
                <IconPlus />
                <span>
                  השלמתי {result.completedCount}{" "}
                  {result.completedCount === 1 ? "מוצר חסר" : "מוצרים חסרים"}
                </span>
              </div>
            )}
            {compare && saved && result.targetSupermarket && (
              <div className="copt__target">
                <span className="copt__target-logo">
                  <SupermarketImage
                    supermarketName={result.targetSupermarket.name}
                  />
                </span>
                <span className="copt__target-text">
                  <span className="copt__target-label">הסופר הזול ביותר</span>
                  <span className="copt__target-name">
                    {result.targetSupermarket.name ||
                      `סופר #${result.targetSupermarket.supermarketID}`}
                  </span>
                </span>
              </div>
            )}
            <div className="copt__savings">
              {complete ? (
                <>
                  <span
                    className={
                      "copt__savings-check" +
                      (saved ? " copt__savings-check--add" : "")
                    }
                  >
                    {saved ? <IconPlus /> : <IconCheck />}
                  </span>
                  <span className="copt__savings-label copt__savings-label--ok">
                    {!saved
                      ? "העגלה כבר שלמה — כל מה שהגדרת בפנים"
                      : result.addedCount === 1
                      ? "השלמתי מוצר אחד לעגלה"
                      : `השלמתי ${result.addedCount} מוצרים לעגלה`}
                  </span>
                  {saved && (
                    <span className="copt__savings-sub">
                      {completeStrategy === "lastPurchased"
                        ? "לפי מה שקנית לאחרונה (בסופר הנוכחי)"
                        : "הזול ביותר ליחידת משקל בסופר הנוכחי"}
                    </span>
                  )}
                </>
              ) : saved ? (
                <>
                  <span className="copt__savings-label">חסכת</span>
                  <div className="copt__savings-row">
                    <span className="copt__savings-amount">
                      {money(displaySavings)}
                    </span>
                    {result.savingsPct > 0 && (
                      <span className="copt__savings-pct">
                        {result.savingsPct}% חיסכון
                      </span>
                    )}
                  </div>
                  <span className="copt__savings-sub">
                    {completeCompare
                      ? "עגלה מלאה, במחיר הזול ביותר מבין הסופרים שבחרת"
                      : compare
                      ? "המחיר הזול ביותר מבין הסופרים שבחרת"
                      : result.changedCount === 1
                      ? "מוצר אחד קיבל מחיר טוב יותר ליחידה"
                      : `${result.changedCount} מוצרים קיבלו מחיר טוב יותר ליחידה`}
                  </span>
                </>
              ) : (
                <>
                  <span className="copt__savings-check">
                    <IconCheck />
                  </span>
                  <span className="copt__savings-label copt__savings-label--ok">
                    {completeCompare
                      ? result.targetSupermarket
                        ? "העגלה מושלמת, וכבר במחיר הטוב ביותר"
                        : "השלמתי את העגלה, אך אף סופר לא מחזיק את כולה"
                      : compare
                      ? "העגלה שלך כבר זולה מכל הסופרים שבחרת"
                      : "כל המוצרים כבר במחיר הטוב ביותר"}
                  </span>
                </>
              )}
            </div>

            {saved && !complete && (
              <div className="copt__totals">
                <span className="copt__total copt__total--before">
                  {money(result.beforeTotal)}
                </span>
                <span className="copt__total-arrow">
                  <IconArrow />
                </span>
                <span className="copt__total copt__total--after">
                  {money(result.afterTotal)}
                </span>
              </div>
            )}
          </div>

          <div className="copt__items" ref={itemsRef}>
            {items.map((it, idx) => (
              <div
                key={(it.added ? it.barcode : it.original.barcode) + "-" + idx}
                className={
                  "copt__item" +
                  (it.added || !it.changed ? " copt__item--kept" : "") +
                  (it.completed ? " copt__item--completed" : "")
                }
                style={{ "--d": `${Math.min(idx, 16) * 0.045}s` }}
              >
                {it.completed && (
                  <span className="copt__item-added-tag">
                    <IconPlus />
                    הושלם
                  </span>
                )}
                {it.added ? (
                  <div className="copt__kept-row">
                    <span className="copt__imgwrap copt__imgwrap--kept">
                      <ProductImageDisplay
                        barcode={it.barcode}
                        className="copt__img"
                      />
                    </span>
                    <span className="copt__text">
                      <span className="copt__name">{it.name}</span>
                      <span className="copt__unit copt__unit--kept">
                        <b className="copt__unit-num">{money(it.unitValue)}</b>
                        <i className="copt__unit-label">{it.unitLabel}</i>
                        {it.amount > 1 && (
                          <i className="copt__unit-label">{` · ×${it.amount}`}</i>
                        )}
                      </span>
                    </span>
                    <span className="copt__kept-tag copt__kept-tag--add">
                      <IconPlus />
                      {it.via === "history" ? "כמו שקנית" : "נוסף"}
                    </span>
                  </div>
                ) : it.changed ? (
                  <>
                    <div className="copt__side copt__side--old">
                      <span className="copt__imgwrap">
                        <ProductImageDisplay
                          barcode={it.original.barcode}
                          className="copt__img"
                        />
                      </span>
                      <span className="copt__text">
                        <span className="copt__name">{it.original.name}</span>
                        <span className="copt__unit copt__unit--old">
                          <b className="copt__unit-num">
                            {money(it.original.unitValue)}
                          </b>
                          <i className="copt__unit-label">
                            {it.original.unitLabel}
                          </i>
                        </span>
                      </span>
                    </div>
                    <span className="copt__mid">
                      <IconArrow />
                      {it.unitPct > 0 && (
                        <span className="copt__pct">−{it.unitPct}%</span>
                      )}
                    </span>
                    <div className="copt__side copt__side--new">
                      <span className="copt__text copt__text--new">
                        <span className="copt__name">{it.optimized.name}</span>
                        <span className="copt__unit copt__unit--new">
                          <b className="copt__unit-num">
                            {money(it.optimized.unitValue)}
                          </b>
                          <i className="copt__unit-label">
                            {it.optimized.unitLabel}
                          </i>
                        </span>
                      </span>
                      <span className="copt__imgwrap">
                        <ProductImageDisplay
                          barcode={it.optimized.barcode}
                          className="copt__img"
                        />
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="copt__kept-row">
                    <span className="copt__imgwrap copt__imgwrap--kept">
                      <ProductImageDisplay
                        barcode={it.original.barcode}
                        className="copt__img"
                      />
                    </span>
                    <span className="copt__text">
                      <span className="copt__name">{it.original.name}</span>
                      <span className="copt__unit copt__unit--kept">
                        <b className="copt__unit-num">
                          {money(it.original.unitValue)}
                        </b>
                        <i className="copt__unit-label">
                          {it.original.unitLabel}
                        </i>
                      </span>
                    </span>
                    <span className="copt__kept-tag">
                      <IconCheck />
                      כבר אופטימלי
                    </span>
                  </div>
                )}
              </div>
            ))}

            {/* final row — the takeaway summary the list lands on */}
            {items.length > 0 && (
              <div
                className={"copt__summary" + (saved ? "" : " copt__summary--ok")}
              >
                {complete ? (
                  <>
                    <span className="copt__summary-check copt__summary-check--add">
                      <IconPlus />
                    </span>
                    <span className="copt__summary-label">
                      {result.addedCount === 1
                        ? "מוצר אחד נוסף לעגלה"
                        : `${result.addedCount} מוצרים נוספו לעגלה`}
                    </span>
                    <div className="copt__summary-note">
                      {completeStrategy === "lastPurchased"
                        ? "לפי הרכישות האחרונות שלך"
                        : "הבחירה המשתלמת ביותר בסופר הנוכחי"}
                    </div>
                  </>
                ) : saved ? (
                  <>
                    <div className="copt__summary-row">
                      <span className="copt__summary-label">בסך הכול חסכת</span>
                      <span className="copt__summary-amount">
                        {money(result.savings)}
                      </span>
                      {result.savingsPct > 0 && (
                        <span className="copt__summary-pct">
                          {result.savingsPct}%
                        </span>
                      )}
                    </div>
                    <div className="copt__summary-totals">
                      <span className="copt__summary-before">
                        {money(result.beforeTotal)}
                      </span>
                      <span className="copt__summary-arrow">
                        <IconArrow />
                      </span>
                      <span className="copt__summary-after">
                        {money(result.afterTotal)}
                      </span>
                    </div>
                    <div className="copt__summary-note">
                      {completeCompare
                        ? `בסופר ${
                            result.targetSupermarket
                              ? result.targetSupermarket.name || "הזול ביותר"
                              : "הזול ביותר"
                          }${
                            result.completedCount > 0
                              ? ` · ${result.completedCount} הושלמו`
                              : ""
                          }`
                        : compare && result.targetSupermarket
                        ? `בסופר ${result.targetSupermarket.name || "הזול ביותר"}`
                        : `${result.changedCount} מוצרים שופרו${
                            keptCount > 0 ? ` · ${keptCount} כבר אופטימליים` : ""
                          }`}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="copt__summary-check">
                      <IconCheck />
                    </span>
                    <span className="copt__summary-label">
                      {completeCompare
                        ? result.completedCount > 0
                          ? `העגלה הושלמה (${result.completedCount})`
                          : "העגלה כבר מלאה ובמחיר טוב"
                        : compare
                        ? "העגלה שלך כבר זולה מכל הסופרים שבחרת"
                        : "כל המוצרים כבר במחיר הטוב ביותר"}
                    </span>
                    <div className="copt__summary-note">
                      סך העגלה {money(result.beforeTotal)}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* honest ranking of every store that was evaluated — the winner
                is highlighted; totals include unplaceable items kept at the
                current store's prices */}
            {compare && !completeCompare && result && result.ranked && result.ranked.length > 1 && (
              <div className="copt__rank">
                <div className="copt__rank-title">דירוג הסופרים שנבדקו</div>
                {result.ranked.map((r, i) => {
                  const winner =
                    result.targetSupermarket &&
                    String(r.supermarketID) ===
                      String(result.targetSupermarket.supermarketID);
                  return (
                    <div
                      key={r.supermarketID}
                      className={`copt__rank-row${winner ? " is-winner" : ""}`}
                    >
                      <span className="copt__rank-pos">{i + 1}</span>
                      <span className="copt__rank-logo">
                        <SupermarketImage supermarketName={r.name} />
                      </span>
                      <span className="copt__rank-name">
                        {r.name}
                        {r.address ? <i>{r.address}</i> : null}
                      </span>
                      <span className="copt__rank-price">
                        {money(r.total)}
                        {r.missing > 0 && <i>חסרים {r.missing}</i>}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="copt__foot">
            <button type="button" className="copt__cta" onClick={applyNow}>
              {complete
                ? "המשך לעגלה"
                : saved
                ? compare
                  ? "החלף לסופר הזול והמשך"
                  : "החל והמשך לעגלה"
                : "המשך לעגלה"}
              <span className="copt__cta-arrow">
                <IconArrow />
              </span>
            </button>
            {!holdOpen && (
              <span
                className="copt__progress"
                style={{ animationDuration: `${totalMs}ms` }}
                aria-hidden="true"
              />
            )}
          </div>
        </div>
      )}

      {/* ── EMPTY / ERROR ── */}
      {(phase === "empty" || phase === "error") && (
        <div className="copt__stage copt__stage--message">
          <CartIcon className="copt__msg-icon" />
          <span className="copt__msg">
            {phase === "error"
              ? "אירעה שגיאה. נסה שוב."
              : result && result.reason === "no-names"
              ? 'לא הגדרת "עגלה שלמה" — בחר מוצרים בהגדרות תחילה.'
              : result && result.reason === "no-carrier"
              ? "אף אחד מהסופרים שבחרת לא מחזיק את כל מוצרי העגלה. נסה קבוצה אחרת."
              : result && result.reason === "no-candidates"
              ? "לא נבחרו סופרים להשוואה."
              : compare
              ? "העגלה ריקה — הוסף מוצרים כדי להשוות בין הסופרים"
              : "העגלה ריקה — הוסף מוצרים כדי לייעל אותה"}
          </span>
          <button type="button" className="copt__cta" onClick={onClose}>
            סגור
          </button>
        </div>
      )}
    </div>
  );

  const root = document.getElementById("modal-root") || document.body;
  return ReactDOM.createPortal(overlay, root);
}
