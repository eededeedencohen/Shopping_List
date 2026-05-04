import React, { useMemo, useState } from "react";
import Modal from "../Cart/Modal";
import { ProductImageDisplay } from "../Images/ProductImageService";
import {
  useFullGroupsWithProducts,
  useGroupActions,
} from "../../hooks/appHooks";
import styles from "./ModalShowAllGroups.module.css";

const SORT_OPTIONS = [
  { value: "popular", label: "פופולרי" },
  { value: "alphabetical", label: "א-ב" },
  { value: "size_asc", label: "קטן→גדול" },
];

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
  const [query, setQuery] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [sortBy, setSortBy] = useState("popular");

  const handleRemoveProductFromGroup = (groupName, barcode) => {
    removeBarcodeFromGroup(groupName, barcode);
    const group = fullGroups.find((g) => g.groupName === groupName);
    if (group) {
      const updatedBarcodes = group.barcodes.filter((b) => b !== barcode);
      updateGroup(groupName, { barcodes: updatedBarcodes });
    }
  };

  const handleGroupRename = (oldName, newName) => {
    const trimmed = (newName || "").trim();
    if (!trimmed || trimmed === oldName) {
      setRenameStates((prev) => ({ ...prev, [oldName]: false }));
      return;
    }
    renameGroup(oldName, trimmed);
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
    createGroup({ groupName: trimmed, barcodes: [] });
    setNewGroupName("");
  };

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = fullGroups;
    if (q) {
      list = list.filter((g) => g.groupName.toLowerCase().includes(q));
    }
    const sorted = [...list];
    if (sortBy === "alphabetical") {
      sorted.sort((a, b) => a.groupName.localeCompare(b.groupName, "he"));
    } else if (sortBy === "size_asc") {
      sorted.sort(
        (a, b) =>
          (a.products?.length || 0) - (b.products?.length || 0) ||
          a.groupName.localeCompare(b.groupName, "he")
      );
    } else {
      // popular — most products first, ties broken alphabetically
      sorted.sort(
        (a, b) =>
          (b.products?.length || 0) - (a.products?.length || 0) ||
          a.groupName.localeCompare(b.groupName, "he")
      );
    }
    return sorted;
  }, [fullGroups, query, sortBy]);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <h2 className={styles.title}>קבוצות מוצרים</h2>
            <p className={styles.subtitle}>
              {fullGroups.length}{" "}
              {fullGroups.length === 1 ? "קבוצה" : "קבוצות"} בסך הכל
            </p>
          </div>

          <div className={styles.searchWrap}>
            <svg
              className={styles.searchIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              inputMode="search"
              className={styles.searchInput}
              placeholder="חפש קבוצה"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className={styles.searchClear}
                onClick={() => setQuery("")}
                aria-label="נקה חיפוש"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>

          <div className={styles.createRow}>
            <input
              type="text"
              className={styles.createInput}
              placeholder="צור קבוצה חדשה…"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateGroup()}
            />
            <button
              type="button"
              className={styles.createBtn}
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim()}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              הוסף
            </button>
          </div>

          <div className={styles.sortRow}>
            <span className={styles.sortLabel}>מיון:</span>
            <div className={styles.segmented} role="tablist">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="tab"
                  aria-selected={sortBy === opt.value}
                  className={`${styles.segment} ${
                    sortBy === opt.value ? styles.segmentActive : ""
                  }`}
                  onClick={() => setSortBy(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <span className={styles.resultsCount}>
              {filteredGroups.length}{" "}
              {filteredGroups.length === 1 ? "קבוצה" : "קבוצות"}
            </span>
          </div>
        </header>

        <div className={styles.body}>
          {isLoadingGroups ? (
            <div className={styles.empty}>
              <div className={styles.spinner} />
              <p>טוען קבוצות…</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className={styles.empty}>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <p>{query ? `לא נמצאו תוצאות עבור "${query}"` : "אין קבוצות עדיין"}</p>
            </div>
          ) : (
            filteredGroups.map((group) => {
              const isRenaming = renameStates[group.groupName] !== undefined &&
                renameStates[group.groupName] !== false;
              const isPendingDelete = confirmDelete === group.groupName;

              return (
                <article key={group.groupName} className={styles.groupCard}>
                  <header className={styles.groupHeader}>
                    {isRenaming ? (
                      <div className={styles.renameRow}>
                        <input
                          type="text"
                          className={styles.renameInput}
                          autoFocus
                          defaultValue={group.groupName}
                          onChange={(e) =>
                            setRenameStates((prev) => ({
                              ...prev,
                              [group.groupName]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter")
                              handleGroupRename(
                                group.groupName,
                                renameStates[group.groupName]
                              );
                            if (e.key === "Escape")
                              setRenameStates((prev) => ({
                                ...prev,
                                [group.groupName]: false,
                              }));
                          }}
                        />
                        <button
                          type="button"
                          className={`${styles.iconBtn} ${styles.iconBtnConfirm}`}
                          onClick={() =>
                            handleGroupRename(
                              group.groupName,
                              renameStates[group.groupName]
                            )
                          }
                          aria-label="אישור"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.iconBtn}
                          onClick={() =>
                            setRenameStates((prev) => ({
                              ...prev,
                              [group.groupName]: false,
                            }))
                          }
                          aria-label="ביטול"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className={styles.groupName}>{group.groupName}</h3>
                        <span className={styles.productCount}>
                          {group.products.length}
                        </span>
                      </>
                    )}
                  </header>

                  {!isRenaming && (
                    <div className={styles.actionBar}>
                      <button
                        type="button"
                        className={styles.actionBtnPrimary}
                        onClick={() => {
                          onSelectGroup(group.groupName);
                          onClose();
                        }}
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        הוסף מוצרים
                      </button>
                      <button
                        type="button"
                        className={styles.actionBtnGhost}
                        onClick={() =>
                          setRenameStates((prev) => ({
                            ...prev,
                            [group.groupName]: group.groupName,
                          }))
                        }
                        aria-label="שנה שם"
                        title="שנה שם"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      {isPendingDelete ? (
                        <>
                          <button
                            type="button"
                            className={styles.actionBtnDangerSolid}
                            onClick={() => {
                              deleteGroup(group.groupName);
                              setConfirmDelete(null);
                            }}
                          >
                            מחק
                          </button>
                          <button
                            type="button"
                            className={styles.actionBtnGhost}
                            onClick={() => setConfirmDelete(null)}
                          >
                            ביטול
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className={styles.actionBtnDanger}
                          onClick={() => setConfirmDelete(group.groupName)}
                          aria-label="מחק קבוצה"
                          title="מחק קבוצה"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      )}
                    </div>
                  )}

                  {group.products.length === 0 ? (
                    <div className={styles.emptyGroup}>
                      <p>אין מוצרים בקבוצה</p>
                    </div>
                  ) : (
                    <div
                      className={styles.productsScroller}
                      id={`products-${group.groupName}`}
                    >
                      {group.products.map((p) => (
                        <article key={p.barcode} className={styles.productChip}>
                          <button
                            type="button"
                            className={styles.removeChipBtn}
                            onClick={() =>
                              handleRemoveProductFromGroup(
                                group.groupName,
                                p.barcode
                              )
                            }
                            aria-label="הסר מהקבוצה"
                            title="הסר מהקבוצה"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                          <div className={styles.productImage}>
                            <ProductImageDisplay barcode={p.barcode} />
                          </div>
                          <div className={styles.productMeta}>
                            <span className={styles.productName}>{p.name}</span>
                            <span className={styles.productSub}>
                              {p.weight} {convertWeightUnit(p.unitWeight)}
                              {p.subcategory ? ` · ${p.subcategory}` : ""}
                            </span>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ModalShowAllGroups;
