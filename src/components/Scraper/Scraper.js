import React, { useState, useMemo } from "react";
import { DOMAIN } from "../../constants";
import { useProductList } from "../../hooks/appHooks";
import ServerProductImage from "../Images/ServerProductImage";
import AddFromScraperModal from "./AddFromScraperModal";
import "./Scraper.css";

function Scraper() {
  const { products } = useProductList();
  const [barcode, setBarcode] = useState("");
  const [html, setHtml] = useState("");
  const [url, setUrl] = useState("");
  const [prices, setPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("prices");
  const [showAddModal, setShowAddModal] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdateAllPrices = async () => {
    if (!prices?.prices || updating) return;
    setUpdating(true);
    setSavedMsg("");

    try {
      const res = await fetch(`${DOMAIN}/api/v1/scraper/update-prices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barcode: prices.barcode,
          prices: prices.prices,
        }),
      });
      const data = await res.json();

      if (data.status === "success") {
        setSavedMsg(
          `עודכנו ${data.data.total} מחירים` +
          (data.data.newSupermarkets.length > 0
            ? ` + ${data.data.newSupermarkets.length} סופרמרקטים חדשים`
            : "")
        );
      } else {
        setSavedMsg("שגיאה: " + data.message);
      }
    } catch (err) {
      setSavedMsg("שגיאה: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteProduct = async () => {
    if (!prices?.barcode || deleting) return;
    if (!window.confirm(`למחוק את המוצר ${prices.barcode} + כל המחירים שלו?`)) return;
    setDeleting(true);
    setSavedMsg("");

    try {
      const res = await fetch(`${DOMAIN}/api/v1/scraper/product/${prices.barcode}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.status === "success") {
        setSavedMsg(
          `נמחק: מוצר (${data.data.productDeleted}), ` +
          `מחירים (${data.data.pricesDeleted}), ` +
          `תמונה (${data.data.imageDeleted})`
        );
        setPrices(null);
        setHtml("");
        setUrl("");
      } else {
        setSavedMsg("שגיאה: " + data.message);
      }
    } catch (err) {
      setSavedMsg("שגיאה: " + err.message);
    } finally {
      setDeleting(false);
    }
  };

  const barcodeSet = useMemo(() => {
    const set = new Set();
    if (products) products.forEach((p) => set.add(p.barcode));
    return set;
  }, [products]);

  const barcodeExists = barcode.length > 0 && barcodeSet.has(barcode);

  const handleFetch = async () => {
    if (!barcode.trim()) return;
    setLoading(true);
    setError("");
    setHtml("");
    setUrl("");
    setPrices(null);
    setSavedMsg("");

    try {
      const res = await fetch(`${DOMAIN}/api/v1/scraper/${barcode.trim()}/full`);
      const data = await res.json();

      if (data.status === "success") {
        setHtml(data.html);
        setUrl(data.url);
        setPrices(data);
      } else {
        setError(data.message || "שגיאה");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleFetch();
  };

  const product = prices?.product;

  return (
    <div className="scraper-page">
      <div className="scraper-header">
        <h1>שליפת מחירים לפי ברקוד</h1>
      </div>

      <div className="scraper-input-row">
        <div className="scraper-input-wrap">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="הזן ברקוד..."
            className={`scraper-input ${barcode.length === 0 ? "" : barcodeExists ? "input-exists" : "input-new"}`}
          />
          {barcode.length >= 2 && (
            <span className={`scraper-validation ${barcodeExists ? "exists" : "new"}`}>
              {barcodeExists ? "קיים ב-DB" : "לא נמצא ב-DB"}
            </span>
          )}
        </div>
        <button
          className={`scraper-btn ${loading ? "loading" : ""}`}
          onClick={handleFetch}
          disabled={loading || !barcode.trim()}
        >
          {loading ? "טוען..." : "שלוף"}
        </button>
      </div>

      {error && <div className="scraper-error">{error}</div>}

      {url && (
        <div className="scraper-url">
          <a href={url} target="_blank" rel="noreferrer">{url}</a>
        </div>
      )}

      {/* Product Info Card */}
      {prices && (
        <div className="scraper-product-card">
          <div className="scraper-product-image">
            <ServerProductImage barcode={prices.barcode} />
          </div>
          <div className="scraper-product-info">
            {product ? (
              <>
                <span className="scraper-product-name">{product.name}</span>
                <span className="scraper-product-detail">{product.brand} | {product.weight}{product.unitWeight}</span>
                <span className="scraper-product-detail">{product.category} &gt; {product.subcategory}</span>
                <span className="scraper-product-barcode">{prices.barcode}</span>
                <button
                  className="scraper-update-btn"
                  onClick={handleUpdateAllPrices}
                  disabled={updating}
                >
                  {updating ? "מעדכן..." : "עדכן את כל המחירים"}
                </button>
                <button
                  className="scraper-delete-btn"
                  onClick={handleDeleteProduct}
                  disabled={deleting}
                >
                  {deleting ? "מוחק..." : "מחק מוצר + מחירים"}
                </button>
              </>
            ) : (
              <>
                <span className="scraper-product-name">מוצר לא נמצא ב-DB</span>
                <span className="scraper-product-barcode">{prices.barcode}</span>
                <button
                  className="scraper-add-product-btn"
                  onClick={() => setShowAddModal(true)}
                >
                  + הוסף מוצר ושמור מחירים
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {savedMsg && <div className="scraper-success">{savedMsg}</div>}

      {/* Tabs */}
      {(prices || html) && (
        <div className="scraper-tabs">
          <button
            className={`scraper-tab ${tab === "prices" ? "active" : ""}`}
            onClick={() => setTab("prices")}
          >
            מחירים {prices ? `(${prices.results})` : ""}
          </button>
          <button
            className={`scraper-tab ${tab === "html" ? "active" : ""}`}
            onClick={() => setTab("html")}
          >
            HTML
          </button>
        </div>
      )}

      {/* Prices Tab */}
      {tab === "prices" && prices && (
        <div className="scraper-prices">
          <div className="scraper-stats">
            <span className="stat">{prices.results} תוצאות</span>
            <span className="stat matched">{prices.matched} מותאמים</span>
            {prices.unmatched > 0 && (
              <span className="stat unmatched">{prices.unmatched} לא מותאמים</span>
            )}
            {prices.dbPricesCount > 0 && (
              <span className="stat db">{prices.dbPricesCount} מחירים ב-DB</span>
            )}
          </div>

          <div className="price-list">
            {prices.prices.map((p, i) => {
              const db = p.dbPrice;
              const priceDiff = db ? (p.price - db.price) : null;
              const hasDiff = priceDiff !== null && Math.abs(priceDiff) >= 0.01;

              return (
                <div key={i} className={`price-card ${!p.matched ? "unmatched" : ""}`}>
                  <div className="price-card-top">
                    <div className="price-card-store">
                      <span className="store-name">{p.supermarketName}</span>
                      <span className="branch-name">{p.branchName}</span>
                    </div>
                    <div className="price-card-prices">
                      <div className="price-column scraped-col">
                        <span className="price-label">חדש</span>
                        <span className="regular-price">{p.price.toFixed(2)} &#8362;</span>
                        {p.hasDiscount && p.discount && (
                          <span className="discount-price">{p.discount.priceForUnit.toFixed(2)} &#8362;</span>
                        )}
                      </div>
                      {db && (
                        <div className="price-column db-col">
                          <span className="price-label">DB</span>
                          <span className="db-price">{db.price.toFixed(2)} &#8362;</span>
                          {db.hasDiscount && db.discount && (
                            <span className="db-discount">{db.discount.priceForUnit.toFixed(2)} &#8362;</span>
                          )}
                        </div>
                      )}
                      {hasDiff && (
                        <div className={`price-diff ${priceDiff > 0 ? "up" : "down"}`}>
                          {priceDiff > 0 ? "+" : ""}{priceDiff.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="price-card-bottom">
                    <span className="price-address">{p.address}</span>
                    {p.hasDiscount && p.discount && (
                      <span className="discount-info">
                        {p.discount.units} יח' ב-{p.discount.totalPrice} &#8362;
                      </span>
                    )}
                    {p.matched && (
                      <span className="supermarket-id">ID: {p.supermarketID}</span>
                    )}
                    {!p.matched && (
                      <span className="no-match-badge">לא מותאם</span>
                    )}
                    {p.matched && !db && (
                      <span className="no-db-badge">אין ב-DB</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* HTML Tab */}
      {tab === "html" && html && (
        <div className="scraper-result">
          <div className="scraper-result-header">
            <span>HTML ({html.length.toLocaleString()} chars)</span>
            <button
              className="scraper-copy"
              onClick={() => { navigator.clipboard.writeText(html); }}
            >
              העתק
            </button>
          </div>
          <pre className="scraper-html">{html}</pre>
        </div>
      )}
      <AddFromScraperModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        barcode={prices?.barcode || barcode.trim()}
        scrapedPrices={prices?.prices || []}
        onSaved={(data) => {
          setSavedMsg(
            `נשמר בהצלחה! מוצר + ${data.data.pricesInserted} מחירים` +
            (data.data.newSupermarkets.length > 0
              ? ` + ${data.data.newSupermarkets.length} סופרמרקטים חדשים`
              : "")
          );
        }}
      />
    </div>
  );
}

export default Scraper;
