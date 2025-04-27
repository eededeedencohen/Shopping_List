import httpClient from "../network/index";

/**
 * Retrieves a list of prices for a given product barcode across all supermarkets.
 * 
 * @param {string} barcode - The product barcode.
 * @returns {Promise<Array>} A list of price entries for the given barcode.
 */
export const getPriceListByBarcode = async (barcode) => {
  const response = await httpClient.get(`/prices/?barcode=${barcode}`);
  return response.data.data.prices;
};

/**
 * Retrieves a list of prices for all products in a specific supermarket.
 * 
 * @param {string|number} supermarketID - The ID of the supermarket.
 * @returns {Promise<Array>} A list of price entries for the given supermarket.
 */
export const getPricesBySupermarketID = async (supermarketID) => {
  const response = await httpClient.get(`/prices/?supermarket.supermarketID=${supermarketID}`);
  return response.data.data.prices;
};
