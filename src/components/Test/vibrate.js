import React, { useState } from "react";
// ייבוא קובץ ה-CSS החדש
import "./VibrationSettings.css"; 

// Vibration playground for: button click, long press, swipe, timer
// רטטים קטנים בזמן החלקה (תלויים במהירות), רטט גדול בסיום רק אם עבר מרחק X

export default function VibrationSettings() {
  const [longPressDuration, setLongPressDuration] = useState(800); // ms
  const [timerSeconds, setTimerSeconds] = useState(3); // seconds
  const [swipeVibration, setSwipeVibration] = useState(5); // מקדם רגישות למהירות
  const [buttonVibration, setButtonVibration] = useState(40); // ms
  const [swipeDistanceMin, setSwipeDistanceMin] = useState(50); // px
  const [bigSwipeVibration, setBigSwipeVibration] = useState(150); // ms

  const [swipeStart, setSwipeStart] = useState({ x: null, y: null });
  const [swipeLast, setSwipeLast] = useState({ x: null, y: null });

  const doVibrate = (pattern) => {
    if (navigator && typeof navigator.vibrate === "function") {
      navigator.vibrate(pattern);
    }
  };

  /* BUTTON CLICK */
  const handleButtonClick = () => {
    if (buttonVibration > 0) doVibrate(buttonVibration);
  };

  /* LONG PRESS */
  const handleLongPress = () => {
    doVibrate([50, 50, 120]);
  };

  const detectLongPress = () => {
    let timeoutId = null;

    const clear = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    const start = () => {
      clear();
      timeoutId = setTimeout(handleLongPress, longPressDuration);
    };

    return {
      onMouseDown: start,
      onMouseUp: clear,
      onMouseLeave: clear,
      onTouchStart: start,
      onTouchEnd: clear,
      onTouchCancel: clear,
    };
  };

  /* SWIPE HELPERS */
  const getPointFromEvent = (e) => {
    if (e.touches && e.touches.length > 0) {
      return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
    if (typeof e.clientX === "number" && typeof e.clientY === "number") {
      return { x: e.clientX, y: e.clientY };
    }
    return null;
  };

  const handleSwipeStart = (e) => {
    const p = getPointFromEvent(e);
    if (!p) return;
    setSwipeStart(p);
    setSwipeLast(p);
  };

  const handleSwipeMove = (e) => {
    const p = getPointFromEvent(e);
    if (!p) return;

    if (swipeLast.x !== null && swipeLast.y !== null) {
      const dx = p.x - swipeLast.x;
      const dy = p.y - swipeLast.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // רטט קטן לפי מהירות – ככל שזזים מהר יותר (distance גדול יותר), הרטט ארוך יותר
      if (distance > 2 && swipeVibration > 0) {
        const vibrateMs = Math.min(distance * swipeVibration, 100); // הגבלת מקסימום
        doVibrate(vibrateMs);
      }
    }

    setSwipeLast(p);
  };

  const handleSwipeEnd = () => {
    if (swipeStart.x !== null && swipeStart.y !== null && swipeLast.x !== null && swipeLast.y !== null) {
      const dx = swipeLast.x - swipeStart.x;
      const dy = swipeLast.y - swipeStart.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // רטט גדול רק אם המרחק הכולל גדול מהמינימום
      if (distance >= swipeDistanceMin && bigSwipeVibration > 0) {
        doVibrate(bigSwipeVibration);
      }
    }

    setSwipeStart({ x: null, y: null });
    setSwipeLast({ x: null, y: null });
  };

  /* TIMER */
  const startTimer = () => {
    setTimeout(() => {
      doVibrate([100, 60, 100]);
    }, timerSeconds * 1000);
  };

  return (
    <div className="vibration-container">
      <h1>⚙️ הגדרות רטט לטריגרים</h1>

      {/* BUTTON */}
      <section className="settings-section">
        <h2>לחיצה על כפתור</h2>
        <button
          className="vibration-button btn-blue"
          onClick={handleButtonClick}
        >
          לחץ אותי
        </button>
        <div className="input-group">
          <label>עוצמת רטט (ms):</label>
          <input
            type="number"
            className="vibration-input"
            value={buttonVibration}
            onChange={(e) => setButtonVibration(Number(e.target.value) || 0)}
          />
        </div>
      </section>

      {/* LONG PRESS */}
      <section className="settings-section">
        <h2>לחיצה ארוכה</h2>
        <button
          {...detectLongPress()}
          className="vibration-button btn-purple"
        >
          לחץ לחיצה ארוכה
        </button>
        <div className="input-group">
          <label>משך לחיצה (ms):</label>
          <input
            type="number"
            className="vibration-input"
            value={longPressDuration}
            onChange={(e) => setLongPressDuration(Number(e.target.value) || 0)}
          />
        </div>
      </section>

      {/* SWIPE */}
      <section className="settings-section">
        <h2>החלקה</h2>
        <div
          onTouchStart={handleSwipeStart}
          onTouchMove={handleSwipeMove}
          onTouchEnd={handleSwipeEnd}
          onTouchCancel={handleSwipeEnd}
          onMouseDown={handleSwipeStart}
          onMouseMove={(e) => e.buttons === 1 && handleSwipeMove(e)}
          onMouseUp={handleSwipeEnd}
          onMouseLeave={handleSwipeEnd}
          className="swipe-area"
        >
          החלק כאן (רטטים קטנים בזמן תנועה, רטט גדול בסיום אם המרחק מספיק)
        </div>

        <div className="flex-col-group">
          <div className="input-group">
            <label>רטט קטן לפי מהירות (מקדם):</label>
            <input
              type="number"
              className="vibration-input"
              value={swipeVibration}
              onChange={(e) => setSwipeVibration(Number(e.target.value) || 0)}
            />
          </div>

          <div className="input-group">
            <label>מרחק מינימלי לריטוט גדול (px):</label>
            <input
              type="number"
              className="vibration-input"
              value={swipeDistanceMin}
              onChange={(e) => setSwipeDistanceMin(Number(e.target.value) || 0)}
            />
          </div>

          <div className="input-group">
            <label>רטט גדול בסיום (ms):</label>
            <input
              type="number"
              className="vibration-input"
              value={bigSwipeVibration}
              onChange={(e) => setBigSwipeVibration(Number(e.target.value) || 0)}
            />
          </div>
        </div>
      </section>

      {/* TIMER */}
      <section className="settings-section">
        <h2>טיימר</h2>
        <div className="input-group mb-3">
          <label>זמן (שניות):</label>
          <input
            type="number"
            className="vibration-input"
            value={timerSeconds}
            onChange={(e) => setTimerSeconds(Number(e.target.value) || 0)}
          />
        </div>
        <button
          onClick={startTimer}
          className="vibration-button btn-red"
        >
          התחל טיימר
        </button>
      </section>
    </div>
  );
}