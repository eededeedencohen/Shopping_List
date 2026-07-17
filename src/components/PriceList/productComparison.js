import { useEffect, useMemo, useState, Children } from "react";
import ReactDOM from "react-dom";
import { Spin } from "antd";
import { usePriceList } from "../../context/PriceContext";
import { usePriceCompareLayout } from "../../context/PriceCompareLayoutContext";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import AddFromScraperModal from "../Scraper/AddFromScraperModal";
import { DOMAIN } from "../../constants";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import "./productComparison.css";
import { IconClose } from "../Icons/UiIcons";

const priceFormat = (price) =>
  typeof price === "number" ? price.toFixed(2) : "—";

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

  const toggleGroup = (key) =>
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

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

  if (!priceList || !product) {
    return (
      <div className="compareM-prices-container">
        <div className="spinner-container-modal">
          <Spin size="large" />
          <p>טוען מוצרים...</p>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="compareM-prices-container">
      {/* ── Hero (compact product card) ─────────── */}
      <header className="compareM__hero">
        <div className="compareM__hero-card">
          <button
            type="button"
            className="compareM__hero-image"
            onClick={() => setImageLightboxOpen(true)}
            aria-label="הצג תמונה בגודל מלא"
          >
            {scrapedImage ? (
              <img
                src={scrapedImage}
                alt={product.name}
                className="compareM__hero-image-img"
              />
            ) : (
              <ProductImageDisplay
                barcode={barcode}
                className="compareM__hero-image-img"
              />
            )}
          </button>

          <div className="compareM__hero-info">
            <h2 className="compareM__hero-title">{product.name}</h2>
            {(product.brand ||
              (product.weight !== "" &&
                product.weight !== undefined &&
                product.weight !== 0)) && (
              <p className="compareM__hero-subtitle">
                {product.brand && <span>{product.brand}</span>}
                {product.brand &&
                  product.weight !== "" &&
                  product.weight !== undefined &&
                  product.weight !== 0 && (
                    <span className="compareM__dot" aria-hidden="true">·</span>
                  )}
                {product.weight !== "" &&
                  product.weight !== undefined &&
                  product.weight !== 0 && (
                    <span>
                      {product.weight} {unitWeightFormat(product.unitWeight)}
                    </span>
                  )}
              </p>
            )}
            <p className="compareM__hero-barcode">{product.barcode}</p>
          </div>
        </div>

        {source === "scraper" && (
          <div className="compareM__scraper-notice">
            <div className="compareM__source-badge">
              המוצר אינו במאגר — המחירים נשלפו מ-chp.co.il בזמן אמת
            </div>
            <button
              type="button"
              className="compareM__add-to-db-btn"
              onClick={() => setAddModalOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              הוסף את המוצר למאגר
            </button>
          </div>
        )}
      </header>

      {/* ── Prices section ───────────────────────── */}
      {sortedPrices.length === 0 ? (
        <div className="compareM__empty-prices">
          <p>לא נמצאו מחירים עבור הברקוד הזה</p>
        </div>
      ) : (
        <section className="compareM__prices-section">
          <div className="compareM__prices-header">
            <h3>
              מחירים בסופרים <span className="compareM__prices-count">{sortedPrices.length}</span>
            </h3>

            {hasAnyDiscount && (
              <div className="compareM__price-mode" role="tablist" aria-label="מצב הצגת מחיר">
                <button
                  type="button"
                  className={priceMode === "regular" ? "active" : ""}
                  onClick={() => setPriceMode("regular")}
                  role="tab"
                  aria-selected={priceMode === "regular"}
                >
                  מחיר רגיל
                </button>
                <button
                  type="button"
                  className={priceMode === "unit" ? "active" : ""}
                  onClick={() => setPriceMode("unit")}
                  role="tab"
                  aria-selected={priceMode === "unit"}
                >
                  מחיר ליחידה במבצע
                </button>
              </div>
            )}
          </div>

          <ul className="compareM__prices-list">
            {Children.toArray(
              visibleEntries.map((entry) => {
                const priceObject = entry.representative;
                const branchCount = entry.branches.length;
                const isExpanded = expandedGroups.has(entry.key);
                const isBest =
                  hasMultiplePrices &&
                  typeof entry._effective === "number" &&
                  entry._effective === cheapestEffective;
                const addressIsLink =
                  priceObject.supermarket.address?.includes("https");

                const showingUnitPrice =
                  priceMode === "unit" &&
                  priceObject.discount &&
                  typeof priceObject.discount.priceForUnit === "number";

                const displayedPrice = showingUnitPrice
                  ? priceObject.discount.priceForUnit
                  : priceObject.price;

                return (
                  <li
                    className={`compareM__price-row${isBest ? " best" : ""}${branchCount > 1 ? " is-group" : ""}${isExpanded ? " is-expanded" : ""}`}
                  >
                    <div
                      className="compareM__price-row-main"
                      role={branchCount > 1 ? "button" : undefined}
                      tabIndex={branchCount > 1 ? 0 : undefined}
                      onClick={branchCount > 1 ? () => toggleGroup(entry.key) : undefined}
                      onKeyDown={
                        branchCount > 1
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleGroup(entry.key);
                              }
                            }
                          : undefined
                      }
                      aria-expanded={branchCount > 1 ? isExpanded : undefined}
                    >
                      <div className="compareM__price-row-logo">
                        <SupermarketImage supermarketName={priceObject.supermarket.name} />
                      </div>

                      <div className="compareM__price-row-info">
                        <p className="compareM__price-row-name">
                          <span className="compareM__price-row-name-text">
                            {priceObject.supermarket.name}
                          </span>
                          {branchCount > 1 && (
                            <span className="compareM__branch-count-pill">
                              {branchCount} סניפים
                              <svg
                                className="compareM__branch-pill-chevron"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                aria-hidden="true"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </span>
                          )}
                        </p>
                        {branchCount === 1 && !addressIsLink && (priceObject.supermarket.address || priceObject.supermarket.city) && (
                          <p className="compareM__price-row-address">
                            {priceObject.supermarket.address}
                            {priceObject.supermarket.city ? `, ${priceObject.supermarket.city}` : ""}
                          </p>
                        )}
                        {priceObject.discount && (
                          <p className="compareM__price-row-discount">
                            מבצע: {priceObject.discount.units} ב-{priceFormat(priceObject.discount.totalPrice)} ₪
                            {!showingUnitPrice && (
                              <> · {priceFormat(priceObject.discount.priceForUnit)} ₪ ליח׳</>
                            )}
                          </p>
                        )}
                      </div>

                      <div className="compareM__price-row-price">
                        {isBest && (
                          <span className="compareM__price-row-best-tag">
                            הזול ביותר
                          </span>
                        )}
                        <span className="compareM__price-row-amount">
                          <span className="compareM__price-row-currency">₪</span>
                          {priceFormat(displayedPrice)}
                        </span>
                        {showingUnitPrice && (
                          <span className="compareM__price-row-strike">
                            ₪{priceFormat(priceObject.price)}
                          </span>
                        )}
                      </div>
                    </div>

                    {branchCount > 1 && (
                      <div className="compareM__group-branches" aria-hidden={!isExpanded}>
                        <div className="compareM__group-branches-inner">
                          {entry.branches.map((b, i) => {
                            const bAddrIsLink = b.supermarket.address?.includes("https");
                            return (
                              <div className="compareM__group-branch" key={`${b.supermarket?.supermarketID || b.supermarket?.address}-${i}`}>
                                <span className="compareM__group-branch-dot" />
                                <span className="compareM__group-branch-text">
                                  {bAddrIsLink
                                    ? b.supermarket.name
                                    : `${b.supermarket.address || ""}${b.supermarket.city ? `, ${b.supermarket.city}` : ""}`.trim() || b.supermarket.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </section>
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
