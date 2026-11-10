"use client";
import dynamic from "next/dynamic";
import { useCan3D } from "./useCan3D";
import { useEffect, useState } from "react";
import { CraftArt } from "@/components/art/CraftArt";
import { Petals } from "@/components/motion/Petals";

const BuntingInner = dynamic(() => import("./Bunting3D"), { ssr: false });
const GiftInner = dynamic(() => import("./Gift3D"), { ssr: false });

export function Bunting({ count, className = "h-24" }: { count?: number; className?: string }) {
  const ok = useCan3D();
  return (
    <div className={`pointer-events-auto w-full ${className}`} aria-hidden>
      {ok ? <BuntingInner count={count} /> : <StaticBunting n={count ?? 14} />}
    </div>
  );
}

function StaticBunting({ n }: { n: number }) {
  const cols = ["#e0262f", "#efdfbd", "#1f4fe0", "#ff2e88", "#efdfbd", "#00a99d"];
  return (
    <svg viewBox={`0 0 ${n * 40} 60`} className="h-full w-full" preserveAspectRatio="none">
      <path d={`M0 6 Q${n * 20} 30 ${n * 40} 6`} stroke="#1b1340" strokeWidth={2} fill="none" />
      {Array.from({ length: n }).map((_, i) => {
        const x = i * 40 + 20, y = 6 + 24 * (1 - Math.pow((x - n * 20) / (n * 20), 2)) * 0.98;
        return <path key={i} d={`M${x - 15} ${y} L${x + 15} ${y} L${x} ${y + 28} Z`} fill={cols[i % cols.length]} stroke="#1b1340" strokeWidth={1.5} />;
      })}
    </svg>
  );
}

export function GiftBox({ className = "h-48 w-48" }: { className?: string }) {
  const ok = useCan3D();
  return (
    <div className={className} title="Tap the gift">
      {ok ? <GiftInner /> : <CraftArt kind="gift" seed={2} className="h-full w-full rounded-3xl" />}
    </div>
  );
}

const StallInner = dynamic(() => import("./Stall3D"), { ssr: false });

export function Stall({ className = "h-80 w-full" }: { className?: string }) {
  const ok = useCan3D();
  return <div className={className}>{ok ? <StallInner /> : <CraftArt kind="rental" seed={5} className="h-full w-full rounded-3xl" />}</div>;
}

const LanternsInner = dynamic(() => import("./Lanterns3D"), { ssr: false });

/** Ambient floating lanterns for dark hero bands. Decorative only; skipped without WebGL or with reduced motion. */
export function Lanterns({ count, className = "absolute inset-0" }: { count?: number; className?: string }) {
  const ok = useCan3D();
  if (!ok) return null;
  return <div aria-hidden className={`pointer-events-none opacity-55 ${className}`}><LanternsInner count={count} /></div>;
}

const StageInner = dynamic(() => import("./HeroStage3D"), { ssr: false });

/** A single 3D occasion model (0 henna, 1 dhol, 2 cake) — used on the 404 page. */
export function OccasionModel({ active = 1, className = "h-56 w-56" }: { active?: number; className?: string }) {
  const ok = useCan3D();
  return <div className={className}>{ok ? <StageInner active={active} /> : <CraftArt kind={["henna", "dhol", "cake"][active]} seed={4} className="h-full w-full rounded-full" />}</div>;
}

const MelaInner = dynamic(() => import("./MelaSky3D"), { ssr: false });

/** The 3D mela night sky behind dark hero bands: fairy lights, bokeh, lanterns and petals. Falls back to CSS petals. */
export function MelaSky() {
  const ok = useCan3D();
  const [lite, setLite] = useState(false);
  useEffect(() => { setLite(matchMedia("(max-width: 700px)").matches); }, []);
  return <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">{ok ? <MelaInner lite={lite} /> : <Petals />}</div>;
}
