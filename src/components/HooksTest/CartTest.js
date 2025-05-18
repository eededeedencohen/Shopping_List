import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  useCartState,
  useCartTotals,
  useCartActions,
  useCartItems,
  useUpdateActiveCart,
} from "../../hooks/appHooks";
import { calculateTotalPrice } from "../../utils/priceCalculations";
import "./CartTest.css";

const CartTest = () => {
  const { cart, isLoading } = useCartState();
  const { totalAmount, totalPrice } = useCartTotals();
  const { update, remove, replaceSupermarket } = useCartActions();
  const { sendActiveCart } = useUpdateActiveCart();
  const cartItems = useCartItems();

  const [draftAmounts, setDraftAmounts] = useState({});
  const [supermarketDraftId, setSupermarketDraftId] = useState("");

  useEffect(() => {
    sendActiveCart();
  }, [cart, sendActiveCart]); // ← מופעל רק כש-cart משתנה

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

  return (
    <div className="cart-test_container">
      {console.log("cartItems", cartItems)}
      <Link to="/products-list-test">
        <button className="cart-test_back-button">⮌ לעמוד רשימת מוצרים</button>
      </Link>

      <div className="cart-test_supermarket-box">
        <div>
          Supermarket&nbsp;ID נוכחי:&nbsp;
          <strong>{cart.supermarketID}</strong>
        </div>
        <div className="cart-test_supermarket-controls">
          <input
            className="cart-test_input"
            type="number"
            value={supermarketDraftId}
            placeholder="SMID חדש"
            onChange={(e) => setSupermarketDraftId(e.target.value)}
          />
          <button
            disabled={
              supermarketDraftId === "" ||
              Number(supermarketDraftId) === cart.supermarketID
            }
            onClick={() => {
              replaceSupermarket(Number(supermarketDraftId));
              setSupermarketDraftId("");
            }}
          >
            החלף
          </button>
        </div>
      </div>

      <h2>Cart Test</h2>
      <p className="cart-test_summary">
        סה״כ פריטים:&nbsp;
        {totalAmount === draftTotals.amt ? (
          <strong>{totalAmount}</strong>
        ) : (
          <>
            <strong>{draftTotals.amt}</strong> &rarr; {totalAmount}
          </>
        )}
        &nbsp;|&nbsp; סה״כ מחיר:&nbsp;
        {totalPrice === draftTotals.price.toFixed(2) ? (
          <strong>{totalPrice}₪</strong>
        ) : (
          <>
            <strong>{draftTotals.price}₪</strong> &rarr; {totalPrice}₪
          </>
        )}
      </p>

      {cartItems.map((item) => {
        const currentDraftAmount = getDraftOrCurrentAmount(item);
        const hasChanged = currentDraftAmount !== item.amountInCart;
        const currentTotal = calculateTotalPrice(item.amountInCart, item);
        const newTotal = calculateTotalPrice(currentDraftAmount, item);

        return (
          <div key={item.barcode} className="cart-test_item">
            <strong>{item.name}</strong> – {item.brand}
            <br />
            ברקוד: {item.barcode} | משקל: {item.weight}
            <br />
            מחיר יח׳: {item.unitPrice ?? "—"}₪
            {item.promoText && (
              <span className="cart-test_promo">(מבצע: {item.promoText})</span>
            )}
            <br />
            <div className="cart-test_edit-controls">
              {hasChanged && (
                <>
                  <span className="cart-test_prev-amount">
                    {item.amountInCart}
                  </span>
                  <span style={{ fontSize: 20 }}>→</span>
                </>
              )}

              <button
                onClick={() =>
                  updateDraftAmount(
                    item.barcode,
                    Math.max(1, currentDraftAmount - 1)
                  )
                }
              >
                ➖
              </button>

              <input
                type="number"
                min={1}
                value={currentDraftAmount}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 1) {
                    updateDraftAmount(item.barcode, value);
                  }
                }}
                className={`cart-test_input-amount${
                  hasChanged ? " changed" : ""
                }`}
              />

              <button
                onClick={() =>
                  updateDraftAmount(item.barcode, currentDraftAmount + 1)
                }
              >
                ➕
              </button>

              <button
                className="cart-test_update-button"
                disabled={!hasChanged}
                onClick={() => {
                  update(item.barcode, currentDraftAmount);
                  clearDraftAmount(item.barcode);
                }}
              >
                עדכן
              </button>
              <button onClick={() => remove(item.barcode)}>מחק</button>
            </div>
            <div className="cart-test_totals">
              סה״כ למוצר:&nbsp;
              {hasChanged ? (
                <>
                  <strong>{newTotal}₪</strong> &rarr; {currentTotal}₪
                </>
              ) : (
                <>{currentTotal}₪</>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CartTest;
