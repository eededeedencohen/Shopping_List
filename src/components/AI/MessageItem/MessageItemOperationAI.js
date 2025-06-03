import React from "react";
import "./MessageItemOperationAI.css";
// import ExpenseOverview from "../../Stats/ExpenseOverview";
import ProductPriceComparison from "./AIDataResponseManager/AIDataResponseViews/ProductPriceComparison/ProductPriceComparison";
// import CartOperationsView from "./MessageItemOperations/CartOperationsView/CartOperationsView";
import CartOperationsAddAnimation from "./MessageItemOperations/CartOperationsView/CartOperationsAddAnimation";
import CartPriceComparison from "./AIDataResponseManager/AIDataResponseViews/CartPriceComparison/CartPriceComparison";
import CartView from "./AIDataResponseManager/AIDataResponseViews/CartView/CartView.js";
import {
  HistoryStats,
  MonthlyExpensesChart,
} from "./AIDataResponseManager/AIDataResponseViews/HistoryStats/HistoryStats.js";

const MessageItemOperationAI = ({ message }) => {
  return (
    <div className={`message-item operation`}>
      <p>{message}</p>
      <ProductPriceComparison />
      <CartOperationsAddAnimation barcode={"7290100850916"} amount={1} />
      <CartPriceComparison />
      <CartView />
      <HistoryStats />
      <MonthlyExpensesChart />
      {/* <ExpenseOverview /> */}
      {/* <CartOperationsView /> */}
    </div>
  );
};

export default MessageItemOperationAI;
