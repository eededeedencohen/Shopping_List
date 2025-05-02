// import httpClient from "../network/index";

// /**
//  * Retrieves a list of prices for a given product barcode across all supermarkets.
//  *
//  * @param {string} barcode - The product barcode.
//  * @returns {Promise<Array>} A list of price entries for the given barcode.
//  */
// export const getPriceListByBarcode = async (barcode) => {
//   const response = await httpClient.get(`/prices/?barcode=${barcode}`);
//   return response.data.data.prices;
// };

// /**
//  * Retrieves a list of prices for all products in a specific supermarket.
//  *
//  * @param {string|number} supermarketID - The ID of the supermarket.
//  * @returns {Promise<Array>} A list of price entries for the given supermarket.
//  */
// export const getPricesBySupermarketID = async (supermarketID) => {
//   const response = await httpClient.get(`/prices/?supermarket.supermarketID=${supermarketID}`);
//   return response.data.data.prices;
// };

import httpClient from "../network/index";

const normalize = (data) =>
  typeof data === "string" ? JSON.parse(data) : data;

/**
 * רשימת מחירים לברקוד – מכל הסופרמרקטים
 */
export const getPriceListByBarcode = async (barcode) => {
  const res = await httpClient.get(`/prices/?barcode=${barcode}`);
  const payload = normalize(res.data); // { status, data:{ prices:[…] } }
  const priceByBarcodeData = payload?.data?.prices || []; // [] => “אין מחירים”
  console.log("getPriceListByBarcode", priceByBarcodeData);
  return priceByBarcodeData || [];
};

/**
 * כל המחירים בסופרמרקט מסוים
 */
export const getPricesBySupermarketID = async (supermarketID) => {
  console.log("getPricesBySupermarketID Applied");
  const res = await httpClient.get(
    `/prices/?supermarket.supermarketID=${supermarketID}`
  );
  const payload = normalize(res.data);
  const pricesBySupermarketData = payload?.data?.prices || []; // [] => “אין מחירים”
  console.log("getPricesBySupermarketID", pricesBySupermarketData);
  return pricesBySupermarketData || [];
};
