// ./ProductPriceComparison.jsx
import React, { useState, useMemo } from "react";
import "./ProductPriceComparison.css";

import SwipeBox from "./SwipeBox";
import CardHeader from "./CardHeader/CardHeader";
import ProductDetails from "./ProductDetails/ProductDetails";
import BranchPrice from "./BranchPrice/BranchPrice";

import { compressData } from "./utils";

export default function ProductPriceComparison({ data }) {
  /*— דחיסת נתונים (מחירים + סניפים) —*/
  const comp = compressData(data);
  const chains = Object.keys(comp);

  /*— ***מפה : barcode → product*** —*/
  const productMap = useMemo(() => {
    const map = {};
    Object.values(data)
      .flat() // כל הסניפים של כל הרשתות
      .forEach(({ products }) =>
        products.forEach(({ product }) => {
          map[product.barcode] = product; // אם אותו ברקוד חוזר – דריסה לא משנה
        })
      );
    return map;
  }, [data]);

  /*— state —*/
  const [chainIdx, setChain] = useState(0);
  const [prodIdx, setProd] = useState(0);
  const [priceIdx, setPrice] = useState(0);

  /*— חישובי תצוגה —*/
  const chainName = chains[chainIdx];
  const chainObj = comp[chainName];
  const barcodes = Object.keys(chainObj);
  const barcode = barcodes[prodIdx];

  const groupsRaw = chainObj[barcode];
  const groups = Array.isArray(groupsRaw) ? groupsRaw : [groupsRaw];
  const grp = groups[priceIdx];

  const product = productMap[barcode] ?? null; // ← מעבירים לרכיב-בת

  /*— פעולות מעבר —*/
  const nextChain = (d) => {
    setChain((i) => (i + d + chains.length) % chains.length);
    setProd(0);
    setPrice(0);
  };
  const nextProd = (d) => {
    setProd((i) => (i + d + barcodes.length) % barcodes.length);
    setPrice(0);
  };
  const nextPrice = (d) =>
    setPrice((i) => (i + d + groups.length) % groups.length);

  /*— JSX —*/
  return (
    <div id="test_card">
      <SwipeBox
        className="test_headerBox"
        onSwipeLeft={() => nextChain(1)}
        onSwipeRight={() => nextChain(-1)}
      >
        <CardHeader chainName={chainName} />
      </SwipeBox>

      <SwipeBox
        className="test_productBox"
        onSwipeLeft={() => nextProd(1)}
        onSwipeRight={() => nextProd(-1)}
      >
        {/* מעבירים את האובייקט המלא */}
        <ProductDetails product={product} />
      </SwipeBox>

      <SwipeBox
        className="test_branchBox"
        onSwipeLeft={() => nextPrice(1)}
        onSwipeRight={() => nextPrice(-1)}
      >
        <BranchPrice priceObj={grp.price} branches={grp.branches} />
      </SwipeBox>
    </div>
  );
}
