import React, { useEffect, useState } from "react";
import data from "./xyz.json";
import "./ProductPriceComparison.css"; // ⬅️ קובץ חדש
import "./ProductHeader.css";
import "./BranchCard.css";

import ProductHeader from "./ProductHeader";
import BranchCard from "./BranchCard";

const ProductPriceComparison = () => {
  const [product, setProduct] = useState(null);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const allBranches = data.data["רמי לוי"];
    const barcode = "7290010117864";

    const hits = [];
    let prod = null;

    allBranches.forEach((b) => {
      const match = b.products.find((p) => p.product.barcode === barcode);
      if (match) {
        if (!prod) prod = match.product;
        hits.push({ branchAddress: b.branchAddress, price: match.price });
      }
    });

    setProduct(prod);
    setBranches(hits);
  }, []);

  if (!product) return <div className="fun_loading">טוען...</div>;

  return (
    <section className="fun_sheet">
      <div className="fun_card">
        <ProductHeader {...product} />
        <div className="fun_branches">
          {branches.map((br, i) => (
            <BranchCard
              key={i}
              index={i}
              branchAddress={br.branchAddress}
              city="ירושלים"
              price={br.price}
              supermarketName="רמי לוי"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductPriceComparison;
