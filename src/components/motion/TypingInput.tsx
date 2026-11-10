"use client";
import { useEffect, useRef } from "react";

/** A search box whose placeholder types out example searches. Stops as soon as the person starts typing. */
export function TypingInput({ phrases, ...props }: { phrases: string[] } & React.InputHTMLAttributes<HTMLInputElement>) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let p = 0, c = 0, deleting = false, timer: ReturnType<typeof setTimeout>;
    const step = () => {
      if (!el.value && document.activeElement !== el) {
        const word = phrases[p];
        c += deleting ? -1 : 1;
        el.placeholder = word.slice(0, c);
        if (!deleting && c === word.length) { deleting = true; timer = setTimeout(step, 1500); return; }
        if (deleting && c === 0) { deleting = false; p = (p + 1) % phrases.length; }
      }
      timer = setTimeout(step, deleting ? 30 : 65);
    };
    timer = setTimeout(step, 900);
    return () => clearTimeout(timer);
  }, [phrases]);
  return <input ref={ref} placeholder={phrases[0]} {...props} />;
}
