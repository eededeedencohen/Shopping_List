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

  const sortedPrices = useMemo(() => {
    if (!Array.isArray(priceList)) return [];
    return [...priceList].sort((a, b) => {
      const aPrice = typeof a.price === "number" ? a.price : Number.POSITIVE_INFINITY;
      const bPrice = typeof b.price === "number" ? b.price : Number.POSITIVE_INFINITY;
      return aPrice - bPrice;
    });
  }, [priceList]);

  const cheapestPrice = sortedPrices[0]?.price;
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
      {/* ── Hero card ───────────────────────────── */}
      <section className="compareM__hero">
        <div className="compareM__hero-image">
          <div className="compareM__hero-image-glow" />
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

        <div className="compareM__chips">
          {product.weight !== "" && product.weight !== undefined && product.weight !== 0 && (
            <span className="compareM__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              <span>{product.weight} {unitWeightFormat(product.unitWeight)}</span>
            </span>
          )}
          {product.brand && (
            <span className="compareM__chip">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <circle cx="7" cy="7" r="1" />
              </svg>
              <span>{product.brand}</span>
            </span>
          )}
          <span className="compareM__chip compareM__chip--mono">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 5h2v14H3zM7 5h1v14H7zM11 5h2v14h-2zM15 5h1v14h-1zM19 5h2v14h-2z" />
            </svg>
            <span>{product.barcode}</span>
          </span>
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
      </section>

      {/* ── Prices section ───────────────────────── */}
      {sortedPrices.length === 0 ? (
        <div className="compareM__empty-prices">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
          </svg>
          <p>לא נמצאו מחירים עבור הברקוד הזה</p>
        </div>
      ) : (
        <section className="compareM__prices-section">
          <header className="compareM__prices-header">
            <h3>מחירים בסופרים</h3>
            <span className="compareM__prices-count">{sortedPrices.length}</span>
          </header>

          <div className="compareM__prices-list">
            {Children.toArray(
              sortedPrices.map((priceObject) => {
                const isCheapest =
                  hasMultiplePrices &&
                  typeof priceObject.price === "number" &&
                  priceObject.price === cheapestPrice;
                const addressIsLink =
                  priceObject.supermarket.address?.includes("https");

                return (
                  <article
                    className={`compareM__price-card${isCheapest ? " compareM__price-card--best" : ""}`}
                  >
                    {isCheapest && (
                      <span className="compareM__best-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 2l2.39 4.84L20 7.5l-3.95 3.85L17 17l-5-2.62L7 17l.95-5.65L4 7.5l5.61-.66L12 2z" />
                        </svg>
                        הזול ביותר
                      </span>
                    )}

                    <div className="compareM__price-card-body">
                      <div className="compareM__price-card-logo">
                        <SupermarketImage supermarketName={priceObject.supermarket.name} />
                      </div>

                      <div className="compareM__price-card-info">
                        {addressIsLink ? (
                          <p className="compareM__price-card-name">{priceObject.supermarket.name}</p>
                        ) : (
                          <>
                            <p className="compareM__price-card-name">{priceObject.supermarket.name}</p>
                            <p className="compareM__price-card-address">
                              {priceObject.supermarket.address}
                              {priceObject.supermarket.city ? `, ${priceObject.supermarket.city}` : ""}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="compareM__price-card-price">
                        <span className="compareM__price-currency">₪</span>
                        <span className="compareM__price-value">{priceFormat(priceObject.price)}</span>
                      </div>
                    </div>

                    {priceObject.discount && (
                      <div className="compareM__price-discount">
                        <span className="compareM__price-discount-tag">מבצע</span>
                        <span className="compareM__price-discount-text">
                          {priceObject.discount.units} יח׳ ב-{priceFormat(priceObject.discount.totalPrice)} ₪
                        </span>
                        <span className="compareM__price-discount-unit">
                          ({priceFormat(priceObject.discount.priceForUnit)} ₪ ליחידה)
                        </span>
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
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
