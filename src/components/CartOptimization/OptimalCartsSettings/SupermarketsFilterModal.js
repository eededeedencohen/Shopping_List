import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import SupermarketsNamesFillter from "./SupermarketsNamesFillter";
import SupermarketsBranches from "./SupermarketsBranches";
import "./SupermarketsFilterModal.css";

const ChevronIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CloseIcon = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SupermarketsFilterModal = ({ isOpen, onClose }) => {
  const [activeChain, setActiveChain] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (activeChain) setActiveChain(null);
        else onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose, activeChain]);

  useEffect(() => {
    if (!isOpen) setActiveChain(null);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="smf-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="סינון סופרמרקטים"
    >
      <div className="smf-modal">
        <header className="smf-header">
          {activeChain ? (
            <button
              type="button"
              className="smf-back"
              onClick={() => setActiveChain(null)}
              aria-label="חזרה לרשימת הרשתות"
            >
              <ChevronIcon />
            </button>
          ) : (
            <span className="smf-spacer" aria-hidden="true" />
          )}

          <h3 className="smf-title">{activeChain || "סינון סופרמרקטים"}</h3>

          <button
            type="button"
            className="smf-close"
            onClick={onClose}
            aria-label="סגור"
          >
            <CloseIcon />
          </button>
        </header>

        <div className="smf-body">
          {activeChain ? (
            <SupermarketsBranches
              supermarketName={activeChain}
              onBack={() => setActiveChain(null)}
            />
          ) : (
            <SupermarketsNamesFillter onSelect={setActiveChain} />
          )}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default SupermarketsFilterModal;
