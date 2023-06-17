import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const Modal = ({ isOpen, children, onClose }) => {
    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = (event) => {
        // Check if the clicked target is the overlay itself and not the modal window
        if (event.target.className === 'modal-overlay') {
            onClose();
        }
    }

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-window">
                <button onClick={onClose}>Close</button>
                {children}
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default Modal;










