import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import SupermarketsNamesFillter from "./SupermarketsNamesFillter";
import SupermarketsBranches from "./SupermarketsBranches";
import "./SupermarketsFilterModal.css";

const SupermarketsFilterModal = ({ isOpen, onClose }) => {
  const [isRendered, setIsRendered] = useState(false);
  const [modalStyle, setModalStyle] = useState("smf_slide-left 0.5s ease");
  const [activeChain, setActiveChain] = useState(null); // ← null = show chains

  /* ─── open / close animation ─── */
  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      setModalStyle("smf_slide-left 0.5s ease");
    } else if (!isOpen && isRendered) {
      setModalStyle("smf_slide-right 0.5s ease");
      setTimeout(() => setIsRendered(false), 500);
    }
  }, [isOpen, isRendered]);

  const handleOverlayClick = (e) => {
    if (e.target.className === "modal-overlay") onClose();
  };

  /* ─── reset when modal closes ─── */
  useEffect(() => {
    if (!isOpen) setActiveChain(null);
  }, [isOpen]);

  if (!isRendered) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="smf_modal-window" style={{ animation: modalStyle }}>
        {/* ----- תצוגה מתחלפת ----- */}
        {activeChain ? (
          <SupermarketsBranches
            supermarketName={activeChain}
            onBack={() => setActiveChain(null)}
          />
        ) : (
          <SupermarketsNamesFillter onSelect={setActiveChain} />
        )}
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default SupermarketsFilterModal;
