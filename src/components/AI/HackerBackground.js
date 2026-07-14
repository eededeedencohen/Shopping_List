import { useRef, useEffect } from "react";
import "./HackerBackground.css";

/* "סייבר האקר" v2 — a LIVING CIRCUIT BOARD (no letter rain):
   orthogonal PCB traces etched across a dark carbon board, with light signals
   racing along the copper — bright heads, glowing trails, pads flashing at the
   junctions. On top (CSS): HUD corner brackets, a slow scan sweep, scanlines,
   and a rare glitch slice. Canvas, additive glow. */

const TRACE_COUNT = 26;

export default function HackerBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, dpr, raf;
    let traces = [];
    let frame = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* an orthogonal PCB trace: alternating H/V segments */
    const makeTrace = () => {
      const pts = [{ x: Math.random() * w, y: Math.random() * h }];
      let dirH = Math.random() < 0.5;
      const steps = 3 + ((Math.random() * 4) | 0);
      for (let s = 0; s < steps; s++) {
        const last = pts[pts.length - 1];
        const len = 50 + Math.random() * 170;
        const sign = Math.random() < 0.5 ? -1 : 1;
        pts.push(
          dirH
            ? { x: last.x + sign * len, y: last.y }
            : { x: last.x, y: last.y + sign * len }
        );
        dirH = !dirH;
      }
      const segs = [];
      let total = 0;
      for (let i = 0; i < pts.length - 1; i++) {
        const d = Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
        segs.push(d);
        total += d;
      }
      return {
        pts,
        segs,
        total,
        speed: 1.6 + Math.random() * 2.6, // px per frame
        offset: Math.random() * (total + 500),
        gap: 320 + Math.random() * 700, // dark time between runs
        cyan: Math.random() < 0.3, // some traces run cyan
      };
    };

    const init = () => {
      traces = Array.from({ length: TRACE_COUNT }, makeTrace);
    };

    /* point at distance d along the trace */
    const pointAt = (tr, d) => {
      let rest = d;
      for (let i = 0; i < tr.segs.length; i++) {
        if (rest <= tr.segs[i]) {
          const a = tr.pts[i];
          const b = tr.pts[i + 1];
          const t = tr.segs[i] ? rest / tr.segs[i] : 0;
          return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        }
        rest -= tr.segs[i];
      }
      return tr.pts[tr.pts.length - 1];
    };

    const animate = () => {
      frame++;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      ctx.lineJoin = "round";

      traces.forEach((tr) => {
        const base = tr.cyan ? "0,229,255" : "22,255,126";

        /* etched copper — the static trace */
        ctx.strokeStyle = `rgba(${base},0.10)`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(tr.pts[0].x, tr.pts[0].y);
        for (let i = 1; i < tr.pts.length; i++) ctx.lineTo(tr.pts[i].x, tr.pts[i].y);
        ctx.stroke();

        /* pads at the endpoints + joints */
        tr.pts.forEach((p, i) => {
          const end = i === 0 || i === tr.pts.length - 1;
          ctx.fillStyle = `rgba(${base},${end ? 0.3 : 0.16})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, end ? 3.2 : 2.1, 0, Math.PI * 2);
          ctx.fill();
          if (end) {
            ctx.strokeStyle = `rgba(${base},0.25)`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 5.4, 0, Math.PI * 2);
            ctx.stroke();
          }
        });

        /* the running signal */
        const cycle = tr.total + tr.gap;
        const head = (frame * tr.speed + tr.offset) % cycle;
        if (head <= tr.total) {
          const TAIL = 90;
          const from = Math.max(0, head - TAIL);
          /* lit tail — draw as segments */
          const STEPS = 12;
          for (let k = 0; k < STEPS; k++) {
            const d0 = from + ((head - from) * k) / STEPS;
            const d1 = from + ((head - from) * (k + 1)) / STEPS;
            const p0 = pointAt(tr, d0);
            const p1 = pointAt(tr, d1);
            ctx.strokeStyle = `rgba(${base},${0.5 * (k / STEPS)})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.stroke();
          }
          /* bright head + glow */
          const hp = pointAt(tr, head);
          const g = ctx.createRadialGradient(hp.x, hp.y, 0, hp.x, hp.y, 12);
          g.addColorStop(0, tr.cyan ? "rgba(220,250,255,1)" : "rgba(225,255,235,1)");
          g.addColorStop(1, `rgba(${base},0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(hp.x, hp.y, 12, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      raf = requestAnimationFrame(animate);
    };

    const onResize = () => {
      resize();
      init();
    };
    resize();
    init();
    animate();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="hacker-bg" aria-hidden="true">
      <canvas ref={canvasRef} className="hacker-canvas" />
      <div className="hacker-sweep" />
      <div className="hacker-glitch" />
      <span className="hacker-corner hacker-corner--tl" />
      <span className="hacker-corner hacker-corner--tr" />
      <span className="hacker-corner hacker-corner--bl" />
      <span className="hacker-corner hacker-corner--br" />
      <div className="hacker-scanlines" />
      <div className="hacker-vignette" />
    </div>
  );
}
