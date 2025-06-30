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
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let startX = 0,
      dragging = false;

    // Touch
    el.ontouchstart = (e) => {
      dragging = true;
      startX = e.touches[0].clientX;
      setAnim(false);
    };
    el.ontouchmove = (e) =>
      dragging && setOffset(e.touches[0].clientX - startX);
    el.ontouchend = (e) => {
      if (!dragging) return;
      dragging = false;
      finish(e.changedTouches[0].clientX - startX);
    };

    // Mouse
    el.onmousedown = (e) => {
      dragging = true;
      startX = e.clientX;
      setAnim(false);
    };
    window.onmousemove = (e) => dragging && setOffset(e.clientX - startX);
    window.onmouseup = (e) => {
      if (!dragging) return;
      dragging = false;
      finish(e.clientX - startX);
    };

    /* ניקוי listeners בעת unmount */
    return () => {
      el.ontouchstart = el.ontouchmove = el.ontouchend = null;
      el.onmousedown = null;
      window.onmousemove = window.onmouseup = null;
    };
  }, [onSwipeLeft, onSwipeRight]);

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
