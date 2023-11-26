import httpClient from ".";

const getsupermarketID = async () => {
  let activeCartResponse = await httpClient.get("/carts/active/1");
  // console.log(activeCartResponse);
  let activeCart = JSON.parse(activeCartResponse.data);
  const supermarketID = activeCart.data.cart.supermarketID;
  return supermarketID;
};

export { getsupermarketID };
