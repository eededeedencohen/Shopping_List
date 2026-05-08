import React from "react";
import "./DawnBackground.css";

export default function DawnBackground() {
  return (
    <div className="dawn-bg" aria-hidden="true">
      <div className="dawn-rays" />
      <div className="dawn-sun" />
      {Array.from({ length: 8 }).map((_, i) => (
        <span key={i} className={`dawn-spark dawn-spark-${i}`} />
      ))}
    </div>
  );
}
