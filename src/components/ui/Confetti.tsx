"use client";
import { useEffect, useRef } from "react";

const COLS = ["#e0262f", "#1f4fe0", "#efdfbd", "#ff2e88", "#00a99d", "#ffc93c"];

/** One celebratory burst, drawn on a canvas that covers its parent. Skipped for reduced motion. */
export function Confetti({ pieces = 140 }: { pieces?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d")!;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = c.offsetWidth, h = c.offsetHeight;
    c.width = w * dpr; c.height = h * dpr; ctx.scale(dpr, dpr);
    const P = Array.from({ length: pieces }, (_, i) => {
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.6, sp = 6 + Math.random() * 9;
      return { x: w / 2, y: h * 0.35, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: COLS[i % COLS.length], s: 5 + Math.random() * 6, life: 1 };
    });
    let raf = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = 0;
      for (const p of P) {
        p.vy += 0.25; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life -= 0.006;
        if (p.life <= 0 || p.y > h + 20) continue;
        alive++;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(p.r * 2)); ctx.globalAlpha = p.life;
        ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66); ctx.restore();
      }
      if (alive) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [pieces]);
  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />;
}
