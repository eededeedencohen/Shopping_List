import React, { useEffect, useRef, useState } from "react";
import { useProducts } from "../../context/ProductContext";
import "./ProductsListNew.css";
import { useNavigate } from "react-router";
import { addProductToCart } from "../../network/cartService";
import Image from "./Images";

export const convertWeightUnit = (weightUnit) => {
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
  if (str.length > 18) {
    return "..." + str.substring(0, 16);
  }
  return str;
};

const SearchBar = ({ onQuery }) => {
  const [lastInputTime, setLastInputTime] = useState(Date.now());
  const [isFocused, setIsFocused] = useState(false);
  const [hasText, setHasText] = useState(false);
  const inputRef = useRef();

  useEffect(() => {
    const timer = setTimeout(() => {
      onQuery(inputRef.current);
    }, 500);
    return () => clearTimeout(timer);
  }, [lastInputTime, onQuery]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleInput = (e) => {
    setLastInputTime(Date.now());
    setHasText(e.target.value.length > 0);
  };
  

  return (
    <div className="search">
      <input
        ref={inputRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onInput={handleInput}
        className="search-input"
        placeholder={!isFocused && !hasText ? "Search something.." : ""}
      />
    </div>
  );
};

function ProductsListNew() {
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
    // Replace '1' with actual user ID, consider passing it as a prop or context
    const response = await addProductToCart(
      1, // Replace with actual user ID
      barcode,
      productAmounts[barcode] || 0
    );
    console.log(response);
    // Consider handling the response (e.g., displaying a message to the user)
  };

  return (
    <div className="list__product-list">
      <SearchBar
        onQuery={async (searchInput) => {
          const results = await searchProducts(searchInput.value);
          setSearchResults(results?.length > 0 ? results : null);
          searchInput.placeholder =
            results?.length > 0 ? "Search something.." : "No matches found";
        }}
      />
      {(searchResults || products)?.map((product) => (
        <div className="list__product-card" key={product.barcode}>
          <div className="list__product-details">
            <div className="list__product-data">
              <div className="list__product-name">
                <p>{max18Characters(product.name)}</p>
              </div>
              <div className="list__product-info">
                <div className="list__product-weight">
                  <p>{product.weight}</p>
                  <p>{convertWeightUnit(product.unitWeight)}</p>
                </div>
                <div className="list__separator">|</div>
                <div className="list__product-brand">
                  <p>{product.brand}</p>
                </div>
              </div>
              <div className="list__product-price">
                <p>4.00</p>
                <p style={{ fontSize: "1.4rem" }}>₪</p>
              </div>
            </div>
            <div
              className="list__product-image"
              onClick={() => moveToPriceList(product.barcode)}
            >
              <Image barcode={product.barcode} />
            </div>
          </div>
          <div className="list__product-operations">
  <div 
    className="list__product-operations__confirm"
    onClick={(e) => {
      e.stopPropagation();
      addToCart(product.barcode);
    }}
  >
    הוסף לסל
  </div>
  <div 
    className="list__product-operations__add"
    onClick={(e) => {
      e.stopPropagation();
      incrementAmount(product.barcode);
    }}
  >
    +
  </div>
  <div className="list__product-operations__quantity">
    <span>{productAmounts[product.barcode] || 0}</span>
  </div>
  <div 
    className="list__product-operations__reduce"
    onClick={(e) => {
      e.stopPropagation();
      decrementAmount(product.barcode);
    }}
  >
    -
  </div>
</div>

        </div>
      ))}
    </div>
  );
}
export default ProductsListNew;
