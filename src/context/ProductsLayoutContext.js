import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "productsLayout";
const DEFAULT_LAYOUT = "list";
const VALID_LAYOUTS = ["list", "grid"];

const ProductsLayoutContext = createContext({
  layout: DEFAULT_LAYOUT,
  setLayout: () => {},
});

export function ProductsLayoutProvider({ children }) {
  const [layout, setLayoutState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return VALID_LAYOUTS.includes(stored) ? stored : DEFAULT_LAYOUT;
    } catch {
      return DEFAULT_LAYOUT;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, layout);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [layout]);

  const setLayout = (next) => {
    if (VALID_LAYOUTS.includes(next)) setLayoutState(next);
  };

  return (
    <ProductsLayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </ProductsLayoutContext.Provider>
  );
}

export const useProductsLayout = () => useContext(ProductsLayoutContext);
