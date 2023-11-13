import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import SupermarketImage from "../Cart/supermarketImage";
import "./HistoryPage.css";

const HistoryPage = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/v1/history"
        );
        setHistory(response.data.data.history);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="history-lists">
      {history.map((cart) => (
        <Link to={`/history/${cart._id}`}>
        <div key={cart._id} className="cart-details" onClick={
          () => {
            // window.location.href = `/history/${cart._id}`;
          }
        }>
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
                {" "}
                {/* date in format of DD-MM-YYYY: */}
                {cart.date &&
                  cart.date.split("T")[0].split("-").reverse().join("-")}
              </h1>
              <h2>תאריך</h2>
            </div>
            <div className="cart-details-summery__time">
              {/* time in format of HH:MM: */}
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
              <h1>              
              {/* total price in format of 0.00: */}
              ₪{cart.totalPrice && cart.totalPrice.toFixed(2)}</h1>
              <h2>סה"כ</h2>

            </div>
          </div>
        </div>
         </Link>
      ))}
    </div>
  );
};

export default HistoryPage;
