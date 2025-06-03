import React, { useState } from "react";
import ProductsImages from "../../../../../Images/ProductsImages"; // params barcode and className
import "./CartPriceComparison.css"; // CSS styles for the component

const demoCartData = [
  {
    supermarket: {
      supermarketID: 144,
      name: "רמי לוי באינטרנט",
      address: "https://www.rami-levy.co.il",
      city: "אינטרנט",
      _id: "67b341e5c07fd562349fd53f",
    },
    totalPrice: "28.40",
    products: [
      {
        barcode: "7290019056096",
        amount: 3,
        price: {
          _id: "67b341ebc07fd56234a1f74a",
          barcode: "7290019056096",
          supermarket: {
            supermarketID: 144,
            name: "רמי לוי באינטרנט",
            address: "https://www.rami-levy.co.il",
            city: "אינטרנט",
            _id: "67b341ebc07fd56234a1f74b",
          },
          price: 7.8,
          hasDiscount: true,
          discount: {
            units: 3,
            priceForUnit: 6.67,
            totalPrice: 20,
            _id: "67b341ebc07fd56234a1f74c",
          },
          __v: 0,
        },
        totalPrice: 20,
      },
      {
        barcode: "7290106667266",
        amount: 1,
        price: {
          _id: "67b341ecc07fd56234a26812",
          barcode: "7290106667266",
          supermarket: {
            supermarketID: 144,
            name: "רמי לוי באינטרנט",
            address: "https://www.rami-levy.co.il",
            city: "אינטרנט",
            _id: "67b341ecc07fd56234a26813",
          },
          price: 8.4,
          hasDiscount: false,
          discount: null,
          __v: 0,
        },
        totalPrice: 8.4,
      },
    ],
  },
  {
    supermarket: {
      supermarketID: 1,
      name: "שערי רווחה",
      address: "לואיס ברנדס 3",
      city: "ירושלים",
      _id: "67b341e5c07fd562349fd41f",
    },
    totalPrice: "28.50",
    products: [
      {
        barcode: "7290019056096",
        amount: 3,
        price: {
          _id: "67b341ebc07fd56234a1f5e6",
          barcode: "7290019056096",
          supermarket: {
            supermarketID: 1,
            name: "שערי רווחה",
            address: "לואיס ברנדס 3",
            city: "ירושלים",
            _id: "67b341ebc07fd56234a1f5e7",
          },
          price: 7.5,
          hasDiscount: true,
          discount: {
            units: 3,
            priceForUnit: 6.67,
            totalPrice: 20,
            _id: "67b341ebc07fd56234a1f5e8",
          },
          __v: 0,
        },
        totalPrice: 20,
      },
      {
        barcode: "7290106667266",
        amount: 1,
        price: {
          _id: "67b341ecc07fd56234a26710",
          barcode: "7290106667266",
          supermarket: {
            supermarketID: 1,
            name: "שערי רווחה",
            address: "לואיס ברנדס 3",
            city: "ירושלים",
            _id: "67b341ecc07fd56234a26711",
          },
          price: 8.5,
          hasDiscount: false,
          discount: null,
          __v: 0,
        },
        totalPrice: 8.5,
      },
    ],
  },
];
/* ─── MAIN COMPONENT ── */
const CartPriceComparison = ({ carts = demoCartData }) => {
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
                      <ProductsImages
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
