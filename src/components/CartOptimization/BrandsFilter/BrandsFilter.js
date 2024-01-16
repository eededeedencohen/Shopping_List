import React from "react";
import ModalV1 from "../../Modal/ModalV1";
import "./BrandsFilter.css";

const BrandsFilter = ({ isOpen, onClose, generalNmae }) => {
  return (
    <ModalV1 isOpen={isOpen} onClose={onClose}>
      {/* Your modal content here */}
    </ModalV1>
  );
};

export default BrandsFilter;
