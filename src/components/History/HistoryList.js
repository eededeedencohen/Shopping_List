import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./HistoryList.css";
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
import { DOMAIN } from "../../constants";

const formatDate = (dateString) => {
  const dateObj = new Date(dateString);
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0"); // January is 0!
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

const formatPrice = (price) => {
  return Number(price).toFixed(2) + "₪";
};

const HistoryList = () => {
  const { id } = useParams();
  const [cart, setCart] = useState(null);

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

  if (!cart) {
    return <div>Loading...</div>;
  }
  console.log(cart);
  return (
    <div>
      <div className="details-supermaeket-history">
        <div className="details-supermaeket-history__date">
          {formatDate(cart.date)}
        </div>
        <div className="details-supermaeket-history__logo">
          <SupermarketImage supermarketName={cart.supermarketName} />
        </div>
        <div className="details-supermaeket-history__address">
          <h3>{" ," + cart.supermarketAddress}</h3>
          <h4>{cart.supermarketCity}</h4>
        </div>
        <div className="details-supermaeket-history__total-price-container">
          <div className="details-supermaeket-history__total-price-label">
            :סכום הקנייה
          </div>
          <div className="details-supermaeket-history__total-price">
            {formatPrice(cart.totalPrice)}
          </div>
        </div>
      </div>

      <div className="cart-history">
        {cart.products.map((product) => (
          <div key={product.barcode} className="history__product-item">
            <div className="history__product-image">
              <Images barcode={product.barcode} />
            </div>
            <div className="history__product-price-container">
              <div className="history__product-amount">
                <span style={{ fontSize: "0.8rem", alignSelf: "flex-end" }}>
                  'יח
                </span>
                <span>{product.amount}</span>
              </div>
              <div className="history__product-price">
                <p>{formatPrice(product.totalPrice)}</p>
              </div>
            </div>
            <div className="history__product-details">
              <div className="history__product-name">
                <span>{product.name.split(" ").slice(0, 3).join(" ")}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row-reverse",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  className="history__product-weight"
                  style={{ display: "flex" }}
                >
                  <span style={{ marginRight: "3px" }}>
                    {weightUnitToHebrew(product.unit)}{" "}
                  </span>
                  <span className="size">{product.weight}</span>
                </div>
                <span
                  style={{
                    paddingRight: "3px",
                    paddingLeft: "3px",
                    display: "flex",
                    alignSelf: "normal",
                  }}
                >
                  {" "}
                  |{" "}
                </span>
                <div className="history__product-brand">
                  <span>{product.brand}</span>
                </div>
              </div>
            </div>
            <div className="history__line" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
