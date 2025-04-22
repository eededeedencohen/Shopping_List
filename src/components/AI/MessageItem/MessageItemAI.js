import React from "react";
import "./MessageItemAI.css";

const AI_MessageItem = ({ message }) => {
  return (
    <div className={`message-item assistant`}>
        <p>{message}</p>
    </div>
  );
};

export default AI_MessageItem;