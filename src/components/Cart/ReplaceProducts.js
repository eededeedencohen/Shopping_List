import React, { useState, useEffect } from "react";
import { ProductImageDisplay } from "../Images/ProductImageService";
import styles from "./ReplaceProducts.module.css";
import { Spin } from "antd";
import { useCartActions, useAlternativeProducts } from "../../hooks/appHooks";

function ReplaceProducts({ barcode, closeModal, userId }) {
  const [isReplacing, setIsReplacing] = useState(false);
  const { replaceProduct: replaceProductNew } = useCartActions();
  const alternatives = useAlternativeProducts(barcode);

  const [delayedAlternatives, setDelayedAlternatives] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDelayedAlternatives(alternatives);
    }, 500);

    return () => clearTimeout(timer);
  }, [alternatives, barcode]);

  const handleProductClick = async (newBarcode) => {
    setIsReplacing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // ← דיליי של שנייה

      replaceProductNew(barcode, newBarcode);
    } catch (error) {
      console.error("Error posting data: ", error);
    } finally {
      setIsReplacing(false);
      closeModal();
    }
  };

  if (isReplacing) {
    return (
      <div className={styles['spinner-container']}>
        <Spin size="large" />
        <p>isReplacing...</p>
      </div>
    );
  }

  if (!delayedAlternatives.length) {
    return (
      <div className={styles['spinner-container']}>
        <Spin size="large" />
        <p>טוען חלופות...</p>
      </div>
    );
  }

  const convertWeightUnit = (weightUnit) => {
    if (!weightUnit) return "";
    weightUnit = weightUnit.toLowerCase();
    if (weightUnit === "g") return "גרם";
    if (weightUnit === "kg") return 'ק"ג';
    if (weightUnit === "ml") return 'מ"ל';
    if (weightUnit === "l") return "ליטר";
    return weightUnit;
  };

  const max18Characters = (str) => {
    if (!str) return "";
    return str.length > 26 ? "..." + str.substring(0, 21) : str;
  };

  const priceFormat = (price) => price.toFixed(2);

  const discountPriceFormat = (price) => {
    const units = price.discount.units;
    const totalPrice = price.discount.totalPrice;
    return (
      <div
        className={styles['list__discount-price']}
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
        <p>{"₪"}</p>
      </div>
    );
  };

  console.log("alternatives", alternatives);

  return (
    <div className={styles['replace-products']}>
      <div className={styles['replace-products-header']}>
        <h3>בחר מוצר חלופי</h3>
      </div>
      <div className={styles['replace-products-list']}>
        {delayedAlternatives.map((product) => (
          <div
            key={product.barcode}
            className={styles['replace-product']}
            onClick={() => handleProductClick(product.barcode)}
          >
            <div className={styles['replace-product-image']}>
              <ProductImageDisplay barcode={product.barcode} />
            </div>
            <div className={styles['replace-product-details']}>
              <p className={styles['replace-product-details__name']}>
                {product.name && max18Characters(product.name)}
              </p>
              <div className={styles['replace-product-details__information']}>
                <p className={styles['replace-product-details__brand']}>
                  {product.brand}
                </p>
                <p className={styles['replace-product-details__separator']}>|</p>
                <p>{product.weight} {convertWeightUnit(product.unitWeight)}</p>
              </div>
              <div className={styles['replace-product-details__price']}>
                {product.price ? (
                  <>
                    <p>{priceFormat(product.price)}</p>
                    <p className={styles['price-currency']}>₪</p>
                  </>
                ) : (
                  <p className={styles['price-unavailable']}>מחיר לא זמין</p>
                )}
              </div>
              {product.hasDiscount && discountPriceFormat(product)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReplaceProducts;
