// import { useState, useEffect, useMemo } from "react";
import { useState, useEffect, useRef } from "react";
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
    // ק"ג
    return 'ק"ג';
  }
  if (weightUnit === "ml") {
    return 'מ"ל';
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

  // --- FLIP refs for cart rows (רק התנהגות/אנימציה, בלי שינוי עיצוב) ---
  const rowRefs = useRef(new Map());

  const setRowRef = (barcode) => (node) => {
    if (node) rowRefs.current.set(barcode, node);
    else rowRefs.current.delete(barcode);
  };

  const measureTops = () => {
    const tops = new Map();
    cartItems.forEach((item) => {
      const el = rowRefs.current.get(item.barcode);
      if (el) tops.set(item.barcode, el.getBoundingClientRect().top);
    });
    return tops;
  };

  const removeWithFLIP = (barcode) => {
    const first = measureTops();

    // מסיר מהקונקסט (אותה התנהגות של remove)
    remove(barcode);

    // מפעיל FLIP על השורות שנשארו
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        rowRefs.current.forEach((el, key) => {
          const oldTop = first.get(key);
          if (oldTop == null) return;
          const newTop = el.getBoundingClientRect().top;
          const dy = oldTop - newTop;
          if (dy !== 0) {
            el.style.transition = "none";
            el.style.transform = `translateY(${dy}px)`;
            requestAnimationFrame(() => {
              el.style.transition = "transform 260ms cubic-bezier(.2,.8,.25,1)";
              el.style.transform = "translateY(0)";
              setTimeout(() => {
                if (!el) return;
                el.style.transition = "";
                el.style.transform = "";
              }, 300);
            });
          }
        });
      });
    });
  };

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
        {/* <div className="supermarket-title">
          <h3>הסופרמרקט הכי משתלם לעגלה שלך</h3>
        </div> */}
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
          cartItems.map((item) => {
            const currentDraftAmount = getDraftOrCurrentAmount(item);
            const hasChanged = currentDraftAmount !== item.amountInCart;
            const currentTotal = calculateTotalPrice(item.amountInCart, item);
            const newTotal = calculateTotalPrice(currentDraftAmount, item);

            return (
              <SwipeRow
                key={item.barcode}
                outerRef={setRowRef(item.barcode)}
                onIncrement={() => update(item.barcode, item.amountInCart + 1)}
                onDecrement={() =>
                  update(item.barcode, Math.max(1, item.amountInCart - 1))
                }
                onRemove={() => removeWithFLIP(item.barcode)}
              >
                <div>
                  <div
                    className="product"
                    onClick={() => {
                      setCurrentBarcode(item.barcode);
                      setModalOpen(true);
                    }}
                  >
                    <div className="product-details">
                      <div className="product-details__name">
                        <span>
                          {item.name.split(" ").slice(0, 3).join(" ")}
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "row-reverse",
                          alignItems: "flex-start",
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
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraftAmount(
                            item.barcode,
                            Math.max(1, currentDraftAmount - 1)
                          );
                        }}
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
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraftAmount(
                            item.barcode,
                            currentDraftAmount + 1
                          );
                        }}
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
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeWithFLIP(item.barcode);
                        }}
                      >
                        <img src={trashIcon} alt="Delete" />
                      </button>
                    </div>
                  </div>

                  <hr />
                </div>
              </SwipeRow>
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

// ------------------------------------------------------
// רטט להחלקה (משותף לכל השורות)
// ------------------------------------------------------
const SWIPE_VIBRATION_FACTOR = 5; // כמו swipeVibration ב־vibrate.js
const SWIPE_DISTANCE_MIN_FOR_BIG = 50; // כמו swipeDistanceMin
const SWIPE_BIG_MS = 150; // כמו bigSwipeVibration

const hasVibration =
  typeof navigator !== "undefined" && typeof navigator.vibrate === "function";

const vibrate = (pattern) => {
  if (!hasVibration) return;
  navigator.vibrate(pattern);
};

function SwipeRow({ children, onIncrement, onDecrement, onRemove, outerRef }) {
  const LONG_MS = 1000; // משך לחיצה ארוכה
  const LONG_VISUAL_DELAY = 200; // אחרי 0.2s מתחילה הגדילה של המסגרת
  const SWIPE_TRIGGER = 40; // מינימום לסווייפ קצר (לפלוס/מינוס)
  const REMOVE_THRESHOLD = 140; // כמה לגרור ימינה למחיקה
  const MAX_NORMAL_SHIFT = 60; // תזוזה פיזית מקסימלית בסווייפ קצר
  const DEADZONE_NORMAL = 20; // אזור מת במצב רגיל
  const DEADZONE_DELETE = 12; // אזור מת במצב מחיקה

  const [dxDelete, setDxDelete] = useState(0);
  const [dxNormal, setDxNormal] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [spring, setSpring] = useState(false);
  const [swipeActive, setSwipeActive] = useState(false);
  const [pressProgress, setPressProgress] = useState(0); // 0..1

  const startX = useRef(0);
  const startY = useRef(0);
  const longPressTimer = useRef(null);
  const rafId = useRef(null);
  const pressStart = useRef(0);
  const moved = useRef(0);
  const lastDxRef = useRef(0); // תזוזה אחרונה, כדי לחשב רטט קטן

  const clearLP = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const stopRaf = () => {
    if (rafId.current) {
      cancelAnimationFrame(rafId.current);
      rafId.current = null;
    }
  };

  const tickPress = () => {
    const now = performance.now();
    const elapsed = now - pressStart.current;
    if (elapsed <= LONG_VISUAL_DELAY) {
      setPressProgress(0);
    } else {
      const ratio = Math.min(
        1,
        (elapsed - LONG_VISUAL_DELAY) / (LONG_MS - LONG_VISUAL_DELAY)
      );
      setPressProgress(ratio);
    }
    rafId.current = requestAnimationFrame(tickPress);
  };

  const begin = (clientX, clientY) => {
    startX.current = clientX;
    startY.current = clientY ?? 0;
    moved.current = 0;
    lastDxRef.current = 0;
    setDragging(true);
    setDeleteMode(false);
    setSwipeActive(false);
    setDxDelete(0);
    setDxNormal(0);
    setSpring(false);
    setPressProgress(0);
    clearLP();
    stopRaf();
    pressStart.current = performance.now();
    rafId.current = requestAnimationFrame(tickPress);
    longPressTimer.current = setTimeout(() => {
      setDeleteMode(true);
      setPressProgress(1); // הגיע לקצה
      setDxNormal(0); // ✅ איפוס התזוזה הרגילה כשעוברים למצב מחיקה
      setSwipeActive(false);
    }, LONG_MS);
  };

  const move = (clientX, clientY) => {
    if (!dragging) return;
    const deltaX = clientX - startX.current;
    const deltaY = (clientY ?? 0) - startY.current;
    moved.current = deltaX;

    if (deleteMode) {
      if (!swipeActive) {
        if (deltaX >= DEADZONE_DELETE && Math.abs(deltaX) > Math.abs(deltaY)) {
          setSwipeActive(true);
        } else {
          return;
        }
      }
      setDxDelete(Math.max(0, deltaX));
      return;
    }

    if (!swipeActive) {
      if (
        Math.abs(deltaX) >= DEADZONE_NORMAL &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        setSwipeActive(true);
      } else {
        return;
      }
    }

    const clamped = Math.max(
      -MAX_NORMAL_SHIFT,
      Math.min(MAX_NORMAL_SHIFT, deltaX)
    );
    setDxNormal(clamped);

    // ----- רטט קטן לפי מהירות ההחלקה (מצב רגיל בלבד) -----
    const step = Math.abs(deltaX - lastDxRef.current);
    if (step > 2 && SWIPE_VIBRATION_FACTOR > 0) {
      const vibrateMs = Math.min(step * SWIPE_VIBRATION_FACTOR, 100);
      vibrate(vibrateMs);
    }
    lastDxRef.current = deltaX;
  };

  const end = () => {
    if (!dragging) return;
    clearLP();
    stopRaf();
    setDragging(false);

    if (deleteMode) {
      if (dxDelete >= REMOVE_THRESHOLD) {
        setDxDelete(260);
        setTimeout(onRemove, 140);
      } else {
        if (dxDelete !== 0) {
          setSpring(true);
        }
        setDxDelete(0);
        setDeleteMode(false);
        setDxNormal(0); // ✅ לוודא שאחרי יציאה ממצב מחיקה אין תזוזה ישנה
      }
      setSwipeActive(false);
      setPressProgress(0);
      return;
    }

    if (swipeActive && Math.abs(moved.current) >= SWIPE_TRIGGER) {
      if (moved.current > 0) onIncrement();
      else onDecrement();

      // ----- רטט גדול בסיום סווייפ, רק אם המרחק מספיק -----
      const absMove = Math.abs(moved.current);
      if (absMove >= SWIPE_DISTANCE_MIN_FOR_BIG && SWIPE_BIG_MS > 0) {
        vibrate(SWIPE_BIG_MS);
      }
    }

    if (dxNormal !== 0) {
      setSpring(true);
    }
    setDxNormal(0);
    setSwipeActive(false);
    setPressProgress(0);
  };

  const onMouseDown = (e) => begin(e.clientX, e.clientY);
  const onMouseMove = (e) => move(e.clientX, e.clientY);
  const onMouseUp = end;
  const onMouseLeave = () => dragging && end();

  const onTouchStart = (e) => begin(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchMove = (e) => {
    move(e.touches[0].clientX, e.touches[0].clientY);
    if (swipeActive) e.preventDefault();
  };
  const onTouchEnd = end;

  const uiDx = deleteMode ? dxDelete : dxNormal;
  const borderRatio = pressProgress; // 0..1

  const shadowStage = !deleteMode
    ? "idle"
    : dxDelete >= REMOVE_THRESHOLD
    ? "armed"
    : dxDelete > 0
    ? "show"
    : "idle";

  return (
    <div
      ref={outerRef}
      className="swipe-container"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      {/* רקע למחיקה מאחורי הכרטיסייה */}
      <div
        className={`shadow ${shadowStage}`}
        style={{ width: Math.min(dxDelete, REMOVE_THRESHOLD) + 12 }}
      >
        {shadowStage === "show" && (
          <span className="shadow-text">החזק 1ש׳ ואז החלק ימינה למחיקה</span>
        )}
        {shadowStage === "armed" && (
          <span className="shadow-text strong">שחרר כדי למחוק</span>
        )}
      </div>

      {/* התוכן המקורי של הכרטיסייה (product וכו') */}
      <div
        className={`swipe-content ${dragging ? "dragging" : ""} ${
          spring ? "spring" : ""
        }`}
        style={{
          transform: `translateX(${uiDx}px)`,
          "--startX": `${uiDx}px`,
          boxShadow:
            borderRatio > 0
              ? `0 0 0 ${1 + 3 * borderRatio}px rgba(255,59,48,${
                  0.4 + 0.6 * borderRatio
                })`
              : "none",
        }}
        onAnimationEnd={() => setSpring(false)}
      >
        {children}
      </div>
    </div>
  );
}
