import React from "react";
import "./MessageItemOperationAI.css";
// import ExpenseOverview from "../../Stats/ExpenseOverview";
import ProductPriceComparison from "./AIDataResponseManager/AIDataResponseViews/ProductPriceComparison/ProductPriceComparison";
// import CartOperationsView from "./MessageItemOperations/CartOperationsView/CartOperationsView";
import CartOperationsAnimation from "./MessageItemOperations/CartOperationsView/CartOperationsAddAnimation";
import CartPriceComparison from "./AIDataResponseManager/AIDataResponseViews/CartPriceComparison/CartPriceComparison";
import CartView from "./AIDataResponseManager/AIDataResponseViews/CartView/CartView.js";
import {
  HistoryStats,
  MonthlyExpensesChart,
} from "./AIDataResponseManager/AIDataResponseViews/HistoryStats/HistoryStats.js";

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

    default:
      return null;
  }
};

const MessageItemOperationAI = ({ message, type, data, action }) => {
  return (
    <div className={`message-item operation`}>
      <p>{message}</p>
      <div className="message-item-operation-content">
        {getComponentByType(type, data, action)}
      </div>
      {/* <ProductPriceComparison />
      <CartOperationsAddAnimation barcode={"7290100850916"} amount={1} />
      <CartPriceComparison />
      <CartView /> */}
      {/* <HistoryStats />
      <MonthlyExpensesChart /> */}
      {/* <ExpenseOverview /> */}
      {/* <CartOperationsView /> */}
    </div>
  );
};

export default MessageItemOperationAI;
