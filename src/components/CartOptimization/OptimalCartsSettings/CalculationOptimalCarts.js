import React, { useRef, useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import "./CalculationOptimalCarts.css";
import { useCalculateOptimalCarts } from "../../../hooks/optimizationHooks";

/* ╔════  פרמטרים לכוון בקלות  ═════╗ */
const SPEED_FACTOR = 1;
const BOUNCE_OVERSHOOT = 32;
const SQUASH_IN = 0.88;
const STRETCH_OUT = 1.07;
/* ─── גדלים קבועים ─── */
const KNOB_SIZE = 56;
const PADDING = 6;

export default function CalculationOptimalCarts() {
  const navigate = useNavigate();
  const { calculateOptimalsCarts } = useCalculateOptimalCarts();

  const trackRef = useRef(null);
  const x = useMotionValue(0);
  const scale = useMotionValue(1);
  const [travel, setTravel] = useState(0);

  /* מדידה רספונסיבית */
  useLayoutEffect(() => {
    const measure = () => {
      if (!trackRef.current) return;
      setTravel(trackRef.current.offsetWidth - KNOB_SIZE - PADDING * 2);
      x.set(0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [x]);

  /* UI דינמי */
  const labelOpacity = useTransform(x, (v) =>
    travel ? 1 - (v / travel) * 1.2 : 1
  );
  const shadowWidth = useTransform(x, (v) => `${v + KNOB_SIZE / 2}px`);

  /* Bounce – מחזירה את ה-Animation כדי לחכות ל-finished */
  const bounceAnim = (snapToEnd) => {
    const target = snapToEnd ? travel : 0;
    const dist = Math.abs(x.get() - target);
    const maxOvr = Math.min(BOUNCE_OVERSHOOT, dist * 0.25);
    const dir = snapToEnd ? -1 : 1;
    const duration = 0.45 / SPEED_FACTOR;

    const kfX = [
      target + dir * maxOvr,
      target + dir * -maxOvr * 0.6,
      target + dir * maxOvr * 0.25,
      target,
    ];
    const kfScale = [1, SQUASH_IN, STRETCH_OUT, 1];

    return {
      pos: animate(x, kfX, { duration, ease: "easeOut" }),
      scale: animate(scale, kfScale, { duration, ease: "easeOut" }),
    };
  };

  /* שחרור גרירה */
  const handleEnd = () => {
    const snapToEnd = x.get() >= travel * 0.5; // מעבר לחצי? נזרוק לקצה
    const { pos } = bounceAnim(snapToEnd);

    if (snapToEnd) {
      /* מפעיל חישוב וניווט רק אחרי שהכדור *הגיע בפועל* ונעצר בקצה */
      pos.finished.then(() => {
        navigate("/optimal-supermarket-carts");
        calculateOptimalsCarts();
      });
    }
  };

  /* UI */
  return (
    <div className="slide-wrapper">
      <div ref={trackRef} className="slide-track">
        <motion.div className="slide-shadow" style={{ width: shadowWidth }} />

        <motion.span className="slide-label" style={{ opacity: labelOpacity }}>
          החלק לחישוב העגלות
        </motion.span>

        <motion.div
          className="slide-knob"
          drag="x"
          dragConstraints={trackRef}
          dragElastic={0}
          style={{ x, scale }}
          whileTap={{ scale: 0.92 }}
          onDragEnd={handleEnd} // ← החישוב מתבצע רק כאן
        />
      </div>
    </div>
  );
}
