import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "receiptTheme";
const DEFAULT_THEME = "color";
const VALID_THEMES = ["color", "grayscale"];

const ReceiptThemeContext = createContext({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ReceiptThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return VALID_THEMES.includes(stored) ? stored : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — ignore */
    }
  }, [theme]);

  const setTheme = (next) => {
    if (VALID_THEMES.includes(next)) setThemeState(next);
  };

  return (
    <ReceiptThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ReceiptThemeContext.Provider>
  );
}

export const useReceiptTheme = () => useContext(ReceiptThemeContext);
