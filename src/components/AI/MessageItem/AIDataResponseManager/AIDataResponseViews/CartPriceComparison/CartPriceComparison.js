import React, { useState } from "react";
import { ProductImageDisplay } from "../../../../../Images/ProductImageService"; // params barcode and className
import "./CartPriceComparison.css"; // CSS styles for the component

/* ─── MAIN COMPONENT ── */
const CartPriceComparison = ({ carts }) => {
  const [openIndex, setOpenIndex] = useState(null);
  const toggle = (i) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    /* ל-Mobile: עוטף את כל הרשימה בלוח (sheet) */
    <div className="cartComp">
      <div className="cpc_panel">
        <div className="cpc_wrapper">
          {carts.map(({ supermarket, totalPrice, products }, i) => {
            const open = openIndex === i;
            return (
              <div key={i} className="cpc_cartCard">
                {/* ── כותרת עגלה ── */}
                <header className="cpc_header" onClick={() => toggle(i)}>
                  <h3 className="cpc_marketName">{supermarket.name}</h3>
                  <p className="cpc_marketAddr">
                    {supermarket.address} · {supermarket.city}
                  </p>
                  <span className="cpc_total">
                    ₪{Number(totalPrice).toFixed(2)}
                  </span>
                </header>

                {/* ── רשימת מוצרים נפתחת ── */}
                <section
                  className="cpc_products"
                  style={{
                    maxHeight: open ? products.length * 90 + 32 + "px" : 0,
                  }}
                >
                  {products.map((p) => (
                    <div key={p.barcode} className="cpc_productRow">
                      <ProductImageDisplay
                        barcode={p.barcode}
                        className="cpc_prodImg"
                      />
                      <div className="cpc_prodInfo">
                        <div className="cpc_prodDetails">
                          <span className="cpc_prodBarcode">{p.barcode}</span>
                          <span>
                            {p.amount} × ₪{p.price.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="cpc_prodSubtotal">
                          ₪{p.totalPrice.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </section>

                {/* ── כפתור Toggle ── */}
                <button
                  className="cpc_toggleBtn"
                  onClick={() => toggle(i)}
                  aria-expanded={open}
                >
                  {open ? "צמצום תצוגה" : "הרחבת תצוגה"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CartPriceComparison;
