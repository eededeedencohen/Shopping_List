import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import "./BottomNav.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import useVoiceCommand from "../../hooks/useVoiceCommand";
import VoiceWaves from "./VoiceWaves";
import useDockShape from "./useDockShape";
import CartOptimizeOverlay from "../CartOptimizeOverlay/CartOptimizeOverlay";
import SupermarketPickerSheet from "./SupermarketPickerSheet";
import {
  useProductList,
  usePriceMap,
  useCartActions,
  useFullCart,
  useUpdateActiveCart,
} from "../../hooks/appHooks";
import OperationModal from "../AI/MessageItem/MessageItemOperations/CartOperationsView/OperationModal";
import ProductAnimationAdd from "../AI/MessageItem/MessageItemOperations/CartOperationsView/ProductAnimationAdd";
import { runCompareOptimization } from "../../utils/optimizeCart";
import { useAiSettings } from "../../context/AiSettingsContext";
import { useCart } from "../../context/CartContext2";
import { useCompleteCartPreferences } from "../../context/CompleteCartPreferencesContext";
import { useSupermarkets } from "../../hooks/optimizationHooks";
import { useClassificationsCtx } from "../../context/classificationsContext";
import { setShelfTarget } from "../../utils/shelfTarget";
import {
  getCheapestSupermarketIDsByCart,
  getRankedSupermarketsByCart,
} from "../../services/priceService";
import SupermarketImage from "../Images/SupermarketImage";

import { ReactComponent as RobotIcon } from "../Toolbar/robot.svg";
import { ReactComponent as HomeIcon } from "../Toolbar/home.svg";
import { ReactComponent as GroceryIcon } from "../Toolbar/grocery2.svg";
import { ReactComponent as CartIcon } from "../Cart/Icons/shopping-cart.svg";
import { ReactComponent as HistoryIcon } from "../Toolbar/transaction-history.svg";
import { ReactComponent as ReceiptIcon } from "../Toolbar/wishlist.svg";
import { ReactComponent as PieChartIcon } from "../Toolbar/pie-chart.svg";
import { ReactComponent as BarcodeIcon } from "../Toolbar/barcode.svg";
import { IconClose, IconChevronLeft, IconChevronRight } from "../Icons/UiIcons";
import { IconResearch } from "../Toolbar/ToolbarIcons";
import {
  IconCompass,
  IconGrid,
  IconTag,
  IconSparkles,
  IconScale,
  IconCartCheck,
  IconCartSwitch,
  IconShelfPin,
  IconMic,
  IconEar,
  IconSpeaker,
  IconSpinner,
  IconAlert,
  IconHold,
  IconDoubleTap,
} from "./ActionIcons";
import { haptic } from "../../utils/haptics";
import { uiSound, primeUiSound } from "../../utils/uiSound";
import { isHushPhrase } from "../../utils/hushPhrase";

/* The actions shown in the AI action sheet (order = visual order).
   `hero` = the signature action, rendered as the full-width gradient card;
   `wide` = spans both grid columns (compact horizontal layout).
   - "ניווט"                    → expands to the navigation sub-categories (pages).
   - "קטגוריות מוצרים"          → expands to the products page sub-categories.
   - "הסופר הזול ביותר לעגלה"   → computes & shows the cheapest supermarket. */
const ACTIONS = [
  {
    key: "a4",
    label: "ייעל את העגלה",
    caption: "החלפות משתלמות לאותה עגלה, בסופר הנוכחי",
    Icon: IconSparkles,
    tone: "hero",
    hero: true,
  },
  {
    key: "cheapest",
    label: "הסופר הזול לעגלה",
    caption: "איפה העגלה שלך הכי זולה",
    Icon: IconTag,
    tone: "green",
    view: "cheapest",
  },
  {
    key: "a5",
    label: "השוואת סופרים",
    caption: "מוצר מול מוצר בין קבוצת סופרים",
    Icon: IconScale,
    tone: "violet",
    view: "compare",
  },
  {
    key: "a6",
    label: "השלם את העגלה",
    caption: "ממלא את מה שחסר מהרשימה הקבועה",
    Icon: IconCartCheck,
    tone: "amber",
    view: "complete",
  },
  {
    key: "a7",
    label: "השלם ועבור לזול",
    caption: "השלמה ואז מעבר לסופר הזול ביותר",
    Icon: IconCartSwitch,
    tone: "rose",
    view: "complete7",
  },
  {
    key: "nav",
    label: "ניווט",
    caption: "קפיצה מהירה לכל מסך",
    Icon: IconCompass,
    tone: "blue",
    view: "nav",
  },
  {
    key: "products",
    label: "קטגוריות מוצרים",
    caption: "ישר לתת-קטגוריה במדף",
    Icon: IconGrid,
    tone: "teal",
    view: "products",
  },
  {
    key: "a8",
    label: "מצא מוצר במדף",
    caption: "גלילה אוטומטית עד המוצר",
    Icon: IconShelfPin,
    tone: "sky",
    view: "find",
    wide: true,
  },
];

/* hint-chip icon per voice mode */
const HINT_ICONS = {
  starting: IconMic,
  recording: IconMic,
  listening: IconEar,
  speaking: IconSpeaker,
  processing: IconSpinner,
  error: IconAlert,
};

/* Action #8 — extra shelf targets beyond the classification families:
   generalNames that sit DEEP in their subcategory's scroll (cottage, ski
   cheese, shredded yellow…). Strings must match the DB generalName exactly;
   names that don't resolve to products are silently hidden from the panel. */
const SHELF_EXTRA_GENERALS = [
  "קוטג'",
  "סקי",
  "שמנת חמוצה",
  "גבינת שמנת",
  "גבינה צהובה מגורדת",
  "גבינת מוצרלה",
  "גבינת קשקבל",
  "גבינת גאודה",
];

/* Curated Talpiot-area supermarket IDs (industrial/commercial zone + very close).
   The data has no neighborhood field, so this is a hand-picked allowlist from the
   store addresses: האומן / יד חרוצים / פייר קניג / עולי הגרדום / הרכבים / היצירה /
   המרפא / דרך חברון (קטע תלפיות) / כתובות עם "תלפיות". Refine freely. */
const TALPIOT_SUPERMARKET_IDS = new Set([
  7, 8, 16, 18, 19, 23, 26, 30, 43, 111, 120, 121, 122, 133, 139, 198, 213,
]);

/* Navigation sub-categories → routes. */
const NAV_ITEMS = [
  { to: "/", label: "בית", Icon: HomeIcon, tone: "blue" },
  { to: "/products", label: "מוצרים", Icon: GroceryIcon, tone: "green" },
  { to: "/cart", label: "עגלת קניות", Icon: CartIcon, tone: "sky" },
  { to: "/history", label: "היסטוריית קניות", Icon: HistoryIcon, tone: "violet" },
  { to: "/image-parser", label: "סריקת קבלות", Icon: ReceiptIcon, tone: "amber" },
  { to: "/advanced-stats", label: "סטטיסטיקות", Icon: PieChartIcon, tone: "pink" },
  { to: "/barcode-scanner", label: "סורק ברקוד", Icon: BarcodeIcon, tone: "slate" },
  { to: "/ai", label: "עוזר AI", Icon: RobotIcon, tone: "teal" },
  { to: "/ai-history", label: "מחקר AI", Icon: IconResearch, tone: "indigo" },
];

/* sheet exit animation length (ms) — keep in sync with BottomNav.css */
const SHEET_CLOSE_MS = 230;
const SHEET_DISMISS_PX = 90; // drag the header down this far → close

/* A short, controlled spoken summary of a cart-optimization result — a status
   snapshot ("what was worthwhile"), not a free-form ramble. Spoken after a
   voice-triggered optimize, in the reply language (`lang`) so the TTS voice
   matches the text (a Hebrew summary sent to the English voice = gibberish). */
function buildOptimizeSummary(result, lang) {
  const en = lang === "en";
  if (!result || result.empty) {
    return en
      ? "I couldn't optimize the cart right now."
      : "לא הצלחתי לייעל את העגלה כרגע.";
  }
  const saved = result.changedCount > 0 && result.savings > 0.005;
  if (!saved) {
    return en
      ? "I went over every product in your cart - they're all already at the best price, nothing to optimize."
      : "עברתי על כל המוצרים בעגלה, וכולם כבר במחיר הטוב ביותר - אין מה לייעל.";
  }
  const shekels = Math.round(result.savings);
  const pct = Math.round(result.savingsPct);
  const changed = result.changedCount;
  const kept = (result.items || []).filter((i) => !i.changed).length;

  if (en) {
    const swap =
      changed === 1
        ? "one product was swapped for a better-value alternative"
        : `${changed} products were swapped for better-value alternatives`;
    let s = `I optimized your cart. I saved you about ${shekels} shekels, around ${pct} percent. ${swap}`;
    if (kept > 0) {
      s +=
        kept === 1
          ? ", and one product was already at its best price"
          : `, and ${kept} products were already at their best price`;
    }
    return `${s}.`;
  }

  const swapPhrase =
    changed === 1
      ? "מוצר אחד הוחלף לחלופה משתלמת יותר"
      : `${changed} מוצרים הוחלפו לחלופות משתלמות יותר`;
  let s = `ייעלתי את העגלה. חסכתי לך בערך ${shekels} שקלים, כ-${pct} אחוז. ${swapPhrase}`;
  if (kept > 0) {
    s +=
      kept === 1
        ? ", ומוצר אחד כבר היה במחיר הטוב ביותר"
        : `, ו-${kept} מוצרים כבר היו במחיר הטוב ביותר`;
  }
  return `${s}.`;
}

/* Spoken summary of a voice-triggered cart completion (action #6). */
function buildCompleteSummary(result, lang) {
  const en = lang === "en";
  if (!result || result.empty) {
    if (result && result.reason === "no-names") {
      return en
        ? 'You haven\'t defined a "complete cart" list yet - pick products in the settings first.'
        : 'עוד לא הגדרת רשימת "עגלה שלמה" - בחר מוצרים בהגדרות ואז נסה שוב.';
    }
    return en
      ? "I couldn't complete the cart right now."
      : "לא הצלחתי להשלים את העגלה כרגע.";
  }
  if (!result.addedCount) {
    return en
      ? "Your cart is already complete - everything from your list is in it."
      : "העגלה שלך כבר מלאה - כל המוצרים מהרשימה נמצאים בה.";
  }
  const added =
    result.addedCount === 1
      ? en
        ? "one product was added"
        : "נוסף מוצר אחד"
      : en
      ? `${result.addedCount} products were added`
      : `נוספו ${result.addedCount} מוצרים`;
  const missing = result.missingCount
    ? en
      ? `, and for ${result.missingCount} I couldn't find a match`
      : `, ול-${result.missingCount} לא מצאתי מוצר מתאים`
    : "";
  return en
    ? `I completed your cart - ${added}${missing}.`
    : `השלמתי את העגלה - ${added}${missing}.`;
}

/* Spoken summary of a voice-triggered complete-and-switch (action #7). */
function buildCc7Summary(result, lang) {
  const en = lang === "en";
  if (!result || result.empty) {
    if (result && result.reason === "no-names") {
      return en
        ? 'You haven\'t defined a "complete cart" list yet - pick products in the settings first.'
        : 'עוד לא הגדרת רשימת "עגלה שלמה" - בחר מוצרים בהגדרות ואז נסה שוב.';
    }
    return en
      ? "I couldn't complete and compare right now."
      : "לא הצלחתי להשלים ולהשוות כרגע.";
  }
  const c = result.completedCount || 0;
  const compPart =
    c === 0
      ? en
        ? "Your cart was already complete"
        : "העגלה כבר הייתה מלאה"
      : c === 1
      ? en
        ? "I added one product"
        : "השלמתי מוצר אחד"
      : en
      ? `I added ${c} products`
      : `השלמתי ${c} מוצרים`;
  if (!result.compareWin || result.applySupermarketID == null) {
    return en
      ? `${compPart}. No store in the group beat your current supermarket, so we stayed put.`
      : `${compPart}. אף סופר בקבוצה לא יצא זול יותר מהנוכחי, אז נשארנו בסופר הנוכחי.`;
  }
  const nm = (result.targetSupermarket && result.targetSupermarket.name) || "";
  return en
    ? `${compPart} and compared the stores. Best value: ${nm} - about ${Math.round(
        result.afterTotal
      )} shekels, saving around ${Math.round(
        result.savings
      )}. I switched your cart there.`
    : `${compPart} והשוויתי בין הסופרים. הכי משתלם: ${nm} - בערך ${Math.round(
        result.afterTotal
      )} שקלים, חיסכון של כ-${Math.round(
        result.savings
      )} שקלים. העברתי את העגלה אליו.`;
}

/* Spoken + history summaries of a voice-triggered supermarket comparison.
   `spoken` is read aloud (short, ends with the follow-up options); `forHistory`
   is appended to the server conversation file so the NEXT utterance ("switch
   to the second one" / "עבור לרמי לוי") can resolve against the ranking. */
function buildCompareSummary(result, lang) {
  const en = lang === "en";
  if (!result || result.empty) {
    return {
      spoken: en
        ? "I couldn't compare the supermarkets right now."
        : "לא הצלחתי להשוות בין הסופרים כרגע.",
      forHistory: "השוואת הסופרים נכשלה - אין דירוג.",
    };
  }
  const ranked = result.ranked || [];
  const listText = ranked
    .map(
      (r, i) =>
        `${i + 1}. ${r.name} ₪${Number(r.total).toFixed(2)}${
          r.missing ? ` (חסרים ${r.missing} מוצרים)` : ""
        }`
    )
    .join("; ");
  const forHistory = `הוצגה השוואת עגלה בין סופרים. דירוג (מהזול ליקר): ${listText}. המשתמש מתבקש כעת להחליט - להחליף לזול ביותר, לעבור לסופר אחר מהדירוג (לפי שם או מיקום), או לבטל ולהישאר בסופר הנוכחי.`;

  const win = result.targetSupermarket || {};
  const winName = win.name || "";
  const runners = ranked
    .filter((r) => String(r.supermarketID) !== String(win.supermarketID))
    .slice(0, 2);

  if (en) {
    if (result.compareNoWin) {
      return {
        spoken: `I compared ${ranked.length} chains - your current cart is already the cheapest. Say a store name if you still want to switch, or say cancel.`,
        forHistory,
      };
    }
    const runnersTxt = runners.length
      ? ` Next: ${runners
          .map((r) => `${r.name} at ${Math.round(r.total)} shekels`)
          .join(", then ")}.`
      : "";
    return {
      spoken: `I compared ${ranked.length} chains. The best value is ${winName} at about ${Math.round(
        result.afterTotal
      )} shekels - saving you around ${Math.round(
        result.savings
      )} shekels.${runnersTxt} Say "switch" to apply, name another store, or say "cancel".`,
      forHistory,
    };
  }

  if (result.compareNoWin) {
    return {
      spoken: `השוויתי בין ${ranked.length} רשתות, והעגלה הנוכחית שלך כבר הזולה ביותר. אם בכל זאת תרצה לעבור, אמור את שם הסופר, או אמור ביטול.`,
      forHistory,
    };
  }
  const runnersTxt = runners.length
    ? ` אחריו: ${runners
        .map((r) => `${r.name} ב-${Math.round(r.total)} שקלים`)
        .join(", ואז ")}.`
    : "";
  return {
    spoken: `השוויתי בין ${ranked.length} רשתות. הכי משתלם: ${winName}, בערך ${Math.round(
      result.afterTotal
    )} שקלים - חיסכון של כ-${Math.round(
      result.savings
    )} שקלים.${runnersTxt} כדי להחליף אמור "החלף", לסופר אחר אמור את שמו, ולביטול אמור "בטל".`,
    forHistory,
  };
}

/**
 * BottomNav — slim blue bar with the robot "coin". Tapping the coin opens a
 * bottom action sheet (5 actions):
 *   • "ניווט"        → the navigation sub-categories (pages) → navigate.
 *   • "פעולה מספר 2" → the products page sub-categories (grouped by category)
 *                       → selects that category+sub-category and goes to /products.
 */
export default function BottomNav() {
  const navigate = useNavigate();
  const {
    allCategories,
    all_sub_categories,
    setActiveCategoryIndex,
    setActiveSubCategoryIndex,
    products,
  } = useProductList();
  const { pricesMap } = usePriceMap();
  const { cart, setCart } = useCart();
  const { fullCart } = useFullCart();
  const { allSupermarkets } = useSupermarkets();
  const { replaceSupermarket, add: addToCart, update: updateInCart } =
    useCartActions();
  const { sendActiveCart } = useUpdateActiveCart();
  const { completeCartNames } = useCompleteCartPreferences();
  const { families, byBarcode, isLoaded: classificationsLoaded } =
    useClassificationsCtx();

  const [open, setOpen] = useState(false);
  /* shelf session (voice #8 → #9): the products of the subcategory the user
     navigated to with find_product — the NLU may only add_product from it.
     Cleared by any other voice command. */
  const [shelfSession, setShelfSession] = useState([]);
  /* the AI-page drop-into-cart animation for a voice add */
  const [voiceAdd, setVoiceAdd] = useState(null); // {barcode, amount, key}
  const voiceAddTimerRef = useRef(null);
  const [optimizing, setOptimizing] = useState(false); // action #4 overlay
  const [comparing, setComparing] = useState(false); // action #5 overlay
  const [compareCandidates, setCompareCandidates] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false); // action #5 custom picker
  const [completing, setCompleting] = useState(false); // action #6 overlay
  const [completeStrategy, setCompleteStrategy] = useState("cheapest");
  const [completeComparing, setCompleteComparing] = useState(false); // action #7
  const [cc7Strategy, setCc7Strategy] = useState("cheapest");
  const [cc7Candidates, setCc7Candidates] = useState([]);
  const [compareWithComplete, setCompareWithComplete] = useState(false);
  const [view, setView] = useState("main"); // "main" | "nav" | "products" | "cheapest" | "compare"
  /* action #3 (cheapest) state — declared here so openSheet can reset it */
  const [cheapestMode, setCheapestMode] = useState("immediate"); // "immediate" | "display"
  const [cheapest, setCheapest] = useState({ status: "idle" }); // single cheapest
  const [ranked, setRanked] = useState({ status: "idle" }); // ranked list
  /* Lock body scroll only for the true modal views. The "cheapest" view is a
     non-modal floating panel (click-through), so the page behind must stay
     scrollable — otherwise it could be clicked but not scrolled. */
  useBodyScrollLock(open && view !== "cheapest");

  /* ── sheet lifecycle: open → (closing: exit animation) → unmounted ── */
  const [sheetDrag, setSheetDrag] = useState(0); // header drag offset (px)
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef(null);
  const openRef = useRef(false);
  openRef.current = open;
  const close = useCallback(() => {
    if (!openRef.current) return;
    if (closeTimerRef.current) return; // already closing
    uiSound("close");
    setClosing(true);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setClosing(false);
      setOpen(false);
      setSheetDrag(0);
    }, SHEET_CLOSE_MS);
  }, []);
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  const openSheet = () => {
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
    setClosing(false);
    setView("main");
    // fresh state for a manual open so action #3 re-fetches
    setCheapestMode("immediate");
    setCheapest({ status: "idle" });
    setRanked({ status: "idle" });
    setCompareWithComplete(false);
    haptic("medium");
    uiSound("open");
    setOpen(true);
  };

  /* every button inside a sheet view is a "selection" — one capture-phase
     handler gives them all the same feel (tick + haptic) without touching
     each handler */
  const onViewClickCapture = (e) => {
    const btn = e.target.closest && e.target.closest("button");
    if (!btn || btn.disabled) return;
    haptic("selection");
    uiSound("select");
  };
  const goBack = () => {
    haptic("selection");
    setView("main");
  };

  /* ── drag the header down to dismiss (mobile affordance) ── */
  const [sheetDragging, setSheetDragging] = useState(false);
  const sheetDragRef = useRef({ active: false, y0: 0, dy: 0, t0: 0 });
  const onSheetHandleDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // the close / back buttons live inside the handle — leave their clicks alone
    if (e.target.closest && e.target.closest("button")) return;
    sheetDragRef.current = { active: true, y0: e.clientY, dy: 0, t0: Date.now() };
    setSheetDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
  };
  const onSheetHandleMove = (e) => {
    const d = sheetDragRef.current;
    if (!d.active) return;
    d.dy = Math.max(0, e.clientY - d.y0);
    setSheetDrag(d.dy);
  };
  const onSheetHandleUp = () => {
    const d = sheetDragRef.current;
    if (!d.active) return;
    d.active = false;
    setSheetDragging(false);
    const fast = d.dy > 24 && Date.now() - d.t0 < 200;
    if (d.dy > SHEET_DISMISS_PX || fast) {
      haptic("light");
      close(); // the exit animation continues from the dragged position
    } else {
      setSheetDrag(0); // spring back
    }
  };

  /* Action #4 — optimize the whole cart for the current supermarket. Close the
     sheet and open the full-screen optimize experience; it runs the same
     cart-optimization algorithm (fixed settings) and calls back here to apply. */
  const optimizeViaVoiceRef = useRef(false);
  const startOptimize = (viaVoice = false) => {
    optimizeViaVoiceRef.current = !!viaVoice;
    close();
    setOptimizing(true);
  };

  /* Called by the overlay's CTA. `optimizedProducts` is null when there was
     nothing to improve (keep the cart untouched); otherwise replace the cart's
     products in one shot. Then continue to the cart page. */
  const applyOptimized = (optimizedProducts) => {
    if (optimizedProducts && optimizedProducts.length && cart) {
      setCart({ ...cart, products: optimizedProducts });
    }
    setOptimizing(false);
    navigate("/cart");
  };

  /* Action #5 — compare the cart across a chosen SET of supermarkets and build
     the cart for the cheapest among them (same reveal as #4), then switch the
     cart to that store. `supers` is the resolved supermarket objects.
     A VOICE-triggered compare holds the overlay open on the ranking (no
     auto-apply) — the user decides by speaking (apply_compare). */
  const [compareVoice, setCompareVoice] = useState(false);
  const compareVoiceRef = useRef(null); // { transcript } while awaiting a result
  const pendingCompareRef = useRef(null); // { result } awaiting a spoken decision
  const startCompare = (supers, viaVoice = false) => {
    if (!supers || !supers.length) return;
    close();
    setPickerOpen(false);
    setCompareVoice(!!viaVoice);
    if (!viaVoice) {
      compareVoiceRef.current = null;
      pendingCompareRef.current = null;
    }
    setCompareCandidates(supers);
    setComparing(true);
  };

  /* Overlay CTA / auto-finish for compare: switch the cart to the chosen store
     AND apply its optimized products in one shot, then open the cart. */
  const applyCompare = (optimizedProducts, result) => {
    const targetId =
      result &&
      result.targetSupermarket &&
      result.targetSupermarket.supermarketID;
    if (
      optimizedProducts &&
      optimizedProducts.length &&
      cart &&
      targetId != null
    ) {
      setCart({ ...cart, supermarketID: targetId, products: optimizedProducts });
    }
    setComparing(false);
    setCompareVoice(false);
    pendingCompareRef.current = null;
    navigate("/cart");
  };

  /* Action #6 — complete the cart: fill in any generalName from the user's
     "complete cart" list that's missing, by the chosen strategy. */
  const startComplete = (strategy) => {
    setCompleteStrategy(strategy);
    close();
    setCompleting(true);
  };

  /* Overlay CTA / auto-finish for complete: ADD the picked products to the cart
     (merge amounts), then open the cart. */
  const applyComplete = (addedProducts) => {
    if (addedProducts && addedProducts.length && cart) {
      const merged = [...cart.products];
      addedProducts.forEach((ap) => {
        const ex = merged.find((p) => p.barcode === ap.barcode);
        if (ex) ex.amount += ap.amount;
        else merged.push({ ...ap });
      });
      setCart({ ...cart, products: merged });
    }
    setCompleting(false);
    navigate("/cart");
  };

  /* Action #7 — complete the cart, then switch to the cheapest supermarket among
     a chosen set (complete → compare, one overlay). */
  const startCompleteCompare = (supers) => {
    if (!supers || !supers.length) return;
    close();
    setPickerOpen(false);
    setCc7Candidates(supers);
    setCompleteComparing(true);
  };

  /* Overlay finish for action #7: the result says exactly what to apply —
     switch to the cheapest store with its optimized products, OR (no cheaper
     store) just apply the completion at the current store. */
  const applyCompleteCompare = (_payload, result) => {
    if (result && !result.empty && cart) {
      const products = result.applyProducts;
      if (products && products.length) {
        if (result.applySupermarketID != null) {
          setCart({
            ...cart,
            supermarketID: result.applySupermarketID,
            products,
          });
        } else {
          setCart({ ...cart, products });
        }
      }
    }
    setCompleteComparing(false);
    navigate("/cart");
  };

  /* Close on Escape. */
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  const goTo = (to) => {
    close();
    navigate(to);
  };

  /* Jump to a specific products sub-category, then open the products page. */
  const goToSubCategory = (categoryIndex, subIndex) => {
    setActiveCategoryIndex(categoryIndex);
    setActiveSubCategoryIndex(subIndex);
    close();
    navigate("/products");
  };

  /* ── Action #8: shelf navigation ──
     Deep-navigate to the products of a classification family: resolve the
     family's products (join key = barcode), pick their majority
     category+subcategory, hand the barcodes to ProductsList through the
     shelf-target store, and open the products page — ProductsList scrolls
     the rest of the way to the actual shelf. */
  const goToShelf = (target) => {
    const matches =
      target.type === "family"
        ? (products || []).filter(
            (p) => byBarcode[String(p.barcode)]?.family === target.name
          )
        : (products || []).filter(
            (p) => (p.generalName || "").trim() === target.name
          );
    if (!matches.length) return;

    const counts = new Map();
    matches.forEach((p) => {
      const key = `${p.category}|||${p.subcategory}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    const [bestKey] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
    const [category, subcategory] = bestKey.split("|||");

    const ci = allCategories.indexOf(category);
    const si = (all_sub_categories[ci] || []).indexOf(subcategory);
    if (ci === -1 || si === -1) return;

    setShelfTarget(
      matches
        .filter((p) => p.category === category && p.subcategory === subcategory)
        .map((p) => p.barcode)
    );

    /* open a shelf session: ALL products of that subcategory, so a follow-up
       "תוסיף..." (voice #9) can resolve any of them by name */
    setShelfSession(
      (products || [])
        .filter(
          (p) => p.category === category && p.subcategory === subcategory
        )
        .map((p) => ({ name: p.name, barcode: p.barcode }))
    );

    goToSubCategory(ci, si);
  };

  /* action #8 targets: classification families + curated deep-scroll
     generalNames (only ones that actually resolve to products), Hebrew order */
  const shelfTargets = useMemo(() => {
    const famNames = (families || []).map((f) => f.family);
    const generalSet = new Set(
      (products || [])
        .map((p) => (p.generalName || "").trim())
        .filter(Boolean)
    );
    const extras = SHELF_EXTRA_GENERALS.filter(
      (n) => generalSet.has(n) && !famNames.includes(n)
    );
    return [
      ...famNames.map((name) => ({ type: "family", name })),
      ...extras.map((name) => ({ type: "general", name })),
    ].sort((a, b) => a.name.localeCompare(b.name, "he"));
  }, [families, products]);

  /* ── Cheapest supermarket(s) for the current cart (action #3) ──
     Two modes:
       • "immediate" — the single cheapest supermarket + one-tap replace.
       • "display"   — a ranked list of cheap supermarkets; tap one to switch.
     Both reuse the SAME-cart pricing the cart page relies on (replaceSupermarket
     keeps the same products, so same-cart totals are the accurate prices).
     State (cheapestMode / cheapest / ranked) is declared near the top. */

  /* id → supermarket details (allSupermarkets loads app-wide). */
  const supermarketLookup = useMemo(
    () =>
      new Map((allSupermarkets || []).map((s) => [String(s.supermarketID), s])),
    [allSupermarkets]
  );

  /* Action #5 preset groups, resolved from the app-wide supermarket list. */
  const talpiotSupermarkets = useMemo(
    () =>
      (allSupermarkets || []).filter((s) =>
        TALPIOT_SUPERMARKET_IDS.has(Number(s.supermarketID))
      ),
    [allSupermarkets]
  );
  const onlineSupermarkets = useMemo(
    () =>
      (allSupermarkets || []).filter(
        (s) =>
          s &&
          (s.city === "אינטרנט" ||
            /^https?:\/\//.test(String(s.address || "")))
      ),
    [allSupermarkets]
  );

  const loadCheapest = useCallback(async () => {
    const products = (cart && cart.products) || [];
    if (!products.length) {
      setCheapest({ status: "empty" });
      return;
    }
    setCheapest({ status: "loading" });
    try {
      const res = await getCheapestSupermarketIDsByCart(products);
      const ids = (res && res.data && res.data.supermarketIDs) || [];
      if (!ids.length) {
        setCheapest({ status: "empty" });
        return;
      }
      setCheapest({
        status: "done",
        ids,
        count: ids.length,
        price: res && res.price != null ? Number(res.price) : null,
      });
    } catch (e) {
      setCheapest({ status: "error" });
    }
  }, [cart]);

  const loadRanked = useCallback(async () => {
    const products = (cart && cart.products) || [];
    if (!products.length) {
      setRanked({ status: "empty" });
      return;
    }
    setRanked({ status: "loading" });
    try {
      const res = await getRankedSupermarketsByCart(products, 8);
      const items = (res && res.data && res.data.supermarkets) || [];
      if (!items.length) {
        setRanked({ status: "empty" });
        return;
      }
      setRanked({ status: "done", items });
    } catch (e) {
      setRanked({ status: "error" });
    }
  }, [cart]);

  /* Load the data for the active mode when the view is open. Only fetch when the
     relevant slice is still "idle" — so a list injected by a voice command
     (show_cheapest) isn't clobbered by a refetch. */
  useEffect(() => {
    if (!open || view !== "cheapest") return;
    if (cheapestMode === "immediate") {
      if (cheapest.status === "idle") loadCheapest();
    } else if (ranked.status === "idle") {
      loadRanked();
    }
  }, [
    open,
    view,
    cheapestMode,
    cheapest.status,
    ranked.status,
    loadCheapest,
    loadRanked,
  ]);

  /* When the cart's product set changes (e.g. edited via the click-through page
     behind the floating panel), any computed cheapest/ranked is stale → mark it
     idle so the load-effect recomputes. Functional updates bail out when already
     idle, avoiding spurious re-renders on every cart change. */
  const cartSignature =
    cart && Array.isArray(cart.products)
      ? cart.products.map((p) => `${p.barcode}:${p.amount}`).join(",")
      : "";
  useEffect(() => {
    setCheapest((p) => (p.status === "idle" ? p : { status: "idle" }));
    setRanked((p) => (p.status === "idle" ? p : { status: "idle" }));
  }, [cartSignature]);

  const cheapestSupermarket = useMemo(() => {
    if (cheapest.status !== "done" || !cheapest.ids || !cheapest.ids.length)
      return null;
    const id = cheapest.ids[0];
    return supermarketLookup.get(String(id)) || { supermarketID: id };
  }, [cheapest, supermarketLookup]);

  /* Switch the cart to a supermarket, then open the cart to show the result.
     Also reset the stored cheapest/ranked lists so a later reference can't
     resolve against a now-irrelevant snapshot (close() makes the load-effect
     a no-op, so this can't trigger a refetch). */
  const selectSupermarket = (supermarketID) => {
    replaceSupermarket(supermarketID);
    close();
    setCheapest({ status: "idle" });
    setRanked({ status: "idle" });
    navigate("/cart");
  };

  /* ── Voice command (long-press the coin) ──────────────────────────────
     Long-press starts recording; a subsequent tap stops + sends it. The
     reply language/voice are the shared AI settings (chosen in Settings). */
  const aiSettings = useAiSettings();
  const ttsLanguage = (aiSettings && aiSettings.settings.ttsLanguage) || "he";
  const ttsVoice = (aiSettings && aiSettings.settings.ttsVoice) || "";
  const micThreshold =
    (aiSettings && aiSettings.settings.micThreshold) || 15;

  /* Perform the action the server resolved from the voice command. Returns a
     directive telling the hook what to do with the conversation-history JSON:
       • { history: "clear" }           — command COMPLETED successfully → reset.
       • { history: "append", summary } — show_cheapest succeeded → keep + record
                                          the list so the follow-up can resolve.
       • { history: "keep" }            — failed / not understood → leave as-is
                                          (so the user can retry with context).
     Optional `detail` (what happened, in words) and `outcome` (a status that
     overrides the one derived from `history`) go to the research log. */
  const performCommand = async (cmd, transcript) => {
    // Voice → optimize the cart ("תחליף לי את המוצרים למשתלמים יותר", "תהפוך את
    // העגלה לאופטימלית", "תייעל את העגלה"). Primary path is the server intent
    // (optimize_cart); the transcript keyword-match is a safety net that covers a
    // mis-classification or a not-yet-redeployed NLU. Kept narrow so it never
    // collides with the cheapest-SUPERMARKET intents (which don't mention מוצר).
    const t = (transcript || "").replace(/["'.,!?]/g, "");

    // "שתוק" / "די" / "שקט": the user only wanted silence. The speech was
    // already cut by the voice barge-in (or the tap); there is nothing to do
    // and — above all — nothing to say.
    if ((cmd && cmd.actionType === "hush") || isHushPhrase(transcript)) {
      return { history: "keep" };
    }

    const optimizeIntent =
      (cmd && cmd.actionType === "optimize_cart") ||
      /אופטימ|ייעל|משתלמ|תחליף.*מוצר|מוצר.*(משתלמ|זול)/.test(t);
    if (optimizeIntent) {
      startOptimize(true);
      return {
        history: "clear",
        detail:
          cmd && cmd.actionType === "optimize_cart"
            ? "ייעול העגלה נפתח"
            : "ייעול העגלה נפתח (זוהה לפי מילות מפתח בתמלול)",
      };
    }

    if (!cmd) return { history: "keep" };

    /* the shelf session (voice #8 → #9) survives only find_product /
       add_product chains — any other resolved command closes it */
    if (
      cmd.actionType !== "find_product" &&
      cmd.actionType !== "add_product" &&
      cmd.actionType !== "none"
    ) {
      setShelfSession([]);
    }

    switch (cmd.actionType) {
      case "navigate": {
        if (!cmd.route) return { history: "keep" };
        const page = NAV_ITEMS.find((n) => n.to === cmd.route);
        goTo(cmd.route);
        return {
          history: "clear",
          detail: `ניווט אל ${page ? page.label : cmd.route}`,
        };
      }

      case "open_subcategory": {
        if (
          !Number.isInteger(cmd.categoryIndex) ||
          !Number.isInteger(cmd.subIndex)
        )
          return { history: "keep" };
        goToSubCategory(cmd.categoryIndex, cmd.subIndex);
        return {
          history: "clear",
          detail: `נפתחה תת-קטגוריה: ${
            allCategories[cmd.categoryIndex] || cmd.categoryIndex
          } › ${
            (all_sub_categories[cmd.categoryIndex] || [])[cmd.subIndex] ||
            cmd.subIndex
          }`,
        };
      }

      case "find_product": {
        /* voice command #8 — the server snapped productName to the shelf
           catalog we sent, so an exact match is expected here. goToShelf also
           opens the shelf session that enables a follow-up add_product. */
        const target = shelfTargets.find((t) => t.name === cmd.productName);
        if (!target) {
          return {
            history: "keep",
            outcome: "failed",
            detail: `המדף "${cmd.productName}" לא נמצא ברשימת היעדים`,
          };
        }
        goToShelf(target);
        return { history: "clear", detail: `גלילה למדף: ${target.name}` };
      }

      case "add_product": {
        /* voice command #9 — only valid inside a shelf session opened by #8.
           The server snapped productName against the session list we sent. */
        if (!shelfSession.length) {
          return {
            history: "keep",
            outcome: "failed",
            detail: "אין מדף פעיל - צריך קודם לנווט למוצר",
          };
        }
        const prod =
          shelfSession.find((p) => p.name === cmd.productName) ||
          shelfSession.find(
            (p) =>
              p.name.includes(cmd.productName || "") ||
              (cmd.productName || "").includes(p.name)
          );
        if (!prod) {
          return {
            history: "keep",
            outcome: "failed",
            detail: `"${cmd.productName}" לא נמצא במדף הפעיל`,
          };
        }
        const qty =
          Number.isInteger(cmd.quantity) && cmd.quantity >= 1
            ? cmd.quantity
            : 1;

        /* same mutation pattern as the AI page's cart operation */
        const existing = ((cart && cart.products) || []).find(
          (p) => String(p.barcode) === String(prod.barcode)
        );
        if (existing) updateInCart(prod.barcode, (existing.amount || 0) + qty);
        else addToCart(prod.barcode, qty);
        sendActiveCart();

        /* the AI-page drop-into-cart animation, auto-closing */
        clearTimeout(voiceAddTimerRef.current);
        setVoiceAdd({ barcode: prod.barcode, amount: qty, key: Date.now() });
        voiceAddTimerRef.current = setTimeout(() => setVoiceAdd(null), 3500);
        return {
          history: "clear",
          detail: `נוסף לעגלה: ${prod.name} ×${qty}`,
        };
      }

      case "replace_cheapest": {
        const products = (cart && cart.products) || [];
        if (!products.length) {
          return { history: "keep", outcome: "failed", detail: "העגלה ריקה" };
        }
        try {
          const res = await getCheapestSupermarketIDsByCart(products);
          const ids = (res && res.data && res.data.supermarketIDs) || [];
          if (!ids.length) {
            return {
              history: "keep",
              outcome: "failed",
              detail: "לא נמצא סופר זול לעגלה",
            };
          }
          selectSupermarket(ids[0]);
          const sm = supermarketLookup.get(String(ids[0])) || {};
          return {
            history: "clear",
            detail: `הוחלף לסופר הזול: ${sm.name || "#" + ids[0]}`,
          };
        } catch (e) {
          return {
            history: "keep",
            outcome: "failed",
            detail: "שגיאה בחישוב הסופר הזול",
          };
        }
      }

      case "show_cheapest": {
        const products = (cart && cart.products) || [];
        const count = Math.max(1, Math.min(20, cmd.count || 5));
        setCheapestMode("display");
        setView("cheapest");
        setOpen(true);
        // Mark non-idle synchronously so the data-loading effect's "idle" guard
        // skips a duplicate loadRanked() that would race this voice fetch.
        setRanked({ status: "loading" });
        if (!products.length) {
          setRanked({ status: "empty" });
          return { history: "keep" };
        }
        try {
          const res = await getRankedSupermarketsByCart(products, count);
          const items = (res && res.data && res.data.supermarkets) || [];
          setRanked({ status: items.length ? "done" : "empty", items });
          if (!items.length) return { history: "keep" };
          const listText = items
            .map((it, i) => {
              const sm = supermarketLookup.get(String(it.supermarketID)) || {};
              return `${i + 1}. ${sm.name || "#" + it.supermarketID} (id=${
                it.supermarketID
              }) ₪${Number(it.price).toFixed(2)}`;
            })
            .join("; ");
          return {
            history: "append",
            summary: `הצגתי ${items.length} סופרמרקטים זולים: ${listText}`,
          };
        } catch (e) {
          setRanked({ status: "error" });
          return { history: "keep" };
        }
      }

      /* Voice action #5 — compare the cart across a group of supermarkets.
         Opens the compare overlay in hold-open mode; when the ranking is ready
         handleCompareResult speaks it and records it in the history, and the
         NEXT utterance decides (apply_compare below). */
      case "compare_supermarkets": {
        const products = (cart && cart.products) || [];
        if (!products.length) {
          speak(
            ttsLanguage === "en"
              ? "Your cart is empty - there's nothing to compare yet."
              : "העגלה שלך ריקה - אין עדיין מה להשוות."
          );
          return { history: "keep", outcome: "failed", detail: "העגלה ריקה" };
        }
        let supers = [];
        if (cmd.group === "talpiot") supers = talpiotSupermarkets;
        else if (cmd.group === "online") supers = onlineSupermarkets;
        else if (cmd.group === "custom") {
          const names = cmd.supermarketNames || [];
          supers = (allSupermarkets || []).filter(
            (s) =>
              s &&
              s.name &&
              names.some(
                (n) => s.name === n || s.name.includes(n) || n.includes(s.name)
              )
          );
        }
        if (!supers.length) {
          speak(
            ttsLanguage === "en"
              ? "I couldn't find those supermarkets."
              : "לא מצאתי את הסופרים המבוקשים."
          );
          return {
            history: "keep",
            outcome: "failed",
            detail: `לא נמצאו סופרים לקבוצה ${cmd.group}${
              cmd.supermarketNames ? ` (${cmd.supermarketNames.join(", ")})` : ""
            }`,
          };
        }
        compareVoiceRef.current = { transcript: transcript || "" };
        startCompare(supers, true);
        return {
          history: "keep", // the ranking is appended once it's ready
          outcome: "done",
          detail: `השוואה נפתחה: ${cmd.group} - ${supers.length} סניפים`,
        };
      }

      /* Voice action #6 — complete the cart from the user's defined list.
         Decisive: the overlay reveals and auto-applies (merge), then the
         result summary is spoken (handleCompleteResult). */
      case "complete_cart": {
        if (!completeCartNames || !completeCartNames.length) {
          speak(
            ttsLanguage === "en"
              ? 'You haven\'t defined a "complete cart" list yet - pick products in the settings first.'
              : 'עוד לא הגדרת רשימת "עגלה שלמה" - בחר מוצרים בהגדרות ואז נסה שוב.'
          );
          return { history: "keep" };
        }
        completeViaVoiceRef.current = true;
        startComplete(
          cmd.strategy === "lastPurchased" ? "lastPurchased" : "cheapest"
        );
        return {
          history: "clear",
          detail: `השלמת עגלה נפתחה (${
            cmd.strategy === "lastPurchased" ? "לפי קניות קודמות" : "הזול ביותר"
          })`,
        };
      }

      /* Voice action #7 — complete the cart AND switch to the cheapest store
         of a group. Decisive like the sheet path: auto-applies, then speaks. */
      case "complete_and_compare": {
        if (!completeCartNames || !completeCartNames.length) {
          speak(
            ttsLanguage === "en"
              ? 'You haven\'t defined a "complete cart" list yet - pick products in the settings first.'
              : 'עוד לא הגדרת רשימת "עגלה שלמה" - בחר מוצרים בהגדרות ואז נסה שוב.'
          );
          return { history: "keep" };
        }
        let supers = [];
        if (cmd.group === "online") supers = onlineSupermarkets;
        else if (cmd.group === "custom") {
          const names = cmd.supermarketNames || [];
          supers = (allSupermarkets || []).filter(
            (s) =>
              s &&
              s.name &&
              names.some(
                (n) => s.name === n || s.name.includes(n) || n.includes(s.name)
              )
          );
        } else supers = talpiotSupermarkets; // "talpiot" is the voice default
        if (!supers.length) {
          speak(
            ttsLanguage === "en"
              ? "I couldn't find those supermarkets."
              : "לא מצאתי את הסופרים המבוקשים."
          );
          return { history: "keep" };
        }
        cc7ViaVoiceRef.current = true;
        setCc7Strategy(
          cmd.strategy === "lastPurchased" ? "lastPurchased" : "cheapest"
        );
        startCompleteCompare(supers);
        return {
          history: "clear",
          detail: `השלמה ומעבר לזול נפתחו: ${cmd.group || "talpiot"} - ${
            supers.length
          } סניפים`,
        };
      }

      /* The spoken decision after a compare ranking was presented. */
      case "apply_compare": {
        const pending = pendingCompareRef.current;
        if (!pending || !pending.result) {
          return {
            history: "keep",
            outcome: "ignored",
            detail: "אין השוואה ממתינה להחלטה",
          };
        }
        const result = pending.result;

        if (cmd.decision === "cancel") {
          pendingCompareRef.current = null;
          setCompareVoice(false);
          setComparing(false);
          speak(
            ttsLanguage === "en"
              ? "Okay, staying at the current supermarket."
              : "בסדר, נשארים בסופר הנוכחי."
          );
          return { history: "clear", detail: "ההשוואה בוטלה - נשארנו בסופר" };
        }

        /* decision === "apply" — to the winner, or to a named/ranked store */
        const ranked = result.ranked || [];
        let target = null;
        if (
          Number.isInteger(cmd.rank) &&
          cmd.rank >= 1 &&
          cmd.rank <= ranked.length
        ) {
          target = ranked[cmd.rank - 1];
        } else if (cmd.supermarketName) {
          const want = String(cmd.supermarketName).trim();
          target = ranked.find(
            (r) =>
              r.name && (r.name.includes(want) || want.includes(r.name))
          );
          if (!target) {
            speak(
              ttsLanguage === "en"
                ? "That store wasn't part of the comparison."
                : "הסופר הזה לא היה חלק מההשוואה."
            );
            return { history: "keep" };
          }
        }

        const winnerId =
          result.targetSupermarket && result.targetSupermarket.supermarketID;

        if (!target || String(target.supermarketID) === String(winnerId)) {
          if (result.compareNoWin || !result.optimizedProducts) {
            pendingCompareRef.current = null;
            setCompareVoice(false);
            setComparing(false);
            speak(
              ttsLanguage === "en"
                ? "Your current cart is already the cheapest - staying put."
                : "העגלה הנוכחית שלך כבר הזולה ביותר - נשארים."
            );
            return { history: "clear" };
          }
          const nm =
            (result.targetSupermarket && result.targetSupermarket.name) || "";
          applyCompare(result.optimizedProducts, result);
          speak(
            ttsLanguage === "en"
              ? `Switched to ${nm}. The cart total is about ${Math.round(
                  result.afterTotal
                )} shekels.`
              : `החלפתי ל${nm}. סך העגלה בערך ${Math.round(
                  result.afterTotal
                )} שקלים.`
          );
          return { history: "clear", detail: `הוחלף לזוכה ההשוואה: ${nm}` };
        }

        /* a non-winner store from the ranking → build ITS cart head-to-head
           against the current one, then apply honestly */
        try {
          speak(
            ttsLanguage === "en"
              ? `One moment, building your cart at ${target.name}…`
              : `רגע, בונה את העגלה ב${target.name}…`
          );
          const branches = (allSupermarkets || []).filter(
            (s) => s && s.name === target.name
          );
          const single = await runCompareOptimization(
            fullCart,
            branches.length
              ? branches
              : [{ supermarketID: target.supermarketID, name: target.name }]
          );
          pendingCompareRef.current = null;
          setCompareVoice(false);
          if (
            single &&
            !single.empty &&
            !single.compareNoWin &&
            single.optimizedProducts
          ) {
            applyCompare(single.optimizedProducts, single);
            speak(
              ttsLanguage === "en"
                ? `Switched to ${target.name}. The cart total is about ${Math.round(
                    single.afterTotal
                  )} shekels.`
                : `עברנו ל${target.name}. סך העגלה בערך ${Math.round(
                    single.afterTotal
                  )} שקלים.`
            );
            return { history: "clear", detail: `הוחלף ל${target.name}` };
          }
          setComparing(false);
          speak(
            ttsLanguage === "en"
              ? `At ${target.name} the cart doesn't come out cheaper, so I stayed at the current supermarket.`
              : `ב${target.name} העגלה לא יוצאת זולה יותר מהנוכחית, אז נשארתי בסופר הנוכחי.`
          );
          return { history: "clear" };
        } catch (e) {
          speak(
            ttsLanguage === "en"
              ? "I couldn't switch right now, please try again."
              : "לא הצלחתי להחליף כרגע, נסה שוב."
          );
          return { history: "keep" };
        }
      }

      case "select_supermarket": {
        let items = (ranked.status === "done" && ranked.items) || [];
        if (!items.length) {
          // no list in state — recompute so the reference can still resolve
          const products = (cart && cart.products) || [];
          if (products.length) {
            try {
              const res = await getRankedSupermarketsByCart(products, 8);
              items = (res && res.data && res.data.supermarkets) || [];
            } catch (e) {
              /* ignore */
            }
          }
        }
        // couldn't resolve → keep the list context so the user can retry
        if (!items.length) {
          return {
            history: "keep",
            outcome: "failed",
            detail: "אין רשימת סופרים לבחור ממנה",
          };
        }

        let chosen = null;
        if (
          Number.isInteger(cmd.rank) &&
          cmd.rank >= 1 &&
          cmd.rank <= items.length
        ) {
          chosen = items[cmd.rank - 1];
        } else if (cmd.supermarketName) {
          const want = String(cmd.supermarketName).trim();
          chosen = items.find((it) => {
            const nm =
              (supermarketLookup.get(String(it.supermarketID)) || {}).name || "";
            return nm && (nm.includes(want) || want.includes(nm));
          });
        }
        if (!chosen) {
          return {
            history: "keep",
            outcome: "failed",
            detail: `לא נמצא ברשימה: ${
              cmd.rank != null ? `מקום ${cmd.rank}` : cmd.supermarketName || "?"
            }`,
          };
        }

        selectSupermarket(chosen.supermarketID);
        const chosenSm =
          supermarketLookup.get(String(chosen.supermarketID)) || {};
        return {
          history: "clear",
          detail: `נבחר מהרשימה: ${
            chosenSm.name || "#" + chosen.supermarketID
          }`,
        };
      }

      default:
        return { history: "keep" }; // "none"
    }
  };

  const navPages = NAV_ITEMS.map((n, index) => ({
    index,
    label: n.label,
    route: n.to,
  }));

  /* distinct chain names for the NLU — lets the user compare BY NAME
     ("תשווה בין רמי לוי ושופרסל"); the agent normalizes against this list */
  const chainNames = useMemo(
    () => [
      ...new Set(
        (allSupermarkets || []).map((s) => s && s.name).filter(Boolean)
      ),
    ],
    [allSupermarkets]
  );

  const {
    state: voiceState,
    error: voiceError,
    mode: voiceMode,
    level: voiceLevel,
    handsFree,
    startRecording,
    stopRecording,
    startHandsFree,
    stopHandsFree,
    stopSpeaking,
    appendHistory,
    speak,
  } = useVoiceCommand({
    pages: navPages,
    categories: allCategories,
    subCategories: all_sub_categories,
    supermarkets: chainNames,
    shelfProducts: shelfTargets.map((t) => t.name),
    shelfSessionProducts: shelfSession.map((p) => p.name),
    ttsLanguage,
    ttsVoice,
    micThreshold,
    onCommand: performCommand,
  });

  /* Voice-triggered optimize: once the overlay reveals its result, speak a
     short, controlled summary of what was worthwhile. The button path stays
     silent — its on-screen summary is enough. */
  const handleOptimizeResult = (result) => {
    if (!optimizeViaVoiceRef.current) return;
    optimizeViaVoiceRef.current = false;
    speak(buildOptimizeSummary(result, ttsLanguage));
  };

  /* Voice-triggered complete (#6) / complete+switch (#7): both are decisive —
     the overlay auto-applies as usual and we only SPEAK the outcome. */
  const completeViaVoiceRef = useRef(false);
  const cc7ViaVoiceRef = useRef(false);
  const handleCompleteResult = (result) => {
    if (!completeViaVoiceRef.current) return;
    completeViaVoiceRef.current = false;
    speak(buildCompleteSummary(result, ttsLanguage));
  };
  const handleCc7Result = (result) => {
    if (!cc7ViaVoiceRef.current) return;
    cc7ViaVoiceRef.current = false;
    speak(buildCc7Summary(result, ttsLanguage));
  };

  /* Voice-triggered compare: when the ranking is ready, speak it, remember it
     for the spoken decision (apply_compare), and append it to the server-held
     conversation so the next utterance can reference the ranking. The button
     path stays silent and auto-applies as before. */
  const handleCompareResult = (result) => {
    if (!compareVoiceRef.current) return;
    const { transcript } = compareVoiceRef.current;
    compareVoiceRef.current = null;
    pendingCompareRef.current = { result };
    const summary = buildCompareSummary(result, ttsLanguage);
    speak(summary.spoken);
    appendHistory(transcript || "השוואת סופרים", summary.forHistory);
  };

  /* ── Coin gestures ───────────────────────────────────────────────────
     • long-press            → single-shot recording (tap again to stop & send)
     • double-tap            → enter hands-free continuous mode
     • single tap (idle)     → open the action sheet
     • single tap (hands-free / recording) → exit / stop
     • single tap WHILE THE ROBOT SPEAKS → hush: the speech stops right there.
       In hands-free the robot keeps listening for the next command; in
       single-shot it just goes quiet (long-press for the next command).
     • long-press while it speaks → hush + start recording at once (barge-in).
     Pointer events only ARM the long-press; taps resolve in onClick (the
     click-through-safe path that opens the modal). A single tap waits one
     double-tap window before opening the sheet, so a 2nd tap can promote it. */
  const LONG_PRESS_MS = 450;
  const DOUBLE_TAP_MS = 260;
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);
  const tapCount = useRef(0);
  const tapTimer = useRef(null);

  const onCoinPointerDown = () => {
    longPressFired.current = false; // reset every press (covers a prior long-press)
    primeUiSound(); // first gesture → the audio context is ready for later sounds
    haptic("light"); // every press on the robot "feels" like a press
    if (voiceState !== "idle" || handsFree) return; // arm long-press only from idle
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      // barge-in: a long-press while the robot is still talking cuts the
      // speech first, so the mic never records the robot's own voice
      stopSpeaking();
      haptic("recStart");
      uiSound("recStart");
      startRecording();
    }, LONG_PRESS_MS);
  };

  /* Hush — stop the robot mid-sentence. No sound (silence is the point),
     just a light tick so the tap is acknowledged. */
  const hush = () => {
    const cut = stopSpeaking();
    if (cut) haptic("light");
    return cut;
  };

  const cancelLongPress = () => clearTimeout(longPressTimer.current);

  const onCoinClick = () => {
    if (longPressFired.current) {
      // the press that just ended was a long-press (recording started) → not a tap
      longPressFired.current = false;
      return;
    }
    if (voiceMode === "speaking") {
      // tap while it talks = "quiet". Hands-free stays on (it resumes
      // listening by itself); single-shot simply returns to idle.
      hush();
      return;
    }
    if (handsFree) {
      haptic("listenOff");
      uiSound("listenOff");
      stopHandsFree(); // a single tap exits hands-free mode
      return;
    }
    if (voiceState === "recording" || voiceState === "starting") {
      haptic("recStop");
      uiSound("recStop");
      stopRecording(); // tap while recording → stop & send
      return;
    }
    if (voiceState !== "idle") return; // "processing" → ignore

    // idle: distinguish a single tap (open sheet) from a double tap (hands-free)
    tapCount.current += 1;
    if (tapCount.current === 1) {
      tapTimer.current = setTimeout(() => {
        tapCount.current = 0;
        openSheet();
      }, DOUBLE_TAP_MS);
    } else {
      clearTimeout(tapTimer.current);
      tapCount.current = 0;
      haptic("listenOn");
      uiSound("listenOn");
      startHandsFree();
    }
  };

  /* an error (mic denied / network…) gets its own feel */
  useEffect(() => {
    if (!voiceError) return;
    haptic("error");
    uiSound("error");
  }, [voiceError]);

  // clear any pending timers on unmount
  useEffect(
    () => () => {
      clearTimeout(longPressTimer.current);
      clearTimeout(tapTimer.current);
    },
    []
  );

  const recording = voiceMode === "recording";

  /* the dock's wave edge: wide while idle, tightens around the robot (with
     a small overshoot) the moment a voice mode starts — see useDockShape */
  const navRef = useRef(null);
  const barRef = useRef(null);
  const voicebgRef = useRef(null);
  useDockShape(navRef, [barRef, voicebgRef], voiceMode !== "idle");

  /* status chip above the bar: text + which icon / colour family */
  const hint =
    voiceState === "starting"
      ? { text: "פותח מיקרופון…", kind: "starting" }
      : voiceMode === "recording"
      ? handsFree
        ? { text: "מקשיב… דברו", kind: "recording" }
        : { text: "מקליט… הקישו לסיום", kind: "recording" }
      : voiceMode === "speaking"
      ? handsFree
        ? { text: "משיב… דברו כדי לקטוע", kind: "speaking" }
        : { text: "משיב… הקישו כדי להשתיק", kind: "speaking" }
      : voiceMode === "processing"
      ? { text: "חושב…", kind: "processing" }
      : voiceMode === "listening"
      ? null /* static listening: no chip (it covered the app); the waves show it */
      : voiceError === "mic-denied"
      ? { text: "אין הרשאת מיקרופון", kind: "error" }
      : voiceError === "unsupported"
      ? { text: "הדפדפן לא תומך בהקלטה", kind: "error" }
      : voiceError === "network"
      ? { text: "תקלת רשת, נסו שוב", kind: "error" }
      : null;
  const HintIcon = hint ? HINT_ICONS[hint.kind] : null;

  const TITLES = {
    main: "מה תרצה לעשות?",
    nav: "ניווט",
    products: "תת-קטגוריות מוצרים",
    cheapest: "הסופר הזול ביותר לעגלה",
    compare: compareWithComplete
      ? "השלמה ומעבר לסופר הזול"
      : "השוואת מחירים בין סופרים",
    complete: "השלמת העגלה",
    complete7: "השלמה ומעבר לסופר הזול",
    find: "מצא מוצר במדף",
  };

  const runAction = (a) => {
    if (a.key === "a4") startOptimize();
    else if (a.key === "a5") {
      setCompareWithComplete(false);
      setView("compare");
    } else if (a.view) setView(a.view);
  };

  const sheet =
    open &&
    ReactDOM.createPortal(
      <div
        className={`ai-sheet__overlay${
          view === "cheapest" ? " ai-sheet__overlay--bare" : ""
        }${closing ? " is-closing" : ""}`}
        onClick={(e) => {
          if (e.target.classList.contains("ai-sheet__overlay")) close();
        }}
      >
        <div
          className={`ai-sheet${
            view === "cheapest" ? " ai-sheet--floating" : ""
          }${closing ? " is-closing" : ""}${sheetDragging ? " is-dragging" : ""}`}
          style={
            sheetDrag ? { transform: `translateY(${sheetDrag}px)` } : undefined
          }
          role="dialog"
          aria-modal={view === "cheapest" ? "false" : "true"}
          aria-label={TITLES[view]}
          dir="rtl"
        >
          {/* grip + header = the drag handle (pull down to dismiss) */}
          <div
            className="ai-sheet__handle"
            onPointerDown={onSheetHandleDown}
            onPointerMove={onSheetHandleMove}
            onPointerUp={onSheetHandleUp}
            onPointerCancel={onSheetHandleUp}
          >
            <div className="ai-sheet__grip" aria-hidden="true" />

            {view === "main" ? (
              <div className="ai-sheet__hero">
                <span className="ai-sheet__avatar" aria-hidden="true">
                  <RobotIcon />
                  <span className="ai-sheet__avatar-dot" />
                </span>
                <span className="ai-sheet__hero-text">
                  <span className="ai-sheet__title ai-sheet__title--hero">
                    מה תרצה לעשות?
                  </span>
                  <span className="ai-sheet__subtitle">
                    בחר פעולה, או דבר עם הרובוט
                  </span>
                </span>
                <button
                  type="button"
                  className="ai-sheet__close"
                  aria-label="סגור"
                  onClick={close}
                >
                  <IconClose />
                </button>
              </div>
            ) : (
              <div className="ai-sheet__header">
                <button
                  type="button"
                  className="ai-sheet__back"
                  aria-label="חזרה"
                  onClick={goBack}
                >
                  <IconChevronRight />
                </button>
                <span className="ai-sheet__title">{TITLES[view]}</span>
                <button
                  type="button"
                  className="ai-sheet__close"
                  aria-label="סגור"
                  onClick={close}
                >
                  <IconClose />
                </button>
              </div>
            )}
          </div>

          <div
            className="ai-sheet__view"
            key={view}
            onClickCapture={onViewClickCapture}
          >
          {/* ── Main: the action cards ── */}
          {view === "main" && (
            <>
              <div className="ai-sheet__grid">
                {ACTIONS.map((a, i) => (
                  <button
                    key={a.key}
                    type="button"
                    className={`ai-sheet__action ai-sheet__action--${a.tone}${
                      a.hero ? " ai-sheet__action--hero" : ""
                    }${a.wide ? " ai-sheet__action--wide" : ""}`}
                    style={{ "--i": i }}
                    onClick={() => runAction(a)}
                  >
                    <span className="ai-sheet__action-icon" aria-hidden="true">
                      <a.Icon />
                    </span>
                    <span className="ai-sheet__action-text">
                      <span className="ai-sheet__action-label">{a.label}</span>
                      <span className="ai-sheet__action-caption">
                        {a.caption}
                      </span>
                    </span>
                    {a.hero && (
                      <span className="ai-sheet__action-go" aria-hidden="true">
                        <IconChevronLeft />
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* the robot's gestures — a gentle reminder, not a tutorial */}
              <div className="ai-sheet__tips" aria-label="פקודות קוליות">
                <span className="ai-sheet__tip">
                  <IconHold />
                  <span>
                    <b>לחיצה ארוכה</b> על הרובוט - פקודה קולית
                  </span>
                </span>
                <span className="ai-sheet__tip">
                  <IconDoubleTap />
                  <span>
                    <b>הקשה כפולה</b> - שיחה רציפה
                  </span>
                </span>
                <span className="ai-sheet__tip">
                  <IconSpeaker />
                  <span>
                    <b>כשהוא מדבר</b> - בשיחה רציפה פשוט דברו (או "די"); אחרת
                    הקישו עליו
                  </span>
                </span>
              </div>
            </>
          )}

          {/* ── Navigation: pages ── */}
          {view === "nav" && (
            <ul className="ai-sheet__list ai-sheet__list--nav">
              {NAV_ITEMS.map(({ to, label, Icon, tone }, i) => (
                <li key={to} style={{ "--i": i }}>
                  <button
                    type="button"
                    className={`ai-sheet__item ai-sheet__item--nav ai-sheet__item--${tone}`}
                    onClick={() => goTo(to)}
                  >
                    <span className="ai-sheet__item-icon">
                      <Icon />
                    </span>
                    <span className="ai-sheet__item-label">{label}</span>
                    <span className="ai-sheet__chevron" aria-hidden="true">
                      <IconChevronLeft />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* ── Products: sub-categories grouped by category ── */}
          {view === "products" && (
            <div className="ai-sheet__groups">
              {allCategories.map((category, ci) => {
                const subs = all_sub_categories[ci] || [];
                if (!subs.length) return null;
                return (
                  <div className="ai-sheet__group" key={ci}>
                    <div className="ai-sheet__group-title">{category}</div>
                    <ul className="ai-sheet__list">
                      {subs.map((sub, si) => (
                        <li key={si}>
                          <button
                            type="button"
                            className="ai-sheet__item"
                            onClick={() => goToSubCategory(ci, si)}
                          >
                            <span className="ai-sheet__item-label">{sub}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Find a product on the shelf (action #8) ──
              Manual for now — the voice intent will call goToShelf later. */}
          {view === "find" && (
            <div className="ai-sheet__groups">
              <div className="ai-sheet__group-title">
                בחרו מוצר - נפתח את תת-הקטגוריה שלו ונגלול עד המדף
              </div>
              {!classificationsLoaded ? (
                <div className="ai-sheet__find-empty">טוען מוצרים…</div>
              ) : shelfTargets.length === 0 ? (
                <div className="ai-sheet__find-empty">אין מוצרים מסווגים</div>
              ) : (
                <ul className="ai-sheet__list">
                  {shelfTargets.map((target) => (
                    <li key={target.name}>
                      <button
                        type="button"
                        className="ai-sheet__item"
                        onClick={() => goToShelf(target)}
                      >
                        <span className="ai-sheet__item-label">{target.name}</span>
                        <span className="ai-sheet__chevron" aria-hidden="true">
                          <IconChevronLeft />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* ── Cheapest supermarket(s) for the current cart ── */}
          {view === "cheapest" && (
            <div className="ai-sheet__cheapest">
              {/* mode toggle */}
              <div className="ai-sheet__mode" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={cheapestMode === "immediate"}
                  className={`ai-sheet__mode-btn${
                    cheapestMode === "immediate" ? " is-active" : ""
                  }`}
                  onClick={() => setCheapestMode("immediate")}
                >
                  החלפה מיידית
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={cheapestMode === "display"}
                  className={`ai-sheet__mode-btn${
                    cheapestMode === "display" ? " is-active" : ""
                  }`}
                  onClick={() => setCheapestMode("display")}
                >
                  תצוגה ובחירה
                </button>
              </div>

              {/* IMMEDIATE — the single cheapest + one-tap replace */}
              {cheapestMode === "immediate" && (
                <>
                  {cheapest.status === "loading" && (
                    <div className="ai-sheet__cheapest-msg">
                      <span
                        className="ai-sheet__cheapest-spinner"
                        aria-hidden="true"
                      />
                      מחשב את הסופר הזול ביותר…
                    </div>
                  )}
                  {cheapest.status === "empty" && (
                    <div className="ai-sheet__cheapest-msg">
                      העגלה ריקה - הוסף מוצרים כדי למצוא את הסופר הזול ביותר.
                    </div>
                  )}
                  {cheapest.status === "error" && (
                    <div className="ai-sheet__cheapest-msg">
                      אירעה שגיאה בחישוב. נסה שוב.
                    </div>
                  )}
                  {cheapest.status === "done" && cheapestSupermarket && (
                    <>
                      <div className="ai-sheet__cheapest-card">
                        <div className="ai-sheet__cheapest-logo">
                          <SupermarketImage
                            supermarketName={cheapestSupermarket.name}
                          />
                        </div>
                        <div className="ai-sheet__cheapest-info">
                          <span className="ai-sheet__cheapest-name">
                            {cheapestSupermarket.name ||
                              `סופר #${cheapestSupermarket.supermarketID}`}
                          </span>
                          {(cheapestSupermarket.address ||
                            cheapestSupermarket.city) && (
                            <span className="ai-sheet__cheapest-addr">
                              {[
                                cheapestSupermarket.address,
                                cheapestSupermarket.city,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </span>
                          )}
                        </div>
                        {cheapest.price != null && (
                          <div className="ai-sheet__cheapest-price">
                            <span className="ai-sheet__cheapest-price-label">
                              סה״כ
                            </span>
                            <span className="ai-sheet__cheapest-price-value">
                              ₪{cheapest.price.toFixed(2)}
                            </span>
                          </div>
                        )}
                      </div>
                      {cheapest.count > 1 && (
                        <div className="ai-sheet__cheapest-note">
                          {cheapest.count - 1 === 1
                            ? "+ עוד סניף אחד באותו מחיר"
                            : `+ עוד ${cheapest.count - 1} סניפים באותו מחיר`}
                        </div>
                      )}
                      <button
                        type="button"
                        className="ai-sheet__cheapest-cta"
                        onClick={() =>
                          selectSupermarket(cheapestSupermarket.supermarketID)
                        }
                      >
                        החלף לסופר זה ועבור לעגלה
                      </button>
                    </>
                  )}
                </>
              )}

              {/* DISPLAY — ranked list; tap a supermarket to switch the cart */}
              {cheapestMode === "display" && (
                <>
                  {ranked.status === "loading" && (
                    <div className="ai-sheet__cheapest-msg">
                      <span
                        className="ai-sheet__cheapest-spinner"
                        aria-hidden="true"
                      />
                      מדרג את הסופרים הזולים…
                    </div>
                  )}
                  {ranked.status === "empty" && (
                    <div className="ai-sheet__cheapest-msg">
                      העגלה ריקה - הוסף מוצרים כדי לראות את הסופרים הזולים.
                    </div>
                  )}
                  {ranked.status === "error" && (
                    <div className="ai-sheet__cheapest-msg">
                      אירעה שגיאה בחישוב. נסה שוב.
                    </div>
                  )}
                  {ranked.status === "done" && (
                    <>
                      <ul className="ai-sheet__ranked">
                        {ranked.items.map((it, idx) => {
                          const sm = supermarketLookup.get(
                            String(it.supermarketID)
                          ) || { supermarketID: it.supermarketID };
                          return (
                            <li key={it.supermarketID}>
                              <button
                                type="button"
                                className="ai-sheet__ranked-row"
                                onClick={() =>
                                  selectSupermarket(it.supermarketID)
                                }
                              >
                                <span className="ai-sheet__ranked-rank">
                                  {idx + 1}
                                </span>
                                <span className="ai-sheet__ranked-logo">
                                  <SupermarketImage supermarketName={sm.name} />
                                </span>
                                <span className="ai-sheet__ranked-info">
                                  <span className="ai-sheet__ranked-name">
                                    {sm.name || `סופר #${sm.supermarketID}`}
                                  </span>
                                  {(sm.address || sm.city) && (
                                    <span className="ai-sheet__ranked-addr">
                                      {[sm.address, sm.city]
                                        .filter(Boolean)
                                        .join(" · ")}
                                    </span>
                                  )}
                                </span>
                                <span className="ai-sheet__ranked-price">
                                  ₪{Number(it.price).toFixed(2)}
                                </span>
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                      <div className="ai-sheet__cheapest-note">
                        לחיצה על סופר תחליף אליו את העגלה
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── Compare prices across a set of supermarkets (action #5 / #7) ── */}
          {view === "compare" && (
            <div className="ai-sheet__compare">
              <p className="ai-sheet__compare-hint">
                {compareWithComplete
                  ? "בחר קבוצת סופרים - נשלים את העגלה ונמצא בה את הסופר הזול ביותר."
                  : "בחר קבוצת סופרים - נמצא את העגלה הזולה ביותר ביניהם ונשווה מוצר-מול-מוצר, בדיוק כמו הייעול לסופר הנוכחי."}
              </p>
              <button
                type="button"
                className="ai-sheet__compare-opt"
                disabled={!talpiotSupermarkets.length}
                onClick={() =>
                  compareWithComplete
                    ? startCompleteCompare(talpiotSupermarkets)
                    : startCompare(talpiotSupermarkets)
                }
              >
                <span className="ai-sheet__compare-opt-main">
                  <span className="ai-sheet__compare-opt-title">
                    סופרי תלפיות
                  </span>
                  <span className="ai-sheet__compare-opt-sub">
                    {talpiotSupermarkets.length} סופרים באזור תלפיות והסביבה
                  </span>
                </span>
                <span className="ai-sheet__chevron" aria-hidden="true">
                  <IconChevronLeft />
                </span>
              </button>
              <button
                type="button"
                className="ai-sheet__compare-opt"
                disabled={!onlineSupermarkets.length}
                onClick={() =>
                  compareWithComplete
                    ? startCompleteCompare(onlineSupermarkets)
                    : startCompare(onlineSupermarkets)
                }
              >
                <span className="ai-sheet__compare-opt-main">
                  <span className="ai-sheet__compare-opt-title">
                    סופרים אונליין
                  </span>
                  <span className="ai-sheet__compare-opt-sub">
                    {onlineSupermarkets.length} סופרים עם משלוחים
                  </span>
                </span>
                <span className="ai-sheet__chevron" aria-hidden="true">
                  <IconChevronLeft />
                </span>
              </button>
              <button
                type="button"
                className="ai-sheet__compare-opt"
                onClick={() => setPickerOpen(true)}
              >
                <span className="ai-sheet__compare-opt-main">
                  <span className="ai-sheet__compare-opt-title">
                    בחירה מותאמת
                  </span>
                  <span className="ai-sheet__compare-opt-sub">
                    בחר רשתות וסניפים להשוואה
                  </span>
                </span>
                <span className="ai-sheet__chevron" aria-hidden="true">
                  <IconChevronLeft />
                </span>
              </button>
            </div>
          )}

          {/* ── Complete the cart (action #6) ── */}
          {view === "complete" && (
            <div className="ai-sheet__compare">
              {completeCartNames.length === 0 ? (
                <>
                  <p className="ai-sheet__compare-hint">
                    עדיין לא הגדרת "עגלה שלמה". בהגדרות בוחרים אילו מוצרים תמיד
                    צריכים להיות בעגלה, וכאן משלימים את מה שחסר.
                  </p>
                  <button
                    type="button"
                    className="ai-sheet__compare-opt"
                    onClick={() => goTo("/settings")}
                  >
                    <span className="ai-sheet__compare-opt-main">
                      <span className="ai-sheet__compare-opt-title">
                        להגדרת העגלה השלמה
                      </span>
                      <span className="ai-sheet__compare-opt-sub">
                        פתח את ההגדרות ובחר מוצרים
                      </span>
                    </span>
                    <span className="ai-sheet__chevron" aria-hidden="true">
                      <IconChevronLeft />
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <p className="ai-sheet__compare-hint">
                    {completeCartNames.length} מוצרים בעגלה השלמה. איך להשלים את
                    מה שחסר?
                  </p>
                  <button
                    type="button"
                    className="ai-sheet__compare-opt"
                    onClick={() => startComplete("cheapest")}
                  >
                    <span className="ai-sheet__compare-opt-main">
                      <span className="ai-sheet__compare-opt-title">
                        הזול ביותר ליחידת משקל
                      </span>
                      <span className="ai-sheet__compare-opt-sub">
                        הבחירה המשתלמת ביותר בסופר הנוכחי
                      </span>
                    </span>
                    <span className="ai-sheet__chevron" aria-hidden="true">
                      <IconChevronLeft />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ai-sheet__compare-opt"
                    onClick={() => startComplete("lastPurchased")}
                  >
                    <span className="ai-sheet__compare-opt-main">
                      <span className="ai-sheet__compare-opt-title">
                        האחרון שקנית
                      </span>
                      <span className="ai-sheet__compare-opt-sub">
                        לפי היסטוריית הקניות (גיבוי: הזול ביותר)
                      </span>
                    </span>
                    <span className="ai-sheet__chevron" aria-hidden="true">
                      <IconChevronLeft />
                    </span>
                  </button>
                </>
              )}
            </div>
          )}

          {/* ── Complete the cart + switch to the cheapest (action #7) ── */}
          {view === "complete7" && (
            <div className="ai-sheet__compare">
              {completeCartNames.length === 0 ? (
                <>
                  <p className="ai-sheet__compare-hint">
                    עדיין לא הגדרת "עגלה שלמה". הפעולה משלימה את מה שחסר בעגלה ואז
                    מוצאת עבורה את הסופר הזול ביותר - קודם צריך לבחור מוצרים
                    בהגדרות.
                  </p>
                  <button
                    type="button"
                    className="ai-sheet__compare-opt"
                    onClick={() => goTo("/settings")}
                  >
                    <span className="ai-sheet__compare-opt-main">
                      <span className="ai-sheet__compare-opt-title">
                        להגדרת העגלה השלמה
                      </span>
                      <span className="ai-sheet__compare-opt-sub">
                        פתח את ההגדרות ובחר מוצרים
                      </span>
                    </span>
                    <span className="ai-sheet__chevron" aria-hidden="true">
                      <IconChevronLeft />
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <p className="ai-sheet__compare-hint">
                    שלב 1 - איך להשלים את המוצרים החסרים? (אחר כך נבחר מול אילו
                    סופרים להשוות)
                  </p>
                  <button
                    type="button"
                    className="ai-sheet__compare-opt"
                    onClick={() => {
                      setCc7Strategy("cheapest");
                      setCompareWithComplete(true);
                      setView("compare");
                    }}
                  >
                    <span className="ai-sheet__compare-opt-main">
                      <span className="ai-sheet__compare-opt-title">
                        הזול ביותר ליחידת משקל
                      </span>
                      <span className="ai-sheet__compare-opt-sub">
                        השלמה לפי המחיר המשתלם ביותר
                      </span>
                    </span>
                    <span className="ai-sheet__chevron" aria-hidden="true">
                      <IconChevronLeft />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="ai-sheet__compare-opt"
                    onClick={() => {
                      setCc7Strategy("lastPurchased");
                      setCompareWithComplete(true);
                      setView("compare");
                    }}
                  >
                    <span className="ai-sheet__compare-opt-main">
                      <span className="ai-sheet__compare-opt-title">
                        האחרון שקנית
                      </span>
                      <span className="ai-sheet__compare-opt-sub">
                        השלמה לפי היסטוריית הקניות (גיבוי: הזול)
                      </span>
                    </span>
                    <span className="ai-sheet__chevron" aria-hidden="true">
                      <IconChevronLeft />
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
          </div>
        </div>
      </div>,
      document.getElementById("modal-root")
    );

  return (
    <>
      <nav
        className={`bottom-nav${
          voiceMode !== "idle"
            ? ` bottom-nav--voice bottom-nav--voice-${voiceMode}`
            : ""
        }`}
        aria-label="סרגל תחתון"
        ref={navRef}
      >
        <div className="bottom-nav__bar" aria-hidden="true" ref={barRef} />
        <div className="bottom-nav__voicebg" aria-hidden="true" ref={voicebgRef} />
        {hint && (
          <div
            className={`voice-hint voice-hint--${hint.kind}`}
            dir="rtl"
            role="status"
            key={hint.kind}
          >
            {HintIcon && (
              <span className="voice-hint__icon" aria-hidden="true">
                <HintIcon />
              </span>
            )}
            <span className="voice-hint__text">{hint.text}</span>
          </div>
        )}
        <VoiceWaves
          levelRef={voiceLevel}
          mode={voiceMode}
          active={voiceMode !== "idle"}
        />
        <button
          type="button"
          className={`bottom-nav__btn${
            voiceMode !== "idle" ? ` bottom-nav__btn--${voiceMode}` : ""
          }${open && !closing ? " is-open" : ""}`}
          aria-label="פעולות - הקשה לתפריט, הקשה כפולה לדיבור רציף, לחיצה ארוכה להקלטה, הקשה בזמן דיבור משתיקה"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-pressed={handsFree || recording}
          onPointerDown={onCoinPointerDown}
          onPointerUp={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onClick={onCoinClick}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="bottom-nav__ring" aria-hidden="true" />
          <span className="bottom-nav__face" aria-hidden="true">
            <RobotIcon className="bottom-nav__icon" />
          </span>
        </button>
      </nav>
      {sheet}
      {/* voice #9 — the AI-page drop-into-cart animation for an added product */}
      {voiceAdd && (
        <OperationModal
          key={voiceAdd.key}
          isOpen
          onClose={() => {
            clearTimeout(voiceAddTimerRef.current);
            setVoiceAdd(null);
          }}
        >
          <ProductAnimationAdd
            barcode={voiceAdd.barcode}
            amount={voiceAdd.amount}
          />
        </OperationModal>
      )}
      <CartOptimizeOverlay
        open={optimizing}
        onClose={() => setOptimizing(false)}
        onApply={applyOptimized}
        onResult={handleOptimizeResult}
      />
      <CartOptimizeOverlay
        open={comparing}
        mode="compare"
        candidateSupermarkets={compareCandidates}
        holdOpen={compareVoice}
        onClose={() => {
          setComparing(false);
          setCompareVoice(false);
          compareVoiceRef.current = null;
          pendingCompareRef.current = null;
        }}
        onApply={applyCompare}
        onResult={handleCompareResult}
      />
      <CartOptimizeOverlay
        open={completing}
        mode="complete"
        completeNames={completeCartNames}
        completeStrategy={completeStrategy}
        onClose={() => setCompleting(false)}
        onApply={applyComplete}
        onResult={handleCompleteResult}
      />
      <CartOptimizeOverlay
        open={completeComparing}
        mode="completeCompare"
        completeNames={completeCartNames}
        completeStrategy={cc7Strategy}
        candidateSupermarkets={cc7Candidates}
        onClose={() => setCompleteComparing(false)}
        onApply={applyCompleteCompare}
        onResult={handleCc7Result}
      />
      <SupermarketPickerSheet
        open={pickerOpen}
        supermarkets={allSupermarkets}
        onClose={() => setPickerOpen(false)}
        onConfirm={(supers) =>
          compareWithComplete
            ? startCompleteCompare(supers)
            : startCompare(supers)
        }
      />
    </>
  );
}
