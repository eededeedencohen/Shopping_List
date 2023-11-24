import httpClient from ".";
import axios from "axios";

const getActiveCartByUserID = async (id) => {
  // const Cart = await httpClient.get(`/carts/cheapest/${id}`);
  const Cart = await httpClient.get(`/supermarket/full-cart/${id}`);
  return JSON.parse(Cart.data);
};


const addProductToCart = async (userId, barcode, amount) => {
  const response = await axios.post(
    `http://localhost:8000/api/v1/carts/product/${userId}`,
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
    `http://localhost:8000/api/v1/carts/product/${userId}`,
    {
      barcode,
      amount,
    }
  );
  return response.data;
};

export { getActiveCartByUserID, addProductToCart, updateProductInCart };
