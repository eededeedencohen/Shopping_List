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
import CartOptimizeOverlay from "../CartOptimizeOverlay/CartOptimizeOverlay";
import SupermarketPickerSheet from "./SupermarketPickerSheet";
import {
  useProductList,
  usePriceMap,
  useCartActions,
} from "../../hooks/appHooks";
import { useAiSettings } from "../../context/AiSettingsContext";
import { useCart } from "../../context/CartContext2";
import { useCompleteCartPreferences } from "../../context/CompleteCartPreferencesContext";
import { useSupermarkets } from "../../hooks/optimizationHooks";
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

/* The 5 actions shown in the AI action sheet.
   - "ניווט"                    → expands to the navigation sub-categories (pages).
   - "פעולה מספר 2"             → expands to the products page sub-categories.
   - "הסופר הזול ביותר לעגלה"   → computes & shows the cheapest supermarket.
   - 2 remaining are placeholders for now. */
const ACTIONS = [
  { key: "nav", label: "ניווט", view: "nav" },
  { key: "products", label: "פעולה מספר 2", view: "products" },
  { key: "cheapest", label: "הסופר הזול ביותר לעגלה", view: "cheapest" },
  { key: "a4", label: "ייעל את העגלה לסופר הנוכחי" },
  { key: "a5", label: "השווה מחירים בין סופרים", view: "compare" },
  { key: "a6", label: "השלם את העגלה", view: "complete" },
  { key: "a7", label: "השלם ועבור לסופר הזול", view: "complete7" },
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
  { to: "/", label: "בית", Icon: HomeIcon },
  { to: "/products", label: "מוצרים", Icon: GroceryIcon },
  { to: "/cart", label: "עגלת קניות", Icon: CartIcon },
  { to: "/history", label: "היסטוריית קניות", Icon: HistoryIcon },
  { to: "/image-parser", label: "סריקת קבלות", Icon: ReceiptIcon },
  { to: "/advanced-stats", label: "סטטיסטיקות", Icon: PieChartIcon },
  { to: "/barcode-scanner", label: "סורק ברקוד", Icon: BarcodeIcon },
  { to: "/ai", label: "עוזר AI", Icon: RobotIcon },
];

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
      ? "I went over every product in your cart — they're all already at the best price, nothing to optimize."
      : "עברתי על כל המוצרים בעגלה, וכולם כבר במחיר הטוב ביותר — אין מה לייעל.";
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
  const { allSupermarkets } = useSupermarkets();
  const { replaceSupermarket } = useCartActions();
  const { completeCartNames } = useCompleteCartPreferences();

  const [open, setOpen] = useState(false);
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

  const close = useCallback(() => setOpen(false), []);

  const openSheet = () => {
    setView("main");
    // fresh state for a manual open so action #3 re-fetches
    setCheapestMode("immediate");
    setCheapest({ status: "idle" });
    setRanked({ status: "idle" });
    setCompareWithComplete(false);
    setOpen(true);
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
     cart to that store. `supers` is the resolved supermarket objects. */
  const startCompare = (supers) => {
    if (!supers || !supers.length) return;
    close();
    setPickerOpen(false);
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
                                          (so the user can retry with context). */
  const performCommand = async (cmd, transcript) => {
    // Voice → optimize the cart ("תחליף לי את המוצרים למשתלמים יותר", "תהפוך את
    // העגלה לאופטימלית", "תייעל את העגלה"). Primary path is the server intent
    // (optimize_cart); the transcript keyword-match is a safety net that covers a
    // mis-classification or a not-yet-redeployed NLU. Kept narrow so it never
    // collides with the cheapest-SUPERMARKET intents (which don't mention מוצר).
    const t = (transcript || "").replace(/["'.,!?]/g, "");
    const optimizeIntent =
      (cmd && cmd.actionType === "optimize_cart") ||
      /אופטימ|ייעל|משתלמ|תחליף.*מוצר|מוצר.*(משתלמ|זול)/.test(t);
    if (optimizeIntent) {
      startOptimize(true);
      return { history: "clear" };
    }

    if (!cmd) return { history: "keep" };

    switch (cmd.actionType) {
      case "navigate": {
        if (!cmd.route) return { history: "keep" };
        goTo(cmd.route);
        return { history: "clear" };
      }

      case "open_subcategory": {
        if (
          !Number.isInteger(cmd.categoryIndex) ||
          !Number.isInteger(cmd.subIndex)
        )
          return { history: "keep" };
        goToSubCategory(cmd.categoryIndex, cmd.subIndex);
        return { history: "clear" };
      }

      case "replace_cheapest": {
        const products = (cart && cart.products) || [];
        if (!products.length) return { history: "keep" };
        try {
          const res = await getCheapestSupermarketIDsByCart(products);
          const ids = (res && res.data && res.data.supermarketIDs) || [];
          if (!ids.length) return { history: "keep" };
          selectSupermarket(ids[0]);
          return { history: "clear" };
        } catch (e) {
          return { history: "keep" };
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
        if (!items.length) return { history: "keep" };

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
        if (!chosen) return { history: "keep" };

        selectSupermarket(chosen.supermarketID);
        return { history: "clear" };
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
    speak,
  } = useVoiceCommand({
    pages: navPages,
    categories: allCategories,
    subCategories: all_sub_categories,
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

  /* ── Coin gestures ───────────────────────────────────────────────────
     • long-press            → single-shot recording (tap again to stop & send)
     • double-tap            → enter hands-free continuous mode
     • single tap (idle)     → open the action sheet
     • single tap (hands-free / recording) → exit / stop
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
    if (voiceState !== "idle" || handsFree) return; // arm long-press only from idle
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      startRecording();
    }, LONG_PRESS_MS);
  };

  const cancelLongPress = () => clearTimeout(longPressTimer.current);

  const onCoinClick = () => {
    if (longPressFired.current) {
      // the press that just ended was a long-press (recording started) → not a tap
      longPressFired.current = false;
      return;
    }
    if (handsFree) {
      stopHandsFree(); // a single tap exits hands-free mode
      return;
    }
    if (voiceState === "recording" || voiceState === "starting") {
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
      startHandsFree();
    }
  };

  // clear any pending timers on unmount
  useEffect(
    () => () => {
      clearTimeout(longPressTimer.current);
      clearTimeout(tapTimer.current);
    },
    []
  );

  const recording = voiceMode === "recording";
  const voiceHint =
    voiceState === "starting"
      ? "🎙️ פותח מיקרופון…"
      : voiceMode === "recording"
      ? handsFree
        ? "🎧 מקשיב… דבר"
        : "🎙️ מקליט… הקש לסיום"
      : voiceMode === "speaking"
      ? "🔊 משיב…"
      : voiceMode === "processing"
      ? "מעבד…"
      : voiceMode === "listening"
      ? "" /* static listening: no chip (it covered the app); the waves show it */
      : voiceError === "mic-denied"
      ? "אין הרשאת מיקרופון"
      : voiceError === "unsupported"
      ? "הדפדפן לא תומך בהקלטה"
      : voiceError === "network"
      ? "תקלת רשת, נסה שוב"
      : "";

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
  };

  const sheet =
    open &&
    ReactDOM.createPortal(
      <div
        className={`ai-sheet__overlay${
          view === "cheapest" ? " ai-sheet__overlay--bare" : ""
        }`}
        onClick={(e) => {
          if (e.target.classList.contains("ai-sheet__overlay")) close();
        }}
      >
        <div
          className={`ai-sheet${
            view === "cheapest" ? " ai-sheet--floating" : ""
          }`}
          role="dialog"
          aria-modal={view === "cheapest" ? "false" : "true"}
          aria-label={TITLES[view]}
          dir="rtl"
        >
          <div className="ai-sheet__grip" aria-hidden="true" />

          <div className="ai-sheet__header">
            {view !== "main" ? (
              <button
                type="button"
                className="ai-sheet__back"
                aria-label="חזרה"
                onClick={() => setView("main")}
              >
                ›
              </button>
            ) : (
              <span aria-hidden="true" />
            )}
            <span className="ai-sheet__title">{TITLES[view]}</span>
            <button
              type="button"
              className="ai-sheet__close"
              aria-label="סגור"
              onClick={close}
            >
              ✕
            </button>
          </div>

          {/* ── Main: the 5 actions ── */}
          {view === "main" && (
            <ul className="ai-sheet__list">
              {ACTIONS.map((a) => (
                <li key={a.key}>
                  <button
                    type="button"
                    className="ai-sheet__item"
                    onClick={() => {
                      if (a.key === "a4") startOptimize();
                      else if (a.key === "a5") {
                        setCompareWithComplete(false);
                        setView("compare");
                      } else if (a.view) setView(a.view);
                    }}
                  >
                    <span className="ai-sheet__item-label">{a.label}</span>
                    {a.view && (
                      <span className="ai-sheet__chevron" aria-hidden="true">
                        ‹
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* ── Navigation: pages ── */}
          {view === "nav" && (
            <ul className="ai-sheet__list ai-sheet__list--nav">
              {NAV_ITEMS.map(({ to, label, Icon }) => (
                <li key={to}>
                  <button
                    type="button"
                    className="ai-sheet__item ai-sheet__item--nav"
                    onClick={() => goTo(to)}
                  >
                    <span className="ai-sheet__item-icon">
                      <Icon />
                    </span>
                    <span className="ai-sheet__item-label">{label}</span>
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
                      העגלה ריקה — הוסף מוצרים כדי למצוא את הסופר הזול ביותר.
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
                      העגלה ריקה — הוסף מוצרים כדי לראות את הסופרים הזולים.
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
                  ? "בחר קבוצת סופרים — נשלים את העגלה ונמצא בה את הסופר הזול ביותר."
                  : "בחר קבוצת סופרים — נמצא את העגלה הזולה ביותר ביניהם ונשווה מוצר-מול-מוצר, בדיוק כמו הייעול לסופר הנוכחי."}
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
                  ‹
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
                  ‹
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
                  ‹
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
                      ‹
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
                      ‹
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
                      ‹
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
                    מוצאת עבורה את הסופר הזול ביותר — קודם צריך לבחור מוצרים
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
                      ‹
                    </span>
                  </button>
                </>
              ) : (
                <>
                  <p className="ai-sheet__compare-hint">
                    שלב 1 — איך להשלים את המוצרים החסרים? (אחר כך נבחר מול אילו
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
                      ‹
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
                      ‹
                    </span>
                  </button>
                </>
              )}
            </div>
          )}
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
      >
        <div className="bottom-nav__bar" aria-hidden="true" />
        <div className="bottom-nav__voicebg" aria-hidden="true" />
        {voiceHint && (
          <div className="voice-hint" dir="rtl" role="status">
            {voiceHint}
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
          }`}
          aria-label="פעולות — הקשה לתפריט, הקשה כפולה לדיבור רציף, לחיצה ארוכה להקלטה"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-pressed={handsFree || recording}
          onPointerDown={onCoinPointerDown}
          onPointerUp={cancelLongPress}
          onPointerCancel={cancelLongPress}
          onClick={onCoinClick}
          onContextMenu={(e) => e.preventDefault()}
        >
          <RobotIcon className="bottom-nav__icon" aria-hidden="true" />
        </button>
      </nav>
      {sheet}
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
        onClose={() => setComparing(false)}
        onApply={applyCompare}
      />
      <CartOptimizeOverlay
        open={completing}
        mode="complete"
        completeNames={completeCartNames}
        completeStrategy={completeStrategy}
        onClose={() => setCompleting(false)}
        onApply={applyComplete}
      />
      <CartOptimizeOverlay
        open={completeComparing}
        mode="completeCompare"
        completeNames={completeCartNames}
        completeStrategy={cc7Strategy}
        candidateSupermarkets={cc7Candidates}
        onClose={() => setCompleteComparing(false)}
        onApply={applyCompleteCompare}
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
