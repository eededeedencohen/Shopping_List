import React, { useEffect, useState } from "react";
import data from "./xyz.json";
import "./ProductPriceComparison.css";
import ProductHeader from "./ProductHeader";
import BranchCard from "./BranchCard";

const ProductPriceComparison = () => {
  const [product, setProduct] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const allBranches = data.data["רמי לוי"];
    const barcodeToMatch = "7290010117864";

    const matchedBranches = [];
    let productDetails = null;

    allBranches.forEach((branch) => {
      const match = branch.products.find(
        (item) => item.product.barcode === barcodeToMatch
      );

      if (match) {
        if (!productDetails) productDetails = match.product;

        matchedBranches.push({
          branchAddress: branch.branchAddress,
          price: match.price,
        });
      }
    });

    if (productDetails) {
      setProduct(productDetails);
      setBranches(matchedBranches);
    }
  }, []);

  if (!product) return <div className="b1_loading">טוען נתונים...</div>;

  return (
    <div className="b1_card_wrapper">
      <ProductHeader
        name={product.name}
        brand={product.brand}
        weight={product.weight}
        unitWeight={product.unitWeight}
        barcode={product.barcode}
      />
      <div className="b1_beanches_cards">
        {branches.map((branch, index) => (
          <BranchCard
            key={index}
            branchAddress={branch.branchAddress}
            price={branch.price}
            supermarketName="רמי לוי"
            city="ירושלים"
          />
        ))}
      </div>
    </div>
  );
};

export default ProductPriceComparison;
