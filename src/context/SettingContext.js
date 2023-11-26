import { createContext, useContext, useEffect, useState } from "react";
import { getsupermarketID } from "../network/settingService";
const SettingContext = createContext(null);

export const SettingContextProvider = ({ children }) => {
  const [supermarketID, setSupermarketID] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getSupermarketID = async () => {
      setLoading(true);
      try {
        const response = await getsupermarketID();
        setSupermarketID(response);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    getSupermarketID();
  }, []);

  return (
    <SettingContext.Provider
      value={{
        supermarketID,
        error,
        loading,
      }}
    >
      {children}
    </SettingContext.Provider>
  );
};

export const useSettingContext = () => useContext(SettingContext);
