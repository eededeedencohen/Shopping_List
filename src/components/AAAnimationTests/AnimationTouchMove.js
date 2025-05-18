import React, { useState, useEffect, useRef } from "react";
import "./AnimationTouchMove.css";

const initialItems = ["OBJ1", "OBJ2", "OBJ3", "OBJ4"];

const AnimationTouchMove = () => {
  const [items, setItems] = useState(initialItems);
  const [exitingItems, setExitingItems] = useState([]);
  const [slideUpMap, setSlideUpMap] = useState({});
  const [noTransitionMap, setNoTransitionMap] = useState({});
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchCurrent, setTouchCurrent] = useState({ x: 0, y: 0 });
  const [currentIndex, setCurrentIndex] = useState(null);

  const containerRef = useRef(null);

  const handleRemove = (index) => {
    if (exitingItems.includes(index)) return;

    const newExiting = [...exitingItems, index];
    setExitingItems(newExiting);

    const newSlideUps = {};
    items.forEach((_, i) => {
      if (i > index && !exitingItems.includes(i)) {
        newSlideUps[i] = true;
      }
    });
    setSlideUpMap((prev) => ({ ...prev, ...newSlideUps }));

    setTimeout(() => {
      const noTrans = {};
      Object.keys(newSlideUps).forEach((i) => (noTrans[i] = true));
      setNoTransitionMap((prev) => ({ ...prev, ...noTrans }));
    }, 500);

    setTimeout(() => {
      setItems((prev) => prev.filter((_, i) => i !== index));
      setExitingItems((prev) => prev.filter((i) => i !== index));
      const newSlide = { ...slideUpMap };
      delete newSlide[index];
      setSlideUpMap(newSlide);
      const newTrans = { ...noTransitionMap };
      delete newTrans[index];
      setNoTransitionMap(newTrans);
    }, 500);
  };

  const handleTouchStart = (e, index) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchCurrent({ x: touch.clientX, y: touch.clientY });
    setCurrentIndex(index);
  };

  const handleTouchEnd = () => {
    const distanceX = touchCurrent.x - touchStart.x;
    if (Math.abs(distanceX) > 50 && currentIndex !== null) {
      handleRemove(currentIndex);
    }
    setCurrentIndex(null);
  };

  const getDynamicStyle = (index) => {
    if (index === currentIndex) {
      const dx = touchCurrent.x - touchStart.x;
      return {
        transform: `translateX(${dx}px)`,
      };
    }
    return {};
  };

  // 👇 טופל בבעיה של preventDefault עם passive:false
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStart.x;
      const dy = touch.clientY - touchStart.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        e.preventDefault(); // ✅ לא נזרקת שגיאה
      }

      setTouchCurrent({ x: touch.clientX, y: touch.clientY });
    };

    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [touchStart]);

  return (
    <div className="am_scroll-wrapper" ref={containerRef}>
      <div className="am_container">
        {items.map((item, index) => {
          const isExiting = exitingItems.includes(index);
          const shouldSlideUp = slideUpMap[index];
          const noTrans = noTransitionMap[index];

          return (
            <div
              key={item + "-" + index}
              className={`am_box
                ${isExiting ? "slide-out" : ""}
                ${shouldSlideUp ? "slide-up" : ""}
                ${noTrans ? "no-transform-transition" : ""}
              `}
              style={getDynamicStyle(index)}
              onTouchStart={(e) => handleTouchStart(e, index)}
              onTouchEnd={handleTouchEnd}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationTouchMove;
