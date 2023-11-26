import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Toolbar.css";
import groceryIcon from "./grocery.svg";
import receiptIcon from "./receipt.svg";
import shoppingListIcon from "./note.svg";
import shoppingHistoryIcon from "./history2.svg";
import statisticIcon from "./statistics.svg";
import voiceAssistantIcon from "./voice-assistant.svg";
import aiIcon from "./ai.svg";
import cartIcon from "./cart.svg";

function Toolbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  return (
    <nav className="toolbar">
      <div className="hamburger-menu" onClick={toggleDrawer}>
        &#9776;
      </div>
      <Link to="/cart" onClick={closeDrawer}>
        <div className="cart-icon">
          <img src={cartIcon} alt="CartIcon" />
        </div>
      </Link>
      <div className={`drawer ${isOpen ? "open" : ""}`}>
        <div className="routes-icons">
          <Link to="/" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <img src={groceryIcon} alt="Grocery" />
              </div>
              <h1>Products</h1>
            </div>
          </Link>
          <Link to="/grocery" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <img src={shoppingListIcon} alt="Grocery" />
              </div>
              <h1>List from Image</h1>
            </div>
          </Link>

          <Link to="/grocery" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <img src={receiptIcon} alt="Grocery" />
              </div>
              <h1>Receipt To History</h1>
            </div>
          </Link>
          <Link to="/grocery" onClick={closeDrawer} className="link-nav">
            <div className="nav-item">
              <div className="nav-icon">
                <img src={statisticIcon} alt="Grocery" />
              </div>
              <h1>Statistics</h1>
            </div>
          </Link>
          <Link to="/upload-record" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <img src={voiceAssistantIcon} alt="Grocery" />
              </div>
              <h1>Voice Assistant</h1>
            </div>
          </Link>
          <Link to="/audio-recorder" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <img src={aiIcon} alt="Grocery" />
              </div>
              <h1>Predict Shopping List</h1>
            </div>
          </Link>
          <Link to="/grocery" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <img src={shoppingHistoryIcon} alt="Grocery" />
              </div>
              <h1>Shopping History</h1>
            </div>
          </Link>
        </div>
      </div>
      <div
        className={`overlay ${isOpen ? "visible" : ""}`}
        onClick={closeDrawer}
      />
    </nav>
  );
}

export default Toolbar;
