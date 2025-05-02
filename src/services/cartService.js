// import httpClient from "../network/index";

// /**
//  * Fetches the active cart of a user.
//  * @returns {Promise<Object>} The active cart object
//  */
// export const getActiveCart = async () => {
//   const response = await httpClient.get("/carts/active/1");
//   return response.data.data.cart;
// };

// /**
//  * Updates the cart on the server.
//  * @param {string} cartID The cart ID to update
//  * @param {Object} updatedCart The modified cart to save
//  * @returns {Promise<Object>} The updated cart from the server
//  */
// export const updateCartData = async (cartID, updatedCart) => {
//   const response = await httpClient.patch(`/carts/${cartID}`, updatedCart);
//   return response.data.data.cart;
// };

import httpClient from "../network/index";

/**
 * עוזר קטן – מחזיר אובייקט  (אם צריך → JSON.parse)
 */
const normalize = (data) =>
  typeof data === "string" ? JSON.parse(data) : data;

/**
 * מחזיר את העגלה הפעילה של userID=1
 * (ה-Context מצפה לאובייקט העגלה עצמו, לא למעטפת data)
 */
export const getActiveCart = async () => {
  try {
    const res = await httpClient.get("/carts/active/1");
    const payload = normalize(res.data); // { status, data:{ cart:{…} } }
    const cart = payload?.data?.cart || null;
    console.log("getActiveCart", cart);
    return cart; // null => “העגלה ריקה”
  } catch (err) {
    console.error("getActiveCart failed:", err.message);
    throw err;
  }
};

/**
 * מעדכן עגלה בשרת ומחזיר את העגלה המעודכנת
 */
export const updateCartData = async (cartID, updatedCart) => {
  const res = await httpClient.patch(`/carts/${cartID}`, updatedCart);
  const payload = normalize(res.data);
  return payload?.data?.cart || null;
};
