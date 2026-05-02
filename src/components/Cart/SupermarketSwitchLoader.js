import React from "react";
import styles from "./SupermarketSwitchLoader.module.css";
import SupermarketImage from "../Images/SupermarketImage";

/**
 * Full-screen loading state shown while a freshly picked supermarket's
 * prices are being fetched. The TARGET supermarket's logo is the hero —
 * concentric pulsing rings, a scanline sweeping across it, and a soft
 * glow underneath. The user immediately sees where they're switching to.
 */
export default function SupermarketSwitchLoader({ target }) {
  if (!target) return null;
  const { name, city, address } = target;

  return (
    <div className={styles.container}>
      <div className={styles.stage}>
        <div className={styles.glow} />
        <div className={styles.rings} aria-hidden>
          <span /><span /><span />
        </div>
        <div className={styles.logoCard}>
          <SupermarketImage supermarketName={name} />
        </div>
        <div className={styles.scanline} aria-hidden />
      </div>

      <div className={styles.text}>
        <p className={styles.title}>טוען מחירים מ-{name}</p>
        {(city || address) && (
          <p className={styles.subtitle}>
            {[city, address].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className={styles.dots} aria-hidden>
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
