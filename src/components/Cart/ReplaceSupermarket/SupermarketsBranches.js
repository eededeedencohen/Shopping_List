import React from "react";
import SupermarketImage from "../../Images/SupermarketImage";
import "./SupermarketsBranches.css";

const SupermarketsBranches = ({
  selectedSupermarket,
  onSelectBranch,
  onBack,
}) => {
  if (!selectedSupermarket) return null;

  const { name, branches } = selectedSupermarket;

  return (
    <div className="sbn_container">
      {/* אזור כותרת דביקה (Sticky) */}
      <div className="sbn_header">
        <SupermarketImage supermarketName={name} className="sbn_logo" />
        <h3 className="sbn_title">בחר סניף של </h3>
      </div>

      {/* רשימת הסניפים */}
      <div className="sbn_list">
        <ul className="sbn_listUl">
          {branches.map((branch) => (
            <li key={branch.supermarketID} className="sbn_listItem">
              <button
                className="sbn_branchButton"
                onClick={() => onSelectBranch(branch.supermarketID)}
              >
                {branch.city} - {branch.address}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* אזור תחתון (footer) עבור כפתור "חזרה" */}
      <div className="sbn_footer">
        <button className="sbn_backButton" onClick={onBack}>
          חזרה
        </button>
      </div>
    </div>
  );
};

export default SupermarketsBranches;
