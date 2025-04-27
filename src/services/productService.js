import httpClient from "../network/index";

// מביא את כל המוצרים מהשרת
export const getAllProducts = async () => {
  try {
    const response = await httpClient.get("/products");
    return response.data?.data?.products || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
    throw error;
  }
};
