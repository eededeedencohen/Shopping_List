import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ProductContextProvider } from "./context/ProductContext";
import { PriceContextProvider } from "./context/PriceContext";
import { CartContextProvider } from "./context/CartContext";

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
      <ProductContextProvider>
        <PriceContextProvider>
          <CartContextProvider>
            <App />
          </CartContextProvider>
        </PriceContextProvider>
      </ProductContextProvider>
  </BrowserRouter>
);
