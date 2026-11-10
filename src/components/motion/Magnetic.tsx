"use client";
import { useRef } from "react";

/** The wrapped button leans toward the pointer and springs back. Mouse only. */
export function Magnetic({ children, className = "", strength = 0.28 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  return (
    <span
      ref={ref}
      className={`magnetic inline-block ${className}`}
      onPointerMove={(e) => {
        if (e.pointerType === "touch" || !ref.current || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        const r = ref.current.getBoundingClientRect();
        ref.current.style.transform = `translate(${((e.clientX - r.left - r.width / 2) * strength).toFixed(1)}px, ${((e.clientY - r.top - r.height / 2) * strength).toFixed(1)}px)`;
      }}
      onPointerLeave={() => { if (ref.current) ref.current.style.transform = ""; }}
    >
      {children}
    </span>
  );
}
