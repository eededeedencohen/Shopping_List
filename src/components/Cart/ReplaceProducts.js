import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "../ProductList/Images";
import "./ReplaceProducts.css";
import { Spin } from "antd";
import { DOMAIN } from "../../constants";

function ReplaceProducts({ barcode, closeModal, loadCart, userId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await axios(
          `${DOMAIN}/api/v1/products/replacement-products/${barcode}`
        );
        setProducts(result.data.data.products.products);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [barcode]);

  // const handleProductClick = async (newBarcode) => {
  //   try {
  //     const response = await axios.post(
  //       `http://localhost:8000/api/v1/carts/replace/${userId}`,
  //       {
  //         oldBarcode: barcode,
  //         newBarcode: newBarcode,
  //       }
  //     );
  //     console.log(response.data.data.cart);
  //     closeModal();
  //     loadCart(userId); // Add this line to update the cart after replacing a product
  //   } catch (error) {
  //     console.error("Error posting data: ", error);
  //     closeModal();
  //   }
  // };

  const handleProductClick = async (newBarcode) => {
    setIsReplacing(true); // Start spinner for replacement process
    try {
      const response = await axios.post(
        `${DOMAIN}/api/v1/carts/replace/${userId}`,
        {
          oldBarcode: barcode,
          newBarcode: newBarcode,
        }
      );
      console.log(response.data.data.cart);
      await loadCart(userId); // Reload cart data
    } catch (error) {
      console.error("Error posting data: ", error);
    } finally {
      setIsReplacing(false); // Stop spinner after the process
      closeModal(); // Close the modal in any case
    }
  };

  if (loading) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  if (isReplacing) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
        <p>isReplacing...</p>
      </div>
    );
  }

  return (
    <div className="replace-products">
      {products.map((product) => (
        <div
          key={product.barcode}
          className="replace-product"
          onClick={() => handleProductClick(product.barcode)}
        >
          <div className="replace-product-image">
            <Image barcode={product.barcode} />
          </div>
          <div className="replace-product-details">
            {/* take only the first 4 words from product.name  */}
            <h2 className="replace-product-details__name">{`${
              product.name && product.name.split(" ").slice(0, 4).join(" ")
            }`}</h2>
            <h2 className="replace-product-details__barcode">
              {product.barcode}
            </h2>
            <h2 className="replace-product-details__brand">{product.brand}</h2>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ReplaceProducts;
