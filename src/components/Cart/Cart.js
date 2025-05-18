// import { useState, useEffect, useMemo } from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import ReplaceProducts from "./ReplaceProducts";
import ReplaceSupermarket from "./ReplaceSupermarket/ReplaceSupermarket";
import "./Cart.css";
import { Spin } from "antd";
import Images from "../ProductList/Images";
import SupermarketImage from "./supermarketImage";
import trashIcon from "./trash.png";

//==================================================
import {
  useCartState,
  useCartTotals,
  useCartActions,
  useCartItems,
  useCurrentSupermarket,
  useRandomSupermarketReplacer,
  useUpdateActiveCart,
} from "../../hooks/appHooks";

import { calculateTotalPrice } from "../../utils/priceCalculations";

//==================================================

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
  const { cart, isLoading } = useCartState(); // ← קיבלנו גם cart

  // const { totalAmount, totalPrice } = useCartTotals();
  const { totalPrice } = useCartTotals();

  // const { update, remove, replaceSupermarket } = useCartActions();
  const { update, remove, replaceSupermarket, confirmAndClearCart } =
    useCartActions();

  const { sendActiveCart } = useUpdateActiveCart();

  const cartItems = useCartItems();
  const { currentSupermarket, isLoadingPrices } = useCurrentSupermarket(); // Get the current supermarket from the context
  const { replaceRandomCheapest } = useRandomSupermarketReplacer(); // Get the random supermarket replacer from the context

  const navigate = useNavigate();
  const userId = "1"; // Replace this with the actual userId.

  //////////////////////////////////////////////////////////////
  //============================================================
  const [draftAmounts, setDraftAmounts] = useState({});

  /**
   * Calculates the total price and quantity of the cart.
   * @returns {Object} An object containing the total quantity and price.
   *
   * @typedef {Object} CartTotals
   * @property {number} amt - The total quantity of items in the cart.
   * @property {number} price - The total price of the cart.
   */
  // const draftTotals = useMemo(() => {
  //   let totalQuantity = 0;
  //   let totalCost = 0;
  //   cartItems.forEach((item) => {
  //     const quantity = draftAmounts[item.barcode] ?? item.amountInCart;
  //     totalQuantity += quantity;
  //     totalCost += calculateTotalPrice(quantity, item);
  //   });
  //   return { amt: totalQuantity, price: totalCost };
  // }, [cartItems, draftAmounts]);

  //============================================================
  //////////////////////////////////////////////////////////////

  // Loading state
  const [isReplaceSupermarket, setIsReplaceSupermarket] = useState(false);

  // Modals
  const [isModalOpen, setModalOpen] = useState(false);
  const [isReplaceSupermarketOpen, setIsReplaceSupermarketOpen] =
    useState(false);

  const [currentBarcode, setCurrentBarcode] = useState(null);

  useEffect(() => {
    sendActiveCart();
    console.log(cart);
  }, [cart, sendActiveCart]); // ← מופעל רק כש-cart משתנה

  const handleConfirmCart = async () => {
    try {
      confirmAndClearCart();
    } catch (error) {
      console.error("Error confirming the cart:", error);
    }
  };

  const handleUpdateAndLoad = async (newSupermarketID) => {
    setIsReplaceSupermarket(true);
    try {
      replaceSupermarket(newSupermarketID); // רק עדכון הקונטקסט
      // sendActiveCart(); // עדכון הקונטקסט עם הסופרמרקט החדש
    } catch (error) {
      console.error("Error replacing supermarket:", error);
    } finally {
      setIsReplaceSupermarket(false);
      setIsReplaceSupermarketOpen(false); // סגור את המודל
    }
  };

  const handleUpdateSupermarket = async (supermarketID) => {
    await handleUpdateAndLoad(supermarketID);
  };

  const handleCheapestCart = async () => {
    setIsReplaceSupermarket(true); // ← תפעיל ספינר

    try {
      const success = await replaceRandomCheapest(cartItems);
      if (!success) {
        console.warn("לא נמצאו סופרים מתאימים לעגלה");
      }
    } catch (error) {
      console.error("Error optimizing cart:", error);
    } finally {
      setIsReplaceSupermarket(false); // ← תכבה ספינר
    }
  };

  if (isReplaceSupermarket || isLoadingPrices) {
    return (
      <div className="spinner-container">
        <Spin size="large"></Spin>
        <p>מחליף סופרמרקט</p>
      </div>
    );
  }

  ////////////////////////////////////////////////////
  if (isLoading) return <div>טוען עגלה…</div>;

  // if (!cartItems.length)
  //   return (
  //     <div className="cart-test_empty">
  //       <Link to="/products-list-test">
  //         <button>⮌ לעמוד רשימת מוצרים</button>
  //       </Link>
  //       <p>העגלה ריקה</p>
  //     </div>
  //   );

  const getDraftOrCurrentAmount = (item) =>
    draftAmounts[item.barcode] ?? item.amountInCart;

  const updateDraftAmount = (barcode, newValue) =>
    setDraftAmounts((prev) => ({ ...prev, [barcode]: newValue }));

  const clearDraftAmount = (barcode) =>
    setDraftAmounts(({ [barcode]: _, ...rest }) => rest);
  ///////////////////////////////////////////////////

  return (
    <div className="cart">
      {console.log("cart2 in cart.js", cart)}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <ReplaceProducts
          barcode={currentBarcode}
          closeModal={() => setModalOpen(false)}
          userId={userId}
        />
      </Modal>

      <ReplaceSupermarket
        isOpen={isReplaceSupermarketOpen}
        closeModal={() => setIsReplaceSupermarketOpen(false)}
        onSelectBranch={handleUpdateSupermarket}
      />

      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}

      <div className="cart-operations">
        {/* =============================================cart-operations_replace-supermarket START============================================= */}
        <div
          className="cart-operations_replace-supermarket"
          onClick={() => setIsReplaceSupermarketOpen(true)}
        >
          החלפת סופרמרקט{" "}
        </div>
        {/* =============================================cart-operations_replace-supermarket END============================================= */}

        {/* ////////////////////////////////////////cart-operations_cheapest-supermarket START//////////////////////////////////////// */}
        <div
          className="cart-operations_cheapest-supermarket"
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
          disabled={isReplaceSupermarket} // Disable the button when loading>
        >
          מחיר הכי זול
          {isReplaceSupermarket && <div>Loading...</div>}{" "}
          {/* Optional: Show a loading indicator */}
        </div>

        {/* ////////////////////////////////////////cart-operations_cheapest-supermarket END//////////////////////////////////////// */}

        {/* +++++++++++++++++++++++++++++++++++++cart-operations_optimal-carts-settings START++++++++++++++++++++++++++++++++++++++++ */}
        <div
          className="cart-operations_optimal-carts-settings"
          onClick={() => navigate("/optimal-carts-settings")}
        >
          מעבר לאופטימיזציית עגלות
        </div>
      </div>

      {/* +++++++++++++++++++++++++++++++++++++cart-operations_optimal-carts-settings END++++++++++++++++++++++++++++++++++++++++ */}

      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}
      {/* ///////////////////////////////////////////////////////////////////////////////////////////*/}

      <div className="supermarket">
        <div className="supermarket-title">
          <h3>הסופרמרקט הכי משתלם לעגלה שלך</h3>
        </div>
        <div className="supermarket-logo">
          <SupermarketImage supermarketName={currentSupermarket.name} />
        </div>
        <div className="supermarket-address">
          <div className="supermarket-address__city">
            {currentSupermarket && currentSupermarket.city}
          </div>
          <div className="supermarket-Street__street">
            ,{currentSupermarket && currentSupermarket.address}
          </div>
        </div>
        <hr className="line" />
      </div>
      <div className="total-price">
        <div className="total-price__title">
          <h1>סכום כולל של העגלה שלך</h1>
        </div>
        <div className="total-price__price">
          <h1>{totalPrice}₪</h1>
        </div>
      </div>
      <hr className="line" />

      <div className="products">
        {cartItems.length === 0 ? (
          <div className="cart-test_empty">
            <p>אין מוצרים בעגלה</p>
          </div>
        ) : (
          cartItems.map((item, index) => {
            const currentDraftAmount = getDraftOrCurrentAmount(item);
            const hasChanged = currentDraftAmount !== item.amountInCart;
            const currentTotal = calculateTotalPrice(item.amountInCart, item);
            const newTotal = calculateTotalPrice(currentDraftAmount, item);

            return (
              <div key={index}>
                <div
                  className="product"
                  onClick={() => {
                    setCurrentBarcode(item.barcode);
                    setModalOpen(true);
                  }}
                >
                  <div className="product-details">
                    <div className="product-details__name">
                      <span>{item.name.split(" ").slice(0, 3).join(" ")}</span>
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
                        <span>{convertWeightUnit(item.unitWeight)} </span>
                        <span className="size">{item.weight}</span>
                      </div>
                      <span
                        style={{
                          paddingRight: "3px",
                          paddingLeft: "3px",
                          display: "flex",
                          alignSelf: "normal",
                        }}
                      >
                        |
                      </span>
                      <div className="product-details__brand">
                        <span>{item.brand}</span>
                      </div>
                    </div>
                  </div>

                  <div className="product-price">
                    <div className="product-price__amount">
                      <span
                        style={{ fontSize: "0.8rem", alignSelf: "baseline" }}
                      >
                        'יח
                      </span>
                      <span>{item.amountInCart}</span>
                    </div>
                    <div className="product-price__total-price">
                      <b style={{ fontSize: "1.2em" }}>₪</b>
                      <span style={{ fontSize: "1.2rem" }}>
                        {item.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="product-image">
                    <Images barcode={item.barcode} />
                  </div>
                </div>

                {/* ===== totals difference visual (optional) ===== */}
                {hasChanged && (
                  <div className="product-diff">
                    <small>
                      {`סה"כ חדש: ${newTotal.toFixed(
                        2
                      )} ₪ → קודם: ${currentTotal.toFixed(2)} ₪`}
                    </small>
                  </div>
                )}

                <div className="update-amount">
                  <div className="update-amount__new">
                    <button
                      className="update-amount__minus-button"
                      onClick={() =>
                        updateDraftAmount(
                          item.barcode,
                          Math.max(1, currentDraftAmount - 1)
                        )
                      }
                    >
                      -
                    </button>

                    <input
                      type="text"
                      className="amount-display"
                      value={currentDraftAmount}
                      readOnly
                    />

                    <button
                      className="update-amount__plus-button"
                      onClick={() =>
                        updateDraftAmount(item.barcode, currentDraftAmount + 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="update-amount__update_and_cencal">
                    <div className="update-amount__update-button">
                      <button
                        disabled={!hasChanged}
                        onClick={() => {
                          update(item.barcode, currentDraftAmount);
                          clearDraftAmount(item.barcode);
                        }}
                      >
                        עדכן
                      </button>
                    </div>
                    <div className="update-amount__cancel-button">
                      <button onClick={() => clearDraftAmount(item.barcode)}>
                        בטל
                      </button>
                    </div>
                  </div>

                  <div className="cart__delete-product">
                    <button
                      onClick={() => {
                        remove(item.barcode);
                      }}
                    >
                      <img src={trashIcon} alt="Delete" />
                    </button>
                  </div>
                </div>
                <hr />
              </div>
            );
          })
        )}
      </div>

      <div
        className="green-button"
        style={{ display: cartItems.length === 0 ? "none" : "block" }}
      >
        <button className="green-button__button" onClick={handleConfirmCart}>
          Confirm Cart
        </button>
      </div>
    </div>
  );
}
