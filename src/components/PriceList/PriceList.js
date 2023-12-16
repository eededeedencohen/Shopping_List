import { useNavigate, useParams } from "react-router";
import { usePriceList } from "../../context/PriceContext";
import { Children, useEffect, useState } from "react";
import { Spin } from "antd";
import ProductsImages from "../Images/ProductsImages";
import SupermarketImage from "../Cart/supermarketImage";
import "./PriceListNew.css";

import "./PriceList.css"; // Importing a CSS file for styling

export default function PriceList() {
  const { barcode } = useParams();

  const priceFormat = (price) => {
    return price.toFixed(2);
  };

  const unitWeightFormat = (unitWeight) => {
    if (unitWeight === "g") {
      return "גרם";
    }
    if (unitWeight === "kg") {
      return 'ק"ג';
    }
    if (unitWeight === "ml") {
      return 'מ"ל';
    }
    if (unitWeight === "l") {
      return "ליטר";
    }
    return unitWeight;
  };

  const nav = useNavigate();

  const { getPriceList } = usePriceList();

  const [priceList, setPriceList] = useState(undefined);
  const [product, setProduct] = useState(undefined);


  useEffect(() => {
    if (!barcode) {
      alert("Product not found"); // change this to a beautiful alert
      nav("/");
      return;
    }

    const fetchPriceList = async () => {
      const priceListResponse = await getPriceList(barcode);
      setProduct(priceListResponse.product);
      setPriceList(priceListResponse.prices);
    };

    fetchPriceList();
  }, [barcode, nav, getPriceList]);

  if (!priceList || !product) {
    return (
      <div className="spinner-container">
        <Spin size="large">
          <></>
        </Spin>
      </div>
    );
  }

  return (
    <div className="compare-prices-container">
      <div className="compare__product">
        <div className="compare__product-name">
          <p>{product.name}</p>
        </div>
        <div className="compare__product__image">
          <ProductsImages barcode={barcode} />
        </div>
        <div className="compare__details_label">
          <p>:נתונים</p>
        </div>
        {/* {add line:} */}
        <div className="compare__line" />
        <div className="compare__product-weight">
          <p style={{ marginLeft: "0.5rem" }}>{":משקל"}</p>
          <p style={{ marginLeft: "0.5rem", fontWeight: "bold" }}>
            {product.weight}
          </p>
          <p style={{ fontWeight: "bold" }}>
            {unitWeightFormat(product.unitWeight)}
          </p>
        </div>
        {/* {add line:} */}
        <div className="compare__line" />
        <div className="compare__product-brand">
          <p style={{ marginLeft: "0.5rem" }}>{":חברה/מותג"}</p>
          <p style={{ fontWeight: "bold" }}>{product.brand}</p>
        </div>
        {/* {add line:} */}
        <div className="compare__line" />
        <div className="compare__product-barcode">
          <p style={{ marginLeft: "0.5rem" }}>{":ברקוד"}</p>
          <p style={{ fontWeight: "bold" }}>{product.barcode}</p>
        </div>
        {/* {add line:} */}
        <div className="compare__line" style={{marginBottom:"1rem"}}/>
      </div>
      <div className="compare__prices-list">
        {Children.toArray(
          priceList.map((priceObject) => (
            <div className="compare__supermarket-price-container">
              <div className="compare__supermarket-name__image">
                <SupermarketImage
                  supermarketName={priceObject.supermarket.name}
                />
              </div>
              <div className="compare__supermarket-address">
                <p>{priceObject.supermarket.address}</p>
                <p> {priceObject.supermarket.city}</p>
              </div>
              <div className="compare__product-price">
                <div className="compare__price-unit">
                  <p>{":מחיר"}</p>
                  <p
                    style={{
                      color: "#9c9c9c",
                      marginRight: "2rem",
                    }}
                  >
                    {priceFormat(priceObject.price)}
                  </p>
                  <p
                    style={{
                      color: "#9c9c9c",
                    }}
                  >
                    ₪
                  </p>
                </div>
                {priceObject.discount && (
                  <div className="compare__price-sale">
                    <div className="compare__price-sale_details">
                      <p>{priceObject.discount.units}</p>
                      <p style={{ marginRight: "3px" }}>{"יחידות ב"}</p>
                      <p>{" - "}</p>
                      <p>{priceFormat(priceObject.discount.totalPrice)}</p>
                      <p style={{ marginRight: "3px" }}>{"₪"}</p>
                    </div>
                    <div className="compare__price-sale_unit-price">
                      <p>{")"}</p>
                      <p>{priceFormat(priceObject.discount.priceForUnit)}</p>
                      <p>{"₪"}</p>
                      <p style={{ marginRight: "4px" }}>{"ליחידה"}</p>
                      <p>{"("}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// import { useNavigate, useParams } from "react-router";
// import { usePriceList } from "../../context/PriceContext";
// import { Children, useEffect, useState } from "react";
// import { Spin } from "antd";
// import ProductsImages from "../Images/ProductsImages";
// import SupermarketImage from "../Cart/supermarketImage";
// import "./PriceListNew.css";

// import "./PriceList.css"; // Importing a CSS file for styling

// export default function PriceList() {
//   const { barcode } = useParams();

//   const priceFormat = (price) => {
//     return price.toFixed(2);
//   };

//   const unitWeightFormat = (unitWeight) => {
//     if (unitWeight === "g") {
//       return "גרם";
//     }
//     if (unitWeight === "kg") {
//       return 'ק"ג';
//     }
//     if (unitWeight === "ml") {
//       return 'מ"ל';
//     }
//     if (unitWeight === "l") {
//       return "ליטר";
//     }
//     return unitWeight;
//   };

//   const nav = useNavigate();

//   const { getPriceList } = usePriceList();

//   const [priceList, setPriceList] = useState(undefined);
//   const [product, setProduct] = useState(undefined);
//   const [loading, setLoading] = useState(false); // Add loading state

//   useEffect(() => {
//     if (!barcode) {
//       alert("Product not found"); // Change this to a beautiful alert
//       nav("/");
//       return;
//     }

//     // Set loading to true when the product changes
//     setLoading(true);

//     const fetchPriceList = async () => {
//       const priceListResponse = await getPriceList(barcode);
//       setProduct(priceListResponse.product);
//       setPriceList(priceListResponse.prices);
//     };

//     fetchPriceList();

//     // Use setTimeout to set loading to false after 1 second
//     const loadingTimeout = setTimeout(() => {
//       setLoading(false);
//     }, 1000);

//     return () => {
//       clearTimeout(loadingTimeout); // Clear the timeout if the component unmounts
//     };
//   }, [barcode, nav, getPriceList]);

//   if (loading) {
//     return (
//       <div className="spinner-container">
//         <Spin size="large">
//           <></>
//         </Spin>
//       </div>
//     );
//   }

//   if (!priceList || !product) {
//     return (
//       <div className="spinner-container">
//         <Spin size="large">
//           <></>
//         </Spin>
//       </div>
//     );
//   }

//   return (
//     <div className="compare-prices-container">
//       <div className="compare__product">
//         <div className="compare__product-name">
//           <p>{product.name}</p>
//         </div>
//         <div className="compare__product__image">
//           <ProductsImages barcode={barcode} />
//         </div>
//         <div className="compare__details_label">
//           <p>:נתונים</p>
//         </div>
//         {/* {add line:} */}
//         <div className="compare__line" />
//         <div className="compare__product-weight">
//           <p style={{ marginLeft: "0.5rem" }}>{":משקל"}</p>
//           <p style={{ marginLeft: "0.5rem", fontWeight: "bold" }}>
//             {product.weight}
//           </p>
//           <p style={{ fontWeight: "bold" }}>
//             {unitWeightFormat(product.unitWeight)}
//           </p>
//         </div>
//         {/* {add line:} */}
//         <div className="compare__line" />
//         <div className="compare__product-brand">
//           <p style={{ marginLeft: "0.5rem" }}>{":חברה/מותג"}</p>
//           <p style={{ fontWeight: "bold" }}>{product.brand}</p>
//         </div>
//         {/* {add line:} */}
//         <div className="compare__line" />
//         <div className="compare__product-barcode">
//           <p style={{ marginLeft: "0.5rem" }}>{":ברקוד"}</p>
//           <p style={{ fontWeight: "bold" }}>{product.barcode}</p>
//         </div>
//         {/* {add line:} */}
//         <div className="compare__line" style={{ marginBottom: "1rem" }} />
//       </div>
//       <div className="compare__prices-list">
//         {Children.toArray(
//           priceList.map((priceObject) => (
//             <div className="compare__supermarket-price-container">
//               <div className="compare__supermarket-name__image">
//                 <SupermarketImage
//                   supermarketName={priceObject.supermarket.name}
//                 />
//               </div>
//               <div className="compare__supermarket-address">
//                 <p>{priceObject.supermarket.address}</p>
//                 <p> {priceObject.supermarket.city}</p>
//               </div>
//               <div className="compare__product-price">
//                 <div className="compare__price-unit">
//                   <p>{":מחיר"}</p>
//                   <p
//                     style={{
//                       color: "#9c9c9c",
//                       marginRight: "2rem",
//                     }}
//                   >
//                     {priceFormat(priceObject.price)}
//                   </p>
//                   <p
//                     style={{
//                       color: "#9c9c9c",
//                     }}
//                   >
//                     ₪
//                   </p>
//                 </div>
//                 {priceObject.discount && (
//                   <div className="compare__price-sale">
//                     <div className="compare__price-sale_details">
//                       <p>{priceObject.discount.units}</p>
//                       <p style={{ marginRight: "3px" }}>{"יחידות ב"}</p>
//                       <p>{" - "}</p>
//                       <p>{priceFormat(priceObject.discount.totalPrice)}</p>
//                       <p style={{ marginRight: "3px" }}>{"₪"}</p>
//                     </div>
//                     <div className="compare__price-sale_unit-price">
//                       <p>{")"}</p>
//                       <p>{priceFormat(priceObject.discount.priceForUnit)}</p>
//                       <p>{"₪"}</p>
//                       <p style={{ marginRight: "4px" }}>{"ליחידה"}</p>
//                       <p>{"("}</p>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           ))
//         )}
//       </div>
//     </div>
//   );
// }

