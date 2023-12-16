import React, { useState} from "react";
import { useNavigate } from "react-router";
import { useProducts } from "../../context/ProductContext";
import "./SearchBar.css";

const SearchBar = ({ closeModal }) => {
  const { searchProducts } = useProducts();
  const [searchQuery, setSearchQuery] = useState(""); // the text in the search bar
  const [searchResults, setSearchResults] = useState([]); // the products from the search
  const [typingTimeout, setTypingTimeout] = useState(null); // timeout for user typing
  const navigate = useNavigate();

  const onChangeQuery = (event) => {
    const query = event.target.value;
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

  // const requestSearchResults = async (query) => {
  //   try {
  //     const products = await searchProducts(query);
  //     setSearchResults(products);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

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


  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="חפש מוצרים"
        value={searchQuery}
        onChange={onChangeQuery}
      />
      <div className="search-results">
        {searchResults.map((result) => (
          <div
            key={result.barcode}
            onClick={() => {
              // navigate(`/priceList/${result.barcode}`);
              handleResultClick(result);
            }}
          >
            {result.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;


