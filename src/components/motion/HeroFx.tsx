"use client";
import { useEffect, useRef } from "react";

const SPARK_COLORS = ["#ffc93c", "#ff6b72", "#efdfbd", "#ff2e88"];

/**
 * Pointer effects for the section it sits in: sets --px / --py (-1..1) so `.depth` layers shift for parallax,
 * and leaves a short trail of sparkles. Mouse only; nothing happens on touch or with reduced motion.
 */
export function HeroFx({ trail = true }: { trail?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const host = ref.current?.parentElement;
    if (!host || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = 0, raf = 0, live = 0;
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = host.getBoundingClientRect();
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        host.style.setProperty("--px", ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3));
        host.style.setProperty("--py", ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      });
      if (!trail || e.timeStamp - last < 55 || live > 14) return;
      if ((e.target as Element | null)?.closest?.("a, button, input, form, [role=listbox]")) return;
      last = e.timeStamp;
      const s = document.createElement("span");
      s.className = "spark-trail";
      s.textContent = "✦";
      s.style.left = `${e.clientX - r.left}px`;
      s.style.top = `${e.clientY - r.top}px`;
      s.style.color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];
      s.style.fontSize = `${10 + Math.random() * 12}px`;
      host.appendChild(s);
      live++;
      setTimeout(() => { s.remove(); live--; }, 720);
    };
    const leave = () => { host.style.setProperty("--px", "0"); host.style.setProperty("--py", "0"); };
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    return () => { host.removeEventListener("pointermove", move); host.removeEventListener("pointerleave", leave); cancelAnimationFrame(raf); };
  }, [trail]);
  return <span ref={ref} hidden />;
}
