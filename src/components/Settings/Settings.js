import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Settings.css";
import { useProductsLayout } from "../../context/ProductsLayoutContext";
import { useCartCardLayout } from "../../context/CartCardLayoutContext";
import { usePriceCompareLayout } from "../../context/PriceCompareLayoutContext";
import { useAITheme } from "../../context/AIThemeContext";
import { useReceiptTheme } from "../../context/ReceiptThemeContext";
import { useSupermarketPreferences } from "../../context/SupermarketPreferencesContext";
import { useAiSettings } from "../../context/AiSettingsContext";
import { useSupermarkets } from "../../hooks/optimizationHooks";
import { useAvailabilityMeta } from "../../hooks/useProductAvailability";
import SupermarketImage from "../Images/SupermarketImage";
import { rebuildAvailabilityIndex } from "../../services/productAvailabilityService";
import { BUILD_VERSION } from "../../buildInfo";

const PRODUCTS_LAYOUT_OPTIONS = [
  {
    value: "list",
    label: "רשימה",
    description: "מוצר אחד בכל שורה — תצוגה מורחבת",
  },
  {
    value: "grid",
    label: "רשת",
    description: "שני מוצרים בכל שורה — תצוגה קומפקטית",
  },
];

const AI_THEME_OPTIONS = [
  {
    value: "neurons",
    label: "נוירונים",
    description: "חלקיקים זוהרים מחוברים — קלאסי וטכנולוגי",
  },
  {
    value: "aurora",
    label: "זוהר צפוני",
    description: "ענני צבע נעים בתנועה איטית — חולמני",
  },
  {
    value: "galaxy",
    label: "גלקסיה",
    description: "כוכבים מנצנצים, ערפילית וכוכבי שביט",
  },
  {
    value: "cyber",
    label: "סייבר",
    description: "סינתווייב — שמש ניאון וגריד פרספקטיבה",
  },
];

/* Voice-reply language + voices — mirrors the picker on the AI page so the
   voice command (long-press the bottom-nav coin) and the AI page share the
   same spoken-reply preference (stored in AiSettingsContext). */
const TTS_LANGUAGE_OPTIONS = [
  { value: "he", label: "עברית" },
  { value: "en", label: "English" },
];

const TTS_VOICES = {
  en: [
    { value: "", label: "Robot (ברירת מחדל)" },
    { value: "21m00Tcm4TlvDq8ikWAM", label: "Rachel (נקבה)" },
    { value: "EXAVITQu4vr4xnSDxMaL", label: "Bella (נקבה)" },
    { value: "pNInz6obpgDQGcFmaJgB", label: "Adam (זכר)" },
    { value: "ErXwobaYiN019PkySvjV", label: "Antoni (זכר)" },
    { value: "TxGEqnHWrfWFTfGW9XjX", label: "Josh (זכר)" },
    { value: "VR6AewLTigWG4xSOukaG", label: "Arnold (זכר)" },
    { value: "29vD33N1CtxCmqQRPOHJ", label: "Drew (זכר)" },
    { value: "KzE5xImZVu70uQLdx5z5", label: "Kitchri (נקבה)" },
    { value: "WTELPzK6rbJ0aj54ivAR", label: "Kitchri - IL (נקבה)" },
  ],
  he: [
    { value: "", label: "Alnilam - זכר (ברירת מחדל)" },
    { value: "he-IL-Chirp3-HD-Puck", label: "Puck (זכר)" },
    { value: "he-IL-Chirp3-HD-Charon", label: "Charon (זכר)" },
    { value: "he-IL-Chirp3-HD-Fenrir", label: "Fenrir (זכר)" },
    { value: "he-IL-Chirp3-HD-Orus", label: "Orus (זכר)" },
    { value: "he-IL-Chirp3-HD-Aoede", label: "Aoede (נקבה)" },
    { value: "he-IL-Chirp3-HD-Kore", label: "Kore (נקבה)" },
    { value: "he-IL-Chirp3-HD-Leda", label: "Leda (נקבה)" },
    { value: "he-IL-Chirp3-HD-Zephyr", label: "Zephyr (נקבה)" },
  ],
};

const PRICE_COMPARE_LAYOUT_OPTIONS = [
  {
    value: "expanded",
    label: "כל הסניפים",
    description: "כל סניף מוצג כשורה נפרדת — תמיד",
  },
  {
    value: "grouped",
    label: "מקובצים לפי רשת",
    description: "סניפים זהים באותה רשת מתאחדים לשורה אחת",
  },
];

const RECEIPT_THEME_OPTIONS = [
  {
    value: "color",
    label: "צבעוני",
    description: "תצוגה מקורית עם איקונים ותמונות בצבע מלא",
  },
  {
    value: "grayscale",
    label: "גווני אפור",
    description: "הקבלה כולה בגוונים של שחור-לבן",
  },
];

const CART_CARD_LAYOUT_OPTIONS = [
  {
    value: "default",
    label: "מורחבת",
    description: "כפתורי +/- ועדכון בשורה נפרדת מתחת",
  },
  {
    value: "compact",
    label: "קומפקטית",
    description: "ללא שורת כפתורים — שינוי כמות בהחלקה",
  },
];

function ProductsLayoutPreview({ value }) {
  if (value === "list") {
    return (
      <div className="layout-preview layout-preview--list">
        <span /><span /><span />
      </div>
    );
  }
  return (
    <div className="layout-preview layout-preview--grid">
      <span /><span /><span /><span />
    </div>
  );
}

function AIThemePreview({ value }) {
  return (
    <div className={`ai-theme-preview ai-theme-preview--${value}`}>
      {value === "neurons" && (
        <>
          <span className="ai-theme-preview__dot ai-theme-preview__dot-1" />
          <span className="ai-theme-preview__dot ai-theme-preview__dot-2" />
          <span className="ai-theme-preview__dot ai-theme-preview__dot-3" />
          <span className="ai-theme-preview__dot ai-theme-preview__dot-4" />
        </>
      )}
      {value === "aurora" && (
        <>
          <span className="ai-theme-preview__blob ai-theme-preview__blob-1" />
          <span className="ai-theme-preview__blob ai-theme-preview__blob-2" />
          <span className="ai-theme-preview__blob ai-theme-preview__blob-3" />
        </>
      )}
      {value === "galaxy" && (
        <>
          <span className="ai-theme-preview__star ai-theme-preview__star-1" />
          <span className="ai-theme-preview__star ai-theme-preview__star-2" />
          <span className="ai-theme-preview__star ai-theme-preview__star-3" />
          <span className="ai-theme-preview__star ai-theme-preview__star-4" />
          <span className="ai-theme-preview__star ai-theme-preview__star-5" />
          <span className="ai-theme-preview__star ai-theme-preview__star-6" />
          <span className="ai-theme-preview__comet" />
        </>
      )}
      {value === "cyber" && (
        <>
          <span className="ai-theme-preview__sun" />
          <span className="ai-theme-preview__grid" />
        </>
      )}
    </div>
  );
}

function PriceComparePreview({ value }) {
  if (value === "expanded") {
    return (
      <div className="price-compare-preview">
        <div className="price-compare-preview__row">
          <span className="price-compare-preview__logo" />
          <span className="price-compare-preview__line" />
          <span className="price-compare-preview__price" />
        </div>
        <div className="price-compare-preview__row">
          <span className="price-compare-preview__logo" />
          <span className="price-compare-preview__line" />
          <span className="price-compare-preview__price" />
        </div>
        <div className="price-compare-preview__row">
          <span className="price-compare-preview__logo" />
          <span className="price-compare-preview__line" />
          <span className="price-compare-preview__price" />
        </div>
      </div>
    );
  }
  return (
    <div className="price-compare-preview price-compare-preview--grouped">
      <div className="price-compare-preview__row">
        <span className="price-compare-preview__logo" />
        <span className="price-compare-preview__line" />
        <span className="price-compare-preview__badge">3</span>
        <span className="price-compare-preview__price" />
      </div>
    </div>
  );
}

function ReceiptThemePreview({ value }) {
  return (
    <div className={`receipt-theme-preview receipt-theme-preview--${value}`}>
      <span className="receipt-theme-preview__line receipt-theme-preview__line--header" />
      <span className="receipt-theme-preview__row">
        <span className="receipt-theme-preview__tag" />
        <span className="receipt-theme-preview__line" />
      </span>
      <span className="receipt-theme-preview__row">
        <span className="receipt-theme-preview__tag" />
        <span className="receipt-theme-preview__line" />
      </span>
      <span className="receipt-theme-preview__row">
        <span className="receipt-theme-preview__tag" />
        <span className="receipt-theme-preview__line" />
      </span>
      <span className="receipt-theme-preview__total" />
    </div>
  );
}

function CartCardPreview({ value }) {
  if (value === "default") {
    return (
      <div className="cart-card-preview cart-card-preview--default">
        <div className="cart-card-preview__top">
          <span className="cart-card-preview__line" />
          <span className="cart-card-preview__img" />
        </div>
        <div className="cart-card-preview__bottom">
          <span className="cart-card-preview__btn cart-card-preview__btn--minus" />
          <span className="cart-card-preview__btn cart-card-preview__btn--plus" />
          <span className="cart-card-preview__btn cart-card-preview__btn--cancel" />
        </div>
      </div>
    );
  }
  return (
    <div className="cart-card-preview cart-card-preview--compact">
      <div className="cart-card-preview__top">
        <span className="cart-card-preview__line" />
        <span className="cart-card-preview__img" />
      </div>
      <div className="cart-card-preview__inline">
        <span className="cart-card-preview__chip" />
        <span className="cart-card-preview__chip cart-card-preview__chip--accent" />
      </div>
    </div>
  );
}

function formatRelativeTime(iso) {
  if (!iso) return "טרם עודכן";
  const ts = new Date(iso).getTime();
  if (Number.isNaN(ts)) return "טרם עודכן";
  const diffMs = Date.now() - ts;
  const diffMin = Math.round(diffMs / 60000);
  if (diffMin < 1) return "לפני רגע";
  if (diffMin < 60) return `לפני ${diffMin} ${diffMin === 1 ? "דקה" : "דקות"}`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `לפני ${diffHr} ${diffHr === 1 ? "שעה" : "שעות"}`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 30) return `לפני ${diffDay} ${diffDay === 1 ? "יום" : "ימים"}`;
  const d = new Date(iso);
  return d.toLocaleDateString("he-IL");
}

export default function Settings() {
  const { layout: productsLayout, setLayout: setProductsLayout } =
    useProductsLayout();
  const { layout: cartCardLayout, setLayout: setCartCardLayout } =
    useCartCardLayout();
  const { layout: priceCompareLayout, setLayout: setPriceCompareLayout } =
    usePriceCompareLayout();
  const { theme: aiTheme, setTheme: setAITheme } = useAITheme();
  const { theme: receiptTheme, setTheme: setReceiptTheme } = useReceiptTheme();
  const aiSettings = useAiSettings();
  const ttsLanguage =
    (aiSettings && aiSettings.settings.ttsLanguage) || "he";
  const ttsVoice = (aiSettings && aiSettings.settings.ttsVoice) || "";
  const updateAiSetting = aiSettings && aiSettings.updateSetting;
  const {
    preferredSupermarketIDs,
    toggleSupermarket,
    clearPreferences,
  } = useSupermarketPreferences();
  const { allSupermarkets } = useSupermarkets();
  const [isBranchPickerOpen, setIsBranchPickerOpen] = useState(false);

  /* lookup: id → { name, address, city } — used by the chip list */
  const supermarketLookup = React.useMemo(() => {
    const map = new Map();
    (allSupermarkets || []).forEach((s) => {
      map.set(String(s.supermarketID), s);
    });
    return map;
  }, [allSupermarkets]);

  const { meta, isLoading: isMetaLoading, refetch: refetchMeta } =
    useAvailabilityMeta();
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState(null); // { kind, message }

  const handleRebuild = async () => {
    if (isRebuilding) return;
    setIsRebuilding(true);
    setRebuildStatus(null);
    try {
      const result = await rebuildAvailabilityIndex();
      await refetchMeta();
      setRebuildStatus({
        kind: "success",
        message: `עודכנו ${result.productCount || 0} מוצרים`,
      });
    } catch (err) {
      setRebuildStatus({
        kind: "error",
        message: "העדכון נכשל. נסה שוב.",
      });
    } finally {
      setIsRebuilding(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-page__header">
        <h1 className="settings-page__title">הגדרות</h1>
        <p className="settings-page__subtitle">
          כאן תוכל לנהל את ההעדפות של האפליקציה
        </p>
      </div>

      <div className="settings-page__content">
        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">תצוגת רשימת המוצרים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר כיצד יוצגו המוצרים בעמוד המוצרים
            </p>
            <div className="layout-options">
              {PRODUCTS_LAYOUT_OPTIONS.map((opt) => {
                const active = productsLayout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setProductsLayout(opt.value)}
                    aria-pressed={active}
                  >
                    <ProductsLayoutPreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">תצוגת כרטיסיית מוצר בעגלה</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר את צורת הכרטיסייה של מוצרי העגלה
            </p>
            <div className="layout-options">
              {CART_CARD_LAYOUT_OPTIONS.map((opt) => {
                const active = cartCardLayout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setCartCardLayout(opt.value)}
                    aria-pressed={active}
                  >
                    <CartCardPreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">ערכת נושא ל-AI</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר רקע ופלטת צבעים לעמוד ה-AI — הצ׳אט, הכפתורים וכל המראה
            </p>
            <div className="layout-options layout-options--quad">
              {AI_THEME_OPTIONS.map((opt) => {
                const active = aiTheme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setAITheme(opt.value)}
                    aria-pressed={active}
                  >
                    <AIThemePreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">תשובה קולית</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר את שפת התשובה הקולית והקול לפקודות קוליות — לחיצה ארוכה על
              כפתור ה-AI בסרגל התחתון מקליטה פקודה, והעוזר משיב בקול.
            </p>

            <div className="voice-reply-row">
              <span className="voice-reply-row__label">שפת תשובה</span>
              <div className="voice-reply-langs">
                {TTS_LANGUAGE_OPTIONS.map((opt) => {
                  const active = ttsLanguage === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      className={`voice-reply-lang-btn ${
                        active ? "is-active" : ""
                      }`}
                      aria-pressed={active}
                      onClick={() => {
                        if (!updateAiSetting) return;
                        updateAiSetting("ttsLanguage", opt.value);
                        updateAiSetting("ttsVoice", "");
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="voice-reply-row">
              <span className="voice-reply-row__label">קול</span>
              <select
                className="voice-reply-select"
                value={ttsVoice}
                onChange={(e) =>
                  updateAiSetting && updateAiSetting("ttsVoice", e.target.value)
                }
              >
                {(TTS_VOICES[ttsLanguage] || TTS_VOICES.he).map((v) => (
                  <option key={v.value || "default"} value={v.value}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">תצוגת השוואת מחירים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר כיצד יוצגו מחירים של אותה רשת באותו מוצר
            </p>
            <div className="layout-options">
              {PRICE_COMPARE_LAYOUT_OPTIONS.map((opt) => {
                const active = priceCompareLayout === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setPriceCompareLayout(opt.value)}
                    aria-pressed={active}
                  >
                    <PriceComparePreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">תצוגת קבלה</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר כיצד תוצג קבלה בהיסטוריית הקניות
            </p>
            <div className="layout-options">
              {RECEIPT_THEME_OPTIONS.map((opt) => {
                const active = receiptTheme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    className={`layout-option ${active ? "is-active" : ""}`}
                    onClick={() => setReceiptTheme(opt.value)}
                    aria-pressed={active}
                  >
                    <ReceiptThemePreview value={opt.value} />
                    <span className="layout-option__label">{opt.label}</span>
                    <span className="layout-option__desc">
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">עדכון נתונים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              עדכון אינדקס הזמינות של המוצרים בסופרים — משמש להצגה רק של
              סופרים שמכילים את כל מוצרי העגלה.
            </p>

            <div className="settings-row">
              <span className="settings-row__label">עודכן לאחרונה</span>
              <span className="settings-row__value">
                {isMetaLoading
                  ? "טוען…"
                  : formatRelativeTime(meta && meta.updatedAt)}
              </span>
            </div>
            <div className="settings-row">
              <span className="settings-row__label">מוצרים באינדקס</span>
              <span className="settings-row__value">
                {isMetaLoading ? "—" : (meta && meta.productCount) || 0}
              </span>
            </div>

            <button
              type="button"
              className={`settings-rebuild-btn ${
                isRebuilding ? "is-loading" : ""
              }`}
              onClick={handleRebuild}
              disabled={isRebuilding}
            >
              {isRebuilding ? (
                <span className="settings-rebuild-spinner" aria-hidden />
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="23 4 23 10 17 10" />
                  <polyline points="1 20 1 14 7 14" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
              )}
              {isRebuilding ? "מעדכן…" : "עדכן עכשיו"}
            </button>

            {rebuildStatus && (
              <div
                className={`settings-rebuild-status settings-rebuild-status--${rebuildStatus.kind}`}
                role="status"
              >
                {rebuildStatus.message}
              </div>
            )}
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">רענון כל המחירים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              טעינה מחדש של מחירי כל המוצרים מ-chp.co.il והחלפת כל אובייקטי
              המחירים במסד הנתונים. התהליך רץ בשלושה שלבים מקבילים עם פידבק חי.
            </p>

            <Link to="/refresh-all-prices" className="settings-link-btn">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              רענן את כל המחירים
              <svg
                className="settings-link-btn__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">סניפים מועדפים</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              בחר את הסניפים שאתה מעדיף לקנות בהם. הכפתור "לפי העדפות"
              באופטימיזציית עגלות יסמן בדיוק את הסניפים האלה.
            </p>

            <div className="settings-row">
              <span className="settings-row__label">סניפים מועדפים</span>
              <span className="settings-row__value">
                {preferredSupermarketIDs.length === 0
                  ? "לא נבחרו"
                  : preferredSupermarketIDs.length}
              </span>
            </div>

            {preferredSupermarketIDs.length > 0 && (
              <div className="settings-preferred-chips">
                {preferredSupermarketIDs.slice(0, 24).map((id) => {
                  const s = supermarketLookup.get(String(id));
                  const label = s
                    ? `${s.name}${s.address ? ` · ${s.address}` : ""}`
                    : `סניף #${id}`;
                  return (
                    <span key={id} className="settings-preferred-chip">
                      <span className="settings-preferred-chip__text">{label}</span>
                      <button
                        type="button"
                        className="settings-preferred-chip__x"
                        onClick={() => toggleSupermarket(id)}
                        aria-label="הסר"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
                {preferredSupermarketIDs.length > 24 && (
                  <span className="settings-preferred-chip-more">
                    + עוד {preferredSupermarketIDs.length - 24}
                  </span>
                )}
              </div>
            )}

            <button
              type="button"
              className="settings-link-btn"
              onClick={() => setIsBranchPickerOpen(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2l2.9 6.55 7.1.85-5.3 4.85 1.5 7.1L12 17.77 5.8 21.35l1.5-7.1L2 9.4l7.1-.85L12 2z" />
              </svg>
              {preferredSupermarketIDs.length === 0 ? "בחר סניפים" : "ערוך סניפים"}
              <svg
                className="settings-link-btn__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">אנימציות טעינה</span>
          </header>
          <div className="settings-card__body">
            <p className="settings-card__hint">
              גלריית אנימציות בסגנון דואלינגו — דמויות שעושות פעולה
              שמתאימה למצב הטעינה. לתצוגה בלבד.
            </p>
            <Link to="/loading-animations" className="settings-link-btn">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" />
              </svg>
              פתח את הגלריה
              <svg
                className="settings-link-btn__chevron"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
          </div>
        </section>

        <section className="settings-card">
          <header className="settings-card__header">
            <span className="settings-card__title">אודות</span>
          </header>
          <div className="settings-card__body">
            <div className="settings-row">
              <span className="settings-row__label">גרסה</span>
              <span className="settings-row__value">{BUILD_VERSION}</span>
            </div>
          </div>
        </section>
      </div>

      {isBranchPickerOpen && (
        <BranchPickerModal
          allSupermarkets={allSupermarkets}
          preferredSupermarketIDs={preferredSupermarketIDs}
          onToggleSupermarket={toggleSupermarket}
          onClearAll={clearPreferences}
          onClose={() => setIsBranchPickerOpen(false)}
        />
      )}
    </div>
  );
}

/* ─────────────  Modal — pick preferred branches (individual supermarkets)  ───────────── */

function BranchPickerModal({
  allSupermarkets,
  preferredSupermarketIDs,
  onToggleSupermarket,
  onClearAll,
  onClose,
}) {
  /* selected chain — null means "showing the chain grid", a string means
     "drilled into this chain's branches". */
  const [selectedChain, setSelectedChain] = useState(null);

  const selectedSet = React.useMemo(
    () => new Set((preferredSupermarketIDs || []).map(String)),
    [preferredSupermarketIDs]
  );

  const chains = React.useMemo(() => {
    const map = new Map();
    (allSupermarkets || []).forEach((s) => {
      if (!s || !s.name) return;
      if (!map.has(s.name)) map.set(s.name, []);
      map.get(s.name).push(s);
    });
    return Array.from(map.entries())
      .map(([name, branches]) => ({
        name,
        branches: branches.sort((a, b) =>
          (a.address || "").localeCompare(b.address || "", "he")
        ),
        selectedCount: branches.filter((b) =>
          selectedSet.has(String(b.supermarketID))
        ).length,
      }))
      .sort(
        (a, b) =>
          b.branches.length - a.branches.length ||
          a.name.localeCompare(b.name, "he")
      );
  }, [allSupermarkets, selectedSet]);

  const activeChain = selectedChain
    ? chains.find((c) => c.name === selectedChain)
    : null;

  const handleOverlay = (e) => {
    if (e.target.classList.contains("chain-picker-overlay")) onClose();
  };

  const handleSelectAllInChain = () => {
    if (!activeChain) return;
    const allSel = activeChain.selectedCount === activeChain.branches.length;
    activeChain.branches.forEach((b) => {
      const isSel = selectedSet.has(String(b.supermarketID));
      if (allSel && isSel) onToggleSupermarket(b.supermarketID);
      if (!allSel && !isSel) onToggleSupermarket(b.supermarketID);
    });
  };

  return (
    <div
      className="chain-picker-overlay"
      role="dialog"
      aria-label="בחירת סניפים מועדפים"
      onClick={handleOverlay}
    >
      <div className="chain-picker-window">
        <header className="chain-picker-header">
          <div>
            <h3 className="chain-picker-title">
              {activeChain ? activeChain.name : "סניפים מועדפים"}
            </h3>
            <p className="chain-picker-subtitle">
              {activeChain
                ? `${activeChain.selectedCount} מתוך ${activeChain.branches.length} סניפים נבחרו`
                : "בחר רשת כדי לראות את הסניפים שלה"}
            </p>
          </div>
          <button
            type="button"
            className="chain-picker-close"
            onClick={onClose}
            aria-label="סגור"
          >
            ×
          </button>
        </header>

        {!activeChain ? (
          <ChainGrid chains={chains} onPickChain={setSelectedChain} />
        ) : (
          <ChainBranches
            chain={activeChain}
            selectedSet={selectedSet}
            onToggleSupermarket={onToggleSupermarket}
            onSelectAllInChain={handleSelectAllInChain}
            onBack={() => setSelectedChain(null)}
          />
        )}

        <footer className="chain-picker-footer">
          <span className="chain-picker-selected-count">
            {preferredSupermarketIDs.length === 0
              ? "אף סניף לא נבחר"
              : preferredSupermarketIDs.length === 1
              ? "סניף אחד נבחר"
              : `סה"כ ${preferredSupermarketIDs.length} סניפים נבחרו`}
          </span>
          <button
            type="button"
            className="chain-picker-clear"
            onClick={onClearAll}
            disabled={preferredSupermarketIDs.length === 0}
          >
            נקה הכל
          </button>
        </footer>
      </div>
    </div>
  );
}

/* ─── Step 1 — grid of chain cards (logo + count of selected) ─── */
function ChainGrid({ chains, onPickChain }) {
  const [query, setQuery] = useState("");
  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chains;
    return chains.filter((c) => c.name.toLowerCase().includes(q));
  }, [chains, query]);

  return (
    <div className="chain-picker-body">
      <div className="chain-picker-search">
        <input
          type="text"
          className="chain-picker-search-input"
          placeholder="חפש רשת..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button
            type="button"
            className="chain-picker-search-clear"
            onClick={() => setQuery("")}
            aria-label="נקה"
          >
            ×
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="chain-picker-empty">אין תוצאות</div>
      ) : (
        <div className="chain-picker-grid">
          {filtered.map((c) => {
            const allSelected = c.selectedCount === c.branches.length;
            const someSelected = c.selectedCount > 0 && !allSelected;
            return (
              <button
                type="button"
                key={c.name}
                className={`chain-picker-card ${
                  allSelected ? "is-all" : someSelected ? "is-partial" : ""
                }`}
                onClick={() => onPickChain(c.name)}
              >
                <div className="chain-picker-card-logo">
                  <SupermarketImage supermarketName={c.name} />
                </div>
                <div className="chain-picker-card-info">
                  <span className="chain-picker-card-name">{c.name}</span>
                  <span className="chain-picker-card-meta">
                    {c.selectedCount > 0 ? (
                      <span className="chain-picker-card-meta-sel">
                        ✓ {c.selectedCount} / {c.branches.length}
                      </span>
                    ) : (
                      <span>{c.branches.length} סניפים</span>
                    )}
                  </span>
                </div>
                <svg
                  className="chain-picker-card-arrow"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── Step 2 — branches of a chain, grouped by city ─── */
function ChainBranches({
  chain,
  selectedSet,
  onToggleSupermarket,
  onSelectAllInChain,
  onBack,
}) {
  const [query, setQuery] = useState("");
  const [activeCity, setActiveCity] = useState(null);

  const byCity = React.useMemo(() => {
    const map = new Map();
    chain.branches.forEach((b) => {
      const city = b.city || "—";
      if (!map.has(city)) map.set(city, []);
      map.get(city).push(b);
    });
    return Array.from(map.entries())
      .map(([city, branches]) => ({ city, branches }))
      .sort((a, b) => b.branches.length - a.branches.length);
  }, [chain]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    let groups = byCity;
    if (activeCity) groups = groups.filter((g) => g.city === activeCity);
    if (q) {
      groups = groups
        .map(({ city, branches }) => ({
          city,
          branches: branches.filter(
            (b) =>
              (b.address || "").toLowerCase().includes(q) ||
              (b.city || "").toLowerCase().includes(q)
          ),
        }))
        .filter((g) => g.branches.length > 0);
    }
    return groups;
  }, [byCity, query, activeCity]);

  const allSelected = chain.selectedCount === chain.branches.length;

  return (
    <div className="chain-picker-body">
      <div className="chain-picker-branches-toolbar">
        <button
          type="button"
          className="chain-picker-back"
          onClick={onBack}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
          חזרה לרשתות
        </button>
        <button
          type="button"
          className={`chain-picker-select-all ${allSelected ? "is-on" : ""}`}
          onClick={onSelectAllInChain}
        >
          {allSelected ? "בטל סימון של הכל" : "סמן הכל"}
        </button>
      </div>

      {chain.branches.length > 6 && (
        <div className="chain-picker-search">
          <input
            type="text"
            className="chain-picker-search-input"
            placeholder="חפש עיר או כתובת..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className="chain-picker-search-clear"
              onClick={() => setQuery("")}
              aria-label="נקה"
            >
              ×
            </button>
          )}
        </div>
      )}

      {byCity.length > 1 && (
        <div className="chain-picker-city-chips">
          <button
            type="button"
            className={`chain-picker-city-chip ${
              activeCity === null ? "is-active" : ""
            }`}
            onClick={() => setActiveCity(null)}
          >
            הכל
            <span className="chain-picker-city-count">
              {chain.branches.length}
            </span>
          </button>
          {byCity.map((g) => (
            <button
              key={g.city}
              type="button"
              className={`chain-picker-city-chip ${
                activeCity === g.city ? "is-active" : ""
              }`}
              onClick={() =>
                setActiveCity(activeCity === g.city ? null : g.city)
              }
            >
              {g.city}
              <span className="chain-picker-city-count">
                {g.branches.length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="chain-picker-branches-list">
        {filtered.length === 0 ? (
          <div className="chain-picker-empty">לא נמצאו סניפים</div>
        ) : (
          filtered.map(({ city, branches }) => (
            <section key={city} className="chain-picker-city-group">
              {byCity.length > 1 && (
                <header className="chain-picker-city-header">
                  <span className="chain-picker-city-name">{city}</span>
                  <span className="chain-picker-city-count chain-picker-city-count--header">
                    {branches.length}
                  </span>
                </header>
              )}
              <ul className="chain-picker-branches-ul">
                {branches.map((b) => {
                  const checked = selectedSet.has(String(b.supermarketID));
                  return (
                    <li key={b.supermarketID}>
                      <label
                        className={`chain-picker-branch ${
                          checked ? "is-checked" : ""
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="chain-picker-checkbox"
                          checked={checked}
                          onChange={() =>
                            onToggleSupermarket(b.supermarketID)
                          }
                        />
                        <span className="chain-picker-branch-text">
                          <span className="chain-picker-branch-addr">
                            {b.address || "כתובת לא זמינה"}
                          </span>
                          {b.city && (
                            <span className="chain-picker-branch-city">
                              {b.city}
                            </span>
                          )}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
