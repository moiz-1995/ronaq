"use client";
import { useEffect, useState } from "react";
import { CakeArt, DholArt, MehndiHand } from "@/components/art/HeroArt";

const ITEMS = [
  { name: "Mehndi", Art: MehndiHand },
  { name: "Dhol", Art: DholArt },
  { name: "Birthday", Art: CakeArt },
] as const;

const SPARKS = [[8, 18], [88, 12], [94, 62], [6, 70], [74, 92], [22, 94], [50, 4]];

/** Hero: celebratory pieces fade in and out — mehndi hand → dhol → birthday cake. Pure CSS, works everywhere. */
export function HeroStage() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setInterval(() => setI((x) => (x + 1) % ITEMS.length), reduce ? 6000 : 3200);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <div className="relative grid place-items-center gap-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative aspect-square w-[min(440px,86vw)]">
        {/* soft yellow sunburst glow, no outline */}
        <div aria-hidden className="hero-rays absolute inset-[-6%] rounded-full opacity-70"
          style={{ background: "repeating-conic-gradient(rgba(255,204,0,.22) 0 7.5deg, transparent 7.5deg 15deg)", WebkitMask: "radial-gradient(circle, #000 30%, transparent 70%)", mask: "radial-gradient(circle, #000 30%, transparent 70%)" }} />
        <div aria-hidden className="absolute inset-[14%] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,204,0,.35), rgba(229,25,127,.12) 55%, transparent 72%)" }} />
        {SPARKS.map(([x, y], k) => (
          <span key={k} aria-hidden className="hero-spark absolute text-2xl text-[#ffcc00]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${k * -0.45}s` }}>✦</span>
        ))}
        {ITEMS.map(({ name, Art }, k) => (
          <div
            key={name}
            aria-hidden={i !== k}
            className="absolute inset-[9%] transition-[opacity,transform] duration-[900ms] ease-[cubic-bezier(.2,.8,.2,1)]"
            style={{ opacity: i === k ? 1 : 0, transform: i === k ? "scale(1) rotate(0deg)" : `scale(.82) rotate(${k % 2 ? 8 : -8}deg)` }}
          >
            <div className={i === k ? "hero-bob h-full w-full" : "h-full w-full"}><Art /></div>
          </div>
        ))}
      </div>
      <div className="relative z-10 flex gap-2" role="group" aria-label="Choose a celebration">
        {ITEMS.map((o, k) => (
          <button key={o.name} type="button" aria-pressed={i === k} onClick={() => { setI(k); setPaused(true); }}
            className={`rounded-[10px] border-[3px] border-sand px-3 py-2 font-display text-xs transition ${i === k ? "bg-sun text-ink" : "text-sand hover:bg-white/10"}`}>
            {o.name}
          </button>
        ))}
      </div>
    </div>
  );
}
