import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useReceiptTheme } from "../../context/ReceiptThemeContext";
import "./HistoryList.css";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import { DOMAIN } from "../../constants";
import { ReactComponent as SearchIcon } from "./search.svg";
import { ReactComponent as ScheduleIcon } from "./schedule.svg";
import generateReceiptPDF from "./generateReceiptPDF";

const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();
  return `${day}/${month}/${year}`;
};

const weightUnitToHebrew = (weight) => {
  switch (weight) {
    case "kg":
      return "ק״ג";
    case "g":
      return "גרם";
    case "ml":
      return "מ״ל";
    case "l":
      return "ליטר";
    default:
      return weight;
  }
};

// the ils sign needs to left of the number
const formatPrice = (price) => {
  return "₪" + Number(price).toFixed(2);
};

const generateBarcodeNumber = (id) => {
  // Generate a fake barcode number from the cart ID
  const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return String(hash * 12345678).slice(0, 13).padStart(13, "0");
};

const HistoryList = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme: receiptTheme } = useReceiptTheme();
  const [cart, setCart] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintReceipt = async () => {
    if (!cart || isPrinting) return;
    setIsPrinting(true);
    try {
      await generateReceiptPDF(cart, id);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await axios.get(`${DOMAIN}/api/v1/history/${id}`);
        setCart(response.data.data.history);
      } catch (error) {
        console.error("Error fetching cart:", error);
      }
    };

    fetchCart();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!cart) {
    return <div className="receipt-loading">מדפיס קבלה...</div>;
  }

  // Filter products by search term
  const filteredProducts = cart.products.filter((product) =>
    searchTerm
      ? product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  return (
    <div className={`receipt-container receipt-theme--${receiptTheme}`}>
      {/* Back Button */}
      <button className="receipt-back-btn" onClick={handleBack}>
        ←
      </button>

      {/* Print Receipt PDF Button */}
      <button
        className={`receipt-print-btn ${isPrinting ? "printing" : ""}`}
        onClick={handlePrintReceipt}
        disabled={isPrinting}
      >
        {isPrinting ? (
          <span className="print-spinner" />
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect x="6" y="14" width="12" height="8" />
          </svg>
        )}
      </button>

      {/* Search/Filter Bar */}
      <div className="receipt-filters">
        <div className="receipt-search-wrapper">
          <SearchIcon className="receipt-search-icon" />
          <input
            type="text"
            className="receipt-search"
            placeholder="חפש מוצר..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* The Receipt Paper */}
      <div className="receipt-paper">
        {/* Header */}
        <div className="details-supermaeket-history">
          <div className="details-supermaeket-history__date">
            <ScheduleIcon className="receipt-date-icon" />
            {formatDate(cart.date)}
          </div>
          <div className="details-supermaeket-history__logo">
            <SupermarketImage supermarketName={cart.supermarketName} />
          </div>
          <div className="details-supermaeket-history__address">
            <h3>{cart.supermarketAddress}</h3>
            <h4>{cart.supermarketCity}</h4>
          </div>
          <div className="details-supermaeket-history__total-price-container">
            <div className="details-supermaeket-history__total-price" >
              {formatPrice(cart.totalPrice)}
            </div>
            <div className="details-supermaeket-history__total-price-label">
              סכום הקנייה:
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="cart-history">
          {filteredProducts.map((product, index) => {
            const hasPromo = product.hasDiscount && product.discount && product.discount.units > 1;
            const regularUnitPrice = product.price || 0;
            const regularTotal = hasPromo ? product.amount * regularUnitPrice : 0;
            const savings = hasPromo ? regularTotal - product.totalPrice : 0;

            return (
              <div
                key={product.barcode}
                className={`history__product-item ${hasPromo ? "history__product-item--promo" : ""}`}
                style={{ animationDelay: `${1.3 + index * 0.06}s` }}
              >
                {/* Discount badge */}
                {hasPromo && (
                  <div className="history__promo-badge">מבצע</div>
                )}

                {/* Image - LEFT */}
                <div className="history__product-image">
                  <ProductImageDisplay barcode={product.barcode} />
                </div>

                {/* Product Name - TOP */}
                <div className="history__product-name">
                  {product.name}
                </div>

                {/* Details - brand & weight */}
                <div className="history__product-details">
                  {product.brand && (
                    <>
                      <span className="history__product-brand">{product.brand}</span>
                      <span className="history__product-details-divider">|</span>
                    </>
                  )}
                  <div className="history__product-weight">
                    <span>{product.weight}</span>
                    <span style={{ marginRight: "3px" }}>
                      {weightUnitToHebrew(product.unit)}
                    </span>
                  </div>
                </div>

                {/* Price - RIGHT */}
                <div className="history__product-price-container">
                  <div className="history__product-amount">
                    <span>{product.amount}</span>
                    <span style={{ direction: "rtl"}}>יח'</span>
                  </div>
                  {hasPromo ? (
                    <>
                      <div className="history__product-price history__product-price--original">
                        <p>{formatPrice(regularTotal)}</p>
                      </div>
                      <div className="history__promo-info">
                        <span className="history__promo-deal">
                          {product.discount.units} ב-{formatPrice(product.discount.totalPrice)}
                        </span>
                        <span className="history__promo-saving">
                          -{formatPrice(savings)}
                        </span>
                      </div>
                      <div className="history__product-price history__product-price--final">
                        <p>{formatPrice(product.totalPrice)}</p>
                      </div>
                    </>
                  ) : (
                    <div className="history__product-price">
                      <p>{formatPrice(product.totalPrice)}</p>
                    </div>
                  )}
                </div>

                <div className="history__line" />
              </div>
            );
          })}
        </div>

        {/* Footer with barcode */}
        <div className="receipt-footer">
          <div className="receipt-barcode"></div>
          <div className="receipt-barcode-number">
            {generateBarcodeNumber(id)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoryList;
