import React from "react";
import { useState, useEffect } from "react";
import ProductsImages from "../../../Images/ProductsImages";
import EditOptimalProductModal from "./EditOptimalProduct/EditOptimalProductModal";
import EditOptimalProduct from "./EditOptimalProduct/EditOptimalProduct";
import EditAlternativeProduct from "./EditOptimalProduct/EditAlternativeProduct";
import "./OptimalProductItem.css"; // import "./OptimalReplaceProductItem.css";
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

const OptimalReplaceProductItem = ({
  detailsOriginProduct,
  DetailsOptimalProduct,
  isExistsInOptimalCart,
  supermarketID,
}) => {
  const [productDetails, setProductDetails] = useState({});
  const [isProductDetailsUpdated, setIsProductDetailsUpdated] = useState(false);
  const originalProductExists = isExistsInOriginalCart(detailsOriginProduct);
  const { getProductByBarcode, deleteProductFromOptimalCart } =
    useCartOptimizationContext();

  // Get the product details
  useEffect(() => {
    if (isExistsInOptimalCart) {
      getProductByBarcode(DetailsOptimalProduct.barcode).then((response) => {
        setProductDetails(response);
        setIsProductDetailsUpdated(true);
      });
    }
  }, [
    isExistsInOptimalCart,
    DetailsOptimalProduct.barcode,
    getProductByBarcode,
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal2 = () => {
    setIsModalOpen2(true);
  };

  const closeModal2 = () => {
    setIsModalOpen2(false);
  };

  const summaryElement = getSummaryElement(
    DetailsOptimalProduct,
    detailsOriginProduct,
    isExistsInOptimalCart
  );

  if (!isProductDetailsUpdated) {
    return <div>Loading...</div>;
  }
  //   return (
  //     <div>
  //       ReplaceProductItem
  //       {console.log("=========================================================")}
  //       {console.log("detailsOriginProduct", detailsOriginProduct)}
  //       {console.log("DetailsOptimalProduct", DetailsOptimalProduct)}
  //       {console.log("isExistsInOptimalCart", isExistsInOptimalCart)}
  //       {console.log("productDetails", productDetails)}
  //       {console.log("=========================================================")}
  //     </div>
  //   );
  // };

  // export default OptimalReplaceProductItem;

  return (
    <div className="optimal-product-item">
      {console.log(
        "& & & & & & & & & & & & & & & & & & & & & & & & & & & & & &"
      )}
      {console.log("DetailsOptimalProduct", DetailsOptimalProduct)}
      {console.log("productDetailsA", productDetails)}
      {console.log(
        "& & & & & & & & & & & & & & & & & & & & & & & & & & & & & &"
      )}
      <EditOptimalProductModal isOpen={isModalOpen} onClose={closeModal}>
        <EditOptimalProduct
          productDetails={detailsOriginProduct}
          optimalProductDetails={DetailsOptimalProduct}
          supermarketID={supermarketID}
          isReplace={true}
          replaceProductDetails={productDetails}
          closeModal={closeModal}
        />
      </EditOptimalProductModal>

      <EditOptimalProductModal isOpen={isModalOpen2} onClose={closeModal2}>
        <EditAlternativeProduct
          oldBarcode={DetailsOptimalProduct.barcode}
          generalName={detailsOriginProduct.product.generalName}
          supermarketID={supermarketID}
          DetailsOptimalProduct={DetailsOptimalProduct}
          quantity={DetailsOptimalProduct.quantity}
          isExistsInOptimalCart={isExistsInOptimalCart}
        />
      </EditOptimalProductModal>

      <div className="optimal-product-item__product-details">
        {console.log("DetailsOptimalProduct", DetailsOptimalProduct)}
        {console.log("productDetails", productDetails)}
        <div className="optimal-product-item__image">
          <ProductsImages barcode={productDetails.barcode} />
        </div>
        <div className="optimal-product-item__general-details">
          <div className="optimal-product-item__name">
            {productDetails.name}
          </div>
          <div style={{ display: "flex", flexDirection: "row-reverse" }}>
            <div className="optimal-product-item__weight">
              {productDetails.weight}
            </div>
            <div className="optimal-product-item__unit-weight">
              {/* {getConvertedUnitWeight(detailsOriginProduct.product.unitWeight)} */}
              {getConvertedUnitWeight(productDetails.unitWeight)}
            </div>
            <div className="optimal-product-item__separator-line">|</div>
            <div className="optimal-product-item__brand">
              {/* {detailsOriginProduct.product.brand} */}
              {productDetails.brand}
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
          <img onClick={openModal} src={editIcon} alt="Edit" />
        </div>
        <button
          className="edit-optimal-product-button"
          onClick={openModal2}
        ></button>
      </div>
    </div>
  );
};

export default OptimalReplaceProductItem;

// import React, { useState, useEffect } from "react";
// import ProductsImages from "../../../Images/ProductsImages";
// import EditOptimalProductModal from "./EditOptimalProduct/EditOptimalProductModal";
// import EditOptimalProduct from "./EditOptimalProduct/EditOptimalProduct";
// import EditAlternativeProduct from "./EditOptimalProduct/EditAlternativeProduct";
// import "./OptimalProductItem.css";
// import {
//   getUnitWeightLabelForOne,
//   getConvertedUnitWeight,
//   getSummaryElement,
// } from "./OptimalProductItemHelpers";
// import { useCartOptimizationContext } from "../../../../context/cart-optimizationContext";
// import deleteIcon from "./delete.svg";
// import editIcon from "./edit.svg";
// import upRightIcon from "./up-right.svg";
// import downLeftIcon from "./down-left.svg";

// const OptimalReplaceProductItem = ({
//   detailsOriginProduct,
//   DetailsOptimalProduct,
//   isExistsInOptimalCart,
//   supermarketID,
// }) => {
//   const [productDetails, setProductDetails] = useState({});
//   const [isProductDetailsUpdated, setIsProductDetailsUpdated] = useState(false);
//   const { getProductByBarcode, deleteProductFromOptimalCart } =
//     useCartOptimizationContext();

//   useEffect(() => {
//     if (isExistsInOptimalCart) {
//       getProductByBarcode(DetailsOptimalProduct.barcode).then((response) => {
//         setProductDetails(response);
//         setIsProductDetailsUpdated(true);
//       });
//     }
//   }, [
//     isExistsInOptimalCart,
//     DetailsOptimalProduct.barcode,
//     getProductByBarcode,
//   ]);

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isModalOpen2, setIsModalOpen2] = useState(false);

//   const openModal = () => {
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   const openModal2 = () => {
//     setIsModalOpen2(true);
//   };

//   const closeModal2 = () => {
//     setIsModalOpen2(false);
//   };

//   const summaryElement = getSummaryElement(
//     DetailsOptimalProduct,
//     detailsOriginProduct,
//     isExistsInOptimalCart
//   );

//   const originalProductExists = detailsOriginProduct.amount > 0;

//   if (!isProductDetailsUpdated) {
//     return <div>Loading...</div>;
//   }

//   return (
//     <div className="optimal-product-item">
//       <EditOptimalProductModal isOpen={isModalOpen} onClose={closeModal}>
//         <EditOptimalProduct
//           productDetails={detailsOriginProduct}
//           optimalProductDetails={DetailsOptimalProduct}
//           supermarketID={supermarketID}
//           isReplace={true}
//           replaceProductDetails={productDetails}
//           closeModal={closeModal}
//         />
//       </EditOptimalProductModal>

//       <EditOptimalProductModal isOpen={isModalOpen2} onClose={closeModal2}>
//         <EditAlternativeProduct
//           oldBarcode={DetailsOptimalProduct.barcode}
//           generalName={detailsOriginProduct.product.generalName}
//           supermarketID={supermarketID}
//           DetailsOptimalProduct={DetailsOptimalProduct}
//           quantity={DetailsOptimalProduct.quantity}
//           isExistsInOptimalCart={isExistsInOptimalCart}
//         />
//       </EditOptimalProductModal>

//       <div className="optimal-product-item__product-details">
//         {console.log("DetailsOptimalProduct", DetailsOptimalProduct)}
//         {console.log("productDetails", productDetails)}
//         <div className="optimal-product-item__image">
//           <ProductsImages barcode={productDetails.barcode} />
//         </div>
//         <div className="optimal-product-item__general-details">
//           <div className="optimal-product-item__name">
//             {productDetails.name}
//           </div>
//           <div style={{ display: "flex", flexDirection: "row-reverse" }}>
//             <div className="optimal-product-item__weight">
//               {productDetails.weight}
//             </div>
//             <div className="optimal-product-item__unit-weight">
//               {getConvertedUnitWeight(productDetails.unitWeight)}
//             </div>
//             <div className="optimal-product-item__separator-line">|</div>
//             <div className="optimal-product-item__brand">
//               {productDetails.brand}
//             </div>
//           </div>
//           <div className="optimal-product-item__quantity">
//             כמות: {DetailsOptimalProduct.quantity} יחידות
//           </div>
//           <div className="optimal-product-item__total-price">
//             סה"כ: ₪{DetailsOptimalProduct.totalPrice}
//           </div>
//           <div className="optimal-product-item__price-for-one">
//             {`מחיר ל-100 ${getConvertedUnitWeight(
//               productDetails.unitWeight
//             )}: ₪${getUnitWeightLabelForOne(
//               DetailsOptimalProduct.totalPrice,
//               DetailsOptimalProduct.quantity,
//               productDetails.unitWeight,
//               productDetails.weight
//             )}`}
//           </div>
//         </div>
//       </div>
//       <div className="green-arrow-right">
//         <img src={upRightIcon} alt="up-right" />
//       </div>
//       <div className="optimal-product-item__price-quantity-details">
//         {isExistsInOptimalCart ? (
//           <div className="optimal-product-item__current-cart">
//             <div className="quantity-current-product">
//               <div className="label"> :כמות</div>
//               <div className="value">{DetailsOptimalProduct.quantity}</div>
//             </div>
//             <div className="total-price-current-product">
//               <div className="label">:סה"כ</div>
//               <div className="value">
//                 {"₪" +
//                   (
//                     Math.round(DetailsOptimalProduct.totalPrice * 10) / 10
//                   ).toFixed(2)}
//               </div>
//             </div>
//             <div className="price-for-one-current-product">
//               <div className="label">
//                 {`:מחיר ל-100 ${getConvertedUnitWeight(
//                   detailsOriginProduct.product.unitWeight
//                 )}`}
//               </div>
//               <div className="value">
//                 {"₪" +
//                   getUnitWeightLabelForOne(
//                     DetailsOptimalProduct.totalPrice,
//                     DetailsOptimalProduct.quantity,
//                     detailsOriginProduct.product.unitWeight,
//                     detailsOriginProduct.product.weight
//                   )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="not-exists">
//             <div className="label">המוצר לא קיים בסל הקניות הנ"ל</div>
//           </div>
//         )}
//         {originalProductExists ? (
//           <div className="optimal-product-item__original-cart">
//             <div className="quantity-original-product">
//               <div className="label"> :כמות</div>
//               <div className="value">{detailsOriginProduct.amount}</div>
//             </div>
//             <div className="total-price-original-product">
//               <div className="label">:סה"כ</div>
//               <div className="value">
//                 {(
//                   Math.round(detailsOriginProduct.totalPrice * 10) / 10
//                 ).toFixed(2)}
//               </div>
//             </div>
//             <div className="price-for-one-original-product">
//               <div className="label">
//                 {`:מחיר ל-100 ${getConvertedUnitWeight(
//                   detailsOriginProduct.product.unitWeight
//                 )}`}
//               </div>
//               <div className="value">
//                 {"₪" +
//                   getUnitWeightLabelForOne(
//                     detailsOriginProduct.totalPrice,
//                     detailsOriginProduct.amount,
//                     detailsOriginProduct.product.unitWeight,
//                     detailsOriginProduct.product.weight
//                   )}
//               </div>
//             </div>
//           </div>
//         ) : (
//           <div className="not-exists">
//             <div className="label">המוצר לא קיים בסל הקניות המקורי</div>
//           </div>
//         )}
//       </div>
//       <div className="red-arrow-left">
//         <img src={downLeftIcon} alt="down-left" />
//       </div>
//       <div className="optimal-product-item__summary">{summaryElement}</div>

//       <div className="optimal-product-item__edit-buttons">
//         <div
//           className="delete-optimal-product"
//           onClick={() =>
//             deleteProductFromOptimalCart(
//               DetailsOptimalProduct.barcode,
//               supermarketID
//             )
//           }
//         >
//           <img src={deleteIcon} alt="Delete" />
//         </div>
//         <div className="edit-optimal-product-button">
//           <img onClick={openModal} src={editIcon} alt="Edit" />
//         </div>
//         <button
//           className="edit-optimal-product-button"
//           onClick={openModal2}
//         ></button>
//       </div>
//     </div>
//   );
// };

// export default OptimalReplaceProductItem;
