import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import ProductsImages from "../../../Images/ProductsImages";
import EditOptimalProductModal from "./EditOptimalProduct/EditOptimalProductModal";
import EditOptimalProduct from "./EditOptimalProduct/EditOptimalProduct";
import { CartOptimizationContext } from "../../../../context/cart-optimizationContext";
import "./OptimalReplaceProductItem.css";
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
}) => {
  const [productDetails, setProductDetails] = useState({});
  const [isProductDetailsUpdated, setIsProductDetailsUpdated] = useState(false);
  const { getProductByBarcode } = useCartOptimizationContext();

  useEffect(() => {
    if (isExistsInOptimalCart) {
      getProductByBarcode(DetailsOptimalProduct.barcode).then((response) => {
        setProductDetails(response);
        setIsProductDetailsUpdated(true);
      });
    }
  }, [isExistsInOptimalCart, DetailsOptimalProduct.barcode, getProductByBarcode]);





  if (!isProductDetailsUpdated) {
    return <div>Loading...</div>;
  }
  return (
    <div>
      ReplaceProductItem
      {console.log("=========================================================")}
      {console.log("detailsOriginProduct", detailsOriginProduct)}
      {console.log("DetailsOptimalProduct", DetailsOptimalProduct)}
      {console.log("isExistsInOptimalCart", isExistsInOptimalCart)}
      {console.log("productDetails", productDetails)}
      {console.log("=========================================================")}
    </div>
  );
};

export default OptimalReplaceProductItem;
