// src/network/editProductsService.js

import axios from "axios";
import { DOMAIN } from "../constants";

/**
 * נתיבים זמינים (לפי מה שהצגת ב-productController + productRoutes):
 *  GET /api/v1/products
 *  POST /api/v1/products
 *  PATCH /api/v1/products/:id
 *  DELETE /api/v1/products/:id
 *  POST /api/v1/products/update-products-by-barcode
 */
const BASE_URL = `${DOMAIN}/api/v1/products`;

/** השגת כל המוצרים */
export const getAllProducts = async () => {
  const res = await axios.get(BASE_URL);
  return res.data; // {status:'success', data:{products:[]}}
};

/** יצירת מוצר חדש */
export const createProduct = async (productData) => {
  const res = await axios.post(BASE_URL, productData);
  return res.data; // {status:'success', data:{product:{...}}}
};

/** עדכון מוצר לפי id */
export const updateProductById = async (id, updates) => {
  const res = await axios.patch(`${BASE_URL}/${id}`, updates);
  return res.data; // {status:'success', data:{product:{...}}}
};

/** מחיקת מוצר לפי id */
export const deleteProductById = async (id) => {
  const res = await axios.delete(`${BASE_URL}/${id}`);
  return res.data; // {status:'success', data:null}
};

/** עדכון מרובה לפי barcode */
export const updateProductsByBarcode = async (productsArray) => {
  // productsArray = [{ barcode: "123", brand: "NewBrand", weight: 200, ... }, ...]
  const bulkURL = `${BASE_URL}/update-products-by-barcode`;
  const res = await axios.post(bulkURL, productsArray);
  return res.data; // {status:'success', data:{products:[...]}}
};
