import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { useProducts } from "../../context/ProductContext";
import { useCart } from "../../context/CartContext";
import SearchItem from "./SearchItem";
import {
  updateProductInCart,
  addProductToCart,
  deleteProductFromCart,
} from "../../network/cartService";
import "./SearchBar.css";

const SearchBar = ({ closeModal }) => {
  const { searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState(""); // the text in the search bar
  const [searchResults, setSearchResults] = useState([]); // the products from the search
  const [typingTimeout, setTypingTimeout] = useState(null); // timeout for user typing
  const {
    getProductsAmountInCart,
    loadCart,
    // addNewProduct, // (userId, barcode, amount)
    // updateProductAmountInCart, // (userId, barcode, amount)
    // removeProductFromCart, // (userId, barcode)
  } = useCart();
  const [productAmounts, setProductAmounts] = useState({});
  const [oldProductAmounts, setOldProductAmounts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const userId = "1";
  const navigate = useNavigate();

  // load the products-amounts:
  useEffect(() => {
    const loadProductAmounts = async () => {
      try {
        setIsLoading(true);
        const amounts = await getProductsAmountInCart(userId);
        const amountsObject = {};
        amounts.cart.products.forEach((product) => {
          amountsObject[product.barcode] = product.amount;
        });
        setProductAmounts(amountsObject);
        setOldProductAmounts(amountsObject);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProductAmounts();
  }, [loadCart, userId, getProductsAmountInCart]);

  const onChangeQuery = (event) => {
    let query = event.target.value;
    setSearchQuery(query);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const newTimeout = setTimeout(() => {
      if (query.trim() !== "") {
        requestSearchResults(query);
      } else {
        setSearchResults([]);
      }
    }, 1000);

    setTypingTimeout(newTimeout);
  };

  const requestSearchResults = async (query) => {
    try {
      const products = await searchProducts(query);
      setSearchResults(products);
    } catch (error) {
      console.error(error);
    }
  };

  const handleResultClick = (result) => {
    navigate(`/priceList/${result.barcode}`);
    closeModal(); // Call the closeModal function to close the modal
  };

  //=================================================================
  const makeVisible = (button) => {
    button.classList.add("visible");
  };
  
  const makeInvisible = (button) => {
    button.classList.remove("visible");
  };

  const changeButton = (barcode, oldAmount, currentAmount) => {
    const button = document.getElementById(`confirm-${barcode}`);
    if (button) {
      if (oldAmount === 0 && currentAmount > 0) {
        button.innerHTML = "הוסף";
        button.style.backgroundColor = "#00c200";
        makeVisible(button);
      } else if (oldAmount > 0 && currentAmount === 0) {
        button.innerHTML = "הסר";
        button.style.backgroundColor = "#ff0000";
        makeVisible(button);
      } else if (
        oldAmount > 0 &&
        currentAmount > 0 &&
        oldAmount !== currentAmount
      ) {
        button.innerHTML = "עדכן";
        button.style.backgroundColor = "#008cba";
        makeVisible(button);
      } else if (currentAmount === oldAmount) {
        makeInvisible(button);
      }
    }
  };
  //=================================================================

  const handleIncreaseAmount = (barcode) => {
    try {
      const currentAmount = productAmounts[barcode] || 0;
      const newAmount = currentAmount + 1;
      const newAmounts = { ...productAmounts, [barcode]: newAmount };
  
      setProductAmounts(newAmounts);
  
      changeButton(barcode, oldProductAmounts[barcode] || 0, newAmount);
    } catch (error) {
      console.error(error);
    }
  };
  

  const handleDecreaseAmount = (barcode) => {
    const currentAmount = productAmounts[barcode] || 0;
    let newAmount = currentAmount > 0 ? currentAmount - 1 : 0;
    const newAmounts = { ...productAmounts, [barcode]: newAmount };
  
    // Delete the key if new amount is 0 to mimic the initial state
    if (newAmount === 0) {
      delete newAmounts[barcode];
    }
  
    setProductAmounts(newAmounts);
  
    changeButton(barcode, oldProductAmounts[barcode] || 0, newAmount);
  };
  

  const handleConfirmChanges = async (barcode) => {
    // check if the operation is delete, update or add:
    let oldAmount = oldProductAmounts[barcode];
    if (oldAmount === undefined) {
      oldAmount = 0;
    }
    let newAmount = productAmounts[barcode];

    // change the button:
    changeButton(barcode, newAmount, newAmount);

    if (newAmount === undefined) {
      newAmount = 0;
    }

    // case add: newAmount > oldAmount=0:
    if (newAmount > oldAmount && oldAmount === 0) {
      const response = await addProductToCart(userId, barcode, newAmount);
      console.log(response);
      await loadCart(userId);
    }
    // case delete: newAmount=0 and oldAmount>0:
    else if (newAmount === 0 && oldAmount > 0) {
      const response = await deleteProductFromCart(userId, barcode);
      console.log(response);
      await loadCart(userId);
    }
    // case update: newAmount>0 and oldAmount>0 and newAmount!=oldAmount:
    else if (newAmount > 0 && oldAmount > 0 && newAmount !== oldAmount) {
      const response = await updateProductInCart(userId, barcode, newAmount);
      console.log(response);
      await loadCart(userId);
    }

    // update the oldProductAmounts:
    const newOldAmounts = { ...oldProductAmounts };
    newOldAmounts[barcode] = newAmount;
    setOldProductAmounts(newOldAmounts);
  };

  // Corrected useEffect hook
  useEffect(() => {
    // Condition moved inside the useEffect body
    console.log(productAmounts);
    console.log(oldProductAmounts);
  }, [productAmounts, oldProductAmounts]); // Dependencies array to trigger the effect when either of these change

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="חפש מוצרים"
        value={searchQuery}
        onChange={onChangeQuery}
      />
      <div className="search-results">
        {searchResults.map((product) => (
          <SearchItem
            key={product.barcode}
            product={product}
            amount={productAmounts[product.barcode] || 0}
            oldAmount={oldProductAmounts[product.barcode] || 0}
            onClick={() => handleResultClick(product)}
            onIncreaseAmount={() => handleIncreaseAmount(product.barcode)}
            onDecreaseAmount={() => handleDecreaseAmount(product.barcode)}
            onConfirmChanges={() => handleConfirmChanges(product.barcode)}
          />
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
