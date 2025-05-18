// src/components/cart/ProductSwipeItem.js
import React, { useState, useRef } from "react";
import "./ProductSwipeItem.css";

export default function ProductSwipeItem({ item, onRemove, children }) {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState("idle"); // idle | exiting | slide-up
  const rowRef = useRef(null);

  // ----- touch handlers ----------------------------------------------------
  const handleTouchStart = (e) => {
    const t = e.touches[0];
    setTouchStart({ x: t.clientX, y: t.clientY });
    setTouchCurrent({ x: t.clientX, y: t.clientY });
  };

  const handleTouchMove = (e) => {
    const t = e.touches[0];
    const dx = t.clientX - touchStart.x;
    const dy = t.clientY - touchStart.y;

    // אם זו גרירה אופקית – לבטל גלילה
    if (Math.abs(dx) > Math.abs(dy)) e.preventDefault();
    setTouchCurrent({ x: t.clientX, y: t.clientY });
  };

  const handleTouchEnd = () => {
    const dx = touchCurrent.x - touchStart.x;
    if (Math.abs(dx) > 200) {
      // מפעילים slide-out
      setStatus("exiting");
      // אחרי זמן ה-CSS – קוראים לפונקציית המחיקה החיצונית
      setTimeout(() => onRemove(item.barcode), 400);
    } else {
      // ביטול – מחזיר למקום
      setStatus("idle");
    }
  };

  // ----- inline style לשורה בזמן גרירה ------------------------------------
  const dynamicStyle =
    status === "idle"
      ? { transform: `translateX(${touchCurrent.x - touchStart.x}px)` }
      : {};

  return (
    <div
      ref={rowRef}
      className={`product-row ${status === "exiting" ? "slide-out" : ""}`}
      style={dynamicStyle}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children /* ← כאן מגיע מבנה המוצר המקורי שלך */}
    </div>
  );
}
