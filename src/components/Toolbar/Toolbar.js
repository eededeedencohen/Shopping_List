import React, { useState, useEffect, useRef, useCallback } from "react";
import ReactDOM from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import SearchModal from "../SearchBar/SearchModal";
import { useCartTotals, useFullCart } from "../../hooks/appHooks";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { haptic } from "../../utils/haptics";
import { uiSound, primeUiSound } from "../../utils/uiSound";
import { BUILD_VERSION } from "../../buildInfo";
import "./Toolbar.css";

import { ReactComponent as ShoppingCartIcon } from "../Cart/Icons/shopping-cart.svg";
import { ReactComponent as GroceryIcon } from "./grocery2.svg";
import { ReactComponent as AiIcon } from "./robot.svg";
import { ReactComponent as PieChartIcon } from "./pie-chart.svg";
import { ReactComponent as HistoryIcon } from "./transaction-history.svg";
import { ReactComponent as ReceiptIcon } from "./wishlist.svg";
import { ReactComponent as BarcodeIcon } from "./barcode.svg";
import { ReactComponent as HomeIcon } from "./home.svg";
import {
  IconSearch,
  IconSettings,
  IconClose,
  IconChevron,
  IconServer,
  IconResearch,
} from "./ToolbarIcons";

/* ── Drawer navigation — grouped, each item carries its own hue (the same
   palette as the home-page tiles so the app reads as ONE system). ── */
const NAV_GROUPS = [
  {
    title: "ראשי",
    items: [
      { to: "/", label: "בית", hint: "המסך הראשי", Icon: HomeIcon, tone: "blue" },
      { to: "/products", label: "מוצרים", hint: "עיון והוספה לעגלה", Icon: GroceryIcon, tone: "green" },
      { to: "/cart", label: "עגלת קניות", hint: "ניהול העגלה", Icon: ShoppingCartIcon, tone: "sky", badge: true },
      { to: "/ai", label: "עוזר AI", hint: "שאל, השווה, ייעל", Icon: AiIcon, tone: "teal" },
    ],
  },
  {
    title: "כלים",
    items: [
      { to: "/image-parser", label: "סריקת קבלות", hint: "צילום קבלה להיסטוריה", Icon: ReceiptIcon, tone: "amber" },
      { to: "/advanced-stats", label: "סטטיסטיקות", hint: "גרפים וניתוח הוצאות", Icon: PieChartIcon, tone: "pink" },
      { to: "/history", label: "היסטוריית קניות", hint: "קניות קודמות", Icon: HistoryIcon, tone: "violet" },
      { to: "/barcode-scanner", label: "סורק ברקוד", hint: "סריקת מוצר במצלמה", Icon: BarcodeIcon, tone: "slate" },
      { to: "/ai-history", label: "מחקר AI", hint: "כל השיחות עם הרובוט — סימון והערות", Icon: IconResearch, tone: "indigo" },
    ],
  },
  {
    title: "מתקדם",
    items: [
      { to: "/products-server", label: "מוצרים (שרת)", hint: "קטלוג ישירות מהשרת", Icon: IconServer, tone: "indigo", stroke: true },
    ],
  },
];

const SWIPE_CLOSE_PX = 72; // drag the panel this far to the right → close

function formatPrice(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return null;
  return `₪${n.toFixed(2).replace(/\.00$/, "")}`;
}

function Toolbar() {
  const { totalAmount, totalPrice } = useCartTotals();
  const { fullCart } = useFullCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  useBodyScrollLock(isOpen);

  /* settings is a real page (hub + sub-pages) so the phone's back button
     works inside it; the route change also closes the drawer */
  const openSettings = () => {
    haptic("selection");
    uiSound("select");
    if (location.pathname !== "/settings") navigate("/settings");
  };

  /* ── cart badge: pop + colour flash (green when adding, red when removing) ── */
  const [pop, setPop] = useState(false);
  const [direction, setDirection] = useState(null); // 'up' | 'down' | null
  const prevAmountRef = useRef(null);
  useEffect(() => {
    if (prevAmountRef.current === null) {
      prevAmountRef.current = totalAmount; // skip the first run (no flash on load)
      return undefined;
    }
    const prev = prevAmountRef.current;
    prevAmountRef.current = totalAmount;
    if (totalAmount === prev || totalAmount === 0) return undefined;
    setDirection(totalAmount > prev ? "up" : "down");
    setPop(true);
    const t = setTimeout(() => {
      setPop(false);
      setDirection(null);
    }, 320);
    return () => clearTimeout(t);
  }, [totalAmount]);

  /* ── drawer open / close ── */
  const isOpenRef = useRef(false);
  isOpenRef.current = isOpen;
  const openDrawer = useCallback(() => {
    primeUiSound();
    haptic("light");
    uiSound("open");
    setIsOpen(true);
  }, []);
  const closeDrawer = useCallback(() => {
    if (isOpenRef.current) uiSound("close");
    setIsOpen(false);
  }, []);
  const toggleDrawer = () => (isOpen ? closeDrawer() : openDrawer());

  // any route change closes the drawer (links inside it, the bottom nav, back…)
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Escape closes
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeDrawer]);

  /* ── swipe-to-close (drag the panel to the right) ── */
  const panelRef = useRef(null);
  const dragRef = useRef({ active: false, x0: 0, y0: 0, dx: 0, t0: 0, axis: null });
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);

  const onPanelPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragRef.current = { active: true, x0: e.clientX, y0: e.clientY, dx: 0, t0: Date.now(), axis: null };
  };
  const onPanelPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.axis) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      d.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (d.axis === "x") setDragging(true);
    }
    if (d.axis !== "x") return;
    d.dx = Math.max(0, dx); // only towards the right edge (where it came from)
    setDragX(d.dx);
  };
  const swallowClickRef = useRef(false);
  const endDrag = () => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    const fast = d.dx > 28 && Date.now() - d.t0 < 220;
    setDragging(false);
    setDragX(0);
    if (d.axis === "x" && d.dx > 10) {
      // a horizontal drag must not also "click" the link under the finger
      swallowClickRef.current = true;
      setTimeout(() => {
        swallowClickRef.current = false;
      }, 0);
    }
    if (d.axis === "x" && (d.dx > SWIPE_CLOSE_PX || fast)) {
      haptic("light");
      closeDrawer();
    }
  };
  const onPanelClickCapture = (e) => {
    if (swallowClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const onNavItem = () => {
    haptic("selection");
    uiSound("select");
    closeDrawer();
  };

  const storeName = fullCart && fullCart.supermarket && fullCart.supermarket.name;
  const priceText = formatPrice(
    fullCart && typeof fullCart.totalPrice === "number" ? fullCart.totalPrice : totalPrice
  );

  const drawer = ReactDOM.createPortal(
    <div
      className={`drawer-root${isOpen ? " is-open" : ""}`}
      dir="rtl"
      aria-hidden={!isOpen}
    >
      <div className="drawer-veil" onClick={closeDrawer} />
      <aside
        ref={panelRef}
        className={`drawer-panel${dragging ? " is-dragging" : ""}`}
        style={dragX ? { transform: `translateX(${dragX}px)` } : undefined}
        role="dialog"
        aria-modal="true"
        aria-label="תפריט ראשי"
        onPointerDown={onPanelPointerDown}
        onPointerMove={onPanelPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClickCapture={onPanelClickCapture}
      >
        <div className="drawer-head">
          <div className="drawer-brand">
            <span className="drawer-brand__mark" aria-hidden="true">
              <ShoppingCartIcon />
            </span>
            <span className="drawer-brand__text">
              <span className="drawer-brand__title">Smart Cart</span>
              <span className="drawer-brand__sub">העוזר החכם לקניות</span>
            </span>
          </div>
          <button
            type="button"
            className="drawer-close"
            aria-label="סגירת התפריט"
            onClick={closeDrawer}
          >
            <IconClose />
          </button>
        </div>

        <Link to="/cart" className="drawer-cart" onClick={onNavItem} style={{ "--i": 0 }}>
          <span className="drawer-cart__icon" aria-hidden="true">
            <ShoppingCartIcon />
            {totalAmount > 0 && <span className="drawer-cart__count">{totalAmount}</span>}
          </span>
          <span className="drawer-cart__text">
            <span className="drawer-cart__title">
              {totalAmount > 0 ? "העגלה שלך" : "העגלה ריקה"}
            </span>
            <span className="drawer-cart__meta">
              {totalAmount > 0
                ? [
                    `${totalAmount} פריטים`,
                    priceText,
                    storeName,
                  ]
                    .filter(Boolean)
                    .join(" · ")
                : "הוסיפו מוצרים מהקטלוג"}
            </span>
          </span>
          <span className="drawer-cart__chev" aria-hidden="true">
            <IconChevron />
          </span>
        </Link>

        <nav className="drawer-nav" aria-label="ניווט">
          {NAV_GROUPS.map((group, gi) => (
            <div className="drawer-group" key={group.title}>
              <div className="drawer-group__title">{group.title}</div>
              <ul className="drawer-list">
                {group.items.map(({ to, label, hint, Icon, tone, badge, stroke }, ii) => {
                  const active = location.pathname === to;
                  return (
                    <li key={to}>
                      <Link
                        to={to}
                        className={`drawer-item drawer-item--${tone}${active ? " is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                        onClick={onNavItem}
                        style={{ "--i": gi * 4 + ii + 1 }}
                      >
                        <span className={`drawer-item__icon${stroke ? " drawer-item__icon--stroke" : ""}`} aria-hidden="true">
                          <Icon />
                        </span>
                        <span className="drawer-item__text">
                          <span className="drawer-item__label">{label}</span>
                          <span className="drawer-item__hint">{hint}</span>
                        </span>
                        {badge && totalAmount > 0 && (
                          <span className="drawer-item__badge">{totalAmount}</span>
                        )}
                        <span className="drawer-item__chev" aria-hidden="true">
                          <IconChevron />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="drawer-foot">
          <button
            type="button"
            className="drawer-foot__settings"
            onClick={() => {
              setIsOpen(false);
              openSettings();
            }}
          >
            <IconSettings />
            <span>הגדרות</span>
          </button>
          <span className="drawer-foot__version">גרסה {BUILD_VERSION}</span>
        </div>
      </aside>
    </div>,
    document.getElementById("modal-root")
  );

  return (
    <nav className="toolbar" dir="rtl">
      {/* ☰ — three bars that fold into an ✕ while the drawer is open */}
      <button
        type="button"
        className={`tb-btn tb-menu hamburger-menu${isOpen ? " is-open" : ""}`}
        aria-label={isOpen ? "סגירת התפריט" : "פתיחת התפריט"}
        aria-expanded={isOpen}
        onClick={toggleDrawer}
      >
        <span className="tb-menu__bars" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
      </button>

      <button
        type="button"
        className="tb-btn search-icon"
        aria-label="חיפוש מוצר"
        onClick={() => {
          haptic("selection");
          setIsModalOpen(true);
        }}
      >
        <IconSearch />
      </button>

      <button
        type="button"
        className="tb-btn settings-link"
        aria-label="הגדרות"
        onClick={openSettings}
      >
        <IconSettings className="settings-icon" />
      </button>

      <span className="tb-spacer" aria-hidden="true" />

      <Link
        to="/cart"
        className="tb-cart"
        aria-label={totalAmount > 0 ? `עגלת קניות, ${totalAmount} פריטים` : "עגלת קניות"}
        onClick={() => haptic("selection")}
      >
        <span className="cart-icon">
          <ShoppingCartIcon className="cart-icon__svg" aria-hidden="true" />
          {totalAmount > 0 && (
            <span
              className={`cart-badge ${pop ? "pop" : ""} ${
                direction ? `cart-badge--${direction}` : ""
              } ${String(totalAmount).length >= 3 ? "cart-badge--small" : ""}`}
            >
              {totalAmount}
            </span>
          )}
        </span>
      </Link>

      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SearchBar closeModal={() => setIsModalOpen(false)} />
      </SearchModal>
      {drawer}
    </nav>
  );
}

export default Toolbar;
