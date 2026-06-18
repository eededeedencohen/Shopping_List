import React from "react";
import ReactDOM from "react-dom";
import { ALL_TESTS } from "./testData";
import useBodyScrollLock from "../../../hooks/useBodyScrollLock";
import "./TestModal.css";

const TestModal = ({ isOpen, onClose, onRunTest }) => {
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  const handleTest = (test) => {
    const { messageToUser, messageType, data, actions } = test.data;
    onRunTest({ messageToUser, messageType, data, actions });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="test-modal-overlay" onClick={onClose}>
      <div className="test-modal" onClick={(e) => e.stopPropagation()}>
        <div className="test-modal-header">
          <h2 className="test-modal-title">בדיקות תצוגה</h2>
          <button className="test-modal-close" onClick={onClose}>
            {"\u2715"}
          </button>
        </div>

        <p className="test-modal-subtitle">
          בחר טסט להזרקת תגובה מדומה לצ'אט
        </p>

        <div className="test-grid">
          {ALL_TESTS.map((test) => (
            <button
              key={test.id}
              className="test-card"
              onClick={() => handleTest(test)}
            >
              <span className="test-card-icon">{test.icon}</span>
              <span className="test-card-label">{test.label}</span>
              <span className="test-card-desc">{test.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default TestModal;
