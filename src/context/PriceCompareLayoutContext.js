import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "priceCompareLayout";
const DEFAULT_LAYOUT = "grouped";
const VALID_LAYOUTS = ["expanded", "grouped"];

const PriceCompareLayoutContext = createContext({
  layout: DEFAULT_LAYOUT,
  setLayout: () => {},
});

export function PriceCompareLayoutProvider({ children }) {
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
    <PriceCompareLayoutContext.Provider value={{ layout, setLayout }}>
      {children}
    </PriceCompareLayoutContext.Provider>
  );
}

export const usePriceCompareLayout = () =>
  useContext(PriceCompareLayoutContext);
