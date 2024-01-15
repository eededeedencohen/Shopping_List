import React from "react";
// import { useCartOptimizationContext } from "../../context/cart-optimizationContext";

export default function WeightAccuracy({ productSettings }) {
  // return the name of the product and the amount - for testing:
  return (
    <div>
      <h1>===== Details: =====</h1>
      <h1>{productSettings.maxWeightGain}</h1>
      <h1>{productSettings.maxWeightLoss}</h1>
    </div>
  );
}
