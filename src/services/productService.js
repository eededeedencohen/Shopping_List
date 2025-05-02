import httpClient from "../network/index";

const normalize = (data) => (typeof data === "string" ? JSON.parse(data) : data);

/**
 * מביא את כל המוצרים
 * מחזיר:  []  (לעולם מערך, גם אם אין נתונים)
 */
export const getAllProducts = async () => {
  try {
    const res     = await httpClient.get("/products");
    const payload = normalize(res.data);          // { status, data:{ products:[…] } }
    const products = payload?.data?.products || []; // [] => “אין מוצרים”
    console.log("getAllProducts", products);
    return products
  } catch (err) {
    console.error("Failed to fetch products:", err.message);
    throw err;
  }
};

// test for the function:

getAllProducts().then((products) => console.log(products)).catch((err) => console.error(err));
