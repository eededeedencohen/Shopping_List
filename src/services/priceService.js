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
  return priceByBarcodeData || [];
};

/**
 * כל המחירים בסופרמרקט מסוים
 */
export const getPricesBySupermarketID = async (supermarketID) => {
  const res = await httpClient.get(
    `/prices/?supermarket.supermarketID=${supermarketID}`
  );
  const payload = normalize(res.data);
  const pricesBySupermarketData = payload?.data?.prices || []; // [] => “אין מחירים”
  return pricesBySupermarketData || [];
};

/**
 * מציאת סופרמרקטים זולים ביותר עבור עגלה מסוימת
 * מקבל רשימת מוצרים: [{ barcode, amount }]
 * מחזיר: { status, price, length, data: { supermarketIDs: [...] } }
 */
export const getCheapestSupermarketIDsByCart = async (products) => {
  const res = await httpClient.post(
    "/prices/cheapest-supermarkets-ids-by-cart/",
    JSON.stringify({ products }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return normalize(res.data);
};

/**
 * דירוג סופרמרקטים לפי מחיר העגלה (אותה עגלה, ממוין מהזול ליקר)
 * מקבל: [{ barcode, amount }], וגבול אופציונלי
 * מחזיר: { status, length, data: { supermarkets: [{ supermarketID, price }] } }
 */
export const getRankedSupermarketsByCart = async (products, limit = 10) => {
  const res = await httpClient.post(
    "/prices/ranked-supermarkets-by-cart/",
    JSON.stringify({ products, limit }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return normalize(res.data);
};