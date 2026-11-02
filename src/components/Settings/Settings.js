import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "./Settings.css";
import { useCart } from "../../context/CartContext2";
import { useProductsLayout } from "../../context/ProductsLayoutContext";
import { useCartCardLayout } from "../../context/CartCardLayoutContext";
import { usePriceCompareLayout } from "../../context/PriceCompareLayoutContext";
import { useAITheme } from "../../context/AIThemeContext";
import { useReceiptTheme } from "../../context/ReceiptThemeContext";
import { useSupermarketPreferences } from "../../context/SupermarketPreferencesContext";
import { useCompleteCartPreferences } from "../../context/CompleteCartPreferencesContext";
import { useAiSettings } from "../../context/AiSettingsContext";
import { useSupermarkets } from "../../hooks/optimizationHooks";
import { useProductList } from "../../hooks/appHooks";
import { useAvailabilityMeta } from "../../hooks/useProductAvailability";
import SupermarketImage from "../Images/SupermarketImage";
import CompleteCartPickerSheet from "./CompleteCartPickerSheet";
import { rebuildAvailabilityIndex } from "../../services/productAvailabilityService";
import { BUILD_VERSION } from "../../buildInfo";
import { IconClose } from "../Icons/UiIcons";
import { haptic, isHapticsEnabled, setHapticsEnabled } from "../../utils/haptics";
import { uiSound, isUiSoundEnabled, setUiSoundEnabled } from "../../utils/uiSound";

/* ═══════════════════════════════════════════════════════════════════
   Settings — a HUB of grouped rows (each shows its current value) that
   open focused sub-pages at /settings/:section. Phone-settings mental
   model: nothing is more than one tap away, the hub never scrolls past
   two screens, and the phone's back button works everywhere.
   ═══════════════════════════════════════════════════════════════════ */

/* A fixed "demo" cart — one button fills the active cart with these and switches
   to the chosen supermarket (for presentations). */
const DEMO_SUPERMARKET_ID = 146;
const DEMO_CART_PRODUCTS = [
  { barcode: "7290004122195", amount: 2 },
  { barcode: "7290107932080", amount: 2 },
  { barcode: "7290017065236", amount: 2 },
  { barcode: "7290011194246", amount: 2 },
  { barcode: "7290003643387", amount: 1 },
  { barcode: "7290000060903", amount: 2 },
  { barcode: "7290100700396", amount: 2 },
  { barcode: "7290107871990", amount: 2 },
  { barcode: "7290100703007", amount: 2 },
];

const PRODUCTS_LAYOUT_OPTIONS = [
  { value: "list", label: "רשימה", description: "מוצר אחד בכל שורה — תצוגה מורחבת" },
  { value: "grid", label: "רשת", description: "שני מוצרים בכל שורה — תצוגה קומפקטית" },
];

const AI_THEME_OPTIONS = [
  { value: "neurons", label: "נוירונים", description: "חלקיקים זוהרים מחוברים — קלאסי וטכנולוגי" },
  { value: "synapse", label: "רשת נוירונים", description: "הקלאסי בגרסה מלוטשת — חלקיקים חדים, חיבורים חיים ואותות" },
  { value: "hacker", label: "סייבר האקר", description: "מעגל מודפס חי — אותות דוהרים במסלולים, גליץ' וסריקה" },
  { value: "neon", label: "ניאון סיטי", description: "סייברפאנק עמוק — שמש ניאון, הרים וגריד אינסופי" },
  { value: "aurora", label: "זוהר צפוני", description: "ענני צבע נעים בתנועה איטית — חולמני" },
  { value: "galaxy", label: "גלקסיה", description: "כוכבים מנצנצים, ערפילית וכוכבי שביט" },
  { value: "cyber", label: "סייבר", description: "סינתווייב — שמש ניאון וגריד פרספקטיבה" },
];

/* Voice-reply language + voices — shared with the AI page through AiSettingsContext. */
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
  { value: "expanded", label: "כל הסניפים", description: "כל סניף מוצג כשורה נפרדת — תמיד" },
  { value: "grouped", label: "מקובצים לפי רשת", description: "סניפים זהים באותה רשת מתאחדים לשורה אחת" },
];

const RECEIPT_THEME_OPTIONS = [
  { value: "color", label: "צבעוני", description: "תצוגה מקורית עם איקונים ותמונות בצבע מלא" },
  { value: "grayscale", label: "גווני אפור", description: "הקבלה כולה בגוונים של שחור-לבן" },
];

const CART_CARD_LAYOUT_OPTIONS = [
  { value: "default", label: "מורחבת", description: "כפתורי +/- ועדכון בשורה נפרדת מתחת" },
  { value: "compact", label: "קומפקטית", description: "ללא שורת כפתורים — שינוי כמות בהחלקה" },
];

/* mic sensitivity (VAD threshold, raw RMS units) — lower = more sensitive */
const MIC_MIN = 5;
const MIC_MAX = 40;

const labelOf = (opts, v) => (opts.find((o) => o.value === v) || opts[0]).label;

/* ── section icons (stroke, 24 grid) ─────────────────────────────── */
const ico = {
  viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2,
  strokeLinecap: "round", strokeLinejoin: "round", width: "1em", height: "1em", "aria-hidden": true,
};
const IconPalette = () => (
  <svg {...ico}><path d="M12 3a9 9 0 0 0 0 18h1.5a2 2 0 0 0 1.5-3.3 2 2 0 0 1 1.5-3.2H18a3 3 0 0 0 3-3A8.7 8.7 0 0 0 12 3z" /><circle cx="7.5" cy="11.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="10.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /><circle cx="15.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" /></svg>
);
const IconVoice = () => (
  <svg {...ico}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0" /><line x1="12" y1="18" x2="12" y2="21" /></svg>
);
const IconFeel = () => (
  <svg {...ico}><rect x="8" y="3" width="8" height="18" rx="2" /><path d="M4 9v6M20 9v6M1.5 11v2M22.5 11v2" /></svg>
);
const IconStore = () => (
  <svg {...ico}><path d="M3 9l1.5-5h15L21 9" /><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0V9z" /><path d="M5 13v8h14v-8" /><rect x="10" y="15" width="4" height="6" /></svg>
);
const IconCartCheck = () => (
  <svg {...ico}><circle cx="9" cy="20" r="1.3" /><circle cx="17" cy="20" r="1.3" /><path d="M2 3h3l2.4 11h11.2L21 7H6.2" /><polyline points="9.5 10.5 11.5 12.5 15.5 8.5" /></svg>
);
const IconDatabase = () => (
  <svg {...ico}><ellipse cx="12" cy="5.5" rx="8" ry="3" /><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13" /><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></svg>
);
const IconFlask = () => (
  <svg {...ico}><path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-2.5L14 9V3" /><path d="M7.5 15h9" /></svg>
);
const IconResearch = () => (
  <svg {...ico}><rect x="4" y="4" width="16" height="17" rx="2.5" /><path d="M9 2.5v3M15 2.5v3" /><polyline points="8.5 13 11 15.5 15.5 10.5" /></svg>
);
const IconChevron = () => (
  <svg {...ico}><polyline points="15 18 9 12 15 6" /></svg>
);
const IconBack = () => (
  <svg {...ico} strokeWidth={2.2}><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
);
const IconSearch = () => (
  <svg {...ico}><circle cx="11" cy="11" r="7" /><line x1="20" y1="20" x2="16.2" y2="16.2" /></svg>
);

/* ── previews (unchanged visuals) ────────────────────────────────── */
function ProductsLayoutPreview({ value }) {
  if (value === "list") {
    return (
      <div className="layout-preview layout-preview--list"><span /><span /><span /></div>
    );
  }
  return (
    <div className="layout-preview layout-preview--grid"><span /><span /><span /><span /></div>
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
      {value === "synapse" && (
        <>
          <span className="ai-theme-preview__syn-link ai-theme-preview__syn-link-1" />
          <span className="ai-theme-preview__syn-link ai-theme-preview__syn-link-2" />
          <span className="ai-theme-preview__syn-node ai-theme-preview__syn-node-1" />
          <span className="ai-theme-preview__syn-node ai-theme-preview__syn-node-2" />
          <span className="ai-theme-preview__syn-node ai-theme-preview__syn-node-3" />
          <span className="ai-theme-preview__syn-pulse" />
        </>
      )}
      {value === "neon" && (
        <>
          <span className="ai-theme-preview__neon-horizon" />
          <span className="ai-theme-preview__neon-grid" />
          <span className="ai-theme-preview__neon-spark ai-theme-preview__neon-spark-1" />
          <span className="ai-theme-preview__neon-spark ai-theme-preview__neon-spark-2" />
        </>
      )}
      {value === "hacker" && (
        <>
          <span className="ai-theme-preview__pcb ai-theme-preview__pcb-1" />
          <span className="ai-theme-preview__pcb ai-theme-preview__pcb-2" />
          <span className="ai-theme-preview__pcb-pad ai-theme-preview__pcb-pad-1" />
          <span className="ai-theme-preview__pcb-pad ai-theme-preview__pcb-pad-2" />
          <span className="ai-theme-preview__pcb-sig" />
        </>
      )}
    </div>
  );
}

function PriceComparePreview({ value }) {
  if (value === "expanded") {
    return (
      <div className="price-compare-preview">
        {[0, 1, 2].map((i) => (
          <div className="price-compare-preview__row" key={i}>
            <span className="price-compare-preview__logo" />
            <span className="price-compare-preview__line" />
            <span className="price-compare-preview__price" />
          </div>
        ))}
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
      {[0, 1, 2].map((i) => (
        <span className="receipt-theme-preview__row" key={i}>
          <span className="receipt-theme-preview__tag" />
          <span className="receipt-theme-preview__line" />
        </span>
      ))}
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
  return new Date(iso).toLocaleDateString("he-IL");
}

/* ── shared building blocks ──────────────────────────────────────── */
function Card({ title, hint, children, className = "" }) {
  return (
    <section className={`settings-card ${className}`}>
      {title && (
        <header className="settings-card__header">
          <span className="settings-card__title">{title}</span>
        </header>
      )}
      <div className="settings-card__body">
        {hint && <p className="settings-card__hint">{hint}</p>}
        {children}
      </div>
    </section>
  );
}

function OptionGrid({ options, value, onChange, Preview, quad }) {
  return (
    <div className={`layout-options${quad ? " layout-options--quad" : ""}`}>
      {options.map((opt) => {
        const active = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`layout-option ${active ? "is-active" : ""}`}
            onClick={() => {
              haptic("selection");
              uiSound("select");
              onChange(opt.value);
            }}
            aria-pressed={active}
          >
            <Preview value={opt.value} />
            <span className="layout-option__label">{opt.label}</span>
            <span className="layout-option__desc">{opt.description}</span>
          </button>
        );
      })}
    </div>
  );
}

function ToggleRow({ title, hint, on, onToggle, last }) {
  return (
    <div className={`settings-toggle-row${last ? " settings-toggle-row--last" : ""}`}>
      <span className="settings-toggle-row__text">
        <span className="settings-toggle-row__title">{title}</span>
        {hint && <span className="settings-toggle-row__hint">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={title}
        className={`settings-switch${on ? " on" : ""}`}
        onClick={onToggle}
      >
        <span className="settings-switch__knob" />
      </button>
    </div>
  );
}

const ChevronLink = () => (
  <svg className="settings-link-btn__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

/* ═══════════════════════════════════════════════════════════════════
   The sections. Each exports { key, title, subtitle, Icon, tone, group,
   keywords } and a body; the hub derives the live summary line from the
   same state the body edits.
   ═══════════════════════════════════════════════════════════════════ */

const SECTIONS = [
  { key: "appearance", group: "האפליקציה", title: "מראה ותצוגה", subtitle: "איך נראים המוצרים, העגלה, ההשוואות והקבלות", Icon: IconPalette, tone: "violet", keywords: "תצוגה רשימה רשת כרטיסייה עגלה השוואה קבלה ערכת נושא רקע צבע AI" },
  { key: "feel", group: "האפליקציה", title: "צלילים ורטט", subtitle: "המשוב של הממשק בלחיצות ובפקודות", Icon: IconFeel, tone: "amber", keywords: "צלילים רטט משוב ויברציה האפטיקה" },
  { key: "voice", group: "הרובוט", title: "קול ומיקרופון", subtitle: "באיזו שפה וקול הרובוט עונה, וכמה המיקרופון רגיש", Icon: IconVoice, tone: "teal", keywords: "קול שפה עברית אנגלית מיקרופון רגישות רובוט דיבור tts" },
  { key: "stores", group: "הקניות שלי", title: "סניפים מועדפים", subtitle: "הסופרים שאתה אוהב לקנות בהם", Icon: IconStore, tone: "blue", keywords: "סניפים סופר סופרמרקט מועדפים רשת זמינות" },
  { key: "complete", group: "הקניות שלי", title: "עגלה שלמה", subtitle: "מוצרים שתמיד צריכים להיות בעגלה", Icon: IconCartCheck, tone: "green", keywords: "עגלה שלמה השלמה מוצרים קבועים רשימה" },
  { key: "data", group: "נתונים", title: "נתונים ותחזוקה", subtitle: "אינדקס הזמינות ורענון מחירים", Icon: IconDatabase, tone: "sky", keywords: "נתונים זמינות אינדקס מחירים רענון עדכון" },
  { key: "demo", group: "נתונים", title: "הדגמה וכלים", subtitle: "עגלת הדגמה וגלריית אנימציות", Icon: IconFlask, tone: "pink", keywords: "הדגמה דמו מצגת אנימציות טעינה כלים" },
];

const GROUPS = ["האפליקציה", "הרובוט", "הקניות שלי", "נתונים"];

/* ─────────────────────────────────────────────────────────────────── */
export default function Settings() {
  const { section } = useParams();
  const navigate = useNavigate();

  const { layout: productsLayout, setLayout: setProductsLayout } = useProductsLayout();
  const { layout: cartCardLayout, setLayout: setCartCardLayout } = useCartCardLayout();
  const { layout: priceCompareLayout, setLayout: setPriceCompareLayout } = usePriceCompareLayout();
  const { theme: aiTheme, setTheme: setAITheme } = useAITheme();
  const { theme: receiptTheme, setTheme: setReceiptTheme } = useReceiptTheme();
  const aiSettings = useAiSettings();
  const ttsLanguage = (aiSettings && aiSettings.settings.ttsLanguage) || "he";
  const ttsVoice = (aiSettings && aiSettings.settings.ttsVoice) || "";
  const micThreshold = (aiSettings && aiSettings.settings.micThreshold) || 15;
  const updateAiSetting = aiSettings && aiSettings.updateSetting;
  const {
    preferredSupermarketIDs,
    toggleSupermarket,
    clearPreferences,
    availableInAllMode,
    setAvailableInAllMode,
  } = useSupermarketPreferences();
  const { allSupermarkets } = useSupermarkets();
  const [isBranchPickerOpen, setIsBranchPickerOpen] = useState(false);
  const [uiSoundsOn, setUiSoundsOn] = useState(() => isUiSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState(() => isHapticsEnabled());
  const { completeCartNames, toggleName, setCompleteCartNames } = useCompleteCartPreferences();
  const { products } = useProductList();
  const [isCompleteCartPickerOpen, setIsCompleteCartPickerOpen] = useState(false);
  const allGeneralNames = useMemo(
    () => [...new Set((products || []).map((p) => p.generalName).filter(Boolean))],
    [products]
  );
  const { cart, setCart, sendActiveCart } = useCart();
  const { meta, isLoading: isMetaLoading, refetch: refetchMeta } = useAvailabilityMeta();
  const [isRebuilding, setIsRebuilding] = useState(false);
  const [rebuildStatus, setRebuildStatus] = useState(null);
  const [query, setQuery] = useState("");

  /* an unknown section → back to the hub */
  useEffect(() => {
    if (section && !SECTIONS.some((s) => s.key === section)) {
      navigate("/settings", { replace: true });
    }
  }, [section, navigate]);

  /* every sub-page opens scrolled to the top */
  useEffect(() => {
    const scroller = document.querySelector(".app-scroll");
    if (scroller) scroller.scrollTo({ top: 0 });
  }, [section]);

  const fillDemoCart = () => {
    haptic("success");
    setCart({
      ...(cart || {}),
      supermarketID: DEMO_SUPERMARKET_ID,
      products: DEMO_CART_PRODUCTS.map((p) => ({ ...p })),
    });
    sendActiveCart();
    navigate("/cart");
  };

  const cartGeneralNames = useMemo(() => {
    const byBarcode = {};
    (products || []).forEach((p) => {
      if (p && p.barcode) byBarcode[p.barcode] = p.generalName;
    });
    return [
      ...new Set(((cart && cart.products) || []).map((cp) => byBarcode[cp.barcode]).filter(Boolean)),
    ];
  }, [products, cart]);

  const fillCompleteFromCart = () => {
    if (!cartGeneralNames.length) return;
    haptic("success");
    setCompleteCartNames([...new Set([...completeCartNames, ...cartGeneralNames])]);
  };

  const supermarketLookup = useMemo(() => {
    const map = new Map();
    (allSupermarkets || []).forEach((s) => map.set(String(s.supermarketID), s));
    return map;
  }, [allSupermarkets]);

  const handleRebuild = async () => {
    if (isRebuilding) return;
    setIsRebuilding(true);
    setRebuildStatus(null);
    try {
      const result = await rebuildAvailabilityIndex();
      await refetchMeta();
      haptic("success");
      setRebuildStatus({ kind: "success", message: `עודכנו ${result.productCount || 0} מוצרים` });
    } catch (err) {
      haptic("error");
      setRebuildStatus({ kind: "error", message: "העדכון נכשל. נסה שוב." });
    } finally {
      setIsRebuilding(false);
    }
  };

  /* ── the live one-line summary per section (what the hub shows) ── */
  const summaries = {
    appearance: [
      `מוצרים: ${labelOf(PRODUCTS_LAYOUT_OPTIONS, productsLayout)}`,
      `עגלה: ${labelOf(CART_CARD_LAYOUT_OPTIONS, cartCardLayout)}`,
      `AI: ${labelOf(AI_THEME_OPTIONS, aiTheme)}`,
    ].join(" · "),
    feel: `${uiSoundsOn ? "צלילים פועלים" : "צלילים כבויים"} · ${hapticsOn ? "רטט פועל" : "רטט כבוי"}`,
    voice: `${labelOf(TTS_LANGUAGE_OPTIONS, ttsLanguage)} · ${labelOf(
      TTS_VOICES[ttsLanguage] || TTS_VOICES.he,
      ttsVoice
    ).replace(/\s*\(.*\)$/, "")} · רגישות ${micThreshold}`,
    stores:
      preferredSupermarketIDs.length === 0
        ? "לא נבחרו סניפים"
        : `${preferredSupermarketIDs.length} סניפים${availableInAllMode ? " · רק מוצרים משותפים" : ""}`,
    complete:
      completeCartNames.length === 0 ? "עוד לא הוגדרו מוצרים" : `${completeCartNames.length} מוצרים ברשימה`,
    data: isMetaLoading ? "טוען…" : `זמינות: ${formatRelativeTime(meta && meta.updatedAt)}`,
    demo: "עגלת הדגמה · אנימציות טעינה",
  };

  /* ═══════════ HUB ═══════════ */
  if (!section) {
    const q = query.trim();
    const visible = SECTIONS.filter((s) =>
      !q ? true : `${s.title} ${s.subtitle} ${s.keywords} ${summaries[s.key]}`.includes(q)
    );
    return (
      <div className="settings-page settings-page--hub">
        <div className="settings-page__header">
          <h1 className="settings-page__title">הגדרות</h1>
          <p className="settings-page__subtitle">כל הגדרה במקום אחד. מתחת לכל שורה — מה מוגדר כרגע.</p>
        </div>

        <label className="sh-search">
          <IconSearch />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חיפוש הגדרה (למשל: קול, רטט, סניפים)"
            aria-label="חיפוש הגדרה"
          />
        </label>

        <div className="settings-page__content">
          {GROUPS.map((group) => {
            const rows = visible.filter((s) => s.group === group);
            if (!rows.length) return null;
            return (
              <section className="sh-group" key={group}>
                <h2 className="sh-group__title">{group}</h2>
                <div className="sh-list">
                  {rows.map(({ key, title, subtitle, Icon, tone }, i) => (
                    <button
                      key={key}
                      type="button"
                      className={`sh-row sh-row--${tone}`}
                      style={{ "--i": i }}
                      onClick={() => {
                        haptic("selection");
                        uiSound("select");
                        navigate(`/settings/${key}`);
                      }}
                    >
                      <span className="sh-row__icon" aria-hidden="true"><Icon /></span>
                      <span className="sh-row__text">
                        <span className="sh-row__title">{title}</span>
                        <span className="sh-row__value">{summaries[key] || subtitle}</span>
                      </span>
                      <span className="sh-row__chev" aria-hidden="true"><IconChevron /></span>
                    </button>
                  ))}
                  {group === "הרובוט" && (!q || "מחקר AI היסטוריה שיחות סימון הערות".includes(q)) && (
                    <Link
                      to="/ai-history"
                      className="sh-row sh-row--indigo"
                      style={{ "--i": rows.length }}
                      onClick={() => {
                        haptic("selection");
                        uiSound("select");
                      }}
                    >
                      <span className="sh-row__icon" aria-hidden="true"><IconResearch /></span>
                      <span className="sh-row__text">
                        <span className="sh-row__title">מחקר AI</span>
                        <span className="sh-row__value">כל השיחות עם הרובוט — סימון ✓/✗ והערות</span>
                      </span>
                      <span className="sh-row__chev" aria-hidden="true"><IconChevron /></span>
                    </Link>
                  )}
                </div>
              </section>
            );
          })}
          {visible.length === 0 && (
            <div className="sh-empty">לא נמצאה הגדרה שמתאימה ל"{q}"</div>
          )}
          <div className="sh-version">Smart Cart · גרסה {BUILD_VERSION}</div>
        </div>
      </div>
    );
  }

  /* ═══════════ SUB-PAGE ═══════════ */
  const meta_ = SECTIONS.find((s) => s.key === section);
  if (!meta_) return null;

  return (
    <div className="settings-page settings-page--section" key={section}>
      <div className="sh-head">
        <button
          type="button"
          className="sh-back"
          onClick={() => {
            haptic("light");
            navigate("/settings");
          }}
          aria-label="חזרה להגדרות"
        >
          <IconBack />
        </button>
        <div className="sh-head__text">
          <span className="sh-head__crumb">הגדרות</span>
          <h1 className="sh-head__title">{meta_.title}</h1>
          <p className="sh-head__sub">{meta_.subtitle}</p>
        </div>
        <span className={`sh-head__icon sh-row--${meta_.tone}`} aria-hidden="true"><meta_.Icon /></span>
      </div>

      <div className="settings-page__content">
        {/* ── מראה ותצוגה ── */}
        {section === "appearance" && (
          <>
            <Card title="רשימת המוצרים" hint="כמה מוצרים בכל שורה בעמוד המוצרים">
              <OptionGrid options={PRODUCTS_LAYOUT_OPTIONS} value={productsLayout} onChange={setProductsLayout} Preview={ProductsLayoutPreview} />
            </Card>
            <Card title="כרטיסיית מוצר בעגלה" hint="צורת הכרטיסייה של מוצרי העגלה">
              <OptionGrid options={CART_CARD_LAYOUT_OPTIONS} value={cartCardLayout} onChange={setCartCardLayout} Preview={CartCardPreview} />
            </Card>
            <Card title="השוואת מחירים" hint="איך מוצגים סניפים של אותה רשת באותו מוצר">
              <OptionGrid options={PRICE_COMPARE_LAYOUT_OPTIONS} value={priceCompareLayout} onChange={setPriceCompareLayout} Preview={PriceComparePreview} />
            </Card>
            <Card title="קבלה בהיסטוריה" hint="איך תוצג קבלה בהיסטוריית הקניות">
              <OptionGrid options={RECEIPT_THEME_OPTIONS} value={receiptTheme} onChange={setReceiptTheme} Preview={ReceiptThemePreview} />
            </Card>
            <Card title="ערכת נושא לעמוד ה-AI" hint="רקע ופלטת צבעים לצ'אט, לכפתורים ולכל המראה">
              <OptionGrid options={AI_THEME_OPTIONS} value={aiTheme} onChange={setAITheme} Preview={AIThemePreview} quad />
            </Card>
          </>
        )}

        {/* ── צלילים ורטט ── */}
        {section === "feel" && (
          <Card hint="צלילים קצרים ורטט עדין מלווים את התפריטים ואת הרובוט (פתיחה, בחירה, תחילת הקלטה). הרטט עובד במכשירי אנדרואיד.">
            <ToggleRow
              title="צלילי ממשק"
              hint="צליל עדין בפתיחת תפריטים ובבחירת פעולות"
              on={uiSoundsOn}
              onToggle={() => {
                const next = !uiSoundsOn;
                setUiSoundEnabled(next);
                setUiSoundsOn(next);
                if (next) uiSound("open");
              }}
            />
            <ToggleRow
              title="רטט"
              hint="משוב מישוש קצר בלחיצות ובפקודות קוליות"
              on={hapticsOn}
              onToggle={() => {
                const next = !hapticsOn;
                setHapticsEnabled(next);
                setHapticsOn(next);
                if (next) haptic("success");
              }}
              last
            />
          </Card>
        )}

        {/* ── קול ומיקרופון ── */}
        {section === "voice" && (
          <>
            <Card title="התשובה הקולית" hint="הרובוט בסרגל התחתון (ועמוד ה-AI) עונים בשפה ובקול שתבחר. הפקודות שלך תמיד בעברית.">
              <div className="voice-reply-row">
                <span className="voice-reply-row__label">שפת תשובה</span>
                <div className="voice-reply-langs">
                  {TTS_LANGUAGE_OPTIONS.map((opt) => {
                    const active = ttsLanguage === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        className={`voice-reply-lang-btn ${active ? "is-active" : ""}`}
                        aria-pressed={active}
                        onClick={() => {
                          if (!updateAiSetting) return;
                          haptic("selection");
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
                  onChange={(e) => updateAiSetting && updateAiSetting("ttsVoice", e.target.value)}
                >
                  {(TTS_VOICES[ttsLanguage] || TTS_VOICES.he).map((v) => (
                    <option key={v.value || "default"} value={v.value}>{v.label}</option>
                  ))}
                </select>
              </div>
            </Card>

            <Card title="רגישות המיקרופון" hint="מאיזו עוצמת קול הרובוט מתחיל להקליט בשיחה רציפה. נמוך = קולט גם דיבור שקט (אבל גם רעשי רקע); גבוה = צריך לדבר ברור.">
              <div className="sh-slider">
                <span className="sh-slider__end">רגיש</span>
                <input
                  type="range"
                  min={MIC_MIN}
                  max={MIC_MAX}
                  step={1}
                  value={micThreshold}
                  onChange={(e) => updateAiSetting && updateAiSetting("micThreshold", Number(e.target.value))}
                  aria-label="רגישות המיקרופון"
                />
                <span className="sh-slider__end">ברור</span>
              </div>
              <div className="sh-slider__value">
                סף נוכחי: <b>{micThreshold}</b>
                <button
                  type="button"
                  className="sh-reset"
                  disabled={micThreshold === 15}
                  onClick={() => updateAiSetting && updateAiSetting("micThreshold", 15)}
                >
                  איפוס (15)
                </button>
              </div>
            </Card>

            <Card title="שיפור הרובוט">
              <Link to="/ai-history" className="settings-link-btn" onClick={() => haptic("selection")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="4" y="4" width="16" height="17" rx="2.5" /><path d="M9 2.5v3M15 2.5v3" /><polyline points="8.5 13 11 15.5 15.5 10.5" />
                </svg>
                מחקר AI — סקירת כל השיחות
                <ChevronLink />
              </Link>
            </Card>
          </>
        )}

        {/* ── סניפים מועדפים ── */}
        {section === "stores" && (
          <Card hint='הסניפים שאתה מעדיף לקנות בהם. הכפתור "לפי העדפות" באופטימיזציית העגלות יסמן בדיוק אותם.'>
            <ToggleRow
              title="הצג רק מוצרים הקיימים בכל הסניפים"
              hint="בעמוד המוצרים יוצגו רק מוצרים שנמכרים בכל הסניפים המועדפים"
              on={availableInAllMode}
              onToggle={() => {
                haptic("selection");
                setAvailableInAllMode((v) => !v);
              }}
            />
            <div className="settings-row">
              <span className="settings-row__label">סניפים מועדפים</span>
              <span className="settings-row__value">
                {preferredSupermarketIDs.length === 0 ? "לא נבחרו" : preferredSupermarketIDs.length}
              </span>
            </div>
            {preferredSupermarketIDs.length > 0 && (
              <div className="settings-preferred-chips">
                {preferredSupermarketIDs.slice(0, 24).map((id) => {
                  const s = supermarketLookup.get(String(id));
                  const label = s ? `${s.name}${s.address ? ` · ${s.address}` : ""}` : `סניף #${id}`;
                  return (
                    <span key={id} className="settings-preferred-chip">
                      <span className="settings-preferred-chip__text">{label}</span>
                      <button type="button" className="settings-preferred-chip__x" onClick={() => toggleSupermarket(id)} aria-label="הסר">
                        <IconClose />
                      </button>
                    </span>
                  );
                })}
                {preferredSupermarketIDs.length > 24 && (
                  <span className="settings-preferred-chip-more">+ עוד {preferredSupermarketIDs.length - 24}</span>
                )}
              </div>
            )}
            <button
              type="button"
              className="settings-link-btn settings-link-btn--primary"
              onClick={() => {
                haptic("selection");
                setIsBranchPickerOpen(true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2l2.9 6.55 7.1.85-5.3 4.85 1.5 7.1L12 17.77 5.8 21.35l1.5-7.1L2 9.4l7.1-.85L12 2z" />
              </svg>
              {preferredSupermarketIDs.length === 0 ? "בחר סניפים" : "ערוך סניפים"}
              <ChevronLink />
            </button>
          </Card>
        )}

        {/* ── עגלה שלמה ── */}
        {section === "complete" && (
          <Card hint='מוצרים שתמיד צריכים להיות בעגלה. הפעולה "השלם את העגלה" (בכפתור ה-AI, או בקול) תוסיף כל מוצר כזה שחסר — לפי המחיר הזול ליחידת משקל, או לפי מה שקנית לאחרונה.'>
            <div className="settings-row">
              <span className="settings-row__label">מוצרים בעגלה השלמה</span>
              <span className="settings-row__value">
                {completeCartNames.length === 0 ? "לא נבחרו" : completeCartNames.length}
              </span>
            </div>
            {completeCartNames.length > 0 && (
              <div className="settings-preferred-chips">
                {completeCartNames.slice(0, 30).map((name) => (
                  <span key={name} className="settings-preferred-chip">
                    <span className="settings-preferred-chip__text">{name}</span>
                    <button type="button" className="settings-preferred-chip__x" onClick={() => toggleName(name)} aria-label="הסר">
                      <IconClose />
                    </button>
                  </span>
                ))}
                {completeCartNames.length > 30 && (
                  <span className="settings-preferred-chip-more">+ עוד {completeCartNames.length - 30}</span>
                )}
              </div>
            )}
            <button
              type="button"
              className="settings-link-btn settings-link-btn--primary"
              onClick={() => {
                haptic("selection");
                setIsCompleteCartPickerOpen(true);
              }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 9h4v2h-4v4h-2v-4H7v-2h4V7h2v4z" />
              </svg>
              {completeCartNames.length === 0 ? "בחר מוצרים" : "ערוך מוצרים"}
              <ChevronLink />
            </button>
            <button
              type="button"
              className="settings-link-btn"
              onClick={fillCompleteFromCart}
              disabled={!cartGeneralNames.length}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
              </svg>
              {cartGeneralNames.length ? `הוסף מהעגלה הנוכחית (${cartGeneralNames.length})` : "העגלה הנוכחית ריקה"}
            </button>
          </Card>
        )}

        {/* ── נתונים ותחזוקה ── */}
        {section === "data" && (
          <>
            <Card title="אינדקס זמינות המוצרים" hint="משמש להצגה רק של סופרים שמכילים את כל מוצרי העגלה.">
              <div className="settings-row">
                <span className="settings-row__label">עודכן לאחרונה</span>
                <span className="settings-row__value">{isMetaLoading ? "טוען…" : formatRelativeTime(meta && meta.updatedAt)}</span>
              </div>
              <div className="settings-row">
                <span className="settings-row__label">מוצרים באינדקס</span>
                <span className="settings-row__value">{isMetaLoading ? "—" : (meta && meta.productCount) || 0}</span>
              </div>
              <button
                type="button"
                className={`settings-rebuild-btn ${isRebuilding ? "is-loading" : ""}`}
                onClick={handleRebuild}
                disabled={isRebuilding}
              >
                {isRebuilding ? (
                  <span className="settings-rebuild-spinner" aria-hidden />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                )}
                {isRebuilding ? "מעדכן…" : "עדכן עכשיו"}
              </button>
              {rebuildStatus && (
                <div className={`settings-rebuild-status settings-rebuild-status--${rebuildStatus.kind}`} role="status">
                  {rebuildStatus.message}
                </div>
              )}
            </Card>
            <Card title="רענון כל המחירים" hint="טעינה מחדש של מחירי כל המוצרים מ-chp.co.il והחלפת כל המחירים במסד הנתונים. תהליך ארוך עם פידבק חי.">
              <Link to="/refresh-all-prices" className="settings-link-btn" onClick={() => haptic("selection")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                רענן את כל המחירים
                <ChevronLink />
              </Link>
            </Card>
          </>
        )}

        {/* ── הדגמה וכלים ── */}
        {section === "demo" && (
          <>
            <Card title="עגלת הדגמה" hint="למצגות: מרוקן את העגלה הנוכחית, ממלא אותה בעגלת הדגמה קבועה, מחליף לסופרמרקט המוגדר ופותח את העגלה.">
              <button type="button" className="settings-link-btn settings-link-btn--primary" onClick={fillDemoCart}>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M7 18a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 18zm10 0a2 2 0 1 0 .001 4.001A2 2 0 0 0 17 18zM7.16 14l.94-2h7.45a2 2 0 0 0 1.8-1.11l3.02-6.1A1 1 0 0 0 20.48 3H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44A2 2 0 0 0 7 16h12v-2H7.16z" />
                </svg>
                מלא עגלת הדגמה
              </button>
            </Card>
            <Card title="אנימציות טעינה" hint="גלריית אנימציות בסגנון דואלינגו — לתצוגה בלבד.">
              <Link to="/loading-animations" className="settings-link-btn" onClick={() => haptic("selection")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08l4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08l4.24-4.24" />
                </svg>
                פתח את הגלריה
                <ChevronLink />
              </Link>
            </Card>
            <Card title="אודות">
              <div className="settings-row">
                <span className="settings-row__label">גרסה</span>
                <span className="settings-row__value">{BUILD_VERSION}</span>
              </div>
            </Card>
          </>
        )}
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

      <CompleteCartPickerSheet
        open={isCompleteCartPickerOpen}
        allNames={allGeneralNames}
        selected={completeCartNames}
        onToggle={toggleName}
        onClose={() => setIsCompleteCartPickerOpen(false)}
      />
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
            <IconClose />
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
            <IconClose />
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
              <IconClose />
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
