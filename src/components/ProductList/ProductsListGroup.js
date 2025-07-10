import React from "react";
import Modal from "../Cart/Modal";
import Image from "../Images/ProductsImages";
import { useGroupState, useGroupActions } from "../../hooks/appHooks";
import "./ProductsListGroup.css";

/**
 * @param {boolean}  isOpen     – האם להציג את המודאל
 * @param {string}   groupName  – שם הקבוצה
 * @param {Function} onClose    – אירוע סגירה
 * @param {boolean}  canEdit    – האם להציג כפתורי הסרה (ברירת־מחדל false)
 */
const ProductsListGroup = ({ isOpen, groupName, onClose, canEdit = false }) => {
  const { groups } = useGroupState();
  const { removeBarcodeFromGroup } = useGroupActions();

  const group = groups.find((g) => g.groupName === groupName);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="group-modal">
        <h2 className="group-modal__title">{groupName || "קבוצה לא נמצאה"}</h2>

        {!group ? (
          <p className="group-modal__empty">קבוצה לא קיימת או ריקה.</p>
        ) : group.barcodes.length === 0 ? (
          <p className="group-modal__empty">אין מוצרים בקבוצה.</p>
        ) : (
          <div className="group-modal__grid">
            {group.barcodes.map((bc) => (
              <div key={bc} className="group-modal__card">
                <Image barcode={bc} className="group-modal__img" />
                <span className="group-modal__barcode">{bc}</span>

                {canEdit && (
                  <button
                    className="group-modal__remove"
                    onClick={() => removeBarcodeFromGroup(groupName, bc)}
                  >
                    הסר
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ProductsListGroup;
