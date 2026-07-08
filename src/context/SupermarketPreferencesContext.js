import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "supermarketPreferences.preferredSupermarketIDs";
const STORAGE_KEY_MODE = "supermarketPreferences.availableInAllMode";

const SupermarketPreferencesContext = createContext({
  preferredSupermarketIDs: [],
  setPreferredSupermarketIDs: () => {},
  toggleSupermarket: () => {},
  clearPreferences: () => {},
  availableInAllMode: false,
  setAvailableInAllMode: () => {},
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

function readInitialMode() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_MODE)) === true;
  } catch {
    return false;
  }
}

export function SupermarketPreferencesProvider({ children }) {
  const [preferredSupermarketIDs, setStateInternal] = useState(readInitial);
  /* "הצג רק מוצרים הקיימים בכל הסניפים המועדפים" — filters the products page to
     products carried by EVERY preferred supermarket. Persisted like the list. */
  const [availableInAllMode, setModeInternal] = useState(readInitialMode);

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

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MODE, JSON.stringify(availableInAllMode));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [availableInAllMode]);

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
      availableInAllMode,
      setAvailableInAllMode: (v) =>
        setModeInternal((prev) =>
          typeof v === "function" ? Boolean(v(prev)) : Boolean(v)
        ),
    }),
    [preferredSupermarketIDs, availableInAllMode]
  );

  return (
    <SupermarketPreferencesContext.Provider value={value}>
      {children}
    </SupermarketPreferencesContext.Provider>
  );
}

export const useSupermarketPreferences = () =>
  useContext(SupermarketPreferencesContext);
