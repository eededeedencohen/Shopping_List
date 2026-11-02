import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./productComparisonModal.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { IconClose } from "../Icons/UiIcons";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";

/* ── Product comparison — a CENTERED modal (2026-11-02 redesign) ─────────
   Same API as before (`isOpen` / `onClose` / children). A rounded card in
   the middle of the screen over a blurred navy veil: fades + scales in,
   plays an exit animation before it unmounts, closes on overlay tap / ✕ /
   Escape, and uses the app's haptic + sound kit. (The user asked for a
   modal in the middle, explicitly NOT a sheet attached to the bottom.) */
const CLOSE_MS = 220;

const ProductComparisonModal = ({
  isOpen,
  children,
  onClose,
  title = "השוואת מחירים",
}) => {
  const [shown, setShown] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);

  useBodyScrollLock(shown);

  /* open → mount at once; close → keep it mounted for the exit animation */
  useEffect(() => {
    clearTimeout(closeTimer.current);
    if (isOpen) {
      setShown(true);
      setClosing(false);
      haptic("medium");
      uiSound("open");
      return undefined;
    }
    if (!shown) return undefined;
    setClosing(true);
    uiSound("close");
    closeTimer.current = setTimeout(() => {
      setShown(false);
      setClosing(false);
    }, CLOSE_MS);
    return () => clearTimeout(closeTimer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  /* Escape closes */
  useEffect(() => {
    if (!shown || closing) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, closing, onClose]);

  if (!shown) return null;

  return ReactDOM.createPortal(
    <div
      className={`pcs${closing ? " is-closing" : ""}`}
      dir="rtl"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="pcs__sheet"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="pcs__head">
          <h2 className="pcs__title">{title}</h2>
          <button
            type="button"
            className="pcs__x"
            onClick={onClose}
            aria-label="סגור"
          >
            <IconClose />
          </button>
        </div>
        <div className="pcs__scroll">{children}</div>
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
};

export default ProductComparisonModal;
