import React, { useState } from "react";
import ModalV1 from "../../Modal/ModalV1";
import "./BrandsFilter.css";
// import { useCartOptimizationContext } from "../../../context/cart-optimizationContext";
import { useBrands } from "../../../hooks/optimizationHooks";
import BrandItem from "./BrandItem";
import filterIcon from "./filter.svg";

const BrandsFilter = ({ generalName, barcode }) => {
  // const { allBrands, isAllBrandsUploaded } = useCartOptimizationContext();
  const { allBrands, isAllBrandsUploaded } = useBrands();
  const [isBrandsFilterOpen, setIsBrandsFilterOpen] = useState(false);

  const toggleBrandsFilter = () => setIsBrandsFilterOpen(!isBrandsFilterOpen);

  if (!isAllBrandsUploaded) {
    return (
      <div className="brands-filters">
        <button onClick={toggleBrandsFilter}>Filter Brands</button>
        <ModalV1 isOpen={isBrandsFilterOpen} onClose={toggleBrandsFilter}>
          <div>
            <h1>Loading Data...</h1>
          </div>
        </ModalV1>
        ;
      </div>
    );
  }

  return (
    <div className="brands-filters">
      {/*<button onClick={toggleBrandsFilter}>Filter Brands</button>*/}
      <div className="open-brands-filters-modal" onClick={toggleBrandsFilter}>
        <div className="brands-filters-icon">
          <img src={filterIcon} alt="filter" />
        </div>
        <div className="brands-filters-label">סינון מותגים</div>
      </div>
      <ModalV1 isOpen={isBrandsFilterOpen} onClose={toggleBrandsFilter}>
        {isAllBrandsUploaded && (
          <div className="brand-filter">
            {allBrands[generalName].map((brand) => (
              <BrandItem brand={brand} barcode={barcode} key={brand} />
            ))}
          </div>
        )}
      </ModalV1>
    </div>
  );
};

export default BrandsFilter;
