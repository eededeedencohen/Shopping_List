import React, { useState, useEffect, useMemo } from "react";
import { ProductImageDisplay } from "../Images/ProductImageService";
import styles from "./ReplaceProducts.module.css";
import {
  useCartActions,
  useAlternativeProducts,
  useGetProductByBarcode,
} from "../../hooks/appHooks";

const convertWeightUnit = (u) => {
  if (!u) return "";
  const l = u.toLowerCase();
  if (l === "g") return "גרם";
  if (l === "kg") return 'ק"ג';
  if (l === "ml") return 'מ"ל';
  if (l === "l") return "ליטר";
  return u;
};

/** Normalize weight to grams (or ml). Returns null if can't compute. */
const toGrams = (product) => {
  const w = product.weight;
  const u = (product.unitWeight || "").toLowerCase();
  if (w == null || !u) return null;
  if (u === "g" || u === "ml") return w;
  if (u === "kg" || u === "l") return w * 1000;
  return null;
};

/** Price per 100g/ml. Returns null if can't compute. */
const pricePer100 = (product) => {
  if (product.price == null) return null;
  const g = toGrams(product);
  if (!g || g <= 0) return null;
  return (product.price / g) * 100;
};

const SORT_OPTIONS = [
  { key: "price-asc", label: "מחיר - מהזול" },
  { key: "price-desc", label: "מחיר - מהיקר" },
  { key: "per100", label: "ל-100 גרם" },
  { key: "name", label: "שם" },
  { key: "weight", label: "משקל" },
];

function ReplaceProducts({ barcode, closeModal }) {
  const [isReplacing, setIsReplacing] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState(null);
  const [sortBy, setSortBy] = useState("price-asc");
  const { replaceProduct: replaceProductNew } = useCartActions();
  const alternatives = useAlternativeProducts(barcode);
  const currentProduct = useGetProductByBarcode(barcode);

  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 350);
    return () => clearTimeout(t);
  }, [alternatives, barcode]);

  // Find cheapest price (the value, not a single barcode)
  const cheapestPrice = useMemo(() => {
    if (!alternatives.length) return null;
    const withPrice = alternatives.filter((p) => p.price != null && p.price > 0);
    if (!withPrice.length) return null;
    return Math.min(...withPrice.map((p) => p.price));
  }, [alternatives]);

  // Sorted list
  const sortedAlternatives = useMemo(() => {
    const list = [...alternatives];
    switch (sortBy) {
      case "price-asc":
        return list.sort((a, b) => {
          if (a.price == null && b.price == null) return 0;
          if (a.price == null) return 1;
          if (b.price == null) return -1;
          return a.price - b.price;
        });
      case "price-desc":
        return list.sort((a, b) => {
          if (a.price == null && b.price == null) return 0;
          if (a.price == null) return 1;
          if (b.price == null) return -1;
          return b.price - a.price;
        });
      case "per100":
        return list.sort((a, b) => {
          const pa = pricePer100(a);
          const pb = pricePer100(b);
          if (pa == null && pb == null) return 0;
          if (pa == null) return 1;
          if (pb == null) return -1;
          return pa - pb;
        });
      case "name":
        return list.sort((a, b) => (a.name || "").localeCompare(b.name || "", "he"));
      case "weight":
        return list.sort((a, b) => (b.weight || 0) - (a.weight || 0));
      default:
        return list;
    }
  }, [alternatives, sortBy]);

  const handleProductClick = async (newBarcode) => {
    setSelectedBarcode(newBarcode);
    setIsReplacing(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      replaceProductNew(barcode, newBarcode);
    } catch (error) {
      console.error("Error replacing product:", error);
    } finally {
      setIsReplacing(false);
      closeModal();
    }
  };

  // Loading state
  if (!ready || !alternatives.length) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingDots}>
          <span />
          <span />
          <span />
        </div>
        <p className={styles.loadingText}>{"מחפש חלופות..."}</p>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <h3 className={styles.headerTitle}>בחר מוצר חלופי</h3>
        {currentProduct && (
          <p className={styles.headerSub}>
            במקום: {currentProduct.name}
          </p>
        )}
        <span className={styles.headerCount}>
          {alternatives.length} חלופות
        </span>
      </div>

      {/* ── Sort Bar ── */}
      <div className={styles.sortBar}>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            className={`${styles.sortBtn} ${sortBy === opt.key ? styles.sortBtnActive : ""}`}
            onClick={() => setSortBy(opt.key)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className={styles.list}>
        {sortedAlternatives.map((product, i) => {
          const isCheapest =
            cheapestPrice != null &&
            product.price != null &&
            product.price === cheapestPrice;
          const isSelected = product.barcode === selectedBarcode;
          const noPrice = product.price == null;

          return (
            <div
              key={product.barcode}
              className={`${styles.card} ${isCheapest ? styles.cardCheapest : ""} ${isSelected ? styles.cardSelected : ""} ${noPrice ? styles.cardNoPrice : ""}`}
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => !isReplacing && handleProductClick(product.barcode)}
            >
              {/* Cheapest badge */}
              {isCheapest && (
                <span className={styles.badge}>המחיר הכי טוב</span>
              )}

              {/* Image */}
              <div className={styles.cardImage}>
                <ProductImageDisplay barcode={product.barcode} />
              </div>

              {/* Info */}
              <div className={styles.cardInfo}>
                <span className={styles.cardName}>
                  {product.name && product.name.length > 40
                    ? product.name.substring(0, 37) + "..."
                    : product.name}
                </span>

                <span className={styles.cardMeta}>
                  {product.brand && <span>{product.brand}</span>}
                  {product.brand && product.weight != null && (
                    <span className={styles.cardDot} />
                  )}
                  {product.weight != null && (
                    <span>
                      {product.weight} {convertWeightUnit(product.unitWeight)}
                    </span>
                  )}
                </span>

                {/* Price per 100g when sorted by it */}
                {sortBy === "per100" && pricePer100(product) != null && (
                  <span className={styles.cardPer100}>
                    {pricePer100(product).toFixed(2)}₪ ל-100{(product.unitWeight || "").toLowerCase() === "ml" || (product.unitWeight || "").toLowerCase() === "l" ? 'מ"ל' : "גר'"}
                  </span>
                )}

                {/* Discount */}
                {product.hasDiscount && product.discount && (
                  <span className={styles.cardDiscount}>
                    {product.discount.units} יח' ב-
                    {product.discount.totalPrice.toFixed(2)}₪
                  </span>
                )}
              </div>

              {/* Price */}
              <div className={styles.cardPrice}>
                {noPrice ? (
                  <span className={styles.priceNone}>לא זמין</span>
                ) : (
                  <>
                    <span className={styles.priceValue}>
                      {product.price.toFixed(2)}
                    </span>
                    <span className={styles.priceCurrency}>₪</span>
                  </>
                )}
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div className={styles.selectedOverlay}>
                  <div className={styles.selectedSpinner} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReplaceProducts;
