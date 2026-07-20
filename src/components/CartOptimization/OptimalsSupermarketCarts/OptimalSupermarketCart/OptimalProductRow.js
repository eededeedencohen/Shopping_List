import React, { useEffect, useState } from "react";
import { ProductImageDisplay } from "../../../Images/ProductImageService";
import { useOptimalCartsOperation } from "../../../../hooks/optimizationHooks";
import {
  computeRowTotal,
  pricePer100,
  per100UnitLabel,
  displayWeight,
} from "../../../../utils/optimalCartMath";

const SwapIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="17 1 21 5 17 9" />
    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
    <polyline points="7 23 3 19 7 15" />
    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
  </svg>
);

const TrashIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

/* per-(store,barcode) price cache — rows and the alternatives sheet share it
   so reopening costs nothing */
const priceCache = new Map();
export const getCachedPrice = async (fetcher, barcode, supermarketID) => {
  const key = `${supermarketID}:${barcode}`;
  if (!priceCache.has(key)) {
    priceCache.set(
      key,
      fetcher(barcode, supermarketID).catch(() => null)
    );
  }
  return priceCache.get(key);
};

/* One product row in the store cart.
     normal   — image · name · meta · deal caption · total + [stepper|swap|trash]
     replaced — + blue "הוחלף" pill and a one-line "במקום … · ₪X" with a signed delta
     missing  — amber row, "לא זמין" tag, primary "בחר חלופה" + trash
   Quantity is edited IN PLACE: every stepper tap commits optimistically with
   the deal-aware total, and every dependent number re-derives. */
const OptimalProductRow = ({
  row,
  supermarketID,
  isFlashing,
  onOpenAlternatives,
  onDelete,
}) => {
  const {
    changeOptimalProductQuantity,
    getPriceByProductBarcodeAndSupermarketID,
  } = useOptimalCartsOperation();

  const [priceObj, setPriceObj] = useState(null);
  const isMissing = row.kind === "missing";

  useEffect(() => {
    if (isMissing || !row.barcode) return undefined;
    let cancelled = false;
    getCachedPrice(
      getPriceByProductBarcodeAndSupermarketID,
      row.barcode,
      supermarketID
    ).then((p) => {
      if (!cancelled) setPriceObj(p || null);
    });
    return () => {
      cancelled = true;
    };
  }, [row.barcode, supermarketID, isMissing, getPriceByProductBarcodeAndSupermarketID]);

  const product = row.product || {};
  const weightText = displayWeight(product.weight, product.unitWeight);
  const meta = [product.brand, weightText].filter(Boolean).join(" · ");

  const per100 = !isMissing
    ? pricePer100(row.totalPrice, row.quantity, product.weight, product.unitWeight)
    : null;

  const stepTo = (newQty) => {
    if (!priceObj || newQty < 1 || newQty > 99) return;
    changeOptimalProductQuantity(
      row.oldBarcode,
      supermarketID,
      newQty,
      computeRowTotal(newQty, priceObj)
    );
  };

  const origDelta =
    row.kind === "replaced" && row.original
      ? row.original.totalPrice - row.totalPrice
      : null;

  return (
    <article
      className={`opr${isMissing ? " opr--miss" : ""}${isFlashing ? " is-flash" : ""}`}
    >
      <div className="opr-main">
        <div className={`opr-img${isMissing ? " opr-img--dim" : ""}`}>
          <ProductImageDisplay
            barcode={row.barcode}
            className="opr-img-el"
            alt={row.name}
          />
        </div>

        <div className="opr-info">
          <h3 className="opr-name">
            {row.name}
            {row.kind === "replaced" && <span className="opr-pill">הוחלף</span>}
            {isMissing && <span className="opr-misstag">לא זמין</span>}
          </h3>
          {meta && <p className="opr-meta">{meta}</p>}
          {isMissing && (
            <p className="opr-meta opr-meta--miss">לא נכלל בסה״כ העגלה</p>
          )}
          {!isMissing && priceObj?.hasDiscount && priceObj.discount && (
            <p className="opr-deal">
              מבצע: {priceObj.discount.units} ב־₪
              {priceObj.discount.totalPrice.toFixed(2)}
            </p>
          )}
          {row.kind === "replaced" && row.original && (
            <p className="opr-orig">
              במקום {row.original.product?.name || `ברקוד ${row.oldBarcode}`} ·{" "}
              <s>₪{row.original.totalPrice.toFixed(2)}</s>
              {origDelta !== null && Math.abs(origDelta) > 0.005 && (
                <span
                  className={`opr-chip ${origDelta > 0 ? "opr-chip--save" : "opr-chip--cost"}`}
                >
                  {origDelta > 0 ? "−" : "+"}₪{Math.abs(origDelta).toFixed(2)}
                </span>
              )}
            </p>
          )}
        </div>

        {!isMissing && (
          <div className="opr-price">
            <span className="opr-total">₪{row.totalPrice.toFixed(2)}</span>
            {per100 != null && (
              <span className="opr-per100">
                ₪{per100.toFixed(2)}/100 {per100UnitLabel(product.unitWeight)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="opr-actions">
        {isMissing ? (
          <>
            <span className="opr-miss-hint">בחרו חלופה זמינה בסופר —</span>
            <button type="button" className="opr-choosebtn" onClick={onOpenAlternatives}>
              בחר חלופה
            </button>
          </>
        ) : (
          <>
            <div className="opr-stepper">
              <button
                type="button"
                className="opr-stepbtn"
                onClick={() => stepTo(row.quantity - 1)}
                disabled={!priceObj || row.quantity <= 1}
                aria-label="הפחתת כמות"
              >
                −
              </button>
              <span className="opr-qty">
                {row.quantity}
                <small>יח׳</small>
              </span>
              <button
                type="button"
                className="opr-stepbtn"
                onClick={() => stepTo(row.quantity + 1)}
                disabled={!priceObj || row.quantity >= 99}
                aria-label="הוספת כמות"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="opr-iconbtn opr-iconbtn--swap"
              onClick={onOpenAlternatives}
              aria-label="בחירת חלופה"
              title="בחירת חלופה"
            >
              <SwapIcon />
            </button>
          </>
        )}
        <button
          type="button"
          className="opr-iconbtn opr-iconbtn--del"
          onClick={onDelete}
          aria-label="הסרה"
          title="הסרה"
        >
          <TrashIcon />
        </button>
      </div>
    </article>
  );
};

export default OptimalProductRow;
