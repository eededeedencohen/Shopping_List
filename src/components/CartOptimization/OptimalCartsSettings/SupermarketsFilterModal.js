import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import SupermarketsNamesFillter from "./SupermarketsNamesFillter";
import "./SupermarketsFilterModal.css";

const SupermarketsFilterModal = ({ isOpen, children, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [modalStyle, setModalStyle] = useState("slide-left 0.5s ease");

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true); // Ensure modal is rendered when it should be open
      setModalStyle("smf_slide-left 0.5s ease"); // Set the opening animation
    } else if (!isOpen && isRendered) {
      setModalStyle("smf_slide-right 0.5s ease"); // Set the closing animation
      setTimeout(() => {
        setIsRendered(false); // Remove the modal from the DOM after the animation
      }, 500); // This timeout should match the duration of your animation
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
      <div className="smf_modal-window" style={{ animation: modalStyle }}>
        <SupermarketsNamesFillter />
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default SupermarketsFilterModal;
