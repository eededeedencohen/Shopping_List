import React, { useState } from "react";
import "./AnimationMove.css";

const initialItems = ["OBJ1", "OBJ2", "OBJ3", "OBJ4"];

const AnimationMove = () => {
  const [items, setItems] = useState(initialItems);
  const [exitingItems, setExitingItems] = useState([]); // אוסף של אינדקסים בתהליך יציאה
  const [slideUpMap, setSlideUpMap] = useState({}); // אילו רכיבים צריכים slide-up
  const [noTransitionMap, setNoTransitionMap] = useState({}); // אילו רכיבים צריכים ביטול transition

  const handleRemove = (index) => {
    if (exitingItems.includes(index)) return;

    const newExiting = [...exitingItems, index];
    setExitingItems(newExiting);

    // קבע אילו פריטים יזוזו למעלה (אלה שאחריו)
    const newSlideUps = {};
    items.forEach((_, i) => {
      if (i > index && !exitingItems.includes(i)) {
        newSlideUps[i] = true;
      }
    });
    setSlideUpMap((prev) => ({ ...prev, ...newSlideUps }));

    // הסר transition אחרי 0.5 שניות
    setTimeout(() => {
      const noTrans = {};
      Object.keys(newSlideUps).forEach((i) => (noTrans[i] = true));
      setNoTransitionMap((prev) => ({ ...prev, ...noTrans }));
    }, 500);

    // הסר את הפריט לחלוטין אחרי 0.5 שניות
    setTimeout(() => {
      setItems((prev) => prev.filter((_, i) => i !== index));
      setExitingItems((prev) => prev.filter((i) => i !== index));

      // נקה slide-up עבור אלה שנמחקו/הוזזו
      const newSlide = { ...slideUpMap };
      delete newSlide[index];
      setSlideUpMap(newSlide);

      const newTrans = { ...noTransitionMap };
      delete newTrans[index];
      setNoTransitionMap(newTrans);
    }, 500);
  };

  return (
    <div className="am_scroll-wrapper">
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
              onClick={() => handleRemove(index)}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AnimationMove;
