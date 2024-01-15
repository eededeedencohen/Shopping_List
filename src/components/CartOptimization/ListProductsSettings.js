import React from "react";
import ProductSettings from "./ProductSettings";
import { useCartOptimizationContext } from "../../context/cart-optimizationContext";

export default function ListProductsSettings() {
  const {
    productsSettings,
    isProductsSettingsUploaded,

    changeCanReplaceAll,
  } = useCartOptimizationContext();

  const onClickHandler = () => {
    const randomBoolean = Math.random() >= 0.5;
    changeCanReplaceAll(randomBoolean);
  };

  if (!isProductsSettingsUploaded) {
    return (
      <div>
        <h1>Loading Data...</h1>
        <button onClick={onClickHandler}>Optimize</button>
      </div>
    );
  }

  return (
    <div>
      {console.log(productsSettings)}
      <button onClick={onClickHandler}>Optimize</button>
      <div>
        {productsSettings.map((product) => (
          <ProductSettings key={product.barcode} product={product} />
        ))}
      </div>
    </div>
  );
}
