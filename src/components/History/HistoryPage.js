import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SupermarketImage from "../Images/SupermarketImage";
import "./HistoryPage.css";
import { DOMAIN } from "../../constants";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [filterSupermarket, setFilterSupermarket] = useState("all");

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

  // Get unique supermarkets for filter
  const supermarkets = useMemo(() => {
    const unique = [...new Set(history.map((cart) => cart.supermarketName))];
    return unique.filter(Boolean);
  }, [history]);

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
        <h1 className="history-page-title">🧾 היסטוריית קניות</h1>
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
        <input
          type="text"
          className="history-search-input"
          placeholder="🔍 חפש לפי סופר, כתובת או עיר..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="history-filter-buttons">
          <button
            className={`history-filter-btn ${
              filterSupermarket === "all" ? "active" : ""
            }`}
            onClick={() => setFilterSupermarket("all")}
          >
            הכל
          </button>
          {supermarkets.slice(0, 3).map((supermarket) => (
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

        <select
          className="history-sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="date-desc">📅 חדש לישן</option>
          <option value="date-asc">📅 ישן לחדש</option>
          <option value="price-desc">💰 יקר לזול</option>
          <option value="price-asc">💰 זול ליקר</option>
        </select>
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="history-empty">
          <div className="history-empty-icon">🧾</div>
          <div className="history-empty-text">
            {searchTerm || filterSupermarket !== "all"
              ? "לא נמצאו תוצאות"
              : "אין היסטוריית קניות"}
          </div>
        </div>
      ) : (
        <div className="history-lists">
          {filteredHistory.map((cart, index) => (
            <Link to={`/history/${cart._id}`} key={cart._id}>
              <div
                className="cart-details"
                style={{ animationDelay: `${0.1 + index * 0.08}s` }}
              >
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
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
