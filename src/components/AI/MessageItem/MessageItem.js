import React from "react";
import MesageItemLoadingAI from "./MesageItemLoadingAI";
import MessageItemAI from "./MessageItemAI";
import MessageItemOperationAI from "./MessageItemOperationAI";
import MessageItemUser from "./MessageItemUser";

const MessageItem = ({ message, sender }) => {
  if (sender === "assistant") {
    return <MessageItemAI message={message} />;
  } else if (sender === "user") {
    return <MessageItemUser message={message} />;
  } else if (sender === "loading") {
    return <MesageItemLoadingAI message={message} />;
  } else if (sender === "operation") {
    return <MessageItemOperationAI message={message}/>;
  }
};

export default MessageItem;
