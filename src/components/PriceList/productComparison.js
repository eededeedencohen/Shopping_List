import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { usePriceList } from "../../context/PriceContext";
import { usePriceCompareLayout } from "../../context/PriceCompareLayoutContext";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import AddFromScraperModal from "../Scraper/AddFromScraperModal";
import { DOMAIN } from "../../constants";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";
import "./productComparison.css";
import { IconClose } from "../Icons/UiIcons";

const priceFormat = (price) =>
  typeof price === "number" ? price.toFixed(2) : "-";

const unitWeightFormat = (unitWeight) => {
  switch (unitWeight) {
    case "g":
      return "גרם";
    case "kg":
      return 'ק"ג';
    case "ml":
      return 'מ"ל';
    case "l":
      return "ליטר";
    default:
      return unitWeight || "";
  }
};

const hasWeight = (w) => w !== "" && w !== undefined && w !== null && w !== 0;

/* ── tiny inline icons (no icon font, no extra files) ── */
const IconPin = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-6-5.3-6-10.5a6 6 0 0 1 12 0C18 15.7 12 21 12 21z" />
    <circle cx="12" cy="10.5" r="2.2" />
  </svg>
);
const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
  </svg>
);
const IconChevron = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconTag = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

/**
 * Convert a scraper-formatted price entry into the same shape
 * `productComparison` expects from the DB price service.
 */
const adaptScrapedPrice = (p) => ({
  supermarket: {
    name: p.supermarketName,
    address: p.address,
    city: "",
    supermarketID: p.supermarketID,
  },
  price: p.price,
  hasDiscount: p.hasDiscount,
  discount: p.discount || null,
});

const buildGroupKey = (p) => {
  const chain = p.supermarket?.name || "";
  const priceKey = typeof p.price === "number" ? p.price.toFixed(2) : "x";
  const discKey = p.discount
    ? `${p.discount.units}_${p.discount.totalPrice}_${p.discount.priceForUnit}`
    : "n";
  return `${chain}|${priceKey}|${discKey}`;
};

const isLinkAddress = (addr) => typeof addr === "string" && addr.includes("https");

/* "address, city" for a branch; online branches get a label instead */
const branchPlace = (sm) => {
  if (!sm) return { online: false, text: "" };
  if (isLinkAddress(sm.address)) return { online: true, text: "" };
  const text = `${sm.address || ""}${sm.city ? `, ${sm.city}` : ""}`.trim();
  return { online: false, text };
};

/* ── one-line text that, when it doesn't fit, glides back and forth in
   place so the whole of it can be read (no "…" truncation). Measures its
   own overflow on mount + resize; nothing moves when the text fits. ── */
function SlidingText({ text }) {
  const ref = useRef(null);
  const [shift, setShift] = useState(0);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      const over = el.scrollWidth - el.clientWidth;
      setShift(over > 2 ? over : 0);
    };
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);
  return (
    <span
      ref={ref}
      className={`pc-slide${shift ? " is-sliding" : ""}`}
      style={
        shift
          ? { "--shift": `${shift}px`, "--dur": `${Math.max(3.2, 1.6 + shift / 22)}s` }
          : undefined
      }
    >
      <span className="pc-slide__in">{text}</span>
    </span>
  );
}

/* ── skeleton while the prices load ── */
function Skeleton() {
  return (
    <div className="pc pc--loading" aria-busy="true" aria-label="טוען מחירים">
      <div className="pc__hero">
        <span className="pc-sk pc-sk--img" />
        <div className="pc__text">
          <span className="pc-sk pc-sk--t1" />
          <span className="pc-sk pc-sk--t2" />
          <span className="pc-sk pc-sk--t3" />
        </div>
      </div>
      <div className="pc__stats">
        <span className="pc-sk pc-sk--tile" />
        <span className="pc-sk pc-sk--tile" />
        <span className="pc-sk pc-sk--tile" />
      </div>
      <div className="pc__list">
        <span className="pc-sk pc-sk--row" />
        <span className="pc-sk pc-sk--row" />
        <span className="pc-sk pc-sk--row" />
        <span className="pc-sk pc-sk--row" />
      </div>
    </div>
  );
}

export default function ProductComparison({ barcode }) {
  const { getPriceList } = usePriceList();
  const { layout: compareLayout } = usePriceCompareLayout();
  const [priceList, setPriceList] = useState(undefined);
  const [product, setProduct] = useState(undefined);
  const [scrapedImage, setScrapedImage] = useState(null);
  const [rawScrapedPrices, setRawScrapedPrices] = useState([]);
  const [source, setSource] = useState("loading"); // "loading" | "db" | "scraper" | "empty"
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [priceMode, setPriceMode] = useState("regular"); // "regular" | "unit"
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);
  useBodyScrollLock(imageLightboxOpen);

  const toggleGroup = (key) => {
    haptic("selection");
    uiSound("tap");
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const changeMode = (mode) => {
    if (mode === priceMode) return;
    haptic("selection");
    uiSound("select");
    setPriceMode(mode);
  };

  useEffect(() => {
    if (!barcode) return;
    let cancelled = false;

    const run = async () => {
      setSource("loading");
      setScrapedImage(null);

      // 1. Try the existing DB-backed price list first.
      try {
        const dbResponse = await getPriceList(barcode);
        if (cancelled) return;
        if (dbResponse && dbResponse.product) {
          setProduct(dbResponse.product);
          setPriceList(dbResponse.prices || []);
          setSource("db");
          return;
        }
      } catch {
        /* swallow — fall through to the scraper. */
      }

      // 2. Fall back to the live scraper. We treat the result as a
      //    synthetic product so the rest of the UI keeps working.
      try {
        const res = await fetch(
          `${DOMAIN}/api/v1/scraper/${encodeURIComponent(barcode)}/full`
        );
        const data = await res.json();
        if (cancelled) return;

        if (data && data.status === "success") {
          setProduct({
            barcode,
            name: data.scrapedProductName || `מוצר ${barcode}`,
            brand: "",
            weight: "",
            unitWeight: "",
            __synthetic: true,
          });
          setScrapedImage(data.scrapedImageDataUri || null);
          const rawPrices = Array.isArray(data.prices) ? data.prices : [];
          setRawScrapedPrices(rawPrices);
          setPriceList(rawPrices.map(adaptScrapedPrice));
          setSource("scraper");
          return;
        }
      } catch {
        /* fall through to the empty state. */
      }

      if (!cancelled) {
        setProduct({
          barcode,
          name: `מוצר ${barcode}`,
          brand: "",
          weight: "",
          unitWeight: "",
          __synthetic: true,
        });
        setPriceList([]);
        setSource("empty");
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [barcode, getPriceList]);

  const hasAnyDiscount = useMemo(
    () =>
      Array.isArray(priceList) &&
      priceList.some(
        (p) => p.discount && typeof p.discount.priceForUnit === "number"
      ),
    [priceList]
  );

  const sortedPrices = useMemo(() => {
    if (!Array.isArray(priceList)) return [];
    const effective = (p) => {
      if (priceMode === "unit" && p.discount && typeof p.discount.priceForUnit === "number") {
        return p.discount.priceForUnit;
      }
      return typeof p.price === "number" ? p.price : Number.POSITIVE_INFINITY;
    };
    return [...priceList]
      .map((p) => ({ ...p, _effective: effective(p) }))
      .sort((a, b) => a._effective - b._effective);
  }, [priceList, priceMode]);

  const cheapestEffective = sortedPrices[0]?._effective;
  const hasMultiplePrices = sortedPrices.length > 1;

  // Group adjacent same-chain entries that share price + discount.
  // Because sortedPrices is already sorted by effective price, branches with
  // identical effective price land next to each other; identical (chain + raw
  // price + discount) is what actually means "this is the same offer". A chain
  // with mixed prices ends up split into multiple groups — by design.
  const groupedPrices = useMemo(() => {
    const groups = [];
    const indexByKey = new Map();
    for (const p of sortedPrices) {
      const key = buildGroupKey(p);
      if (indexByKey.has(key)) {
        groups[indexByKey.get(key)].branches.push(p);
      } else {
        indexByKey.set(key, groups.length);
        groups.push({
          key,
          chainName: p.supermarket?.name || "",
          representative: p,
          branches: [p],
          _effective: p._effective,
        });
      }
    }
    return groups;
  }, [sortedPrices]);

  const visibleEntries =
    compareLayout === "grouped" ? groupedPrices : sortedPrices.map((p) => ({
      key: `${p.supermarket?.supermarketID || p.supermarket?.name}|${p._effective}|single`,
      chainName: p.supermarket?.name || "",
      representative: p,
      branches: [p],
      _effective: p._effective,
    }));

  /* ── one-glance numbers for the stat strip ── */
  const stats = useMemo(() => {
    const finite = sortedPrices.filter((p) => Number.isFinite(p._effective));
    if (!finite.length) return null;
    const min = finite[0]._effective;
    const max = finite[finite.length - 1]._effective;
    const chains = new Set(finite.map((p) => p.supermarket?.name || ""));
    const cheapChains = [
      ...new Set(
        finite.filter((p) => p._effective === min).map((p) => p.supermarket?.name || "")
      ),
    ];
    return {
      min,
      max,
      spread: max - min,
      branches: sortedPrices.length,
      chains: chains.size,
      cheapChain: cheapChains[0] || "",
      cheapMore: Math.max(0, cheapChains.length - 1),
    };
  }, [sortedPrices]);

  const handleSaved = async () => {
    setAddModalOpen(false);
    try {
      const dbResponse = await getPriceList(barcode);
      if (dbResponse && dbResponse.product) {
        setProduct(dbResponse.product);
        setPriceList(dbResponse.prices || []);
        setScrapedImage(null);
        setRawScrapedPrices([]);
        setSource("db");
      }
    } catch {
      /* noop — user can re-open the modal to retry */
    }
  };

  if (!priceList || !product) return <Skeleton />;

  const showWeight = hasWeight(product.weight);
  const showMeta = product.brand || showWeight;

  return (
    <>
    <div className="pc">
      {/* ── product header ─────────────────────── */}
      <header className="pc__hero">
        <button
          type="button"
          className="pc__img"
          onClick={() => setImageLightboxOpen(true)}
          aria-label="הצג תמונה בגודל מלא"
        >
          {scrapedImage ? (
            <img src={scrapedImage} alt={product.name} className="pc__img-el" />
          ) : (
            <ProductImageDisplay barcode={barcode} className="pc__img-el" eager />
          )}
        </button>

        <div className="pc__text">
          <h3 className="pc__name">{product.name}</h3>
          {showMeta && (
            <p className="pc__meta">
              {product.brand && <span>{product.brand}</span>}
              {product.brand && showWeight && (
                <span className="pc__dot" aria-hidden="true">·</span>
              )}
              {showWeight && (
                <span>
                  {product.weight} {unitWeightFormat(product.unitWeight)}
                </span>
              )}
            </p>
          )}
          <span className="pc__barcode">{product.barcode}</span>
        </div>
      </header>

      {source === "scraper" && (
        <div className="pc__notice">
          <p className="pc__notice-text">
            המוצר אינו במאגר - המחירים נשלפו מ-chp.co.il בזמן אמת
          </p>
          <button
            type="button"
            className="pc__add-btn"
            onClick={() => setAddModalOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M12 5v14M5 12h14" />
            </svg>
            הוסף את המוצר למאגר
          </button>
        </div>
      )}

      {/* ── prices ─────────────────────────────── */}
      {sortedPrices.length === 0 ? (
        <div className="pc__empty">
          <span className="pc__empty-icon" aria-hidden="true"><IconTag /></span>
          <p>לא נמצאו מחירים עבור הברקוד הזה</p>
        </div>
      ) : (
        <>
          {stats && (
            <div className="pc__stats">
              <div className="pc-stat pc-stat--best">
                <span className="pc-stat__label">הזול ביותר</span>
                <span className="pc-stat__value">
                  <span className="pc-stat__cur">₪</span>{priceFormat(stats.min)}
                </span>
                <span className="pc-stat__sub">
                  {stats.cheapChain}
                  {stats.cheapMore > 0 && ` ועוד ${stats.cheapMore}`}
                </span>
              </div>
              <div className="pc-stat">
                <span className="pc-stat__label">הפרש מהיקר</span>
                <span className={`pc-stat__value${stats.spread > 0 ? " pc-stat__value--spread" : ""}`}>
                  {stats.spread > 0 ? (
                    <><span className="pc-stat__cur">₪</span>{priceFormat(stats.spread)}</>
                  ) : (
                    "אין"
                  )}
                </span>
                <span className="pc-stat__sub">
                  {stats.spread > 0 ? `היקר ₪${priceFormat(stats.max)}` : "אותו מחיר בכולם"}
                </span>
              </div>
              <div className="pc-stat">
                <span className="pc-stat__label">נבדקו</span>
                <span className="pc-stat__value">{stats.branches}</span>
                <span className="pc-stat__sub">
                  סניפים · {stats.chains} רשתות
                </span>
              </div>
            </div>
          )}

          <section className="pc__prices" aria-label="מחירים בסופרים">
            <div className="pc__bar">
              <span className="pc__bar-title">
                {compareLayout === "grouped" && groupedPrices.length !== sortedPrices.length
                  ? `${groupedPrices.length} הצעות מחיר · ${sortedPrices.length} סניפים`
                  : `${sortedPrices.length} סניפים`}
              </span>

              {hasAnyDiscount && (
                <div
                  className="pc-seg"
                  role="tablist"
                  aria-label="מצב הצגת מחיר"
                  style={{ "--pos": priceMode === "unit" ? 1 : 0 }}
                >
                  <span className="pc-seg__thumb" aria-hidden="true" />
                  <button
                    type="button"
                    role="tab"
                    className={priceMode === "regular" ? "is-on" : ""}
                    aria-selected={priceMode === "regular"}
                    onClick={() => changeMode("regular")}
                  >
                    מחיר רגיל
                  </button>
                  <button
                    type="button"
                    role="tab"
                    className={priceMode === "unit" ? "is-on" : ""}
                    aria-selected={priceMode === "unit"}
                    onClick={() => changeMode("unit")}
                  >
                    ליחידה במבצע
                  </button>
                </div>
              )}
            </div>

            <ul className="pc__list">
              {visibleEntries.map((entry, idx) => {
                const priceObject = entry.representative;
                const sm = priceObject.supermarket || {};
                const branchCount = entry.branches.length;
                const isGroup = branchCount > 1;
                const isExpanded = expandedGroups.has(entry.key);
                const isBest =
                  hasMultiplePrices &&
                  typeof entry._effective === "number" &&
                  entry._effective === cheapestEffective;
                const delta =
                  !isBest &&
                  Number.isFinite(entry._effective) &&
                  Number.isFinite(cheapestEffective)
                    ? entry._effective - cheapestEffective
                    : 0;
                const place = branchPlace(sm);

                const showingUnitPrice =
                  priceMode === "unit" &&
                  priceObject.discount &&
                  typeof priceObject.discount.priceForUnit === "number";

                const displayedPrice = showingUnitPrice
                  ? priceObject.discount.priceForUnit
                  : priceObject.price;

                return (
                  <li
                    key={entry.key}
                    className={`pc-row${isBest ? " is-best" : ""}${isGroup ? " is-group" : ""}${isExpanded ? " is-open" : ""}`}
                    style={{ "--i": Math.min(idx, 9) }}
                  >
                    <div
                      className="pc-row__main"
                      role={isGroup ? "button" : undefined}
                      tabIndex={isGroup ? 0 : undefined}
                      onClick={isGroup ? () => toggleGroup(entry.key) : undefined}
                      onKeyDown={
                        isGroup
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleGroup(entry.key);
                              }
                            }
                          : undefined
                      }
                      aria-expanded={isGroup ? isExpanded : undefined}
                    >
                      <div className="pc-row__logo">
                        <SupermarketImage supermarketName={sm.name} />
                      </div>

                      <div className="pc-row__info">
                        <p className="pc-row__name">{sm.name}</p>

                        {isGroup ? (
                          <p className="pc-row__where">
                            <IconPin />
                            <span>{branchCount} סניפים</span>
                            <span className="pc-row__chev" aria-hidden="true">
                              <IconChevron />
                            </span>
                          </p>
                        ) : place.online ? (
                          <p className="pc-row__where pc-row__where--online">
                            <IconGlobe />
                            <span>סניף אונליין</span>
                          </p>
                        ) : place.text ? (
                          <p className="pc-row__where pc-row__where--addr">
                            <IconPin />
                            <SlidingText text={place.text} />
                          </p>
                        ) : null}

                        {priceObject.discount && (
                          <p className="pc-row__deal">
                            <span className="pc-row__deal-tag"><IconTag />מבצע</span>
                            <span>
                              {priceObject.discount.units} ב-₪{priceFormat(priceObject.discount.totalPrice)}
                              {!showingUnitPrice && (
                                <> · ₪{priceFormat(priceObject.discount.priceForUnit)} ליח׳</>
                              )}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="pc-row__price">
                        {isBest ? (
                          <span className="pc-row__best">הזול ביותר</span>
                        ) : delta > 0.004 ? (
                          <span className="pc-row__delta">+₪{priceFormat(delta)}</span>
                        ) : null}
                        <span className="pc-row__amount">
                          <span className="pc-row__cur">₪</span>
                          {priceFormat(displayedPrice)}
                        </span>
                        {showingUnitPrice && (
                          <span className="pc-row__strike">₪{priceFormat(priceObject.price)}</span>
                        )}
                      </div>
                    </div>

                    {isGroup && (
                      <div className="pc-row__more" aria-hidden={!isExpanded}>
                        <div className="pc-row__more-in">
                          <ol className="pc-branches">
                            {entry.branches.map((b, i) => {
                              const bp = branchPlace(b.supermarket);
                              return (
                                <li
                                  className="pc-branch"
                                  key={`${b.supermarket?.supermarketID || b.supermarket?.address}-${i}`}
                                >
                                  <span className="pc-branch__n">{i + 1}</span>
                                  <span className="pc-branch__txt">
                                    {bp.online ? (
                                      <>
                                        <IconGlobe />
                                        <span>אונליין · {b.supermarket?.name}</span>
                                      </>
                                    ) : (
                                      <span>{bp.text || b.supermarket?.name}</span>
                                    )}
                                  </span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </>
      )}
    </div>

    {addModalOpen && (
      <AddFromScraperModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        barcode={barcode}
        scrapedPrices={rawScrapedPrices}
        initialName={product?.name || ""}
        initialImageDataUri={scrapedImage}
        onSaved={handleSaved}
      />
    )}

    {imageLightboxOpen &&
      ReactDOM.createPortal(
        <div
          className="compareM__lightbox"
          role="dialog"
          aria-label="תמונת מוצר מוגדלת"
          onClick={() => setImageLightboxOpen(false)}
        >
          <button
            type="button"
            className="compareM__lightbox-close"
            onClick={() => setImageLightboxOpen(false)}
            aria-label="סגור"
          >
            <IconClose />
          </button>
          <div
            className="compareM__lightbox-stage"
            onClick={(e) => e.stopPropagation()}
          >
            {scrapedImage ? (
              <img
                src={scrapedImage}
                alt={product.name}
                className="compareM__lightbox-img"
              />
            ) : (
              <ProductImageDisplay
                barcode={barcode}
                className="compareM__lightbox-img"
              />
            )}
          </div>
        </div>,
        document.getElementById("modal-root") || document.body
      )}
    </>
  );
}
