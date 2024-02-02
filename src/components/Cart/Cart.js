import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
import Modal from "./Modal";
import ReplaceProducts from "./ReplaceProducts";
import "./Cart.css";
import { Spin } from "antd";
import Images from "../ProductList/Images";
import SupermarketImage from "./supermarketImage";
import trashIcon from "./trash.png";

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
  const {
    cart,
    loadCart,
    updateProductAmount,
    removeProductFromCart,
    confirmCart,
    updateAmount,
    updateSupermarketID,
    getCheapestSupermarketCart,
  } = useCart();
  const navigate = useNavigate();
  const { loadProducts } = useProducts();
  const userId = "1"; // Replace this with the actual userId.
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentBarcode, setCurrentBarcode] = useState(null);

  //=============================================
  const [supermarketID, setSupermarketID] = useState(1);
  const [isReplaceSupermarket, setIsReplaceSupermarket] = useState(false);

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

  const handleDelete = async (barcode) => {
    setIsLoading(true); // Start spinner before the delete process
    try {
      await removeProductFromCart(userId, barcode); // Await the server response
      await loadCart(userId); // Reload cart data from the server
    } catch (error) {
      console.error("Error deleting product from cart:", error);
      // Handle any errors here, such as showing a message to the user
    } finally {
      setIsLoading(false); // Stop spinner after the delete process and handling any errors
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

  const handleCheapestCart = async () => {
    await getCheapestSupermarketCart(userId);
    await loadCart(userId);
    await loadProducts();
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

  if (isReplaceSupermarket || !cart) {
    return (
      <div className="spinner-container">
        <Spin size="large"></Spin>
        <p>מחליף סופרמרקט</p>
      </div>
    );
  }
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

      <div className="filter">
        {/**text box: */}
        <input
          type="number"
          value={supermarketID}
          onChange={(event) => setSupermarketID(event.target.value)}
        />
        <button
          onClick={() => {
            const handleUpdateAndLoad = async () => {
              setIsReplaceSupermarket(true); // Start loading
              try {
                await updateSupermarketID(userId, supermarketID);
                await loadCart(userId);
                await loadProducts();
              } catch (error) {
                console.error(
                  "Error updating supermarket ID or loading cart:",
                  error
                );
                // Optionally, handle the error
              } finally {
                setIsReplaceSupermarket(false); // Stop loading regardless of success or error
              }
            };

            handleUpdateAndLoad();
          }}
        >
          אישור
        </button>
      </div>

      <div className="cart-optimization">
        <button
          className="cart-optimization__button"
          onClick={() => {
            const handleOptimizeCart = async () => {
              setIsReplaceSupermarket(true); // Start loading
              try {
                // Code to optimize the cart goes here
                await handleCheapestCart();
              } catch (error) {
                console.error("Error optimizing cart:", error);
                // Optionally, handle the error
              } finally {
                setIsReplaceSupermarket(false); // Stop loading regardless of success or error
              }
            };

            handleOptimizeCart();
          }}
          disabled={isReplaceSupermarket} // Disable the button when loading
        >
          מחיר הכי זול
        </button>
        {isReplaceSupermarket && <div>Loading...</div>}{" "}
        {/* Optional: Show a loading indicator */}
      </div>
      <div className="cart-optimization-settings">
        <button onClick={() => navigate("/optimal-carts-settings")}>
          מעבר לאופטימיזציית עגלות
        </button>
      </div>

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
            // ===========================================
            //  START FROM HERE TO ORGENIZE THE PRODUCTS
            // ===========================================

            <div key={index}>
              <div
                className="product"
                onClick={() => {
                  setCurrentBarcode(item.product.barcode);
                  setModalOpen(true);
                }}
              >
                <div className="product-details">
                  <div className="product-details__name">
                    <span>
                      {item.product.name.split(" ").slice(0, 3).join(" ")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row-reverse",
                      alignItems: "center",
                      paddingRight: "5px",
                      width: "100%",
                    }}
                  >
                    <div className="product-details__weight">
                      <span>{convertWeightUnit(item.product.unitWeight)} </span>
                      <span className="size">{item.product.weight}</span>
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
                    <div className="product-details__brand">
                      <span>{item.product.brand}</span>
                    </div>
                  </div>
                </div>
                <div className="product-price">
                  <div className="product-price__amount">
                    <span style={{ fontSize: "0.8rem", alignSelf: "baseline" }}>
                      'יח
                    </span>
                    <span>{item.amount}</span>
                  </div>
                  <div className="product-price__total-price">
                    <b style={{ fontSize: "1.2em" }}>₪</b>
                    <span style={{ fontSize: "1.2rem" }}>
                      {parseFloat(item.totalPrice).toFixed(2)}
                    </span>
                  </div>
                </div>
                <div className="product-image">
                  <Images barcode={item.product.barcode} />
                </div>
              </div>

              {/* =======================================
              END HERE TO ORGENIZE THE PRODUCTS 
              ===========================================*/}

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
                <div className="cart__delete-product">
                  <button
                    onClick={() => {
                      setCurrentBarcode(item.product.barcode);
                      console.log(currentBarcode);
                      handleDelete(item.product.barcode);
                    }}
                  >
                    <img src={trashIcon} alt="Delete" />
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
