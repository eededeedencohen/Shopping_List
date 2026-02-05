// import { useState, useEffect, useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import ReplaceProducts from "./ReplaceProducts";
import ReplaceSupermarket from "./ReplaceSupermarket/ReplaceSupermarket";
import styles from "./Cart.module.css";
import { Spin } from "antd";
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";
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
  const [loadingMessage, setLoadingMessage] = useState("טוען...");

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
    setLoadingMessage("מחליף סופרמרקט...");
    setIsReplaceSupermarket(true);
    try {
      replaceSupermarket(newSupermarketID);
    } catch (error) {
      console.error("Error replacing supermarket:", error);
    } finally {
      setIsReplaceSupermarket(false);
      setIsReplaceSupermarketOpen(false);
    }
  };

  const handleUpdateSupermarket = async (supermarketID) => {
    await handleUpdateAndLoad(supermarketID);
  };

  const handleCheapestCart = async () => {
    setLoadingMessage("מחפש את המחיר הכי זול...");
    setIsReplaceSupermarket(true);

    try {
      const success = await replaceRandomCheapest(cartItems);
      if (!success) {
        console.warn("לא נמצאו סופרים מתאימים לעגלה");
      }
    } catch (error) {
      console.error("Error optimizing cart:", error);
    } finally {
      setIsReplaceSupermarket(false);
    }
  };

  if (isReplaceSupermarket || isLoadingPrices) {
    return (
      <div className={styles['spinner-container']}>
        <Spin size="large"></Spin>
        <p>{loadingMessage}</p>
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
    <div className={styles.cart}>
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

      <div className={styles['cart-operations']}>
        {/* =============================================cart-operations_replace-supermarket START============================================= */}
        <div
          className={styles['cart-operations_replace-supermarket']}
          onClick={() => setIsReplaceSupermarketOpen(true)}
        >
          החלפת סופרמרקט{" "}
        </div>
        {/* =============================================cart-operations_replace-supermarket END============================================= */}

        {/* ////////////////////////////////////////cart-operations_cheapest-supermarket START//////////////////////////////////////// */}
        <div
          className={styles['cart-operations_cheapest-supermarket']}
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
          className={styles['cart-operations_optimal-carts-settings']}
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

      <div className={styles.supermarket}>
        {/* <div className="supermarket-title">
          <h3>הסופרמרקט הכי משתלם לעגלה שלך</h3>
        </div> */}
        <div className={styles['supermarket-logo']}>
          <SupermarketImage supermarketName={currentSupermarket.name} />
        </div>
        <div className={styles['supermarket-address']}>
          <div className={styles['supermarket-address__city']}>
            {currentSupermarket && currentSupermarket.city}
          </div>
          <div className={styles['supermarket-Street__street']}>
            ,{currentSupermarket && currentSupermarket.address}
          </div>
        </div>
        <hr className={styles.line} />
      </div>
      <div className={styles['total-price']}>
        <div className={styles['total-price__title']}>
          <h1>סכום כולל של העגלה שלך</h1>
        </div>
        <div className={styles['total-price__price']}>
          <h1>{totalPrice}₪</h1>
        </div>
      </div>
      <hr className={styles.line} />
      <div className={styles.products}>
        {cartItems.length === 0 ? (
          <div className={styles['cart-test_empty']}>
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
                    className={styles.product}
                    onClick={() => {
                      setCurrentBarcode(item.barcode);
                      setModalOpen(true);
                    }}
                  >
                    <div className={styles['product-details']}>
                      <div className={styles['product-details__name']}>
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
                        <div className={styles['product-details__weight']}>
                          <span>{convertWeightUnit(item.unitWeight)} </span>
                          <span className={styles.size}>{item.weight}</span>
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
                        <div className={styles['product-details__brand']}>
                          <span>{item.brand}</span>
                        </div>
                      </div>
                    </div>

                    <div className={styles['product-price']}>
                      <div className={styles['product-price__amount']}>
                        <span
                          style={{ fontSize: "0.8rem", alignSelf: "baseline" }}
                        >
                          'יח
                        </span>
                        <span>{item.amountInCart}</span>
                      </div>
                      <div className={styles['product-price__total-price']}>
                        <b style={{ fontSize: "1.2em" }}>₪</b>
                        <span style={{ fontSize: "1.2rem" }}>
                          {item.totalPrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className={styles['product-image']}>
                      <ProductImageDisplay barcode={item.barcode} />
                    </div>
                  </div>

                  {/* ===== הצגת מחיר חדש בעת עריכה ===== */}
                  {hasChanged && (
                    <div className={styles['product-diff']}>
                      <div className={styles['product-diff__content']}>
                        <span className={styles['product-diff__new']}>
                          <span className={styles['product-diff__label']}>חדש:</span>
                          <span className={styles['product-diff__value']}>{newTotal.toFixed(2)}₪</span>
                        </span>
                        <span className={styles['product-diff__arrow']}>←</span>
                        <span className={styles['product-diff__old']}>
                          <span className={styles['product-diff__label']}>קודם:</span>
                          <span className={styles['product-diff__value']}>{currentTotal.toFixed(2)}₪</span>
                        </span>
                      </div>
                    </div>
                  )}

                  <div className={`${styles['update-amount']} ${hasChanged ? styles['update-amount--editing'] : ''}`}>
                    <div className={styles['update-amount__new']}>
                      <button
                        className={styles['update-amount__minus-button']}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraftAmount(
                            item.barcode,
                            Math.max(1, currentDraftAmount - 1),
                          );
                        }}
                      >
                        -
                      </button>

                      <input
                        type="text"
                        className={styles['amount-display']}
                        value={currentDraftAmount}
                        readOnly
                      />

                      <button
                        className={styles['update-amount__plus-button']}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          updateDraftAmount(
                            item.barcode,
                            currentDraftAmount + 1,
                          );
                        }}
                      >
                        +
                      </button>
                    </div>

                    {hasChanged && (
                      <div className={styles['update-amount__update_and_cencal']}>
                        <button
                          className={styles['update-amount__update-btn']}
                          onClick={() => {
                            update(item.barcode, currentDraftAmount);
                            clearDraftAmount(item.barcode);
                          }}
                        >
                          עדכן
                        </button>
                        <button
                          className={styles['update-amount__cancel-btn']}
                          onClick={() => clearDraftAmount(item.barcode)}
                        >
                          בטל
                        </button>
                      </div>
                    )}

                    <div className={styles['cart__delete-product']}>
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

      {cartItems.length > 0 && (
        <div className={styles['confirm-footer']}>
          <button className={styles['confirm-footer__button']} onClick={handleConfirmCart}>
            <span className={styles['confirm-footer__icon']}>✓</span>
            <span className={styles['confirm-footer__text']}>אישור הזמנה</span>
            <span className={styles['confirm-footer__price']}>{totalPrice}₪</span>
          </button>
        </div>
      )}
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

// Chrome requires completed user gesture before vibration works
// We track touch END (not start) to ensure the gesture is complete
let userGestureCompleted = false;
if (typeof document !== "undefined") {
  const markGestureComplete = () => {
    userGestureCompleted = true;
    document.removeEventListener("touchend", markGestureComplete);
    document.removeEventListener("mouseup", markGestureComplete);
  };
  document.addEventListener("touchend", markGestureComplete, { once: true });
  document.addEventListener("mouseup", markGestureComplete, { once: true });
}

const vibrate = (pattern) => {
  // Only vibrate if user has completed at least one gesture
  if (!hasVibration || !userGestureCompleted) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    // Silently ignore vibration errors
  }
};

function SwipeRow({ children, onIncrement, onDecrement, onRemove, outerRef }) {
  const LONG_MS = 1000;
  const LONG_VISUAL_DELAY = 200;
  const SWIPE_TRIGGER = 40;
  const REMOVE_THRESHOLD = 140;
  const MAX_NORMAL_SHIFT = 60;
  const DEADZONE_NORMAL = 20;
  const DEADZONE_DELETE = 12;

  const [dxDelete, setDxDelete] = useState(0);
  const [dxNormal, setDxNormal] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [deleteMode, setDeleteMode] = useState(false);
  const [spring, setSpring] = useState(false);
  const [springStartX, setSpringStartX] = useState(0); // שמירת המיקום לאנימציה
  const [swipeActive, setSwipeActive] = useState(false);
  const [pressProgress, setPressProgress] = useState(0);

  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const longPressTimer = useRef(null);
  const rafId = useRef(null);
  const pressStart = useRef(0);
  const moved = useRef(0);
  const lastDxRef = useRef(0);
  const swipeActiveRef = useRef(false);

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
        (elapsed - LONG_VISUAL_DELAY) / (LONG_MS - LONG_VISUAL_DELAY),
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
    swipeActiveRef.current = false;
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
      setPressProgress(1);
      setDxNormal(0);
      setSwipeActive(false);
      swipeActiveRef.current = false;
    }, LONG_MS);
  };

  const move = (clientX, clientY, deleteModeLocal) => {
    if (!dragging) return;
    const deltaX = clientX - startX.current;
    const deltaY = (clientY ?? 0) - startY.current;
    moved.current = deltaX;

    if (deleteModeLocal) {
      if (!swipeActiveRef.current) {
        if (deltaX >= DEADZONE_DELETE && Math.abs(deltaX) > Math.abs(deltaY)) {
          swipeActiveRef.current = true;
          setSwipeActive(true);
        } else {
          return false;
        }
      }
      setDxDelete(Math.max(0, deltaX));
      return true;
    }

    if (!swipeActiveRef.current) {
      if (
        Math.abs(deltaX) >= DEADZONE_NORMAL &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        swipeActiveRef.current = true;
        setSwipeActive(true);
      } else {
        return false;
      }
    }

    const clamped = Math.max(
      -MAX_NORMAL_SHIFT,
      Math.min(MAX_NORMAL_SHIFT, deltaX),
    );
    setDxNormal(clamped);

    const step = Math.abs(deltaX - lastDxRef.current);
    if (step > 2 && SWIPE_VIBRATION_FACTOR > 0) {
      const vibrateMs = Math.min(step * SWIPE_VIBRATION_FACTOR, 100);
      vibrate(vibrateMs);
    }
    lastDxRef.current = deltaX;
    return true;
  };

  const end = (deleteModeLocal, dxDeleteLocal, dxNormalLocal) => {
    if (!dragging) return;
    clearLP();
    stopRaf();
    setDragging(false);

    if (deleteModeLocal) {
      if (dxDeleteLocal >= REMOVE_THRESHOLD) {
        setDxDelete(260);
        setTimeout(onRemove, 140);
      } else {
        if (dxDeleteLocal !== 0) {
          // שמירת המיקום לפני האיפוס לאנימציית הקפיצה
          setSpringStartX(dxDeleteLocal);
          setSpring(true);
        }
        setDxDelete(0);
        setDeleteMode(false);
        setDxNormal(0);
      }
      setSwipeActive(false);
      swipeActiveRef.current = false;
      setPressProgress(0);
      return;
    }

    if (swipeActiveRef.current && Math.abs(moved.current) >= SWIPE_TRIGGER) {
      if (moved.current > 0) onIncrement();
      else onDecrement();

      const absMove = Math.abs(moved.current);
      if (absMove >= SWIPE_DISTANCE_MIN_FOR_BIG && SWIPE_BIG_MS > 0) {
        vibrate(SWIPE_BIG_MS);
      }
    }

    if (dxNormalLocal !== 0) {
      // שמירת המיקום לפני האיפוס לאנימציית הקפיצה
      setSpringStartX(dxNormalLocal);
      setSpring(true);
    }
    setDxNormal(0);
    setSwipeActive(false);
    swipeActiveRef.current = false;
    setPressProgress(0);
  };

  // Mouse handlers
  const onMouseDown = (e) => begin(e.clientX, e.clientY);
  const onMouseMove = (e) => move(e.clientX, e.clientY, deleteMode);
  const onMouseUp = () => end(deleteMode, dxDelete, dxNormal);
  const onMouseLeave = () => dragging && end(deleteMode, dxDelete, dxNormal);

  // Touch handlers - using useEffect for non-passive listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e) => {
      if (!dragging) return;
      const shouldPrevent = move(e.touches[0].clientX, e.touches[0].clientY, deleteMode);
      // Only preventDefault if the event is cancelable (not already scrolling)
      if (shouldPrevent && swipeActiveRef.current && e.cancelable) {
        e.preventDefault();
      }
    };

    container.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener('touchmove', handleTouchMove);
    };
  }, [dragging, deleteMode]);

  const onTouchStart = (e) => begin(e.touches[0].clientX, e.touches[0].clientY);
  const onTouchEnd = () => end(deleteMode, dxDelete, dxNormal);

  const uiDx = deleteMode ? dxDelete : dxNormal;
  const borderRatio = pressProgress;

  const shadowStage = !deleteMode
    ? "idle"
    : dxDelete >= REMOVE_THRESHOLD
      ? "armed"
      : dxDelete > 0
        ? "show"
        : "idle";

  // Combine refs
  const setRefs = (node) => {
    containerRef.current = node;
    if (outerRef) outerRef(node);
  };

  return (
    <div
      ref={setRefs}
      className={styles['swipe-container']}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onContextMenu={(e) => e.preventDefault()}
      style={{ cursor: dragging ? "grabbing" : "grab" }}
    >
      <div
        className={`${styles.shadow} ${styles[shadowStage] || ''}`}
        style={{ width: Math.min(dxDelete, REMOVE_THRESHOLD) + 12 }}
      >
        {shadowStage === "show" && (
          <span className={styles['shadow-text']}>החזק 1ש׳ ואז החלק ימינה למחיקה</span>
        )}
        {shadowStage === "armed" && (
          <span className={`${styles['shadow-text']} ${styles.strong}`}>שחרר כדי למחוק</span>
        )}
      </div>

      <div
        className={`${styles['swipe-content']} ${dragging ? styles.dragging : ""} ${spring ? styles.spring : ""}`}
        style={{
          transform: spring ? undefined : `translateX(${uiDx}px)`,
          "--startX": `${springStartX}px`,
          boxShadow:
            borderRatio > 0
              ? `0 0 0 ${1 + 3 * borderRatio}px rgba(255,59,48,${0.4 + 0.6 * borderRatio})`
              : "none",
        }}
        onAnimationEnd={() => {
          setSpring(false);
          setSpringStartX(0);
        }}
      >
        {children}
      </div>
    </div>
  );
}
