import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "cartCardLayout";
const DEFAULT_LAYOUT = "default";
const VALID_LAYOUTS = ["default", "compact"];

const CartCardLayoutContext = createContext({
  layout: DEFAULT_LAYOUT,
  setLayout: () => {},
});

export function CartCardLayoutProvider({ children }) {
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
    <CartCardLayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </CartCardLayoutContext.Provider>
  );
}

export const useCartCardLayout = () => useContext(CartCardLayoutContext);
