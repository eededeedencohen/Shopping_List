import { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useFullCart } from "../../hooks/appHooks";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { runCartOptimization } from "../../utils/optimizeCart";
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
export default function CartOptimizeOverlay({ open, onClose, onApply, onResult }) {
  const { fullCart } = useFullCart();
  const fullCartRef = useRef(fullCart);
  fullCartRef.current = fullCart;

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
  const resultRef = useRef(result);
  resultRef.current = result;

  useBodyScrollLock(open);

  const particles = useMemo(() => makeParticles(20), []);
  const smName =
    (fullCartRef.current &&
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
    if (!products.length) {
      setPhase("empty");
      return undefined;
    }
    let cancelled = false;
    const started = Date.now();
    runCartOptimization(fc)
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
      () => setLine((l) => (l + 1) % SCAN_LINES.length),
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
      if (finishedRef.current) return;
      finishedRef.current = true;
      const r = resultRef.current;
      const saved = r && r.changedCount > 0 && r.savings > 0.005;
      onApplyRef.current(saved ? r.optimizedProducts : null);
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

  const saved =
    !!result && result.changedCount > 0 && result.savings > 0.005;
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
    onApply(saved ? result.optimizedProducts : null);
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
              מייעל את העגלה שלך
              <span className="copt__dots">
                <i />
                <i />
                <i />
              </span>
            </span>
            <span className="copt__status-sub">{SCAN_LINES[line]}</span>
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
            <div className="copt__savings">
              {saved ? (
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
                    {result.changedCount === 1
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
                    כל המוצרים כבר במחיר הטוב ביותר
                  </span>
                </>
              )}
            </div>

            {saved && (
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
                key={it.original.barcode + "-" + idx}
                className={
                  "copt__item" + (it.changed ? "" : " copt__item--kept")
                }
                style={{ "--d": `${Math.min(idx, 16) * 0.045}s` }}
              >
                {it.changed ? (
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
                {saved ? (
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
                      {result.changedCount} מוצרים שופרו
                      {keptCount > 0 ? ` · ${keptCount} כבר אופטימליים` : ""}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="copt__summary-check">
                      <IconCheck />
                    </span>
                    <span className="copt__summary-label">
                      כל המוצרים כבר במחיר הטוב ביותר
                    </span>
                    <div className="copt__summary-note">
                      סך העגלה {money(result.beforeTotal)}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="copt__foot">
            <button type="button" className="copt__cta" onClick={applyNow}>
              {saved ? "החל והמשך לעגלה" : "המשך לעגלה"}
              <span className="copt__cta-arrow">
                <IconArrow />
              </span>
            </button>
            <span
              className="copt__progress"
              style={{ animationDuration: `${totalMs}ms` }}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      {/* ── EMPTY / ERROR ── */}
      {(phase === "empty" || phase === "error") && (
        <div className="copt__stage copt__stage--message">
          <CartIcon className="copt__msg-icon" />
          <span className="copt__msg">
            {phase === "empty"
              ? "העגלה ריקה — הוסף מוצרים כדי לייעל אותה"
              : "אירעה שגיאה בייעול. נסה שוב."}
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
