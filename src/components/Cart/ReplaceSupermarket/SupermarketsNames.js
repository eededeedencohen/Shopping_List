import React, { useMemo } from "react";
import SupermarketImage from "../../Images/SupermarketImage";
import { useSupermarkets } from "../../../hooks/optimizationHooks";
import styles from "./SupermarketsNames.module.css";

const SupermarketsNames = ({ onSelectSupermarket }) => {
  const { allSupermarkets, isAllSupermarketsUploaded } = useSupermarkets();

  // Group supermarkets by name, collecting branches per name
  const supermarketsArray = useMemo(() => {
    if (!allSupermarkets || !allSupermarkets.length) return [];

    const grouped = {};
    allSupermarkets.forEach((s) => {
      const name = s.name;
      if (!grouped[name]) {
        grouped[name] = [];
      }
      // Avoid duplicates by supermarketID
      if (!grouped[name].some((b) => b.supermarketID === s.supermarketID)) {
        grouped[name].push({
          address: s.address,
          city: s.city,
          supermarketID: s.supermarketID,
        });
      }
    });

    return Object.keys(grouped).map((name) => ({
      name,
      branches: grouped[name],
    }));
  }, [allSupermarkets]);

  if (!isAllSupermarketsUploaded) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingDot} />
        <div className={styles.loadingDot} />
        <div className={styles.loadingDot} />
      </div>
    );
  }

  if (!supermarketsArray.length) {
    return (
      <div className={styles.empty}>
        <span>לא נמצאו סופרמרקטים</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>בחר רשת סופרמרקט</h3>
        <span className={styles.subtitle}>
          {supermarketsArray.length} רשתות זמינות
        </span>
      </div>

      <div className={styles.grid}>
        {supermarketsArray.map((supermarket, idx) => (
          <div
            key={supermarket.name}
            className={styles.card}
            onClick={() => onSelectSupermarket(supermarket)}
            style={{ animationDelay: `${idx * 0.05}s` }}
          >
            <div className={styles.logoWrap}>
              <SupermarketImage
                supermarketName={supermarket.name}
                className={styles.logo}
              />
            </div>
            <span className={styles.branchCount}>
              {supermarket.branches.length} סניפים
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupermarketsNames;
