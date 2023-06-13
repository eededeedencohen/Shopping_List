import React, { useEffect } from "react";
import { useCart } from "../../context/CartContext";
import "./Cart.css";

export default function Cart() {
  const { cart, loadCart } = useCart();
  const userId = "1"; // Replace this with the actual userId.

  useEffect(() => {
    loadCart(userId);
  }, [loadCart, userId]);

  let cartData;

  if (!cart) {
    return (
      <div className="cart">
        <p>Loading...</p>
      </div>
    );
  }
  
  if (cart) {
    console.log(cart);
    // // print the type of cart
    // console.log(typeof(cart));

    // convert JSON string to JavaScript object
    try {
      cartData = JSON.parse(cart);
      const supermarket = cartData.data.supermarket;
      const totalPrice = cartData.data.totalPrice;
      const productsWithPrices = cartData.data.productsWithPrices;
      console.log(supermarket);
      console.log(totalPrice);
      // for product in productsWithPrices: print product name and price
      for (let i = 0; i < productsWithPrices.length; i++) {
        console.log(productsWithPrices[i].product);
        console.log(productsWithPrices[i].amount);
        console.log(productsWithPrices[i].totalPrice);
      }

    } catch (err) {
      console.error("Failed to parse cart data:", err);
      cartData = null;
    }
  }

  return (
    <div className="cart">
      <h1>Cart</h1>
      {/* Add code to display cart data here. */}
      {/* For example, display total price: */}
      {cartData && <p>Total price: {cartData.data.totalPrice}</p>}
    </div>
  );
}


