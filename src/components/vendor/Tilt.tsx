"use client";
import { useRef } from "react";

/** Cards lean toward the pointer (mouse/pen only — touch scrolling isn't hijacked). */
export function Tilt({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={`spot-card relative transition-transform duration-200 ease-out will-change-transform ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === "touch" || !ref.current) return;
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = ref.current.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        ref.current.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateZ(6px)`;
        ref.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
        ref.current.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      onPointerLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
    >
      {children}
      <span aria-hidden className="spot-glow" />
    </div>
  );
}
