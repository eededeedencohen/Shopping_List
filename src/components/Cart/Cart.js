import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import Modal from "./Modal";
import ReplaceProducts from "./ReplaceProducts";
import "./Cart.css";
import ShaareyRevahaLogo from "./SuperMarketsLogo/שערי-רווחה.jpg";
import MilkiImage from "../ProductList/milki.png";
import Images from "../ProductList/Images";

export const convertWeightUnit = (weightUnit) => {
  weightUnit = weightUnit.toLowerCase();
  if (weightUnit === "g") {
    return "גרם";
  }
  if (weightUnit === "kg") {
    return "קילוגרם";
  }
  if (weightUnit === "ml") {
    return "מיליליטר";
  }
  if (weightUnit === "l") {
    return "ליטר";
  }
  return weightUnit;
};

export default function Cart() {
  const { cart, loadCart, updateProductAmount } = useCart();
  const userId = "1"; // Replace this with the actual userId.
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState(null);
  const [updatedAmount, setUpdatedAmount] = useState(0);

  useEffect(() => {
    loadCart(userId);
  }, [loadCart, userId]);

  let cartData = null;

  if (!cart) {
    return (
      <div className="cart">
        <p>Loading...</p>
      </div>
    );
  }

  if (cart) {
    try {
      cartData = JSON.parse(cart);
    } catch (err) {
      console.error("Failed to parse cart data:", err);
      cartData = null;
    }
  }

  // TO DO: ADD BARCODE PARAMETER
  const handleIncrement = () => {
    setUpdatedAmount(updatedAmount + 1);
  };

  // TO DO: ADD BARCODE PARAMETER
  const handleDecrement = () => {
    if (updatedAmount > 0) {
      setUpdatedAmount(updatedAmount - 1);
    }
  };

  const handleUpdate = () => {
    if (currentBarcode && updatedAmount !== 0) {
      updateProductAmount(userId, currentBarcode, updatedAmount);
    }
  };

  console.log(isModalOpen);
  console.log(currentBarcode);
  console.log(updatedAmount);

  return (
    <div className="cart">
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <ReplaceProducts
          barcode={currentBarcode}
          closeModal={() => setModalOpen(false)}
          loadCart={loadCart}
          userId={userId}
        />
      </Modal>

      <div className="supermarket">
        <div className="supermarket-title">
          <h3>הסופרמרקט הכי משתלם לעגלה שלך</h3>
        </div>
        <div className="supermarket-logo">
          <img src={ShaareyRevahaLogo} alt="Shaarey Revaha Logo" />
        </div>
        <div className="supermarket-address">
          <div className="supermarket-address__city">
            {cartData && cartData.data.supermarket.city}
          </div>
          <div className="supermarket-Street__street">
            ,{cartData && cartData.data.supermarket.address}
          </div>
        </div>
        <hr className="line" />
      </div>
      <div className="total-price">
        <div className="total-price__title">
          <h1>סכום כולל של העגלה שלך</h1>
        </div>
        <div className="total-price__price">
          {cartData && <h1>{cartData.data.totalPrice}₪</h1>}
        </div>
      </div>
      <hr className="line" />
      <div className="products">
        {cartData &&
          cartData.data.productsWithPrices.map((item, index) => (
            <div key={index}>
              <div
                className="product"
                onClick={() => {
                  setCurrentBarcode(item.product.barcode);
                  setModalOpen(true);
                }}
              >
                <div className="product-details">
                  <h4 className="product-details__name">
                    {item.product.name.split(" ").slice(0, 3).join(" ")}
                  </h4>
                  <h4 className="product-details__brand">
                    {item.product.brand}
                  </h4>
                  <div className="product-details__weight">
                    <h4 className="unit">
                      {convertWeightUnit(item.product.unitWeight)}
                    </h4>
                    <h4 className="size">{item.product.weight}</h4>
                  </div>
                </div>
                <div className="product-price">
                  <h4 className="product-price__amount">
                    {item.amount} :יחידות
                  </h4>
                  <h4 className="product-price__total-price">
                    {parseFloat(item.totalPrice).toFixed(2)}
                    {""}
                    <b style={{ fontSize: "1.2em" }}>₪</b>{" "}
                  </h4>
                </div>
                <div className="product-image">
                  <Images barcode={item.product.barcode} />
                </div>
              </div>
              <div className="update-amount">
                <div className="update-amount__new">
                  <button
                    className="update-amount__minus-button"
                    onClick={handleDecrement}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={updatedAmount}
                    readOnly
                    className="update-amount__amount-input"
                    // onClick={handleUpdate}
                    // add the barcode parameter
                    onClick={() => {
                      setCurrentBarcode(item.product.barcode);
                      console.log(currentBarcode);
                      handleUpdate();
                    }}
                  />
                  <button
                    className="update-amount__plus-button"
                    onClick={handleIncrement}
                  >
                    +
                  </button>
                </div>
              </div>
              <hr />
            </div>
          ))}
      </div>
    </div>
  );
}
