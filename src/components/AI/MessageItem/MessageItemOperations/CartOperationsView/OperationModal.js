import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./OperationModal.css";

const OperationModal = ({ isOpen, children, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true); // Ensure modal is rendered when it should be open
    } else if (!isOpen && isRendered) {
      setIsRendered(false);
    }
  }, [isOpen, isRendered]);

  const handleOverlayClick = (event) => {
    if (event.target.className === "modal-overlay") {
      onClose();
    }
  };

  // Only render the modal if it's supposed to be open or in the process of closing
  if (!isRendered) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div>{children}</div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default OperationModal;
