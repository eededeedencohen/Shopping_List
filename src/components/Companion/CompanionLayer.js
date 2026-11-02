/**
 * The companion's presence OUTSIDE its page: while a store session is
 * running, a floating glass chip above the bottom bar shows the branch, the
 * item count and the live running total on every other page; a tap returns
 * to the session.
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import { useCompanion } from "../../context/CompanionContext";
import SupermarketImage from "../Images/SupermarketImage";
import { haptic } from "../../utils/haptics";
import { uiSound } from "../../utils/uiSound";
import { formatNis } from "../../utils/companionScan";
import "./Companion.css";

const DOCK_HIDDEN_ON = ["/companion", "/ai"];
export const isDockRoute = (pathname) => !DOCK_HIDDEN_ON.some((p) => pathname.startsWith(p));

/* ── the chip can be dragged anywhere so it never covers what matters ──
   position = top-left in px, persisted; null = the default spot (bottom
   centre, above the bar). Clamped to the area between the toolbar and the
   bottom bar on every drop, load and resize. */
const DOCK_POS_KEY = "companion.dockPos";
const DRAG_START_PX = 6; // movement below this is a tap
const EDGE = 8;

const cssPx = (name, fallback) => {
  try {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  } catch {
    return fallback;
  }
};
const readDockPos = () => {
  try {
    const v = JSON.parse(localStorage.getItem(DOCK_POS_KEY) || "null");
    return v && Number.isFinite(v.left) && Number.isFinite(v.top) ? { left: v.left, top: v.top } : null;
  } catch {
    return null;
  }
};
const writeDockPos = (pos) => {
  try {
    if (pos) localStorage.setItem(DOCK_POS_KEY, JSON.stringify(pos));
    else localStorage.removeItem(DOCK_POS_KEY);
  } catch {
    /* ignore */
  }
};
const clampPos = (pos, w, h) => {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const top0 = cssPx("--toolbar-h", 56) + EDGE;
  const bottom0 = vh - cssPx("--bottom-nav-h", 58) - EDGE;
  return {
    left: Math.min(Math.max(pos.left, EDGE), Math.max(EDGE, vw - w - EDGE)),
    top: Math.min(Math.max(pos.top, top0), Math.max(top0, bottom0 - h)),
  };
};

const IconGrip = () => (
  <svg viewBox="0 0 10 16" fill="currentColor" aria-hidden="true">
    <circle cx="3" cy="3" r="1.4" />
    <circle cx="7" cy="3" r="1.4" />
    <circle cx="3" cy="8" r="1.4" />
    <circle cx="7" cy="8" r="1.4" />
    <circle cx="3" cy="13" r="1.4" />
    <circle cx="7" cy="13" r="1.4" />
  </svg>
);

function useCountUp(target, ms = 520) {
  const [v, setV] = useState(target);
  const fromRef = useRef(target);
  useEffect(() => {
    const from = fromRef.current;
    if (from === target) return undefined;
    const t0 = performance.now();
    let raf;
    const tick = (now) => {
      const p = Math.min((now - t0) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(from + (target - from) * e);
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      fromRef.current = target;
    };
  }, [target, ms]);
  return v;
}

function Dock({ store, totals, onOpen }) {
  const shown = useCountUp(totals.total);
  const [bump, setBump] = useState(false);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return undefined;
    }
    setBump(true);
    const t = setTimeout(() => setBump(false), 460);
    return () => clearTimeout(t);
  }, [totals.total]);

  /* ── drag anywhere ── */
  const ref = useRef(null);
  const [pos, setPos] = useState(readDockPos);
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ active: false, moved: false, x0: 0, y0: 0, left0: 0, top0: 0 });
  const suppressClick = useRef(false);

  /* keep a saved spot inside the viewport (orientation change, smaller screen) */
  /* layout size (offsetWidth/Height) - unaffected by the :active / dragging
     scale transforms, so the clamp is exact */
  const size = () => ({ w: ref.current ? ref.current.offsetWidth : 0, h: ref.current ? ref.current.offsetHeight : 0 });
  const reclamp = useCallback(() => {
    setPos((p) => {
      if (!p || !ref.current) return p;
      const c = clampPos(p, ref.current.offsetWidth, ref.current.offsetHeight);
      return c.left === p.left && c.top === p.top ? p : c;
    });
  }, []);
  useEffect(() => {
    reclamp();
    window.addEventListener("resize", reclamp);
    return () => window.removeEventListener("resize", reclamp);
  }, [reclamp]);

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // the box may be scaled by :active at this moment: go from its centre
    const r = ref.current.getBoundingClientRect();
    const { w, h } = size();
    drag.current = {
      active: true,
      moved: false,
      x0: e.clientX,
      y0: e.clientY,
      left0: r.left + r.width / 2 - w / 2,
      top0: r.top + r.height / 2 - h / 2,
    };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d.active) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_START_PX) return;
      d.moved = true;
      setDragging(true);
      haptic("selection");
    }
    const { w, h } = size();
    setPos(clampPos({ left: d.left0 + dx, top: d.top0 + dy }, w, h));
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (d.moved) {
      suppressClick.current = true; // the click that follows a drag is not a tap
      setDragging(false);
      setPos((p) => {
        writeDockPos(p);
        return p;
      });
      haptic("light");
    }
  };
  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onOpen();
  };

  const style = pos ? { left: `${pos.left}px`, top: `${pos.top}px`, bottom: "auto", transform: "none" } : undefined;

  return (
    <button
      ref={ref}
      type="button"
      className={`cmp-dock${bump ? " is-bump" : ""}${pos ? " is-placed" : ""}${dragging ? " is-dragging" : ""}`}
      style={style}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={`ליווי בסופר: ${store.name}, ${totals.items} פריטים, ${formatNis(totals.total)}. אפשר לגרור`}
      dir="rtl"
    >
      <span className="cmp-dock__grip" aria-hidden="true">
        <IconGrip />
      </span>
      <span className="cmp-dock__logo" aria-hidden="true">
        <SupermarketImage supermarketName={store.name} />
      </span>
      <span className="cmp-dock__store">{store.name || "הסניף"}</span>
      <span className="cmp-dock__sep" aria-hidden="true" />
      <span className="cmp-dock__items">{totals.items} פריטים</span>
      <span className="cmp-dock__total">{formatNis(shown)}</span>
      <span className="cmp-dock__dot" aria-hidden="true" />
    </button>
  );
}

export default function CompanionLayer() {
  const c = useCompanion();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  if (!c.hasSession || !isDockRoute(pathname)) return null;
  const root = typeof document !== "undefined" ? document.getElementById("modal-root") || document.body : null;
  if (!root) return null;
  return ReactDOM.createPortal(
    <Dock
      store={c.store}
      totals={c.totals}
      onOpen={() => {
        haptic("light");
        uiSound("select");
        navigate("/companion");
      }}
    />,
    root
  );
}
