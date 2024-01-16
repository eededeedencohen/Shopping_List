// import ReactDOM from "react-dom";
// import "./ModalV1.css";

// const ModalV1 = ({ isOpen, children, onClose }) => {
//   if (!isOpen) {
//     return null;
//   }

//   const handleOverlayClick = (event) => {
//     // Check if the clicked target is the overlay itself and not the modal window
//     if (event.target.className === "modal-overlay") {
//       onClose();
//     }
//   };

//   const modalStyle = isOpen ? "slide-left 0.5s ease" : "slide-right 0.5s ease";

//   return ReactDOM.createPortal(
//     <div className="modal-overlay" onClick={handleOverlayClick}>
//       <div className="modal1-window">{children} style={{ animation: modalStyle }}</div>
//     </div>,
//     document.getElementById("modal-root")
//   );
// };

// export default ModalV1;

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import "./ModalV1.css";

const ModalV1 = ({ isOpen, children, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [modalStyle, setModalStyle] = useState("slide-left 0.5s ease");

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true); // Ensure modal is rendered when it should be open
      setModalStyle("slide-left 0.5s ease"); // Set the opening animation
    } else if (!isOpen && isRendered) {
      setModalStyle("slide-right 0.5s ease"); // Set the closing animation
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
      <div className="modal1-window" style={{ animation: modalStyle }}>
        {children}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ModalV1;

