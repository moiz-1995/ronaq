import Link from "next/link";
import { OccasionModel } from "@/components/three/Lazy";

export default function NotFound() {
  return (
    <div className="dot-bg grid min-h-dvh place-items-center p-6 text-center text-sand">
      <div className="grid justify-items-center gap-4">
        <div className="h-52 w-52 overflow-hidden rounded-full border-[6px] border-sand bg-ink-2 shadow-[0_0_0_10px_var(--color-red)]"><OccasionModel active={1} className="h-full w-full" /></div>
        <p className="font-shade text-7xl">404</p>
        <h1 className="font-display text-2xl">Yeh page nahi mila</h1>
        <p className="max-w-sm text-sand/80">The page you&apos;re looking for has moved, or never existed.</p>
        <div className="flex gap-2"><Link href="/" className="btn btn-red">Go home</Link><Link href="/marketplace" className="btn btn-sand">Marketplace</Link></div>
      </div>
    </div>
  );
}
