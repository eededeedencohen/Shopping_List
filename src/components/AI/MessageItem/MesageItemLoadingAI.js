import React, { useState, useEffect, useRef } from "react";
import "./MesageItemLoadingAI.css";

const MesageItemLoadingAI = ({ message }) => {
  const [fade, setFade] = useState(true);
  const [displayText, setDisplayText] = useState(message);
  const prevMessage = useRef(message);

  useEffect(() => {
    if (message !== prevMessage.current) {
      // טקסט חדש הגיע מהשרת → fade out, החלפה, fade in
      setFade(false);
      const timer = setTimeout(() => {
        setDisplayText(message);
        setFade(true);
        prevMessage.current = message;
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="message-item loading">
      <p className={`loading-status-text ${fade ? "fade-in" : "fade-out"}`}>
        {displayText}
      </p>
      <div className="loader"></div>
    </div>
  );
};

export default MesageItemLoadingAI;
