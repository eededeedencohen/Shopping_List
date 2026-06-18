import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SupermarketImage from "../Images/SupermarketImage";
import "./HistoryPage.css";
import { DOMAIN } from "../../constants";
import { ReactComponent as SearchIcon } from "./search.svg";
import { ReactComponent as ScheduleIcon } from "./schedule.svg";
import { ReactComponent as ShoppingListIcon } from "./shopping-list.svg";
import { ReactComponent as ShekelIcon } from "./shekel.svg";
import { useCartOptimizationCtx } from "../../context/CartOptimizationContext";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterSupermarket, setFilterSupermarket] = useState("all");

  /* selection mode for bulk-delete */
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const { allSupermarkets, isAllSupermarketsUploaded } = useCartOptimizationCtx();

  const exitSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const toggleSelected = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.size || isDeleting) return;
    const count = selectedIds.size;
    if (
      !window.confirm(
        count === 1
          ? "למחוק את הקבלה שנבחרה?"
          : `למחוק ${count} קבלות שנבחרו?`
      )
    ) {
      return;
    }
    setIsDeleting(true);
    const ids = [...selectedIds];
    const results = await Promise.allSettled(
      ids.map((id) => axios.delete(`${DOMAIN}/api/v1/history/${id}`))
    );
    const succeededIds = new Set(
      ids.filter((_, i) => results[i].status === "fulfilled")
    );
    setHistory((prev) => prev.filter((c) => !succeededIds.has(c._id)));
    const failed = results.filter((r) => r.status === "rejected").length;
    if (failed > 0) {
      console.error(`Failed to delete ${failed}/${count} receipts`);
      alert(`${count - failed} מתוך ${count} נמחקו. ${failed} נכשלו — נסה שוב.`);
    }
    exitSelection();
    setIsDeleting(false);
  };

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${DOMAIN}/api/v1/history`);
        setHistory(response.data.data.history);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Get unique supermarket names from allSupermarkets context
  const supermarketNames = useMemo(() => {
    if (!isAllSupermarketsUploaded || !allSupermarkets.length) return [];
    const uniqueNames = [...new Set(allSupermarkets.map((s) => s.name))];
    return uniqueNames.filter(Boolean);
  }, [allSupermarkets, isAllSupermarketsUploaded]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalSpent = history.reduce(
      (sum, cart) => sum + (cart.totalPrice || 0),
      0
    );
    const totalTrips = history.length;
    const avgPerTrip = totalTrips > 0 ? totalSpent / totalTrips : 0;
    return { totalSpent, totalTrips, avgPerTrip };
  }, [history]);

  // Filter and sort history
  const filteredHistory = useMemo(() => {
    let result = [...history];

    // Filter by search term (address, city, supermarket name)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (cart) =>
          cart.supermarketName?.toLowerCase().includes(term) ||
          cart.supermarketAddress?.toLowerCase().includes(term) ||
          cart.supermarketCity?.toLowerCase().includes(term)
      );
    }

    // Filter by supermarket
    if (filterSupermarket !== "all") {
      result = result.filter(
        (cart) => cart.supermarketName === filterSupermarket
      );
    }

    // Sort
    switch (sortBy) {
      case "date-desc":
        result.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "date-asc":
        result.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "price-desc":
        result.sort((a, b) => (b.totalPrice || 0) - (a.totalPrice || 0));
        break;
      case "price-asc":
        result.sort((a, b) => (a.totalPrice || 0) - (b.totalPrice || 0));
        break;
      default:
        break;
    }

    return result;
  }, [history, searchTerm, filterSupermarket, sortBy]);

  if (loading) {
    return (
      <div className="history-page-container">
        <div className="history-loading">טוען היסטוריה...</div>
      </div>
    );
  }

  return (
    <div className="history-page-container">
      {/* Header */}
      <div className="history-page-header">
        <h1 className="history-page-title">היסטוריית קניות</h1>
        <p className="history-page-subtitle">כל הקבלות שלך במקום אחד</p>
      </div>

      {/* Stats */}
      {history.length > 0 && (
        <div className="history-stats">
          <div className="history-stat-item">
            <span className="history-stat-value">{stats.totalTrips}</span>
            <span className="history-stat-label">קניות</span>
          </div>
          <div className="history-stat-item">
            <span className="history-stat-value">
              ₪{stats.totalSpent.toFixed(0)}
            </span>
            <span className="history-stat-label">סה״כ הוצאות</span>
          </div>
          <div className="history-stat-item">
            <span className="history-stat-value">
              ₪{stats.avgPerTrip.toFixed(0)}
            </span>
            <span className="history-stat-label">ממוצע לקנייה</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="history-filters">
        <div className="history-search-row">
          <div className="history-search-wrapper">
            <SearchIcon className="history-search-icon" />
            <input
              type="text"
              className="history-search-input"
              placeholder="חפש לפי סופר, כתובת או עיר..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {history.length > 0 && (
            <button
              type="button"
              className={`history-select-toggle ${isSelectionMode ? "active" : ""}`}
              onClick={() => (isSelectionMode ? exitSelection() : setIsSelectionMode(true))}
              aria-pressed={isSelectionMode}
            >
              {isSelectionMode ? "ביטול" : "בחר"}
            </button>
          )}
        </div>

        <div className="history-filter-buttons">
          <button
            className={`history-filter-btn ${
              filterSupermarket === "all" ? "active" : ""
            }`}
            onClick={() => setFilterSupermarket("all")}
          >
            הכל
          </button>
          {supermarketNames.map((supermarket) => (
            <button
              key={supermarket}
              className={`history-filter-btn ${
                filterSupermarket === supermarket ? "active" : ""
              }`}
              onClick={() => setFilterSupermarket(supermarket)}
            >
              {supermarket}
            </button>
          ))}
        </div>

        <div className="history-sort-wrapper">
          {sortBy.includes("date") ? (
            <ScheduleIcon className="history-sort-icon" />
          ) : (
            <ShekelIcon className="history-sort-icon" />
          )}
          <select
            className="history-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date-desc">חדש לישן</option>
            <option value="date-asc">ישן לחדש</option>
            <option value="price-desc">יקר לזול</option>
            <option value="price-asc">זול ליקר</option>
          </select>
        </div>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="history-empty">
          <ShoppingListIcon className="history-empty-icon" />
          <div className="history-empty-text">
            {searchTerm || filterSupermarket !== "all"
              ? "לא נמצאו תוצאות"
              : "אין היסטוריית קניות"}
          </div>
        </div>
      ) : (
        <>
        <div className="history-lists">
          {filteredHistory.map((cart, index) => {
            const isSelected = selectedIds.has(cart._id);
            const cardInner = (
              <div
                className={`cart-details ${isSelectionMode ? "is-selectable" : ""} ${
                  isSelected ? "is-selected" : ""
                }`}
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
                {isSelectionMode && (
                  <span
                    className={`cart-details-checkbox ${isSelected ? "is-checked" : ""}`}
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                )}

                <div className="cart-details-supermarket">
                  <div className="cart-details-supermarket__image">
                    <SupermarketImage supermarketName={cart.supermarketName} />
                  </div>
                  <div className="cart-details-supermarket__address">
                    {cart.supermarketAddress}
                  </div>
                  <div className="cart-details-supermarket__city">
                    {cart.supermarketCity}
                  </div>
                </div>

                <div className="cart-details-summery">
                  <div className="cart-details-summery__date">
                    <h1>
                      {cart.date &&
                        cart.date.split("T")[0].split("-").reverse().join("/")}
                    </h1>
                    <h2>תאריך</h2>
                  </div>
                  <div className="cart-details-summery__time">
                    <h1>
                      {cart.date &&
                        cart.date
                          .split("T")[1]
                          .split(".")[0]
                          .split(":")
                          .slice(0, 2)
                          .join(":")}
                    </h1>
                    <h2>שעה</h2>
                  </div>
                  <div className="cart-details-summary__total-price">
                    <h1>₪{cart.totalPrice && cart.totalPrice.toFixed(2)}</h1>
                    <h2>סה״כ</h2>
                  </div>
                </div>

                {/* Mini barcode */}
                <div className="cart-details-barcode"></div>
              </div>
            );

            if (isSelectionMode) {
              return (
                <button
                  key={cart._id}
                  type="button"
                  className="history-card-tap"
                  onClick={() => toggleSelected(cart._id)}
                  aria-pressed={isSelected}
                >
                  {cardInner}
                </button>
              );
            }
            return (
              <Link to={`/history/${cart._id}`} key={cart._id}>
                {cardInner}
              </Link>
            );
          })}
        </div>

        {isSelectionMode && (
          <div className={`history-selection-bar ${selectedIds.size ? "has-selection" : ""}`}>
            <span className="history-selection-count">
              {selectedIds.size === 0
                ? "סמן קבלות למחיקה"
                : selectedIds.size === 1
                ? "קבלה אחת נבחרה"
                : `${selectedIds.size} קבלות נבחרו`}
            </span>
            <button
              type="button"
              className="history-selection-delete"
              onClick={handleDeleteSelected}
              disabled={!selectedIds.size || isDeleting}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
              </svg>
              {isDeleting ? "מוחק…" : "מחק"}
            </button>
          </div>
        )}
        </>
      )}
    </div>
  );
};

export default HistoryPage;
