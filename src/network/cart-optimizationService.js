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

const getFullActiveCart = async (userID) => {
  try {
    const response = await axios.get(
      `${DOMAIN}/api/v1/supermarket/full-cart/${userID}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in fetching full active cart: ", error);
    throw error;
  }
};

const getAllBrands = async () => {
  try {
    const response = await axios.get(
      `${DOMAIN}/api/v1/cart-optimization/allBrands`
    );
    return response.data;
  } catch (error) {
    console.error("Error in fetching all brands: ", error);
    throw error;
  }
};

const getAllBrandsByGeneralName = async (generalName) => {
  try {
    const response = await axios.get(
      `${DOMAIN}/api/v1/cart-optimization/allBrandsByGeneralName/${generalName}`
    );
    return response.data;
  } catch (error) {
    console.error("Error in fetching all brands by general name: ", error);
    throw error;
  }
};

const getAllSupermarkets = async () => {
  try {
    const response = await axios.get(
      `${DOMAIN}/api/v1/cart-optimization/allSupermarkets`
    );
    return response.data;
  } catch (error) {
    console.error("Error in fetching all supermarkets: ", error);
    throw error;
  }
};

export {
  getOptimalSupermarketCarts,
  getFullActiveCart,
  getAllBrands,
  getAllBrandsByGeneralName,
  getAllSupermarkets,
};
