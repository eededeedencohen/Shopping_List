// import React, { useEffect, useState } from "react";
// import data from "./xyz.json";
// import "./ProductPriceComparison.css"; // ⬅️ קובץ חדש
// import "./ProductHeader.css";
// import "./BranchCard.css";

// import ProductHeader from "./ProductHeader";
// import BranchCard from "./BranchCard";

// const ProductPriceComparison = ({data}) => {
//   const [product, setProduct] = useState(null);
//   const [branches, setBranches] = useState([]);

//   useEffect(() => {
//     const allBranches = data.data["רמי לוי"];
//     const barcode = "7290010117864";

//     const hits = [];
//     let prod = null;

//     allBranches.forEach((b) => {
//       const match = b.products.find((p) => p.product.barcode === barcode);
//       if (match) {
//         if (!prod) prod = match.product;
//         hits.push({ branchAddress: b.branchAddress, price: match.price });
//       }
//     });

//     setProduct(prod);
//     setBranches(hits);
//   }, []);

//   if (!product) return <div className="fun_loading">טוען...</div>;

//   return (
//     <section className="fun_sheet">
//       <div className="fun_card">
//         <ProductHeader {...product} />
//         <div className="fun_branches">
//           {branches.map((br, i) => (
//             <BranchCard
//               key={i}
//               index={i}
//               branchAddress={br.branchAddress}
//               city="ירושלים"
//               price={br.price}
//               supermarketName="רמי לוי"
//             />
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default ProductPriceComparison;
import React, { useEffect, useMemo, useState } from "react";
import "./ProductPriceComparison.css";
import "./ProductHeader.css";
import "./BranchCard.css";

import ProductHeader from "./ProductHeader";
import BranchCard from "./BranchCard";

const ProductPriceComparison = ({ data }) => {
  /* 1️⃣ חילוץ כל-המוצרים הייחודיים ע"פ ברקוד */
  const products = useMemo(() => {
    const map = new Map(); // barcode → product
    Object.values(data ?? {}) // כל הרשתות
      .flat() // כל הסניפים
      .forEach((branch) =>
        branch.products.forEach(({ product }) => {
          if (!map.has(product.barcode)) map.set(product.barcode, product);
        })
      );
      console.log("products", data);
    return Array.from(map.values());
  }, [data]);

  /* 2️⃣ ברקוד נבחר – מתחיל בברקוד הראשון שמצאנו */
  const [barcode, setBarcode] = useState(products[0]?.barcode || "");

  /* 3️⃣ חיפוש התאמות מחיר בכל הרשתות עבור הברקוד */
  const { product, hits } = useMemo(() => {
    if (!barcode) return { product: null, hits: [] };

    let foundProduct = null;
    const matches = [];

    Object.entries(data ?? {}).forEach(([marketName, branches]) => {
      branches.forEach((branch) => {
        const match = branch.products.find(
          (p) => p.product.barcode === barcode
        );
        if (match) {
          if (!foundProduct) foundProduct = match.product;
          matches.push({
            supermarketName: marketName,
            branchAddress: branch.branchAddress,
            price: match.price,
          });
        }
      });
    });

    return { product: foundProduct, hits: matches };
  }, [data, barcode]);

  /* ───────  UI  ─────── */

  if (!product) return <div className="fun_loading">טוען...</div>;

  return (
    <section className="fun_sheet">
      <div className="fun_card">
        {/* בחירת מוצר */}
        <select
          className="fun_select"
          value={barcode}
          onChange={(e) => setBarcode(e.target.value)}
        >
          {products.map((p) => (
            <option key={p.barcode} value={p.barcode}>
              {p.name} • {p.weight}
              {p.unitWeight}
            </option>
          ))}
        </select>

        {/* כותרת מוצר */}
        <ProductHeader {...product} />

        {/* רשימת סניפים מכל הרשתות */}
        <div className="fun_branches">
          {hits.map((h, i) => (
            <BranchCard
              key={i}
              index={i}
              branchAddress={h.branchAddress}
              price={h.price}
              supermarketName={h.supermarketName}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductPriceComparison;
