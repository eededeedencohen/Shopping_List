import { useEffect, useRef } from "react";
import "./VoiceWaves.css";

/* Audio-reactive "liquid" waves flanking the robot coin (canvas).

   The voice hook exposes a live amplitude in `levelRef` (0..1) — the mic RMS
   while you speak, the TTS RMS while the AI replies. This component runs its
   own rAF loop: it smooths the level (fast attack, slow release), writes it to
   the nav as `--vlevel` (the coin scales off it in CSS) and paints:

     • three overlapping sine ribbons flowing OUT of the coin to each screen
       edge — their amplitude, brightness and travelling pulse follow the voice;
     • a soft halo behind the coin that swells with the level;
     • expanding rings whenever the sound is loud (drops in a puddle);
     • in "processing": a calm baseline with a comet racing out of the coin.

   `mode` recolours everything (listening / recording / speaking / processing).
   Renders nothing when idle, so there is no permanent animation in the nav. */

const CANVAS_H = 132; // px — rises above the bar so rings/halo can breathe
const COLORS = {
  listening: [56, 189, 248], // sky
  recording: [251, 113, 133], // rose
  speaking: [167, 139, 250], // violet
  processing: [148, 163, 184], // slate
};
const RIBBONS = [
  { freq: 0.052, speed: 2.6, amp: 1.0, alpha: 0.95, width: 2.4 },
  { freq: 0.084, speed: -1.7, amp: 0.62, alpha: 0.55, width: 1.7 },
  { freq: 0.034, speed: 1.15, amp: 0.48, alpha: 0.35, width: 1.3 },
];

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function VoiceWaves({ levelRef, mode = "idle", active = false }) {
  const canvasRef = useRef(null);
  const modeRef = useRef(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (!active) return undefined;
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const host = canvas.parentElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let stopped = false;
    let raf = null;
    let w = 0;
    let h = CANVAS_H;
    let cx = 0;
    let cy = 0;
    let coinR = 32;
    let smooth = 0;
    const rings = [];
    let lastRing = 0;
    const t0 = performance.now();

    const measure = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      w = host ? host.clientWidth : window.innerWidth;
      h = CANVAS_H;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the coin's real centre, relative to the canvas
      const btn = host && host.querySelector(".bottom-nav__btn");
      const c = canvas.getBoundingClientRect();
      if (btn) {
        const r = btn.getBoundingClientRect();
        cx = r.left + r.width / 2 - c.left;
        cy = r.top + r.height / 2 - c.top;
        coinR = r.width / 2;
      } else {
        cx = w / 2;
        cy = h - 34;
      }
    };
    measure();
    window.addEventListener("resize", measure);

    const ribbon = (side, start, len, time, col, amp, pulse, m) => {
      const end = start + side * len;
      RIBBONS.forEach((rb) => {
        const g = ctx.createLinearGradient(start, 0, end, 0);
        g.addColorStop(0, `rgba(${col}, ${rb.alpha})`);
        g.addColorStop(0.55, `rgba(${col}, ${rb.alpha * 0.7})`);
        g.addColorStop(1, `rgba(${col}, 0)`);
        ctx.strokeStyle = g;
        ctx.lineWidth = rb.width;
        ctx.beginPath();
        const steps = Math.max(12, Math.floor(len / 3));
        for (let i = 0; i <= steps; i++) {
          const d = (i / steps) * len; // distance from the coin
          const x = start + side * d;
          const env = Math.min(1, d / 22) * (1 - (d / len) ** 1.7);
          const travel = 1 + pulse * Math.sin(d * 0.075 - time * 6.5);
          const y =
            cy +
            Math.sin(d * rb.freq + time * rb.speed * (m === "speaking" ? 1.25 : 1)) *
              amp *
              rb.amp *
              env *
              travel;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      });
    };

    const draw = (now) => {
      if (stopped) return;
      const raw = clamp01(
        levelRef && typeof levelRef.current === "number" ? levelRef.current : 0
      );
      smooth += (raw - smooth) * (raw > smooth ? 0.38 : 0.1);
      if (host) host.style.setProperty("--vlevel", smooth.toFixed(3));

      const m = modeRef.current;
      const col = (COLORS[m] || COLORS.listening).join(",");
      const time = reduced ? 0 : (now - t0) / 1000;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      /* halo behind the coin */
      const haloR = coinR * (1.35 + smooth * 1.4);
      const halo = ctx.createRadialGradient(cx, cy, coinR * 0.6, cx, cy, haloR);
      halo.addColorStop(0, `rgba(${col}, ${0.28 + smooth * 0.42})`);
      halo.addColorStop(1, `rgba(${col}, 0)`);
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, haloR, 0, Math.PI * 2);
      ctx.fill();

      const startR = coinR + 10;
      const lenR = w - (cx + startR) - 6;
      const lenL = cx - startR - 6;

      if (m === "processing") {
        /* calm baseline + a comet racing out of the coin on both sides */
        [1, -1].forEach((side) => {
          const start = cx + side * startR;
          const len = side === 1 ? lenR : lenL;
          const g = ctx.createLinearGradient(start, 0, start + side * len, 0);
          g.addColorStop(0, `rgba(${col}, 0.35)`);
          g.addColorStop(1, `rgba(${col}, 0)`);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(start, cy);
          ctx.lineTo(start + side * len, cy);
          ctx.stroke();
          const p = reduced ? len * 0.3 : (time * 170) % (len + 70);
          const tail = 64;
          const cg = ctx.createLinearGradient(
            start + side * (p - tail),
            0,
            start + side * p,
            0
          );
          cg.addColorStop(0, `rgba(${col}, 0)`);
          cg.addColorStop(1, "rgba(255,255,255,0.95)");
          ctx.strokeStyle = cg;
          ctx.lineWidth = 2.6;
          ctx.beginPath();
          ctx.moveTo(start + side * Math.max(0, p - tail), cy);
          ctx.lineTo(start + side * Math.min(len, p), cy);
          ctx.stroke();
        });
      } else {
        const amp = 3 + smooth * 19;
        const pulse = 0.18 + smooth * 0.35;
        ribbon(1, cx + startR, lenR, time, col, amp, pulse, m);
        ribbon(-1, cx - startR, lenL, time, col, amp, pulse, m);
      }

      /* rings: spawn while loud, expand + fade (~1.1s each) */
      if (smooth > 0.3 && now - lastRing > 380 && !reduced) {
        rings.push(now);
        lastRing = now;
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const age = (now - rings[i]) / 1100;
        if (age >= 1) {
          rings.splice(i, 1);
          continue;
        }
        const ease = 1 - (1 - age) ** 2;
        ctx.strokeStyle = `rgba(${col}, ${(1 - age) * 0.7})`;
        ctx.lineWidth = 1.6 - age;
        ctx.beginPath();
        ctx.arc(cx, cy, coinR + 4 + ease * 74, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      stopped = true;
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      if (host) host.style.setProperty("--vlevel", "0");
    };
  }, [active, levelRef]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`voice-waves voice-waves--${mode}`}
      aria-hidden="true"
    />
  );
}
