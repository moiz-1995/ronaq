"use client";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { CraftArt } from "@/components/art/CraftArt";
import { useCan3D } from "./useCan3D";

const HeroStage3D = dynamic(() => import("./HeroStage3D"), { ssr: false, loading: () => null });

const OCCASIONS = [
  { name: "Mehndi", art: "henna" },
  { name: "Dhol", art: "dhol" },
  { name: "Birthday", art: "cake" },
] as const;

/** Hero occasion stage: henna → dhol → birthday cake. Drag to turn it; falls back to SVG without WebGL. */
export function HeroStage() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const can3D = useCan3D();
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((x) => (x + 1) % OCCASIONS.length), 3400);
    return () => clearInterval(t);
  }, [paused]);
  return (
    <div className="relative grid place-items-center gap-5">
      <div
        className="relative aspect-square w-[min(420px,86vw)] rounded-full"
        style={{ background: "radial-gradient(circle,#2a1f63 0 58%,#1b1340 59%)", boxShadow: "0 0 0 10px #eef1e8,0 0 0 18px #e0262f,0 0 0 24px #eef1e8,0 0 0 30px #1f4fe0" }}
        onPointerDown={() => setPaused(true)}
      >
        <div
          aria-hidden
          className="absolute -inset-12 animate-[spin_40s_linear_infinite] rounded-full"
          style={{
            background: "repeating-conic-gradient(#eef1e8 0 3deg,transparent 3deg 12deg)",
            WebkitMask: "radial-gradient(circle,transparent 66%,#000 67% 69%,transparent 70%)",
            mask: "radial-gradient(circle,transparent 66%,#000 67% 69%,transparent 70%)",
          }}
        />
        {can3D ? (
          <div className="absolute inset-0 overflow-hidden rounded-full" aria-label={`3D ${OCCASIONS[i].name} — drag to turn`} role="img">
            <HeroStage3D active={i} />
          </div>
        ) : (
          <div className="absolute inset-[10%] overflow-hidden rounded-full">
            <CraftArt kind={OCCASIONS[i].art} seed={i} className="h-full w-full" />
          </div>
        )}
      </div>
      <div className="relative z-10 flex gap-2" role="group" aria-label="Choose an occasion">
        {OCCASIONS.map((o, k) => (
          <button
            key={o.name}
            type="button"
            aria-pressed={i === k}
            onClick={() => { setI(k); setPaused(true); }}
            className={`rounded-[10px] border-[3px] border-sand px-3 py-2 font-display text-xs ${i === k ? "bg-sand text-ink" : "text-sand"}`}
          >
            {o.name}
          </button>
        ))}
      </div>
      {can3D && <p className="text-xs text-sand/70">Drag to turn it around</p>}
    </div>
  );
}
