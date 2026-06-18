import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import "./InvoiceBillAnimation.css";

/**
 * Full-screen "invoice-bill" save animation:
 *   1. dark overlay fades in
 *   2. paper receipt unrolls from the top
 *   3. lines write themselves right-to-left (RTL)
 *   4. green check-mark stamps in with a bounce
 *   5. caption fades in
 *   6. auto-dismisses after a fixed duration
 */
export default function InvoiceBillAnimation({
  isOpen,
  onClose,
  duration = 4500,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const t = setTimeout(() => onClose && onClose(), duration);
    return () => clearTimeout(t);
  }, [isOpen, onClose, duration]);

  if (!isOpen) return null;

  const portal = (
    <div className="iba-overlay" role="status" aria-live="polite">
      <div className="iba-stage">
        <svg
          className="iba-receipt"
          viewBox="0 0 220 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="iba-paper" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f5f9" />
            </linearGradient>
            <filter id="iba-shadow" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* receipt paper with zig-zag bottom edge */}
          <path
            d="
              M20 12
              h180
              v260
              l-12 8 -12 -8 -12 8 -12 -8 -12 8 -12 -8 -12 8 -12 -8 -12 8 -12 -8 -12 8 -12 -8 -12 8 -12 -8 -12 8
              z
            "
            fill="url(#iba-paper)"
            stroke="#cbd5e1"
            strokeWidth="1.5"
            filter="url(#iba-shadow)"
            className="iba-paper"
          />

          {/* shop header bars */}
          <rect x="30" y="28" width="160" height="6" rx="3" fill="#0f172a" className="iba-header" />
          <rect x="60" y="42" width="100" height="4" rx="2" fill="#64748b" className="iba-header-sub" />

          {/* dotted divider */}
          <line
            x1="30" y1="62" x2="190" y2="62"
            stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="3 4"
            className="iba-divider"
          />

          {/* item lines — animate in sequence */}
          {[0, 1, 2, 3].map((i) => (
            <g key={i} className={`iba-row iba-row-${i + 1}`}>
              <rect x="148" y={78 + i * 24} width="42" height="6" rx="3" fill="#0f172a" />
              <rect x="30"  y={78 + i * 24} width="36" height="6" rx="3" fill="#94a3b8" />
            </g>
          ))}

          {/* dotted divider above total */}
          <line
            x1="30" y1="186" x2="190" y2="186"
            stroke="#94a3b8" strokeWidth="1.6" strokeDasharray="3 4"
            className="iba-divider iba-divider-2"
          />

          {/* total row */}
          <g className="iba-total">
            <rect x="130" y="198" width="60" height="10" rx="3" fill="#0f172a" />
            <rect x="30"  y="200" width="58" height="8"  rx="3" fill="#16a34a" />
          </g>

          {/* barcode */}
          <g className="iba-barcode">
            <rect x="48"  y="226" width="2" height="22" fill="#0f172a" />
            <rect x="54"  y="226" width="4" height="22" fill="#0f172a" />
            <rect x="62"  y="226" width="2" height="22" fill="#0f172a" />
            <rect x="68"  y="226" width="6" height="22" fill="#0f172a" />
            <rect x="78"  y="226" width="2" height="22" fill="#0f172a" />
            <rect x="84"  y="226" width="3" height="22" fill="#0f172a" />
            <rect x="91"  y="226" width="2" height="22" fill="#0f172a" />
            <rect x="97"  y="226" width="5" height="22" fill="#0f172a" />
            <rect x="106" y="226" width="2" height="22" fill="#0f172a" />
            <rect x="112" y="226" width="4" height="22" fill="#0f172a" />
            <rect x="120" y="226" width="2" height="22" fill="#0f172a" />
            <rect x="126" y="226" width="6" height="22" fill="#0f172a" />
            <rect x="136" y="226" width="2" height="22" fill="#0f172a" />
            <rect x="142" y="226" width="3" height="22" fill="#0f172a" />
            <rect x="149" y="226" width="5" height="22" fill="#0f172a" />
            <rect x="158" y="226" width="2" height="22" fill="#0f172a" />
            <rect x="164" y="226" width="4" height="22" fill="#0f172a" />
          </g>
        </svg>

        {/* green check stamp */}
        <svg
          className="iba-stamp"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="50" cy="50" r="44" fill="#10b981" stroke="#047857" strokeWidth="3" />
          <path
            d="M30 52 l14 14 l28 -32"
            fill="none"
            stroke="#ffffff"
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="iba-stamp-check"
          />
        </svg>

        <div className="iba-message">
          <h2 className="iba-message-title">ההזמנה נשמרה!</h2>
          <p className="iba-message-sub">
            סיכום הקנייה נוסף להיסטוריה — אפשר לחזור אליו בכל רגע 🧾
          </p>
        </div>
      </div>
    </div>
  );

  const root = document.getElementById("modal-root") || document.body;
  return ReactDOM.createPortal(portal, root);
}
