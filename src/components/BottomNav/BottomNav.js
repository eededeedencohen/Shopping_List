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
import { useProductList, useCartActions } from "../../hooks/appHooks";
import { useAiSettings } from "../../context/AiSettingsContext";
import { useCart } from "../../context/CartContext2";
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
  { key: "a4", label: "פעולה מספר 4" },
  { key: "a5", label: "פעולה מספר 5" },
];

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
  } = useProductList();
  const { cart } = useCart();
  const { allSupermarkets } = useSupermarkets();
  const { replaceSupermarket } = useCartActions();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState("main"); // "main" | "nav" | "products" | "cheapest"
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
    setOpen(true);
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
  const performCommand = async (cmd) => {
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
  } = useVoiceCommand({
    pages: navPages,
    categories: allCategories,
    subCategories: all_sub_categories,
    ttsLanguage,
    ttsVoice,
    micThreshold,
    onCommand: performCommand,
  });

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
                    onClick={() => a.view && setView(a.view)}
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
    </>
  );
}
