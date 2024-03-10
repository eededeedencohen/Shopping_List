// import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./EditOptimalProductModal.css";

const EditOptimalProductModal = ({ isOpen, children, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    // Check if the clicked target is the overlay itself and not the modal window
    if (event.target.className === "modal-overlay-edit-optimal-product") {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay-edit-optimal-product" onClick={handleOverlayClick}>
      <div className="modal-window">
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default EditOptimalProductModal;
