import { useEffect, useState, Children } from "react";
import { Spin } from "antd";
import { usePriceList } from "../../context/PriceContext";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
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
  const [source, setSource] = useState("loading"); // "loading" | "db" | "scraper" | "empty"

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
          setPriceList(
            Array.isArray(data.prices)
              ? data.prices.map(adaptScrapedPrice)
              : []
          );
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
    <div className="compareM-prices-container">
      {/* Product info */}
      <div className="compareM__product">
        <div className="compareM__product-name">
          <p>{product.name}</p>
        </div>
        <div className="compareM__product__image-container">
          {scrapedImage ? (
            <img
              src={scrapedImage}
              alt={product.name}
              className="compareM__product__image"
            />
          ) : (
            <ProductImageDisplay
              barcode={barcode}
              className="compareM__product__image"
            />
          )}
        </div>

        {source === "scraper" && (
          <div className="compareM__source-badge">
            המוצר אינו במאגר — המחירים נשלפו מ-chp.co.il בזמן אמת
          </div>
        )}

        <div className="compareM__details_label">
          <p>:נתונים</p>
        </div>
        <div className="compareM__line" />

        {product.weight !== "" && product.weight !== undefined && (
          <>
            <div className="compareM__product-weight">
              <p style={{ marginLeft: "0.5rem" }}>{":משקל"}</p>
              <p style={{ marginLeft: "0.5rem", fontWeight: "bold" }}>
                {product.weight}
              </p>
              <p style={{ fontWeight: "bold" }}>
                {unitWeightFormat(product.unitWeight)}
              </p>
            </div>
            <div className="compareM__line" />
          </>
        )}

        {product.brand && (
          <>
            <div className="compareM__product-brand">
              <p style={{ marginLeft: "0.5rem" }}>{":חברה/מותג"}</p>
              <p style={{ fontWeight: "bold" }}>{product.brand}</p>
            </div>
            <div className="compareM__line" />
          </>
        )}

        <div className="compareM__product-barcode">
          <p style={{ marginLeft: "0.5rem" }}>{":ברקוד"}</p>
          <p style={{ fontWeight: "bold" }}>{product.barcode}</p>
        </div>
        <div className="compareM__line" style={{ marginBottom: "1rem" }} />
      </div>

      {/* Prices list */}
      {priceList.length === 0 ? (
        <div className="compareM__empty-prices">
          <p>לא נמצאו מחירים עבור הברקוד הזה.</p>
        </div>
      ) : (
        <div className="compareM__prices-list">
          {Children.toArray(
            priceList.map((priceObject) => (
              <div className="compareM__supermarket-price-container">
                <div className="compareM__supermarket-details">
                  <div className="compareM__supermarket-name__image">
                    <SupermarketImage
                      supermarketName={priceObject.supermarket.name}
                    />
                  </div>

                  <div className="compareM__supermarket-address">
                    {priceObject.supermarket.address?.includes("https") ? (
                      <p>{priceObject.supermarket.name}</p>
                    ) : (
                      <>
                        <p>{priceObject.supermarket.address}</p>
                        <p>{priceObject.supermarket.city}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="compareM__product-price">
                  <div className="compareM__price-unit">
                    <p>{":מחיר"}</p>
                    <p style={{ color: "#9c9c9c" }}>
                      {priceFormat(priceObject.price)}
                    </p>
                    <p style={{ color: "#9c9c9c" }}>₪</p>
                  </div>

                  {priceObject.discount && (
                    <div className="compareM__price-sale">
                      <div className="compareM__price-sale_details">
                        <p>{priceObject.discount.units}</p>
                        <p style={{ marginRight: "3px" }}>{"יחידות ב"}</p>
                        <p>{" - "}</p>
                        <p>{priceFormat(priceObject.discount.totalPrice)}</p>
                        <p style={{ marginRight: "3px" }}>{"₪"}</p>
                      </div>
                      <div className="compareM__price-sale_unit-price">
                        <p>{")"}</p>
                        <p>{priceFormat(priceObject.discount.priceForUnit)}</p>
                        <p>{"₪"}</p>
                        <p style={{ marginRight: "4px" }}>{"ליחידה"}</p>
                        <p>{"("}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
