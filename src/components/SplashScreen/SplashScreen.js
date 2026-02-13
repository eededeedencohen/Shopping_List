import { useState, useEffect, useMemo } from "react";
import "./SplashScreen.css";

/* ── Cart SVG icon ── */
const CartSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM7.16 14.26l.04-.12.94-1.7h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20.04 4H5.21l-.94-2H1v2h2l3.6 7.59-1.35 2.44C4.52 15.37 5.48 17 7 17h12v-2H7.42c-.13 0-.25-.11-.26-.24z" />
  </svg>
);

/* ── Title text letters ── */
const TITLE = "Smart Cart";

/* ── Generate particles once ── */
function generateParticles(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    size: 2 + Math.random() * 4,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 4,
    opacity: 0.3 + Math.random() * 0.5,
  }));
}

function SplashScreen({ onFinish }) {
  const [hidden, setHidden] = useState(false);
  const [removed, setRemoved] = useState(false);

  const particles = useMemo(() => generateParticles(30), []);

  useEffect(() => {
    /* 2.5 שניות splash, אח"כ fade-out */
    const fadeTimer = setTimeout(() => setHidden(true), 2500);
    /* מסיר מה-DOM אחרי ה-fade */
    const removeTimer = setTimeout(() => {
      setRemoved(true);
      onFinish?.();
    }, 3100);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  if (removed) return null;

  return (
    <div className={`splash ${hidden ? "splash--hidden" : ""}`}>
      {/* Background orbs */}
      <div className="splash__orb splash__orb--1" />
      <div className="splash__orb splash__orb--2" />
      <div className="splash__orb splash__orb--3" />

      {/* Floating particles */}
      <div className="splash__particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="splash__particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>

      {/* Central icon */}
      <div className="splash__icon-wrapper">
        <div className="splash__glow" />
        <div className="splash__ring" />
        <div className="splash__ring splash__ring--inner" />
        <div className="splash__icon">
          <CartSVG />
        </div>
      </div>

      {/* Title — letter by letter */}
      <div className="splash__title">
        {TITLE.split("").map((char, i) => (
          <span
            key={i}
            className="splash__letter"
            style={{ animationDelay: `${0.6 + i * 0.06}s` }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </div>

      {/* Subtitle */}
      <p className="splash__subtitle">SHOPPING ASSISTANT</p>

      {/* Progress bar */}
      <div className="splash__progress-track">
        <div className="splash__progress-bar" />
      </div>

      {/* Loading dots */}
      <div className="splash__dots">
        <div className="splash__dot" />
        <div className="splash__dot" />
        <div className="splash__dot" />
      </div>
    </div>
  );
}

export default SplashScreen;
