"use client";
import dynamic from "next/dynamic";
import { useCan3D } from "./useCan3D";
import { CraftArt } from "@/components/art/CraftArt";

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
  const cols = ["#e0262f", "#eef1e8", "#1f4fe0", "#ff2e88", "#eef1e8", "#00a99d"];
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
