import React from "react";
import ProductDetails from "./ProductDetails";
import WeightAccuracy from "./WeightAccuracy";
// import { useCartOptimizationContext } from "../../context/cart-optimizationContext";

export default function ProductSettings({ product }) {
  // return the name of the product and the amount - for testing:
  return (
    <div>
      <h1>---------</h1>
      <ProductDetails productDetails={product.productDetails } quantity={product.quantity}/>
      <h1>{product.barcode}</h1>
      <h1>{product.generalName}</h1>
      <h1>{product.productSettings.canReplace && "canReplace"}</h1>
      <WeightAccuracy productSettings={product.productSettings} />
      <h1>---------</h1>
    </div>
  );
}
