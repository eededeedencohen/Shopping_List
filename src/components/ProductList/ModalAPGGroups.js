import React, { useState } from "react";
import Modal from "../Cart/Modal"; // לדוגמה. אם יש לך Modal משלך
import "./ModalAPGGroups.css"; // ה-CSS החדש

function ModalAPGGroups({
  isOpen,
  onClose,
  groups,
  onGroupSelected,
  onCreateNewGroup,
}) {
  const [showNewGroupInput, setShowNewGroupInput] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  if (!isOpen) return null;

  const handleSelectGroup = (groupName) => {
    onGroupSelected(groupName);
  };

  const handleCreateGroup = () => {
    if (newGroupName.trim()) {
      onCreateNewGroup(newGroupName.trim());
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="apg-modal-container">
        <h2 className="apg-modal-title">בחר/צור קבוצה</h2>

        <div className="apg-modal-groups-list">
          {groups && groups.length > 0 ? (
            groups.map((g) => (
              <button
                key={g.groupName}
                className="apg-modal-groups-list__button"
                onClick={() => handleSelectGroup(g.groupName)}
              >
                {g.groupName}
              </button>
            ))
          ) : (
            <p className="apg-modal-groups-list__empty">
              אין קבוצות קיימות למוצר זה.
            </p>
          )}
        </div>

        {!showNewGroupInput && (
          <button
            className="apg-modal-btn create-btn"
            onClick={() => setShowNewGroupInput(true)}
          >
            יצירת קבוצה חדשה
          </button>
        )}

        {showNewGroupInput && (
          <div className="apg-modal-create-group">
            <input
              type="text"
              className="apg-modal-create-group__input"
              placeholder="שם הקבוצה..."
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <button
              className="apg-modal-btn confirm-btn"
              onClick={handleCreateGroup}
            >
              אישור
            </button>
          </div>
        )}

        <button
          className="apg-modal-btn cancel-btn"
          onClick={onClose}
          style={{ marginTop: "1rem" }}
        >
          ביטול
        </button>
      </div>
    </Modal>
  );
}

export default ModalAPGGroups;
