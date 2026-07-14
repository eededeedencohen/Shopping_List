import React from "react";
import "./NeonBackground.css";

/* "ניאון סיטי" v2 — layered synthwave scene:
   deep sky + nebula + twinkling stars → a striped NEON SUN sinking into the
   horizon → jagged mountain silhouettes with glowing ridgelines → blazing
   cyan↔magenta horizon → endless 3D grid with an ENERGY WAVE racing toward
   the horizon → rising sparks, a sweeping light beam, scanlines, vignette. */

export default function NeonBackground() {
  return (
    <div className="neon-bg" aria-hidden="true">
      <div className="neon-stars neon-stars--far" />
      <div className="neon-stars neon-stars--near" />
      <div className="neon-nebula" />
      <div className="neon-beam" />

      <div className="neon-sun-wrap">
        <div className="neon-sun" />
      </div>

      <div className="neon-mtn neon-mtn--back" />
      <div className="neon-mtn neon-mtn--left" />
      <div className="neon-mtn neon-mtn--right" />

      <div className="neon-horizon" />
      <div className="neon-grid-wrap">
        <div className="neon-grid" />
        <div className="neon-wave" />
      </div>

      <div className="neon-sparks">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} style={{ "--i": i }} />
        ))}
      </div>
      <div className="neon-scanlines" />
      <div className="neon-vignette" />
    </div>
  );
}
