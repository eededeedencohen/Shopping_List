import { useEffect, useRef } from "react";
import "./VoiceWaves.css";

/* Audio-reactive "sound waves" flanking the robot coin.

   The hook exposes a live amplitude in `levelRef` (0..1) — the mic RMS while you
   speak, the TTS RMS while the AI replies. Reading state at 60fps would thrash
   React, so this component runs its OWN rAF that just writes the value to a CSS
   custom property (`--vlevel`); the bars/glow scale off it in pure CSS. `mode`
   recolors the waves (listening / recording / speaking / processing). Renders
   nothing when idle, so there is no permanent animation in the nav. */

const BARS = 28; // many thin bars per side, packed densely

// nearest-to-coin bars are tallest, tapering outward (waves radiating out)
const weight = (i) => 1 - (i / BARS) * 0.6;

export default function VoiceWaves({ levelRef, mode = "idle", active = false }) {
  const rootRef = useRef(null);
  const rafRef = useRef(null);
  const loudRef = useRef(false);

  useEffect(() => {
    if (!active) return undefined;
    const el = rootRef.current;
    // Write the level on the NAV (the shared parent) so both the waves AND the
    // coin (siblings) can react to it via inheritance.
    const host = (el && el.parentElement) || el;
    let stopped = false;
    loudRef.current = false;
    const tick = () => {
      if (stopped) return;
      const lvl =
        levelRef && typeof levelRef.current === "number"
          ? levelRef.current
          : 0;
      if (host) host.style.setProperty("--vlevel", lvl.toFixed(3));
      if (el) {
        // The concentric ripples fire ONLY on actual sound (your voice / the
        // AI) — never in silence. Hysteresis avoids on/off flicker at the edge.
        const loud = loudRef.current ? lvl > 0.05 : lvl > 0.14;
        if (loud !== loudRef.current) {
          loudRef.current = loud;
          el.classList.toggle("is-loud", loud);
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      stopped = true;
      loudRef.current = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (host) host.style.setProperty("--vlevel", "0");
    };
  }, [active, levelRef]);

  if (!active) return null;

  const renderBars = (side) =>
    Array.from({ length: BARS }, (_, i) => (
      <span
        key={`${side}-${i}`}
        className="voice-waves__bar"
        style={{ "--w": weight(i).toFixed(3), "--d": (i * 0.08).toFixed(3) }}
      />
    ));

  return (
    <div
      ref={rootRef}
      className={`voice-waves voice-waves--${mode}`}
      aria-hidden="true"
    >
      {/* concentric ripples radiating from the coin (drops-in-a-puddle), the
          whole layer brightens + grows with the live amplitude */}
      <span className="voice-waves__ripples">
        <span className="voice-waves__ripple" />
        <span className="voice-waves__ripple" />
        <span className="voice-waves__ripple" />
      </span>
      <span className="voice-waves__glow" />
      <span className="voice-waves__side voice-waves__side--right">
        {renderBars("r")}
      </span>
      <span className="voice-waves__side voice-waves__side--left">
        {renderBars("l")}
      </span>
    </div>
  );
}
