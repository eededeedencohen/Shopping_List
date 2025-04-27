import httpClient from "../network/index";

/**
 * Fetches the active cart of a user.
 * @returns {Promise<Object>} The active cart object
 */
export const getActiveCart = async () => {
  const response = await httpClient.get("/carts/active/1");
  return response.data.data.cart;
};

/**
 * Updates the cart on the server.
 * @param {string} cartID The cart ID to update
 * @param {Object} updatedCart The modified cart to save
 * @returns {Promise<Object>} The updated cart from the server
 */
export const updateCartData = async (cartID, updatedCart) => {
  const response = await httpClient.patch(`/carts/${cartID}`, updatedCart);
  return response.data.data.cart;
};
