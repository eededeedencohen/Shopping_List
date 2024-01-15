import React from "react";
import { useCartOptimizationContext } from "../../context/cart-optimizationContext";

export default function Test() {
  const {
    optimalSupermarkets,
    isDataUploaded,
    supermarketIDs,
    setSupermarketIDs,

    productsSettings,
    isProductsSettingsUploaded,

    changeCanReplaceAll,
  } = useCartOptimizationContext();

  const onClickHandler = () => {
    // check the biggest number in the array and add item that bigger than it by 1
    const biggestNum = Math.max(...supermarketIDs);
    setSupermarketIDs([...supermarketIDs, biggestNum + 1]);
    changeCanReplaceAll(false);
  };

  if (!isDataUploaded || !isProductsSettingsUploaded) {
    return (
      <div>
        <h1>Loading Data...</h1>
        <button onClick={onClickHandler}>Optimize</button>
      </div>
    );
  }

  return (
    <div>
      <h1>Data is Uploaded</h1>
      <button onClick={onClickHandler}>Optimize</button>
      {optimalSupermarkets.map((cart, index) => (
        <div key={index}>
          <h3>Supermarket ID: {cart.supermarketID}</h3>
          <h3>Total Price: {cart.totalPrice}</h3>
          <h4>Exists Products:</h4>
          {cart.existsProducts &&
            cart.existsProducts.map((product, prodIndex) => (
              <div key={prodIndex}>
                <p>Barcode: {product.barcode}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Total Price: {product.totalPrice}</p>
              </div>
            ))}
          <h4>Non Exists Products:</h4>
          {cart.nonExistsProducts &&
            cart.nonExistsProducts.map((product, prodIndex) => (
              <div key={prodIndex}>
                <p>Barcode: {product.barcode}</p>
                <p>Quantity: {product.quantity}</p>
                <p>Total Price: {product.totalPrice}</p>
              </div>
            ))}
        </div>
      ))}
      {console.log(optimalSupermarkets)}
      {
        console.log(
          productsSettings
        ) /** empty array instead of the full active cart */
      }
    </div>
  );
}
