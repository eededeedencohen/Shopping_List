import useProducts from "./useProducts";

const useSearchProducts = () => {
  const { products } = useProducts();

  const search = (query) => {
    const lowerQuery = query.toLowerCase();
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.generalName?.toLowerCase().includes(lowerQuery) ||
        product.brand?.toLowerCase().includes(lowerQuery)
    );
  };

  return search;
};

export default useSearchProducts;