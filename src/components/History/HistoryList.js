import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./HistoryList.css";
import { ProductImageDisplay } from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import { DOMAIN } from "../../constants";
import { ReactComponent as SearchIcon } from "./search.svg";
import { ReactComponent as ScheduleIcon } from "./schedule.svg";

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
  const [cart, setCart] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
    <div className="receipt-container">
      {/* Back Button */}
      <button className="receipt-back-btn" onClick={handleBack}>
        ←
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
          {filteredProducts.map((product, index) => (
            <div
              key={product.barcode}
              className="history__product-item"
              style={{ animationDelay: `${1.3 + index * 0.06}s` }}
            >
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
                  <span >{product.amount}</span>
                  <span style={{ direction: "rtl"}}>יח'</span> 
                </div>
                <div className="history__product-price">
                  <p>{formatPrice(product.totalPrice)}</p>
                </div>
              </div>

              <div className="history__line" />
            </div>
          ))}
        </div>

        {/* Footer with barcode */}
        <div className="receipt-footer">
          <div className="receipt-thank-you">תודה שקניתם אצלנו!</div>
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
