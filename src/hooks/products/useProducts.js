import { useProducts as useProductsContext } from "../../context/ProductContext";

const useProducts = () => {
  const {
    products,
    loading,
    error,
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  } = useProductsContext();

  return {
    products,
    loading,
    error,
    allCategories,
    all_sub_categories,
    activeCategoryIndex,
    setActiveCategoryIndex,
    activeSubCategoryIndex,
    setActiveSubCategoryIndex,
  };
};

export default useProducts;
