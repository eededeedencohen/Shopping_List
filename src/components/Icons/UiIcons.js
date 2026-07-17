/* Shared UI icons — SVG replacements for text-character "icons" (→ ← ‹ › ✕ ×)
   that used to be rendered as font glyphs. Paths follow the SVG patterns the
   app already uses (the Settings/overlay chevron polyline, the overlay ✕).
   Sized at 1em so each icon inherits its button's font-size exactly like the
   character it replaced — no per-site CSS changes needed. */
import React from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  style: { display: "inline-block", verticalAlign: "-0.125em" },
  "aria-hidden": true,
};

export const IconClose = (props) => (
  <svg {...base} {...props}>
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export const IconChevronLeft = (props) => (
  <svg {...base} {...props}>
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

export const IconChevronRight = (props) => (
  <svg {...base} {...props}>
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

export const IconArrowRight = (props) => (
  <svg {...base} {...props}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

export const IconArrowLeft = (props) => (
  <svg {...base} {...props}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 5 5 12 12 19" />
  </svg>
);
