/* Stroke icons for the AI action sheet (one per action) + the gesture hints.
   24px grid, 2px rounded strokes, inherit currentColor. */
import React from "react";

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  width: "1em",
  height: "1em",
  "aria-hidden": true,
};

/* ניווט — compass */
export const IconCompass = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <polygon points="15.5 8.5 13.6 13.6 8.5 15.5 10.4 10.4 15.5 8.5" fill="currentColor" stroke="none" />
  </svg>
);

/* קטגוריות — 2×2 grid */
export const IconGrid = (p) => (
  <svg {...base} {...p}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
  </svg>
);

/* הסופר הזול — price tag */
export const IconTag = (p) => (
  <svg {...base} {...p}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="8" cy="8" r="1.6" fill="currentColor" stroke="none" />
  </svg>
);

/* ייעול — sparkles */
export const IconSparkles = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 13.9 9l5.6 1.9-5.6 1.9L12 18.4l-1.9-5.6L4.5 10.9 10.1 9z" />
    <path d="M19 16.5v3M17.5 18h3" />
    <path d="M5 4v2.5M3.75 5.25h2.5" />
  </svg>
);

/* השוואה — balance scale */
export const IconScale = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3v18M5 21h14" />
    <path d="M4 7h16" />
    <path d="M6.5 7 3 14a3.5 3.5 0 0 0 7 0L6.5 7z" />
    <path d="M17.5 7 14 14a3.5 3.5 0 0 0 7 0L17.5 7z" />
  </svg>
);

/* השלמת עגלה — cart with check */
export const IconCartCheck = (p) => (
  <svg {...base} {...p}>
    <path d="M3 4h2.2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 8H6.2" />
    <circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <path d="m10.5 11.5 2 2 3.5-3.5" />
  </svg>
);

/* השלמה ומעבר — cart + arrow */
export const IconCartSwitch = (p) => (
  <svg {...base} {...p}>
    <path d="M3 4h2.2l2.4 11.2a1.6 1.6 0 0 0 1.6 1.3h8.6a1.6 1.6 0 0 0 1.6-1.2L21 8H6.2" />
    <circle cx="9.5" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <circle cx="17" cy="20" r="1.3" fill="currentColor" stroke="none" />
    <path d="M10.5 12h5.5M13.8 9.8l2.2 2.2-2.2 2.2" />
  </svg>
);

/* מצא מוצר במדף — location pin on a shelf */
export const IconShelfPin = (p) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6-5.3-6-10a6 6 0 0 1 12 0c0 4.7-6 10-6 10z" />
    <circle cx="12" cy="11" r="2.2" />
  </svg>
);

/* gesture hints */
export const IconMic = (p) => (
  <svg {...base} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
    <path d="M12 17.5V21M9 21h6" />
  </svg>
);
export const IconEar = (p) => (
  <svg {...base} {...p}>
    <path d="M6 10a6 6 0 0 1 12 0c0 3-2 3.5-2.6 5.4-.5 1.6-1 3.6-3.4 3.6a2.5 2.5 0 0 1-2.5-2.5" />
    <path d="M9.5 10a2.5 2.5 0 0 1 5 0c0 1.5-1.2 1.8-1.5 2.7" />
  </svg>
);
export const IconSpeaker = (p) => (
  <svg {...base} {...p}>
    <path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5H4z" />
    <path d="M15.5 9a4 4 0 0 1 0 6" />
    <path d="M18 6.5a7.5 7.5 0 0 1 0 11" />
  </svg>
);
export const IconTap = (p) => (
  <svg {...base} {...p}>
    <path d="M9 11.5V6a2 2 0 1 1 4 0v5" />
    <path d="M13 10.5a2 2 0 1 1 4 0v1.5" />
    <path d="M17 12a2 2 0 1 1 4 0v3.5A5.5 5.5 0 0 1 15.5 21h-1.8a4.5 4.5 0 0 1-3.6-1.8L6.5 14.4a1.8 1.8 0 0 1 2.7-2.4L9 12.5" />
  </svg>
);
export const IconHold = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" strokeDasharray="4 3" />
    <circle cx="12" cy="12" r="3.5" fill="currentColor" stroke="none" />
  </svg>
);
export const IconDoubleTap = (p) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="12" r="4.5" />
    <circle cx="15.5" cy="12" r="4.5" />
  </svg>
);
export const IconSpinner = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3a9 9 0 1 1-6.4 2.6" />
  </svg>
);
export const IconAlert = (p) => (
  <svg {...base} {...p}>
    <path d="M12 3.5 2.8 19.5h18.4L12 3.5z" />
    <path d="M12 10v4M12 17.2v.1" />
  </svg>
);
