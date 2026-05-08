import React, { useEffect, useState } from "react";
import { ReactComponent as ShoppingCartIcon } from "../../Cart/Icons/shopping-cart.svg";
import "./LoadingCart.css";

const MESSAGES = [
  "מנתח את העגלה שלך…",
  "משווה מחירים בכל הסופרים…",
  "מחפש חלופות זולות יותר…",
  "מחשב מבצעים והנחות…",
  "כמעט שם — מסיים את החישוב…",
];

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
          <ShoppingCartIcon className="lc-core-icon" aria-hidden="true" />
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
  );
};

export default LoadingCart;
