import httpClient from ".";

const getAllProducts = async () => {

  let activeCartResponse = await httpClient.get("/carts/active/1");
  let activeCart =  JSON.parse(activeCartResponse.data);
  let productsAmount = activeCart.data.cart.products;

  const supermarketID = activeCart.data.cart.supermarketID;
  let products; 
  if (supermarketID === 0) {
    products = await httpClient.get("/products");
  } else {
    products = await httpClient.get(`/products/supermarket/${supermarketID}`);
    return {
      products: products,
      productsAmount: productsAmount
    }
  }
  console.log(products);
  return products;
};

const getByBarcode = async (barcode) => {
  const product = await httpClient.get(
    "/products" + encodeURI("?barcode=" + barcode)
  );
  return product;
};

const getProductByQuery = async (query, supermarketID) => {
  const product = await httpClient.get(
    // "/products/search" + encodeURI("?q=" + query)
    // products/search/:supermarketID - the supermarketID is 1 for now
    
    // "/products/search/1" + encodeURI("?q=" + query)
    `/products/search/${supermarketID}` + encodeURI("?q=" + query)
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
