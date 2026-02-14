import React from "react";
import SupermarketImage from "../../Images/SupermarketImage";
import styles from "./SupermarketsBranches.module.css";

const SupermarketsBranches = ({
  selectedSupermarket,
  onSelectBranch,
  onBack,
}) => {
  if (!selectedSupermarket) return null;

  const { name, branches } = selectedSupermarket;

  return (
    <div className={styles.container}>
      {/* Sticky header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoWrap}>
            <SupermarketImage supermarketName={name} className={styles.logo} />
          </div>
          <div className={styles.headerText}>
            <h3 className={styles.title}>בחר סניף</h3>
            <span className={styles.subtitle}>{branches.length} סניפים זמינים</span>
          </div>
        </div>
      </div>

      {/* Branch list */}
      <div className={styles.list}>
        {branches.map((branch, idx) => (
          <button
            key={branch.supermarketID}
            className={styles.branchCard}
            onClick={() => onSelectBranch(branch.supermarketID)}
            style={{ animationDelay: `${idx * 0.04}s` }}
          >
            <div className={styles.branchIcon}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className={styles.branchInfo}>
              <span className={styles.branchCity}>{branch.city}</span>
              <span className={styles.branchAddress}>{branch.address}</span>
            </div>
            <div className={styles.branchArrow}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <button className={styles.backBtn} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
          חזרה לרשתות
        </button>
      </div>
    </div>
  );
};

export default SupermarketsBranches;
