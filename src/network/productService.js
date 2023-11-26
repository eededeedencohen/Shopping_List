import httpClient from ".";

const getAllProducts = async () => {

  let activeCartResponse = await httpClient.get("/carts/active/1");
  // console.log(activeCartResponse);
  let activeCart =  JSON.parse(activeCartResponse.data);
  const supermarketID = activeCart.data.cart.supermarketID;
  let products; 
  if (supermarketID === 0) {
    products = await httpClient.get("/products");
  } else {
    products = await httpClient.get(`/products/supermarket/${supermarketID}`);
  }
    
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

const getReplacementProducts = async (barcode) => {
  const products = await httpClient.get(
    `/products/replacement-products/${barcode}`
  );
  return products;
};

export {
  getAllProducts,
  getByBarcode,
  getProductByQuery,
  getReplacementProducts,
};
