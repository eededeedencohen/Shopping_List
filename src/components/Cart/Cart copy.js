import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useProducts } from "../../context/ProductContext";
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
} from "../../hooks/appHooks";

import { calculateTotalPrice } from "../../utils/priceCalculations"; // ⬅️ util

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

  const { cart: cart2, isLoading: isLoading2 } = useCartState(); // ← קיבלנו גם cart
  const { totalAmount, totalPrice } = useCartTotals();
  const { update, remove, replaceSupermarket } = useCartActions();
  const cartItems = useCartItems();
  const navigate = useNavigate();
  const { loadProducts } = useProducts();
  const userId = "1"; // Replace this with the actual userId.

  //////////////////////////////////////////////////////////////
  //============================================================
  const [draftAmounts, setDraftAmounts] = useState({});
  const [supermarketDraftId, setSupermarketDraftId] = useState("");

  const draftTotals = useMemo(() => {
    let totalQuantity = 0;
    let totalCost = 0;
    cartItems.forEach((item) => {
      const quantity = draftAmounts[item.barcode] ?? item.amountInCart;
      totalQuantity += quantity;
      totalCost += calculateTotalPrice(quantity, item);
    });
    return { amt: totalQuantity, price: totalCost };
  }, [cartItems, draftAmounts]);

  //============================================================
  //////////////////////////////////////////////////////////////

  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReplaceSupermarket, setIsReplaceSupermarket] = useState(false);

  // Modals
  const [isModalOpen, setModalOpen] = useState(false);
  const [isReplaceSupermarketOpen, setIsReplaceSupermarketOpen] =
    useState(false);

  const [currentBarcode, setCurrentBarcode] = useState(null);

  //=============================================

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
      update(barcode, 1); // Update local cart state
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
      // new cart delete also:
      remove(barcode); // Remove from local cart state
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

  const handleUpdateAndLoad = async (supermarketID) => {
    setIsReplaceSupermarket(true); // מתחיל לטעון
    try {
      await updateSupermarketID(userId, supermarketID);
      await loadCart(userId);
      await loadProducts();
    } catch (error) {
      console.error("Error updating supermarket ID or loading cart:", error);
    } finally {
      setIsReplaceSupermarket(false); // סיים לטעון
      setIsReplaceSupermarketOpen(false); // סגירת המודל
    }
  };

  const handleUpdateSupermarket = async (supermarketID) => {
    await handleUpdateAndLoad(supermarketID);
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

  ////////////////////////////////////////////////////
  if (isLoading) return <div>טוען עגלה…</div>;

  if (!cartItems.length)
    return (
      <div className="cart-test_empty">
        <Link to="/products-list-test">
          <button>⮌ לעמוד רשימת מוצרים</button>
        </Link>
        <p>העגלה ריקה</p>
      </div>
    );

    const getDraftOrCurrentAmount = (item) =>
      draftAmounts[item.barcode] ?? item.amountInCart;
  
    const updateDraftAmount = (barcode, newValue) =>
      setDraftAmounts((prev) => ({ ...prev, [barcode]: newValue }));
  
    const clearDraftAmount = (barcode) =>
      setDraftAmounts(({ [barcode]: _, ...rest }) => rest);
  ///////////////////////////////////////////////////

  return (
    <div className="cart">
      {console.log("cart2 in cart.js", cart2)}
      {console.log("cart in cart.js", cart)}
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <ReplaceProducts
          barcode={currentBarcode}
          closeModal={() => setModalOpen(false)}
          loadCart={loadCart}
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
                  setCurrentBarcode(item.product.barcode); // Change here
                  setModalOpen(true);
                }}
              >
                <div className="product-details">
                  <div className="product-details__name">
                    <span>
                      {item.product.name.split(" ").slice(0, 3).join(" ")}{/* Change here */}
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
                      <span>{convertWeightUnit(item.product.unitWeight)} </span> {/* Change here */}
                      <span className="size">{item.product.weight}</span> {/* Change here */}
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
                      <span>{item.product.brand}</span>{/* Change here */}
                    </div>
                  </div>
                </div>
                <div className="product-price">
                  <div className="product-price__amount">
                    <span style={{ fontSize: "0.8rem", alignSelf: "baseline" }}>
                      'יח
                    </span>
                    <span>{item.amount}</span>{/* Change here */}
                  </div>
                  <div className="product-price__total-price">
                    <b style={{ fontSize: "1.2em" }}>₪</b>
                    <span style={{ fontSize: "1.2rem" }}>
                      {parseFloat(item.totalPrice).toFixed(2)} {/* Change here */}
                    </span>
                  </div>
                </div>
                <div className="product-image">
                  <Images barcode={item.product.barcode} /> {/* Change here */}
                </div>
              </div>

              {/* =======================================
              END HERE TO ORGENIZE THE PRODUCTS 
              ===========================================*/}

              {/*========================= UPDATE AMOUNT SECTION ========================= */}

              <div className="update-amount">
                <div className="update-amount__new">
                  <button
                    className="update-amount__minus-button"
                    onClick={() => handleDecrement(item.product.barcode)} // Change here
                  >
                    -
                  </button>

                  <input
                    type="text"
                    className="amount-display"
                    value={item.amount} // Change here
                    readOnly
                  />

                  <button
                    className="update-amount__plus-button"
                    onClick={() => handleIncrement(item.product.barcode)} // Change here
                  >
                    +
                  </button>
                </div>
                <div className="update-amount__update_and_cencal">
                  <div className="update-amount__update-button">
                    <button
                      onClick={() => {
                        setCurrentBarcode(item.product.barcode);  // Change here
                        console.log(currentBarcode);
                        handleUpdate(item.product.barcode); // Change here
                      }}
                    >
                      עדכן
                    </button>
                  </div>
                  <div className="update-amount__cancel-button">
                    <button
                      onClick={() => {
                        console.log("ביטול");
                      }}
                    >
                      בטל
                    </button>
                  </div>
                </div>
                <div className="cart__delete-product">
                  <button
                    onClick={() => {
                      setCurrentBarcode(item.product.barcode); // Change here
                      console.log(currentBarcode);
                      handleDelete(item.product.barcode); // Change here
                    }}
                  >
                    <img src={trashIcon} alt="Delete" />
                  </button>
                </div>
              </div>

              {/*======================= UPDATE AMOUNT SECTION =========================== */}
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

// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Modal from "./Modal";
// import ReplaceProducts from "./ReplaceProducts";
// import ReplaceSupermarket from "./ReplaceSupermarket/ReplaceSupermarket";
// import "./Cart.css";
// import { Spin } from "antd";
// import Images from "../ProductList/Images";
// import SupermarketImage from "./supermarketImage";
// import trashIcon from "./trash.png";
// import { useCartActions } from "../../hooks/appHooks";
// import { useProducts } from "../../context/ProductContext";
// import { useFullCart } from "../../hooks/appHooks";

// export const convertWeightUnit = (weightUnit) => {
//   weightUnit = weightUnit?.toLowerCase();
//   if (weightUnit === "g") return "גרם";
//   if (weightUnit === "kg") return "קילוגרם";
//   if (weightUnit === "ml") return "מיליליטר";
//   if (weightUnit === "l") return "ליטר";
//   return weightUnit;
// };

// export default function Cart() {
//   const { fullCart } = useFullCart();
//   const {
//     add,
//     update,
//     remove,
//     replaceSupermarket,
//     sync,
//     isLoadingPrices,
//   } = useCartActions();

//   const { loadProducts } = useProducts();
//   const navigate = useNavigate();

//   const [isSaving, setIsSaving] = useState(false);
//   const [isReplaceSupermarket, setIsReplaceSupermarket] = useState(false);
//   const [isModalOpen, setModalOpen] = useState(false);
//   const [isReplaceSupermarketOpen, setIsReplaceSupermarketOpen] = useState(false);
//   const [currentBarcode, setCurrentBarcode] = useState(null);

//   const handleIncrement = (barcode) => add(barcode);
//   const handleDecrement = (barcode) => update(barcode, Math.max(1, fullCart.productsWithPrices.find(p => p.product.barcode === barcode)?.amount - 1));
//   const handleUpdate = () => sync();
//   const handleDelete = (barcode) => remove(barcode);

//   const handleUpdateSupermarket = async (supermarketID) => {
//     setIsReplaceSupermarket(true);
//     try {
//       replaceSupermarket(supermarketID);
//       await loadProducts();
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setIsReplaceSupermarket(false);
//       setIsReplaceSupermarketOpen(false);
//     }
//   };

//   if (isLoadingPrices || !fullCart) {
//     return (
//       <div className="spinner-container">
//         <Spin size="large" />
//         <p>טוען עגלה אופטימלית...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="cart">
//       <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
//         <ReplaceProducts
//           barcode={currentBarcode}
//           closeModal={() => setModalOpen(false)}
//         />
//       </Modal>

//       <ReplaceSupermarket
//         isOpen={isReplaceSupermarketOpen}
//         closeModal={() => setIsReplaceSupermarketOpen(false)}
//         onSelectBranch={handleUpdateSupermarket}
//       />

//       <div className="cart-operations">
//         <div
//           className="cart-operations_replace-supermarket"
//           onClick={() => setIsReplaceSupermarketOpen(true)}
//         >
//           החלפת סופרמרקט
//         </div>

//         <div
//           className="cart-operations_optimal-carts-settings"
//           onClick={() => navigate("/optimal-carts-settings")}
//         >
//           מעבר לאופטימיזציית עגלות
//         </div>
//       </div>

//       <div className="supermarket">
//         <div className="supermarket-title">
//           <h3>הסופרמרקט הכי משתלם לעגלה שלך</h3>
//         </div>
//         <div className="supermarket-logo">
//           <SupermarketImage supermarketName={fullCart.supermarket.name} />
//         </div>
//         <div className="supermarket-address">
//           <div className="supermarket-address__city">{fullCart.supermarket.city}</div>
//           <div className="supermarket-Street__street">,{fullCart.supermarket.address}</div>
//         </div>
//         <hr className="line" />
//       </div>

//       <div className="total-price">
//         <div className="total-price__title">
//           <h1>סכום כולל של העגלה שלך</h1>
//         </div>
//         <div className="total-price__price">
//           <h1>{fullCart.totalPrice}₪</h1>
//         </div>
//       </div>
//       <hr className="line" />

//       <div className="products">
//         {fullCart.productsWithPrices.map((item, index) => (
//           <div key={index}>
//             <div
//               className="product"
//               onClick={() => {
//                 setCurrentBarcode(item.product.barcode);
//                 setModalOpen(true);
//               }}
//             >
//               <div className="product-details">
//                 <div className="product-details__name">
//                   <span>{item.product.name.split(" ").slice(0, 3).join(" ")}</span>
//                 </div>
//                 <div className="product-details__weight">
//                   <span>{convertWeightUnit(item.product.unitWeight)} </span>
//                   <span className="size">{item.product.weight}</span>
//                 </div>
//                 <div className="product-details__brand">
//                   <span>{item.product.brand}</span>
//                 </div>
//               </div>
//               <div className="product-price">
//                 <div className="product-price__amount">
//                   <span style={{ fontSize: "0.8rem", alignSelf: "baseline" }}>
//                     'יח
//                   </span>
//                   <span>{item.amount}</span>
//                 </div>
//                 <div className="product-price__total-price">
//                   <b style={{ fontSize: "1.2em" }}>₪</b>
//                   <span style={{ fontSize: "1.2rem" }}>
//                     {parseFloat(item.totalPrice).toFixed(2)}
//                   </span>
//                 </div>
//               </div>
//               <div className="product-image">
//                 <Images barcode={item.product.barcode} />
//               </div>
//             </div>

//             <div className="update-amount">
//               <div className="update-amount__new">
//                 <button
//                   className="update-amount__minus-button"
//                   onClick={() => handleDecrement(item.product.barcode)}
//                 >
//                   -
//                 </button>
//                 <button
//                   className="update-amount__plus-button"
//                   onClick={() => handleIncrement(item.product.barcode)}
//                 >
//                   +
//                 </button>
//               </div>
//               <div className="update-amount__update_and_cencal">
//                 <div className="update-amount__update-button">
//                   <button onClick={handleUpdate}>עדכן</button>
//                 </div>
//                 <div className="update-amount__cancel-button">
//                   <button onClick={() => console.log("ביטול")}>בטל</button>
//                 </div>
//               </div>
//               <div className="cart__delete-product">
//                 <button onClick={() => handleDelete(item.product.barcode)}>
//                   <img src={trashIcon} alt="Delete" />
//                 </button>
//               </div>
//             </div>
//             <hr />
//           </div>
//         ))}
//       </div>

//       <div className="green-button">
//         <button className="green-button__button" onClick={handleUpdate}>
//           Confirm Cart
//         </button>
//       </div>
//     </div>
//   );
// }
