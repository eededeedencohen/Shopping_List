import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import "./BottomNav.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import useVoiceCommand from "../../hooks/useVoiceCommand";
import { useProductList } from "../../hooks/appHooks";
import { useAiSettings } from "../../context/AiSettingsContext";

import { ReactComponent as RobotIcon } from "../Toolbar/robot.svg";
import { ReactComponent as HomeIcon } from "../Toolbar/home.svg";
import { ReactComponent as GroceryIcon } from "../Toolbar/grocery2.svg";
import { ReactComponent as CartIcon } from "../Cart/Icons/shopping-cart.svg";
import { ReactComponent as HistoryIcon } from "../Toolbar/transaction-history.svg";
import { ReactComponent as ReceiptIcon } from "../Toolbar/wishlist.svg";
import { ReactComponent as PieChartIcon } from "../Toolbar/pie-chart.svg";
import { ReactComponent as BarcodeIcon } from "../Toolbar/barcode.svg";

/* The 5 actions shown in the AI action sheet.
   - "ניווט"        → expands to the navigation sub-categories (pages).
   - "פעולה מספר 2" → expands to the products page sub-categories.
   - 2 remaining are placeholders for now. */
const ACTIONS = [
  { key: "nav", label: "ניווט", view: "nav" },
  { key: "products", label: "פעולה מספר 2", view: "products" },
  { key: "a3", label: "פעולה מספר 3" },
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

  const [open, setOpen] = useState(false);
  const [view, setView] = useState("main"); // "main" | "nav" | "products"
  useBodyScrollLock(open);

  const close = useCallback(() => setOpen(false), []);

  const openSheet = () => {
    setView("main");
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

  /* ── Voice command (long-press the coin) ──────────────────────────────
     Long-press starts recording; a subsequent tap stops + sends it. The
     reply language/voice are the shared AI settings (chosen in Settings). */
  const aiSettings = useAiSettings();
  const ttsLanguage = (aiSettings && aiSettings.settings.ttsLanguage) || "he";
  const ttsVoice = (aiSettings && aiSettings.settings.ttsVoice) || "";

  /* Perform the action the server resolved from the voice command. */
  const performCommand = (cmd) => {
    if (!cmd) return;
    if (cmd.actionType === "navigate" && cmd.route) {
      goTo(cmd.route);
    } else if (
      cmd.actionType === "open_subcategory" &&
      Number.isInteger(cmd.categoryIndex) &&
      Number.isInteger(cmd.subIndex)
    ) {
      goToSubCategory(cmd.categoryIndex, cmd.subIndex);
    }
    /* "none" → nothing to do; the spoken reply already played. */
  };

  const navPages = NAV_ITEMS.map((n, index) => ({
    index,
    label: n.label,
    route: n.to,
  }));

  const {
    state: voiceState,
    error: voiceError,
    startRecording,
    stopRecording,
  } = useVoiceCommand({
    pages: navPages,
    categories: allCategories,
    subCategories: all_sub_categories,
    ttsLanguage,
    ttsVoice,
    onCommand: performCommand,
  });

  const LONG_PRESS_MS = 450;
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);
  const downWhileRecording = useRef(false);

  const onCoinPointerDown = (e) => {
    if (voiceState === "recording") {
      // a second press while recording → the next pointerup stops it
      downWhileRecording.current = true;
      return;
    }
    if (voiceState !== "idle") return; // "starting" / "processing" → ignore
    downWhileRecording.current = false;
    longPressFired.current = false;
    try {
      if (e.currentTarget.setPointerCapture)
        e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
    clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      startRecording();
    }, LONG_PRESS_MS);
  };

  const onCoinPointerUp = () => {
    clearTimeout(longPressTimer.current);
    if (downWhileRecording.current) {
      downWhileRecording.current = false;
      stopRecording();
      return;
    }
    if (longPressFired.current) {
      // released the initiating long-press → keep recording until next tap
      longPressFired.current = false;
      return;
    }
    if (voiceState === "idle") openSheet(); // short tap → open the action sheet
  };

  const onCoinPointerCancel = () => {
    clearTimeout(longPressTimer.current);
  };

  // clear any pending long-press timer on unmount
  useEffect(() => () => clearTimeout(longPressTimer.current), []);

  const recording = voiceState === "recording" || voiceState === "starting";
  const voiceHint = recording
    ? "🎙️ מקליט… הקש לסיום"
    : voiceState === "processing"
    ? "מעבד…"
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
  };

  const sheet =
    open &&
    ReactDOM.createPortal(
      <div
        className="ai-sheet__overlay"
        onClick={(e) => {
          if (e.target.classList.contains("ai-sheet__overlay")) close();
        }}
      >
        <div
          className="ai-sheet"
          role="dialog"
          aria-modal="true"
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
        </div>
      </div>,
      document.getElementById("modal-root")
    );

  return (
    <>
      <nav className="bottom-nav" aria-label="סרגל תחתון">
        <div className="bottom-nav__bar" aria-hidden="true" />
        {voiceHint && (
          <div className="voice-hint" dir="rtl" role="status">
            {voiceHint}
          </div>
        )}
        <button
          type="button"
          className={`bottom-nav__btn${
            recording ? " bottom-nav__btn--recording" : ""
          }${voiceState === "processing" ? " bottom-nav__btn--processing" : ""}`}
          aria-label="פעולות — לחיצה ארוכה להקלטה קולית"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-pressed={recording}
          onPointerDown={onCoinPointerDown}
          onPointerUp={onCoinPointerUp}
          onPointerCancel={onCoinPointerCancel}
          onContextMenu={(e) => e.preventDefault()}
        >
          <RobotIcon className="bottom-nav__icon" aria-hidden="true" />
        </button>
      </nav>
      {sheet}
    </>
  );
}
