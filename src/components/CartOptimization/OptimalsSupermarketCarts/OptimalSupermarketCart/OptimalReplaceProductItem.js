import React from "react";

const OptimalReplaceProductItem = ({
  detailsOriginProduct,
  DetailsOptimalProduct,
  isExistsInOptimalCart,
}) => {
  return (
    <div>
      ReplaceProductItem
      {console.log("=========================================================")}
      {console.log("detailsOriginProduct", detailsOriginProduct)}
      {console.log("DetailsOptimalProduct", DetailsOptimalProduct)}
      {console.log("isExistsInOptimalCart", isExistsInOptimalCart)}
      {console.log("=========================================================")}
    </div>
  );
};

export default OptimalReplaceProductItem;
