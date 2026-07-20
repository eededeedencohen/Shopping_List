import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./BottomSheet.css";
import useBodyScrollLock from "../../../hooks/useBodyScrollLock";

/* Generic bottom sheet — THE single editing surface of the product-settings
   page: weight, tag filtering and brands all open through it, so the user
   learns one pattern. Slides up over a veil, sticky header + footer, and the
   body scrolls on its own when content is tall. */

const EXIT_MS = 260;

export default function BottomSheet({
  isOpen,
  onClose,
  title,
  headEnd = null,
  footer = null,
  children,
}) {
  const [isRendered, setIsRendered] = useState(false);
  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (isOpen) {
      setIsRendered(true);
      return undefined;
    }
    if (!isRendered) return undefined;
    const t = setTimeout(() => setIsRendered(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [isOpen, isRendered]);

  if (!isRendered) return null;

  const sheet = (
    <div className={`bsheet-layer${isOpen ? " is-open" : ""}`} dir="rtl">
      <div className="bsheet-veil" onClick={onClose} />
      <div className="bsheet" role="dialog" aria-label={title}>
        <div className="bsheet-grip" aria-hidden="true" />
        <header className="bsheet-head">
          <h3 className="bsheet-title">{title}</h3>
          {headEnd && <div className="bsheet-head-end">{headEnd}</div>}
        </header>
        <div className="bsheet-body">{children}</div>
        {footer && <footer className="bsheet-foot">{footer}</footer>}
      </div>
    </div>
  );

  const root = document.getElementById("modal-root") || document.body;
  return ReactDOM.createPortal(sheet, root);
}
