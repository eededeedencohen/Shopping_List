/**
 * /barcode-scanner - scan a product, see its price everywhere.
 * A dark page built around the shared ScannerView: scan → the window turns
 * green, the price comparison opens on top; closing it leaves a result card
 * (picture, name, price at the current store) with "השוואת מחירים" and
 * "סרוק שוב". Unknown barcodes still open the comparison (its live-scraper
 * fallback offers to add the product).
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import ScannerView from "./ScannerView";
import ProductComparisonModal from "../PriceList/productComparisonModal";
import ProductComparison from "../PriceList/productComparison";
import { ProductImageDisplay } from "../Images/ProductImageService";
import { useGetProductByBarcode, usePriceMap } from "../../hooks/appHooks";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";
import "./ScannerView.css";

const OPEN_COMPARE_AFTER_MS = 420; // let the green hit land before the modal rises

const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const IconScan = () => (
  <svg {...ico}>
    <path d="M4 8.5V6a2 2 0 0 1 2-2h2.5M15.5 4H18a2 2 0 0 1 2 2v2.5M20 15.5V18a2 2 0 0 1-2 2h-2.5M8.5 20H6a2 2 0 0 1-2-2v-2.5" />
    <path d="M7 12h10" />
  </svg>
);
const IconScale = () => (
  <svg {...ico}>
    <path d="M12 4v16M4 20h16" />
    <path d="M12 6 5 9l-2.5 6a3.5 3.5 0 0 0 7 0L7 9M12 6l7 3 2.5 6a3.5 3.5 0 0 1-7 0L17 9" />
  </svg>
);
const IconRedo = () => (
  <svg {...ico}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </svg>
);
const IconRuler = () => (
  <svg {...ico}>
    <rect x="3" y="8" width="18" height="8" rx="2" />
    <path d="M7 8v3M11 8v4M15 8v3" />
  </svg>
);
const IconFlash = () => (
  <svg {...ico}>
    <path d="M13 2 4.5 13.5H11l-1 8.5 8.5-11.5H13l1-8.5z" />
  </svg>
);
const IconKeys = () => (
  <svg {...ico}>
    <rect x="3" y="6" width="18" height="12" rx="2.5" />
    <path d="M7 10h.01M11 10h.01M15 10h.01M7 14h10" />
  </svg>
);
const IconBox = () => (
  <svg {...ico}>
    <path d="M12 3 4 7v10l8 4 8-4V7l-8-4z" />
    <path d="M4 7l8 4 8-4M12 11v10" />
  </svg>
);

const weightOf = (p) => {
  const w = Number(p && p.weight);
  if (!w) return "";
  const u = { g: "גרם", kg: 'ק"ג', ml: 'מ"ל', l: "ליטר", u: "יח'", t: "יח'" }[p.unitWeight] || p.unitWeight || "";
  return `${w} ${u}`;
};
const nis = (n) => `₪${(Math.round((Number(n) || 0) * 100) / 100).toFixed(2)}`;

function ResultCard({ barcode, onCompare, onAgain }) {
  const product = useGetProductByBarcode(barcode);
  const { pricesMap } = usePriceMap();
  const pd = product ? pricesMap[product.barcode] : null;
  return (
    <section className="bsp__result" aria-live="polite">
      {product ? (
        <span className="bsp__result-pic">
          <ProductImageDisplay barcode={product.barcode} eager />
        </span>
      ) : (
        <span className="bsp__result-pic bsp__result-pic--none" aria-hidden="true">
          <IconBox />
        </span>
      )}
      <span className="bsp__result-text">
        <span className={`bsp__result-eyebrow${product ? "" : " bsp__result-eyebrow--none"}`}>
          {product ? "נסרק" : "לא נמצא במאגר"}
        </span>
        <span className="bsp__result-name">{product ? product.name : "מוצר לא מוכר"}</span>
        {product && (product.brand || weightOf(product)) && (
          <span className="bsp__result-meta">{[product.brand, weightOf(product)].filter(Boolean).join(" · ")}</span>
        )}
        {product ? (
          pd ? (
            <span className="bsp__result-price">
              <span>בסופר הנוכחי</span>
              <b>{nis(pd.price)}</b>
              {pd.hasDiscount && pd.discount && (
                <span className="bsp__result-deal">
                  {pd.discount.units} ב-{nis(pd.discount.totalPrice)}
                </span>
              )}
            </span>
          ) : (
            <span className="bsp__result-price">לא נמכר בסופר הנוכחי</span>
          )
        ) : (
          <span className="bsp__result-code">{barcode}</span>
        )}
      </span>
      <span className="bsp__result-actions">
        <button type="button" className="bsp__btn bsp__btn--primary" onClick={onCompare}>
          <IconScale />
          השוואת מחירים
        </button>
        <button type="button" className="bsp__btn bsp__btn--ghost" onClick={onAgain}>
          <IconRedo />
          סרוק שוב
        </button>
      </span>
    </section>
  );
}

export default function BarcodeScannerPage() {
  const [barcode, setBarcode] = useState(null);
  const [compareOpen, setCompareOpen] = useState(false);
  const openTimer = useRef(null);
  useEffect(() => () => clearTimeout(openTimer.current), []);

  const onDetected = useCallback((code) => {
    setBarcode(code);
    clearTimeout(openTimer.current);
    openTimer.current = setTimeout(() => {
      uiSound("open");
      setCompareOpen(true);
    }, OPEN_COMPARE_AFTER_MS);
  }, []);

  const scanAgain = () => {
    haptic("selection");
    uiSound("tap");
    setCompareOpen(false);
    setBarcode(null);
  };

  return (
    <div className="bsp" dir="rtl">
      <ProductComparisonModal isOpen={compareOpen} onClose={() => setCompareOpen(false)}>
        <ProductComparison barcode={barcode} />
      </ProductComparisonModal>

      <header className="bsp__head">
        <span className="bsp__icon" aria-hidden="true">
          <IconScan />
        </span>
        <span>
          <h1 className="bsp__title">סורק ברקוד</h1>
          <p className="bsp__sub">סורקים מוצר ורואים מיד את המחיר בכל הסופרים</p>
        </span>
      </header>

      <div className="bsp__stage">
        <ScannerView active mode="single" paused={!!barcode} onDetected={onDetected} />
      </div>

      {barcode ? (
        <ResultCard
          barcode={barcode}
          onCompare={() => {
            haptic("light");
            uiSound("open");
            setCompareOpen(true);
          }}
          onAgain={scanAgain}
        />
      ) : (
        <div className="bsp__tips" aria-label="טיפים">
          <span className="bsp__tip">
            <IconRuler />
            החזיקו את הברקוד במרחק 10 עד 25 ס"מ
          </span>
          <span className="bsp__tip">
            <IconFlash />
            בחושך הדליקו את הפנס מהכפתור בצד
          </span>
          <span className="bsp__tip">
            <IconKeys />
            ברקוד פגום? הקלידו את הספרות
          </span>
        </div>
      )}
    </div>
  );
}
