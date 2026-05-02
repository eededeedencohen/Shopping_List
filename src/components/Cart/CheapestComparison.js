import React, { useEffect, useState } from "react";
import styles from "./CheapestComparison.module.css";
import SupermarketImage from "../Images/SupermarketImage";

/**
 * Visual feedback shown after the "הכי זול" optimisation finds and
 * applies a cheaper supermarket. Cards animate in, the price counts
 * down from the old total to the new total, and a savings badge pops
 * after the count finishes. The whole screen auto-dismisses via the
 * `onClose` callback once `durationMs` elapses.
 */
export default function CheapestComparison({
  before,
  after,
  durationMs = 4200,
  onClose,
}) {
  const saved = Math.max(0, before.price - after.price);
  const savedPct = before.price > 0 ? (saved / before.price) * 100 : 0;
  const [displayedPrice, setDisplayedPrice] = useState(before.price);

  /* Animate the new price counting down from old → new */
  useEffect(() => {
    const start = before.price;
    const end = after.price;
    const duration = 1400;
    const startDelay = 700;

    let rafId = null;
    const startTimer = setTimeout(() => {
      const startTime = performance.now();
      const tick = (now) => {
        const t = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
        setDisplayedPrice(start + (end - start) * eased);
        if (t < 1) rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      clearTimeout(startTimer);
      if (rafId != null) cancelAnimationFrame(rafId);
    };
  }, [before.price, after.price]);

  /* Auto-dismiss */
  useEffect(() => {
    if (!onClose) return;
    const t = setTimeout(onClose, durationMs);
    return () => clearTimeout(t);
  }, [durationMs, onClose]);

  return (
    <div className={styles.container}>
      <div className={styles.sparkles} aria-hidden>
        {Array.from({ length: 14 }).map((_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>

      <div className={styles.successHeader}>
        <div className={styles.successIcon}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className={styles.title}>נמצא לך סופר זול יותר!</h1>
        <p className={styles.subtitle}>החלפנו עבורך אוטומטית</p>
      </div>

      <div className={styles.flow}>
        {/* OLD */}
        <div className={`${styles.card} ${styles.cardBefore}`}>
          <span className={styles.cardLabel}>קודם</span>
          <div className={styles.cardLogo}>
            <SupermarketImage supermarketName={before.supermarket.name} />
          </div>
          <span className={styles.cardName}>{before.supermarket.name}</span>
          <span className={`${styles.cardPrice} ${styles.cardPriceOld}`}>
            ₪{before.price.toFixed(2)}
          </span>
        </div>

        <div className={styles.arrow} aria-hidden>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="4" x2="12" y2="20" />
            <polyline points="19 13 12 20 5 13" />
          </svg>
        </div>

        {/* NEW */}
        <div className={`${styles.card} ${styles.cardAfter}`}>
          <span className={styles.cardLabel}>עכשיו</span>
          <div className={styles.cardLogo}>
            <SupermarketImage supermarketName={after.supermarket.name} />
          </div>
          <span className={styles.cardName}>{after.supermarket.name}</span>
          <span className={`${styles.cardPrice} ${styles.cardPriceNew}`}>
            ₪{displayedPrice.toFixed(2)}
          </span>
        </div>
      </div>

      {saved > 0 && (
        <div className={styles.savings}>
          <span className={styles.savingsLabel}>חסכת</span>
          <span className={styles.savingsAmount}>₪{saved.toFixed(2)}</span>
          <span className={styles.savingsPct}>{savedPct.toFixed(0)}%</span>
        </div>
      )}

      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ animationDuration: `${durationMs}ms` }}
        />
      </div>
    </div>
  );
}
