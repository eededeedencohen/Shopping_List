import { createContext, useContext, useEffect, useMemo, useState } from "react";

/* Persists the user's "complete cart" definition — a list of generalName strings
   the cart should always contain. Action #6 fills in any of these that are
   missing from the current cart. */
const STORAGE_KEY = "completeCart.generalNames";

const CompleteCartPreferencesContext = createContext({
  completeCartNames: [],
  setCompleteCartNames: () => {},
  toggleName: () => {},
  clearCompleteCart: () => {},
});

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v) => typeof v === "string" && v.trim());
  } catch {
    return [];
  }
}

export function CompleteCartPreferencesProvider({ children }) {
  const [completeCartNames, setStateInternal] = useState(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completeCartNames));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [completeCartNames]);

  const value = useMemo(
    () => ({
      completeCartNames,
      setCompleteCartNames: (names) => {
        if (!Array.isArray(names)) return;
        setStateInternal([
          ...new Set(names.filter((v) => typeof v === "string" && v.trim())),
        ]);
      },
      toggleName: (name) => {
        if (!name) return;
        setStateInternal((prev) =>
          prev.includes(name)
            ? prev.filter((x) => x !== name)
            : [...prev, name]
        );
      },
      clearCompleteCart: () => setStateInternal([]),
    }),
    [completeCartNames]
  );

  return (
    <CompleteCartPreferencesContext.Provider value={value}>
      {children}
    </CompleteCartPreferencesContext.Provider>
  );
}

export const useCompleteCartPreferences = () =>
  useContext(CompleteCartPreferencesContext);
