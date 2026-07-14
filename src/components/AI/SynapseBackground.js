import { useRef, useEffect } from "react";
import "./SynapseBackground.css";

/* "רשת נוירונים" — the classic free-flowing plexus (like the original neurons
   theme) executed properly: crisp glowing particles in three parallax depth
   layers, proximity links that form and dissolve as they drift, occasional
   light signals traveling along live links, additive-blended glow. */

const CYAN = [53, 224, 255];
const VIOLET = [147, 107, 250];

export default function SynapseBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, dpr, raf;
    let nodes = [];
    let pulses = [];
    let frame = 0;

    const LAYERS = [
      { n: 34, r: [0.9, 1.5], speed: 0.2, alpha: 0.45, link: 105, lw: 0.55 },
      { n: 22, r: [1.5, 2.3], speed: 0.3, alpha: 0.75, link: 140, lw: 0.95 },
      { n: 11, r: [2.3, 3.2], speed: 0.42, alpha: 1, link: 170, lw: 1.25 },
    ];

    const col = (mix, a) => {
      const c = CYAN.map((v, i) => Math.round(v + (VIOLET[i] - v) * mix));
      return `rgba(${c[0]},${c[1]},${c[2]},${a})`;
    };

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

    const init = () => {
      nodes = [];
      LAYERS.forEach((L, li) => {
        for (let i = 0; i < L.n; i++) {
          nodes.push({
            li,
            link: L.link,
            lw: L.lw,
            alpha: L.alpha,
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * L.speed,
            vy: (Math.random() - 0.5) * L.speed,
            r: L.r[0] + Math.random() * (L.r[1] - L.r[0]),
            phase: Math.random() * Math.PI * 2,
            /* mostly cyan, ~30% drift toward violet */
            mix: Math.random() < 0.7 ? Math.random() * 0.3 : 0.5 + Math.random() * 0.5,
          });
        }
      });
      pulses = [];
    };

    /* a signal along a CURRENTLY-CONNECTED pair (mid/near layers) */
    const spawnPulse = () => {
      const pool = nodes.filter((n) => n.li >= 1);
      for (let tries = 0; tries < 12; tries++) {
        const a = pool[(Math.random() * pool.length) | 0];
        const b = pool[(Math.random() * pool.length) | 0];
        if (!a || !b || a === b || a.li !== b.li) continue;
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d > 50 && d < a.link) {
          pulses.push({ a, b, t: 0, speed: 0.016 + Math.random() * 0.016 });
          return;
        }
      }
    };

    const animate = () => {
      frame++;
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      /* drift */
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -25) n.x = w + 25;
        if (n.x > w + 25) n.x = -25;
        if (n.y < -25) n.y = h + 25;
        if (n.y > h + 25) n.y = -25;
      });

      /* proximity links */
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          if (a.li !== b.li) continue;
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < a.link) {
            const al = (1 - d / a.link) * 0.45 * a.alpha;
            const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
            grad.addColorStop(0, col(a.mix, al));
            grad.addColorStop(1, col(b.mix, al));
            ctx.strokeStyle = grad;
            ctx.lineWidth = a.lw;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      /* crisp glowing particles (tight halo — no smudges) */
      nodes.forEach((n) => {
        const tw = 0.78 + 0.22 * Math.sin(frame * 0.025 + n.phase);
        const halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 3.2);
        halo.addColorStop(0, col(n.mix, 0.5 * n.alpha * tw));
        halo.addColorStop(1, col(n.mix, 0));
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(232,250,255,${0.9 * n.alpha * tw})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      /* occasional signals along live links */
      if (frame % 40 === 0 && pulses.length < 6) spawnPulse();
      pulses.forEach((p) => {
        p.t += p.speed;
        const t = Math.min(p.t, 1);
        const x = p.a.x + (p.b.x - p.a.x) * t;
        const y = p.a.y + (p.b.y - p.a.y) * t;
        /* short trail */
        for (let k = 0; k < 4; k++) {
          const tt = Math.max(0, t - k * 0.05);
          ctx.fillStyle = `rgba(170,240,255,${0.5 * (1 - k / 4)})`;
          ctx.beginPath();
          ctx.arc(
            p.a.x + (p.b.x - p.a.x) * tt,
            p.a.y + (p.b.y - p.a.y) * tt,
            Math.max(0.5, 2 - k * 0.4),
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
        const head = ctx.createRadialGradient(x, y, 0, x, y, 8);
        head.addColorStop(0, "rgba(225,250,255,0.9)");
        head.addColorStop(1, "rgba(160,240,255,0)");
        ctx.fillStyle = head;
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fill();
      });
      pulses = pulses.filter((p) => p.t < 1);

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
    <div className="synapse-bg" aria-hidden="true">
      <div className="synapse-glow" />
      <canvas ref={canvasRef} className="synapse-canvas" />
      <div className="synapse-vignette" />
    </div>
  );
}
