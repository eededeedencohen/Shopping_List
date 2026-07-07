import { useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { useLocation } from "react-router-dom";
import Settings from "./Settings";
import "./SettingsModal.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

export default function SettingsModal({ isOpen, onClose }) {
  const location = useLocation();
  const openedAtPath = useRef(null);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) {
      openedAtPath.current = null;
      return;
    }
    if (openedAtPath.current === null) {
      openedAtPath.current = location.pathname;
    } else if (location.pathname !== openedAtPath.current) {
      onClose();
    }
  }, [isOpen, location.pathname, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return ReactDOM.createPortal(
    <div
      className="settings-modal-overlay"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="הגדרות"
    >
      <div className="settings-modal-window">
        {/* The bar holds ONE control depending on how the modal presents:
            full-page (mobile) → a back button on the leading (right) edge;
            windowed card (desktop) → a close ✕ on the trailing (left) edge. */}
        <div className="settings-modal-bar">
          <button
            type="button"
            className="settings-modal-back"
            onClick={onClose}
            aria-label="חזרה"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              {/* right-pointing arrow = "back" in RTL */}
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <span className="settings-modal-back__label">חזרה</span>
          </button>

          <button
            type="button"
            className="settings-modal-close"
            onClick={onClose}
            aria-label="סגור הגדרות"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <Settings />
      </div>
    </div>,
    document.getElementById("modal-root")
  );
}
