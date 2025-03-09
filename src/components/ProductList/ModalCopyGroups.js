import React, { useState } from "react";
import Modal from "../Cart/Modal";

function findApgByBarcode(apgData, barcode) {
  return apgData.find((item) => item.barcode === barcode);
}

function ModalCopyGroups({
  isOpen,
  onClose,
  barcodeB,
  apgData,
  onConfirmCopySingleGroup,
}) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showProducts, setShowProducts] = useState(false);

  if (!isOpen) return null;

  const apgB = findApgByBarcode(apgData, barcodeB);
  const groupsB = apgB ? apgB.groups : [];

  const handleSelectGroup = (groupName) => {
    setSelectedGroup(groupName);
  };

  const handleShowProducts = (groupName) => {
    setSelectedGroup(groupName);
    setShowProducts(true);
  };

  const handleBackToGroups = () => {
    setSelectedGroup(null);
    setShowProducts(false);
  };

  const handleConfirm = () => {
    if (selectedGroup) {
      onConfirmCopySingleGroup(selectedGroup);
    }
  };

  if (showProducts && selectedGroup) {
    const groupObj = groupsB.find((g) => g.groupName === selectedGroup);
    const barcodes = groupObj ? groupObj.barcodes : [];
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <h3>
          מוצרים בקבוצה {selectedGroup} של מוצר {barcodeB}
        </h3>
        {barcodes.map((b) => (
          <p key={b}>ברקוד: {b}</p>
        ))}
        <button onClick={handleBackToGroups} style={{ marginTop: "1rem" }}>
          חזרה
        </button>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2>בחר קבוצה להעתקה ממוצר {barcodeB}</h2>
      {groupsB.length === 0 ? (
        <p>אין קבוצות למוצר זה.</p>
      ) : (
        groupsB.map((g) => (
          <div key={g.groupName} style={{ marginBottom: "0.5rem" }}>
            <button onClick={() => handleSelectGroup(g.groupName)}>
              {g.groupName}
            </button>
            <button
              onClick={() => handleShowProducts(g.groupName)}
              style={{ marginLeft: "0.5rem" }}
            >
              show
            </button>
          </div>
        ))
      )}
      <div style={{ marginTop: "1rem" }}>
        <button onClick={handleConfirm} disabled={!selectedGroup}>
          אישור
        </button>
        <button onClick={onClose} style={{ marginLeft: "1rem" }}>
          ביטול
        </button>
      </div>
    </Modal>
  );
}

export default ModalCopyGroups;
