import React, { useEffect, useState } from "react";
import "./LoadingCart.css";

const MESSAGES = [
  "מנתח את העגלה שלך…",
  "משווה מחירים בכל הסופרים…",
  "מחפש חלופות זולות יותר…",
  "מחשב מבצעים והנחות…",
  "כמעט שם — מסיים את החישוב…",
];

const CartIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const LoadingCart = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIdx((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="lc-page">
      {/* Animated aurora background */}
      <div className="lc-bg" aria-hidden="true">
        <div className="lc-blob lc-blob-1" />
        <div className="lc-blob lc-blob-2" />
        <div className="lc-blob lc-blob-3" />
        <div className="lc-mesh" />
      </div>

      <div className="lc-card">
        {/* Scanner orb */}
        <div
          className="lc-scanner"
          role="status"
          aria-label="טוען חישוב עגלה אופטימלית"
        >
          <span className="lc-ripple lc-ripple-1" />
          <span className="lc-ripple lc-ripple-2" />
          <span className="lc-ripple lc-ripple-3" />

          <div className="lc-orbit">
            <span className="lc-dot lc-dot-blue" />
            <span className="lc-dot lc-dot-purple" />
            <span className="lc-dot lc-dot-green" />
          </div>

          <div className="lc-core">
            <CartIcon />
          </div>
        </div>

        <h2 className="lc-title">
          מחשבים את העגלה
          <span className="lc-title-accent"> הזולה ביותר</span>
        </h2>

        <p className="lc-status" key={idx}>
          {MESSAGES[idx]}
        </p>

        <div className="lc-progress" aria-hidden="true">
          <span className="lc-progress-dot" />
          <span className="lc-progress-dot" />
          <span className="lc-progress-dot" />
          <span className="lc-progress-dot" />
          <span className="lc-progress-dot" />
        </div>
      </div>
    </div>
  );
};

export default LoadingCart;
