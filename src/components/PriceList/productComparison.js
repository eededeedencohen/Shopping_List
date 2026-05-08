import { useEffect, useMemo, useState, Children } from "react";
import { Spin } from "antd";
import { usePriceList } from "../../context/PriceContext";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import AddFromScraperModal from "../Scraper/AddFromScraperModal";
import { DOMAIN } from "../../constants";
import "./productComparison.css";

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

export default function ProductComparison({ barcode }) {
  const { getPriceList } = usePriceList();
  const [priceList, setPriceList] = useState(undefined);
  const [product, setProduct] = useState(undefined);
  const [scrapedImage, setScrapedImage] = useState(null);
  const [rawScrapedPrices, setRawScrapedPrices] = useState([]);
  const [source, setSource] = useState("loading"); // "loading" | "db" | "scraper" | "empty"
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [priceMode, setPriceMode] = useState("regular"); // "regular" | "unit"

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
      {/* ── Hero (minimal) ──────────────────────── */}
      <header className="compareM__hero">
        <div className="compareM__hero-image">
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
        </div>

        <h2 className="compareM__hero-title">{product.name}</h2>

        <p className="compareM__hero-meta">
          {product.weight !== "" && product.weight !== undefined && product.weight !== 0 && (
            <span>{product.weight} {unitWeightFormat(product.unitWeight)}</span>
          )}
          {product.brand && <span>{product.brand}</span>}
          <span className="compareM__hero-meta-barcode">ברקוד {product.barcode}</span>
        </p>

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
              sortedPrices.map((priceObject) => {
                const isBest =
                  hasMultiplePrices &&
                  typeof priceObject._effective === "number" &&
                  priceObject._effective === cheapestEffective;
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
                  <li className={`compareM__price-row${isBest ? " best" : ""}`}>
                    <div className="compareM__price-row-logo">
                      <SupermarketImage supermarketName={priceObject.supermarket.name} />
                    </div>

                    <div className="compareM__price-row-info">
                      <p className="compareM__price-row-name">{priceObject.supermarket.name}</p>
                      {!addressIsLink && (priceObject.supermarket.address || priceObject.supermarket.city) && (
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
                      {isBest && <span className="compareM__price-row-best-tag">הזול ביותר</span>}
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
    </>
  );
}
