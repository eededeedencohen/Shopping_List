// import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./productComparisonModal.css";

const ProductComparisonModal = ({ isOpen, children, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    // Check if the clicked target is the overlay itself and not the modal window
    if (event.target.className === "pcm__modal-overlay") {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="pcm__modal-overlay" onClick={handleOverlayClick}>
      <div className="pcm__modal-window">
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ProductComparisonModal;
