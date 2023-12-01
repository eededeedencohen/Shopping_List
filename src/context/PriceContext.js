import { createContext, useContext, useState } from "react";
import { getPriceListByBarcode } from "../network/priceService";


const PriceContext = createContext(null);

export const PriceContextProvider = ({ children }) => {
  const [priceMap, setPriceMap] = useState(new Map());
  const [priceListError, setPriceListError] = useState();

  const getPriceList = async (barcode) => {
    if (priceMap.has(barcode)) {
      // try getting the list from the map
      return priceMap.get(barcode);
    }
    try {
      // get the list from the server
      // and cache it inside priceMap
      let priceListResponse = await getPriceListByBarcode(barcode);
      const priceList = JSON.parse(priceListResponse.data).data;
      priceMap.set(barcode, priceList);
      setPriceMap(new Map(priceMap));
      return priceList;
    } catch (e) {
      setPriceListError(e);
      return null;
    }
  };

  return (
    <PriceContext.Provider
      value={{
        getPriceList,
        priceListError,
      }}
    >
      {children}
    </PriceContext.Provider>
  );
};

export const usePriceList = () => {
  const context = useContext(PriceContext);
  if (!context) {
    throw new Error("Price Context was not provided");
  }
  return context;
};
