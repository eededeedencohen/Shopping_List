import React, { useState } from "react";
import ReactDOM from "react-dom";
import { ALL_TESTS } from "./testData";
import useBodyScrollLock from "../../../hooks/useBodyScrollLock";
import "./TestModal.css";

const TestModal = ({ isOpen, onClose, onRunTest }) => {
  const [loadingId, setLoadingId] = useState(null);
  useBodyScrollLock(isOpen);
  if (!isOpen) return null;

  /* Tests with a `buildData` fetch LIVE data from the server (fresh prices);
     the static fixture stays as a fallback when the fetch fails. */
  const handleTest = async (test) => {
    if (loadingId) return;
    let payload = test.data;
    if (test.buildData) {
      setLoadingId(test.id);
      try {
        const live = await test.buildData();
        if (live) payload = live;
      } catch (e) {
        /* fall back to the static fixture */
      }
      setLoadingId(null);
    }
    const { messageToUser, messageType, data, actions } = payload;
    onRunTest({ messageToUser, messageType, data, actions });
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="test-modal-overlay" onClick={onClose}>
      <div className="test-modal" onClick={(e) => e.stopPropagation()}>
        <div className="test-modal-header">
          <h2 className="test-modal-title">בדיקות תצוגה</h2>
          <button className="test-modal-close" onClick={onClose}>
            {"✕"}
          </button>
        </div>

        <p className="test-modal-subtitle">
          {loadingId
            ? "טוען נתונים עדכניים מהשרת…"
            : "בחר טסט להזרקת תגובה מדומה לצ'אט"}
        </p>

        <div className="test-grid">
          {ALL_TESTS.map((test) => (
            <button
              key={test.id}
              className={`test-card${
                loadingId === test.id ? " is-loading" : ""
              }`}
              disabled={!!loadingId}
              onClick={() => handleTest(test)}
            >
              <span className="test-card-icon">
                {loadingId === test.id ? "⏳" : test.icon}
              </span>
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
