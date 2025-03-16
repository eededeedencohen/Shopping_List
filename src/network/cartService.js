import httpClient from ".";
import axios from "axios";
import { DOMAIN } from "../constants";

const getActiveCartByUserID = async (id) => {
  // const Cart = await httpClient.get(`/carts/cheapest/${id}`);
  const Cart = await httpClient.get(`/supermarket/full-cart/${id}`);
  return JSON.parse(Cart.data);
};

const getProductsAmountInCartByUserID = async (id) => {
  const Cart = await httpClient.get(`/carts/active/${id}`);
  return JSON.parse(Cart.data);
};

const addProductToCart = async (userId, barcode, amount) => {
  const response = await axios.post(
    `${DOMAIN}/api/v1/carts/product/${userId}`,
    {
      product: {
        barcode,
        amount,
      },
    }
  );
  return response.data;
};

const updateProductInCart = async (userId, barcode, amount) => {
  const response = await axios.patch(
    `${DOMAIN}/api/v1/carts/product/${userId}`,
    {
      barcode,
      amount,
    }
  );
  return response.data;
};

const deleteProductFromCart = async (userId, barcode) => {
  await axios.delete(`${DOMAIN}/api/v1/carts/product/${userId}`, {
    data: {
      barcode,
    },
  });
  console.log("deleted", barcode);
  return;
};

// localhost:8000/api/v1/prices/supermarkets
const getAllSupermarkets = async () => {
  const supermarkets = await httpClient.get(`/prices/supermarkets`);
  return supermarkets.data;
};

export {
  getActiveCartByUserID,
  getProductsAmountInCartByUserID,
  addProductToCart,
  updateProductInCart,
  deleteProductFromCart,
  getAllSupermarkets,
};
