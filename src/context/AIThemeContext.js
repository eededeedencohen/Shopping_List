import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "aiTheme";
const DEFAULT_THEME = "neurons";
const VALID_THEMES = ["neurons", "aurora", "galaxy", "cyber"];

const AIThemeContext = createContext({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function AIThemeProvider({ children }) {
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
    <AIThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </AIThemeContext.Provider>
  );
}

export const useAITheme = () => useContext(AIThemeContext);
export const AI_THEMES = VALID_THEMES;
