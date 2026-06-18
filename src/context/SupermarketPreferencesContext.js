import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "supermarketPreferences.preferredSupermarketIDs";

const SupermarketPreferencesContext = createContext({
  preferredSupermarketIDs: [],
  setPreferredSupermarketIDs: () => {},
  toggleSupermarket: () => {},
  clearPreferences: () => {},
});

function readInitial() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => (typeof v === "string" || typeof v === "number" ? v : null))
      .filter((v) => v != null);
  } catch {
    return [];
  }
}

export function SupermarketPreferencesProvider({ children }) {
  const [preferredSupermarketIDs, setStateInternal] = useState(readInitial);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(preferredSupermarketIDs)
      );
    } catch {
      /* storage unavailable — ignore */
    }
  }, [preferredSupermarketIDs]);

  const value = useMemo(
    () => ({
      preferredSupermarketIDs,
      setPreferredSupermarketIDs: (ids) => {
        if (!Array.isArray(ids)) return;
        setStateInternal([...new Set(ids.filter((v) => v != null))]);
      },
      toggleSupermarket: (id) => {
        if (id == null) return;
        setStateInternal((prev) =>
          prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
      },
      clearPreferences: () => setStateInternal([]),
    }),
    [preferredSupermarketIDs]
  );

  return (
    <SupermarketPreferencesContext.Provider value={value}>
      {children}
    </SupermarketPreferencesContext.Provider>
  );
}

export const useSupermarketPreferences = () =>
  useContext(SupermarketPreferencesContext);
