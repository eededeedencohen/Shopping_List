import React, { useState, useEffect } from "react";
import Image from "../../../../Images/Images";
// import { useCartOptimizationContext } from "../../../../../context/cart-optimizationContext";
import { useOptimalProductsOperation } from "../../../../../hooks/optimizationHooks";
import "./EditAlternativeProduct.css";

function EditAlternativeProduct({
  oldBarcode,
  generalName,
  supermarketID,
  DetailsOptimalProduct,
  quantity,
  isExistsInOptimalCart,
}) {
  // const {
  //   getReplacementProductsByGeneralNameAndSupermarketID,
  //   replaceProductInOptimalCart,
  // } = useCartOptimizationContext();
  const {
    getReplacementProductsByGeneralNameAndSupermarketID,
    replaceProductInOptimalCart,
  } = useOptimalProductsOperation(); // useOptimalProductsOperation
  const [realProducts, setRealProducts] = useState([]);
  const [isLoadingRealProducts, setIsLoadingRealProducts] = useState(true);

  // loading the real products:
  useEffect(() => {
    const fetchRealProducts = async () => {
      try {
        const response =
          await getReplacementProductsByGeneralNameAndSupermarketID(
            generalName,
            supermarketID
          );

        setRealProducts(response);
        setIsLoadingRealProducts(false);
      } catch (error) {
        console.error("Error in fetching replacement products: ", error);
      }
    };
    fetchRealProducts();
  }, [
    generalName,
    supermarketID,
    getReplacementProductsByGeneralNameAndSupermarketID,
  ]);

  const convertWeightUnit = (weightUnit) => {
    weightUnit = weightUnit.toLowerCase();
    if (weightUnit === "g") {
      return "גרם";
    }
    if (weightUnit === "kg") {
      return 'ק"ג';
    }
    if (weightUnit === "ml") {
      return 'מ"ל';
    }
    if (weightUnit === "l") {
      return "ליטר";
    }
    return weightUnit;
  };

  const max18Characters = (str) => {
    if (str.length > 26) {
      return "..." + str.substring(0, 21);
    }
    return str;
  };

  const priceFormat = (price) => {
    return price.toFixed(2);
  };

  const discountPriceFormat = (price) => {
    const units = price.discount.units;
    const totalPrice = price.discount.totalPrice;
    return (
      <div
        className="list__discount-price"
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
        <p style={{ fontWeight: "bold" }}>{"₪"}</p>
      </div>
    );
  };

  const getProductTotalPrice = (priceObj, quantity) => {
    const hasDiscount = priceObj && priceObj.discount;
    if (hasDiscount) {
      const units = priceObj.discount.units;
      const totalPrice = priceObj.discount.totalPrice;
      return (
        (quantity % units) * priceObj.price +
        Math.floor(quantity / units) * totalPrice
      );
    } else {
      return priceObj ? priceObj.price * quantity : 0;
    }
  };

  const tempFunctionPrintData = (product) => {
    console.log("====================================================");
    console.log("oldBarcode: ", oldBarcode); // the barcode of the product that we want to replace (not the original product)
    console.log("newBarcode: ", product.product.barcode); // the product that we want to replace with
    console.log("priceobj: ", product.price);
    console.log("quantity", quantity);
    console.log("oldTotalPrice: ", DetailsOptimalProduct.totalPrice);
    console.log(
      "newTotalPrice: ",
      getProductTotalPrice(product.price, quantity)
    );
    console.log("supermarketID: ", supermarketID);
    console.log("- - - - - - - - - - - - - - - - - - - - - -");
    console.log("isExistsInOptimalCart: ", isExistsInOptimalCart);
    console.log("====================================================");
    replaceProductInOptimalCart(
      oldBarcode, // the old barcode
      product.product.barcode, // the new barcode
      DetailsOptimalProduct.totalPrice, // the old total price
      getProductTotalPrice(product.price, quantity), // the new total price of the product only
      supermarketID // the supermarket id
    );
  };

  if (isLoadingRealProducts) {
    return <div>Loading...</div>;
  }

  return (
    <div className="replace-products">
      {realProducts.map((product) => (
        <React.Fragment key={product.product._id}>
          <div
            className="replace-product"
            onClick={() => tempFunctionPrintData(product)}
          >
            <div className="replace-product-image">
              <Image barcode={product.product.barcode} />
            </div>
            <div className="replace-product-details">
              <p className="replace-product-details__name">{`${
                product.product.name && max18Characters(product.product.name)
              }`}</p>
              <div className="replace-product-details__information">
                <p style={{ marginLeft: "0.3rem" }}>{product.product.weight}</p>
                <p>{convertWeightUnit(product.product.unitWeight)}</p>
                <p style={{ color: "black" }}>{"|"}</p>
                <p className="replace-product-details__brand">
                  {product.product.brand}
                </p>
              </div>
              <div className="replace-product-details__price">
                {product.price && <p> {product.price.price}</p>}
                {product.price && <p style={{ fontWeight: "bold" }}>{"₪"}</p>}
              </div>
              {product.price &&
                product.price.discount &&
                discountPriceFormat(product.price)}
            </div>
          </div>
          <div className="replace-product-separator"></div>
        </React.Fragment>
      ))}
    </div>
  );
}

export default EditAlternativeProduct;
