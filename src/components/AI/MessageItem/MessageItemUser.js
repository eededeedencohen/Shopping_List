import React from "react";
import "./MessageItemUser.css";

const MessageItemUser = ({ message }) => {
  return (
    <div className={`message-item user`}>
      <p>{message}</p>
    </div>
  );
};

export default MessageItemUser;
