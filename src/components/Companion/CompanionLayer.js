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

/* ── the chip can be dragged so it never covers what matters ──
   It DOCKS to one of the four edges: on drop it snaps to the nearest edge
   of the band between the toolbar and the bottom bar and slides along it;
   on the top/bottom edges it stays horizontal, on the left/right edges it
   turns vertical (the whole chip rotated 90°, like a book spine). The spot
   is persisted as {edge, left, top}; null = the default (bottom centre). */
const DOCK_POS_KEY = "companion.dockPos";
const DRAG_START_PX = 6; // movement below this is a tap
const EDGE = 8;
const THICK = 44; // the chip's short side
const EDGES = ["top", "bottom", "left", "right"];
const isSideEdge = (edge) => edge === "left" || edge === "right";

const cssPx = (name, fallback) => {
  try {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
    return Number.isFinite(v) ? v : fallback;
  } catch {
    return fallback;
  }
};
const band = () => ({
  vw: window.innerWidth,
  vh: window.innerHeight,
  top: cssPx("--toolbar-h", 56) + EDGE,
  bottom: window.innerHeight - cssPx("--bottom-nav-h", 58) - EDGE,
});
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), Math.max(lo, hi));
const readDockPos = () => {
  try {
    const v = JSON.parse(localStorage.getItem(DOCK_POS_KEY) || "null");
    return v && EDGES.includes(v.edge) && Number.isFinite(v.left) && Number.isFinite(v.top)
      ? { edge: v.edge, left: v.left, top: v.top }
      : null;
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
/* the chip's box for an edge: horizontal on top/bottom, vertical on the sides */
const boxFor = (edge, len) => (isSideEdge(edge) ? { w: THICK, h: len } : { w: len, h: THICK });
/* where a chip whose centre is (cx, cy) sits once docked to `edge` */
const placeOnEdge = (edge, cx, cy, len) => {
  const b = band();
  const { w, h } = boxFor(edge, len);
  if (isSideEdge(edge)) {
    return {
      edge,
      left: edge === "left" ? EDGE : b.vw - w - EDGE,
      top: clamp(cy - h / 2, b.top, b.bottom - h),
    };
  }
  return {
    edge,
    left: clamp(cx - w / 2, EDGE, b.vw - w - EDGE),
    top: edge === "top" ? b.top : b.bottom - h,
  };
};
/* the edge nearest to a point (the finger may be past the band: clamp first) */
const nearestEdge = (x, y) => {
  const b = band();
  const cx = clamp(x, EDGE, b.vw - EDGE);
  const cy = clamp(y, b.top, b.bottom);
  const d = [
    ["top", cy - b.top],
    ["bottom", b.bottom - cy],
    ["left", cx - EDGE],
    ["right", b.vw - EDGE - cx],
  ];
  d.sort((x, y) => x[1] - y[1]);
  return d[0][0];
};
/* free movement while the finger is down: anywhere inside the band */
const clampFree = (pos, w, h) => {
  const b = band();
  return {
    left: clamp(pos.left, EDGE, b.vw - w - EDGE),
    top: clamp(pos.top, b.top, b.bottom - h),
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

  /* ── drag + dock to an edge ── */
  const ref = useRef(null);
  const innerRef = useRef(null);
  const [pos, setPos] = useState(readDockPos); // {edge, left, top} | null
  const [len, setLen] = useState(0); // the chip's long side (the inner row's layout width)
  const [dragging, setDragging] = useState(false);
  const drag = useRef({ active: false, moved: false, x0: 0, y0: 0, left0: 0, top0: 0, edge: "bottom" });
  const suppressClick = useRef(false);

  /* the inner row keeps its horizontal layout even when the chip is turned
     vertical (a transform), so its offsetWidth is always the long side */
  useEffect(() => {
    const el = innerRef.current;
    if (!el) return undefined;
    const measure = () => setLen(el.offsetWidth);
    measure();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* keep a saved spot on its edge and inside the band (orientation change,
     smaller screen, a longer total) */
  const resettle = useCallback(() => {
    setPos((p) => {
      if (!p || !len) return p;
      const { w, h } = boxFor(p.edge, len);
      const next = placeOnEdge(p.edge, p.left + w / 2, p.top + h / 2, len);
      return next.left === p.left && next.top === p.top ? p : next;
    });
  }, [len]);
  useEffect(() => {
    resettle();
    window.addEventListener("resize", resettle);
    return () => window.removeEventListener("resize", resettle);
  }, [resettle]);

  const vertical = !!pos && isSideEdge(pos.edge);
  const box = pos ? boxFor(pos.edge, len) : { w: len, h: THICK };

  const onPointerDown = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    // the box may be scaled by :active at this moment: go from its centre
    const r = ref.current.getBoundingClientRect();
    drag.current = {
      active: true,
      moved: false,
      x0: e.clientX,
      y0: e.clientY,
      left0: r.left + r.width / 2 - box.w / 2,
      top0: r.top + r.height / 2 - box.h / 2,
      edge: pos ? pos.edge : "bottom",
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
    d.px = e.clientX;
    d.py = e.clientY;
    const { w, h } = boxFor(d.edge, len);
    setPos({ edge: d.edge, ...clampFree({ left: d.left0 + dx, top: d.top0 + dy }, w, h) });
  };
  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    if (!d.moved) return;
    suppressClick.current = true; // the click that follows a drag is not a tap
    setDragging(false);
    setPos((p) => {
      if (!p) return p;
      const { w, h } = boxFor(p.edge, len);
      const cx = p.left + w / 2;
      const cy = p.top + h / 2;
      // the edge is chosen by where the FINGER let go (a wide chip pushed
      // against a side has its centre far from that side), the spot along
      // the edge by the chip's centre
      const next = placeOnEdge(nearestEdge(d.px, d.py), cx, cy, len);
      writeDockPos(next);
      return next;
    });
    haptic("light");
  };
  const onClick = () => {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    onOpen();
  };

  const style = pos
    ? {
        left: `${pos.left}px`,
        top: `${pos.top}px`,
        bottom: "auto",
        transform: "none",
        width: vertical ? `${THICK}px` : undefined,
        height: vertical ? `${len}px` : undefined,
      }
    : undefined;

  return (
    <button
      ref={ref}
      type="button"
      className={`cmp-dock${bump ? " is-bump" : ""}${pos ? ` is-placed cmp-dock--${pos.edge}` : ""}${
        vertical ? " cmp-dock--vertical" : ""
      }${dragging ? " is-dragging" : ""}`}
      style={style}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      aria-label={`ליווי בסופר: ${store.name}, ${totals.items} פריטים, ${formatNis(totals.total)}. אפשר לגרור לקצה המסך`}
      dir="rtl"
    >
      <span className="cmp-dock__inner" ref={innerRef}>
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
      </span>
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
