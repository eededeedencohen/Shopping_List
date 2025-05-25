// import axios from "axios";
// import { DOMAIN } from "../constants"; // אם יש לך קובץ constants

// // נניח שהראוטר בשרת הוגדר תחת '/api/v1/alternative-products-groups'
// const BASE_URL = `${DOMAIN}/api/v1/alternative-products-groups`;

// //------------------------
// // GET ALL ALTERNATIVE PRODUCTS GROUPS
// //------------------------
// export const getAllAlternativeProductsGroups = async () => {
//   const response = await axios.get(`${BASE_URL}`);
//   return response.data; // { status, data: { allGroups: [...] }, ...}
// };

// //------------------------
// // GET ALTERNATIVE PRODUCTS GROUPS BY BARCODE
// //------------------------
// export const getAlternativeProductsGroupsByBarcode = async (barcode) => {
//   const response = await axios.get(`${BASE_URL}/${barcode}`);
//   return response.data; // { status, data: { groupsByBarcode: {...} } }
// };

// //------------------------
// // CREATE A NEW ALTERNATIVE PRODUCTS GROUPS
// //------------------------
// export const createAlternativeProductsGroups = async ({ barcode, groups }) => {
//   // data = { barcode, groups: [...] }
//   const response = await axios.post(`${BASE_URL}`, { barcode, groups });
//   return response.data; // { status, data: { newGroups: {...} } }
// };

// //------------------------
// // UPDATE ALL ALTERNATIVE PRODUCTS GROUPS
// //------------------------
// export const updateAllAlternativeProductsGroups = async (data) => {
//   // data יכול להיות {"groups": [...] } או מבנה אחר לפי הצורך
//   const response = await axios.patch(`${BASE_URL}`, data);
//   return response.data;
// };

// //------------------------
// // UPDATE A SINGLE GROUPS DOCUMENT BY BARCODE
// //------------------------
// export const updateAlternativeProductsGroupsByBarcode = async (
//   barcode,
//   { groups }
// ) => {
//   // שולחים { groups: [...] } לגוף הבקשה
//   const response = await axios.patch(`${BASE_URL}/${barcode}`, { groups });
//   return response.data; // { status, data: { updated: {...} } }
// };

// //------------------------
// // GET ALTERNATIVE PRODUCTS GROUPS DETAILS (BY LIST OF BARCODES)
// //------------------------
// export const getAlternativeProductsGroupsDetails = async (barcodes) => {
//   const response = await axios.post(`${BASE_URL}/details`, { barcodes });
//   return response.data; // { status, results, data: { products } }
// };
