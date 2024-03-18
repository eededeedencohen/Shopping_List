import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import ProductsImages from "../../../../Images/ProductsImages";
import { useCartOptimizationContext } from "../../../../../context/cart-optimizationContext";
import "./EditOptimalProduct.css";
import PointerIcon from "./pointer.svg";

const convertLaterToUnitWeight = (unitWeight) => {
  switch (true) {
    case unitWeight === "g":
      return "גרם";
    case unitWeight === "kg":
      return "קילוגרם";
    case unitWeight === "ml":
      return "מיליליטר";
    case unitWeight === "l":
      return "ליטר";
    case unitWeight === "u":
      return "יחידות";
    default:
      return unitWeight;
  }
};

const EditOptimalProduct = ({
  productDetails,
  optimalProductDetails,
  supermarketID,
  closeModal,
}) => {
  const { getPriceByProductBarcodeAndSupermarketID, changeOptimalProductQuantity } =
    useCartOptimizationContext();

  // useState for the price of the product:
  const [productPrice, setProductPrice] = useState(0);
  const [isProductPriceLoading, setIsProductPriceLoading] = useState(true);

  // useState for the editing quantity:
  const [editingQuantity, setEditingQuantity] = useState(
    optimalProductDetails.quantity
  );

  const [editedTotalPrice, setEditedTotalPrice] = useState(0);

  // useEffect for getting the price of the product:
  useEffect(() => {
    const fetchProductPrice = async () => {
      const productPrice = await getPriceByProductBarcodeAndSupermarketID(
        productDetails.product.barcode,
        supermarketID
      );
      setProductPrice(productPrice);
      setIsProductPriceLoading(false);
    };
    fetchProductPrice();
  }, [
    productDetails.product.barcode,
    supermarketID,
    getPriceByProductBarcodeAndSupermarketID,
  ]);

  useEffect(() => {
    // case there is a discount:
    if (productPrice.hasDiscount) {
      setEditedTotalPrice(
        (editingQuantity % productPrice.discount.units) * productPrice.price +
          Math.floor(editingQuantity / productPrice.discount.units) *
            productPrice.discount.totalPrice
      );
    }
    // case there is no discount:
    else {
      setEditedTotalPrice(editingQuantity * productPrice.price);
    }
  }, [editingQuantity, productPrice]);

  const addOneToEditingQuantity = () => {
    setEditingQuantity(editingQuantity + 1);
  };

  const reduceOneFromEditingQuantity = () => {
    if (editingQuantity > 1) {
      setEditingQuantity(editingQuantity - 1);
    }
  };

  const updateOptimalProductQuantity = () => {
    changeOptimalProductQuantity(
      productDetails.product.barcode,
      supermarketID,
      editingQuantity,
      editedTotalPrice
    );

    closeModal();
  };

  // console.log("productDetails", productDetails);
  // console.log("optimalProductDetails", optimalProductDetails);
  // console.log("supermarketID", supermarketID);
  console.log("productPrice", productPrice);

  if (isProductPriceLoading) {
    return <div>Loading...</div>;
  }
  return (
    <div className="edit-optimal-product">
      <div className="edit-optimal-product__edit-amount">
        <div className="edit-amount__product-details">
          <div className="product-image">
            <ProductsImages barcode={productDetails.product.barcode} />
          </div>
          <div className="product-details">
            <div className="product-name">{productDetails.product.name}</div>
            <div className="product-unique-details">
              <div className="weight">{productDetails.product.weight}</div>
              <div className="unit-weight">
                {convertLaterToUnitWeight(productDetails.product.unitWeight)}
              </div>
              <div className="separating-line">|</div>
              <div className="brand">תנובה</div>
            </div>
            <div className="priduct-unit-price">
              <div className="label">:מחיר</div>
              <div className="price">₪{productPrice.price}</div>
            </div>
            <div className="product-discount-price">
              {productPrice.hasDiscount ? (
                <div>
                  מבצע: {productPrice.discount.units} יחידות ב- ₪
                  {productPrice.discount.totalPrice}
                </div>
              ) : null}
            </div>
          </div>
        </div>
        <div className="edit-amount__alternative-products-guide">
          <div className="pointer-icon">
            <img src={PointerIcon} alt="pointer" />
          </div>
          <div className="guide">
            <b>לחץ כאן</b> להצגת מוצרים חלופיים
          </div>
        </div>
        <div className="edit-amount__product-details-optimal-cart">
          <div className="edit-amount__current-amount">
            כמות נוכחית: <b>{optimalProductDetails.quantity} יחידות</b>
          </div>
          <div className="edit-amount__current-total-price">
            מחיר נוכחי: <b>₪{optimalProductDetails.totalPrice}</b>
          </div>
          <div>{editedTotalPrice.toFixed(2)}</div>
          <div
            className="edit-amount__close-model"
            onClick={() => closeModal()}
          >סגור מודל</div>
        </div>
        <div className="edit-amount__operations">
          <div
            className="quantity-reduction-button"
            onClick={reduceOneFromEditingQuantity}
          >
            -
          </div>
          <div className="display-editing-quantity">{editingQuantity}</div>
          <div className="quantity-unit-label">'יח</div>
          <div
            className="quantity-increase-button"
            onClick={addOneToEditingQuantity}
          >
            +
          </div>
          <div 
          className="confirm-button"
          onClick={updateOptimalProductQuantity}
          >עדכן</div>
        </div>
      </div>
      <div className="edit-optimal-product__replace-product"></div>
      <div></div>
    </div>
  );
};

export default EditOptimalProduct;
