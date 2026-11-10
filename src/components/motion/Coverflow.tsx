"use client";
import { Children, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** A swipeable 3D carousel: the card in the middle faces you, the rest turn away. Plain scrolling underneath, so touch and keyboard just work. */
export function Coverflow({ children, label }: { children: React.ReactNode; label: string }) {
  const track = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const flat = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = [...el.children] as HTMLElement[];
    let raf = 0;
    const paint = () => {
      const mid = el.scrollLeft + el.clientWidth / 2;
      for (const it of items) {
        const off = (it.offsetLeft + it.offsetWidth / 2 - mid) / it.offsetWidth;
        const a = Math.min(Math.abs(off), 2.5);
        it.style.transform = flat ? "" : `perspective(1100px) rotateY(${(Math.max(-1.6, Math.min(1.6, off)) * -30).toFixed(2)}deg) scale(${(1 - a * 0.09).toFixed(3)})`;
        it.style.zIndex = String(100 - Math.round(a * 10));
        it.style.opacity = String(Math.max(0.45, 1 - a * 0.22));
      }
    };
    const onScroll = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(paint); };
    // open on the middle card so both sides are filled
    const start = items[Math.floor((items.length - 1) / 2)];
    if (start) el.scrollLeft = start.offsetLeft + start.offsetWidth / 2 - el.clientWidth / 2;
    paint();
    el.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => { el.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onScroll); cancelAnimationFrame(raf); };
  }, []);
  const nudge = (dir: 1 | -1) => {
    const el = track.current;
    const w = (el?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 240;
    el?.scrollBy({ left: dir * (w + 20), behavior: "smooth" });
  };
  return (
    <div className="relative">
      <ul ref={track} aria-label={label} className="coverflow flex snap-x snap-mandatory gap-5 overflow-x-auto py-10">
        {Children.map(children, (c, i) => <li key={i} className="w-[210px] flex-none snap-center will-change-transform sm:w-[250px]">{c}</li>)}
      </ul>
      <div className="mt-1 flex justify-center gap-3">
        <button type="button" onClick={() => nudge(-1)} className="btn btn-sm !rounded-full !px-2.5" aria-label="Previous"><ChevronLeft size={18} /></button>
        <button type="button" onClick={() => nudge(1)} className="btn btn-sm !rounded-full !px-2.5" aria-label="Next"><ChevronRight size={18} /></button>
      </div>
    </div>
  );
}
