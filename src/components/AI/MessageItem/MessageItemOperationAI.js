import React from "react";
import "./MessageItemOperationAI.css";
import ProductPriceComparison from "./AIDataResponseManager/AIDataResponseViews/ProductPriceComparison/ProductPriceComparison";
import CartOperationsAnimation from "./MessageItemOperations/CartOperationsView/CartOperationsAddAnimation";
import CartBatchAdd from "./MessageItemOperations/CartOperationsView/CartBatchAdd";
import CartPriceComparison from "./AIDataResponseManager/AIDataResponseViews/CartPriceComparison/CartPriceComparison";
import CartView from "./AIDataResponseManager/AIDataResponseViews/CartView/CartView.js";
import MonthlyExpensesChart from "./History/MonthlyExpensesChart.js";

const getComponentByType = (type, data, action) => {
  switch (type) {
    case "cartsComparison":
      return <CartPriceComparison carts={data} />;
    case "showCart":
      return <CartView />;
    case "B1 Result":
      return <ProductPriceComparison data={data} />;
    case "cartOperation":
      return (
        <CartOperationsAnimation
          barcode={action.barcode}
          amount={action.newQuantity}
          action={action.operationType}
        />
      );
    case "cartBatchAdd":
      return <CartBatchAdd items={action} />;
    case "monthlyExpenses":
      return <MonthlyExpensesChart data={data} />;
    default:
      return null;
  }
};

const MessageItemOperationAI = ({ message, type, data, action }) => {
  return (
    <div className="message-item operation">
      {message && (
        <div className="op-message-bubble">
          <span className="op-message-text">{message}</span>
        </div>
      )}
      <div className="message-item-operation-content">
        {getComponentByType(type, data, action)}
      </div>
    </div>
  );
};

export default MessageItemOperationAI;
