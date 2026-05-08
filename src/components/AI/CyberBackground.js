import React from "react";
import "./CyberBackground.css";

export default function CyberBackground() {
  return (
    <div className="cyber-bg" aria-hidden="true">
      <div className="cyber-stars" />
      <div className="cyber-sun-wrap">
        <div className="cyber-sun" />
      </div>
      <div className="cyber-grid-wrap">
        <div className="cyber-grid" />
      </div>
      <div className="cyber-haze" />
    </div>
  );
}
