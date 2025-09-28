import { useCart } from "../context/CartContext2";
import { useEffect, createContext, useContext, useState } from "react";
import {
  getPricesBySupermarketID,
  getPriceListByBarcode,
  getCheapestSupermarketIDsByCart,
} from "../services/priceService";

const PriceContext2 = createContext(null);

export const PriceContextProvider2 = ({ children }) => {
  const { supermarketID } = useCart();
  const [pricesBySupermarket, setPricesBySupermarket] = useState([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  const [priceListMap, setPriceListMap] = useState(new Map()); // barcode -> list of prices

  /**
   * Loads all prices for a specific supermarket and stores them in context.
   * @param {string|number} supermarketID
   */
  useEffect(() => {
    if (supermarketID == null) return; // עדין לא נטען cart
    (async () => {
      setIsLoadingPrices(true);
      try {
        const pricesBySupermarket = await getPricesBySupermarketID(
          supermarketID
        );
        console.log("Prices loaded:", pricesBySupermarket);
        setPricesBySupermarket(pricesBySupermarket);
      } catch (e) {
        console.error("Failed to load prices:", e);
        setPricesBySupermarket([]);
      } finally {
        setIsLoadingPrices(false);
      }
    })();
  }, [supermarketID]);

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

  /**
   * Finds the cheapest supermarkets id for a given list of cart products.
   * @param {Array<{ barcode: string, amount: number }>} cartProducts
   * @returns {Promise<number[]>}
   */
  const findCheapestSupermarketIDs = async (cartProducts) => {
    try {
      const result = await getCheapestSupermarketIDsByCart(cartProducts);
      return result?.data?.supermarketIDs || [];
    } catch (error) {
      console.error("Failed to get cheapest supermarkets:", error);
      return [];
    }
  };

  return (
    <PriceContext2.Provider
      value={{
        pricesBySupermarket,
        isLoadingPrices,
        // loadPricesForSupermarket,
        getPriceListByBarcodeCached,
        findCheapestSupermarketIDs,
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
