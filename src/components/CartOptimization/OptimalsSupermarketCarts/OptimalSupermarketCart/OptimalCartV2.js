import React, { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import SupermarketImage from "../../../Images/SupermarketImage";
import OptimalProductRow from "./OptimalProductRow";
import AlternativesSheet from "./AlternativesSheet";
import "./OptimalCartV2.css";
import {
  useSupermarkets,
  useOptimalCarts,
  useOptimalCartsOperation,
} from "../../../../hooks/optimizationHooks";
import { useProducts } from "../../../../context/ProductContext";
import {
  buildOriginalPriceMap,
  computeCartStats,
} from "../../../../utils/optimalCartMath";

const ChevronIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

/* The per-store cart — a REAL route (/optimal-supermarket-carts/:supermarketID):
   browser back returns to the list, refresh redirects to settings instead of
   crashing. Header tiles use the same honest formulas as the list, products
   are grouped into replaced / missing / as-original sections, quantity edits
   are an inline stepper, and deletion is undoable (the context commit is
   DEFERRED until the snackbar closes, so undo is trivially reliable). */
const OptimalCartV2 = () => {
  const { supermarketID } = useParams();
  const navigate = useNavigate();
  const smID = Number(supermarketID);

  const { allSupermarkets } = useSupermarkets();
  const { optimalCarts, isOptimalCartsCalculated, fullCart } = useOptimalCarts();
  const { deleteProductFromOptimalCart } = useOptimalCartsOperation();
  const { getProductDetailsByBarcode } = useProducts();

  /* deferred-commit delete */
  const [pendingDelete, setPendingDelete] = useState(null); // {oldBarcode, name}
  const pendingRef = useRef(null);
  pendingRef.current = pendingDelete;
  const timerRef = useRef(null);

  /* alternatives sheet + applied-row flash */
  const [sheetRow, setSheetRow] = useState(null);
  const [flashKey, setFlashKey] = useState(null);

  const cart = useMemo(
    () => (optimalCarts || []).find((c) => c.supermarketID === smID),
    [optimalCarts, smID]
  );

  const commitPending = useCallback(() => {
    const p = pendingRef.current;
    if (!p) return;
    deleteProductFromOptimalCart(p.oldBarcode, smID);
    pendingRef.current = null;
    setPendingDelete(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [smID]);

  /* flush a pending delete when leaving the page */
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      const p = pendingRef.current;
      if (p) deleteProductFromOptimalCart(p.oldBarcode, smID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestDelete = (row) => {
    if (pendingRef.current) {
      /* a second delete commits the previous one — single-undo model */
      deleteProductFromOptimalCart(pendingRef.current.oldBarcode, smID);
    }
    clearTimeout(timerRef.current);
    setPendingDelete({ oldBarcode: row.oldBarcode, name: row.name });
    timerRef.current = setTimeout(commitPending, 6000);
  };

  const undoDelete = () => {
    clearTimeout(timerRef.current);
    pendingRef.current = null;
    setPendingDelete(null);
  };

  const supermarketDetails = allSupermarkets.find(
    (s) => s.supermarketID === smID
  );
  const originalMap = useMemo(() => buildOriginalPriceMap(fullCart), [fullCart]);
  const totalProducts = fullCart?.productsWithPrices?.length || 0;

  /* the cart as the user currently sees it (pending delete filtered out) */
  const effectiveCart = useMemo(() => {
    if (!cart) return null;
    if (!pendingDelete) return cart;
    const key = pendingDelete.oldBarcode;
    return {
      ...cart,
      existsProducts: cart.existsProducts.filter((p) => p.oldBarcode !== key),
      nonExistsProducts: cart.nonExistsProducts.filter(
        (p) => (p.oldBarcode ?? p.barcode) !== key
      ),
      deletedProducts: [...(cart.deletedProducts || []), key],
    };
  }, [cart, pendingDelete]);

  const rows = useMemo(() => {
    if (!effectiveCart) return { replaced: [], normal: [], missing: [] };
    const replaced = [];
    const normal = [];
    for (const p of effectiveCart.existsProducts) {
      const orig = originalMap.get(String(p.oldBarcode));
      const isReplaced = String(p.barcode) !== String(p.oldBarcode);
      const currentProduct =
        getProductDetailsByBarcode(p.barcode) || orig?.product || null;
      const row = {
        kind: isReplaced ? "replaced" : "normal",
        oldBarcode: p.oldBarcode,
        barcode: p.barcode,
        quantity: p.quantity,
        totalPrice: p.totalPrice,
        original: orig || null,
        product: currentProduct,
        name: currentProduct?.name || `ברקוד ${p.barcode}`,
      };
      (isReplaced ? replaced : normal).push(row);
    }
    const missing = effectiveCart.nonExistsProducts.map((p) => {
      const key = p.oldBarcode ?? p.barcode;
      const orig = originalMap.get(String(key));
      const product = orig?.product || getProductDetailsByBarcode(p.barcode) || null;
      return {
        kind: "missing",
        oldBarcode: key,
        barcode: p.barcode ?? key,
        quantity: orig?.amount ?? 1,
        totalPrice: 0,
        original: orig || null,
        product,
        name: product?.name || `ברקוד ${key}`,
      };
    });
    return { replaced, normal, missing };
  }, [effectiveCart, originalMap, getProductDetailsByBarcode]);

  const stats = useMemo(
    () =>
      effectiveCart
        ? computeCartStats(effectiveCart, originalMap, totalProducts)
        : null,
    [effectiveCart, originalMap, totalProducts]
  );

  /* guards — after all hooks */
  if (!isOptimalCartsCalculated || !fullCart) {
    return <Navigate to="/optimal-carts-settings" replace />;
  }
  if (!cart) {
    return <Navigate to="/optimal-supermarket-carts" replace />;
  }

  const sumOf = (list) => list.reduce((s, r) => s + (r.totalPrice || 0), 0);

  const flash = (key) => {
    setFlashKey(key);
    setTimeout(() => setFlashKey(null), 900);
  };

  return (
    <div className="ocv-page">
      <button
        type="button"
        className="ocv-back"
        onClick={() => navigate("/optimal-supermarket-carts")}
      >
        <ChevronIcon />
        חזרה לרשימת הסופרים
      </button>

      {/* ─── summary card ─── */}
      <section className="ocv-summary">
        <div className="ocv-summary-top">
          <div className="ocv-logo-wrap">
            <SupermarketImage
              supermarketName={supermarketDetails?.name}
              className="ocv-logo"
            />
          </div>
          <div className="ocv-summary-id">
            <h1 className="ocv-summary-name">{supermarketDetails?.name}</h1>
            {(supermarketDetails?.address || supermarketDetails?.city) && (
              <p className="ocv-summary-addr">
                {supermarketDetails?.address}
                {supermarketDetails?.city ? `, ${supermarketDetails.city}` : ""}
              </p>
            )}
          </div>
        </div>

        <div className="ocv-tiles">
          <div className="ocv-tile">
            <span className="ocv-tile-label">סה״כ בסופר</span>
            <span className="ocv-tile-value">₪{stats.total.toFixed(2)}</span>
          </div>
          <div
            className={`ocv-tile ${
              stats.savings >= 0 ? "ocv-tile--save" : "ocv-tile--cost"
            }`}
          >
            <span className="ocv-tile-label">
              {stats.savings >= 0 ? "חיסכון" : "תוספת"}
            </span>
            <span className="ocv-tile-value">
              ₪{Math.abs(stats.savings).toFixed(2)}
            </span>
            <span className="ocv-tile-sub">
              במקור: ₪{stats.coveredOriginal.toFixed(2)}
              {stats.missingCount > 0 && ` · לפי ${stats.coveredCount} מוצרים`}
            </span>
          </div>
          <div className="ocv-tile">
            <span className="ocv-tile-label">מוצרים</span>
            <span className="ocv-tile-value">
              {stats.coveredCount}/{stats.denominator}
            </span>
            <span className="ocv-covbar" aria-hidden="true">
              {Array.from({ length: stats.denominator }, (_, i) => (
                <i key={i} className={i < stats.coveredCount ? "" : "miss"} />
              ))}
            </span>
          </div>
        </div>

        {stats.missingCount > 0 && (
          <p className="ocv-callout">
            {stats.missingCount === 1
              ? "מוצר אחד לא זמין בסופר זה ולא נכלל בסה״כ"
              : `${stats.missingCount} מוצרים לא זמינים בסופר זה ולא נכללו בסה״כ`}
          </p>
        )}
      </section>

      {/* ─── sections ─── */}
      {rows.replaced.length > 0 && (
        <>
          <h2 className="ocv-sec">
            <b>הוחלפו ({rows.replaced.length})</b>
            <span className="ocv-sec-sum">₪{sumOf(rows.replaced).toFixed(2)}</span>
          </h2>
          {rows.replaced.map((row) => (
            <OptimalProductRow
              key={row.oldBarcode}
              row={row}
              supermarketID={smID}
              isFlashing={flashKey === row.oldBarcode}
              onOpenAlternatives={() => setSheetRow(row)}
              onDelete={() => requestDelete(row)}
            />
          ))}
        </>
      )}

      {rows.missing.length > 0 && (
        <>
          <h2 className="ocv-sec">
            <b>חסרים בסופר ({rows.missing.length})</b>
          </h2>
          {rows.missing.map((row) => (
            <OptimalProductRow
              key={row.oldBarcode}
              row={row}
              supermarketID={smID}
              isFlashing={flashKey === row.oldBarcode}
              onOpenAlternatives={() => setSheetRow(row)}
              onDelete={() => requestDelete(row)}
            />
          ))}
        </>
      )}

      {rows.normal.length > 0 && (
        <>
          <h2 className="ocv-sec">
            <b>כמו בעגלה שלך ({rows.normal.length})</b>
            <span className="ocv-sec-sum">₪{sumOf(rows.normal).toFixed(2)}</span>
          </h2>
          {rows.normal.map((row) => (
            <OptimalProductRow
              key={row.oldBarcode}
              row={row}
              supermarketID={smID}
              isFlashing={flashKey === row.oldBarcode}
              onOpenAlternatives={() => setSheetRow(row)}
              onDelete={() => requestDelete(row)}
            />
          ))}
        </>
      )}

      {rows.replaced.length + rows.normal.length + rows.missing.length === 0 && (
        <p className="ocv-empty">אין מוצרים להצגה בעגלה זו</p>
      )}

      {/* ─── undo snackbar ─── */}
      {pendingDelete && (
        <div className="ocv-snack" role="status" aria-live="polite">
          <span className="ocv-snack-text">"{pendingDelete.name}" הוסר מהעגלה</span>
          <button type="button" className="ocv-snack-undo" onClick={undoDelete}>
            ביטול
          </button>
        </div>
      )}

      {/* ─── alternatives sheet ─── */}
      <AlternativesSheet
        isOpen={!!sheetRow}
        onClose={() => setSheetRow(null)}
        row={sheetRow}
        supermarketID={smID}
        storeName={supermarketDetails?.name || ""}
        onApplied={(key) => {
          setSheetRow(null);
          flash(key);
        }}
      />
    </div>
  );
};

export default OptimalCartV2;
