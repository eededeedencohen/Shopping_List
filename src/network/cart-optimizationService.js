import axios from "axios";
import { DOMAIN } from "../constants";

const getOptimalSupermarketCarts = async (supermarketIDs, products) => {
  try {
    const response = await axios.post(
      `${DOMAIN}/api/v1/cart-optimization/optimalsSupermarketCarts`,
      { supermarketIDs, products }
    );
    return response.data;
  } catch (error) {
    console.error("Error in fetching optimal supermarkets: ", error);
    throw error;
  }
};

const getFullActiveCart = async (supermarketID) => {
  try {
    const response = await axios.get(
      `${DOMAIN}/api/v1/supermarket/full-cart/${supermarketID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in fetching full active cart: ", error);
    throw error;
  }
};

export { getOptimalSupermarketCarts, getFullActiveCart };
