import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./HistoryList.css";
// import shoppingCartImage from "./shopping-cart.png";
import Images from "../ProductList/Images";
import SupermarketImage from "../Cart/supermarketImage";

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

const limitToFourWords = (str) => {
  return str.split(" ").slice(0, 4).join(" ");
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
        const response = await axios.get(
          `http://localhost:8000/api/v1/history/${id}`
        );
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
        {/* <div className="details-supermaeket-history__cart-icon">
          <img src={shoppingCartImage} alt="Shopping Cart" />
        </div> */}
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
                {product.amount + "x"}
              </div>
              <div className="history__product-price">
                <h5>:סה"כ</h5>
                <p>{formatPrice(product.totalPrice)}</p>
              </div>
            </div>
            <div className="history__product-details">
              <div className="history__product-name">
                {limitToFourWords(product.name)}
              </div>
              <div className="history__product-weight">
                <h3>{product.weight}</h3>
                <h4>{weightUnitToHebrew(product.unit)}</h4>
              </div>
              <div className="history__product-brand">{product.brand}</div>
              <div className="history__product-barcode">{product.barcode}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
