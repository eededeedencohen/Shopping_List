import httpClient from ".";

const getAllProducts = async () => {
  const products = await httpClient.get("/products");
  return products;
};

const getByBarcode = async (barcode) => {
  const product = await httpClient.get(
    "/products" + encodeURI("?barcode=" + barcode)
  );
  return product;
};

const getProductByQuery = async (query) => {
  const product = await httpClient.get(
    "/products/search" + encodeURI("?q=" + query)
  );
  return product;
};
export { getAllProducts, getByBarcode, getProductByQuery };
