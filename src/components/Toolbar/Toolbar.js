import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import SearchModal from "../SearchBar/SearchModal";
import { useCartTotals } from "../../hooks/appHooks";
import useVibrate from "../../hooks/useVibrate";
import "./Toolbar.css";

import cartIcon from "./cart.svg";
import SearchIcon from "./search.svg";
import { ReactComponent as GroceryIcon2 } from "./grocery2.svg";
import { ReactComponent as AiIcon2 } from "./robot.svg";
import { ReactComponent as PieChartIcon } from "./pie-chart.svg";
import { ReactComponent as TransactionHistoryIcon } from "./transaction-history.svg";
import { ReactComponent as Voice2Icon } from "./voice-bot.svg";
import { ReactComponent as WishlistIcon } from "./wishlist.svg";
import { ReactComponent as EditIcon } from "./editing.svg";
import { ReactComponent as DataClassificationIcon } from "./data-classification.svg";
import { ReactComponent as BarcodeIcon} from "./barcode.svg"
function Toolbar() {
  const { totalAmount } = useCartTotals(); // ← כמות בעגלה
  const [selectedPage, setSelectedPage] = useState(window.location.pathname);
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const vibrate = useVibrate();

  /* אפקט פופ */
  const [pop, setPop] = useState(false);
  useEffect(() => {
    if (totalAmount > 0) {
      // תפעיל רק אם ״יש מה להראות״
      setPop(true);
      const t = setTimeout(() => setPop(false), 300); // משך האנימציה
      return () => clearTimeout(t);
    }
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

      {/* עגלה */}
      <Link to="/cart" onClick={handleCartClick}>
        <div className="cart-icon">
          <img src={cartIcon} alt="Cart" />
          {totalAmount > 0 && (
            <span className={`cart-badge ${pop ? "pop" : ""}`}>
              {totalAmount}
            </span>
          )}
        </div>
      </Link>

      {/* Drawer */}
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="routes-icons">
          {/* 4. כל האייטמים נשארו כפי שהיו – נוספה בדיקה ל-selected-page */}
          <Link to="/" onClick={() => handleNavClick("/")}>
            <div
              className={`nav-item ${
                selectedPage === "/" ? "selected-page" : ""
              }`}
            >
              <div className="nav-icon">
                <GroceryIcon2 className="svg-icon" />
              </div>
              <h1>Products</h1>
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
            to="/expense-overview"
            onClick={() => handleNavClick("/expense-overview")}
          >
            <div
              className={`nav-item ${
                selectedPage === "/expense-overview" ? "selected-page" : ""
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