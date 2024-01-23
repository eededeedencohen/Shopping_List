import { createContext, useContext, useEffect, useState } from "react";
import {
  getAllProducts,
  getByBarcode,
  getProductByQuery,
} from "../network/productService";

const ProductContext = createContext(null);

export const ProductContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [productByBarcode, setProductByBarcode] = useState(null);
  const [loading, setLoading] = useState(false);

  const allCategories = [
    "פירות וירקות",
    "בשר עוף, ודגים",
    "מוצרי חלב וביצים",
    "לחמים ומאפים",
    "משקאות, יין ואלכוהול",
    "מוצרים קפואים",
    "בישול ואפייה",
    "שימורים",
    "חטיפים, מתוקים ודגנים",
    "ניקיון וחד פעמי",
    "פארם ותינוקות",
  ];
  const [activeCategory, setActiveCategory] = useState(allCategories[0]);

  useEffect(() => {
    const getProducts = async () => {
      setLoading(true);
      try {
        const response = await getAllProducts();
        const productsAmount = response.productsAmount;
        const products = JSON.parse(response.products.data).data.products;

        const productsWithAmount = products.map((product) => {
          // Find the product amount using the barcode
          const amountInfo = productsAmount.find(
            (p) => p.barcode === product.barcode
          );
          // Add the amount to the product object
          return { ...product, amount: amountInfo ? amountInfo.amount : 0 };
        });

        // console.log(productsWithAmount);
        setProducts(JSON.parse(response.products.data).data.products);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // get product by barcode from the products useState (asume that the products useState is already loaded):
  const getProductDetailsByBarcode = (barcode) => {
    return products.find((product) => product.barcode === barcode);
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await getAllProducts();
      const productsAmount = response.productsAmount;
      const products = JSON.parse(response.products.data).data.products;

      const productsWithAmount = products.map((product) => {
        // Find the product amount using the barcode
        const amountInfo = productsAmount.find(
          (p) => p.barcode === product.barcode
        );
        // Add the amount to the product object
        return { ...product, amount: amountInfo ? amountInfo.amount : 0 };
      });

      // console.log(productsWithAmount);
      setProducts(JSON.parse(response.products.data).data.products);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const getProductByBarcode = async (barcode) => {
    setLoading(true);
    try {
      const response = await getByBarcode(barcode);
      setProductByBarcode(JSON.parse(response.data).data.product); // assuming the response contains a single product
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async (query, supermarketID) => {
    try {
      const response = await getProductByQuery(query, supermarketID);
      // console.log(JSON.parse(response.data).data.products);
      return JSON.parse(response.data).data.products;
    } catch (e) {
      // Do something with error
      console.error(e);
      return [];
    }
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loadProducts,
        error,
        getProductByBarcode, // exposing the function
        productByBarcode, // exposing the state
        searchProducts,
        loading, // exposing the loading state

        // for category navigation
        allCategories,
        activeCategory,
        setActiveCategory,

        // get product fron the useState:
        getProductDetailsByBarcode,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) throw Error("ProductContext was not provided correctly");
  return context;
};
