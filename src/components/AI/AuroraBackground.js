import React from "react";
import "./AuroraBackground.css";

export default function AuroraBackground() {
  return (
    <div className="aurora-bg" aria-hidden="true">
      <div className="aurora-blob aurora-blob-1" />
      <div className="aurora-blob aurora-blob-2" />
      <div className="aurora-blob aurora-blob-3" />
      <div className="aurora-blob aurora-blob-4" />
      <div className="aurora-grain" />
    </div>
  );
}
