import { useLayoutEffect, useRef } from "react";

/* ── The dock's WAVE edge, as a live clip-path ──────────────────────
   The blue bar's top edge is straight, then dips in two convex shoulders
   (radius F) into a concave arc that hugs the robot coin. The arc's radius
   (R=30) is 2px INSIDE the 32px coin, so it is always hidden behind it and
   no see-through gap ever appears.

   The shoulder radius is what makes the wave WIDE or TIGHT:
     • idle        → F_IDLE   (a wide, calm parabola)
     • voice modes → F_ACTIVE (the bar "grips" the robot)
   and the switch is animated frame by frame (an overshooting ease when the
   robot wakes up, a soft ease when it goes quiet). The path is written
   straight into the two shape elements' inline style (no React re-render
   per frame). Coordinates: element box, y down, the bar's top edge at y=0,
   the coin centre at (width/2, COIN_CY). */
export const F_IDLE = 52; // dip at the coin's edge ≈ 33.6px — keep ≤ --dock-overlap (index.css)
export const F_ACTIVE = 20;
const COIN_CY = 23; // = nav-bar-h - 3 - fab/2 (see BottomNav.css)
const R = 30; // concave arc radius — must stay < the 32px coin radius
const WAKE_MS = 480;
const REST_MS = 560;

export function cradlePath(width, f) {
  const cx = width / 2;
  const d = R + f; // centre-to-centre distance of the tangent circles
  const xf = Math.sqrt(d * d - (COIN_CY - f) * (COIN_CY - f));
  // left tangent point = shoulder centre + f × (unit vector towards the coin)
  const tx = cx - xf + (f * xf) / d;
  const ty = f + (f * (COIN_CY - f)) / d;
  const large = ty < COIN_CY ? 1 : 0; // via the bottom: the long way when the points sit above the centre
  const r2 = (n) => Math.round(n * 100) / 100;
  return [
    `M-1,0`,
    `H${r2(cx - xf)}`,
    `A${f},${f} 0 0 1 ${r2(tx)},${r2(ty)}`,
    `A${R},${R} 0 ${large} 0 ${r2(2 * cx - tx)},${r2(ty)}`,
    `A${f},${f} 0 0 1 ${r2(cx + xf)},0`,
    `H${r2(width + 1)}`,
    `V1000 H-1 Z`,
  ].join(" ");
}

const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * @param {React.RefObject<HTMLElement>} navRef      the <nav> (measured for its width)
 * @param {React.RefObject<HTMLElement>[]} shapeRefs the elements that take the clip-path
 * @param {boolean} active                            voice mode on → tight wave
 */
export default function useDockShape(navRef, shapeRefs, active) {
  const fRef = useRef(active ? F_ACTIVE : F_IDLE);
  const widthRef = useRef(0);
  const rafRef = useRef(null);

  const paint = () => {
    const w = widthRef.current;
    if (!w) return;
    const path = `path("${cradlePath(w, fRef.current)}")`;
    shapeRefs.forEach((r) => {
      const el = r.current;
      if (!el) return;
      el.style.clipPath = path;
      el.style.webkitClipPath = path;
    });
  };

  /* width: measured once + on every resize (orientation change) */
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return undefined;
    const measure = () => {
      widthRef.current = nav.getBoundingClientRect().width || window.innerWidth;
      paint();
    };
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* morph between the two widths when the voice mode flips */
  useLayoutEffect(() => {
    const from = fRef.current;
    const to = active ? F_ACTIVE : F_IDLE;
    if (from === to) return undefined;
    const dur = active ? WAKE_MS : REST_MS;
    const ease = active ? easeOutBack : easeInOutCubic;
    const t0 = performance.now();
    cancelAnimationFrame(rafRef.current);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      fRef.current = from + (to - from) * ease(t);
      paint();
      if (t < 1) rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);
}
