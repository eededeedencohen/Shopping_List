import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import "./productComparisonModal.css";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";
import { IconClose } from "../Icons/UiIcons";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";

/* ── Product comparison — a BOTTOM SHEET (2026-11-02 redesign) ───────────
   Same API as before (`isOpen` / `onClose` / children). The sheet slides up
   from the bottom (centered dialog on wide screens), has a grip + title bar
   that can be dragged down to dismiss, plays an exit animation before it
   unmounts, closes on overlay tap / ✕ / Escape, and uses the app's haptic +
   sound kit so it feels like the robot's action sheet and the pickers. */
const CLOSE_MS = 240;
const DISMISS_PX = 90; // drag the handle this far down → close

const ProductComparisonModal = ({
  isOpen,
  children,
  onClose,
  title = "השוואת מחירים",
}) => {
  const [shown, setShown] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [drag, setDrag] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef({ active: false, y0: 0, dy: 0, t0: 0 });
  const closeTimer = useRef(null);

  useBodyScrollLock(shown);

  /* open → mount at once; close → keep it mounted for the exit animation */
  useEffect(() => {
    clearTimeout(closeTimer.current);
    if (isOpen) {
      setShown(true);
      setClosing(false);
      setDrag(0);
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
      setDrag(0);
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

  /* drag the handle down to dismiss (pointer events; the ✕ is excluded) */
  const onHandleDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if (e.target.closest && e.target.closest("button")) return;
    dragRef.current = { active: true, y0: e.clientY, dy: 0, t0: Date.now() };
    setDragging(true);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
  };
  const onHandleMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.dy = Math.max(0, e.clientY - d.y0);
    setDrag(d.dy);
  };
  const onHandleUp = () => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;
    setDragging(false);
    const fast = d.dy > 24 && Date.now() - d.t0 < 200;
    if (d.dy > DISMISS_PX || fast) {
      haptic("light");
      onClose(); // the exit animation continues from the dragged position
    } else {
      setDrag(0); // spring back
    }
  };

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
        className={`pcs__sheet${dragging ? " is-dragging" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{
          "--drag": `${drag}px`,
          transform: drag && !closing ? `translateY(${drag}px)` : undefined,
        }}
      >
        <div
          className="pcs__handle"
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleUp}
          onPointerCancel={onHandleUp}
        >
          <span className="pcs__grip" aria-hidden="true" />
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
        </div>
        <div className="pcs__scroll">{children}</div>
      </div>
    </div>,
    document.getElementById("modal-root") || document.body
  );
};

export default ProductComparisonModal;
