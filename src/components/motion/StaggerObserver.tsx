"use client";
import { useEffect } from "react";

/** Reveals any element marked data-stagger the first time it scrolls into view. Works for server-rendered markup. */
export function StaggerObserver() {
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        (e.target as HTMLElement).dataset.in = "";
        io.unobserve(e.target);
      }
    }, { threshold: 0.04, rootMargin: "0px 0px -30px 0px" });
    const scan = () => document.querySelectorAll("[data-stagger]:not([data-in])").forEach((el) => io.observe(el));
    // waits until React has attached to the server markup, so it never sees an attribute it did not render
    let started = false;
    const begin = () => { started = true; scan(); };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 200) as unknown as number);
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    const first = idle(begin, { timeout: 500 });
    let queued = 0;
    const mo = new MutationObserver(() => {
      cancelAnimationFrame(queued);
      if (started) queued = requestAnimationFrame(scan);
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { cancelIdle(first); io.disconnect(); mo.disconnect(); cancelAnimationFrame(queued); };
  }, []);
  return null;
}
