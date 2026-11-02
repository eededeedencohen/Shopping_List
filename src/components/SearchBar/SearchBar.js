import { useEffect, useMemo, useRef, useState } from "react";
import { useEnrichedProducts, useCartActions } from "../../hooks/appHooks";
import SearchItem from "./SearchItem";
import ProductComparisonModal from "../PriceList/productComparisonModal";
import ProductComparison from "../PriceList/productComparison";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";
import "./SearchBar.css";

/* ── Product search (2026-11-02 redesign) ──────────────────────────────
   Lives inside SearchModal (toolbar 🔍) and as the standalone /search route.
   • one big search field (auto-focused, clear button, Enter = blur keyboard)
   • matches every typed word against name / general name / brand / category,
     ranks "name starts with the query" first, then "name contains", then the
     rest; products without a price in the current store sink to the bottom
   • results are white cards with the picture, the name (matches highlighted),
     brand · weight, the price, the deal, and a −/+ stepper that updates the
     cart DIRECTLY (no confirm step — same as the products grid)
   • tapping a result opens the price-comparison modal (the old /priceList
     page is legacy)
   • empty state = hint + recent searches (localStorage), no-results state */

const DEBOUNCE_MS = 220;
const VISIBLE_MAX = 60;
const RECENT_KEY = "search.recent";
const RECENT_MAX = 6;

const useDebounced = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const norm = (s) => (s == null ? "" : String(s)).toLowerCase().trim();

const loadRecent = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
    return Array.isArray(arr) ? arr.filter((s) => typeof s === "string") : [];
  } catch {
    return [];
  }
};
const saveRecent = (arr) => {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(arr));
  } catch {
    /* storage unavailable — ignore */
  }
};

const IconSearch = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);
const IconClear = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
const IconClock = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const SearchBar = ({ closeModal }) => {
  const { productsWithDetails } = useEnrichedProducts();
  const { add, remove, update } = useCartActions();

  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, DEBOUNCE_MS);
  const [recent, setRecent] = useState(loadRecent);
  const [cmpBarcode, setCmpBarcode] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  /* the keyboard should be up as soon as the modal opens */
  useEffect(() => {
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 60);
    return () => clearTimeout(t);
  }, []);

  const words = useMemo(
    () => norm(debounced).split(/\s+/).filter(Boolean),
    [debounced]
  );

  const results = useMemo(() => {
    if (!words.length) return [];
    const q = norm(debounced);
    const rank = (p) => {
      const name = norm(p.name);
      if (name.startsWith(q)) return 0;
      if (name.includes(q)) return 1;
      return 2;
    };
    return productsWithDetails
      .filter((p) => {
        const hay = [p.name, p.generalName, p.brand, p.category, p.subcategory].map(norm);
        return words.every((w) => hay.some((h) => h.includes(w)));
      })
      .map((p) => ({ p, r: rank(p), na: p.price == null ? 1 : 0 }))
      .sort((a, b) => a.r - b.r || a.na - b.na)
      .map((x) => x.p);
  }, [productsWithDetails, words, debounced]);

  const visible = results.slice(0, VISIBLE_MAX);

  /* scroll the list back to the top on every new query */
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
  }, [debounced]);

  const rememberQuery = () => {
    const q = query.trim();
    if (q.length < 2) return;
    const next = [q, ...recent.filter((s) => s !== q)].slice(0, RECENT_MAX);
    setRecent(next);
    saveRecent(next);
  };

  const clearRecent = () => {
    setRecent([]);
    saveRecent([]);
    haptic("selection");
  };

  /* −/+ update the cart directly (like the products grid) */
  const increment = (product) => {
    const current = product.amountInCart || 0;
    haptic("light");
    uiSound("tap");
    if (current === 0) add(product.barcode, 1);
    else update(product.barcode, current + 1);
    rememberQuery();
  };
  const decrement = (product) => {
    const current = product.amountInCart || 0;
    if (current <= 0) return;
    haptic("light");
    uiSound("tap");
    if (current === 1) remove(product.barcode);
    else update(product.barcode, current - 1);
  };

  const openProduct = (product) => {
    haptic("selection");
    rememberQuery();
    setCmpBarcode(product.barcode);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      rememberQuery();
      inputRef.current && inputRef.current.blur(); // drop the keyboard, show the results
    } else if (e.key === "Escape" && query) {
      e.stopPropagation();
      setQuery("");
    }
  };

  const hasQuery = words.length > 0;
  const typing = query.trim() !== debounced.trim();

  return (
    <div className="sr">
      {/* ── search field ── */}
      <div className={`sr__field${query ? " has-text" : ""}`}>
        <span className="sr__field-icon" aria-hidden="true"><IconSearch /></span>
        <input
          ref={inputRef}
          type="search"
          inputMode="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          placeholder="שם מוצר, מותג או קטגוריה…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          aria-label="חיפוש מוצר"
        />
        {query && (
          <button
            type="button"
            className="sr__clear"
            onClick={() => {
              setQuery("");
              inputRef.current && inputRef.current.focus();
            }}
            aria-label="נקה"
          >
            <IconClear />
          </button>
        )}
      </div>

      {/* ── status line ── */}
      {hasQuery && !typing && (
        <p className="sr__status" aria-live="polite">
          {results.length === 0
            ? ""
            : results.length > VISIBLE_MAX
            ? `מציג ${VISIBLE_MAX} מתוך ${results.length} תוצאות · דייקו את החיפוש`
            : results.length === 1
            ? "תוצאה אחת"
            : `${results.length} תוצאות`}
        </p>
      )}

      {/* ── results / empty states ── */}
      <div className="sr__list" ref={listRef}>
        {!hasQuery ? (
          <div className="sr__empty">
            <span className="sr__empty-icon" aria-hidden="true"><IconSearch /></span>
            <p className="sr__empty-title">מה מחפשים היום?</p>
            <p className="sr__empty-sub">הקלידו שם מוצר, מותג או קטגוריה - התוצאות מופיעות תוך כדי הקלדה</p>
            {recent.length > 0 && (
              <div className="sr__recent">
                <div className="sr__recent-head">
                  <span className="sr__recent-title">חיפושים אחרונים</span>
                  <button type="button" className="sr__recent-clear" onClick={clearRecent}>
                    נקה
                  </button>
                </div>
                <div className="sr__recent-list">
                  {recent.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="sr__recent-item"
                      onClick={() => {
                        haptic("selection");
                        setQuery(s);
                      }}
                    >
                      <IconClock />
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : !typing && results.length === 0 ? (
          <div className="sr__empty sr__empty--none">
            <span className="sr__empty-icon" aria-hidden="true"><IconSearch /></span>
            <p className="sr__empty-title">לא נמצאו מוצרים עבור “{query.trim()}”</p>
            <p className="sr__empty-sub">נסו מילה אחרת, שם מותג או קטגוריה</p>
          </div>
        ) : (
          <ul className="sr__results">
            {visible.map((product, idx) => (
              <SearchItem
                key={product.barcode}
                product={product}
                words={words}
                index={idx}
                onOpen={() => openProduct(product)}
                onIncrement={() => increment(product)}
                onDecrement={() => decrement(product)}
              />
            ))}
            {results.length > VISIBLE_MAX && (
              <li className="sr__more">
                יש עוד {results.length - VISIBLE_MAX} מוצרים - הוסיפו מילה כדי לצמצם
              </li>
            )}
          </ul>
        )}
      </div>

      <ProductComparisonModal
        isOpen={!!cmpBarcode}
        onClose={() => setCmpBarcode(null)}
      >
        <ProductComparison barcode={cmpBarcode} />
      </ProductComparisonModal>
    </div>
  );
};

export default SearchBar;
