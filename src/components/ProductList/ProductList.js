// import React, { useEffect, useRef, useState } from "react";
// import { useProducts } from "../../context/ProductContext";
// import milkiImage from "./milki.png";
// import healthSignImage from "./health-sign.png";
// import "./ProductList.css";
// import { useNavigate } from "react-router";

// // const completeToFullBarcode = (barcode) => {
// //   const start = 729;
// //   const currentBarcodeLength = barcode.length;
// //   const fullBarcodeLength = 13;
// //   const missingZeros = fullBarcodeLength - currentBarcodeLength - 3;
// //   if (missingZeros <= 0) {
// //     return barcode;
// //   }
// //   const zeros = Array(missingZeros).fill(0).join("");
// //   return start + zeros + barcode;
// // };

// const convertWeightUnit = (weightUnit) => {
//   weightUnit = weightUnit.toLowerCase();
//   if (weightUnit === "g") {
//     return "Grams";
//   }
//   if (weightUnit === "kg") {
//     return "Kilograms";
//   }
//   if (weightUnit === "ml") {
//     return "Milliliters";
//   }
//   if (weightUnit === "l") {
//     return "Liters";
//   }
//   return weightUnit;
// };

// const SearchBar = ({ onQuery }) => {
//   const [lastInputTime, setLastInputTime] = useState(Date.now());
//   const inputRef = useRef();

//   useEffect(() => {
//     setTimeout(() => {
//       onQuery(inputRef.current);
//     }, 500);
//   }, [lastInputTime]);

//   return (
//     <div className="search">
//       <input
//         ref={inputRef}
//         onInput={(e) => {
//           setLastInputTime(Date.now());
//         }}
//         className="search-input"
//         placeholder="Search something.."
//       />
//     </div>
//   );
// };

// function ProductList() {
//   const { products, searchProducts } = useProducts();
//   const [searchResults, setSearchResults] = useState();

//   const nav = useNavigate();

//   const moveToPriceList = (productBarcode) => {
//     nav(`/priceList/${productBarcode}`);
//   };

//   return (
//     <div className="product-list">
//       <SearchBar
//         onQuery={async (searchInput) => {
//           const results = await searchProducts(searchInput.value);
//           if (results && results.length > 0) {
//             setSearchResults(results);
//             searchInput.placeholder = "Search something..";
//           } else {
//             setSearchResults(); // remove old value if exists in searchResults
//             searchInput.placeholder = "No matches found";
//           }
//         }}
//       />
//       {(searchResults && searchResults.length > 0
//         ? searchResults
//         : products
//       )?.map((product) => (
//         <div
//           className="product-card"
//           key={product.barcode}
//           onClick={() => moveToPriceList(product.barcode)}
//         >
//           <div className="product-name">
//             <h1>{product.name}</h1>
//           </div>
//           <div className="product-data">
//             <div className="product-barcode">
//               <h3>Barcode: {product.barcode}</h3>
//             </div>

//             <div className="product-brand">
//               <h3>Brand: {product.brand}</h3>
//             </div>

//             <div className="product-weight">
//               <h3>
//                 {product.weight} {convertWeightUnit(product.unitWeight)}
//               </h3>
//             </div>
//           </div>
//           <div className="product-image">
//             <img src={milkiImage} alt="milki" />
//           </div>
//           <div className="health-marking-text">
//             <h3>Health Marking:</h3>
//           </div>
//           <div className="health-marking">
//             <img src={healthSignImage} alt="healthSign" />
//             <img src={healthSignImage} alt="healthSign" />
//             <img src={healthSignImage} alt="healthSign" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default ProductList;

import React, { useEffect, useRef, useState } from "react";
import { useProducts } from "../../context/ProductContext";
import milkiImage from "./milki.png";
import healthSignImage from "./health-sign.png";
import "./ProductList.css";
import { useNavigate } from "react-router";
import { addProductToCart } from "../../network/cartService"; //import here

const convertWeightUnit = (weightUnit) => {
  weightUnit = weightUnit.toLowerCase();
  if (weightUnit === "g") {
    return "Grams";
  }
  if (weightUnit === "kg") {
    return "Kilograms";
  }
  if (weightUnit === "ml") {
    return "Milliliters";
  }
  if (weightUnit === "l") {
    return "Liters";
  }
  return weightUnit;
};

const SearchBar = ({ onQuery }) => {
  const [lastInputTime, setLastInputTime] = useState(Date.now());
  const inputRef = useRef();

  useEffect(() => {
    setTimeout(() => {
      onQuery(inputRef.current);
    }, 500);
  }, [lastInputTime]);

  return (
    <div className="search">
      <input
        ref={inputRef}
        onInput={(e) => {
          setLastInputTime(Date.now());
        }}
        className="search-input"
        placeholder="Search something.."
      />
    </div>
  );
};

function ProductList() {
  const { products, searchProducts } = useProducts();
  const [searchResults, setSearchResults] = useState();
  const [productAmounts, setProductAmounts] = useState({});

  const nav = useNavigate();

  const moveToPriceList = (productBarcode) => {
    nav(`/priceList/${productBarcode}`);
  };

  const incrementAmount = (barcode) => {
    setProductAmounts({
      ...productAmounts,
      [barcode]: (productAmounts[barcode] || 0) + 1,
    });
  };

  const decrementAmount = (barcode) => {
    setProductAmounts({
      ...productAmounts,
      [barcode]: Math.max(0, (productAmounts[barcode] || 0) - 1),
    });
  };

  const addToCart = async (barcode) => {
    // replace '1' with actual user ID
    const response = await addProductToCart(
      1,
      barcode,
      productAmounts[barcode] || 0
    );
    console.log(response);
    // handle response...
  };
  return (
    <div className="product-list">
      <SearchBar
        onQuery={async (searchInput) => {
          const results = await searchProducts(searchInput.value);
          if (results && results.length > 0) {
            setSearchResults(results);
            searchInput.placeholder = "Search something..";
          } else {
            setSearchResults();
            searchInput.placeholder = "No matches found";
          }
        }}
      />
      {(searchResults && searchResults.length > 0
        ? searchResults
        : products
      )?.map((product) => (
        <div
          className="product-card"
          key={product.barcode}
          onClick={() => moveToPriceList(product.barcode)}
        >
          <div className="product-name">
            <h1>{product.name}</h1>
          </div>
          <div className="product-data">
            <div className="product-barcode">
              <h3>Barcode: {product.barcode}</h3>
            </div>

            <div className="product-brand">
              <h3>Brand: {product.brand}</h3>
            </div>

            <div className="product-weight">
              <h3>
                {product.weight} {convertWeightUnit(product.unitWeight)}
              </h3>
            </div>
          </div>
          <div className="product-image">
            <img src={milkiImage} alt="milki" />
          </div>
          <div className="product-quantity-control">
            <button
              onClick={(e) => {
                e.stopPropagation();
                decrementAmount(product.barcode);
              }}
            >
              -
            </button>
            <span>{productAmounts[product.barcode] || 0}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                incrementAmount(product.barcode);
              }}
            >
              +
            </button>
          </div>
          <div className="product-add">
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product.barcode);
              }}
            >
              Add to cart
            </button>
          </div>
          <div className="health-marking-text">
            <h3>Health Marking:</h3>
          </div>
          <div className="health-marking">
            <img src={healthSignImage} alt="healthSign" />
            <img src={healthSignImage} alt="healthSign" />
            <img src={healthSignImage} alt="healthSign" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
