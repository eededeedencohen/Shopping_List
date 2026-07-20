import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { ProductContextProvider } from "./context/ProductContext";
import { PriceContextProvider } from "./context/PriceContext";
import { CartContextProvider } from "./context/CartContext";
import { CartOptimizationContextProvider } from "./context/cart-optimizationContext";
import { ClassificationsProvider } from "./context/classificationsContext";
import { CartContextProvider2 } from "./context/CartContext2";
import { PriceContextProvider2 } from "./context/PriceContext2";
import { ProductContextProvider2 } from "./context/ProductContext2";
import { CartOptimizationProvider } from "./context/CartOptimizationContext";
import { AiSettingsProvider } from "./context/AiSettingsContext";
import { AddProductDefaultsProvider } from "./context/AddProductDefaultsContext";
import { ProductsLayoutProvider } from "./context/ProductsLayoutContext";
import { CartCardLayoutProvider } from "./context/CartCardLayoutContext";
import { PriceCompareLayoutProvider } from "./context/PriceCompareLayoutContext";
import { AIThemeProvider } from "./context/AIThemeContext";
import { ReceiptThemeProvider } from "./context/ReceiptThemeContext";
import { SupermarketPreferencesProvider } from "./context/SupermarketPreferencesContext";
import { CompleteCartPreferencesProvider } from "./context/CompleteCartPreferencesContext";

const root = createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <PriceContextProvider>
      <ProductContextProvider>
        <CartContextProvider>
          <CartContextProvider2>
            <PriceContextProvider2>
                <ProductContextProvider2>
                  <ClassificationsProvider>
                  <CartOptimizationContextProvider>
                    <CartOptimizationProvider>
                      <AiSettingsProvider>
                        <AddProductDefaultsProvider>
                          <ProductsLayoutProvider>
                            <CartCardLayoutProvider>
                              <PriceCompareLayoutProvider>
                                <AIThemeProvider>
                                  <ReceiptThemeProvider>
                                    <SupermarketPreferencesProvider>
                                      <CompleteCartPreferencesProvider>
                                        <App />
                                      </CompleteCartPreferencesProvider>
                                    </SupermarketPreferencesProvider>
                                  </ReceiptThemeProvider>
                                </AIThemeProvider>
                              </PriceCompareLayoutProvider>
                            </CartCardLayoutProvider>
                          </ProductsLayoutProvider>
                        </AddProductDefaultsProvider>
                      </AiSettingsProvider>
                    </CartOptimizationProvider>
                  </CartOptimizationContextProvider>
                  </ClassificationsProvider>
                </ProductContextProvider2>
            </PriceContextProvider2>
          </CartContextProvider2>
        </CartContextProvider>
      </ProductContextProvider>
    </PriceContextProvider>
  </BrowserRouter>
);
