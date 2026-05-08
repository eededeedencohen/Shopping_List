import React from "react";
import "./BloomBackground.css";

export default function BloomBackground() {
  return (
    <div className="bloom-bg" aria-hidden="true">
      <div className="bloom-glow" />
      {Array.from({ length: 18 }).map((_, i) => (
        <span key={i} className={`bloom-petal bloom-petal-${i}`} />
      ))}
    </div>
  );
}
