// hooks/prices/useSupermarketPrices.js
import { usePrices } from "../../context/PriceContext2";

const useSupermarketPrices = () => {
  const { pricesBySupermarket, isLoadingPrices, loadPricesForSupermarket } =
    usePrices();

  /**
   * טוען מחירים לפי מזהה סופרמרקט.
   * @param {string|number} supermarketID
   */
  const loadPrices = async (supermarketID) => {
    if (!supermarketID) return;
    await loadPricesForSupermarket(supermarketID);
  };

  return {
    prices: pricesBySupermarket,
    isLoadingPrices,
    loadPrices,
  };
};

export default useSupermarketPrices;
