import React, { useState } from "react";
import Modal from "../Cart/Modal";
import {
  getProductImage,
  ProductImageDisplay,
} from "../Images/ProductImageService";
import {
  useFullGroupsWithProducts,
  useGroupActions,
} from "../../hooks/appHooks";
import "./ModalShowProductGroups.css";

function convertWeightUnit(unit) {
  if (!unit) return "";
  switch (unit.toLowerCase()) {
    case "g":
      return "גרם";
    case "kg":
      return 'ק"ג';
    case "ml":
      return 'מ"ל';
    case "l":
      return "ליטר";
    default:
      return unit;
  }
}

function ModalShowAllGroups({ isOpen, onClose, onSelectGroup }) {
  const { fullGroups, isLoadingGroups } = useFullGroupsWithProducts();
  const {
    deleteGroup,
    renameGroup,
    createGroup,
    removeBarcodeFromGroup,
    updateGroup,
  } = useGroupActions();

  const [renameStates, setRenameStates] = useState({});
  const [newGroupName, setNewGroupName] = useState("");

  const handleRemoveProductFromGroup = (groupName, barcode) => {
    // הסרה מ־state
    removeBarcodeFromGroup(groupName, barcode);

    // עדכון לשרת
    const group = fullGroups.find((g) => g.groupName === groupName);
    if (group) {
      const updatedBarcodes = group.barcodes.filter((b) => b !== barcode);
      updateGroup(groupName, { barcodes: updatedBarcodes });
    }
  };

  const handleGroupRename = (oldName, newName) => {
    renameGroup(oldName, newName);
    setRenameStates((prev) => ({ ...prev, [oldName]: false }));
  };

  const handleCreateGroup = () => {
    const trimmed = newGroupName.trim();
    if (!trimmed) return;

    const alreadyExists = fullGroups.some((g) => g.groupName === trimmed);
    if (alreadyExists) {
      alert("קבוצה בשם זה כבר קיימת.");
      return;
    }

    createGroup({
      groupName: trimmed,
      barcodes: [],
    });

    setNewGroupName("");
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      {console.log(fullGroups)}
      <div className="modal-content" style={{ direction: "rtl" }}>
        <h2>קבוצות שמכילות את המוצר</h2>

        <div className="new-group-form">
          <h3>הוספת קבוצה חדשה</h3>
          <input
            type="text"
            placeholder="שם קבוצה חדשה"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
          <button onClick={handleCreateGroup}>הוסף קבוצה</button>
        </div>

        {isLoadingGroups ? (
          <p>טוען קבוצות...</p>
        ) : fullGroups.length === 0 ? (
          <p>המוצר לא נמצא באף קבוצה.</p>
        ) : (
          fullGroups.map((group) => (
            <div key={group.groupName} className="group-box">
              <div className="group-header">
                {renameStates[group.groupName] ? (
                  <>
                    <input
                      defaultValue={group.groupName}
                      onChange={(e) =>
                        setRenameStates((prev) => ({
                          ...prev,
                          [group.groupName]: e.target.value,
                        }))
                      }
                    />

                    <button
                      onClick={() =>
                        handleGroupRename(
                          group.groupName,
                          renameStates[group.groupName],
                        )
                      }
                    >
                      אישור
                    </button>
                    <button
                      onClick={() =>
                        setRenameStates((prev) => ({
                          ...prev,
                          [group.groupName]: false,
                        }))
                      }
                    >
                      ביטול
                    </button>
                  </>
                ) : (
                  <>
                    <h3>{group.groupName}</h3>
                    <button
                      onClick={() =>
                        setRenameStates((prev) => ({
                          ...prev,
                          [group.groupName]: true,
                        }))
                      }
                    >
                      שנה שם
                    </button>
                  </>
                )}
                <div className="group-operation-wrapper">
                  <button
                    className="btn-remove"
                    onClick={() => deleteGroup(group.groupName)}
                  >
                    מחיקת קבוצה
                  </button>
                  <button
                    onClick={() => {
                      onSelectGroup(group.groupName);
                      onClose();
                    }}
                  >
                    הוספת מוצרים לקבוצה
                  </button>
                </div>
              </div>

              <div className="group-products-wrapper">
                <button
                  className="scroll-arrow left"
                  onClick={() => {
                    const el = document.getElementById(
                      `products-${group.groupName}`,
                    );
                    el.scrollBy({ left: -300, behavior: "smooth" });
                  }}
                >
                  ‹
                </button>

                <div
                  className="group-products"
                  id={`products-${group.groupName}`}
                >
                  {group.products.map((p) => (
                    <div key={p.barcode} className="product-card">
                      <Image barcode={p.barcode} />
                      <div>
                        <strong>{p.name}</strong>
                        <div>קטגוריה: {p.category}</div>
                        <div>תת-קטגוריה: {p.subcategory}</div>
                        <div>
                          משקל: {p.weight} {convertWeightUnit(p.unitWeight)}
                        </div>
                        <div>ברקוד: {p.barcode}</div>
                      </div>
                      <button
                        className="remove-product-from-group-btn"
                        onClick={() =>
                          handleRemoveProductFromGroup(
                            group.groupName,
                            p.barcode,
                          )
                        }
                      >
                        הסרה מהקבוצה
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  className="scroll-arrow right"
                  onClick={() => {
                    const el = document.getElementById(
                      `products-${group.groupName}`,
                    );
                    el.scrollBy({ left: 300, behavior: "smooth" });
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

export default ModalShowAllGroups;
