import React, { useEffect, useMemo, useState } from "react";
import BottomSheet from "../../BottomSheet/BottomSheet";
import { ProductImageDisplay } from "../../../Images/ProductImageService";
import { useOptimalCartsOperation } from "../../../../hooks/optimizationHooks";
import {
  computeRowTotal,
  pricePer100,
  per100UnitLabel,
  displayWeight,
} from "../../../../utils/optimalCartMath";

/* Alternatives picker — the shared BottomSheet paradigm instead of the legacy
   bare-list modal. Every candidate shows THIS store's price for the SAME
   quantity, a per-100 stat and a signed delta vs the current row; selection
   is explicit (radio → sticky footer "החלף"), never a silent mutation.
   On a replaced row the original product is selectable — that IS the undo. */
const AlternativesSheet = ({
  isOpen,
  onClose,
  row,
  supermarketID,
  storeName,
  onApplied,
}) => {
  const {
    getReplacementProductsByGeneralNameAndSupermarketID,
    replaceProductInOptimalCart,
  } = useOptimalCartsOperation();

  const [candidates, setCandidates] = useState(null); // null=loading, []=none
  const [loadError, setLoadError] = useState(false);
  const [selected, setSelected] = useState(null); // barcode string

  const isMissing = row?.kind === "missing";
  const quantity = row?.quantity || 1;
  const currentTotal = isMissing ? null : row?.totalPrice ?? null;
  const generalName =
    row?.original?.product?.generalName || row?.product?.generalName || "";

  useEffect(() => {
    if (!isOpen || !row) return undefined;
    let cancelled = false;
    setCandidates(null);
    setLoadError(false);
    setSelected(null);
    (async () => {
      try {
        const list = await getReplacementProductsByGeneralNameAndSupermarketID(
          generalName,
          supermarketID
        );
        if (!cancelled) setCandidates(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) {
          setCandidates([]);
          setLoadError(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, row, generalName, supermarketID]);

  /* enrich: same-quantity total, delta vs current, pinned tags, price-less
     candidates sink to the bottom disabled */
  const items = useMemo(() => {
    if (!candidates) return null;
    const currentBarcode = row ? String(row.barcode) : "";
    const originalBarcode = row?.original?.product?.barcode
      ? String(row.original.product.barcode)
      : null;

    const out = candidates.map(({ product, price }) => {
      const total = price ? computeRowTotal(quantity, price) : null;
      const bc = String(product.barcode);
      return {
        product,
        price,
        total,
        barcode: bc,
        isCurrent: !isMissing && bc === currentBarcode,
        isOriginal: originalBarcode != null && bc === originalBarcode,
        delta:
          total != null && currentTotal != null ? total - currentTotal : null,
      };
    });

    out.sort((a, b) => {
      if (a.isCurrent !== b.isCurrent) return a.isCurrent ? -1 : 1;
      if ((a.total == null) !== (b.total == null)) return a.total == null ? 1 : -1;
      return (a.total ?? 0) - (b.total ?? 0);
    });
    return out;
  }, [candidates, row, quantity, currentTotal, isMissing]);

  const selectedItem =
    items && selected ? items.find((i) => i.barcode === selected) : null;

  const apply = () => {
    if (!selectedItem || !row) return;
    replaceProductInOptimalCart(
      row.oldBarcode,
      selectedItem.product.barcode,
      isMissing ? 0 : row.totalPrice,
      selectedItem.total,
      supermarketID
    );
    onApplied(row.oldBarcode);
  };

  const footerLive = () => {
    if (!selectedItem)
      return <span className="alts-live alts-live--hint">בחרו חלופה מהרשימה</span>;
    const d = selectedItem.delta;
    return (
      <span className="alts-live">
        סה״כ שורה חדש: <b>₪{selectedItem.total.toFixed(2)}</b>
        {d != null && Math.abs(d) > 0.005 && (
          <span className={d < 0 ? "alts-live-save" : "alts-live-cost"}>
            {" "}
            ({d < 0 ? `חוסכים ₪${Math.abs(d).toFixed(2)}` : `תוספת ₪${d.toFixed(2)}`})
          </span>
        )}
      </span>
    );
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isMissing ? "חלופות למוצר החסר" : `חלופות ל${generalName || "מוצר"}`}
      headEnd={
        <span className="alts-sub">
          {storeName} · המחירים בסופר זה · לפי {quantity} יח׳
        </span>
      }
      footer={
        <>
          {footerLive()}
          <button
            type="button"
            className="bsheet-btn bsheet-btn--done alts-cta"
            disabled={!selectedItem}
            onClick={apply}
          >
            {isMissing ? "הוסף לעגלה" : "החלף"}
          </button>
        </>
      }
    >
      {items === null ? (
        <div className="alts-loading">
          <div className="alts-spinner" />
          <p>טוען חלופות…</p>
        </div>
      ) : loadError ? (
        <div className="alts-loading">
          <p>לא הצלחנו לטעון חלופות</p>
          <button
            type="button"
            className="bsheet-btn"
            onClick={() => {
              /* re-trigger the effect */
              setCandidates(null);
              setLoadError(false);
              getReplacementProductsByGeneralNameAndSupermarketID(
                generalName,
                supermarketID
              )
                .then((list) => setCandidates(Array.isArray(list) ? list : []))
                .catch(() => {
                  setCandidates([]);
                  setLoadError(true);
                });
            }}
          >
            נסו שוב
          </button>
        </div>
      ) : items.length === 0 ? (
        <p className="alts-empty">אין חלופות זמינות בסופר זה</p>
      ) : (
        <div className="alts-list" role="radiogroup" aria-label="בחירת מוצר חלופי">
          {items.map((item) => {
            const p = item.product;
            const disabled = item.total == null;
            const isSel = selected === item.barcode;
            const per100 =
              item.total != null
                ? pricePer100(item.total, quantity, p.weight, p.unitWeight)
                : null;
            const meta = [p.brand, displayWeight(p.weight, p.unitWeight)]
              .filter(Boolean)
              .join(" · ");
            return (
              <button
                key={item.barcode}
                type="button"
                role="radio"
                aria-checked={isSel}
                disabled={disabled || item.isCurrent}
                className={`alts-row${isSel ? " is-sel" : ""}${disabled ? " is-dis" : ""}${item.isCurrent ? " is-cur" : ""}`}
                onClick={() => setSelected(item.barcode)}
              >
                <span className="alts-img">
                  <ProductImageDisplay barcode={p.barcode} className="alts-img-el" alt={p.name} />
                </span>
                <span className="alts-info">
                  <span className="alts-name">
                    {p.name}
                    {item.isCurrent && <i className="alts-tag">הנוכחי</i>}
                    {!item.isCurrent && item.isOriginal && (
                      <i className="alts-tag alts-tag--orig">המוצר המקורי</i>
                    )}
                  </span>
                  {meta && <span className="alts-meta">{meta}</span>}
                  {item.price?.hasDiscount && item.price.discount && (
                    <span className="alts-deal">
                      מבצע: {item.price.discount.units} ב־₪
                      {item.price.discount.totalPrice.toFixed(2)}
                    </span>
                  )}
                </span>
                <span className="alts-price">
                  {item.total == null ? (
                    <span className="alts-noprice">אין מחיר בסופר זה</span>
                  ) : (
                    <>
                      <span className="alts-total">₪{item.total.toFixed(2)}</span>
                      <span className="alts-per">
                        {per100 != null &&
                          `₪${per100.toFixed(2)}/100 ${per100UnitLabel(p.unitWeight)}`}
                        {item.delta != null && Math.abs(item.delta) > 0.005 && (
                          <i
                            className={`alts-delta ${item.delta < 0 ? "save" : "cost"}`}
                          >
                            {item.delta < 0 ? "−" : "+"}₪{Math.abs(item.delta).toFixed(2)}
                          </i>
                        )}
                      </span>
                    </>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </BottomSheet>
  );
};

export default AlternativesSheet;
