/**
 * /companion - "ליווי בסופר", the in-store page.
 *
 *   START  : pick the branch you are standing in → "התחל ליווי"
 *   SESSION: sticky header with the branch + the live total; an add bar
 *            (search or the barcode camera); the live basket, newest first -
 *            every added line runs a short scan and then shows its verdict
 *            inline (cheaper product here / complete the deal / not sold
 *            here) with one-tap actions; "סיים קנייה" → summary sheet with
 *            "save to history".
 */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCompanion, SCAN_MS } from "../../context/CompanionContext";
import { useProductList } from "../../hooks/appHooks";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import ReplaceSupermarket from "../Cart/ReplaceSupermarket/ReplaceSupermarket";
import ScannerView from "../Scanner/ScannerView";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { IconClose } from "../Icons/UiIcons";
import { IconCompanion } from "../BottomNav/ActionIcons";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";
import { formatNis } from "../../utils/companionScan";
import "./Companion.css";

const RESULTS_MAX = 8;
const OK_FLASH_MS = 2000;

/* ───────────── icons ───────────── */
const ico = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const IconCheck = () => (
  <svg {...ico} strokeWidth="3">
    <polyline points="4.5 12.5 9.5 17.5 19.5 7" />
  </svg>
);
const IconSearch = () => (
  <svg {...ico} strokeWidth="2.4">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);
const IconCamera = () => (
  <svg {...ico}>
    <path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h2l1.5-2h4l1.5 2h2A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-8z" />
    <circle cx="12" cy="12.5" r="3.2" />
  </svg>
);
const IconBarcode = () => (
  <svg {...ico}>
    <path d="M4 6v12M8 6v12M11 6v12M15 6v12M18 6v12M20 6v12" />
  </svg>
);
const IconPlus = () => (
  <svg {...ico} strokeWidth="3">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconMinus = () => (
  <svg {...ico} strokeWidth="3">
    <path d="M5 12h14" />
  </svg>
);
const IconStore = () => (
  <svg {...ico}>
    <path d="M3 9l1.5-5h15L21 9" />
    <path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9z" />
    <path d="M5 13v8h14v-8" />
  </svg>
);
const IconTag = () => (
  <svg {...ico}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const IconWallet = () => (
  <svg {...ico}>
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
);
const IconHistory = () => (
  <svg {...ico}>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
    <path d="M12 8v4l3 2" />
  </svg>
);
const IconArrow = () => (
  <svg {...ico}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </svg>
);
const IconBan = () => (
  <svg {...ico}>
    <circle cx="12" cy="12" r="9" />
    <path d="M5.6 5.6l12.8 12.8" />
  </svg>
);

/* ───────────── words ───────────── */
const unitsWord = (n) => (n === 1 ? "יחידה אחת" : `${n} יחידות`);
const timeOf = (ts) => {
  if (!ts) return "";
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
const weightOf = (p) => {
  if (!p) return "";
  const w = Number(p.weight);
  if (!w) return "";
  const u = { g: "גרם", kg: 'ק"ג', ml: 'מ"ל', l: "ליטר", u: "יח'", t: "יח'" }[p.unitWeight] || p.unitWeight || "";
  return `${w} ${u}`;
};
const metaOf = (p) => [p && p.brand, weightOf(p)].filter(Boolean).join(" · ");

/** The words for a suggestion (shared by the inline block and the summary). */
export function describe(s) {
  if (!s) return null;
  if (s.kind === "swap") {
    const deal =
      s.altPrice && s.altPrice.hasDiscount && s.altPrice.discount
        ? `מבצע: ${s.altPrice.discount.units} ב-${formatNis(s.altPrice.discount.totalPrice)}`
        : "";
    const line = s.sameWeight
      ? `${formatNis(s.altPrice.price)} במקום ${formatNis(s.myPrice ? s.myPrice.price : 0)} ליחידה`
      : `${formatNis(s.altUnit.value)} ${s.altUnit.label} במקום ${formatNis(s.myUnit.value)}`;
    return {
      eyebrow: "יש זול יותר במדף",
      title: s.alt.name,
      meta: metaOf(s.alt),
      line,
      deal,
      save: `חוסכים ${formatNis(s.saving)} ${s.sameWeight ? `על ${unitsWord(s.amount)}` : "לאותה כמות"}`,
      cta: "החלף",
      cancel: "השאר",
      pic: s.alt.barcode,
    };
  }
  if (s.kind === "roundup") {
    return {
      eyebrow: "משלימים מבצע",
      title: `עוד ${unitsWord(s.extra)} ותנצלו את המבצע`,
      meta: "",
      line: `${s.units} ב-${formatNis(s.dealTotal)} · יהיו לך ${s.target}`,
      deal: "",
      save: `עוד ${s.extra === 1 ? "אחד" : s.extra} ב-${formatNis(s.marginal)} במקום ${formatNis(s.regularExtra)}`,
      cta: `השלם ל-${s.target}`,
      cancel: "לא עכשיו",
      pic: null,
    };
  }
  if (s.kind === "missing") {
    return {
      eyebrow: "לא נמכר בסניף הזה",
      title: s.alt ? s.alt.name : "אין מוצר דומה בסניף הזה",
      meta: s.alt ? metaOf(s.alt) : "",
      line: s.alt ? `אפשר במקום · ${formatNis(s.altPrice.price)} ליחידה` : "המוצר לא ייספר בסכום",
      deal:
        s.alt && s.altPrice.hasDiscount && s.altPrice.discount
          ? `מבצע: ${s.altPrice.discount.units} ב-${formatNis(s.altPrice.discount.totalPrice)}`
          : "",
      save: "",
      cta: s.alt ? "החלף" : null,
      cancel: s.alt ? "השאר" : "הבנתי",
      pic: s.alt ? s.alt.barcode : null,
    };
  }
  return null;
}

/* ═════════════ START: pick the branch ═════════════ */
function StartScreen() {
  const c = useCompanion();
  const [picked, setPicked] = useState(() => (c.lastSummary && c.lastSummary.store) || c.recentStores[0] || null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const last = c.lastSummary;

  const choose = (b) => {
    setPicked({ supermarketID: b.supermarketID, name: b.name, address: b.address, city: b.city });
    setPickerOpen(false);
    haptic("selection");
    uiSound("select");
  };

  return (
    <div className="cmp-page cmp-page--start" dir="rtl">
      <ReplaceSupermarket isOpen={pickerOpen} closeModal={() => setPickerOpen(false)} onSelectBranch={choose} ignoreCart />

      <section className="cmp-hero">
        <span className="cmp-hero__icon" aria-hidden="true">
          <IconCompanion />
        </span>
        <h1 className="cmp-hero__title">ליווי בסופר</h1>
        <p className="cmp-hero__sub">
          מוסיפים כל מוצר ברגע שהוא נכנס לעגלה, ואנחנו בודקים אותו מול מחירי הסניף: זול יותר במדף, מבצע שכדאי
          להשלים, והסכום המצטבר כל הזמן מול העיניים. בלי הפתעות בקופה.
        </p>
      </section>

      <section className="cmp-card">
        <h2 className="cmp-card__title">
          <IconStore />
          באיזה סניף אתם?
        </h2>
        {picked ? (
          <button type="button" className="cmp-store" onClick={() => setPickerOpen(true)}>
            <span className="cmp-store__logo" aria-hidden="true">
              <SupermarketImage supermarketName={picked.name} />
            </span>
            <span className="cmp-store__text">
              <span className="cmp-store__name">{picked.name}</span>
              <span className="cmp-store__addr">{[picked.address, picked.city].filter(Boolean).join(", ")}</span>
            </span>
            <span className="cmp-store__change">החלף</span>
          </button>
        ) : (
          <button type="button" className="cmp-store cmp-store--empty" onClick={() => setPickerOpen(true)}>
            <span className="cmp-store__logo cmp-store__logo--empty" aria-hidden="true">
              <IconStore />
            </span>
            <span className="cmp-store__text">
              <span className="cmp-store__name">בחרו סניף</span>
              <span className="cmp-store__addr">רשת ואז סניף</span>
            </span>
            <span className="cmp-store__change">בחר</span>
          </button>
        )}
        {c.recentStores.length > 0 && (
          <div className="cmp-recent">
            <span className="cmp-recent__label">לאחרונה</span>
            {c.recentStores.map((s) => (
              <button
                key={s.supermarketID}
                type="button"
                className={`cmp-chip${picked && String(picked.supermarketID) === String(s.supermarketID) ? " is-on" : ""}`}
                onClick={() => choose(s)}
              >
                {s.name}
                {s.address ? ` · ${s.address}` : ""}
              </button>
            ))}
          </div>
        )}
        <button
          type="button"
          className="cmp-btn cmp-btn--primary cmp-btn--big"
          disabled={!picked}
          onClick={() => c.startSession(picked)}
        >
          <IconCompanion />
          התחל ליווי
        </button>
      </section>

      <section className="cmp-card cmp-card--how">
        <h2 className="cmp-card__title">איך זה עובד</h2>
        <ol className="cmp-how">
          <li>
            <span className="cmp-how__n">1</span>
            <span>
              <b>מוסיפים</b> כל מוצר שנכנס לעגלה: חיפוש מהיר או סריקת ברקוד במצלמה.
            </span>
          </li>
          <li>
            <span className="cmp-how__n">2</span>
            <span>
              <b>בודקים</b> אותו מול מחירי הסניף: מוצר דומה זול יותר, מבצע שכדאי להשלים, או מוצר שלא נמכר כאן.
            </span>
          </li>
          <li>
            <span className="cmp-how__n">3</span>
            <span>
              <b>הסכום</b> מתעדכן בכל הוספה. בסוף אפשר לשמור את הקנייה להיסטוריה.
            </span>
          </li>
        </ol>
      </section>

      {last && (
        <section className="cmp-card cmp-card--last">
          <h2 className="cmp-card__title">
            <IconHistory />
            הליווי האחרון
          </h2>
          <div className="cmp-last">
            <span className="cmp-last__logo" aria-hidden="true">
              <SupermarketImage supermarketName={last.store.name} />
            </span>
            <span className="cmp-last__text">
              <span className="cmp-last__name">{last.store.name}</span>
              <span className="cmp-last__sub">
                {last.items} פריטים · {formatNis(last.total)}
                {last.savings > 0 ? ` · נוצלו ${formatNis(last.savings)}` : ""}
              </span>
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

/* ═════════════ SESSION ═════════════ */
const norm = (s) => (s == null ? "" : String(s)).toLowerCase().trim();

function AddBar({ onAdd, onScan }) {
  const c = useCompanion();
  const { products } = useProductList();
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 180);
    return () => clearTimeout(t);
  }, [query]);

  const words = useMemo(() => norm(debounced).split(/\s+/).filter(Boolean), [debounced]);
  const results = useMemo(() => {
    if (!words.length) return [];
    const q = norm(debounced);
    const digits = /^\d{5,}$/.test(q);
    const rank = (p) => {
      const name = norm(p.name);
      if (name.startsWith(q)) return 0;
      if (name.includes(q)) return 1;
      return 2;
    };
    return (products || [])
      .filter((p) => {
        if (digits) return String(p.barcode || "").includes(q);
        const hay = [p.name, p.generalName, p.brand, p.category, p.subcategory].map(norm);
        return words.every((w) => hay.some((h) => h.includes(w)));
      })
      .map((p) => ({ p, r: rank(p), na: c.pricesMap[p.barcode] ? 0 : 1 }))
      .sort((a, b) => a.na - b.na || a.r - b.r)
      .slice(0, RESULTS_MAX)
      .map((x) => x.p);
  }, [products, words, debounced, c.pricesMap]);

  const inBasket = useMemo(() => {
    const m = {};
    c.lines.forEach((l) => {
      m[l.barcode] = l.amount;
    });
    return m;
  }, [c.lines]);

  const add = (p) => {
    onAdd(p.barcode);
    setQuery("");
    setDebounced("");
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="cmp-add">
      <label className="cmp-add__field">
        <IconSearch />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="מה נכנס לעגלה? שם מוצר או ברקוד"
          aria-label="הוספת מוצר"
          autoComplete="off"
          enterKeyHint="search"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (results.length === 1) add(results[0]);
              else e.currentTarget.blur();
            }
            if (e.key === "Escape") setQuery("");
          }}
        />
        {query && (
          <button type="button" className="cmp-add__clear" aria-label="נקה" onClick={() => setQuery("")}>
            <IconClose />
          </button>
        )}
      </label>
      <button type="button" className="cmp-add__scan" onClick={onScan} aria-label="סריקת ברקוד במצלמה">
        <IconCamera />
        <span>סרוק</span>
      </button>

      {words.length > 0 && (
        <div className="cmp-results" role="listbox" aria-label="תוצאות">
          {results.length === 0 ? (
            <div className="cmp-results__empty">לא נמצא מוצר כזה במאגר</div>
          ) : (
            results.map((p, i) => {
              const pd = c.pricesMap[p.barcode];
              const n = inBasket[p.barcode] || 0;
              return (
                <button
                  type="button"
                  key={p.barcode}
                  className={`cmp-result${pd ? "" : " is-na"}${n ? " in-basket" : ""}`}
                  style={{ "--i": i }}
                  onClick={() => add(p)}
                >
                  <span className="cmp-result__pic">
                    <ProductImageDisplay barcode={p.barcode} eager={i < 4} />
                  </span>
                  <span className="cmp-result__text">
                    <span className="cmp-result__name">{p.name}</span>
                    <span className="cmp-result__meta">{metaOf(p)}</span>
                    <span className="cmp-result__price">
                      {pd ? (
                        <>
                          {formatNis(pd.price)}
                          {pd.hasDiscount && pd.discount && (
                            <span className="cmp-result__deal">
                              <IconTag />
                              {pd.discount.units} ב-{formatNis(pd.discount.totalPrice)}
                            </span>
                          )}
                        </>
                      ) : (
                        "לא נמכר בסניף הזה"
                      )}
                    </span>
                  </span>
                  <span className={`cmp-result__add${n ? " is-on" : ""}`}>
                    <IconPlus />
                    {n ? <span>{n}</span> : <span>הוסף</span>}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function SuggestionBlock({ s, onApply, onDismiss }) {
  const d = describe(s);
  if (!d) return null;
  return (
    <div className={`cmp-sug cmp-sug--${s.kind}`}>
      {d.pic && (
        <span className="cmp-sug__pic">
          <ProductImageDisplay barcode={d.pic} eager />
        </span>
      )}
      <span className="cmp-sug__text">
        <span className="cmp-sug__eyebrow">{d.eyebrow}</span>
        <span className="cmp-sug__title">{d.title}</span>
        {d.meta && <span className="cmp-sug__line">{d.meta}</span>}
        <span className="cmp-sug__line">{d.line}</span>
        {d.deal && <span className="cmp-sug__line cmp-sug__line--deal">{d.deal}</span>}
        {d.save && <span className="cmp-sug__save">{d.save}</span>}
      </span>
      <span className="cmp-sug__actions">
        {d.cta && (
          <button type="button" className="cmp-btn cmp-btn--primary cmp-btn--sm" onClick={() => onApply(s)}>
            {d.cta}
          </button>
        )}
        <button type="button" className="cmp-btn cmp-btn--ghost cmp-btn--sm" onClick={() => onDismiss(s.id)}>
          {d.cancel}
        </button>
      </span>
    </div>
  );
}

function LineRow({ line, index }) {
  const c = useCompanion();
  const [scanning, setScanning] = useState(() => Date.now() - (line.touchedAt || 0) < SCAN_MS);
  const [okFlash, setOkFlash] = useState(false);
  const firstRun = useRef(true);
  const pending = useRef(null);

  /* every add / increase replays the scan beat, then the verdict appears */
  useEffect(() => {
    const age = Date.now() - (line.touchedAt || 0);
    if (age >= SCAN_MS + 200) {
      firstRun.current = false;
      return undefined;
    }
    setScanning(true);
    setOkFlash(false);
    const t = setTimeout(() => {
      setScanning(false);
      pending.current = "verdict";
    }, Math.max(0, SCAN_MS - age));
    firstRun.current = false;
    return () => clearTimeout(t);
  }, [line.touchedAt]);

  /* the verdict feedback runs once per scan, with the suggestions that exist then */
  useEffect(() => {
    if (scanning || pending.current !== "verdict") return undefined;
    pending.current = null;
    if (line.suggestions.length) {
      haptic("medium");
      uiSound("open");
      return undefined;
    }
    if (c.prefs.okToasts && line.sold) {
      haptic("light");
      setOkFlash(true);
      const t = setTimeout(() => setOkFlash(false), OK_FLASH_MS);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [scanning, line.suggestions.length, line.sold, c.prefs.okToasts]);

  const p = line.product;
  const pd = line.priceDoc;
  const name = p ? p.name : `ברקוד ${line.barcode}`;
  const cls = `cmp-line${scanning ? " is-scanning" : ""}${!line.sold ? " is-na" : ""}${line.swappedFrom ? " is-swapped" : ""}`;

  return (
    <li className={cls} style={{ "--i": Math.min(index, 8) }}>
      <div className="cmp-line__main">
        <span className="cmp-line__pic">
          <ProductImageDisplay barcode={line.barcode} eager={index < 6} />
          {scanning && <span className="cmp-line__laser" aria-hidden="true" />}
          {!scanning && !line.sold && (
            <span className="cmp-line__ban" aria-hidden="true">
              <IconBan />
            </span>
          )}
          {!scanning && okFlash && (
            <span className="cmp-line__tick" aria-hidden="true">
              <IconCheck />
            </span>
          )}
        </span>
        <span className="cmp-line__text">
          <span className="cmp-line__name">{name}</span>
          {p && <span className="cmp-line__meta">{metaOf(p)}</span>}
          {line.swappedFrom && (
            <span className="cmp-line__swapped">
              <IconArrow />
              הוחלף במקום {line.swappedFrom.name}
            </span>
          )}
          {scanning ? (
            <span className="cmp-line__status cmp-line__status--scan">סורק מול מחירי הסניף...</span>
          ) : !line.sold ? (
            <span className="cmp-line__status cmp-line__status--na">לא נמכר בסניף הזה</span>
          ) : (
            <span className="cmp-line__price">
              {formatNis(pd.price)} ליח'
              {pd.hasDiscount && pd.discount && (
                <span className="cmp-line__deal">
                  <IconTag />
                  {pd.discount.units} ב-{formatNis(pd.discount.totalPrice)}
                </span>
              )}
              {okFlash && <span className="cmp-line__ok">מחיר טוב</span>}
            </span>
          )}
        </span>
        <span className="cmp-line__side">
          <span className="cmp-line__total">{line.sold ? formatNis(line.lineTotal) : "-"}</span>
          <span className="cmp-qty" aria-label="כמות">
            <button type="button" className="cmp-qty__btn" aria-label="הוסף יחידה" onClick={() => c.setAmount(line.barcode, line.amount + 1)}>
              <IconPlus />
            </button>
            <span className="cmp-qty__n" key={line.amount}>
              {line.amount}
            </span>
            <button type="button" className="cmp-qty__btn" aria-label="הורד יחידה" onClick={() => c.setAmount(line.barcode, line.amount - 1)}>
              <IconMinus />
            </button>
          </span>
        </span>
      </div>
      {!scanning && line.suggestions.length > 0 && (
        <div className="cmp-line__sugs">
          {line.suggestions.map((s) => (
            <SuggestionBlock key={s.id} s={s} onApply={c.applySuggestion} onDismiss={c.dismissSuggestion} />
          ))}
        </div>
      )}
    </li>
  );
}

/* ───────────── the barcode camera sheet (continuous: scan, scan, scan) ───────────── */
function ScanSheet({ open, onClose, onDetected }) {
  useBodyScrollLock(open);
  if (!open) return null;
  return (
    <div className="cmp-sheet-layer is-open cmp-scan" dir="rtl">
      <div className="cmp-veil" onClick={onClose} />
      <div className="cmp-sheet" role="dialog" aria-modal="true" aria-label="סריקת ברקוד">
        <div className="cmp-sheet__grip" aria-hidden="true" />
        <header className="cmp-sheet__head">
          <span className="cmp-sheet__logo cmp-sheet__logo--icon" aria-hidden="true">
            <IconBarcode />
          </span>
          <span className="cmp-sheet__text">
            <span className="cmp-sheet__title">סריקת ברקוד</span>
            <span className="cmp-sheet__sub">כל סריקה מוסיפה את המוצר לסל. אפשר לסרוק מוצר אחרי מוצר.</span>
          </span>
          <button type="button" className="cmp-sheet__x" aria-label="סגור" onClick={onClose}>
            <IconClose />
          </button>
        </header>
        <div className="cmp-sheet__body">
          <div className="cmp-scan__stage">
            <ScannerView active={open} mode="continuous" onDetected={onDetected} hint="סורקים מוצר אחרי מוצר" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────── the end-of-shopping sheet ───────────── */
function EndSheet({ open, onClose }) {
  const c = useCompanion();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  useBodyScrollLock(open);
  useEffect(() => {
    if (!open) return undefined;
    setError(null);
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  const { store, totals, savings, applied } = c;
  const soldLines = c.lines.filter((l) => l.sold).length;

  const finish = async (save) => {
    if (saving) return;
    setError(null);
    if (save) {
      setSaving(true);
      try {
        const id = await c.saveToHistory();
        setSaving(false);
        c.endSession();
        onClose();
        if (id) navigate(`/history/${id}`);
        return;
      } catch (e) {
        setSaving(false);
        setError("השמירה להיסטוריה נכשלה. אפשר לנסות שוב או לסיים בלי לשמור.");
        haptic("error");
        uiSound("error");
        return;
      }
    }
    c.endSession();
    onClose();
  };

  return (
    <div className="cmp-sheet-layer is-open" dir="rtl">
      <div className="cmp-veil" onClick={onClose} />
      <div className="cmp-sheet" role="dialog" aria-modal="true" aria-label="סיום הקנייה">
        <div className="cmp-sheet__grip" aria-hidden="true" />
        <header className="cmp-sheet__head">
          <span className="cmp-sheet__logo" aria-hidden="true">
            <SupermarketImage supermarketName={store.name} />
          </span>
          <span className="cmp-sheet__text">
            <span className="cmp-sheet__title">סיום הקנייה ב{store.name}</span>
            <span className="cmp-sheet__sub">
              {[store.address, store.city].filter(Boolean).join(", ")}
              {c.session && c.session.startedAt ? ` · מאז ${timeOf(c.session.startedAt)}` : ""}
            </span>
          </span>
          <button type="button" className="cmp-sheet__x" aria-label="סגור" onClick={onClose}>
            <IconClose />
          </button>
        </header>
        <div className="cmp-sheet__body">
          <div className="cmp-stats">
            <div className="cmp-stat cmp-stat--total">
              <span className="cmp-stat__label">לתשלום בקופה</span>
              <span className="cmp-stat__value">{formatNis(totals.total)}</span>
              <span className="cmp-stat__sub">{totals.items} פריטים · {totals.lines} שורות</span>
            </div>
            <div className="cmp-stat cmp-stat--save">
              <span className="cmp-stat__label">נוצל בליווי</span>
              <span className="cmp-stat__value">{formatNis(savings)}</span>
              <span className="cmp-stat__sub">{applied.length === 1 ? "הצעה אחת" : `${applied.length} הצעות`}</span>
            </div>
            <div className="cmp-stat">
              <span className="cmp-stat__label">לא נמכרים כאן</span>
              <span className="cmp-stat__value">{totals.missing}</span>
              <span className="cmp-stat__sub">{totals.missing ? "לא נספרים בסכום" : "הכול נמצא"}</span>
            </div>
          </div>
          {totals.open > 0 && (
            <div className="cmp-note">
              עוד {totals.open === 1 ? "הצעה אחת פתוחה" : `${totals.open} הצעות פתוחות`} בסל. אפשר לחזור ולהחליט לפני הקופה.
            </div>
          )}
          {applied.length > 0 && (
            <>
              <h4 className="cmp-sheet__h">מה נוצל בקנייה הזאת</h4>
              <ul className="cmp-list cmp-list--done">
                {applied.map((a) => (
                  <li className="cmp-done" key={`${a.id}-${a.at}`}>
                    <span className="cmp-done__tick" aria-hidden="true">
                      <IconCheck />
                    </span>
                    <span className="cmp-done__text">
                      <span className="cmp-done__title">
                        {a.kind === "roundup" ? `${a.name} · הושלם ל-${a.target}` : `${a.altName || ""} במקום ${a.name}`}
                      </span>
                      <span className="cmp-done__sub">{timeOf(a.at)}</span>
                    </span>
                    {a.saving > 0 && <span className="cmp-done__save">{formatNis(a.saving)}</span>}
                  </li>
                ))}
              </ul>
            </>
          )}
          {error && <div className="cmp-error">{error}</div>}
        </div>
        <footer className="cmp-sheet__foot cmp-sheet__foot--col">
          <button
            type="button"
            className="cmp-btn cmp-btn--primary"
            disabled={saving || soldLines === 0}
            onClick={() => finish(true)}
          >
            <IconHistory />
            {saving ? "שומר..." : "שמור להיסטוריה וסיים"}
          </button>
          <div className="cmp-sheet__foot-row">
            <button type="button" className="cmp-btn cmp-btn--ghost" disabled={saving} onClick={() => finish(false)}>
              סיים בלי לשמור
            </button>
            <button type="button" className="cmp-btn cmp-btn--ghost" disabled={saving} onClick={onClose}>
              המשך קנייה
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function SessionScreen() {
  const c = useCompanion();
  const [scanOpen, setScanOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const { store, totals } = c;

  const showToast = (t) => {
    clearTimeout(toastTimer.current);
    setToast(t);
    toastTimer.current = setTimeout(() => setToast(null), 1800);
  };
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const onAdd = (barcode) => {
    const p = c.productMap[barcode];
    if (!p) {
      haptic("error");
      return { ok: false, text: `ברקוד ${barcode} לא נמצא במאגר` };
    }
    const existed = c.addProduct(barcode, 1);
    uiSound("tap");
    const line = c.lines.find((l) => l.barcode === barcode);
    const n = existed && line ? line.amount + 1 : 1;
    const text = existed ? `${p.name} · עכשיו ${n}` : `נוסף: ${p.name}`;
    showToast({ ok: true, text });
    return { ok: true, text };
  };

  return (
    <div className="cmp-page cmp-page--session" dir="rtl">
      <header className="cmp-head">
        <div className="cmp-head__store">
          <span className="cmp-head__logo" aria-hidden="true">
            <SupermarketImage supermarketName={store.name} />
          </span>
          <span className="cmp-head__text">
            <span className="cmp-head__name">
              <span className="cmp-head__live" aria-hidden="true" />
              ליווי ב{store.name}
            </span>
            <span className="cmp-head__addr">{[store.address, store.city].filter(Boolean).join(", ")}</span>
          </span>
          <button
            type="button"
            className="cmp-head__end"
            onClick={() => {
              haptic("light");
              uiSound("open");
              setEndOpen(true);
            }}
          >
            סיים קנייה
          </button>
        </div>
        <div className="cmp-total">
          <span className="cmp-total__label">
            <IconWallet />
            לתשלום בקופה
          </span>
          <span className="cmp-total__value" key={totals.total}>
            {formatNis(totals.total)}
          </span>
          <span className="cmp-total__sub">
            {totals.items === 1 ? "פריט אחד" : `${totals.items} פריטים`}
            {c.savings > 0 ? ` · נוצלו ${formatNis(c.savings)}` : ""}
            {totals.missing > 0 ? ` · ${totals.missing} לא נמכרים כאן` : ""}
          </span>
        </div>
        {c.pricesError && (
          <button type="button" className="cmp-head__warn" onClick={c.retryPrices}>
            מחירי הסניף לא נטענו. הקישו לניסיון נוסף.
          </button>
        )}
        {c.pricesLoading && <div className="cmp-head__loading">טוען את מחירי הסניף...</div>}
      </header>

      <AddBar
        onAdd={onAdd}
        onScan={() => {
          haptic("medium");
          uiSound("open");
          setScanOpen(true);
        }}
      />

      {toast && <div className={`cmp-toast${toast.ok ? "" : " is-bad"}`}>{toast.text}</div>}

      {c.lines.length === 0 ? (
        <div className="cmp-emptybasket">
          <span className="cmp-emptybasket__icon" aria-hidden="true">
            <IconCompanion />
          </span>
          <span className="cmp-emptybasket__title">הסל עוד ריק</span>
          <span className="cmp-emptybasket__sub">הוסיפו את המוצר הראשון שנכנס לעגלה, ונבדוק אותו מול מחירי {store.name}.</span>
        </div>
      ) : (
        <ul className="cmp-lines">
          {c.lines.map((l, i) => (
            <LineRow key={`${l.barcode}-${l.addedAt}`} line={l} index={i} />
          ))}
        </ul>
      )}

      <ScanSheet
        open={scanOpen}
        onClose={() => {
          uiSound("close");
          setScanOpen(false);
        }}
        onDetected={onAdd}
      />
      <EndSheet open={endOpen} onClose={() => setEndOpen(false)} />
    </div>
  );
}

export default function CompanionPage() {
  const c = useCompanion();
  useEffect(() => {
    const scroller = document.querySelector(".app-scroll");
    if (scroller) scroller.scrollTo({ top: 0 });
  }, [c.hasSession]);
  return c.hasSession ? <SessionScreen /> : <StartScreen />;
}
