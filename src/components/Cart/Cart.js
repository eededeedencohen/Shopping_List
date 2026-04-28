// import { useState, useEffect, useMemo } from "react";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import ReplaceProducts from "./ReplaceProducts";
import ReplaceSupermarket from "./ReplaceSupermarket/ReplaceSupermarket";
import styles from "./Cart.module.css";
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import SupermarketImage from "../Images/SupermarketImage";

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
        {/* Spark particles */}
        <div className={styles['spark-particles']}>
          <span /><span /><span /><span />
          <span /><span /><span /><span />
        </div>

        {/* Center scene */}
        <div className={styles['orbit-scene']}>
          {/* Pulsing rings */}
          <div className={styles['pulse-rings']}>
            <span /><span /><span />
          </div>

          {/* Cart */}
          <div className={styles['orbit-cart']}>🛒</div>

          {/* Outer orbit — 6 coins clockwise */}
          <div className={styles['orbit-ring']}>
            <span>₪</span><span>₪</span><span>₪</span>
            <span>₪</span><span>₪</span><span>₪</span>
          </div>

          {/* Inner orbit — 3 coins counter-clockwise */}
          <div className={styles['orbit-ring-inner']}>
            <span>₪</span><span>₪</span><span>₪</span>
          </div>
        </div>

        {/* Text */}
        <p>{loadingMessage}</p>
        <p className={styles['scan-subtitle']}>סורק מחירים עבורך</p>
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

      {/* ── Sticky Top Section ── */}
      <div className={styles['sticky-top']}>
        {/* Operations */}
        <div className={styles['cart-operations']}>
          <div
            className={styles['cart-operations_replace-supermarket']}
            onClick={() => setIsReplaceSupermarketOpen(true)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5"/><path d="M8 3H3v5"/><path d="M21 3l-7 7"/><path d="M3 3l7 7"/><path d="M16 21h5v-5"/><path d="M8 21H3v-5"/><path d="M21 21l-7-7"/><path d="M3 21l7-7"/></svg>
            החלפת סופר
          </div>
          <div
            className={styles['cart-operations_cheapest-supermarket']}
            onClick={() => {
              const handleOptimizeCart = async () => {
                setIsReplaceSupermarket(true);
                try { await handleCheapestCart(); }
                catch (error) { console.error("Error optimizing cart:", error); }
                finally { setIsReplaceSupermarket(false); }
              };
              handleOptimizeCart();
            }}
            disabled={isReplaceSupermarket}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            הכי זול
          </div>
          <div
            className={styles['cart-operations_optimal-carts-settings']}
            onClick={() => navigate("/optimal-carts-settings")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            אופטימיזציה
          </div>
        </div>

        {/* Supermarket + Price — Same Row */}
        <div className={styles['info-row']}>
          <div className={styles['info-row__supermarket']}>
            <div className={styles['info-row__logo']}>
              <SupermarketImage supermarketName={currentSupermarket.name} />
            </div>
            <div className={styles['info-row__details']}>
              <span className={styles['info-row__city']}>
                {currentSupermarket && currentSupermarket.city}
              </span>
              <span className={styles['info-row__address']}>
                {currentSupermarket && currentSupermarket.address}
              </span>
            </div>
          </div>
          <div className={styles['info-row__price']}>
            <span className={styles['info-row__price-label']}>סה״כ</span>
            <span className={styles['info-row__price-value']}>{totalPrice}₪</span>
          </div>
        </div>
      </div>
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
                <div className={styles['pg']}>
                  {/* X delete — top-left corner, always visible */}
                  <button
                    className={styles['pg-btn-delete']}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.stopPropagation();
                      const container = rowRefs.current.get(item.barcode);
                      if (container) {
                        container.style.pointerEvents = 'none';
                        container.animate(
                          [
                            { transform: 'translateX(0)', opacity: 1, filter: 'blur(0)' },
                            { transform: 'translateX(70%) scale(0.96) rotate(1.5deg)', opacity: 0.3, filter: 'blur(1px)', offset: 0.6 },
                            { transform: 'translateX(110%) scale(0.92) rotate(3deg)', opacity: 0, filter: 'blur(4px)' },
                          ],
                          { duration: 400, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'forwards' }
                        );
                        setTimeout(() => removeWithFLIP(item.barcode), 420);
                      } else {
                        removeWithFLIP(item.barcode);
                      }
                    }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>

                  {/* RIGHT in RTL: Image */}
                  <div
                    className={styles['pg-image']}
                    onClick={() => { setCurrentBarcode(item.barcode); setModalOpen(true); }}
                  >
                    <ProductImageDisplay barcode={item.barcode} />
                  </div>

                  {/* MIDDLE: Name + Meta */}
                  <div
                    className={styles['pg-details']}
                    onClick={() => { setCurrentBarcode(item.barcode); setModalOpen(true); }}
                  >
                    <span className={styles['pg-details__name']}>{item.name}</span>
                    <span className={styles['pg-details__meta']}>{item.brand} | {item.weight} {convertWeightUnit(item.unitWeight)}</span>
                  </div>

                  {/* LEFT in RTL: Units + Price */}
                  <div className={styles['pg-controls']}>
                    <span className={styles['pg-price__units']}>{item.amountInCart} יח'</span>
                    {hasChanged ? (
                      <div className={styles['pg-price__diff']}>
                        <span className={styles['pg-price__old']}>{currentTotal.toFixed(2)}₪</span>
                        <span className={styles['pg-price__new']} style={currentDraftAmount < item.amountInCart ? { color: '#dc2626' } : undefined}>{newTotal.toFixed(2)}₪</span>
                      </div>
                    ) : (
                      <span className={styles['pg-price__value']}>{item.totalPrice.toFixed(2)} ₪</span>
                    )}
                  </div>

                  {/* Row 2: +/- quantity + actions, spans full width */}
                  <div className={styles['pg-bottom-row']}>
                    <button
                      className={styles['pg-btn-minus']}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        btn.animate(
                          [
                            { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
                            { transform: 'scale(0.75)', boxShadow: '0 0 0 rgba(0,0,0,0.1), inset 0 2px 4px rgba(0,0,0,0.2)', offset: 0.3 },
                            { transform: 'scale(1.08)', boxShadow: '0 4px 16px rgba(239,68,68,0.5)', offset: 0.6 },
                            { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
                          ],
                          { duration: 350, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                        );
                        updateDraftAmount(item.barcode, Math.max(1, currentDraftAmount - 1));
                      }}
                    >-</button>
                    <span className={styles['pg-qty-display']}>{currentDraftAmount}</span>
                    <button
                      className={styles['pg-btn-plus']}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      onClick={(e) => {
                        e.stopPropagation();
                        const btn = e.currentTarget;
                        btn.animate(
                          [
                            { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
                            { transform: 'scale(0.75)', boxShadow: '0 0 0 rgba(0,0,0,0.1), inset 0 2px 4px rgba(0,0,0,0.2)', offset: 0.3 },
                            { transform: 'scale(1.08)', boxShadow: '0 4px 16px rgba(34,197,94,0.5)', offset: 0.6 },
                            { transform: 'scale(1)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
                          ],
                          { duration: 350, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
                        );
                        updateDraftAmount(item.barcode, currentDraftAmount + 1);
                      }}
                    >+</button>
                    {hasChanged && (
                      <>
                        <button
                          className={styles['pg-btn-cancel']}
                          onClick={() => clearDraftAmount(item.barcode)}
                        >בטל</button>
                        <button
                          className={styles['pg-btn-update']}
                          onClick={() => { update(item.barcode, currentDraftAmount); clearDraftAmount(item.barcode); }}
                        >עדכן</button>
                      </>
                    )}
                  </div>
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
  const LONG_MS = 500;
  const LONG_VISUAL_DELAY = 100;
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
  const [flashType, setFlashType] = useState('none'); // 'none' | 'increment' | 'decrement'

  const containerRef = useRef(null);
  const startX = useRef(0);
  const startY = useRef(0);
  const longPressTimer = useRef(null);
  const rafId = useRef(null);
  const pressStart = useRef(0);
  const moved = useRef(0);
  const lastDxRef = useRef(0);
  const swipeActiveRef = useRef(false);
  const draggingRef = useRef(false);

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
    draggingRef.current = true;
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
    if (!draggingRef.current) return;
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
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const movedAtEnd = moved.current;
    const wasSwipeActive = swipeActiveRef.current;
    moved.current = 0;
    swipeActiveRef.current = false;
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

    if (wasSwipeActive && Math.abs(movedAtEnd) >= SWIPE_TRIGGER) {
      if (movedAtEnd > 0) {
        onIncrement();
        setFlashType('increment');
      } else {
        onDecrement();
        setFlashType('decrement');
      }

      const absMove = Math.abs(movedAtEnd);
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
  const onMouseLeave = () => draggingRef.current && end(deleteMode, dxDelete, dxNormal);

  // Touch handlers - using useEffect for non-passive listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e) => {
      if (!draggingRef.current) return;
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
  const normalRatio = (!deleteMode && dragging && swipeActive && dxNormal !== 0)
    ? Math.abs(dxNormal) / MAX_NORMAL_SHIFT : 0;
  const normalDir = dxNormal > 0 ? 'increment' : 'decrement';

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
        style={{ '--reveal-width': `${Math.min(dxDelete, REMOVE_THRESHOLD)}px` }}
      >
        {(shadowStage === "show" || shadowStage === "armed") && (
          <div className={styles['shadow-icon']}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </div>
        )}
      </div>

      <div
        className={`${styles['swipe-content']} ${dragging ? styles.dragging : ""} ${spring ? styles.spring : ""} ${flashType !== 'none' ? styles[`flash-${flashType}`] : ""} ${pressProgress > 0 && !deleteMode ? styles.pressing : ""} ${deleteMode ? styles['delete-active'] : ""} ${deleteMode && dxDelete >= REMOVE_THRESHOLD ? styles['delete-armed'] : ""}`}
        style={{
          transform: spring ? undefined : `translateX(${uiDx}px)`,
          "--startX": `${springStartX}px`,
          "--press-progress": pressProgress,
          boxShadow:
            (pressProgress > 0 && !deleteMode)
              ? `0 0 ${8 + 22 * pressProgress}px rgba(251,146,60,${0.08 + 0.32 * pressProgress}), 0 4px ${12 + 18 * pressProgress}px rgba(251,146,60,${0.05 + 0.2 * pressProgress})`
              : normalRatio > 0
                ? normalDir === 'increment'
                  ? `0 0 ${8 + 16 * normalRatio}px rgba(34,197,94,${0.15 + 0.45 * normalRatio}), 0 0 0 ${1 + 2 * normalRatio}px rgba(34,197,94,${0.1 + 0.3 * normalRatio})`
                  : `0 0 ${8 + 16 * normalRatio}px rgba(239,68,68,${0.15 + 0.45 * normalRatio}), 0 0 0 ${1 + 2 * normalRatio}px rgba(239,68,68,${0.1 + 0.3 * normalRatio})`
                : undefined,
          borderColor:
            (pressProgress > 0 && !deleteMode)
              ? `rgba(251,146,60,${0.15 + 0.35 * pressProgress})`
              : normalRatio > 0
                ? normalDir === 'increment'
                  ? `rgba(34,197,94,${0.2 + 0.4 * normalRatio})`
                  : `rgba(239,68,68,${0.2 + 0.4 * normalRatio})`
                : undefined,
        }}
        onAnimationEnd={() => {
          setSpring(false);
          setSpringStartX(0);
          setFlashType('none');
        }}
      >
        {children}
      </div>
    </div>
  );
}
