import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import "./BottomNav.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { useProductList } from "../../hooks/appHooks";

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
        <button
          type="button"
          className="bottom-nav__btn"
          aria-label="פעולות"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={openSheet}
        >
          <RobotIcon className="bottom-nav__icon" aria-hidden="true" />
        </button>
      </nav>
      {sheet}
    </>
  );
}
