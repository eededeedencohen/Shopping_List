// src/test-components/SearchTest.js
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useEnrichedProducts,   // מוצרים+מחיר+כמות
  useCartActions         // add / remove
} from "../../hooks/appHooks";

/*  דיבאונס קצר כדי שלא נבצע סינון בכל הקלדה  */
const useDebounced = (value, delay = 300) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

const SearchTest = () => {
  const { productsWithDetails, isLoadingProducts } = useEnrichedProducts();
  const { add, remove } = useCartActions();

  /* טקסט חיפוש + דיבאונס */
  const [query, setQuery] = useState("");
  const debouncedQuery   = useDebounced(query, 600);

  /* סינון על‑גבי הרשימה המואשרת (כולל כמות ומחיר) */
  const filtered = debouncedQuery
    ? productsWithDetails.filter((p) =>
        [p.name, p.generalName, p.brand]
          .filter(Boolean)
          .some((txt) => txt.toLowerCase().includes(debouncedQuery.toLowerCase()))
      )
    : [];

  return (
    <div style={{ padding: 20 }}>
      <Link to="/cart-test">
        <button style={{ marginBottom: 12 }}>⮌ לעמוד עגלה</button>
      </Link>

      <h2>Search Test</h2>

      {/* תיבת החיפוש */}
      <input
        type="text"
        placeholder="חפש מוצר…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, width: "100%", maxWidth: 380 }}
      />

      {/* מצבי תצוגה לפי התרשים */}
      {query === "" && <p style={{ color: "#777" }}>התחל להקליד כדי לחפש…</p>}
      {query !== "" && isLoadingProducts && <p>טוען מוצרים…</p>}
      {query !== "" && !isLoadingProducts && filtered.length === 0 && (
        <p style={{ color: "#c00" }}>לא נמצאו מוצרים תואמים</p>
      )}

      {filtered.map((p) => (
        <div
          key={p.barcode}
          style={{ border: "1px solid #ddd", margin: "10px 0", padding: 10 }}
        >
          <strong>{p.name}</strong> – {p.brand}
          <br />
          ברקוד: {p.barcode} | משקל: {p.weight}
          <br />
          מחיר יח׳: {p.unitPrice ?? "—"}₪
          {p.promoText && (
            <span style={{ color: "green", marginInlineStart: 6 }}>
              (מבצע: {p.promoText})
            </span>
          )}
          <br />
          כמות בעגלה: {p.amountInCart} | סה״כ: {p.totalPrice.toFixed(2)}₪
          <br />
          {p.amountInCart === 0 ? (
            <button onClick={() => add(p.barcode, 1)}>הוסף לעגלה</button>
          ) : (
            <button onClick={() => remove(p.barcode)} style={{ color: "red" }}>
              הסר מהעגלה
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default SearchTest;
