// src/components/BackgroundVideo.jsx
import React from "react";
import plexusVid from "./Plexus.mp4"; // יחסית לקובץ הזה – התאמן למסלול שלך

export default function BackgroundVideo() {
  return (
    <video
      className="plexus-bg"
      src={plexusVid}
      autoPlay
      muted
      loop
      playsInline /* קריטי במובייל – לא יפתח נגן חיצוני */
    />
  );
}
