import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./SearchModal.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { IconClose } from "../Icons/UiIcons";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";

/* ── Product search — a CENTERED modal (2026-11-02 redesign) ─────────────
   Same API as before (`isOpen` / `onClose` / children). A fixed-height
   rounded card in the middle of the screen over a blurred navy veil (the
   same shell language as the price-comparison modal): fades + scales in,
   plays an exit animation before it unmounts, closes on overlay tap / ✕ /
   Escape, locks the page scroll, haptics + ui sounds. The children
   (SearchBar) own the search field + the scrolling results. */
const CLOSE_MS = 220;

const SearchModal = ({ isOpen, children, onClose, title = "חיפוש מוצרים" }) => {
  const [shown, setShown] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);

  useBodyScrollLock(shown);

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

  /* Escape closes — unless a product comparison modal is stacked on top
     (it handles its own Escape) */
  useEffect(() => {
    if (!shown || closing) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (document.querySelector(".pcs")) return;
      onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shown, closing, onClose]);

  if (!shown) return null;

  return ReactDOM.createPortal(
    <div
      className={`sm${closing ? " is-closing" : ""}`}
      dir="rtl"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="sm__card" role="dialog" aria-modal="true" aria-label={title}>
        <div className="sm__head">
          <h2 className="sm__title">{title}</h2>
          <button type="button" className="sm__x" onClick={onClose} aria-label="סגור">
            <IconClose />
          </button>
        </div>
        <div className="sm__body">{children}</div>
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
};

export default SearchModal;
