import React from "react";
import { motion } from "framer-motion";
import robotImg from "./robot.png"; // place the PNG you provided in src/assets

// === Animation presets ===
const hoverTransition = {
  repeat: Infinity,
  repeatType: "reverse",
  duration: 3,
  ease: "easeInOut",
};

const blinkTransition = {
  repeat: Infinity,
  repeatType: "loop",
  duration: 4,
  times: [0, 0.9, 0.92, 0.94, 1], // quick blink between 92‑94%
  ease: "easeInOut",
};

const mouthTransition = {
  repeat: Infinity,
  repeatType: "loop",
  duration: 6,
  times: [0, 0.75, 0.77, 0.79, 1], // brief smile
  ease: "easeInOut",
};

/**
 * RobotMascot — a floating, blinking, smiling robot head 🛸
 * @param {number} size – pixel size of the square avatar (default 160)
 */
export default function RobotMascot({ size = 160 }) {
  return (
    <motion.div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ y: [-10, 10] }}
      transition={hoverTransition}
    >
      {/* === Robot Shell === */}
      <img
        src={robotImg}
        alt="Cute robot head"
        className="block w-full h-full select-none pointer-events-none"
        draggable="false"
      />

      {/* === Eyes === */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <motion.div className="flex space-x-[12%]">
          {[0, 1].map((idx) => (
            <motion.div
              key={idx}
              className="bg-teal-400 rounded-full"
              style={{ width: size * 0.12, height: size * 0.16 }}
              animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
              transition={blinkTransition}
            />
          ))}
        </motion.div>
      </div>

      {/* === Mouth === */}
      <div
        className="absolute pointer-events-none select-none"
        style={{
          bottom: size * 0.25,
          left: "50%",
          transform: "translateX(-50%)",
          width: size * 0.28,
          height: size * 0.14,
        }}
      >
        <svg viewBox="0 0 20 12" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            fill="none"
            stroke="#00e0d3"
            strokeWidth="2"
            variants={{
              neutral: { d: "M2 8 L18 8" },
              smile: { d: "M2 4 Q10 10 18 4" },
            }}
            initial="neutral"
            animate={[
              "neutral",
              "neutral",
              "smile",
              "neutral",
            ]}
            transition={mouthTransition}
          />
        </svg>
      </div>
    </motion.div>
  );
}
