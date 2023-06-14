import React from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';  // Define your CSS styles

const Modal = ({ isOpen, children, onClose }) => {
    if (!isOpen) {
        return null;
    }

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-window">
                <button onClick={onClose}>Close</button>
                {children}
            </div>
        </div>,
        document.getElementById('modal-root')
    );
};

export default Modal;
