import React, { useRef, useState, useEffect } from "react";
import "./SwipeBox.css"; // optional – אם תרצה סטייל לקופסה עצמה

/**
 *  SwipeBox – מעטפת שמוסיפה Drag-Swipe אופקי חלק
 *  props:
 *    • onSwipeLeft()   – קריאה כשמחליקים שמאלה
 *    • onSwipeRight()  – קריאה כשמחליקים ימינה
 *    • className       – מחלקות CSS נוספות (רשות)
 *    • children        – תוכן הקופסה
 */
function SwipeBox({
  onSwipeLeft = () => {},
  onSwipeRight = () => {},
  className = "",
  children,
}) {
  const ref = useRef(null);
  const [offset, setOffset] = useState(0); // מרחק בזמן Drag
  const [withAnim, setAnim] = useState(false); // להדליק/לכבות transition

  /* ── החזרה למרכז ── */
  const snapBack = () => {
    setAnim(true);
    setOffset(0);
  };

  /* ── סיום Drag ── */
  const finish = (dx) => {
    const THRESHOLD = 80;
    if (Math.abs(dx) < THRESHOLD) return snapBack();

    const dir = dx < 0 ? -1 : 1; // -1=שמאלה  1=ימינה
    setAnim(true);
    setOffset(dir * 400); // מחליק החוצה

    setTimeout(() => {
      dir === -1 ? onSwipeLeft() : onSwipeRight();
      // מכינים את הקופסה להיכנס מהצד השני
      setAnim(false);
      setOffset(-dir * 300);
      requestAnimationFrame(() => requestAnimationFrame(snapBack));
    }, 300);
  };

  /* ── מאזינים ל-Mouse ו-Touch ── */
  // SwipeBox.js

  /* ── מאזינים ל-Mouse ו-Touch ── */
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0,
      dragging = false;

    const handleDragStart = (clientX) => {
      dragging = true;
      startX = clientX;
      setAnim(false);
    };

    const handleDragMove = (clientX) => {
      if (!dragging) return;
      setOffset(clientX - startX);
    };

    const handleDragEnd = (clientX) => {
      if (!dragging) return;
      dragging = false;
      finish(clientX - startX);
    };

    // --- Touch Events ---
    const handleTouchStart = (e) => handleDragStart(e.touches[0].clientX);
    const handleTouchMove = (e) => handleDragMove(e.touches[0].clientX);
    const handleTouchEnd = (e) => handleDragEnd(e.changedTouches[0].clientX);

    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    // מאזינים על החלון כולו כדי לתפוס תנועה גם מחוץ לקופסה
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });

    // --- Mouse Events ---
    const handleMouseDown = (e) => handleDragStart(e.clientX);
    const handleMouseMove = (e) => handleDragMove(e.clientX);
    const handleMouseUp = (e) => handleDragEnd(e.clientX);

    el.addEventListener("mousedown", handleMouseDown);
    // מאזינים על החלון כולו
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    /* ניקוי listeners בעת unmount */
    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);

      el.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [onSwipeLeft, onSwipeRight]); // finish function depends on these props implicitly

  return (
    <section
      ref={ref}
      className={`test_box ${className} ${withAnim ? "test_anim" : ""}`}
      style={{ transform: `translateX(${offset}px)` }}
    >
      {children}
    </section>
  );
}

/* ── ייצוא ── */
export default SwipeBox; // ← ברירת-מחדל
export { SwipeBox }; // ⬅ וגם בשם-מפורש למי שמעדיף
