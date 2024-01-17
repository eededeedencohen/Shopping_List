// import React from "react";
// import ProductSettings from "./ProductSettings";
// import "./ListProductsSettings.css";
// import { useCartOptimizationContext } from "../../context/cart-optimizationContext";
// import BrandsFilter from "./BrandsFilter/BrandsFilter";

// export default function ListProductsSettings() {
//   const { productsSettings, isProductsSettingsUploaded } =
//     useCartOptimizationContext();

//   if (!isProductsSettingsUploaded) {
//     return (
//       <div>
//         <h1>Loading Data...</h1>
//       </div>
//     );
//   }

//   return (
//     <div className="list-products-settings">
//       {console.log(productsSettings)}
//         <BrandsFilter />
//       <div>
//         {productsSettings.map((product) => (
//           <ProductSettings key={product.barcode} product={product} />
//         ))}
//       </div>
//     </div>
//   );
// }

import React from "react";
import ProductSettings from "./ProductSettings";
import "./ListProductsSettings.css";
import { useCartOptimizationContext } from "../../context/cart-optimizationContext";

export default function ListProductsSettings() {
  const { productsSettings, isProductsSettingsUploaded } =
    useCartOptimizationContext();

  if (!isProductsSettingsUploaded) {
    return (
      <div>
        <h1>Loading Data...</h1>
      </div>
    );
  }

  return (
    <div className="list-products-settings">
      <div>
        {productsSettings.map((product) => (
          <ProductSettings key={product.barcode} product={product} />
        ))}
      </div>
    </div>
  );
}
