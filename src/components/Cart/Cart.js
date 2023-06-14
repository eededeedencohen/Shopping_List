import React, { useEffect } from "react";
import { useCart } from "../../context/CartContext";
import "./Cart.css";
import ShaareyRevahaLogo from "./SuperMarketsLogo/שערי-רווחה.jpg";
import MilkiImage from "../ProductList/milki.png";

export const convertWeightUnit = (weightUnit) => {
  weightUnit = weightUnit.toLowerCase();
  if (weightUnit === "g") {
    return "גרם";
  }
  if (weightUnit === "kg") {
    return "קילוגרם";
  }
  if (weightUnit === "ml") {
    return "מיליליטר";
  }
  if (weightUnit === "l") {
    return "ליטר";
  }
  return weightUnit;
};

const getLogoBySupermarket = (supermarketName) => {
  // spep 1: save new name of the supermarket with - instead of space
  const supermarketNameWithDash = supermarketName.replace(" ", "-");

  const logoPath =
    __dirname + "SupermarketLogos/" + supermarketNameWithDash + ".png";
  console.log(logoPath);
  return logoPath;
};

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
      console.log(getLogoBySupermarket(supermarket.name));
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
      <div className="supermarket">
        <div className="supermarket-title">
          <h3>הסופרמרקט הכי משתלם לעגלה שלך </h3>
        </div>
        <div className="supermarket-logo">
          <img src={ShaareyRevahaLogo} alt="Shaarey Revaha Logo" />
        </div>
        <div className="supermarket-address">
          <div className="supermarket-address__city">
            {cartData.data.supermarket.city}
          </div>
          <div className="supermarket-Street__street">
            ,{cartData.data.supermarket.address}
          </div>
        </div>
        <hr className="line" />
      </div>
      <div className="total-price">
        <div className="total-price__title">
          <h1>סכום כולל של העגלה שלך</h1>
        </div>
        <div className="total-price__price">
          {cartData && <h1>{cartData.data.totalPrice}₪</h1>}
        </div>
      </div>
      <hr className="line" />
      <div className="products">
  {cartData &&
    cartData.data.productsWithPrices.map((item, index) => (
      <div>
        <div key={index} className="product" onClick={() => alert(item.product.barcode)}>              
          <div className="product-details">
            <h4 className="product-details__name">
              {item.product.name.split(" ").slice(0, 3).join(" ")}
            </h4>
            <h4 className="product-details__brand">{item.product.brand}</h4>
            <div className="product-details__weight">
              <h4 className="unit">
                {convertWeightUnit(item.product.unitWeight)}
              </h4>
              <h4 className="size">{item.product.weight}</h4>
            </div>
          </div>
          <div className="product-price">
            <h4 className="product-price__amount">{item.amount} :יחידות</h4>
            <h4 className="product-price__total-price">
              {parseFloat(item.totalPrice).toFixed(2)}{""}
              <b style={{ fontSize: "1.2em" }}>₪</b>{" "}
            </h4>
          </div>
          <div className="product-image">
            <img src={MilkiImage} alt="milki" />
          </div>
        </div>
        <hr />
      </div>
    ))}
</div>
    </div>
  );
}
