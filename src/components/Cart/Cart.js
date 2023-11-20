import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import Modal from "./Modal";
import ReplaceProducts from "./ReplaceProducts";
import "./Cart.css";
import { Spin } from "antd";
import Images from "../ProductList/Images";
import SupermarketImage from "./supermarketImage";

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
// export the function convertWeightUnit:

export default function Cart() {
  const { cart, loadCart, updateProductAmount, confirmCart, updateAmount } =
    useCart();
  const userId = "1"; // Replace this with the actual userId.
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState(null);

  useEffect(() => {
    loadCart(userId);
  }, [loadCart, userId]);

  if (!cart) {
    return (
      <div className="cart">
        <p>Loading...</p>
      </div>
    );
  }

  // TO DO: ADD BARCODE PARAMETER
  const handleIncrement = (barcode) => {
    updateAmount(barcode, "increment");
  };

  // TO DO: ADD BARCODE PARAMETER
  const handleDecrement = (barcode) => {
    updateAmount(barcode, "decrement");
  };


  const handleUpdate = async (barcode) => {
    setIsLoading(true); // Start spinner before the update process
    try {
      await updateProductAmount(userId, barcode); // Await the server response
      await loadCart(userId); // Reload cart data from the server
    } catch (error) {
      console.error("Error updating product amount:", error);
      // Handle any errors here, such as showing a message to the user
    } finally {
      setIsLoading(false); // Stop spinner after the update process and handling any errors
    }
  };


  // const handleConfirmCart = async () => {
  //   await confirmCart(userId);
  //   // Perform any additional actions or navigation after cart confirmation
  //   // do do: add the load cart after this operation 
  // };

  const handleConfirmCart = async () => {
    setIsSaving(true); // Optionally, indicate loading state
    try {
      await confirmCart(userId); // Confirm the cart
      await loadCart(userId); // Reload cart data to reflect changes
    } catch (error) {
      console.error("Error confirming the cart:", error);
      // Optionally, handle the error, e.g., showing an error message
    } finally {
      setIsSaving(false); // Optionally, reset the loading state
    }
  };
  

  if (isLoading || !cart) {
    return (
      <div className="spinner-container">
        <Spin size="large"></Spin>
        <p>מבצע עדכון כמות למוצר ומשווה שוב מחירים</p>
      </div>
    );
  }

  if (isSaving || !cart) {
    return (
      <div className="spinner-container">
        <Spin size="large"></Spin>
        <p>שומר את העגלה בהיסטוריית הקניות</p>
      </div>
    );
  }

  console.log(isModalOpen);
  console.log(currentBarcode);

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
          <SupermarketImage supermarketName={cart.supermarket.name} />
        </div>
        <div className="supermarket-address">
          <div className="supermarket-address__city">
            {cart && cart.supermarket.city}
          </div>
          <div className="supermarket-Street__street">
            ,{cart && cart.supermarket.address}
          </div>
        </div>
        <hr className="line" />
      </div>
      <div className="total-price">
        <div className="total-price__title">
          <h1>סכום כולל של העגלה שלך</h1>
        </div>
        <div className="total-price__price">
          {cart && <h1>{cart.totalPrice}₪</h1>}
        </div>
      </div>
      <hr className="line" />
      <div className="products">
        {cart &&
          cart.productsWithPrices.map((item, index) => (
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
                    onClick={() => handleDecrement(item.product.barcode)}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    value={item.amount}
                    readOnly
                    className="update-amount__amount-input"
                    onClick={() => {
                      setCurrentBarcode(item.product.barcode);
                      console.log(currentBarcode);
                      handleUpdate(item.product.barcode);
                    }}
                  />
                  <button
                    className="update-amount__plus-button"
                    onClick={() => handleIncrement(item.product.barcode)}
                  >
                    +
                  </button>
                </div>
              </div>
              <hr />
            </div>
          ))}
      </div>
      <div className="green-button">
        <button className="green-button__button" onClick={handleConfirmCart}>
          Confirm Cart
        </button>{" "}
      </div>
    </div>
  );
}
