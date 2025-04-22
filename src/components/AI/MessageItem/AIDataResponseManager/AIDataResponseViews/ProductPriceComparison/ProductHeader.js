import React from 'react';
import ProductsImages from '../../../../../Images/ProductsImages';
import './ProductHeader.css';

const translateUnit = (unit) => {
  switch (unit.toLowerCase()) {
    case 'g': return 'גרם';
    case 'kg': return 'קילוגרם';
    case 'l': return 'ליטר';
    case 'ml': return 'מיליליטר';
    case 'u': return 'יחידות';
    default: return unit;
  }
};

const ProductHeader = ({ name, brand, weight, unitWeight, barcode }) => {
  return (
    <div className="b1_header_wrapper">
      <div className="b1_header_image">
        <ProductsImages barcode={barcode} className="b1_header_img_tag" />
      </div>
      <div className="b1_header_text">
        <span className="b1_header_name">{name}</span>
        <span className="b1_header_details">
          {brand} • {weight} {translateUnit(unitWeight)}
        </span>
      </div>
    </div>
  );
};

export default ProductHeader;
