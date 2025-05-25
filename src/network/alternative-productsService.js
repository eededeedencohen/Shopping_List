// import axios from "axios";
// import { DOMAIN } from "../constants";

// //------------------------
// // GET ALL ALTERNATIVE PRODUCTS
// //------------------------
// const getAllAlternativeProducts = async () => {
//   const response = await axios.get(`${DOMAIN}/api/v1/alternative-products`);
//   return response.data;
// };

// //------------------------
// // GET ALTERNATIVE PRODUCT BY BARCODE
// //------------------------
// const getAlternativeProductByBarcode = async (barcode) => {
//   const response = await axios.get(
//     `${DOMAIN}/api/v1/alternative-products/${barcode}`
//   );
//   return response.data;
// };

// //------------------------
// // CREATE A NEW ALTERNATIVE PRODUCT
// //------------------------
// const createAlternativeProduct = async (barcode, alternatives) => {
//   const response = await axios.post(`${DOMAIN}/api/v1/alternative-products`, {
//     barcode,
//     alternatives,
//   });
//   return response.data;
// };

// //------------------------
// // UPDATE ALL ALTERNATIVE PRODUCTS
// //------------------------
// const updateAllAlternativeProducts = async (data) => {
//   const response = await axios.patch(
//     `${DOMAIN}/api/v1/alternative-products`,
//     data
//   );
//   return response.data;
// };

// //------------------------
// // UPDATE ALTERNATIVE PRODUCT BY BARCODE
// //------------------------
// const updateAlternativeProductByBarcode = async (barcode, alternatives) => {
//   const response = await axios.patch(
//     `${DOMAIN}/api/v1/alternative-products/${barcode}`,
//     {
//       alternatives,
//     }
//   );
//   return response.data;
// };

// //------------------------
// // GET ALTERNATIVE PRODUCTS DETAILS (BY LIST OF BARCODES)
// //------------------------
// const getAlternativeProductsDetails = async (barcodes) => {
//   const response = await axios.post(`${DOMAIN}/api/v1/alternative-products/details`, {
//     barcodes,
//   });
//   return response.data;
// };

// export {
//   getAllAlternativeProducts,
//   getAlternativeProductByBarcode,
//   createAlternativeProduct,
//   updateAllAlternativeProducts,
//   updateAlternativeProductByBarcode,
//   getAlternativeProductsDetails,
// };
