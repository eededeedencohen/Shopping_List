import React, { useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../SearchBar/SearchBar";
import SearchModal from "../SearchBar/SearchModal";
import "./Toolbar.css";

import cartIcon from "./cart.svg";
import SearchIcon from "./search.svg";
//=========================================================
import { ReactComponent as GroceryIcon2 } from "./grocery2.svg";
import { ReactComponent as AiIcon2 } from "./robot.svg";
//pie-chart:
import { ReactComponent as PieChartIcon } from "./pie-chart.svg";
//transaction-history
import { ReactComponent as TransactionHistoryIcon } from "./transaction-history.svg";
// voice2
import { ReactComponent as Voice2Icon } from "./voice-bot.svg";
// wishlist
import { ReactComponent as WishlistIcon } from "./wishlist.svg";

// editing:
import { ReactComponent as EditIcon } from "./editing.svg";

// data-classification
import { ReactComponent as DataClassificationIcon } from "./data-classification.svg";
//=========================================================
function Toolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleDrawer = () => {
    setIsOpen(!isOpen);
  };

  const closeDrawer = () => {
    if (isOpen) {
      setIsOpen(false);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <nav className="toolbar">
      <div className="search-icon">
        <img src={SearchIcon} alt="SearchIcon" onClick={openModal} />
      </div>
      <SearchModal isOpen={isModalOpen} onClose={closeModal}>
        <SearchBar closeModal={closeModal} />
      </SearchModal>
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
                <GroceryIcon2 className="svg-icon" /> {/* הוסף class */}
              </div>
              <h1>Products</h1>
            </div>
          </Link>

          <Link to="/products-list-groups" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <DataClassificationIcon className="svg-icon" />{" "}
              </div>
              <h1>Edit Groups</h1>
            </div>
          </Link>

          <Link to="/edit-products" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <EditIcon className="svg-icon" /> {/* הוסף class */}
              </div>
              <h1>Edit</h1>
            </div>
          </Link>

          <Link to="/image-parser" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <WishlistIcon className="svg-icon" /> {/* הוסף class */}
              </div>
              <h1>Receipt To History</h1>
            </div>
          </Link>

          <Link to="/expense-overview" onClick={closeDrawer}>
            <div className="nav-item selected-page">
              <div className="nav-icon">
                <PieChartIcon className="svg-icon" />
              </div>
              <h1>Statistics</h1>
            </div>
          </Link>

          <Link to="/audio-recorder" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <Voice2Icon className="svg-icon" />
              </div>
              <h1>Voice Assistant</h1>
            </div>
          </Link>

          {/* 
          <Link to="/history" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <img src={shoppingHistoryIcon} alt="Grocery" />
              </div>
              <h1>Shopping History</h1>
            </div>
          </Link> */}

          <Link to="/history" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <TransactionHistoryIcon className="svg-icon" />
              </div>
              <h1>Shopping History</h1>
            </div>
          </Link>

          <Link to="/ai" onClick={closeDrawer}>
            <div className="nav-item">
              <div className="nav-icon">
                <AiIcon2 className="svg-icon" />
              </div>
              <h1>AI</h1>
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
