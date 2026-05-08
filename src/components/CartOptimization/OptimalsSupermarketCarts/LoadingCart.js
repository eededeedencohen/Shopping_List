import React, { useEffect, useState } from "react";
import "./LoadingCart.css";

const MESSAGES = [
  "מנתח את העגלה שלך…",
  "משווה מחירים בכל הסופרים…",
  "מחפש את החלופות הזולות ביותר…",
  "מחשב את העגלה האופטימלית…",
  "כמעט שם…",
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
      <div className="lc-card">
        <div className="lc-orbit" aria-hidden="true">
          <span className="lc-core" />
          <span className="lc-ring lc-ring-1" />
          <span className="lc-ring lc-ring-2" />
          <span className="lc-ring lc-ring-3" />
        </div>
        <h2 className="lc-title">מחשבים את העגלה האופטימלית</h2>
        <p className="lc-status" key={idx}>
          {MESSAGES[idx]}
        </p>
      </div>
    </div>
  );
};

export default LoadingCart;
