import React, { useRef, useEffect } from "react";
import "./GalaxyBackground.css";

export default function GalaxyBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, stars, comet, raf;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    class Star {
      constructor() {
        this.reset();
        this.brightness = Math.random();
      }
      reset() {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.r = Math.random() * 1.5 + 0.3;
        this.speed = 0.005 + Math.random() * 0.025;
        this.dir = Math.random() < 0.5 ? -1 : 1;
        const tinted = Math.random() > 0.85;
        this.tint = tinted
          ? `${200 + Math.floor(Math.random() * 60)}, 80%, 80%`
          : null;
      }
      update() {
        this.brightness += this.speed * this.dir;
        if (this.brightness > 1 || this.brightness < 0.05) this.dir *= -1;
      }
      draw() {
        ctx.fillStyle = this.tint
          ? `hsla(${this.tint}, ${this.brightness})`
          : `rgba(255, 255, 255, ${this.brightness})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        if (this.r > 1.2 && this.brightness > 0.6) {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.brightness * 0.15})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const spawnComet = () => {
      const fromLeft = Math.random() > 0.5;
      comet = {
        x: fromLeft ? -50 : w + 50,
        y: Math.random() * h * 0.6,
        vx: fromLeft ? 6 + Math.random() * 5 : -(6 + Math.random() * 5),
        vy: 2 + Math.random() * 3,
        life: 1,
      };
    };

    const animate = () => {
      ctx.fillStyle = "rgba(8, 0, 26, 0.18)";
      ctx.fillRect(0, 0, w, h);

      stars.forEach((s) => {
        s.update();
        s.draw();
      });

      if (comet) {
        const tx = comet.x - comet.vx * 8;
        const ty = comet.y - comet.vy * 8;
        const grad = ctx.createLinearGradient(comet.x, comet.y, tx, ty);
        grad.addColorStop(0, `rgba(255, 255, 255, ${comet.life})`);
        grad.addColorStop(0.4, `rgba(180, 220, 255, ${comet.life * 0.5})`);
        grad.addColorStop(1, "rgba(180, 220, 255, 0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(comet.x, comet.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        comet.x += comet.vx;
        comet.y += comet.vy;
        comet.life -= 0.012;
        if (comet.life <= 0 || comet.x < -100 || comet.x > w + 100) comet = null;
      } else if (Math.random() < 0.004) {
        spawnComet();
      }

      raf = requestAnimationFrame(animate);
    };

    resize();
    stars = Array.from({ length: 220 }, () => new Star());
    comet = null;
    animate();

    window.addEventListener("resize", resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="galaxy-bg" aria-hidden="true">
      <div className="galaxy-nebula" />
      <canvas ref={canvasRef} className="galaxy-canvas" />
    </div>
  );
}
