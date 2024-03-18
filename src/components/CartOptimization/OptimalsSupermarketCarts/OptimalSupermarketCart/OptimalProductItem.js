import React from "react";
import { useState } from "react";
import ProductsImages from "../../../Images/ProductsImages";
import EditOptimalProductModal from "./EditOptimalProduct/EditOptimalProductModal";
import EditOptimalProduct from "./EditOptimalProduct/EditOptimalProduct";
import "./OptimalProductItem.css";
import {
  getUnitWeightLabelForOne,
  getConvertedUnitWeight,
  isExistsInOriginalCart,
  getSummaryElement,
} from "./OptimalProductItemHelpers";
import { useCartOptimizationContext } from "../../../../context/cart-optimizationContext";
import deleteIcon from "./delete.svg";
import editIcon from "./edit.svg";
import upRightIcon from "./up-right.svg";
import downLeftIcon from "./down-left.svg";

const OptimalProductItem = ({
  detailsOriginProduct,
  DetailsOptimalProduct,
  isExistsInOptimalCart,
  supermarketID,
}) => {
  const { deleteProductFromOptimalCart } = useCartOptimizationContext();
  const originalProductExists = isExistsInOriginalCart(detailsOriginProduct);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }


  const summaryElement = getSummaryElement(
    DetailsOptimalProduct,
    detailsOriginProduct,
    isExistsInOptimalCart
  );

  return (
    <div className="optimal-product-item">
      <EditOptimalProductModal isOpen={isModalOpen} onClose={closeModal}>
        <EditOptimalProduct 
        productDetails={detailsOriginProduct}
        optimalProductDetails={DetailsOptimalProduct}
        supermarketID={supermarketID}
        closeModal={closeModal}
        /> 
      </EditOptimalProductModal>

      {/* {console.log("=========================================================")}
      {console.log("detailsOriginProduct", detailsOriginProduct)}
      {console.log("DetailsOptimalProduct", DetailsOptimalProduct)}
      {console.log("isExistsInOptimalCart", isExistsInOptimalCart)}
      {console.log("=========================================================")} */}
      <div className="optimal-product-item__product-details">
        <div className="optimal-product-item__image">
          <ProductsImages barcode={DetailsOptimalProduct.barcode} />
        </div>
        <div className="optimal-product-item__general-details">
          <div className="optimal-product-item__name">
            {detailsOriginProduct.product.name}
          </div>
          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            <div className="optimal-product-item__weight">
              {detailsOriginProduct.product.weight}
            </div>
            <div className="optimal-product-item__unit-weight">
              {getConvertedUnitWeight(detailsOriginProduct.product.unitWeight)}
            </div>
            <div className="optimal-product-item__separator-line">|</div>
            <div className="optimal-product-item__brand">
              {detailsOriginProduct.product.brand}
            </div>
          </div>
        </div>
      </div>
      <div className="green-arrow-right">
        <img src={upRightIcon} alt="up-right" />
      </div>
      <div className="optimal-product-item__price-quantity-details">
        {isExistsInOptimalCart ? (
          <div className="optimal-product-item__current-cart">
            <div className="quantity-current-product">
              <div className="label"> :כמות</div>
              <div className="value">{DetailsOptimalProduct.quantity}</div>
            </div>
            <div className="total-price-current-product">
              <div className="label">:סה"כ</div>
              <div className="value">
                {"₪" +
                  (
                    Math.round(DetailsOptimalProduct.totalPrice * 10) / 10
                  ).toFixed(2)}
              </div>
            </div>
            <div className="price-for-one-current-product">
              {/**the price for 100 g or 100 ml */}
              <div className="label">
                {`:מחיר ל-100 ${getConvertedUnitWeight(
                  detailsOriginProduct.product.unitWeight
                )}`}
              </div>
              <div className="value">
                {"₪" +
                  getUnitWeightLabelForOne(
                    DetailsOptimalProduct.totalPrice,
                    DetailsOptimalProduct.quantity,
                    detailsOriginProduct.product.unitWeight,
                    detailsOriginProduct.product.weight
                  )}
              </div>
            </div>
          </div>
        ) : (
          <div className="not-exists">
            <div className="label">המוצר לא קיים בסל הקניות הנ"ל</div>
          </div>
        )}
        {originalProductExists ? (
          <div className="optimal-product-item__original-cart">
            <div className="quantity-original-product">
              <div className="label"> :כמות</div>
              <div className="value">{detailsOriginProduct.amount}</div>
            </div>
            <div className="total-price-original-product">
              <div className="label">
                <div className="label">:סה"כ</div>
              </div>
              <div className="value">
                {(
                  Math.round(detailsOriginProduct.totalPrice * 10) / 10
                ).toFixed(2)}
              </div>
            </div>
            <div className="price-for-one-original-product">
              <div className="label">
                {`:מחיר ל-100 ${getConvertedUnitWeight(
                  detailsOriginProduct.product.unitWeight
                )}`}
              </div>
              <div className="value">
                {"₪" +
                  getUnitWeightLabelForOne(
                    detailsOriginProduct.totalPrice,
                    detailsOriginProduct.amount,
                    detailsOriginProduct.product.unitWeight,
                    detailsOriginProduct.product.weight
                  )}
              </div>
            </div>
          </div>
        ) : (
          <div className="not-exists">
            <div className="label">המוצר לא קיים בסל הקניות המקורי</div>
          </div>
        )}
      </div>
      <div className="red-arrow-left">
        <img src={downLeftIcon} alt="down-left" />
      </div>
      {/* <div className="optimal-product-item__summary"></div> */}
      <div className="optimal-product-item__summary">{summaryElement}</div>

      <div className="optimal-product-item__edit-buttons">
        <div 
        className="delete-optimal-product"
        onClick={() =>
          deleteProductFromOptimalCart(
            DetailsOptimalProduct.barcode,
            supermarketID
          )
        }
        >
          <img src={deleteIcon} alt="Delete" />
        </div>
        <div className="edit-optimal-product-button">
          <img 
          onClick={openModal}
          src={editIcon} alt="Edit" />
        </div>
      </div>
    </div>
  );
};

export default OptimalProductItem;
