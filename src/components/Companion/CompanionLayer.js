/**
 * The companion's presence OUTSIDE its page: while a store session is
 * running, a floating glass chip above the bottom bar shows the branch, the
 * item count and the live running total on every other page; a tap returns
 * to the session.
 */
import React, { useEffect, useRef, useState } from "react";
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
  return (
    <button
      type="button"
      className={`cmp-dock${bump ? " is-bump" : ""}`}
      onClick={onOpen}
      aria-label={`ליווי בסופר: ${store.name}, ${totals.items} פריטים, ${formatNis(totals.total)}`}
      dir="rtl"
    >
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
