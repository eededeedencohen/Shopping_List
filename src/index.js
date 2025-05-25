import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ProductContextProvider } from "./context/ProductContext";
import { PriceContextProvider } from "./context/PriceContext";
import { CartContextProvider } from "./context/CartContext";
import { CartOptimizationContextProvider } from "./context/cart-optimizationContext";
import { CartContextProvider2 } from "./context/CartContext2";
import { PriceContextProvider2 } from "./context/PriceContext2";
import { ProductContextProvider2 } from "./context/ProductContext2";
import { GroupContextProvider } from "./context/GroupsContext"; // Importing GroupsContext if needed

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <PriceContextProvider>
      <ProductContextProvider>
        <CartContextProvider>
          <CartContextProvider2>
            <PriceContextProvider2>
              <GroupContextProvider>
                <ProductContextProvider2>
                  <CartOptimizationContextProvider>
                    <App />
                  </CartOptimizationContextProvider>
                </ProductContextProvider2>
              </GroupContextProvider>
            </PriceContextProvider2>
          </CartContextProvider2>
        </CartContextProvider>
      </ProductContextProvider>
    </PriceContextProvider>
  </BrowserRouter>
);
