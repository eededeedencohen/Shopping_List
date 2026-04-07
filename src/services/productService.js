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

export const createProduct = async (productData) => {
  try {
    const res = await httpClient.post("/products", JSON.stringify(productData), {
      headers: { "Content-Type": "application/json" },
    });
    const payload = normalize(res.data);
    return payload?.data?.product;
  } catch (err) {
    console.error("Failed to create product:", err.message);
    throw err;
  }
};
