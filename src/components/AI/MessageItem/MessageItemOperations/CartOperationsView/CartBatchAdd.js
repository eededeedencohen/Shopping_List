import React, { useEffect, useRef, useState } from "react";
import { ProductImageDisplay } from "../../../../Images/ProductImageService";
import {
  useCartActions,
  useUpdateActiveCart,
} from "../../../../../hooks/appHooks";
import "./CartBatchAdd.css";

const CartBatchAdd = ({ items }) => {
  const { add } = useCartActions();
  const { sendActiveCart } = useUpdateActiveCart();
  const hasRunRef = useRef(false);
  const [addedCount, setAddedCount] = useState(0);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    if (!Array.isArray(items) || items.length === 0) return;

    let count = 0;
    for (const item of items) {
      if (item.barcode && item.amount > 0) {
        add(item.barcode, item.amount);
        count++;
      }
    }
    setAddedCount(count);
    sendActiveCart();
  }, []);

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <div className="cba_container">
      <div className="cba_header">
        <span className="cba_header-text">
          {addedCount} {addedCount === 1 ? "מוצר נוסף" : "מוצרים נוספו"} לעגלה
        </span>
      </div>

      <div className="cba_list">
        {items.map((item, i) => (
          <div
            key={item.barcode || i}
            className="cba_row"
            style={{ animationDelay: `${i * 0.06}s` }}
          >
            <div className="cba_row-img-wrap">
              <ProductImageDisplay
                barcode={item.barcode}
                className="cba_row-img"
              />
            </div>
            <div className="cba_row-info">
              <span className="cba_row-name">
                {item.productName || item.barcode}
              </span>
            </div>
            <div className="cba_row-amount">
              <span className="cba_amount-value">{item.amount}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CartBatchAdd;
