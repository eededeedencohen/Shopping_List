import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring, // ♦
} from "framer-motion";
import "./CalculationOptimalCarts.css";
import { useCalculateOptimalCarts } from "../../../hooks/optimizationHooks";

export default function CalculationOptimalCarts() {
  const navigate = useNavigate();
  const { calculateOptimalsCarts } = useCalculateOptimalCarts();
  const containerRef = useRef(null);

  /* targetX = אצבע,  heavyX = הכדור  */
  const targetX = useMotionValue(0);
  const heavyX = useSpring(targetX, {
    stiffness: 90, // ↓ נמוך = רך
    damping: 25, // ↑ גבוה = יותר בלימה
    mass: 3, // ↑ גדול = מרגיש כבד
  });

  /* אחוז מילוי לפי heavyX (לא לפי האצבע!) */
  const progress = useTransform(heavyX, (latest) => {
    if (!containerRef.current) return "0%";
    const w = containerRef.current.offsetWidth - 72;
    return `${(Math.min(latest, w) / w) * 100}%`;
  });

  const handleDragEnd = (_, info) => {
    const w = containerRef.current.offsetWidth - 72;
    if (info.point.x >= w) {
      // overshoot קטן + ניתוב
      targetX.set(w + 14);
      targetX.set(w);
      calculateOptimalsCarts();
      navigate("/optimal-supermarket-carts");
    } else {
      targetX.set(0);
    }
  };

  return (
    <motion.div
      className="holo-slider"
      ref={containerRef}
      style={{ "--progress": progress }}
    >
      <span className="holo-track-lines" />
      <span className="holo-glow" />
      <span className="holo-label">החלק לחישוב העגלות</span>

      <motion.span
        className="holo-thumb"
        drag="x"
        dragConstraints={containerRef}
        dragElastic={0.3}
        /*  ❯❯❯ האצבע מזיזה targetX  */
        style={{ x: heavyX }}
        onDrag={(_, info) => {
          const { left } = containerRef.current.getBoundingClientRect();
          const w = containerRef.current.offsetWidth - 72;
          const clamped = Math.min(Math.max(0, info.point.x - left), w);
          targetX.set(clamped); // מעדכן יעד, הכדור ירדוף
        }}
        whileTap={{ scale: 1.08 }}
        onDragEnd={handleDragEnd}
      >
        {/* ...child layers בדיוק כמו קודם... */}
      </motion.span>
    </motion.div>
  );
}
