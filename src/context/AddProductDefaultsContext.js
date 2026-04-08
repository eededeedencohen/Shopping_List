import { createContext, useContext, useEffect, useState, useRef, useCallback } from "react";
import { DOMAIN } from "../constants";

const AddProductDefaultsContext = createContext(null);

const DEFAULTS = {
  categoryIndex: 0,
  subCategoryIndex: 0,
  generalName: "",
};

export const AddProductDefaultsProvider = ({ children }) => {
  const [defaults, setDefaults] = useState(DEFAULTS);
  const [loaded, setLoaded] = useState(false);
  const pendingRef = useRef(null);
  const timerRef = useRef(null);

  // Load from server on mount
  useEffect(() => {
    fetch(`${DOMAIN}/api/v1/add-product-defaults`)
      .then((r) => r.json())
      .then((res) => {
        if (res.data) {
          const { _id, __v, userId, ...rest } = res.data;
          setDefaults((prev) => ({ ...prev, ...rest }));
        }
      })
      .catch((err) => console.error("Failed to load add-product defaults:", err))
      .finally(() => setLoaded(true));
  }, []);

  // Debounced save to server
  const flushToServer = useCallback((patch) => {
    fetch(`${DOMAIN}/api/v1/add-product-defaults`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).catch((err) => console.error("Failed to save add-product defaults:", err));
  }, []);

  const updateDefault = useCallback(
    (key, value) => {
      setDefaults((prev) => ({ ...prev, [key]: value }));

      pendingRef.current = { ...pendingRef.current, [key]: value };
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (pendingRef.current) {
          flushToServer(pendingRef.current);
          pendingRef.current = null;
        }
      }, 500);
    },
    [flushToServer]
  );

  return (
    <AddProductDefaultsContext.Provider value={{ defaults, updateDefault, loaded }}>
      {children}
    </AddProductDefaultsContext.Provider>
  );
};

export const useAddProductDefaults = () => useContext(AddProductDefaultsContext);
