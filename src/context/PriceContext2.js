import { createContext, useContext, useState } from "react";
import {
  getPricesBySupermarketID,
  getPriceListByBarcode,
} from "../services/priceService";

const PriceContext2 = createContext(null);

export const PriceContextProvider = ({ children }) => {
  const [pricesBySupermarket, setPricesBySupermarket] = useState([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceListMap, setPriceListMap] = useState(new Map()); // barcode -> list of prices

  /**
   * Loads all prices for a specific supermarket and stores them in context.
   * @param {string|number} supermarketID
   */
  const loadPricesForSupermarket = async (supermarketID) => {
    setIsLoadingPrices(true);
    try {
      const prices = await getPricesBySupermarketID(supermarketID);
      setPricesBySupermarket(prices);
    } catch (error) {
      console.error("Failed to load supermarket prices:", error);
      setPricesBySupermarket([]);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  /**
   * Returns list of prices for a given barcode (from all supermarkets).
   * Uses internal cache to prevent redundant server calls.
   * @param {string} barcode
   * @returns {Promise<Array>}
   */
  const getPriceListByBarcodeCached = async (barcode) => {
    if (priceListMap.has(barcode)) {
      return priceListMap.get(barcode);
    }

    try {
      const prices = await getPriceListByBarcode(barcode);
      priceListMap.set(barcode, prices);
      setPriceListMap(new Map(priceListMap)); // force re-render
      return prices;
    } catch (error) {
      console.error("Failed to load price list for barcode:", error);
      return [];
    }
  };

  return (
    <PriceContext2.Provider
      value={{
        pricesBySupermarket,
        isLoadingPrices,
        loadPricesForSupermarket,
        getPriceListByBarcodeCached,
      }}
    >
      {children}
    </PriceContext2.Provider>
  );
};

export const usePrices = () => {
  const context = useContext(PriceContext2);
  if (!context) {
    throw new Error("PriceContext was not provided");
  }
  return context;
};
