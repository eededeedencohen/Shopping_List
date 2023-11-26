import httpClient from ".";

const getPriceListByBarcode = async (barcode) => {
  const prices = await httpClient.get(`/pricesproducts/${barcode}`);
  return  prices;
};

export { getPriceListByBarcode };
