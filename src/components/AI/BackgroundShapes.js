import React from "react";
import "./BackgroundShapes.css";

/**  בועות אנימציה ברקע (מתחת לכל התוכן)  */
export default function BackgroundShapes({ count = 30 }) {
  // מייצרים count <span>s עם style Inline אקראי
  const shapes = Array.from({ length: count }, (_, i) => {
    const size   = 8 + Math.random() * 20;           // 8-28px
    const startX = Math.random() * 100;              // vw
    const endX   = startX + (-30 + Math.random() * 60); // תזוזה אופקית
    const delay  = Math.random() * 10;               // s
    const dur    = 12 + Math.random() * 18;          // 12-30s
    return (
      <span
        key={i}
        style={{
          "--size":  `${size}px`,
          "--startX":`${startX}vw`,
          "--endX":  `${endX}vw`,
          "--delay": `${delay}s`,
          "--dur":   `${dur}s`,
        }}
      />
    );
  });

  return <div className="bg-shapes">{shapes}</div>;
}
