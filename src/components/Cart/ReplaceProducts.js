import React, { useEffect, useState } from "react";
import axios from "axios";
import Image from "../ProductList/Images";
import "./ReplaceProducts.css";
import { Spin } from "antd";
import { DOMAIN } from "../../constants";
import { useCart } from "../../context/CartContext";

function ReplaceProducts({ barcode, closeModal, loadCart, userId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  const { cart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Start new code
        const supermarketID = cart.supermarket.supermarketID;
        let productDetails = await axios(
          `${DOMAIN}/api/v1/products/supermarket/${supermarketID}/?barcode=${barcode}`
        );
        const generalName = productDetails.data.data.products[0].generalName;
        const newResult = await axios(
          `${DOMAIN}/api/v1/products/supermarket/${supermarketID}/?generalName=${generalName}`
        );
        const replaceProducts = newResult.data.data.products;
        // sort by hasPrice: True first
        replaceProducts.sort((a, b) => {
          if (a.hasPrice && !b.hasPrice) {
            return -1;
          }
          if (!a.hasPrice && b.hasPrice) {
            return 1;
          }
          return 0;
        });
        console.log(replaceProducts);
        setProducts(replaceProducts);
        // End new code

        // Start old code
        // const result = await axios(
        //   `${DOMAIN}/api/v1/products/replacement-products/${barcode}`
        // );
        // setProducts(result.data.data.products.products);
        // End old code

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [barcode, cart.supermarket.supermarketID]);

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

  const convertWeightUnit = (weightUnit) => {
    weightUnit = weightUnit.toLowerCase();
    if (weightUnit === "g") {
      return "גרם";
    }
    if (weightUnit === "kg") {
      return 'ק"ג';
    }
    if (weightUnit === "ml") {
      return 'מ"ל';
    }
    if (weightUnit === "l") {
      return "ליטר";
    }
    return weightUnit;
  };

  const max18Characters = (str) => {
    if (str.length > 26) {
      return "..." + str.substring(0, 21);
    }
    return str;
  };

  const priceFormat = (price) => {
    return price.toFixed(2);
  };

  const discountPriceFormat = (price) => {
    const units = price.discount.units;
    const totalPrice = price.discount.totalPrice;
    return (
      <div
        className="list__discount-price"
        style={{
          display: "flex",
          flexDirection: "row-reverse",
          alignItems: "center",
          color: "#ff0000",
          fontWeight: "bold",
        }}
      >
        <p style={{ marginLeft: "0.3rem" }}>{units}</p>
        <p>{"יחידות ב"}</p>
        <p>{" - "}</p>
        <p>{priceFormat(totalPrice)}</p>
        <p style={{ fontWeight: "bold" }}>{"₪"}</p>
      </div>
    );
  };

  return (
    <div className="replace-products">
      {products.map((product) => (
        <>
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
            <p className="replace-product-details__name">{`${
              product.name && max18Characters(product.name)
            }`}</p>
            <div className="replace-product-details__information">
              <p style={{ marginLeft: "0.3rem" }}>{product.weight}</p>
              <p>{convertWeightUnit(product.unitWeight)}</p>
              <p style={{ color: "black" }}>{"|"}</p>
              <p className="replace-product-details__brand">{product.brand}</p>
            </div>
            <div className="replace-product-details__price">
              {product.price && <p> {product.price.price}</p>}
              {product.price && <p style={{ fontWeight: "bold" }}>{"₪"}</p>}
              {!product.hasPrice && (
                <p style={{ color: "#ff0000" }}>מחיר לא זמין בסופר</p>
              )}
            </div>
            { product.price && product.price.discount && discountPriceFormat(product.price)}
          </div>
          
        </div>
        <div className="replace-product-separator"></div>
        </>
      ))}
    </div>
  );
}

export default ReplaceProducts;
