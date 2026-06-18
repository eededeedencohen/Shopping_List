// import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import styles from "./Modal.module.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

const Modal = ({ isOpen, children, onClose }) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    // Check if the clicked target is the overlay itself and not the modal window
    if (event.target.className === styles['modal-overlay']) {
      onClose();
    }
  };

  return ReactDOM.createPortal(
    <div className={styles['modal-overlay']} onClick={handleOverlayClick}>
      <div className={styles['modal-window']}>
        {children}
        <div className={styles['close-button-container']}>
          <button className={styles['close-button']} onClick={onClose}>
            X
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default Modal;
