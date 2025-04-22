import React from "react";
import "./MessageItemOperationAI.css";
// import ExpenseOverview from "../../Stats/ExpenseOverview";
import ProductPriceComparison from "./AIDataResponseManager/AIDataResponseViews/ProductPriceComparison/ProductPriceComparison";

const MessageItemOperationAI = ({ message }) => {
  return (
    <div className={`message-item operation`}>
      <p>{message}</p>
      <ProductPriceComparison />
    </div>
  );
};

export default MessageItemOperationAI;
