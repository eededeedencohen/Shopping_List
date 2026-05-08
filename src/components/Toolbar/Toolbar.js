import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import SearchModal from "../SearchBar/SearchModal";
import SettingsModal from "../Settings/SettingsModal";
import { useCartTotals } from "../../hooks/appHooks";
import useVibrate from "../../hooks/useVibrate";
import "./Toolbar.css";

import SearchIcon from "./search.svg";
import { ReactComponent as ShoppingCartIcon } from "../Cart/Icons/shopping-cart.svg";
import { ReactComponent as GroceryIcon2 } from "./grocery2.svg";
import { ReactComponent as AiIcon2 } from "./robot.svg";
import { ReactComponent as PieChartIcon } from "./pie-chart.svg";
import { ReactComponent as TransactionHistoryIcon } from "./transaction-history.svg";
import { ReactComponent as Voice2Icon } from "./voice-bot.svg";
import { ReactComponent as WishlistIcon } from "./wishlist.svg";
import { ReactComponent as EditIcon } from "./editing.svg";
import { ReactComponent as DataClassificationIcon } from "./data-classification.svg";
import { ReactComponent as BarcodeIcon} from "./barcode.svg";
import { ReactComponent as VibrationIcon } from "./waves.svg";
import { ReactComponent as ArchitectureIcon } from "./architecture.svg";
import { ReactComponent as HomeIcon } from "./home.svg";
function Toolbar() {
  const { totalAmount } = useCartTotals(); // ← כמות בעגלה
  const [selectedPage, setSelectedPage] = useState(window.location.pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const vibrate = useVibrate();

  /* אפקט פופ + פלאש צבע (ירוק בהוספה, אדום בהורדה) */
  const [pop, setPop] = useState(false);
  const [direction, setDirection] = useState(null); // 'up' | 'down' | null
  const prevAmountRef = useRef(null);
  useEffect(() => {
    // דילוג על הריצה הראשונה כדי לא להבהב בטעינה
    if (prevAmountRef.current === null) {
      prevAmountRef.current = totalAmount;
      return;
    }

    const prev = prevAmountRef.current;
    prevAmountRef.current = totalAmount;

    if (totalAmount === prev || totalAmount === 0) return;

    setDirection(totalAmount > prev ? "up" : "down");
    setPop(true);

    const t = setTimeout(() => {
      setPop(false);
      setDirection(null);
    }, 320);
    return () => clearTimeout(t);
  }, [totalAmount]);

  /* ניווט */
  const toggleDrawer = () => {
    // 👈 שימוש פשוט ונוח בפונקציית הרטט
    vibrate(50); 
    setIsOpen(!isOpen);
  };
  const closeDrawer = () => isOpen && setIsOpen(false);
  const handleNavClick = (path) => {
    setSelectedPage(path);
    closeDrawer();
  };
  const handleCartClick = () => {
    setSelectedPage("");
    closeDrawer();
  };

  return (
    <nav className="toolbar">
      {/* חיפוש */}
      <div className="search-icon">
        <img
          src={SearchIcon}
          alt="Search"
          onClick={() => setIsModalOpen(true)}
        />
      </div>
      <SearchModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <SearchBar closeModal={() => setIsModalOpen(false)} />
      </SearchModal>

      {/* המבורגר */}
      <div className="hamburger-menu" onClick={toggleDrawer}>
        &#9776;
      </div>

      {/* הגדרות */}
      <button
        type="button"
        className="settings-link"
        onClick={() => setIsSettingsModalOpen(true)}
        aria-label="הגדרות"
      >
        <svg
          className="settings-icon"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* עגלה */}
      <Link to="/cart" onClick={handleCartClick}>
        <div className="cart-icon">
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
        </div>
      </Link>

      {/* Drawer */}
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="routes-icons">
          {/* Home */}
          <Link to="/" onClick={() => handleNavClick("/")}>
            <div
              className={`nav-item ${
                selectedPage === "/" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <HomeIcon className="svg-icon" />
              </div>
              <h1>Home</h1>
            </div>
          </Link>

          {/* Products */}
          <Link to="/products" onClick={() => handleNavClick("/products")}>
            <div
              className={`nav-item ${
                selectedPage === "/products" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <GroceryIcon2 className="svg-icon" />
              </div>
              <h1>Products</h1>
            </div>
          </Link>

          {/* Products Server */}
          <Link to="/products-server" onClick={() => handleNavClick("/products-server")}>
            <div
              className={`nav-item ${
                selectedPage === "/products-server" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <GroceryIcon2 className="svg-icon" />
              </div>
              <h1>Products (Server)</h1>
            </div>
          </Link>

          <Link
            to="/products-list-groups"
            onClick={() => handleNavClick("/products-list-groups")}
          >
            <div
              className={`nav-item ${
                selectedPage === "/products-list-groups" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <DataClassificationIcon className="svg-icon" />
              </div>
              <h1>Edit Groups</h1>
            </div>
          </Link>

          <Link
            to="/edit-products"
            onClick={() => handleNavClick("/edit-products")}
          >
            <div
              className={`nav-item ${
                selectedPage === "/edit-products" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <EditIcon className="svg-icon" />
              </div>
              <h1>Edit</h1>
            </div>
          </Link>

          <Link
            to="/image-parser"
            onClick={() => handleNavClick("/image-parser")}
          >
            <div
              className={`nav-item ${
                selectedPage === "/image-parser" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <WishlistIcon className="svg-icon" />
              </div>
              <h1>Receipt To History</h1>
            </div>
          </Link>

          <Link
            to="/advanced-stats"
            onClick={() => handleNavClick("/advanced-stats")}
          >
            <div
              className={`nav-item ${
                selectedPage === "/advanced-stats" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <PieChartIcon className="svg-icon" />
              </div>
              <h1>Statistics</h1>
            </div>
          </Link>

          <Link
            to="/audio-recorder"
            onClick={() => handleNavClick("/audio-recorder")}
          >
            <div
              className={`nav-item ${
                selectedPage === "/audio-recorder" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <Voice2Icon className="svg-icon" />
              </div>
              <h1>Voice Assistant</h1>
            </div>
          </Link>

          <Link to="/history" onClick={() => handleNavClick("/history")}>
            <div
              className={`nav-item ${
                selectedPage === "/history" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <TransactionHistoryIcon className="svg-icon" />
              </div>
              <h1>Shopping History</h1>
            </div>
          </Link>

          <Link to="/ai" onClick={() => handleNavClick("/ai")}>
            <div
              className={`nav-item ${
                selectedPage === "/ai" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <AiIcon2 className="svg-icon" />
              </div>
              <h1>AI</h1>
            </div>
          </Link>

          <Link to="/barcode-scanner" onClick={() => handleNavClick("/barcode-scanner")}>
            <div
              className={`nav-item ${
                selectedPage === "/barcode-scanner" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <BarcodeIcon className="svg-icon" />
              </div>
              <h1>Barcode Scanner</h1>
            </div>
          </Link>
          <Link to="/vibration-settings" onClick={() => handleNavClick("/vibration-settings")}>
            <div
              className={`nav-item ${
                selectedPage === "/vibration-settings" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <VibrationIcon className="svg-icon" />
              </div>
              <h1>Vibration Settings</h1>
            </div>
          </Link>

          <Link to="/architecture" onClick={() => handleNavClick("/architecture")}>
            <div
              className={`nav-item ${
                selectedPage === "/architecture" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <ArchitectureIcon className="svg-icon" />
              </div>
              <h1>App Architecture</h1>
            </div>
          </Link>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`overlay ${isOpen ? "visible" : ""}`}
        onClick={closeDrawer}
      />
    </nav>
  );
}

export default Toolbar;