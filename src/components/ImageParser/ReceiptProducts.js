import React, { useState } from "react";
import "./ReceiptProducts.css";
import { Spin } from "antd";

function ReceiptProducts({ receiptProducts }) {
  const [products, setProducts] = useState(receiptProducts);
  const [loading, setLoading] = useState(false);
  const [isReplacing, setIsReplacing] = useState(false);

  if (loading) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  if (isReplacing) {
    return (
      <div className="spinner-container">
        <Spin size="large" />
        <p>isReplacing...</p>
      </div>
    );
  }

  return (
    <div className="receipt-products">
      {products.map((product, index) => (
        <div key={index} className="receipt-products__product">
          <pre>{JSON.stringify(product, null, 2)}</pre>
        </div>
      ))}
    </div>
  );
}

export default ReceiptProducts;
