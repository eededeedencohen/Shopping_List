import { useEffect } from "react";

/**
 * Hook: lock document.body scroll while `isLocked` is true.
 *
 * Multiple components can call this simultaneously (e.g. stacked modals,
 * a drawer + nested picker). A module-level ref counter restores the
 * original overflow only after the LAST locker releases — so closing
 * an inner modal does not unlock scroll while the outer one is still
 * open, and double-lock/unlock from the same component is harmless.
 *
 * Side effect: pads the body with the scrollbar width while locked,
 * so the page does not horizontally jump when the scrollbar disappears.
 *
 * Usage:
 *   useBodyScrollLock(isOpen);            // lock while isOpen is true
 *   useBodyScrollLock(true);              // always lock while component is mounted
 */
let lockCount = 0;
let savedOverflow = "";
let savedPaddingRight = "";

function applyLock() {
  if (lockCount === 0) {
    savedOverflow = document.body.style.overflow;
    savedPaddingRight = document.body.style.paddingRight;
    const scrollbarW =
      window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarW > 0) {
      document.body.style.paddingRight = `${scrollbarW}px`;
    }
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;
}

function releaseLock() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.style.overflow = savedOverflow;
    document.body.style.paddingRight = savedPaddingRight;
  }
}

export default function useBodyScrollLock(isLocked) {
  useEffect(() => {
    if (!isLocked) return undefined;
    applyLock();
    return releaseLock;
  }, [isLocked]);
}
