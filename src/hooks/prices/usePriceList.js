// hooks/prices/usePriceList.js
import { usePrices } from "../../context/PriceContext2";

const usePriceList = () => {
  const { getPriceListByBarcodeCached } = usePrices();

  /**
   * מקבל ברקוד ומחזיר את רשימת המחירים מהשרת או מהקאש.
   * @param {string} barcode
   * @returns {Promise<Array>}
   */
  const getPriceList = async (barcode) => {
    if (!barcode) return [];
    return await getPriceListByBarcodeCached(barcode);
  };

  return getPriceList;
};

export default usePriceList;
